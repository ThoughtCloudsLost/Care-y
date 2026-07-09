// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import type { CreateQueryResult } from "@tanstack/svelte-query";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  TicketDecryptCache,
  type TicketKeyWrap,
} from "$lib/crypto/ticket-decrypt-cache.js";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import {
  createListReadState,
  fetchReadStateWindow,
  fetchSweepToExhaustion,
  READ_STATE_BATCH_LIMIT,
  type ListReadState,
  type ReadStateWindow,
  type SweepReadStateEntry,
  type SweepReadStatePage,
} from "./create-list-read-state.svelte.js";

const USER_ID = "user-1";
const WRAP: TicketKeyWrap = {
  ephemeralPoint: "ep",
  nonce: "nonce",
  wrappedKey: "wk",
};

function readUpToPayload(iso: string): string {
  return JSON.stringify({ readUpTo: iso });
}

/** Mock query with a mutable reactive data ref (house pattern). */
function mockQuery<T>(initialData: T | undefined): {
  query: CreateQueryResult<T>;
  setData: (next: T | undefined) => void;
} {
  let dataValue = $state(initialData);
  const query = {
    get data() {
      return dataValue;
    },
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as CreateQueryResult<T>;
  return {
    query,
    setData(next: T | undefined) {
      dataValue = next;
    },
  };
}

/** Bridge whose decrypt resolves per-ciphertext from a response table. */
function createMockBridge(responses: Record<string, string | Error>): {
  bridge: CryptoBridge;
  mockDecrypt: ReturnType<typeof vi.fn>;
} {
  const mockDecrypt = vi.fn(
    (
      _ticketId: string,
      _slot: string,
      _keyCacheId: string,
      _ep: string,
      _nonce: string,
      _wk: string,
      ciphertext: string,
    ): Promise<string> => {
      const response = responses[ciphertext];
      if (response === undefined) {
        return new Promise<string>(() => {
          // Unlisted ciphertexts stay pending forever.
        });
      }
      if (response instanceof Error) return Promise.reject(response);
      return Promise.resolve(response);
    },
  );
  const bridge = {
    decrypt: mockDecrypt,
    getState: () => "KEYED",
  } as unknown as CryptoBridge;
  return { bridge, mockDecrypt };
}

interface Harness {
  readState: ListReadState;
  setWindowData: (next: ReadStateWindow | undefined) => void;
  setSweepData: (next: SweepReadStateEntry[] | undefined) => void;
  mockDecrypt: ReturnType<typeof vi.fn>;
  destroy: () => void;
}

function createHarness(options: {
  responses: Record<string, string | Error>;
  windowData?: ReadStateWindow;
  sweepData?: SweepReadStateEntry[];
  getKeyWrap?: (ticketId: string) => TicketKeyWrap | null;
  userId?: string;
}): Harness {
  const { bridge, mockDecrypt } = createMockBridge(options.responses);
  const cache = new TicketDecryptCache(bridge);
  const windowMock = mockQuery<ReadStateWindow>(options.windowData);
  const sweepMock = mockQuery<SweepReadStateEntry[]>(options.sweepData);

  let readState!: ListReadState;
  const destroy = $effect.root(() => {
    readState = createListReadState({
      windowQuery: windowMock.query,
      sweepQuery: sweepMock.query,
      getKeyWrap: options.getKeyWrap ?? (() => WRAP),
      getUserId: () => options.userId ?? USER_ID,
      ticketDecryptCache: cache,
    });
  });
  flushSync();

  return {
    readState,
    setWindowData: windowMock.setData,
    setSweepData: sweepMock.setData,
    mockDecrypt,
    destroy,
  };
}

function windowEntry(
  ciphertext: string | null,
  followUpCreatedAt: string[],
): ReadStateWindow[string] {
  return { encryptedReadCursor: ciphertext, followUpCreatedAt };
}

function sweepEntry(
  ticketId: string,
  ciphertext: string,
  latestActivityAt: string | null,
  keyWrap: TicketKeyWrap | null = WRAP,
): SweepReadStateEntry {
  return {
    ticketId,
    encryptedReadCursor: ciphertext,
    latestActivityAt,
    keyWrap,
  };
}

describe("createListReadState", () => {
  let harness: Harness | undefined;

  beforeEach(() => {
    cacheRegistry.reset();
  });

  afterEach(() => {
    harness?.destroy();
    harness = undefined;
  });

  describe("unreadCount (window)", () => {
    it("returns 0 while window data is absent", () => {
      harness = createHarness({ responses: {} });
      expect(harness.readState.unreadCount("t-1")).toBe(0);
      expect(harness.mockDecrypt).not.toHaveBeenCalled();
    });

    it("returns 0 for a null cursor without firing a decrypt", () => {
      harness = createHarness({
        responses: {},
        windowData: { "t-1": windowEntry(null, ["2026-07-01T10:00:00Z"]) },
      });
      expect(harness.readState.unreadCount("t-1")).toBe(0);
      expect(harness.mockDecrypt).not.toHaveBeenCalled();
    });

    it("returns 0 when the list row has no key wrap", () => {
      harness = createHarness({
        responses: {},
        windowData: {
          "t-1": windowEntry("ct-nowrap", ["2026-07-01T10:00:00Z"]),
        },
        getKeyWrap: () => null,
      });
      expect(harness.readState.unreadCount("t-1")).toBe(0);
      expect(harness.mockDecrypt).not.toHaveBeenCalled();
    });

    it("returns 0 while the cursor decrypt is pending", () => {
      harness = createHarness({
        responses: {},
        windowData: {
          "t-1": windowEntry("ct-pending", ["2026-07-01T10:00:00Z"]),
        },
      });
      expect(harness.readState.unreadCount("t-1")).toBe(0);
      expect(harness.mockDecrypt).toHaveBeenCalledOnce();
    });

    it("counts only timestamps strictly newer than readUpTo", async () => {
      harness = createHarness({
        responses: { "ct-real": readUpToPayload("2026-07-01T10:00:00Z") },
        windowData: {
          "t-1": windowEntry("ct-real", [
            "2026-07-01T11:00:00Z",
            "2026-07-01T10:00:00Z",
            "2026-07-01T09:00:00Z",
          ]),
        },
      });
      await vi.waitFor(() => {
        expect(harness!.readState.unreadCount("t-1")).toBe(1);
      });
    });

    it("mirrors the detail decrypt call: per-user slot and ticket key-cache id", () => {
      harness = createHarness({
        responses: {},
        windowData: {
          "t-1": windowEntry("ct-shape", ["2026-07-01T10:00:00Z"]),
        },
      });
      harness.readState.unreadCount("t-1");
      expect(harness.mockDecrypt).toHaveBeenCalledWith(
        "t-1",
        `cursor:${USER_ID}`,
        "t-1",
        WRAP.ephemeralPoint,
        WRAP.nonce,
        WRAP.wrappedKey,
        "ct-shape",
      );
    });

    it("returns 0 when the cursor fails AEAD (first-open dummy)", async () => {
      harness = createHarness({
        responses: { "ct-dummy": new Error("AEAD failure") },
        windowData: {
          "t-1": windowEntry("ct-dummy", ["2026-07-01T10:00:00Z"]),
        },
      });
      harness.readState.unreadCount("t-1");
      await vi.waitFor(() => {
        expect(harness!.mockDecrypt).toHaveBeenCalledOnce();
      });
      await vi.waitFor(() => {
        expect(harness!.readState.unreadCount("t-1")).toBe(0);
      });
      expect(harness.readState.isUnread("t-1")).toBe(false);
    });

    it("returns 0 for a malformed decrypted payload", async () => {
      harness = createHarness({
        responses: { "ct-garbage": "not json at all" },
        windowData: {
          "t-1": windowEntry("ct-garbage", ["2026-07-01T10:00:00Z"]),
        },
      });
      harness.readState.unreadCount("t-1");
      await vi.waitFor(() => {
        expect(harness!.mockDecrypt).toHaveBeenCalledOnce();
      });
      expect(harness.readState.unreadCount("t-1")).toBe(0);
    });

    it("re-decrypts when the cursor ciphertext changes", async () => {
      const older = readUpToPayload("2026-07-01T09:00:00Z");
      const newer = readUpToPayload("2026-07-01T11:30:00Z");
      harness = createHarness({
        responses: {
          "ct-version-one-xxxxxxxxxx": older,
          "ct-version-two-xxxxxxxxxx": newer,
        },
        windowData: {
          "t-1": windowEntry("ct-version-one-xxxxxxxxxx", [
            "2026-07-01T11:00:00Z",
            "2026-07-01T10:00:00Z",
          ]),
        },
      });
      await vi.waitFor(() => {
        expect(harness!.readState.unreadCount("t-1")).toBe(2);
      });

      // The detail view flushed a newer cursor: same ticket, new blob.
      harness.setWindowData({
        "t-1": windowEntry("ct-version-two-xxxxxxxxxx", [
          "2026-07-01T11:00:00Z",
          "2026-07-01T10:00:00Z",
        ]),
      });
      await vi.waitFor(() => {
        expect(harness!.readState.unreadCount("t-1")).toBe(0);
      });
      expect(harness.mockDecrypt).toHaveBeenCalledTimes(2);
    });

    it("fires no decrypts while the user id is unknown", () => {
      harness = createHarness({
        responses: {},
        windowData: { "t-1": windowEntry("ct-real", ["2026-07-01T10:00:00Z"]) },
        userId: "",
      });
      expect(harness.readState.unreadCount("t-1")).toBe(0);
      expect(harness.mockDecrypt).not.toHaveBeenCalled();
    });
  });

  describe("sweep (global unread)", () => {
    it("marks a ticket unread when activity is newer than the cursor", async () => {
      harness = createHarness({
        responses: { "ct-a": readUpToPayload("2026-07-01T10:00:00Z") },
        sweepData: [sweepEntry("t-a", "ct-a", "2026-07-01T12:00:00Z")],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.unreadTotal()).toBe(1);
      });
      expect(harness.readState.unreadIds()).toEqual(["t-a"]);
      expect(harness.readState.isUnread("t-a")).toBe(true);
    });

    it("keeps a ticket read when the cursor is newer than all activity", async () => {
      harness = createHarness({
        responses: { "ct-a": readUpToPayload("2026-07-01T13:00:00Z") },
        sweepData: [sweepEntry("t-a", "ct-a", "2026-07-01T12:00:00Z")],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.sweepSettled()).toBe(true);
      });
      expect(harness.readState.unreadTotal()).toBe(0);
    });

    it("treats a null key wrap as quietly not-unread", async () => {
      harness = createHarness({
        responses: {},
        sweepData: [sweepEntry("t-a", "ct-a", "2026-07-01T12:00:00Z", null)],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.sweepSettled()).toBe(true);
      });
      expect(harness.readState.unreadTotal()).toBe(0);
      expect(harness.mockDecrypt).not.toHaveBeenCalled();
    });

    it("treats a system-only ticket (null activity) as not-unread", async () => {
      harness = createHarness({
        responses: { "ct-a": readUpToPayload("2026-07-01T10:00:00Z") },
        sweepData: [sweepEntry("t-a", "ct-a", null)],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.sweepSettled()).toBe(true);
      });
      expect(harness.readState.unreadTotal()).toBe(0);
    });

    it("treats an AEAD-failing sweep cursor (dummy) as not-unread", async () => {
      harness = createHarness({
        responses: { "ct-dummy": new Error("AEAD failure") },
        sweepData: [sweepEntry("t-a", "ct-dummy", "2026-07-01T12:00:00Z")],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.sweepSettled()).toBe(true);
      });
      expect(harness.readState.unreadTotal()).toBe(0);
    });

    it("orders unreadIds newest unread activity first", async () => {
      harness = createHarness({
        responses: {
          "ct-a": readUpToPayload("2026-07-01T10:00:00Z"),
          "ct-b": readUpToPayload("2026-07-01T10:00:00Z"),
        },
        sweepData: [
          sweepEntry("t-older", "ct-a", "2026-07-01T11:00:00Z"),
          sweepEntry("t-newer", "ct-b", "2026-07-01T12:00:00Z"),
        ],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.unreadTotal()).toBe(2);
      });
      expect(harness.readState.unreadIds()).toEqual(["t-newer", "t-older"]);
    });

    it("sweepSettled is false before data and while decrypts are pending", async () => {
      harness = createHarness({
        responses: { "ct-a": readUpToPayload("2026-07-01T10:00:00Z") },
      });
      expect(harness.readState.sweepSettled()).toBe(false);

      harness.setSweepData([
        sweepEntry("t-a", "ct-a", "2026-07-01T12:00:00Z"),
        sweepEntry("t-b", "ct-pending-forever", "2026-07-01T12:00:00Z"),
      ]);
      await vi.waitFor(() => {
        expect(harness!.readState.unreadTotal()).toBe(1);
      });
      expect(harness.readState.sweepSettled()).toBe(false);
    });
  });

  describe("isUnread precedence", () => {
    it("prefers the window verdict for loaded rows over a stale sweep", async () => {
      // Window: cursor newer than every timestamp (all read).
      // Sweep (stale): still claims the ticket is unread.
      harness = createHarness({
        responses: {
          "ct-window": readUpToPayload("2026-07-01T13:00:00Z"),
          "ct-sweep": readUpToPayload("2026-07-01T10:00:00Z"),
        },
        windowData: {
          "t-1": windowEntry("ct-window", ["2026-07-01T12:00:00Z"]),
        },
        sweepData: [sweepEntry("t-1", "ct-sweep", "2026-07-01T12:00:00Z")],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.sweepSettled()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(harness!.readState.unreadCount("t-1")).toBe(0);
      });
      expect(harness.readState.isUnread("t-1")).toBe(false);
      // The global set still carries it until the sweep refetches.
      expect(harness.readState.unreadTotal()).toBe(1);
    });

    it("falls back to the sweep for tickets outside the window", async () => {
      harness = createHarness({
        responses: { "ct-a": readUpToPayload("2026-07-01T10:00:00Z") },
        windowData: {},
        sweepData: [sweepEntry("t-unloaded", "ct-a", "2026-07-01T12:00:00Z")],
      });
      await vi.waitFor(() => {
        expect(harness!.readState.isUnread("t-unloaded")).toBe(true);
      });
    });
  });
});

