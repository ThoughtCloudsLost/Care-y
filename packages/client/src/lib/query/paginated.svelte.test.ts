// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { createPaginatedQuery } from "./paginated.svelte.js";
import type { CreateQueryResult } from "@tanstack/svelte-query";

afterEach(cleanup);

/** Build a minimal mock of CreateQueryResult with a mutable data ref. */
function mockQuery<T>(initialData: T[] | undefined): {
  query: CreateQueryResult<T[]>;
  setData: (next: T[] | undefined) => void;
} {
  let dataValue = $state(initialData);

  const query = {
    get data() {
      return dataValue;
    },
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as CreateQueryResult<T[]>;

  return {
    query,
    setData(next: T[] | undefined) {
      dataValue = next;
    },
  };
}

describe("createPaginatedQuery", () => {
  it("hasMore is true when initial data length equals limit", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));
    const { query } = mockQuery(items);

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 10,
        fetchPage: vi.fn(),
        getCursor: (item) => item.id,
      });
    });

    flushSync();
    expect(paginated.hasMore).toBe(true);
    expect(paginated.items).toHaveLength(10);
    destroy();
  });

  it("hasMore is false when initial data length is less than limit", () => {
    const items = [{ id: "1" }, { id: "2" }];
    const { query } = mockQuery(items);

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 10,
        fetchPage: vi.fn(),
        getCursor: (item) => item.id,
      });
    });

    flushSync();
    expect(paginated.hasMore).toBe(false);
    destroy();
  });

  it("hasMore is false when query data is undefined", () => {
    const { query } = mockQuery<{ id: string }>(undefined);

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 10,
        fetchPage: vi.fn(),
        getCursor: (item) => item.id,
      });
    });

    flushSync();
    expect(paginated.hasMore).toBe(false);
    expect(paginated.items).toHaveLength(0);
    destroy();
  });

  it("loadMore appends next page to items", async () => {
    const page1 = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
    }));
    const page2 = [{ id: "5" }, { id: "6" }];

    const { query } = mockQuery(page1);
    const fetchPage = vi.fn().mockResolvedValue(page2);

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 5,
        fetchPage,
        getCursor: (item) => item.id,
      });
    });

    flushSync();
    expect(paginated.hasMore).toBe(true);
    await paginated.loadMore();
    flushSync();

    expect(fetchPage).toHaveBeenCalledWith("4");
    expect(paginated.items).toHaveLength(7);
    // Page 2 had fewer than limit, so hasMore becomes false
    expect(paginated.hasMore).toBe(false);
    destroy();
  });

  it("loadMore is no-op when hasMore is false", async () => {
    const items = [{ id: "1" }];
    const { query } = mockQuery(items);
    const fetchPage = vi.fn();

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 10,
        fetchPage,
        getCursor: (item) => item.id,
      });
    });

    flushSync();
    expect(paginated.hasMore).toBe(false);
    await paginated.loadMore();
    expect(fetchPage).not.toHaveBeenCalled();
    destroy();
  });

  it("loadMore is no-op while already loading", async () => {
    const page1 = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
    }));
    const { query } = mockQuery(page1);

    let resolveFirst!: (value: { id: string }[]) => void;
    const fetchPage = vi.fn().mockImplementation(
      () =>
        new Promise<{ id: string }[]>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 5,
        fetchPage,
        getCursor: (item) => item.id,
      });
    });

    flushSync();

    // Start first load (won't resolve yet)
    const firstCall = paginated.loadMore();
    expect(paginated.loading).toBe(true);

    // Second call is a no-op
    await paginated.loadMore();
    expect(fetchPage).toHaveBeenCalledTimes(1);

    // Resolve the first call
    resolveFirst([{ id: "5" }]);
    await firstCall;
    expect(paginated.loading).toBe(false);
    destroy();
  });

  it("extra pages reset when query data identity changes", async () => {
    const page1 = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
    }));
    const { query, setData } = mockQuery(page1);

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 5,
        fetchPage: vi.fn().mockResolvedValue([{ id: "5" }, { id: "6" }]),
        getCursor: (item) => item.id,
      });
    });

    flushSync();

    // Load extra page
    await paginated.loadMore();
    flushSync();
    expect(paginated.items).toHaveLength(7);

    // Simulate SSE invalidation: TanStack sets new data reference
    const freshPage1 = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 10),
    }));
    setData(freshPage1);
    flushSync();

    // Extra pages should be cleared, back to page 1 only
    expect(paginated.items).toHaveLength(5);
    expect(paginated.items[0]?.id).toBe("10");
    expect(paginated.hasMore).toBe(true);
    destroy();
  });

  it("loading resets to false on fetch error", async () => {
    const page1 = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
    }));
    const { query } = mockQuery(page1);

    const fetchPage = vi.fn().mockRejectedValue(new Error("network error"));

    let paginated!: ReturnType<typeof createPaginatedQuery<{ id: string }>>;

    const destroy = $effect.root(() => {
      paginated = createPaginatedQuery({
        query,
        limit: 5,
        fetchPage,
        getCursor: (item) => item.id,
      });
    });

    flushSync();

    await expect(paginated.loadMore()).rejects.toThrow("network error");
    expect(paginated.loading).toBe(false);
    // Items unchanged after error
    expect(paginated.items).toHaveLength(5);
    destroy();
  });
});
