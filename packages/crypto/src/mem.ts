/**
 * Memory management helpers for sensitive key material.
 *
 * Centralizes the repeated pattern of safely zeroing nullable buffers
 * in finally blocks. Uses requireSodium().memzero under the hood.
 */

import { requireSodium } from "./sodium.js";

/**
 * Zero all provided buffers, skipping nulls.
 * Intended for finally blocks that clean up intermediate key material.
 *
 * @param buffers - Buffers to zero (nulls are silently skipped)
 */
export function zeroAll(...buffers: readonly (Uint8Array | null)[]): void {
  const sodium = requireSodium();
  for (const buf of buffers) {
    if (buf !== null) sodium.memzero(buf);
  }
}
