/**
 * HKDF-SHA512 per RFC 5869.
 *
 * Built from libsodium's streaming HMAC-SHA512 API (init/update/final) which
 * accepts variable-length keys. The one-shot crypto_auth_hmacsha512 enforces
 * a fixed 32-byte key, but HKDF needs arbitrary-length keys for both Extract
 * (salt as HMAC key) and Expand (PRK is 64 bytes from SHA-512 output).
 * This keeps the crypto package isomorphic (no Node crypto.hkdf) and ensures
 * both browser and Node use the same code path.
 *
 * Extract: PRK = HMAC-SHA512(salt, IKM)
 * Expand:  OKM = T(1) || T(2) || ... truncated to length
 *          T(i) = HMAC-SHA512(PRK, T(i-1) || info || i)
 *
 * References:
 *   RFC 5869 Section 2 (HKDF specification)
 *   https://datatracker.ietf.org/doc/html/rfc5869#section-2
 */

import { requireSodium, type SodiumBackend } from "./sodium.js";
import { InvalidInputError } from "./errors.js";

const MAX_OUTPUT = 255 * 64; // 255 * HashLen (SHA-512 = 64 bytes)

/** HMAC-SHA512 via streaming API (accepts any key length). */
function hmacSha512(
  sodium: SodiumBackend,
  key: Uint8Array,
  data: Uint8Array,
): Uint8Array {
  const state = sodium.crypto_auth_hmacsha512_init(key);
  sodium.crypto_auth_hmacsha512_update(state, data);
  return sodium.crypto_auth_hmacsha512_final(state);
}

/**
 * Derive keying material using HKDF-SHA512.
 *
 * @param ikm    Input keying material (any length)
 * @param info   Context/application-specific info (domain label)
 * @param length Output length in bytes (1..16320)
 * @param salt   Optional salt (defaults to 64 zero bytes per RFC 5869 Section 2.2)
 * @returns Derived key material of the requested length
 * @throws InvalidInputError if length is out of range
 */
export function hkdf(
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
  salt?: Uint8Array,
): Uint8Array {
  if (length <= 0 || length > MAX_OUTPUT) {
    throw new InvalidInputError(
      `HKDF output length must be 1..${String(MAX_OUTPUT)}, got ${String(length)}`,
    );
  }

  const sodium = requireSodium();
  const hashLen = sodium.crypto_auth_hmacsha512_BYTES; // 64

  // Extract: PRK = HMAC-SHA512(salt, IKM)
  // Uses streaming API because salt (the HMAC key) can be any length.
  const effectiveSalt = salt ?? new Uint8Array(hashLen);
  const prk = hmacSha512(sodium, effectiveSalt, ikm);

  // Expand: T(i) = HMAC-SHA512(PRK, T(i-1) || info || counter)
  // PRK is 64 bytes (SHA-512 output), so the streaming API is required here too.
  const n = Math.ceil(length / hashLen);
  const okm = new Uint8Array(n * hashLen);
  let prev: Uint8Array = new Uint8Array(0);

  for (let i = 1; i <= n; i++) {
    const state = sodium.crypto_auth_hmacsha512_init(prk);
    sodium.crypto_auth_hmacsha512_update(state, prev);
    sodium.crypto_auth_hmacsha512_update(state, info);
    sodium.crypto_auth_hmacsha512_update(state, new Uint8Array([i]));
    prev = sodium.crypto_auth_hmacsha512_final(state);
    okm.set(prev, (i - 1) * hashLen);
  }

  // Zero intermediate key material
  sodium.memzero(prk);

  return okm.subarray(0, length);
}

/**
 * Convenience wrapper: HKDF-SHA512 with a string info label, returns 32 bytes.
 * Used throughout the key derivation tree (HKDF_LABELS in types.ts).
 *
 * @param ikm   Input keying material
 * @param label Domain separation label (ASCII string, encoded to UTF-8)
 * @returns 32-byte derived key
 */
export function hkdfDerive32(ikm: Uint8Array, label: string): Uint8Array {
  const info = new TextEncoder().encode(label);
  return hkdf(ikm, info, 32);
}
