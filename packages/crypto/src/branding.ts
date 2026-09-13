/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type cast (Uint8Array -> SymmetricKey) is the standard pattern
   for phantom-branded newtypes. The __brand field never exists at runtime;
   length is validated by crypto_generichash output (always 32 bytes). */

/**
 * Branding key derivation, encryption, and decryption for intake form assets.
 *
 * Org branding itself (name, logo, colors) is plaintext (ADR-094). This
 * module survives because intake form labels, field configs, and form
 * assets are encrypted under the same derived key with their own AAD
 * (ADR-026). IntakeFormEditor, FormContentEditor, and the server's
 * form-asset routes are the remaining callers.
 *
 * Uses BLAKE2b with a domain prefix (NOT HKDF) to signal that this key is
 * intentionally separate from the OPRF-derived key tree.
 *
 * The org public key is Curve25519 (from crypto_box_keypair), NOT ristretto255.
 * See org-keypair.ts and crypto-architecture-v2.md section 6 tier table.
 *
 * Encryption and decryption run through content.ts, so payloads use
 * XChaCha20-Poly1305 AEAD with a fixed AAD, not crypto_secretbox (ADR-053).
 *
 * References:
 *   SEC-041  OWASP Key Management (nonce || ciphertext storage format)
 *   libsodium AEAD docs (XChaCha20-Poly1305-ietf construction)
 *   ADR-026  intake form asset encryption
 */

import { requireSodium } from "./sodium.js";
import { encryptContent, decryptContent } from "./content.js";
import { assertKeyLength } from "./validation.js";
import { concatBytes, encodeLabel } from "./bytes.js";
import { BRANDING_LABEL, type SymmetricKey, type Ciphertext } from "./types.js";

// Fixed associated data for the branding payload. The branding key is
// single-purpose (one payload per org), so no per-slot binding is needed;
// the constant still domain-separates branding ciphertext from ticket
// content slots (ADR-053).
const BRANDING_AAD = encodeLabel("care-y-client-branding-aad-v1");

/**
 * Derive the client-side branding key from an org's public key.
 *
 * brandingKey = BLAKE2b(label || orgPublicKey, outputLen=32)
 *
 * This key is derivable by anyone who knows the org public key (which is
 * public). Provides encryption-at-rest protection only, not E2E.
 *
 * @param orgPublicKey - The org's Curve25519 public key (32 bytes, from crypto_box_keypair)
 * @returns 32-byte branding key
 * @throws InvalidKeyError if orgPublicKey is wrong length
 */
export function deriveClientBrandingKey(
  orgPublicKey: Uint8Array,
): SymmetricKey {
  const sodium = requireSodium();
  assertKeyLength(
    orgPublicKey,
    sodium.crypto_box_PUBLICKEYBYTES,
    "Org public key",
  );

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
 * @param orgPublicKey - The org's Curve25519 public key (32 bytes)
 * @returns Encrypted branding blob (nonce || ciphertext)
 * @throws InvalidKeyError if orgPublicKey is wrong length
 */
export function encryptClientBranding(
  payload: Uint8Array,
  orgPublicKey: Uint8Array,
): Ciphertext {
  const key = deriveClientBrandingKey(orgPublicKey);
  try {
    return encryptContent(payload, key, BRANDING_AAD);
  } finally {
    requireSodium().memzero(key);
  }
}

/**
 * Decrypt client-facing branding payload.
 *
 * @param ciphertext - Encrypted branding blob (nonce || ciphertext)
 * @param orgPublicKey - The org's Curve25519 public key (32 bytes)
 * @returns Decrypted branding data
 * @throws InvalidKeyError if orgPublicKey is wrong length
 * @throws DecryptionError if decryption fails
 */
export function decryptClientBranding(
  ciphertext: Ciphertext,
  orgPublicKey: Uint8Array,
): Uint8Array {
  const key = deriveClientBrandingKey(orgPublicKey);
  try {
    return decryptContent(ciphertext, key, BRANDING_AAD);
  } finally {
    requireSodium().memzero(key);
  }
}
