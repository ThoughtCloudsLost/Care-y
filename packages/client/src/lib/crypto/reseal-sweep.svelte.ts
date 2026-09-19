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
  TRAILING_TIER_TABLES,
  type ResealProgress,
} from "./org-reseal.js";
import { SvelteMap } from "svelte/reactivity";
import { trpc } from "$lib/trpc/index.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

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
let _checkedThisSession = false;

// ── Helpers ───────────────────────────────────────────────────────

function sumPending(status: {
  tables: readonly { pending: number }[];
  indexTables: readonly { pending: number }[];
}): number {
  let sum = 0;
  for (const t of status.tables) sum += t.pending;
  for (const t of status.indexTables) sum += t.pending;
  return sum;
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
    _pendingTotal = sumPending(final);
  } catch (err: unknown) {
    _lastError = err instanceof Error ? err.message : String(err);
    // pendingTotal stays at last known value
  } finally {
    _running = false;
  }
}

async function checkAndResume(bridge: CryptoBridge): Promise<void> {
  if (_running) return;

  // Callers fire-and-forget this from effects and the rotation flow, so
  // a failed status query must record quietly, never reject unhandled.
  try {
    const status = await trpc.keys.resealStatus.query();
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

function createResealSweepStore(): {
  start(bridge: CryptoBridge): Promise<void>;
  checkAndResume(bridge: CryptoBridge): Promise<void>;
  autoResumeOnce(bridge: CryptoBridge): Promise<void>;
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
