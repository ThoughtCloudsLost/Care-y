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
  return { query: vi.fn() } as unknown as Parameters<
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

  function makePaginator(opts?: {
    pageSize?: number;
    totalCount?: () => number | undefined;
  }) {
    return createChatPaginator<TestRecord>({
      pageSize: opts?.pageSize ?? 3,
      queryClient,
      getPageQueryKey: (cursor: string) => ["test", "page", cursor],
      fetchPage,
      getScrollContainer: () => undefined,
      ...(opts?.totalCount ? { getTotalCount: opts.totalCount } : {}),
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

  describe("syncInitialPage", () => {
    it("replaces the page when only a single page exists", () => {
      const p = makePaginator({ pageSize: 3 });
      p.seed([
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
        makeRecord("3", "2026-01-03T12:00:00Z"),
      ]);

      const updated = [
        makeRecord("2", "2026-01-02T12:00:00Z"),
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ];
      p.syncInitialPage(updated);

      expect(p.items).toEqual(updated);
    });

    it("no-ops when ids and order match", () => {
      const p = makePaginator({ pageSize: 3 });
      const data = [
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
        makeRecord("3", "2026-01-03T12:00:00Z"),
      ];
      p.seed(data);
      const before = p.items;
      p.syncInitialPage([...data]);
      expect(p.items).toBe(before);
    });

    it("appends new items when multiple pages exist", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);

      const older = [
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ];
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        older,
      );
      await p.loadOlderPage();

      expect(p.items).toHaveLength(4);

      // Refetch: initial query now returns records 4 and 5 (server shifted
      // the window). Record 3 was the oldest in the initial page but is
      // now covered by the older page. Record 5 is new.
      p.syncInitialPage([
        makeRecord("4", "2026-01-04T12:00:00Z"),
        makeRecord("5", "2026-01-05T12:00:00Z"),
      ]);

      // Records 1-4 stay, 5 is appended, no gap or duplicate.
      expect(p.items.map((r) => r.id)).toEqual(["1", "2", "3", "4", "5"]);
    });

    it("removes pending entries when multiple pages exist", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);

      const older = [
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ];
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        older,
      );
      await p.loadOlderPage();

      // Simulate optimistic add via syncInitialPage with a pending entry.
      p.syncInitialPage([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
        makeRecord("pending-abc", "2026-01-05T12:00:00Z"),
      ]);
      expect(p.items.map((r) => r.id)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "pending-abc",
      ]);

      // Server confirms: real record 5 arrived, pending-abc is gone.
      p.syncInitialPage([
        makeRecord("4", "2026-01-04T12:00:00Z"),
        makeRecord("5", "2026-01-05T12:00:00Z"),
      ]);
      expect(p.items.map((r) => r.id)).toEqual(["1", "2", "3", "4", "5"]);
    });

    it("preserves boundary with older page when refetch shifts the window", async () => {
      const p = makePaginator({ pageSize: 3 });
      p.seed([
        makeRecord("4", "2026-01-04T12:00:00Z"),
        makeRecord("5", "2026-01-05T12:00:00Z"),
        makeRecord("6", "2026-01-06T12:00:00Z"),
      ]);

      const older = [
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
        makeRecord("3", "2026-01-03T12:00:00Z"),
      ];
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        older,
      );
      await p.loadOlderPage();

      expect(p.items).toHaveLength(6);

      // Refetch after two new messages: window shifts to [6, 7, 8].
      // Records 4-5 drop out of the server window. They must not
      // disappear from the paginator because they live in the older page.
      p.syncInitialPage([
        makeRecord("6", "2026-01-06T12:00:00Z"),
        makeRecord("7", "2026-01-07T12:00:00Z"),
        makeRecord("8", "2026-01-08T12:00:00Z"),
      ]);

      expect(p.items.map((r) => r.id)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
      ]);
    });

    it("no-ops when multi-page data has no new items and no pending entries", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);

      const older = [
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ];
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        older,
      );
      await p.loadOlderPage();

      const before = p.items;
      // Same data, nothing new.
      p.syncInitialPage([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);
      expect(p.items).toBe(before);
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
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        older,
      );

      await p.loadOlderPage();
      expect(p.items).toHaveLength(4);
      expect(p.items[0]!.id).toBe("1");
    });

    it("caches the page under the key the caller supplied", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await p.loadOlderPage();

      expect(queryClient.query).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["test", "page", "3"] }),
      );
    });

    // A page can come back short for reasons other than reaching the start,
    // so a transport that reports a total gets to say so directly.
    it("ends history when the total says everything is loaded", async () => {
      const p = makePaginator({ pageSize: 2, totalCount: () => 4 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ]);

      await p.loadOlderPage();
      expect(p.hasMore).toBe(false);
    });

    it("keeps paging on a full page when the total says more remains", async () => {
      const p = makePaginator({ pageSize: 2, totalCount: () => 10 });
      p.seed([
        makeRecord("3", "2026-01-03T12:00:00Z"),
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);
      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ]);

      await p.loadOlderPage();
      expect(p.hasMore).toBe(true);
    });

    it("sets hasMore to false on a short page", async () => {
      const p = makePaginator({ pageSize: 3 });
      p.seed([
        makeRecord("5", "2026-01-05T12:00:00Z"),
        makeRecord("6", "2026-01-06T12:00:00Z"),
        makeRecord("7", "2026-01-07T12:00:00Z"),
      ]);

      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        makeRecord("4", "2026-01-04T12:00:00Z"),
      ]);
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
      (queryClient.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        new Promise<TestRecord[]>((r) => {
          resolveFirst = r;
        }),
      );

      const first = p.loadOlderPage();
      void p.loadOlderPage(); // should be a no-op
      expect(
        (queryClient.query as ReturnType<typeof vi.fn>).mock.calls,
      ).toHaveLength(1);
      resolveFirst([]);
      await first;
    });

    it("does nothing when items are empty", async () => {
      const p = makePaginator();
      await p.loadOlderPage();
      expect(queryClient.query).not.toHaveBeenCalled();
    });

    it("does nothing when hasMore is false", async () => {
      const p = makePaginator({ pageSize: 5 });
      p.seed([makeRecord("1", "2026-01-01T12:00:00Z")]);
      await p.loadOlderPage();
      expect(queryClient.query).not.toHaveBeenCalled();
    });

    it("resets loadingOlder on error", async () => {
      const p = makePaginator({ pageSize: 2 });
      p.seed([
        makeRecord("1", "2026-01-01T12:00:00Z"),
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ]);
      (queryClient.query as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("network"),
      );
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

      (queryClient.query as ReturnType<typeof vi.fn>)
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

      (queryClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        makeRecord("2", "2026-01-02T12:00:00Z"),
      ]);

      await p.loadUntilReadBoundary(Date.parse("2020-01-01T12:00:00Z"));
      expect(p.hasMore).toBe(false);
      expect(queryClient.query).toHaveBeenCalledTimes(1);
    });
  });
});
