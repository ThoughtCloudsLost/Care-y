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
const mockResealRowsById = vi
  .fn()
  .mockResolvedValue({ resealed: 0, skipped: 0, reindexed: 0 });

vi.mock("./org-reseal.js", async (importOriginal) => {
  const real = await importOriginal<typeof ResealNS>();
  return {
    ...real,
    resealTables: mockResealTables,
    resealBlobTables: mockResealBlobTables,
    resealBrandingClasses: mockResealBrandingClasses,
    reindexViewerTables: mockReindexViewerTables,
    resealRowsById: mockResealRowsById,
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
    mockResealRowsById.mockResolvedValue({
      resealed: 0,
      skipped: 0,
      reindexed: 0,
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

  it("resumes after a mid-sweep failure and converges to zero", async () => {
    const bridge = createMockBridge();

    // First pass: engine rejects mid-way, leaving pending work behind
    mockResealStatus.mockResolvedValue(statusWithPending(5, 0));
    mockResealTables.mockRejectedValueOnce(new Error("mid-sweep crash"));

    await resealSweep.start(bridge);

    expect(resealSweep.running).toBe(false);
    expect(resealSweep.lastError).toBe("mid-sweep crash");
    // pendingTotal keeps its last-known value on failure; the crashed
    // run never completed a status round trip, so it is still null.
    expect(resealSweep.pendingTotal).toBeNull();

    // Simulate next login: vi.resetModules + re-import (fresh singleton)
    vi.resetModules();

    // Re-apply mocks: engine now succeeds, status reports zero after the run
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

    // checkAndResume queries status first (pending > 0), then start queries
    // it again internally, then a final status after the run shows zero.
    mockResealStatus
      .mockResolvedValueOnce(statusWithPending(3, 0))
      .mockResolvedValueOnce(statusWithPending(3, 0))
      .mockResolvedValueOnce(statusWithPending(0, 0));

    const mod2 = await import("./reseal-sweep.svelte.js");
    const freshSweep = mod2.resealSweep;

    await freshSweep.checkAndResume(bridge);

    // The engine ran on the fresh singleton
    expect(mockResealTables).toHaveBeenCalled();
    expect(freshSweep.pendingTotal).toBe(0);
  });

  describe("reportStaleReads", () => {
    it("drops reports with generation >= currentGeneration", async () => {
      const bridge = createMockBridge();

      // Prime the currentGeneration by running checkAndResume
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));
      await resealSweep.checkAndResume(bridge);

      // currentGeneration is 2; report generation 2 and 3 (should be dropped)
      resealSweep.reportStaleReads(bridge, [
        { origin: { table: "queues", id: "q1" }, generation: 2 },
        { origin: { table: "queues", id: "q2" }, generation: 3 },
      ]);

      // Allow any microtasks to settle
      await vi.waitFor(() => {
        expect(mockResealRowsById).not.toHaveBeenCalled();
      });
    });

    it("drains stale reports via resealRowsById grouped by table", async () => {
      const bridge = createMockBridge();

      // Prime generation
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));
      await resealSweep.checkAndResume(bridge);
      mockResealStatus.mockClear();
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));

      mockResealRowsById.mockResolvedValue({
        resealed: 1,
        skipped: 0,
        reindexed: 0,
      });

      // Report stale reads (generation 1 < currentGeneration 2)
      resealSweep.reportStaleReads(bridge, [
        { origin: { table: "queues", id: "q1" }, generation: 1 },
        { origin: { table: "kb_items", id: "kb1" }, generation: 1 },
      ]);

      // Wait for drain to call resealRowsById
      await vi.waitFor(() => {
        expect(mockResealRowsById).toHaveBeenCalled();
      });

      // Both tables should have been drained (possibly in separate calls)
      const tables = mockResealRowsById.mock.calls.map(
        (call) => (call as [unknown, string])[1],
      );
      expect(tables).toContain("queues");
      expect(tables).toContain("kb_items");
    });

    it("deduplicates rows by table::id", async () => {
      const bridge = createMockBridge();

      // Prime generation
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));
      await resealSweep.checkAndResume(bridge);
      mockResealStatus.mockClear();
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));

      mockResealRowsById.mockResolvedValue({
        resealed: 1,
        skipped: 0,
        reindexed: 0,
      });

      // Report the same origin twice
      resealSweep.reportStaleReads(bridge, [
        { origin: { table: "queues", id: "q1" }, generation: 1 },
        { origin: { table: "queues", id: "q1" }, generation: 1 },
      ]);

      await vi.waitFor(() => {
        expect(mockResealRowsById).toHaveBeenCalled();
      });

      // resealRowsById should receive only one id
      const call = mockResealRowsById.mock.calls[0] as [
        unknown,
        string,
        (string | number)[],
      ];
      expect(call[2]).toEqual(["q1"]);
    });

    it("defers drain while running (full sweep active)", async () => {
      const bridge = createMockBridge();

      // Make the sweep hang
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

      const startPromise = resealSweep.start(bridge);

      await vi.waitFor(() => {
        expect(mockResealTables).toHaveBeenCalled();
      });

      // While running, report a stale read
      resealSweep.reportStaleReads(bridge, [
        { origin: { table: "queues", id: "q-deferred" }, generation: 1 },
      ]);

      // resealRowsById should NOT have been called while running
      expect(mockResealRowsById).not.toHaveBeenCalled();

      // Release the sweep
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));
      resolveHang!();
      await startPromise;

      // After sweep ends, the deferred queue should drain
      await vi.waitFor(() => {
        expect(mockResealRowsById).toHaveBeenCalled();
      });

      const call = mockResealRowsById.mock.calls[0] as [
        unknown,
        string,
        (string | number)[],
      ];
      expect(call[2]).toContain("q-deferred");
    });

    it("records errors quietly without rejecting", async () => {
      const bridge = createMockBridge();

      // Prime generation
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));
      await resealSweep.checkAndResume(bridge);
      mockResealStatus.mockClear();
      mockResealStatus.mockResolvedValue(statusWithPending(0, 0));

      mockResealRowsById.mockRejectedValueOnce(new Error("drain failure"));

      resealSweep.reportStaleReads(bridge, [
        { origin: { table: "queues", id: "q-err" }, generation: 1 },
      ]);

      await vi.waitFor(() => {
        expect(resealSweep.lastError).toBe("drain failure");
      });

      // Should not have thrown
      expect(resealSweep.running).toBe(false);
    });
  });
});
