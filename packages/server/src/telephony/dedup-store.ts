import { createCleanupInterval } from "../utils/intervals.js";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL_MS = 60_000; // 1 minute

export interface DedupStore {
  /** Returns true if the SID was already processed and has not expired. */
  isDuplicate(sid: string): boolean;
  /** Record that a SID has been processed (sets timestamp to now). */
  markProcessed(sid: string): void;
  /** Stop the cleanup interval and clear all entries. */
  stop(): void;
}

/**
 * In-memory dedup store for webhook SIDs.
 *
 * Tracks processed SIDs with a configurable TTL. Expired entries are
 * pruned on access (lazy) and by a periodic cleanup interval (eager).
 *
 * @param ttlMs - Time-to-live for entries in milliseconds (default 24h)
 * @param now - Injectable clock function returning current time in ms (default Date.now)
 */
export function createDedupStore(
  ttlMs: number = DEFAULT_TTL_MS,
  now: () => number = Date.now,
): DedupStore {
  const entries = new Map<string, number>();

  function isExpired(timestamp: number): boolean {
    return now() - timestamp >= ttlMs;
  }

  function cleanup(): void {
    for (const [sid, timestamp] of entries) {
      if (isExpired(timestamp)) {
        entries.delete(sid);
      }
    }
  }

  const stopInterval = createCleanupInterval(CLEANUP_INTERVAL_MS, cleanup);

  return {
    isDuplicate(sid: string): boolean {
      const timestamp = entries.get(sid);
      if (timestamp === undefined) {
        return false;
      }
      if (isExpired(timestamp)) {
        entries.delete(sid);
        return false;
      }
      return true;
    },

    markProcessed(sid: string): void {
      entries.set(sid, now());
    },

    stop(): void {
      stopInterval();
      entries.clear();
    },
  };
}
