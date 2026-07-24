/**
 * Server-side branding blob decryption.
 *
 * Branding (org name, colors, PWA icons) is encrypted at rest under a key
 * derived from the org's PUBLIC key, so unauthenticated surfaces (icon
 * serving, the PWA manifest) can decrypt it without any user secret. This
 * is encryption at rest, not E2E, and is deliberate: the payload is public
 * branding, never client PII (ADR-006, ADR-024).
 *
 * The wire format is produced by the browser via `encryptClientBranding` in
 * `@care-y/crypto`, which routes through `encryptContent`:
 *
 *   XChaCha20-Poly1305 AEAD, AAD "care-y-client-branding-aad-v1"
 *   Layout: nonce (24 bytes) || ciphertext (plaintext + 16-byte tag)
 *
 * The key derivation (BLAKE2b over label || orgPublicKey) is unchanged from
 * the original secretbox design and produces the same 32 bytes, so existing
 * derivation vectors still hold; only the cipher moved (ADR-053).
 */

import sodium from "sodium-native";
import { CryptoError } from "../errors.js";

const BRANDING_LABEL = "care-y-branding-v1";

/**
 * Fixed associated data for branding payloads. Must match BRANDING_AAD in
 * `packages/crypto/src/branding.ts` byte for byte or every decrypt fails.
 */
export const BRANDING_AAD: Buffer = Buffer.from(
  "care-y-client-branding-aad-v1",
  "utf-8",
);

export function deriveBrandingKey(orgPublicKey: Buffer): Buffer {
  const labelBytes = Buffer.from(BRANDING_LABEL, "utf-8");
  const input = Buffer.concat([labelBytes, orgPublicKey]);
  const key = Buffer.alloc(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES);
  sodium.crypto_generichash(key, input);
  return key;
}

/**
 * Open a branding blob. Returns null when the blob is too short, the key is
 * wrong, the ciphertext was tampered with, or the associated data does not
 * match. A malformed key is a programming error and throws instead, so it
 * can never be mistaken for a routine authentication failure.
 */
export function decryptBrandingBlob(
  encryptedBlob: Buffer,
  key: Buffer,
): Buffer | null {
  const nonceLen = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
  const tagLen = sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES;

  // Checked before the try below so sodium's own key-length assertion is
  // not swallowed by the authentication-failure catch.
  if (key.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES) {
    throw new CryptoError("Branding key has the wrong length");
  }

  if (encryptedBlob.length < nonceLen + tagLen) return null;

  const nonce = encryptedBlob.subarray(0, nonceLen);
  const ciphertext = encryptedBlob.subarray(nonceLen);
  const plaintext = Buffer.alloc(ciphertext.length - tagLen);

  try {
    // care-y-ignore-next-line server-no-decrypt -- branding is public-tier data keyed off the org public key (ADR-024); no client PII passes through here
    sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      plaintext,
      null,
      ciphertext,
      BRANDING_AAD,
      nonce,
      key,
    );
  } catch {
    return null;
  }

  return plaintext;
}
