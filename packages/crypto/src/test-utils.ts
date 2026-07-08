/**
 * Shared helpers for @care-y/crypto test files.
 *
 * Import from "./test-utils.js" in test files only; excluded from coverage
 * as test infrastructure (vitest.config.ts). Runtime singleton resets live
 * in testing.ts, which is exported to other packages; these helpers are
 * internal to this package's own suites.
 */

/** Copy buf and flip one bit, addressed by absolute bit index. */
export function flipBit(buf: Uint8Array, bitIndex: number): Uint8Array {
  const out = buf.slice();
  const byteIndex = Math.floor(bitIndex / 8);
  out[byteIndex] = (out[byteIndex] ?? 0) ^ (1 << (bitIndex % 8));
  return out;
}

/** True when needle occurs as a contiguous byte run inside haystack. */
export function containsSubarray(
  haystack: Uint8Array,
  needle: Uint8Array,
): boolean {
  for (let i = 0; i + needle.length <= haystack.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}