describe("fetchReadStateWindow", () => {
  it("chunks ids to the server batch limit and merges results", async () => {
    const ids = Array.from({ length: 120 }, (_, i) => `t-${String(i)}`);
    const calls: string[][] = [];
    const result = await fetchReadStateWindow(ids, (batch) => {
      calls.push(batch);
      return Promise.resolve(
        Object.fromEntries(
          batch.map((id) => [id, windowEntry(null, [])]),
        ) as ReadStateWindow,
      );
    });

    expect(calls.map((c) => c.length)).toEqual([50, 50, 20]);
    expect(calls.flat()).toEqual(ids);
    expect(Object.keys(result)).toHaveLength(120);
    expect(READ_STATE_BATCH_LIMIT).toBe(50);
  });

  it("makes no calls for an empty window", async () => {
    const queryBatch = vi.fn();
    const result = await fetchReadStateWindow([], queryBatch);
    expect(result).toEqual({});
    expect(queryBatch).not.toHaveBeenCalled();
  });
});

describe("fetchSweepToExhaustion", () => {
  it("walks pages until nextCursor is null and concatenates items", async () => {
    const pages: Record<string, SweepReadStatePage> = {
      start: {
        items: [sweepEntry("t-1", "ct", null), sweepEntry("t-2", "ct", null)],
        nextCursor: "t-2",
      },
      "t-2": {
        items: [sweepEntry("t-3", "ct", null)],
        nextCursor: null,
      },
    };
    const fetchPage = vi.fn((cursor: string | undefined) =>
      Promise.resolve(pages[cursor ?? "start"]!),
    );

    const items = await fetchSweepToExhaustion(fetchPage);

    expect(items.map((e) => e.ticketId)).toEqual(["t-1", "t-2", "t-3"]);
    expect(fetchPage).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchPage).toHaveBeenNthCalledWith(2, "t-2");
  });

  it("returns an empty list for an empty single page", async () => {
    const items = await fetchSweepToExhaustion(() =>
      Promise.resolve({ items: [], nextCursor: null }),
    );
    expect(items).toEqual([]);
  });
});
