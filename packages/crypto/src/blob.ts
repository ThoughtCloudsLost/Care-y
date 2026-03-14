/**
 * Binary blob encryption for attachments.
 *
 * Uses the same crypto_secretbox primitive as content encryption, but
 * semantically separate to signal "this is a binary file, not text content."
 * This separation allows future changes (e.g., streaming encryption for
 * large files) to target blob handling without touching content encryption.
 *
 * Format: nonce (24 bytes) || ciphertext (data + 16-byte MAC)
 */

import { encryptContent, decryptContent } from "./content.js";
import type { SymmetricKey, Ciphertext } from "./types.js";

/**
 * Encrypt a binary blob (attachment) with a ticket key.
 *
 * @param data - Binary data to encrypt
 * @param key - 32-byte symmetric key
 * @returns Self-contained ciphertext blob (nonce prepended)
 * @throws InvalidKeyError if key is wrong length
 */
export function encryptBlob(data: Uint8Array, key: SymmetricKey): Ciphertext {
  return encryptContent(data, key);
}

/**
 * Decrypt a binary blob with a ticket key.
 *
 * @param encrypted - Self-contained ciphertext blob (nonce || ciphertext)
 * @param key - 32-byte symmetric key (same key used for encryption)
 * @returns Decrypted binary data
 * @throws InvalidKeyError if key is wrong length
 * @throws DecryptionError if blob is truncated, key is wrong, or data is tampered
 */
export function decryptBlob(
  encrypted: Ciphertext,
  key: SymmetricKey,
): Uint8Array {
  return decryptContent(encrypted, key);
}
