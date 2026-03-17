/**
 * Reusable interval-based cleanup utility.
 *
 * Consolidates the repeated pattern of setInterval + unref for periodic
 * cache/state cleanup across rate-limiter, PoW, OPRF failure tracker,
 * and audit log modules.
 */

/**
 * Create a periodic cleanup interval that does not prevent process exit.
 *
 * @param intervalMs - Interval between cleanup runs in milliseconds
 * @param callback - Cleanup function to run each interval
 * @returns dispose function to clear the interval (for tests)
 */
export function createCleanupInterval(
  intervalMs: number,
  callback: () => void,
): () => void {
  const handle = setInterval(callback, intervalMs);
  handle.unref();
  return () => {
    clearInterval(handle);
  };
}
