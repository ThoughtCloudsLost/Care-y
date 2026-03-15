/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type cast (Uint8Array -> SymmetricKey) is the standard pattern
   for phantom-branded newtypes. The __brand field never exists at runtime;
   length is validated by crypto_generichash output (always 32 bytes). */

/**
 * Client-side branding key derivation and encryption.
 *
 * Branding (org name, logo, colors) is encrypted at rest but derivable from
 * the org's public key. Public intake pages need to display branding before
 * any user authenticates, so the key must be derivable from public information.
 *
 * Uses BLAKE2b with a domain prefix (NOT HKDF) to signal that this key is
 * intentionally separate from the OPRF-derived key tree.
 *
 * Two-tier model:
 *   Volunteer-side: encrypted with org key (full E2E, handled by keywrap/ecies)
 *   Client-side: encrypted with BLAKE2b(label || orgPublicKey) (this module)
 *
 * References:
 *   SEC-052  libsodium crypto_secretbox (via content.ts for encrypt/decrypt)
 *   SEC-011  RFC 9496 (ristretto255 public key as branding key input)
 *   B1 decision (crypto-architecture-v2.md, org branding two-tier)
 */

import { requireSodium } from "./sodium.js";
import { encryptContent, decryptContent } from "./content.js";
import { InvalidKeyError } from "./errors.js";
import { concatBytes, encodeLabel } from "./bytes.js";
import {
  BRANDING_LABEL,
  type SymmetricKey,
  type RistrettoPoint,
  type Ciphertext,
} from "./types.js";

/**
 * Derive the client-side branding key from an org's public key.
 *
 * brandingKey = BLAKE2b(label || orgPublicKey, outputLen=32)
 *
 * This key is derivable by anyone who knows the org public key (which is
 * public). Provides encryption-at-rest protection only, not E2E.
 *
 * @param orgPublicKey - The org's ristretto255 public point
 * @returns 32-byte branding key
 * @throws InvalidKeyError if orgPublicKey is wrong length
 */
export function deriveClientBrandingKey(
  orgPublicKey: RistrettoPoint,
): SymmetricKey {
  const sodium = requireSodium();

  if (orgPublicKey.length !== sodium.crypto_core_ristretto255_BYTES) {
    throw new InvalidKeyError("Org public key must be 32 bytes");
  }

  return sodium.crypto_generichash(
    sodium.crypto_secretbox_KEYBYTES,
    concatBytes(encodeLabel(BRANDING_LABEL), orgPublicKey),
  ) as SymmetricKey;
}

/**
 * Encrypt client-facing branding payload.
 * Derivable from org public key (public intake pages can decrypt).
 *
 * @param payload - Branding data to encrypt (JSON-encoded org name, colors, etc.)
 * @param orgPublicKey - The org's ristretto255 public point
 * @returns Encrypted branding blob (nonce || ciphertext)
 * @throws InvalidKeyError if orgPublicKey is wrong length
 */
export function encryptClientBranding(
  payload: Uint8Array,
  orgPublicKey: RistrettoPoint,
): Ciphertext {
  const key = deriveClientBrandingKey(orgPublicKey);
  try {
    return encryptContent(payload, key);
  } finally {
    requireSodium().memzero(key);
  }
}

/**
 * Decrypt client-facing branding payload.
 *
 * @param ciphertext - Encrypted branding blob (nonce || ciphertext)
 * @param orgPublicKey - The org's ristretto255 public point
 * @returns Decrypted branding data
 * @throws InvalidKeyError if orgPublicKey is wrong length
 * @throws DecryptionError if decryption fails
 */
export function decryptClientBranding(
  ciphertext: Ciphertext,
  orgPublicKey: RistrettoPoint,
): Uint8Array {
  const key = deriveClientBrandingKey(orgPublicKey);
  try {
    return decryptContent(ciphertext, key);
  } finally {
    requireSodium().memzero(key);
  }
}
