import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createPortalReseed,
  type PortalReseedDeps,
  type PortalReseedStartArgs,
} from "./create-portal-reseed.svelte.js";
import type { PortalCopyTriple } from "$lib/workers/crypto-protocol.js";
import type * as CryptoModule from "@care-y/crypto";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as FetchBlobModule from "$lib/utils/fetch-blob.js";

// vi.mock required: the @care-y/crypto barrel initializes libsodium WASM
// via the getSodium() singleton at import time, which the Node/jsdom test
// environment cannot load without the slow JS fallback.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal triggers libsodium WASM init; satisfies Pick<typeof CryptoModule, "encode"> guards the stubbed export
vi.mock(
  "@care-y/crypto",
  () =>
    ({
      encode: (bytes: Uint8Array): string => {
        let binary = "";
        for (const b of bytes) binary += String.fromCharCode(b);
        return btoa(binary)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
      },
    }) satisfies Pick<typeof CryptoModule, "encode">,
);

// vi.mock required: the trpc module creates a real tRPC client at import
// time with httpBatchLink and goto side-effects. The composable accepts
// trpc via deps so the real module is never called; this stub prevents
// the import-time initialization from crashing.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal triggers SvelteKit virtual module resolution ($app/navigation); satisfies Pick<typeof TrpcModule, "trpc"> guards the export
vi.mock(
  "$lib/trpc/index.js",
  () =>
    ({
      trpc: {} as unknown as (typeof TrpcModule)["trpc"],
    }) satisfies Pick<typeof TrpcModule, "trpc">,
);

// vi.mock required: fetchBlob uses the global fetch with credentials.
// The composable accepts fetchBlob via deps so the real module is never
// called; this stub prevents the import from pulling in error types.
vi.mock("$lib/utils/fetch-blob.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FetchBlobModule>()),
  fetchBlob: vi.fn(),
}));

// ── Factories ──────────────────────────────────────────────────────────

const COPY: PortalCopyTriple = {
  ephemeralPoint: "ep",
  nonce: "nn",
  ciphertext: "ct",
};

const KEY_WRAP = {
  ephemeralPoint: "kw-ep",
  nonce: "kw-nn",
  wrappedKey: "kw-wk",
};

function makeFollowUp(
  id: string,
  opts?: {
    type?: string;
    isPrivate?: boolean;
    keyWrap?: typeof KEY_WRAP | null;
    portalWrap?: string | null;
  },
): {
  id: string;
  type: string;
  source: string;
  isPrivate: boolean;
  encryptedContent: string;
  keyWrap: typeof KEY_WRAP | null;
  portalWrap: string | null;
} {
  return {
    id,
    type: opts?.type ?? "message",
    source: "volunteer",
    isPrivate: opts?.isPrivate ?? false,
    encryptedContent: `enc-${id}`,
    keyWrap: opts?.keyWrap !== undefined ? opts.keyWrap : KEY_WRAP,
    portalWrap: opts?.portalWrap !== undefined ? opts.portalWrap : null,
  };
}

function makeAttachment(
  id: string,
  followupId: string,
  opts?: { fileKeyWrap?: string | null; encryptedFilename?: string | null },
): {
  id: string;
  followupId: string;
  blobKey: string;
  fileKeyWrap: string | null;
  encryptedFilename: string | null;
} {
  return {
    id,
    followupId,
    blobKey: `bk-${id}`,
    fileKeyWrap: opts?.fileKeyWrap !== undefined ? opts.fileKeyWrap : "fkw-1",
    encryptedFilename:
      opts?.encryptedFilename !== undefined ? opts.encryptedFilename : "fn-1",
  };
}

function makeRecording(
  id: string,
  followupId: string,
  opts?: { fileKeyWrap?: string | null },
): {
  id: string;
  followupId: string;
  blobKey: string;
  fileKeyWrap: string | null;
} {
  return {
    id,
    followupId,
    blobKey: `bk-${id}`,
    fileKeyWrap: opts?.fileKeyWrap !== undefined ? opts.fileKeyWrap : "fkw-r",
  };
}

type AsyncMock = ReturnType<
  typeof vi.fn<(...args: unknown[]) => Promise<unknown>>
>;

