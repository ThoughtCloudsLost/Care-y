/**
 * Tests for the org key rotation reseal engine.
 *
 * Mocks the tRPC client and CryptoBridge to verify batching, progress
 * callbacks, skip-whole-row semantics, alias hash submission via
 * onlyIds, piiUnmasked gating, and the excludeIds cap.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type {
  resealTables as ResealTablesFn,
  resealRowsById as ResealRowsByIdFn,
  reindexViewerTables as ReindexViewerTablesFn,
  resealBlobTables as ResealBlobTablesFn,
  resealBrandingClasses as ResealBrandingClassesFn,
  ResealProgress,
  RED_TIER_TABLES as RedTierTablesConst,
  TRAILING_TIER_TABLES as TrailingTierTablesConst,
} from "./org-reseal.js";
import type * as TrpcNS from "$lib/trpc/index.js";

// ── tRPC mocks ─────────────────────────────────────────────────────

const mockResealStatus = vi.fn();
const mockResealPending = vi.fn();
const mockResealRows = vi.fn();
const mockReindexPending = vi.fn();
const mockReindexRows = vi.fn();
const mockResealBlobPending = vi.fn();
const mockResealBlobRow = vi.fn();
const mockListFormAssetsForReseal = vi.fn();
const mockGetFormAssetBlob = vi.fn();
const mockReplaceFormAssetBlob = vi.fn();

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    keys: {
      resealStatus: { query: mockResealStatus },
      resealPending: { query: mockResealPending },
      resealRows: { mutate: mockResealRows },
      reindexPending: { query: mockReindexPending },
      reindexRows: { mutate: mockReindexRows },
      resealBlobPending: { query: mockResealBlobPending },
      resealBlobRow: { mutate: mockResealBlobRow },
      listFormAssetsForReseal: { query: mockListFormAssetsForReseal },
      getFormAssetBlob: { query: mockGetFormAssetBlob },
      replaceFormAssetBlob: { mutate: mockReplaceFormAssetBlob },
    },
  },
}));

// ── Crypto mock ───────────────────────────────────────────────────
//
// The branding crypto functions require libsodium, which is not available
// in the unit test environment. Mock them so the structural flow tests
// can exercise the tRPC call pattern without a real crypto backend.
import type * as CryptoNS from "@care-y/crypto";

vi.mock("@care-y/crypto", async (importOriginal) => {
  const real = await importOriginal<typeof CryptoNS>();
  return {
    ...real,
    encryptClientBranding: (_payload: Uint8Array, _key: Uint8Array) =>
      new Uint8Array([1, 2, 3]),
    decryptClientBranding: (_ct: Uint8Array, _key: Uint8Array) => {
      // Always throw to simulate "wrong key" for testing. Tests that need
      // successful decryption should mock this per-test via vi.mocked().
      throw new Error("mock: decryption failed");
    },
    requireSodium: () => ({ memzero: vi.fn() }),
  };
});

// ── Bridge mock ────────────────────────────────────────────────────

type ResealBatchFn = (
  items: readonly {
    cacheKey: string;
    ciphertext: string;
    index?: "alias" | "phone" | "email";
  }[],
) => Promise<
  readonly {
    cacheKey: string;
    resealed: string | null;
    fromGeneration: number | null;
    indexHash: string | null;
  }[]
>;

interface MockBridge {
  orgResealBatch: ReturnType<typeof vi.fn<ResealBatchFn>>;
  phoneMatchHash: ReturnType<typeof vi.fn>;
  emailMatchHash: ReturnType<typeof vi.fn>;
  getOrgPublicKey: ReturnType<typeof vi.fn>;
}

function createMockBridge(): MockBridge {
  return {
    orgResealBatch: vi.fn<ResealBatchFn>().mockResolvedValue([]),
    phoneMatchHash: vi.fn().mockResolvedValue("ab".repeat(64)),
    emailMatchHash: vi.fn().mockResolvedValue("cd".repeat(64)),
    getOrgPublicKey: vi
      .fn()
      .mockResolvedValue("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
  };
}

function asBridge(mock: MockBridge): CryptoBridge {
  return mock as unknown as CryptoBridge;
}

// ── Helpers ────────────────────────────────────────────────────────

function defaultStatus(): {
  currentGeneration: number;
  tables: { table: string; pending: number }[];
  indexTables: { table: string; pending: number }[];
} {
  return {
    currentGeneration: 2,
    tables: [
      { table: "clients", pending: 2 },
      { table: "phones", pending: 1 },
    ],
    indexTables: [
      { table: "clients", pending: 2 },
      { table: "phones", pending: 1 },
      { table: "emails", pending: 0 },
    ],
  };
}

// ── Tests ──────────────────────────────────────────────────────────

describe("org-reseal", () => {
  let resealTables: typeof ResealTablesFn;
  let resealRowsById: typeof ResealRowsByIdFn;
  let reindexViewerTables: typeof ReindexViewerTablesFn;
  let resealBlobTables: typeof ResealBlobTablesFn;
  let resealBrandingClasses: typeof ResealBrandingClassesFn;
  let RED_TIER_TABLES: typeof RedTierTablesConst;
  let TRAILING_TIER_TABLES: typeof TrailingTierTablesConst;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockResealStatus.mockResolvedValue(defaultStatus());
    mockResealRows.mockResolvedValue({ resealed: 0, skipped: 0 });
    mockReindexRows.mockResolvedValue({ reindexed: 0, skipped: 0 });

    // Default: no pending rows (loop terminates immediately)
    mockResealPending.mockResolvedValue({
      currentGeneration: 2,
      rows: [],
    });
    mockReindexPending.mockResolvedValue({
      currentGeneration: 2,
      piiUnmasked: true,
      rows: [],
    });
    mockResealBlobPending.mockResolvedValue({
      currentGeneration: 2,
      rows: [],
    });
    mockResealBlobRow.mockResolvedValue({ success: true });
    mockListFormAssetsForReseal.mockResolvedValue([]);
    mockGetFormAssetBlob.mockResolvedValue({ blob: "" });
    mockReplaceFormAssetBlob.mockResolvedValue({ success: true });

    const mod = await import("./org-reseal.js");
    resealTables = mod.resealTables;
    resealRowsById = mod.resealRowsById;
    reindexViewerTables = mod.reindexViewerTables;
    resealBlobTables = mod.resealBlobTables;
    resealBrandingClasses = mod.resealBrandingClasses;
    RED_TIER_TABLES = mod.RED_TIER_TABLES;
    TRAILING_TIER_TABLES = mod.TRAILING_TIER_TABLES;
  });

  describe("table list constants", () => {
    it("RED_TIER_TABLES excludes branding-key and blob-carrying tables", () => {
      expect(RED_TIER_TABLES).not.toContain("intake_forms");
      expect(RED_TIER_TABLES).not.toContain("intake_form_fields");
      expect(RED_TIER_TABLES).not.toContain("voicemail_quarantine");
      expect(RED_TIER_TABLES).toContain("intake_key_wraps");
      expect(RED_TIER_TABLES).toContain("clients");
      expect(RED_TIER_TABLES).toContain("phones");
    });

    it("TRAILING_TIER_TABLES excludes branding-key, blob-carrying, and red-tier tables", () => {
      expect(TRAILING_TIER_TABLES).not.toContain("intake_forms");
      expect(TRAILING_TIER_TABLES).not.toContain("intake_form_fields");
      expect(TRAILING_TIER_TABLES).not.toContain("voicemail_quarantine");
      expect(TRAILING_TIER_TABLES).not.toContain("kb_attachments");
      expect(TRAILING_TIER_TABLES).not.toContain("clients");
      expect(TRAILING_TIER_TABLES).toContain("queues");
      expect(TRAILING_TIER_TABLES).toContain("org_config");
    });
  });

  describe("resealTables", () => {
    it("reseals two tables with progress callbacks", async () => {
      const bridge = createMockBridge();
      const progressCalls: ResealProgress[] = [];

      // First table: clients, one batch of 2 rows
      mockResealPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [
            { id: "c1", columns: { encrypted_alias: "ct1" } },
            { id: "c2", columns: { encrypted_alias: "ct2" } },
          ],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        })
        // Second table: phones, one batch of 1 row
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [{ id: "p1", columns: { encrypted_number: "ct3" } }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch
        .mockResolvedValueOnce([
          {
            cacheKey: "c1::encrypted_alias",
            resealed: "new-ct1",
            fromGeneration: 1,
            indexHash: "aa".repeat(64),
          },
          {
            cacheKey: "c2::encrypted_alias",
            resealed: "new-ct2",
            fromGeneration: 1,
            indexHash: "bb".repeat(64),
          },
        ])
        .mockResolvedValueOnce([
          {
            cacheKey: "p1::encrypted_number",
            resealed: "new-ct3",
            fromGeneration: 1,
            indexHash: null,
          },
        ]);

      mockResealRows.mockResolvedValue({ resealed: 2, skipped: 0 });
      mockReindexRows.mockResolvedValue({ reindexed: 2, skipped: 0 });

      // onlyIds check for clients alias: both are pending
      mockReindexPending.mockResolvedValueOnce({
        currentGeneration: 2,
        piiUnmasked: true,
        rows: [
          { id: "c1", encryptedAlias: "ct1" },
          { id: "c2", encryptedAlias: "ct2" },
        ],
      });

      const result = await resealTables(
        { bridge: asBridge(bridge) },
        ["clients", "phones"],
        (p) => progressCalls.push({ ...p }),
      );

      // Verify resealRows was called for both tables
      expect(mockResealRows).toHaveBeenCalledTimes(2);

      // Verify reindexRows was called for clients only (no phone index during reseal)
      const reindexCalls = mockReindexRows.mock.calls as Array<
        [{ table: string }]
      >;
      const reindexTables = reindexCalls.map((c) => c[0].table);
      expect(reindexTables).toContain("clients");
      expect(reindexTables).not.toContain("phones");

      // Verify progress was reported
      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[0]?.table).toBe("clients");

      expect(result.resealed).toBeGreaterThan(0);
    });

    it("does not request phone index during reseal", async () => {
      const bridge = createMockBridge();

      mockResealPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [{ id: "p1", columns: { encrypted_number: "ct3" } }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "p1::encrypted_number",
          resealed: "new-ct3",
          fromGeneration: 1,
          indexHash: null,
        },
      ]);

      mockResealRows.mockResolvedValue({ resealed: 1, skipped: 0 });

      await resealTables({ bridge: asBridge(bridge) }, ["phones"]);

      // The worker item should NOT have index: "phone"
      const workerCall = bridge.orgResealBatch.mock.calls[0];
      expect(workerCall?.[0][0]?.index).toBeUndefined();

      // reindexRows should not be called at all for phones
      expect(mockReindexRows).not.toHaveBeenCalled();
    });

    it("submits original ciphertext for already-current columns", async () => {
      const bridge = createMockBridge();

      mockResealPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [{ id: "r1", columns: { encrypted_name: "original-ct" } }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "r1::encrypted_name",
          resealed: null,
          fromGeneration: 2,
          indexHash: null,
        },
      ]);

      mockResealRows.mockResolvedValue({ resealed: 1, skipped: 0 });

      await resealTables({ bridge: asBridge(bridge) }, ["queues"]);

      // The original ciphertext should be submitted, not null
      const call = mockResealRows.mock.calls[0] as [
        { rows: { id: string; columns: Record<string, string> }[] },
      ];
      expect(call[0].rows[0]?.columns.encrypted_name).toBe("original-ct");
    });

    it("skips the whole row when any column is undecryptable", async () => {
      const bridge = createMockBridge();

      mockResealPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [
            {
              id: "r1",
              columns: { col_a: "ct-a", col_b: "ct-b" },
            },
          ],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      // col_a succeeds, col_b fails
      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "r1::col_a",
          resealed: "new-a",
          fromGeneration: 1,
          indexHash: null,
        },
        {
          cacheKey: "r1::col_b",
          resealed: null,
          fromGeneration: null,
          indexHash: null,
        },
      ]);

      const result = await resealTables({ bridge: asBridge(bridge) }, [
        "users",
      ]);

      // resealRows should NOT have been called (no rows to submit)
      expect(mockResealRows).not.toHaveBeenCalled();

      // skipped count is at least 1 (from the batch skip)
      expect(result.skipped).toBe(1);
    });

    it("alias hash flows to reindexRows only for ids pending via onlyIds check", async () => {
      const bridge = createMockBridge();

      mockResealPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [
            { id: "c1", columns: { encrypted_alias: "ct1" } },
            { id: "c2", columns: { encrypted_alias: "ct2" } },
          ],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "c1::encrypted_alias",
          resealed: "new-ct1",
          fromGeneration: 1,
          indexHash: "aa".repeat(64),
        },
        {
          cacheKey: "c2::encrypted_alias",
          resealed: "new-ct2",
          fromGeneration: 1,
          indexHash: "bb".repeat(64),
        },
      ]);

      mockResealRows.mockResolvedValue({ resealed: 2, skipped: 0 });
      mockReindexRows.mockResolvedValue({ reindexed: 1, skipped: 0 });

      // onlyIds check returns only c1 as pending
      mockReindexPending.mockResolvedValueOnce({
        currentGeneration: 2,
        piiUnmasked: true,
        rows: [{ id: "c1", encryptedAlias: "ct1" }],
      });

      await resealTables({ bridge: asBridge(bridge) }, ["clients"]);

      // Verify reindexPending was called with onlyIds
      const reindexPendingCall = mockReindexPending.mock.calls[0] as [
        { onlyIds?: (string | number)[] },
      ];
      expect(reindexPendingCall[0].onlyIds).toEqual(["c1", "c2"]);

      // reindexRows should only have c1, not c2
      const reindexCall = mockReindexRows.mock.calls.find(
        ([arg]) => (arg as { table: string }).table === "clients",
      ) as [{ rows: { id: string; hash: string }[] }] | undefined;

      expect(reindexCall).toBeDefined();
      expect(reindexCall![0].rows).toHaveLength(1);
      expect(reindexCall![0].rows[0]?.id).toBe("c1");
    });

    it("excludes skipped ids from the next fetch so the loop terminates", async () => {
      const bridge = createMockBridge();

      // First batch: 1 undecryptable row
      mockResealPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [{ id: "bad-row", columns: { col: "ct" } }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "bad-row::col",
          resealed: null,
          fromGeneration: null,
          indexHash: null,
        },
      ]);

      await resealTables({ bridge: asBridge(bridge) }, ["queues"]);

      // Second call to resealPending should include "bad-row" in excludeIds
      const secondCall = mockResealPending.mock.calls[1] as [
        { excludeIds: (string | number)[] },
      ];
      expect(secondCall[0].excludeIds).toContain("bad-row");
    });

    it("awaits deps.pace between batches when provided", async () => {
      const bridge = createMockBridge();
      const paceCalls: number[] = [];
      let paceCallCount = 0;

      const pace = vi.fn(async (): Promise<void> => {
        paceCallCount++;
        paceCalls.push(paceCallCount);
      });

      // Two batches for one table: first returns rows, second returns empty
      mockResealPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [{ id: "r1", columns: { encrypted_name: "ct1" } }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [{ id: "r2", columns: { encrypted_name: "ct2" } }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch
        .mockResolvedValueOnce([
          {
            cacheKey: "r1::encrypted_name",
            resealed: "new-ct1",
            fromGeneration: 1,
            indexHash: null,
          },
        ])
        .mockResolvedValueOnce([
          {
            cacheKey: "r2::encrypted_name",
            resealed: "new-ct2",
            fromGeneration: 1,
            indexHash: null,
          },
        ]);

      mockResealRows.mockResolvedValue({ resealed: 1, skipped: 0 });

      await resealTables({ bridge: asBridge(bridge), pace }, ["queues"]);

      // pace should have been called once per batch (2 batches)
      expect(pace).toHaveBeenCalledTimes(2);
    });

    it("stops the loop when skipped ids reach the excludeIds cap", async () => {
      const bridge = createMockBridge();

      // Return one undecryptable row per batch, 501 times would exceed cap.
      // We simulate by making every batch return a skipped row.
      // After EXCLUDE_IDS_CAP (500) skips, the loop should stop.
      let batchCount = 0;
      mockResealPending.mockImplementation(() => {
        batchCount++;
        // Return a unique undecryptable row each time. After 500 skips
        // the loop should stop before calling again.
        if (batchCount <= 501) {
          return Promise.resolve({
            currentGeneration: 2,
            rows: [
              {
                id: `skip-${String(batchCount)}`,
                columns: { col: `ct-${String(batchCount)}` },
              },
            ],
          });
        }
        return Promise.resolve({ currentGeneration: 2, rows: [] });
      });

      bridge.orgResealBatch.mockImplementation(
        (
          items: readonly { cacheKey: string }[],
        ): Promise<
          readonly {
            cacheKey: string;
            resealed: null;
            fromGeneration: null;
            indexHash: null;
          }[]
        > =>
          Promise.resolve(
            items.map((item) => ({
              cacheKey: item.cacheKey,
              resealed: null as null,
              fromGeneration: null as null,
              indexHash: null as null,
            })),
          ),
      );

      const result = await resealTables({ bridge: asBridge(bridge) }, [
        "queues",
      ]);

      // Should have stopped at 500 skips (the 500th skip fills the cap,
      // then the loop checks before the next fetch)
      expect(result.skipped).toBe(500);
      // resealPending should have been called exactly 500 times (not 501)
      expect(mockResealPending).toHaveBeenCalledTimes(500);
    });
  });

  describe("reindexViewerTables", () => {
    it("leaves phones/emails pending when piiUnmasked is false", async () => {
      const bridge = createMockBridge();

      mockReindexPending.mockResolvedValue({
        currentGeneration: 2,
        piiUnmasked: false,
        rows: [{ id: "p1", plaintext: "+15551234567" }],
      });

      const result = await reindexViewerTables({ bridge: asBridge(bridge) });

      // No reindexRows calls should have been made
      expect(mockReindexRows).not.toHaveBeenCalled();

      // Both phones and emails should be flagged as pending
      expect(result.indexPendingTables).toContain("phones");
      expect(result.indexPendingTables).toContain("emails");
      expect(result.reindexed).toBe(0);
    });

    it("hashes phones via bridge.phoneMatchHash when piiUnmasked is true", async () => {
      const bridge = createMockBridge();
      bridge.phoneMatchHash.mockResolvedValue("dd".repeat(64));

      mockReindexPending
        // phones
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [{ id: "p1", plaintext: "+15551234567" }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        })
        // emails (empty)
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        })
        // clients (empty)
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        });

      mockReindexRows.mockResolvedValue({ reindexed: 1, skipped: 0 });

      const result = await reindexViewerTables({ bridge: asBridge(bridge) });

      expect(bridge.phoneMatchHash).toHaveBeenCalledWith("+15551234567");
      expect(mockReindexRows).toHaveBeenCalledWith(
        expect.objectContaining({
          table: "phones",
          rows: [{ id: "p1", hash: "dd".repeat(64) }],
        }),
      );
      expect(result.reindexed).toBe(1);
      expect(result.indexPendingTables).toHaveLength(0);
    });

    it("skips rows with null plaintext", async () => {
      const bridge = createMockBridge();

      mockReindexPending
        // phones: one row with null plaintext
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [{ id: "p1", plaintext: null }],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        })
        // emails (empty)
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        })
        // clients (empty)
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        });

      await reindexViewerTables({ bridge: asBridge(bridge) });

      // phoneMatchHash should not be called for null plaintext
      expect(bridge.phoneMatchHash).not.toHaveBeenCalled();
      // reindexRows should not be called (no valid hashes)
      expect(mockReindexRows).not.toHaveBeenCalled();
    });

    it("batches clients alias reindex in one orgResealBatch call per fetch", async () => {
      const bridge = createMockBridge();

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "reindex::c1::alias",
          resealed: null,
          fromGeneration: 2,
          indexHash: "aa".repeat(64),
        },
        {
          cacheKey: "reindex::c2::alias",
          resealed: null,
          fromGeneration: 2,
          indexHash: "bb".repeat(64),
        },
      ]);

      mockReindexPending
        // phones (empty)
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        })
        // emails (empty)
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        })
        // clients: 2 rows in one batch
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [
            { id: "c1", encryptedAlias: "ct1" },
            { id: "c2", encryptedAlias: "ct2" },
          ],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          piiUnmasked: true,
          rows: [],
        });

      mockReindexRows.mockResolvedValue({ reindexed: 2, skipped: 0 });

      await reindexViewerTables({ bridge: asBridge(bridge) });

      // Should have made exactly one orgResealBatch call with 2 items
      expect(bridge.orgResealBatch).toHaveBeenCalledTimes(1);
      const workerCall = bridge.orgResealBatch.mock.calls[0];
      expect(workerCall?.[0]).toHaveLength(2);
      expect(workerCall?.[0][0]?.index).toBe("alias");
      expect(workerCall?.[0][1]?.index).toBe("alias");

      // reindexRows should have both rows
      expect(mockReindexRows).toHaveBeenCalledWith(
        expect.objectContaining({
          table: "clients",
          rows: expect.arrayContaining([
            { id: "c1", hash: "aa".repeat(64) },
            { id: "c2", hash: "bb".repeat(64) },
          ]),
        }),
      );
    });

    it("stops reindex loop when skipped ids reach the cap and flags table as pending", async () => {
      const bridge = createMockBridge();
      bridge.phoneMatchHash.mockResolvedValue(null);

      // Every phone row normalizes to null, so every row is skipped.
      // With batches of 40, it takes 13 batches to reach 500 skips (12*40=480, 13th adds 20).
      let phoneCallCount = 0;
      mockReindexPending.mockImplementation(
        (input: {
          table: string;
        }): Promise<{
          currentGeneration: number;
          piiUnmasked: boolean;
          rows: { id: string; plaintext: string }[];
        }> => {
          if (input.table !== "phones") {
            return Promise.resolve({
              currentGeneration: 2,
              piiUnmasked: true,
              rows: [],
            });
          }
          phoneCallCount++;
          // Return 40 rows each time until cap would be exceeded
          if (phoneCallCount <= 15) {
            const rows = Array.from({ length: 40 }, (_, i) => ({
              id: `p-${String(phoneCallCount)}-${String(i)}`,
              plaintext: `+1${String(phoneCallCount)}${String(i)}`,
            }));
            return Promise.resolve({
              currentGeneration: 2,
              piiUnmasked: true,
              rows,
            });
          }
          return Promise.resolve({
            currentGeneration: 2,
            piiUnmasked: true,
            rows: [],
          });
        },
      );

      const result = await reindexViewerTables({ bridge: asBridge(bridge) });

      // After 12 batches of 40 = 480, the 13th batch adds 40 more skips
      // but the cap check fires at 500, so the 13th batch (which would
      // push to 520) runs, then the loop stops before the 14th fetch.
      // Actually: each batch of 40 null-hash rows produces 40 skips.
      // After batch 12: 480 skips. Batch 13 starts (480 < 500), produces
      // 40 more skips (520 total). Then the cap check fires (520 >= 500)
      // and the loop stops.
      expect(result.indexPendingTables).toContain("phones");
    });
  });

  describe("resealBlobTables", () => {
    it("reseals a voicemail_quarantine row with blob and columns atomically", async () => {
      const bridge = createMockBridge();

      mockResealBlobPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [
            {
              id: "vq1",
              columns: { encrypted_caller_number: "ct-caller" },
              blob: "sealed-audio-blob",
            },
          ],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "vq1::__blob__",
          resealed: "new-sealed-audio",
          fromGeneration: 1,
          indexHash: null,
        },
        {
          cacheKey: "vq1::encrypted_caller_number",
          resealed: "new-ct-caller",
          fromGeneration: 1,
          indexHash: null,
        },
      ]);

      const result = await resealBlobTables({ bridge: asBridge(bridge) });

      expect(mockResealBlobRow).toHaveBeenCalledTimes(1);
      const call = mockResealBlobRow.mock.calls[0] as [
        {
          table: string;
          id: string;
          blob: string;
          columns: Record<string, string>;
        },
      ];
      expect(call[0].table).toBe("voicemail_quarantine");
      expect(call[0].id).toBe("vq1");
      expect(call[0].blob).toBe("new-sealed-audio");
      expect(call[0].columns.encrypted_caller_number).toBe("new-ct-caller");

      expect(result.resealed).toBe(1);
      expect(result.skipped).toBe(0);
    });

    it("skips the whole row when the blob is undecryptable", async () => {
      const bridge = createMockBridge();

      mockResealBlobPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [
            {
              id: "vq1",
              columns: { encrypted_caller_number: "ct-caller" },
              blob: "bad-blob",
            },
          ],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "vq1::__blob__",
          resealed: null,
          fromGeneration: null,
          indexHash: null,
        },
        {
          cacheKey: "vq1::encrypted_caller_number",
          resealed: "new-ct-caller",
          fromGeneration: 1,
          indexHash: null,
        },
      ]);

      const result = await resealBlobTables({ bridge: asBridge(bridge) });

      expect(mockResealBlobRow).not.toHaveBeenCalled();
      expect(result.resealed).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it("submits original blob for already-current rows", async () => {
      const bridge = createMockBridge();

      mockResealBlobPending
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [
            {
              id: "ka1",
              columns: {},
              blob: "original-blob",
            },
          ],
        })
        .mockResolvedValueOnce({
          currentGeneration: 2,
          rows: [],
        });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "ka1::__blob__",
          resealed: null,
          fromGeneration: 2,
          indexHash: null,
        },
      ]);

      await resealBlobTables({ bridge: asBridge(bridge) });

      const call = mockResealBlobRow.mock.calls[0] as [{ blob: string }];
      expect(call[0].blob).toBe("original-blob");
    });

    it("iterates both blob tables", async () => {
      const bridge = createMockBridge();

      // voicemail_quarantine: empty
      // kb_attachments: empty
      mockResealBlobPending.mockResolvedValue({
        currentGeneration: 2,
        rows: [],
      });

      await resealBlobTables({ bridge: asBridge(bridge) });

      // Should have been called at least twice (once per table)
      expect(mockResealBlobPending).toHaveBeenCalledTimes(2);

      const tables = (
        mockResealBlobPending.mock.calls as [{ table: string }][]
      ).map((c) => c[0].table);
      expect(tables).toContain("voicemail_quarantine");
      expect(tables).toContain("kb_attachments");
    });
  });

  describe("resealBrandingClasses", () => {
    it("returns zero counts when no org public key is available", async () => {
      const bridge = createMockBridge();
      bridge.getOrgPublicKey.mockRejectedValue(new Error("no key"));

      const result = await resealBrandingClasses({ bridge: asBridge(bridge) });

      expect(result.resealed).toBe(0);
      expect(result.skipped).toBe(0);
    });

    it("walks generation keys via bridge.getOrgPublicKey and fetches branding tables", async () => {
      const bridge = createMockBridge();

      bridge.getOrgPublicKey
        .mockResolvedValueOnce("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") // gen 2
        .mockResolvedValueOnce("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB") // gen 1
        .mockRejectedValue(new Error("no key")); // gen 0

      // No pending rows for branding tables
      mockResealPending.mockResolvedValue({
        currentGeneration: 2,
        rows: [],
      });

      mockListFormAssetsForReseal.mockResolvedValue([]);

      // Branding crypto uses libsodium, which is not available in the
      // unit test environment. The function will succeed structurally
      // (no pending rows to decrypt) and we verify the key walk and
      // tRPC call pattern.
      const result = await resealBrandingClasses({ bridge: asBridge(bridge) });

      // getOrgPublicKey called for gen 2 and gen 1 (gen 0 throws, stopping the walk)
      expect(bridge.getOrgPublicKey).toHaveBeenCalledWith(2);
      expect(bridge.getOrgPublicKey).toHaveBeenCalledWith(1);

      // resealPending called for both branding tables
      const tables = (
        mockResealPending.mock.calls as [{ table: string }][]
      ).map((c) => c[0].table);
      expect(tables).toContain("intake_forms");
      expect(tables).toContain("intake_form_fields");

      // No rows to process, so zero counts
      expect(result.resealed).toBe(0);
      expect(result.skipped).toBe(0);
    });

    it("fetches form assets list and blob for re-encryption", async () => {
      const bridge = createMockBridge();

      bridge.getOrgPublicKey
        .mockResolvedValueOnce("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        .mockResolvedValueOnce("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
        .mockRejectedValue(new Error("no key"));

      // No pending branding table rows
      mockResealPending.mockResolvedValue({
        currentGeneration: 2,
        rows: [],
      });

      // One form asset exists
      mockListFormAssetsForReseal.mockResolvedValue([
        { blobId: "fa-1", contentType: "image/png" },
      ]);

      mockGetFormAssetBlob.mockResolvedValue({ blob: "encrypted-png-data" });

      // The decrypt call will fail (no libsodium), so the asset is skipped
      const result = await resealBrandingClasses({ bridge: asBridge(bridge) });

      expect(mockListFormAssetsForReseal).toHaveBeenCalledTimes(1);
      expect(mockGetFormAssetBlob).toHaveBeenCalledWith({ blobId: "fa-1" });

      // Asset skipped because branding crypto fails without libsodium
      expect(result.skipped).toBe(1);
    });
  });

  describe("resealRowsById", () => {
    it("passes onlyIds to resealPending and processes rows identically", async () => {
      const bridge = createMockBridge();

      mockResealPending.mockResolvedValueOnce({
        currentGeneration: 2,
        rows: [
          { id: "r1", columns: { encrypted_name: "ct1" } },
          { id: "r2", columns: { encrypted_name: "ct2" } },
        ],
      });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "r1::encrypted_name",
          resealed: "new-ct1",
          fromGeneration: 1,
          indexHash: null,
        },
        {
          cacheKey: "r2::encrypted_name",
          resealed: "new-ct2",
          fromGeneration: 1,
          indexHash: null,
        },
      ]);

      mockResealRows.mockResolvedValue({ resealed: 2, skipped: 0 });

      const result = await resealRowsById(
        { bridge: asBridge(bridge) },
        "queues",
        ["r1", "r2"],
      );

      expect(result.resealed).toBe(2);
      expect(result.skipped).toBe(0);

      // Verify onlyIds was passed to resealPending
      const call = mockResealPending.mock.calls[0] as [
        { table: string; onlyIds: (string | number)[] },
      ];
      expect(call[0].onlyIds).toEqual(["r1", "r2"]);
      expect(call[0].table).toBe("queues");
    });

    it("chunks ids over 40 into multiple fetches", async () => {
      const bridge = createMockBridge();
      const pace = vi.fn((): Promise<void> => Promise.resolve());

      // Build 60 ids (chunks: 40, 20)
      const ids = Array.from({ length: 60 }, (_, i) => `id-${String(i)}`);

      // First chunk (40 ids): no rows returned
      mockResealPending
        .mockResolvedValueOnce({ currentGeneration: 2, rows: [] })
        .mockResolvedValueOnce({ currentGeneration: 2, rows: [] });

      await resealRowsById({ bridge: asBridge(bridge), pace }, "queues", ids);

      // Should have called resealPending twice (two chunks)
      expect(mockResealPending).toHaveBeenCalledTimes(2);

      const firstCall = mockResealPending.mock.calls[0] as [
        { onlyIds: (string | number)[] },
      ];
      const secondCall = mockResealPending.mock.calls[1] as [
        { onlyIds: (string | number)[] },
      ];
      expect(firstCall[0].onlyIds).toHaveLength(40);
      expect(secondCall[0].onlyIds).toHaveLength(20);

      // pace called between chunks
      expect(pace).toHaveBeenCalledTimes(2);
    });

    it("handles rows already resealed elsewhere (empty response)", async () => {
      const bridge = createMockBridge();

      mockResealPending.mockResolvedValueOnce({
        currentGeneration: 2,
        rows: [],
      });

      const result = await resealRowsById(
        { bridge: asBridge(bridge) },
        "kb_items",
        ["gone-1", "gone-2"],
      );

      expect(result.resealed).toBe(0);
      expect(result.skipped).toBe(0);
      expect(mockResealRows).not.toHaveBeenCalled();
    });

    it("skips undecryptable rows identically to resealTables", async () => {
      const bridge = createMockBridge();

      mockResealPending.mockResolvedValueOnce({
        currentGeneration: 2,
        rows: [{ id: "bad-1", columns: { col: "ct" } }],
      });

      bridge.orgResealBatch.mockResolvedValueOnce([
        {
          cacheKey: "bad-1::col",
          resealed: null,
          fromGeneration: null,
          indexHash: null,
        },
      ]);

      const result = await resealRowsById(
        { bridge: asBridge(bridge) },
        "queues",
        ["bad-1"],
      );

      expect(result.skipped).toBe(1);
      expect(result.resealed).toBe(0);
    });
  });
});
