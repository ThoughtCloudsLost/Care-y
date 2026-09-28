import { describe, it, expect, vi } from "vitest";
import type { TicketForServerFilter } from "./ticket-list-utils.js";
import {
  FACET_INDEX_PAGE_SIZE,
  FACET_INDEX_MAX_ROWS,
  fetchFacetIndex,
  type FacetIndexData,
  type TicketRouter,
} from "./queries.js";

// ---- helpers ----------------------------------------------------------------

/** Minimal stub row. Only the fields the query copies matter. */
function row(id: string): TicketForServerFilter {
  return {
    id,
    status: "open",
    onHold: false,
    priority: "normal",
    assignedTo: null,
    queueId: "q-1",
    createdAt: "2026-01-01T00:00:00Z",
    followUpCount: 0,
    hasResponse: false,
  };
}

function rows(count: number, startIndex = 0): TicketForServerFilter[] {
  return Array.from({ length: count }, (_, i) =>
    row(`t-${String(startIndex + i)}`),
  );
}

interface PageResult {
  items: TicketForServerFilter[];
  nextCursor: string | null;
}

type FetchPage = (input: {
  cursor: string | undefined;
  limit: number;
}) => Promise<PageResult>;

/**
 * Stands in for the ticket router. `fetchFacetIndex` calls exactly one
 * procedure, so a stub carrying only that is enough. The cast bridges the
 * router's branded id types to the plain strings these fixtures use; the
 * alternative is re-declaring the whole router shape here.
 */
function stubRouter(fetchPage: FetchPage): TicketRouter {
  return { facetIndex: { query: fetchPage } } as unknown as TicketRouter;
}

/** Drives the real loop, never a copy of it. */
async function runFacetIndexLoop(
  fetchPage: FetchPage,
): Promise<FacetIndexData> {
  return fetchFacetIndex(stubRouter(fetchPage));
}

// ---- tests ------------------------------------------------------------------

describe("facetIndex paging loop", () => {
  it("returns all rows from a single short page", async () => {
    const items = rows(3);
    const fetchPage = vi
      .fn<
        (input: {
          cursor: string | undefined;
          limit: number;
        }) => Promise<PageResult>
      >()
      .mockResolvedValueOnce({ items, nextCursor: null });

    const result = await runFacetIndexLoop(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith({
      cursor: undefined,
      limit: FACET_INDEX_PAGE_SIZE,
    });
    expect(result.rows).toEqual(items);
    expect(result.complete).toBe(true);
  });

  it("threads the cursor through multiple pages", async () => {
    const page1 = rows(FACET_INDEX_PAGE_SIZE, 0);
    const page2 = rows(FACET_INDEX_PAGE_SIZE, FACET_INDEX_PAGE_SIZE);
    const page3 = rows(10, FACET_INDEX_PAGE_SIZE * 2);

    const fetchPage = vi
      .fn<
        (input: {
          cursor: string | undefined;
          limit: number;
        }) => Promise<PageResult>
      >()
      .mockResolvedValueOnce({ items: page1, nextCursor: "cursor-1" })
      .mockResolvedValueOnce({ items: page2, nextCursor: "cursor-2" })
      .mockResolvedValueOnce({ items: page3, nextCursor: null });

    const result = await runFacetIndexLoop(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenNthCalledWith(1, {
      cursor: undefined,
      limit: FACET_INDEX_PAGE_SIZE,
    });
    expect(fetchPage).toHaveBeenNthCalledWith(2, {
      cursor: "cursor-1",
      limit: FACET_INDEX_PAGE_SIZE,
    });
    expect(fetchPage).toHaveBeenNthCalledWith(3, {
      cursor: "cursor-2",
      limit: FACET_INDEX_PAGE_SIZE,
    });
    expect(result.rows).toHaveLength(FACET_INDEX_PAGE_SIZE * 2 + 10);
    expect(result.complete).toBe(true);
  });

  it("does not stop on a full page when the cursor is non-null", async () => {
    // A page returning exactly `limit` rows with a non-null cursor must
    // not be treated as the last page. Only a null cursor ends paging.
    const fullPage = rows(FACET_INDEX_PAGE_SIZE, 0);
    const shortPage = rows(1, FACET_INDEX_PAGE_SIZE);

    const fetchPage = vi
      .fn<
        (input: {
          cursor: string | undefined;
          limit: number;
        }) => Promise<PageResult>
      >()
      .mockResolvedValueOnce({ items: fullPage, nextCursor: "next" })
      .mockResolvedValueOnce({ items: shortPage, nextCursor: null });

    const result = await runFacetIndexLoop(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(result.rows).toHaveLength(FACET_INDEX_PAGE_SIZE + 1);
    expect(result.complete).toBe(true);
  });

  it("stops at the row ceiling and marks incomplete", async () => {
    const pageSize = FACET_INDEX_PAGE_SIZE;
    // We need enough pages to exceed FACET_INDEX_MAX_ROWS.
    const pagesNeeded = Math.ceil(FACET_INDEX_MAX_ROWS / pageSize);

    const fetchPage =
      vi.fn<
        (input: {
          cursor: string | undefined;
          limit: number;
        }) => Promise<PageResult>
      >();

    for (let i = 0; i < pagesNeeded + 1; i++) {
      fetchPage.mockResolvedValueOnce({
        items: rows(pageSize, i * pageSize),
        nextCursor: `cursor-${String(i + 1)}`,
      });
    }

    const result = await runFacetIndexLoop(fetchPage);

    // The loop should stop once the accumulated count reaches the ceiling,
    // not fetch the extra page.
    expect(result.rows.length).toBeLessThanOrEqual(
      FACET_INDEX_MAX_ROWS + pageSize,
    );
    expect(result.rows.length).toBeGreaterThanOrEqual(FACET_INDEX_MAX_ROWS);
    expect(result.complete).toBe(false);
    // Should not have fetched the extra page past the ceiling
    expect(fetchPage).toHaveBeenCalledTimes(pagesNeeded);
  });

  it("returns partial results when a page fails", async () => {
    const page1Items = rows(FACET_INDEX_PAGE_SIZE, 0);

    const fetchPage = vi
      .fn<
        (input: {
          cursor: string | undefined;
          limit: number;
        }) => Promise<PageResult>
      >()
      .mockResolvedValueOnce({ items: page1Items, nextCursor: "cursor-1" })
      .mockRejectedValueOnce(new Error("network error"));

    const result = await runFacetIndexLoop(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(result.rows).toEqual(page1Items);
    expect(result.complete).toBe(false);
  });

  it("returns empty rows with complete false when the first page fails", async () => {
    const fetchPage = vi
      .fn<
        (input: {
          cursor: string | undefined;
          limit: number;
        }) => Promise<PageResult>
      >()
      .mockRejectedValueOnce(new Error("boom"));

    const result = await runFacetIndexLoop(fetchPage);

    expect(result.rows).toEqual([]);
    expect(result.complete).toBe(false);
  });
});
