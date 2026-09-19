/**
 * Tests for the trailing-tier reseal sweep store.
 *
 * Mocks the tRPC client and the reseal engine functions to verify
 * idempotency, auto-resume gating, error capture, and the
 * checkAndResume threshold.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as ResealNS from "./org-reseal.js";
import type * as SweepNS from "./reseal-sweep.svelte.js";

// ── tRPC mock ─────────────────────────────────────────────────────

const mockResealStatus = vi.fn();

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    keys: {
      resealStatus: { query: mockResealStatus },
    },
  },
}));

// ── Engine mocks ──────────────────────────────────────────────────

const mockResealTables = vi
  .fn()
  .mockResolvedValue({ resealed: 0, skipped: 0, reindexed: 0 });
const mockResealBlobTables = vi
  .fn()
  .mockResolvedValue({ resealed: 0, skipped: 0 });
const mockResealBrandingClasses = vi
  .fn()
  .mockResolvedValue({ resealed: 0, skipped: 0 });
const mockReindexViewerTables = vi
  .fn()
  .mockResolvedValue({ reindexed: 0, indexPendingTables: [] });

vi.mock("./org-reseal.js", async (importOriginal) => {
  const real = await importOriginal<typeof ResealNS>();
  return {
    ...real,
    resealTables: mockResealTables,
    resealBlobTables: mockResealBlobTables,
    resealBrandingClasses: mockResealBrandingClasses,
    reindexViewerTables: mockReindexViewerTables,
  };
});

// ── Bridge mock ───────────────────────────────────────────────────

function createMockBridge(): CryptoBridge {
  return {} as unknown as CryptoBridge;
}

// ── Helpers ───────────────────────────────────────────────────────

function statusWithPending(
  tablesPending: number,
  indexPending: number,
): {
  currentGeneration: number;
  tables: { table: string; pending: number }[];
  indexTables: { table: string; pending: number }[];
} {
  return {
    currentGeneration: 2,
    tables: [{ table: "queues", pending: tablesPending }],
    indexTables: [{ table: "phones", pending: indexPending }],
  };
}

// ── Tests ─────────────────────────────────────────────────────────

describe("resealSweep", () => {
  let resealSweep: (typeof SweepNS)["resealSweep"];

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockResealStatus.mockResolvedValue(statusWithPending(0, 0));
    mockResealTables.mockResolvedValue({
      resealed: 0,
      skipped: 0,
      reindexed: 0,
    });
    mockResealBlobTables.mockResolvedValue({ resealed: 0, skipped: 0 });
    mockResealBrandingClasses.mockResolvedValue({ resealed: 0, skipped: 0 });
    mockReindexViewerTables.mockResolvedValue({
      reindexed: 0,
      indexPendingTables: [],
    });

    const mod = await import("./reseal-sweep.svelte.js");
    resealSweep = mod.resealSweep;
  });

  it("start is idempotent while running", async () => {
    const bridge = createMockBridge();

    // Make the first engine call hang so the sweep stays "running"
    let resolveHang: (() => void) | undefined;
    mockResealTables.mockImplementationOnce(
      () =>
        new Promise<{ resealed: number; skipped: number; reindexed: number }>(
          (resolve) => {
            resolveHang = () => {
              resolve({ resealed: 0, skipped: 0, reindexed: 0 });
            };
          },
        ),
    );

    mockResealStatus.mockResolvedValue(statusWithPending(5, 0));

    const p1 = resealSweep.start(bridge);

    // While the first start is in progress, a second start returns immediately
    const p2 = resealSweep.start(bridge);

    expect(resealSweep.running).toBe(true);

    // start awaits the status query before calling the engine, so the
    // hang promise's executor has not run yet at this point. Wait for
    // the engine call before resolving.
    await vi.waitFor(() => {
      expect(mockResealTables).toHaveBeenCalled();
    });
    resolveHang!();
    await p1;
    await p2;

    // resealTables should have been called only once (second start was a no-op)
    expect(mockResealTables).toHaveBeenCalledTimes(1);
  });

  it("checkAndResume starts only when summed pending > 0", async () => {
    const bridge = createMockBridge();

    // No pending items
    mockResealStatus.mockResolvedValue(statusWithPending(0, 0));

    await resealSweep.checkAndResume(bridge);

    // Engine functions should not be called
    expect(mockResealTables).not.toHaveBeenCalled();
    expect(resealSweep.pendingTotal).toBe(0);
  });

  it("checkAndResume starts when pending > 0", async () => {
    const bridge = createMockBridge();

    // First call (from checkAndResume): pending > 0
    // Second call (from start, initial status): same
    // Third call (from start, final status): 0
    mockResealStatus
      .mockResolvedValueOnce(statusWithPending(3, 2))
      .mockResolvedValueOnce(statusWithPending(3, 2))
      .mockResolvedValueOnce(statusWithPending(0, 0));

    await resealSweep.checkAndResume(bridge);

    expect(mockResealTables).toHaveBeenCalledTimes(1);
    expect(resealSweep.pendingTotal).toBe(0);
  });

  it("autoResumeOnce fires the status query at most once per session", async () => {
    const bridge = createMockBridge();

    mockResealStatus.mockResolvedValue(statusWithPending(0, 0));

    await resealSweep.autoResumeOnce(bridge);
    await resealSweep.autoResumeOnce(bridge);
    await resealSweep.autoResumeOnce(bridge);

    // resealStatus queried once (from the first autoResumeOnce -> checkAndResume)
    expect(mockResealStatus).toHaveBeenCalledTimes(1);
  });

  it("sets lastError without throwing when a pass rejects", async () => {
    const bridge = createMockBridge();

    mockResealStatus.mockResolvedValue(statusWithPending(5, 0));
    mockResealTables.mockRejectedValueOnce(new Error("network timeout"));

    // Should not throw
    await resealSweep.start(bridge);

    expect(resealSweep.running).toBe(false);
    expect(resealSweep.lastError).toBe("network timeout");
  });
});
