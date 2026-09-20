/**
 * Trailing-tier convergence sweep (ADR-107).
 *
 * Drives the background re-encryption of non-PII org config tables at
 * idle priority after the red-tier inline pass completes. Correctness
 * never depends on this sweep finishing: the generation chain keeps
 * everything readable regardless. Failures stop quietly, and the next
 * MANAGE_KEYS login resumes where it left off.
 */

import {
  resealTables,
  resealBlobTables,
  resealBrandingClasses,
  reindexViewerTables,
  resealRowsById,
  TRAILING_TIER_TABLES,
  type ResealProgress,
} from "./org-reseal.js";
import { SvelteMap } from "svelte/reactivity";
import { trpc } from "$lib/trpc/index.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { ResealOrigin } from "./org-decrypt-cache.js";
import type { ResealTableName } from "@care-y/shared";

// ── Idle pacer ────────────────────────────────────────────────────
// iOS Safari has no requestIdleCallback; fall back to setTimeout.

async function idlePace(): Promise<void> {
  await new Promise<void>((resolve) => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => resolve());
    } else {
      setTimeout(resolve, 200);
    }
  });
}

// ── Singleton state ───────────────────────────────────────────────

let _running = $state(false);
let _done = $state(0);
let _total = $state(0);
let _lastError = $state<string | null>(null);
let _pendingTotal = $state<number | null>(null);
let _currentGeneration = $state<number | null>(null);
let _checkedThisSession = false;

// Write-back queue for stale reads reported by OrgDecryptCache
const _writeBackQueue = new SvelteMap<string, ResealOrigin>();
let _draining = false;

// Single-flight guard for the lazy resealStatus fetch inside reportStaleReads
let _lazyStatusPromise: Promise<void> | null = null;

const DRAIN_BATCH_LIMIT = 100;

// ── Helpers ───────────────────────────────────────────────────────

interface ResealStatusResult {
  currentGeneration: number;
  tables: readonly { pending: number }[];
  indexTables: readonly { pending: number }[];
}

function sumPending(status: ResealStatusResult): number {
  let sum = 0;
  for (const t of status.tables) sum += t.pending;
  for (const t of status.indexTables) sum += t.pending;
  return sum;
}

/** Record generation from every resealStatus response. */
function recordGeneration(status: ResealStatusResult): void {
  _currentGeneration = status.currentGeneration;
}

// ── Public API ────────────────────────────────────────────────────

async function start(bridge: CryptoBridge): Promise<void> {
  if (_running) return;

  _running = true;
  _done = 0;
  _total = 0;
  _lastError = null;

  try {
    const status = await trpc.keys.resealStatus.query();
    recordGeneration(status);
    _total = sumPending(status);

    // Per-table completed map so independent table/phase reports
    // aggregate honestly (each table reports from 0).
    const completed = new SvelteMap<string, number>();

    function onProgress(p: ResealProgress): void {
      completed.set(p.table, p.done);
      let sum = 0;
      for (const v of completed.values()) sum += v;
      _done = Math.min(sum, _total);
    }

    const deps = { bridge, pace: idlePace };

    await resealTables(deps, TRAILING_TIER_TABLES, onProgress);
    await resealBlobTables(deps, onProgress);
    await resealBrandingClasses(deps, onProgress);
    await reindexViewerTables(deps, onProgress);

    // Re-query to report remaining items
    const final = await trpc.keys.resealStatus.query();
    recordGeneration(final);
    _pendingTotal = sumPending(final);
  } catch (err: unknown) {
    _lastError = err instanceof Error ? err.message : String(err);
    // pendingTotal stays at last known value
  } finally {
    _running = false;
    // The full sweep may have finished while write-back reports accumulated.
    // Schedule a drain so those rows still get resealed.
    if (_writeBackQueue.size > 0) {
      void drainWriteBackQueue(bridge);
    }
  }
}

async function checkAndResume(bridge: CryptoBridge): Promise<void> {
  if (_running) return;

  // Callers fire-and-forget this from effects and the rotation flow, so
  // a failed status query must record quietly, never reject unhandled.
  try {
    const status = await trpc.keys.resealStatus.query();
    recordGeneration(status);
    _pendingTotal = sumPending(status);
  } catch (err: unknown) {
    _lastError = err instanceof Error ? err.message : String(err);
    return;
  }
  if (_pendingTotal > 0) {
    await start(bridge);
  }
}

async function autoResumeOnce(bridge: CryptoBridge): Promise<void> {
  if (_checkedThisSession) return;
  _checkedThisSession = true;
  await checkAndResume(bridge);
}