interface MockTrpc {
  tickets: {
    listForClient: { query: AsyncMock };
    listFollowUps: { query: AsyncMock };
    listAttachments: { query: AsyncMock };
    listRecordings: { query: AsyncMock };
    reseedPortalHistory: { mutate: AsyncMock };
    convertBlobForReseed: { mutate: AsyncMock };
  };
}

function mockAsync(): AsyncMock {
  return vi.fn<(...args: unknown[]) => Promise<unknown>>();
}

function makeTrpc(): MockTrpc {
  return {
    tickets: {
      listForClient: { query: mockAsync().mockResolvedValue([]) },
      listFollowUps: {
        query: mockAsync().mockResolvedValue({ followUps: [], reactions: {} }),
      },
      listAttachments: { query: mockAsync().mockResolvedValue([]) },
      listRecordings: { query: mockAsync().mockResolvedValue([]) },
      reseedPortalHistory: {
        mutate: mockAsync().mockResolvedValue({ inserted: 0, skipped: 0 }),
      },
      convertBlobForReseed: {
        mutate: mockAsync().mockResolvedValue({ inserted: true }),
      },
    },
  };
}

function makeBridge(): PortalReseedDeps["bridge"] {
  return {
    sealFollowUpsToPublic: vi
      .fn()
      .mockImplementation(
        (
          _ticketId: string,
          _clientPublic: string,
          items: readonly { followUpId: string }[],
        ) =>
          Promise.resolve({
            items: items.map((i) => ({
              followUpId: i.followUpId,
              copy: COPY,
            })),
            failed: [],
          }),
      ),
    sealFileKeysToPublic: vi
      .fn()
      .mockImplementation(
        (
          _ticketId: string,
          _clientPublic: string,
          items: readonly { rowId: string }[],
        ) =>
          Promise.resolve({
            items: items.map((i) => ({ rowId: i.rowId, copy: COPY })),
            failed: [],
          }),
      ),
    convertBlobForPortal: vi.fn().mockResolvedValue({
      encryptedData: new ArrayBuffer(4),
      fileKeyWrap: "new-fkw",
      copy: COPY,
    }),
  } as unknown as PortalReseedDeps["bridge"];
}

function makeDeps(overrides?: Partial<PortalReseedDeps>): PortalReseedDeps {
  return {
    bridge: makeBridge(),
    trpc: makeTrpc() as unknown as PortalReseedDeps["trpc"],
    fetchBlob: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    ...overrides,
  };
}

const ARGS: PortalReseedStartArgs = {
  clientId: "c-1",
  channelId: "a".repeat(48),
  clientPublic: "client-pub-b64",
};

// ── Tests ──────────────────────────────────────────────────────────────

