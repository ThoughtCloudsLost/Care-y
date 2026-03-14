/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> SymmetricKey, Ciphertext) are the standard
   pattern for phantom-branded newtypes. The __brand field never exists at
   runtime; length is validated at each function boundary. */

/**
 * Symmetric content encryption using crypto_secretbox (XSalsa20-Poly1305).
 *
 * Encrypts ticket content, message text, and structured PII fields.
 * Each encryption generates a fresh random 24-byte nonce prepended to the
 * ciphertext, producing a single self-contained blob for storage.
 *
 * Format: nonce (24 bytes) || ciphertext (plaintext + 16-byte MAC)
 *
 * References:
 *   SEC-041  OWASP Key Management (nonce || ciphertext storage format)
 *   SEC-052  libsodium crypto_secretbox (XSalsa20-Poly1305 authenticated encryption)
 */

import { requireSodium } from "./sodium.js";
import { DecryptionError, InvalidKeyError } from "./errors.js";
import { concatBytes } from "./bytes.js";
import type { SymmetricKey, Ciphertext } from "./types.js";

/**
 * Generate a random 32-byte ticket key (tk).
 *
 * @returns Fresh random symmetric key for content encryption
 */
export function generateContentKey(): SymmetricKey {
  const sodium = requireSodium();
  return sodium.randombytes_buf(
    sodium.crypto_secretbox_KEYBYTES,
  ) as SymmetricKey;
}

/**
 * Encrypt plaintext with a symmetric key (crypto_secretbox, XSalsa20-Poly1305).
 * Returns nonce || ciphertext as a single blob.
 *
 * @param plaintext - Data to encrypt (zero or more bytes)
 * @param key - 32-byte symmetric key
 * @returns Self-contained ciphertext blob (nonce prepended)
 * @throws InvalidKeyError if key is wrong length
 */
export function encryptContent(
  plaintext: Uint8Array,
  key: SymmetricKey,
): Ciphertext {
  const sodium = requireSodium();

  if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new InvalidKeyError(
      `Content key must be ${String(sodium.crypto_secretbox_KEYBYTES)} bytes`,
    );
  }

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const sealed = sodium.crypto_secretbox_easy(plaintext, nonce, key);

  return concatBytes(nonce, sealed) as Ciphertext;
}

/**
 * Decrypt ciphertext (nonce || ciphertext format) with a symmetric key.
 *
 * @param blob - Self-contained ciphertext blob (nonce || ciphertext)
 * @param key - 32-byte symmetric key (same key used for encryption)
 * @returns Decrypted plaintext
 * @throws InvalidKeyError if key is wrong length
 * @throws DecryptionError if blob is truncated, key is wrong, or data is tampered
 */
export function decryptContent(
  blob: Ciphertext,
  key: SymmetricKey,
): Uint8Array {
  const sodium = requireSodium();

  if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new InvalidKeyError(
      `Content key must be ${String(sodium.crypto_secretbox_KEYBYTES)} bytes`,
    );
  }

  const nonceLen = sodium.crypto_secretbox_NONCEBYTES;
  if (blob.length < nonceLen + sodium.crypto_secretbox_MACBYTES) {
    throw new DecryptionError("Ciphertext too short (truncated)");
  }

  const nonce = blob.subarray(0, nonceLen);
  const ciphertext = blob.subarray(nonceLen);

  try {
    return sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
  } catch {
    throw new DecryptionError(
      "Content decryption failed: wrong key or tampered ciphertext",
    );
  }
}
