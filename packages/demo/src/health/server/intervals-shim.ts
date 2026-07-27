/**
 * Shim for packages/server/src/utils/intervals.ts
 *
 * Identical API but omits .unref() which throws in browsers.
 *
 * Mirrors: packages/server/src/utils/intervals.ts:1-25
 */

export function createCleanupInterval(
  intervalMs: number,
  callback: () => void,
): () => void {
  const handle = setInterval(callback, intervalMs);
  // Omit handle.unref() -- not available in browser environments
  return (): void => {
    clearInterval(handle);
  };
}
