/**
 * Session cleanup handlers for page unload.
 *
 * With SharedWorker (ADR-044), beforeunload calls disconnect() instead
 * of zeroAll(). This removes the port from the SharedWorker's set and
 * starts the zero-on-last-disconnect timer (500ms) if no ports remain.
 * Keys are preserved across F5 refreshes because the new page reconnects
 * before the timer fires.
 *
 * For dedicated Workers (password change temp bridge), disconnect()
 * falls back to zeroAll + terminate.
 *
 * Both idle timeout and beforeunload may fire in the same session
 * (user closes tab while idle timer is counting). The bridge's
 * disconnect() is idempotent (no-op if already DESTROYED).
 *
 * All decrypt caches are cleared via cacheRegistry.clearAll(). Every
 * cache holding decrypted content registers itself through the registry
 * at construction time.
 */

import { cacheRegistry } from "$lib/crypto/cache-registry.js";

/** Narrow interface: only the methods cleanup needs from CryptoBridge. */
export interface CleanupBridge {
  disconnect(): void;
}

/** Narrow interface: only the method cleanup needs from OrgKeyManager. */
export interface CleanupOrgKey {
  zero(): void;
}

let installed = false;
let bridgeRef: CleanupBridge | null = null;
let orgKeyRef: CleanupOrgKey | null = null;

function handleBeforeUnload(): void {
  cacheRegistry.clearAll();

  if (bridgeRef) {
    bridgeRef.disconnect();
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
): void {
  bridgeRef = bridge;
  orgKeyRef = orgKey;

  if (!installed) {
    window.addEventListener("beforeunload", handleBeforeUnload);
    installed = true;
  }
}

/**
 * Clear all decrypted data from memory.
 * Call on logout, session expiry, or idle timeout (not just beforeunload).
 */
export function clearAllDecryptedData(): void {
  cacheRegistry.clearAll();
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
