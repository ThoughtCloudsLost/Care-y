/**
 * Shim for packages/server/src/branding/branding-crypto.ts
 *
 * Replaces sodium-native with libsodium-wrappers-sumo.
 *
 * Mirrors: packages/server/src/branding/branding-crypto.ts:1-83
 */

import _sodium from "libsodium-wrappers-sumo";

class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CryptoError";
  }
}

const BRANDING_LABEL = "care-y-branding-v1";

export const BRANDING_AAD: Buffer = Buffer.from(
  "care-y-client-branding-aad-v1",
  "utf-8",
);

export function deriveBrandingKey(orgPublicKey: Buffer): Buffer {
  const labelBytes = Buffer.from(BRANDING_LABEL, "utf-8");
  const input = new Uint8Array(labelBytes.length + orgPublicKey.length);
  input.set(labelBytes);
  input.set(orgPublicKey, labelBytes.length);
  // crypto_generichash defaults to BLAKE2b-256 (32 bytes)
  const key = _sodium.crypto_generichash(32, input);
  return Buffer.from(key);
}

export function decryptBrandingBlob(
  encryptedBlob: Buffer,
  key: Buffer,
): Buffer | null {
  const nonceLen = 24; // crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  const tagLen = 16; // crypto_aead_xchacha20poly1305_ietf_ABYTES

  if (key.length !== 32) {
    throw new CryptoError("Branding key has the wrong length");
  }

  if (encryptedBlob.length < nonceLen + tagLen) return null;

  const nonce = new Uint8Array(encryptedBlob.subarray(0, nonceLen));
  const ciphertext = new Uint8Array(encryptedBlob.subarray(nonceLen));

  try {
    const plaintext = _sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null, // nsec (unused)
      ciphertext,
      new Uint8Array(BRANDING_AAD),
      nonce,
      new Uint8Array(key),
    );
    return Buffer.from(plaintext);
  } catch {
    return null;
  }
}
