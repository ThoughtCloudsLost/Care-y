// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createChatPaginator,
  type PaginatedRecord,
} from "./chat-paginator.svelte.js";

interface TestRecord extends PaginatedRecord {
  body: string;
}

function makeRecord(id: string, date: string): TestRecord {
  return { id, createdAt: date, body: `msg-${id}` };
}

function makeMockQueryClient() {
  return { fetchQuery: vi.fn() } as unknown as Parameters<
    typeof createChatPaginator
  >[0]["queryClient"];
}

describe("createChatPaginator", () => {
  let fetchPage: (cursor: string) => Promise<TestRecord[]>;
  let queryClient: ReturnType<typeof makeMockQueryClient>;

  beforeEach(() => {
    fetchPage = vi.fn<(cursor: string) => Promise<TestRecord[]>>();
    queryClient = makeMockQueryClient();
  });

  function makePaginator(opts?: { pageSize?: number }) {
    return createChatPaginator<TestRecord>({
      pageSize: opts?.pageSize ?? 3,
      queryClient,
      getTicketId: () => "t-1",
      fetchPage,
      getScrollContainer: () => undefined,
    });
  }

  it("starts empty with hasMore true", () => {
    const p = makePaginator();
    expect(p.items).toEqual([]);
    expect(p.hasMore).toBe(true);
    expect(p.loadingOlder).toBe(false);
    expect(p.loadingUnread).toBe(false);
  });

  describe("seed", () => {
    it("populates items from initial data", () => {
      const p = makePaginator();
      const data = [
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
        makeRecord("3", "2026-01-03T12:00:00Z"),
      ];
      p.seed(data);
      expect(p.items).toEqual(data);
    });

    it("sets hasMore to false when data is smaller than pageSize", () => {
      const p = makePaginator({ pageSize: 5 });
      p.seed([makeRecord("1", "2026-01-01T12:00:00Z")]);
      expect(p.hasMore).toBe(false);
    });

    it("keeps hasMore true when data fills the page", () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ]);
      expect(p.hasMore).toBe(true);
    });

    it("ignores subsequent seed calls", () => {
      const p = makePaginator();
      p.seed([makeRecord("1", "2026-01-01T12:00:00Z")]);
      p.seed([makeRecord("99", "2026-12-01T12:00:00Z")]);
      expect(p.items[0]!.id).toBe("1");
    });

    it("ignores empty data array", () => {
      const p = makePaginator();
      p.seed([]);
      expect(p.items).toEqual([]);
    });
  });

  describe("loadOlderPage", () => {
    it("prepends older records", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);

      const older = [
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ];
      (
        queryClient.fetchQuery as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(older);

      await p.loadOlderPage();
      expect(p.items).toHaveLength(4);
      expect(p.items[0]!.id).toBe("1");
    });

    it("sets hasMore to false on a short page", async () => {
      const p = makePaginator({ pageSize: 3 });
      p.seed([
        makeRecord("5", "2026-01-05T12:00:00Z"),
        makeRecord("6", "2026-01-06T12:00:00Z"),
        makeRecord("7", "2026-01-07T12:00:00Z"),
      ]);

      (
        queryClient.fetchQuery as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([makeRecord("4", "2026-01-04T12:00:00Z")]);
      await p.loadOlderPage();
      expect(p.hasMore).toBe(false);
    });

    it("does nothing when already loading", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ]);

      let resolveFirst!: (v: TestRecord[]) => void;
      (queryClient.fetchQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        new Promise<TestRecord[]>((r) => {
          resolveFirst = r;
        }),
      );

      const first = p.loadOlderPage();
      void p.loadOlderPage(); // should be a no-op
      expect(
        (queryClient.fetchQuery as ReturnType<typeof vi.fn>).mock.calls,
      ).toHaveLength(1);
      resolveFirst([]);
      await first;
    });

    it("does nothing when items are empty", async () => {
      const p = makePaginator();
      await p.loadOlderPage();
      expect(queryClient.fetchQuery).not.toHaveBeenCalled();
    });

    it("does nothing when hasMore is false", async () => {
      const p = makePaginator({ pageSize: 5 });
      p.seed([makeRecord("1", "2026-01-01T12:00:00Z")]);
      await p.loadOlderPage();
      expect(queryClient.fetchQuery).not.toHaveBeenCalled();
    });

    it("resets loadingOlder on error", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ]);
      (
        queryClient.fetchQuery as ReturnType<typeof vi.fn>
      ).mockRejectedValueOnce(new Error("network"));
      await expect(p.loadOlderPage()).rejects.toThrow("network");
      expect(p.loadingOlder).toBe(false);
    });
  });

  describe("loadUntilReadBoundary", () => {
    it("fetches pages until oldest item predates cutoff", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("5", "2026-01-05T12:00:00Z"),
        makeRecord("6", "2026-01-06T12:00:00Z"),
      ]);

      (queryClient.fetchQuery as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([
          makeRecord("3", "2026-01-03T12:00:00Z"),
          makeRecord("4", "2026-01-04T12:00:00Z"),
        ])
        .mockResolvedValueOnce([
          makeRecord("1", "2026-01-01T12:00:00Z"),
          makeRecord("2", "2026-01-02T12:00:00Z"),
        ]);

      await p.loadUntilReadBoundary(Date.parse("2026-01-02T12:00:00Z"));
      expect(p.items[0]!.id).toBe("1");
      expect(p.loadingUnread).toBe(false);
    });

    it("stops when hasMore becomes false", async () => {
      const p = makePaginator({ pageSize: 3 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
        makeRecord("5", "2026-01-05T12:00:00Z"),
      ]);

      (
        queryClient.fetchQuery as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([makeRecord("2", "2026-01-02T12:00:00Z")]);

      await p.loadUntilReadBoundary(Date.parse("2020-01-01T12:00:00Z"));
      expect(p.hasMore).toBe(false);
      expect(queryClient.fetchQuery).toHaveBeenCalledTimes(1);
    });
  });
});
