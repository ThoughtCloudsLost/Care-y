/**
 * Byte array utilities for the crypto package.
 *
 * Pure functions, no sodium dependency. Used across modules to replace
 * hand-rolled Uint8Array concatenation (set/offset pattern).
 */

/**
 * Concatenate multiple Uint8Arrays into a single contiguous buffer.
 *
 * @param arrays - Byte arrays to concatenate in order
 * @returns New Uint8Array containing all input bytes
 */
export function concatBytes(...arrays: readonly Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

/**
 * Create a 32-byte little-endian ristretto255 scalar from a small integer.
 *
 * Used by OPRF Lagrange interpolation and proactive refresh where evaluation
 * points (1, 2) and coefficients (2, -1) are encoded as scalars.
 *
 * @param value - Integer value (0..255) to encode as byte 0
 * @returns 32-byte scalar with value in little-endian position 0
 */
export function scalarFromInt(value: number): Uint8Array {
  const scalar = new Uint8Array(32);
  scalar[0] = value;
  return scalar;
}

/**
 * Encode a domain separation label (ASCII string) to bytes.
 *
 * Centralizes the TextEncoder instantiation used throughout the key
 * derivation tree and branding module. Keeps RFC-level code (rfc.ts)
 * separate since those strings match spec naming conventions directly.
 */
const encoder = new TextEncoder();
export function encodeLabel(label: string): Uint8Array {
  return encoder.encode(label);
}