describe("createPortalReseed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts idle and reaches done with zero tickets", async () => {
    const deps = makeDeps();
    const instance = createPortalReseed(deps);

    expect(instance.state.phase).toBe("idle");

    await instance.start(ARGS);

    expect(instance.state.phase).toBe("done");
    expect(instance.state.ticketsTotal).toBe(0);
    expect(instance.state.itemsDone).toBe(0);
  });

  it("processes messages before media per ticket (ordering)", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;
    const callOrder: string[] = [];

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    // First call: message enumeration page; second call: warmup page for media
    trpc.tickets.listFollowUps.query.mockImplementation(
      async (...args: unknown[]) => {
        const input = args[0] as { ticketId: string; limit: number };
        if (input.limit === 500) {
          callOrder.push("listFollowUps");
          return {
            followUps: [makeFollowUp("fu-1")],
            reactions: {},
          };
        }
        // Warmup call (limit 1) for media phase
        return {
          followUps: [makeFollowUp("fu-1")],
          reactions: {},
        };
      },
    );

    trpc.tickets.listAttachments.query.mockImplementation(async () => {
      callOrder.push("listAttachments");
      return [];
    });

    trpc.tickets.listRecordings.query.mockImplementation(async () => {
      callOrder.push("listRecordings");
      return [];
    });

    trpc.tickets.reseedPortalHistory.mutate.mockImplementation(async () => {
      callOrder.push("reseedMessages");
      return { inserted: 1, skipped: 0 };
    });

    await reseed(deps);

    // Messages (listFollowUps + reseed) come before media (listAttachments/Recordings)
    const msgIdx = callOrder.indexOf("reseedMessages");
    const attIdx = callOrder.indexOf("listAttachments");
    expect(msgIdx).toBeLessThan(attIdx);
  });

  // Contract: RESEED_MESSAGE_CHUNK (200) mirrors the server-side cap in
  // reseedPortalHistoryInputSchema (messages .max(200)); a larger client
  // chunk would be rejected wholesale by input validation.
  it("chunks 201 messages into two reseedPortalHistory calls", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    // 201 follow-ups: will be sealed in batches of 50, posted in chunks of 200
    const followUps = Array.from({ length: 201 }, (_, i) =>
      makeFollowUp(`fu-${String(i)}`),
    );
    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps,
      reactions: {},
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 200,
      skipped: 0,
    });

    await reseed(deps);

    // Should have 2 reseed calls: one with 200 messages, one with 1
    const reseedCalls = trpc.tickets.reseedPortalHistory.mutate.mock.calls;
    expect(reseedCalls.length).toBe(2);

    const firstMessages = (
      reseedCalls[0] as [{ messages: { followupId: string }[] }]
    )[0].messages;
    const secondMessages = (
      reseedCalls[1] as [{ messages: { followupId: string }[] }]
    )[0].messages;
    expect(firstMessages.length).toBe(200);
    expect(secondMessages.length).toBe(1);
  });

  it("terminates pagination on empty page", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    // First page returns items, second returns empty
    let callCount = 0;
    trpc.tickets.listFollowUps.query.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          followUps: Array.from({ length: 500 }, (_, i) =>
            makeFollowUp(`fu-${String(i)}`),
          ),
          reactions: {},
        };
      }
      return { followUps: [], reactions: {} };
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 0,
      skipped: 0,
    });

    await reseed(deps);

    // Two listFollowUps calls: first full page, second empty
    expect(trpc.tickets.listFollowUps.query).toHaveBeenCalledTimes(2);
  });

  it("terminates pagination when page has fewer than limit items", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-1"), makeFollowUp("fu-2")],
      reactions: {},
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 2,
      skipped: 0,
    });

    await reseed(deps);

    // Single page with 2 items < 500 limit, no second call
    expect(trpc.tickets.listFollowUps.query).toHaveBeenCalledTimes(1);
  });

  it("routes portalWrap items to the bridge (unconverged portal replies)", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;
    const bridge = deps.bridge;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [
        makeFollowUp("fu-portal", { keyWrap: null, portalWrap: "pw-sealed" }),
      ],
      reactions: {},
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    await reseed(deps);

    const sealCalls = vi.mocked(bridge.sealFollowUpsToPublic).mock.calls;
    expect(sealCalls.length).toBe(1);
    const items = sealCalls[0]![2] as readonly {
      followUpId: string;
      portalWrap?: string;
      keyWrap?: unknown;
    }[];
    expect(items[0]!.portalWrap).toBe("pw-sealed");
    expect(items[0]!.keyWrap).toBeUndefined();
  });

  it("skips private, ineligible-type, and null-wrap follow-ups", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [
        makeFollowUp("fu-ok"),
        makeFollowUp("fu-private", { isPrivate: true }),
        makeFollowUp("fu-note", { type: "internal_note" }),
        makeFollowUp("fu-null", { keyWrap: null, portalWrap: null }),
      ],
      reactions: {},
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    const r = await reseed(deps);

    // Only 1 eligible item
    expect(r.state.itemsTotal).toBe(1);

    // bridge receives only the eligible one
    const sealCalls = vi.mocked(deps.bridge.sealFollowUpsToPublic).mock.calls;
    const items = sealCalls[0]![2] as readonly { followUpId: string }[];
    expect(items.length).toBe(1);
    expect(items[0]!.followUpId).toBe("fu-ok");
  });

  it("includes email_outbound follow-ups in the message copies", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([
      { ticketId: "t-1", keyWrap: KEY_WRAP },
    ]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-email", { type: "email_outbound" })],
      reactions: {},
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    const r = await reseed(deps);

    expect(r.state.itemsTotal).toBe(1);
    const sealCalls = vi.mocked(deps.bridge.sealFollowUpsToPublic).mock.calls;
    const items = sealCalls[0]![2] as readonly { followUpId: string }[];
    expect(items[0]!.followUpId).toBe("fu-email");
  });

  it("includes email_inbound follow-ups in the message copies", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([
      { ticketId: "t-1", keyWrap: KEY_WRAP },
    ]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-inbound", { type: "email_inbound" })],
      reactions: {},
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    const r = await reseed(deps);

    expect(r.state.itemsTotal).toBe(1);
    const sealCalls = vi.mocked(deps.bridge.sealFollowUpsToPublic).mock.calls;
    const items = sealCalls[0]![2] as readonly { followUpId: string }[];
    expect(items[0]!.followUpId).toBe("fu-inbound");
  });

  it("falls back to the ticket-level wrap for follow-ups with no per-row wrap", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;
    const ticketWrap = {
      ephemeralPoint: "tw-ep",
      nonce: "tw-nn",
      wrappedKey: "tw-wk",
    };

    trpc.tickets.listForClient.query.mockResolvedValue([
      { ticketId: "t-1", keyWrap: ticketWrap },
    ]);

    // Ordinary follow-up: key_generation null on the server, so no
    // per-row keyWrap and no portalWrap arrive on the wire.
    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [
        makeFollowUp("fu-plain", { keyWrap: null, portalWrap: null }),
      ],
      reactions: {},
    });

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    const r = await reseed(deps);

    expect(r.state.itemsTotal).toBe(1);
    const sealCalls = vi.mocked(deps.bridge.sealFollowUpsToPublic).mock.calls;
    expect(sealCalls.length).toBe(1);
    const items = sealCalls[0]![2] as readonly {
      followUpId: string;
      keyWrap?: unknown;
    }[];
    expect(items[0]!.followUpId).toBe("fu-plain");
    expect(items[0]!.keyWrap).toEqual(ticketWrap);
  });

  it("uses the ticket-level wrap as the media warm-up without an extra page fetch", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;
    const bridge = deps.bridge;
    const ticketWrap = {
      ephemeralPoint: "tw-ep",
      nonce: "tw-nn",
      wrappedKey: "tw-wk",
    };

    trpc.tickets.listForClient.query.mockResolvedValue([
      { ticketId: "t-1", keyWrap: ticketWrap },
    ]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-1", { keyWrap: null, portalWrap: null })],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-1", "fu-1"),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([]);

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    await reseed(deps);

    const fileKeyCalls = vi.mocked(bridge.sealFileKeysToPublic).mock.calls;
    expect(fileKeyCalls.length).toBe(1);
    expect(fileKeyCalls[0]![3]).toEqual(ticketWrap);
    // Only the message enumeration page, no warm-up page fetch.
    expect(trpc.tickets.listFollowUps.query).toHaveBeenCalledTimes(1);
  });

  it("passes keyWrap warm-up to sealFileKeysToPublic", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;
    const bridge = deps.bridge;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    // Message enumeration returns one item (for messages phase)
    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-1")],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-1", "fu-1"),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([]);

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    await reseed(deps);

    const fileKeyCalls = vi.mocked(bridge.sealFileKeysToPublic).mock.calls;
    expect(fileKeyCalls.length).toBe(1);
    // 4th argument is the warmup keyWrap
    expect(fileKeyCalls[0]![3]).toEqual(KEY_WRAP);
  });

  it("processes null-wrap blobs sequentially via convertBlobForPortal", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;
    const bridge = deps.bridge;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-d1", "fu-1", { fileKeyWrap: null }),
      makeAttachment("att-d2", "fu-1", { fileKeyWrap: null }),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([]);

    await reseed(deps);

    // Each direct blob calls fetchBlob, convertBlobForPortal, convertBlobForReseed
    const fetchCalls = vi.mocked(deps.fetchBlob!).mock.calls;
    expect(fetchCalls.length).toBe(2);
    expect(fetchCalls[0]![0]).toBe("/api/blobs/attachments/att-d1");
    expect(fetchCalls[1]![0]).toBe("/api/blobs/attachments/att-d2");

    expect(vi.mocked(bridge.convertBlobForPortal).mock.calls.length).toBe(2);
    expect(trpc.tickets.convertBlobForReseed.mutate.mock.calls.length).toBe(2);
  });

  it("records worker failures and server skips in skippedCount", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-1"), makeFollowUp("fu-2")],
      reactions: {},
    });

    // Bridge fails one item
    vi.mocked(deps.bridge.sealFollowUpsToPublic).mockResolvedValue({
      items: [{ followUpId: "fu-1", copy: COPY }],
      failed: ["fu-2"],
    });

    // Server skips one item
    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 0,
      skipped: 1,
    });

    const r = createPortalReseed(deps);
    await r.start(ARGS);

    // 1 worker failure + 1 server skip = 2
    expect(r.state.skippedCount).toBe(2);
    expect(r.state.phase).toBe("done");
  });

  it("cancellation mid-run stops further calls", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([
      { ticketId: "t-1" },
      { ticketId: "t-2" },
    ]);

    // Use a deferred promise so we can cancel between tickets.
    // The reseedPortalHistory call for t-1's messages will block until
    // we resolve it, giving us time to call cancel().
    let resolveReseed!: (v: { inserted: number; skipped: number }) => void;
    trpc.tickets.reseedPortalHistory.mutate.mockImplementation(
      async () =>
        new Promise<{ inserted: number; skipped: number }>((resolve) => {
          resolveReseed = resolve;
        }),
    );

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-1")],
      reactions: {},
    });

    const r = createPortalReseed(deps);
    const startPromise = r.start(ARGS);

    // Flush microtasks up to the blocked reseedPortalHistory call
    await vi.advanceTimersByTimeAsync(0);

    // Cancel while t-1's reseed mutation is pending
    r.cancel();

    // Resolve the pending mutation so start() can finish
    resolveReseed({ inserted: 1, skipped: 0 });
    await startPromise;

    expect(r.state.phase).toBe("cancelled");

    // t-2's listFollowUps should never have been called
    const followUpCalls = trpc.tickets.listFollowUps.query.mock.calls as {
      ticketId: string;
    }[][];
    const t2Calls = followUpCalls.filter(
      (args) => (args[0] as { ticketId: string }).ticketId === "t-2",
    );
    expect(t2Calls.length).toBe(0);
  });

  it("retries once on network error, then sets error phase on second failure", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query
      .mockRejectedValueOnce(new Error("network"))
      .mockRejectedValueOnce(new Error("network again"));

    const r = createPortalReseed(deps);
    await r.start(ARGS);

    expect(r.state.phase).toBe("error");
    expect(trpc.tickets.listForClient.query).toHaveBeenCalledTimes(2);
  });

  it("retries once on network error and succeeds on second attempt", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce([]);

    const r = createPortalReseed(deps);
    await r.start(ARGS);

    expect(r.state.phase).toBe("done");
    expect(trpc.tickets.listForClient.query).toHaveBeenCalledTimes(2);
  });

  it("waits retryAfterSeconds on rate-limit error, then retries", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    const rateLimitErr = {
      data: { code: "RATE_LIMITED", retryAfterSeconds: 5 },
    };

    trpc.tickets.listForClient.query
      .mockRejectedValueOnce(rateLimitErr)
      .mockResolvedValueOnce([]);

    const r = createPortalReseed(deps);
    const startPromise = r.start(ARGS);

    // Advance past the 5-second wait
    await vi.advanceTimersByTimeAsync(5000);
    await startPromise;

    expect(r.state.phase).toBe("done");
    expect(trpc.tickets.listForClient.query).toHaveBeenCalledTimes(2);
  });

  it("handles ALREADY_CONVERTED blob error as a skip", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-1", "fu-1", { fileKeyWrap: null }),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([]);

    // convertBlobForReseed throws ALREADY_CONVERTED
    trpc.tickets.convertBlobForReseed.mutate.mockRejectedValue({
      data: { code: "PORTAL_RESEED_ALREADY_CONVERTED" },
    });

    const r = createPortalReseed(deps);
    await r.start(ARGS);

    expect(r.state.phase).toBe("done");
    expect(r.state.skippedCount).toBe(1);
  });

  it("tracks itemsTotal growth across messages and media", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-1"), makeFollowUp("fu-2")],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-1", "fu-1"),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([
      makeRecording("rec-1", "fu-1"),
    ]);

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    const r = createPortalReseed(deps);
    await r.start(ARGS);

    // 2 messages + 1 attachment + 1 recording = 4
    expect(r.state.itemsTotal).toBe(4);
    expect(r.state.ticketsDone).toBe(1);
    expect(r.state.phase).toBe("done");
  });

  it("sends attachment and recording wraps in separate chunks for failure isolation", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [makeFollowUp("fu-1")],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-1", "fu-1"),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([
      makeRecording("rec-1", "fu-1"),
    ]);

    trpc.tickets.reseedPortalHistory.mutate.mockResolvedValue({
      inserted: 1,
      skipped: 0,
    });

    await reseed(deps);

    // One reseedPortalHistory call each for messages, attachment wraps,
    // and recording wraps, so a rejection in one category cannot
    // invalidate another.
    const calls = trpc.tickets.reseedPortalHistory.mutate.mock.calls as [
      {
        messages: unknown[];
        attachmentWraps: unknown[];
        recordingWraps: unknown[];
      },
    ][];

    // Find the attachment-only and recording-only calls
    const attCalls = calls.filter((c) => c[0].attachmentWraps.length > 0);
    const recCalls = calls.filter((c) => c[0].recordingWraps.length > 0);

    expect(attCalls.length).toBe(1);
    expect(recCalls.length).toBe(1);
    // Verify isolation: attachment call has no recordings, recording call has no attachments
    expect(attCalls[0]![0].recordingWraps.length).toBe(0);
    expect(recCalls[0]![0].attachmentWraps.length).toBe(0);
  });

  it("uses correct blob paths for attachments vs recordings", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-d1", "fu-1", { fileKeyWrap: null }),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([
      makeRecording("rec-d1", "fu-1", { fileKeyWrap: null }),
    ]);

    await reseed(deps);

    const fetchCalls = vi.mocked(deps.fetchBlob!).mock.calls;
    const paths = fetchCalls.map((c) => c[0] as string);
    expect(paths).toContain("/api/blobs/attachments/att-d1");
    expect(paths).toContain("/api/blobs/recordings/rec-d1");
  });

  it("encodes blob encryptedData as base64url for the wire", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);

    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [],
      reactions: {},
    });

    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-d1", "fu-1", { fileKeyWrap: null }),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([]);

    // Return a known ArrayBuffer from the bridge
    const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    vi.mocked(deps.bridge.convertBlobForPortal).mockResolvedValue({
      encryptedData: data.buffer as ArrayBuffer,
      fileKeyWrap: "fkw",
      copy: COPY,
    });

    await reseed(deps);

    const blobCall = trpc.tickets.convertBlobForReseed.mutate.mock.calls[0] as [
      { encryptedData: string },
    ];
    // "Hello" in base64url = "SGVsbG8"
    expect(blobCall[0].encryptedData).toBe("SGVsbG8");
  });

  it("retries convertBlobForPortal with a non-detached buffer", async () => {
    const deps = makeDeps();
    const trpc = deps.trpc as MockTrpc;
    const bridge = deps.bridge;

    trpc.tickets.listForClient.query.mockResolvedValue([{ ticketId: "t-1" }]);
    trpc.tickets.listFollowUps.query.mockResolvedValue({
      followUps: [],
      reactions: {},
    });
    trpc.tickets.listAttachments.query.mockResolvedValue([
      makeAttachment("att-retry", "fu-1", { fileKeyWrap: null }),
    ]);
    trpc.tickets.listRecordings.query.mockResolvedValue([]);

    // First call fails (simulating a network error), second succeeds.
    const receivedByteLengths: number[] = [];
    vi.mocked(bridge.convertBlobForPortal)
      .mockImplementationOnce((_tid, _pub, _kind, _rid, buf) => {
        receivedByteLengths.push((buf as ArrayBuffer).byteLength);
        return Promise.reject(new Error("network-blip"));
      })
      .mockImplementationOnce((_tid, _pub, _kind, _rid, buf) => {
        receivedByteLengths.push((buf as ArrayBuffer).byteLength);
        return Promise.resolve({
          encryptedData: new ArrayBuffer(4),
          fileKeyWrap: "fkw",
          copy: COPY,
        });
      });

    await reseed(deps);

    // Both calls must receive a buffer with non-zero byteLength.
    // A detached ArrayBuffer reports byteLength === 0.
    expect(receivedByteLengths).toHaveLength(2);
    expect(receivedByteLengths[0]).toBeGreaterThan(0);
    expect(receivedByteLengths[1]).toBeGreaterThan(0);
  });
});

// ── Helper ─────────────────────────────────────────────────────────────

/** Shortcut: create reseed and run start with default ARGS. */
async function reseed(
  deps: PortalReseedDeps,
): Promise<ReturnType<typeof createPortalReseed>> {
  const r = createPortalReseed(deps);
  await r.start(ARGS);
  return r;
}