// ── Write-back: stale-read targeted reseal ───────────────────────

/**
 * Accept stale-read reports from OrgDecryptCache and queue rows for
 * targeted reseal. Fire-and-forget safe: never rejects, never blocks
 * the caller, errors are recorded in _lastError.
 */
function reportStaleReads(
  bridge: CryptoBridge,
  reports: readonly { origin: ResealOrigin; generation: number }[],
): void {
  if (reports.length === 0) return;

  // If we do not know the current generation yet, fetch it lazily.
  if (_currentGeneration === null) {
    _lazyStatusPromise ??= trpc.keys.resealStatus
      .query()
      .then((status: ResealStatusResult) => {
        recordGeneration(status);
        _pendingTotal = sumPending(status);
      })
      .catch((err: unknown) => {
        _lastError = err instanceof Error ? err.message : String(err);
      })
      .finally(() => {
        _lazyStatusPromise = null;
      });
    // Drop these reports; the caller will re-report on the next read
    // once the generation is known.
    return;
  }

  const currentGen = _currentGeneration;
  let added = false;

  for (const report of reports) {
    if (report.generation >= currentGen) continue;
    const key = `${report.origin.table}::${String(report.origin.id)}`;
    if (!_writeBackQueue.has(key)) {
      _writeBackQueue.set(key, report.origin);
      added = true;
    }
  }

  if (added) {
    void scheduleDrain(bridge);
  }
}

async function scheduleDrain(bridge: CryptoBridge): Promise<void> {
  if (_running || _draining) return;
  await drainWriteBackQueue(bridge);
}

async function drainWriteBackQueue(bridge: CryptoBridge): Promise<void> {
  if (_draining || _running) return;
  _draining = true;

  try {
    while (_writeBackQueue.size > 0) {
      // Group queued origins by table, take up to DRAIN_BATCH_LIMIT ids
      // for one table per iteration.
      const byTable = new SvelteMap<ResealTableName, (string | number)[]>();
      const keysToDelete: string[] = [];

      for (const [key, origin] of _writeBackQueue) {
        let arr = byTable.get(origin.table);
        if (arr == null) {
          arr = [];
          byTable.set(origin.table, arr);
        }
        if (arr.length < DRAIN_BATCH_LIMIT) {
          arr.push(origin.id);
          keysToDelete.push(key);
        }
      }

      // Pick the first table that has ids
      let chosenTable: ResealTableName | null = null;
      let chosenIds: (string | number)[] = [];

      for (const [table, ids] of byTable) {
        chosenTable = table;
        chosenIds = ids;
        break;
      }

      if (chosenTable === null || chosenIds.length === 0) break;

      // Remove chosen entries from queue before the async call so
      // concurrent reports do not lose them.
      for (const key of keysToDelete) {
        const origin = _writeBackQueue.get(key);
        if (origin?.table === chosenTable) {
          _writeBackQueue.delete(key);
        }
      }

      await resealRowsById({ bridge, pace: idlePace }, chosenTable, chosenIds);
    }

    // Refresh status after draining so _pendingTotal and _currentGeneration
    // reflect the resealed rows.
    try {
      const status = await trpc.keys.resealStatus.query();
      recordGeneration(status);
      _pendingTotal = sumPending(status);
    } catch {
      // Non-fatal: status will refresh on next sweep or login.
    }
  } catch (err: unknown) {
    _lastError = err instanceof Error ? err.message : String(err);
    // Remaining queue items stay for the sweep or next login.
  } finally {
    _draining = false;
  }
}

// ── Store factory ────────────────────────────────────────────────

function createResealSweepStore(): {
  start(bridge: CryptoBridge): Promise<void>;
  checkAndResume(bridge: CryptoBridge): Promise<void>;
  autoResumeOnce(bridge: CryptoBridge): Promise<void>;
  reportStaleReads(
    bridge: CryptoBridge,
    reports: readonly { origin: ResealOrigin; generation: number }[],
  ): void;
  readonly running: boolean;
  readonly done: number;
  readonly total: number;
  readonly pendingTotal: number | null;
  readonly lastError: string | null;
} {
  return {
    start,
    checkAndResume,
    autoResumeOnce,
    reportStaleReads,

    get running(): boolean {
      return _running;
    },
    get done(): number {
      return _done;
    },
    get total(): number {
      return _total;
    },
    get pendingTotal(): number | null {
      return _pendingTotal;
    },
    get lastError(): string | null {
      return _lastError;
    },
  };
}

export const resealSweep = createResealSweepStore();
