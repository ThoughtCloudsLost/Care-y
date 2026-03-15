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
 *   SEC-004  RFC 5869 (HKDF specification)
 *   SEC-017  NIST SP 800-108 (KDF label/context binding requirements)
 *   SEC-163  Krawczyk, "Cryptographic Extraction and Key Derivation" (CRYPTO 2010)
 *   SEC-054  libsodium memory management (memzero for PRK)
 */

import { requireSodium, type SodiumBackend } from "./sodium.js";
import { InvalidInputError } from "./errors.js";
import { encodeLabel } from "./bytes.js";

const HASH_LEN = 64; // SHA-512 output length
const MAX_OUTPUT = 255 * HASH_LEN;

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
 * HKDF-Extract (RFC 5869 Section 2.2).
 * PRK = HMAC-SHA512(salt, IKM)
 *
 * Uses the streaming HMAC API because the salt (HMAC key) can be any length.
 * Default salt is 64 zero bytes per the RFC.
 */
function hkdfExtract(
  sodium: SodiumBackend,
  ikm: Uint8Array,
  salt?: Uint8Array,
): Uint8Array {
  const effectiveSalt = salt ?? new Uint8Array(HASH_LEN);
  return hmacSha512(sodium, effectiveSalt, ikm);
}

/**
 * HKDF-Expand (RFC 5869 Section 2.3).
 * T(i) = HMAC-SHA512(PRK, T(i-1) || info || i)
 * OKM = T(1) || T(2) || ... truncated to length
 *
 * Uses the streaming HMAC API because the PRK is 64 bytes (SHA-512 output),
 * which exceeds the one-shot API's fixed 32-byte key requirement.
 */
function hkdfExpand(
  sodium: SodiumBackend,
  prk: Uint8Array,
  info: Uint8Array,
  length: number,
): Uint8Array {
  const n = Math.ceil(length / HASH_LEN);
  const okm = new Uint8Array(n * HASH_LEN);
  let prev: Uint8Array = new Uint8Array(0);

  for (let i = 1; i <= n; i++) {
    const state = sodium.crypto_auth_hmacsha512_init(prk);
    sodium.crypto_auth_hmacsha512_update(state, prev);
    sodium.crypto_auth_hmacsha512_update(state, info);
    sodium.crypto_auth_hmacsha512_update(state, new Uint8Array([i]));
    prev = sodium.crypto_auth_hmacsha512_final(state);
    okm.set(prev, (i - 1) * HASH_LEN);
  }

  return okm.subarray(0, length);
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
  const prk = hkdfExtract(sodium, ikm, salt);
  try {
    return hkdfExpand(sodium, prk, info, length);
  } finally {
    sodium.memzero(prk);
  }
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
  return hkdf(ikm, encodeLabel(label), 32);
}
