/**
 * Session cleanup handlers for key zeroing on page unload.
 *
 * The beforeunload handler is synchronous. bridge.zeroAll() is async
 * (postMessage round-trip), so we fire it without awaiting. The Worker
 * will process the message if the page stays alive long enough. If the
 * page is killed immediately, the OS reclaims Worker memory.
 *
 * Both idle timeout and beforeunload may fire in the same session
 * (user closes tab while idle timer is counting). The Worker's
 * handleZeroAll and the bridge's zeroAll are idempotent.
 */

/** Narrow interface: only the method cleanup needs from CryptoBridge. */
export interface CleanupBridge {
  zeroAll(): Promise<void>;
}

/** Narrow interface: only the method cleanup needs from OrgKeyManager. */
export interface CleanupOrgKey {
  zero(): void;
}

/** Narrow interface: only the method cleanup needs from decrypt caches. */
export interface CleanupCache {
  clear(): void;
}

let installed = false;
let bridgeRef: CleanupBridge | null = null;
let orgKeyRef: CleanupOrgKey | null = null;
let cacheRefs: CleanupCache[] = [];

function handleBeforeUnload(): void {
  // Clear decrypt caches first (plaintext strings in SvelteMap).
  for (const cache of cacheRefs) {
    cache.clear();
  }

  // Fire-and-forget: do not await, do not block unload
  if (bridgeRef) {
    bridgeRef.zeroAll().catch(() => {
      // Swallow: Worker may already be terminated
    });
  }
  if (orgKeyRef) {
    orgKeyRef.zero();
  }
}

/**
 * Install the beforeunload handler for key zeroing and cache clearing.
 * Call once during app initialization (root layout).
 * Idempotent: safe to call multiple times.
 */
export function installCleanupHandler(
  bridge: CleanupBridge,
  orgKey: CleanupOrgKey,
  caches?: CleanupCache[],
): void {
  bridgeRef = bridge;
  orgKeyRef = orgKey;
  cacheRefs = caches ?? [];

  if (!installed) {
    window.addEventListener("beforeunload", handleBeforeUnload);
    installed = true;
  }
}

/**
 * Remove the beforeunload handler.
 * Call during test teardown or when the bridge is destroyed.
 */
export function removeCleanupHandler(): void {
  if (installed) {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    installed = false;
  }
  bridgeRef = null;
  orgKeyRef = null;
}
