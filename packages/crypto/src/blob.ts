/**
 * Binary blob encryption for attachments.
 *
 * Uses the same AEAD primitive as content encryption, but semantically
 * separate to signal "this is a binary file, not text content." This
 * separation allows future changes (e.g., streaming encryption for large
 * files) to target blob handling without touching content encryption.
 *
 * The associated data binds the blob to its storage slot, normally
 * buildContentAad(ticketId, `blob:<blobKey>`), so an encrypted attachment
 * relocated to another blob key or content column fails authentication.
 *
 * Format: nonce (24 bytes) || ciphertext (data + 16-byte tag)
 */

import { encryptContent, decryptContent } from "./content.js";
import type { SymmetricKey, Ciphertext } from "./types.js";

/**
 * Encrypt a binary blob (attachment) with a ticket key.
 *
 * @param data - Binary data to encrypt
 * @param key - 32-byte symmetric key
 * @param aad - Associated data binding the storage slot (buildContentAad)
 * @returns Self-contained ciphertext blob (nonce prepended)
 * @throws InvalidKeyError if key is wrong length
 */
export function encryptBlob(
  data: Uint8Array,
  key: SymmetricKey,
  aad: Uint8Array,
): Ciphertext {
  return encryptContent(data, key, aad);
}

/**
 * Decrypt a binary blob with a ticket key.
 *
 * @param encrypted - Self-contained ciphertext blob (nonce || ciphertext)
 * @param key - 32-byte symmetric key (same key used for encryption)
 * @param aad - Associated data bound at encryption time (buildContentAad)
 * @returns Decrypted binary data
 * @throws InvalidKeyError if key is wrong length
 * @throws DecryptionError if the blob is truncated, the key is wrong, the
 *         data was tampered with, or the associated data does not match
 */
export function decryptBlob(
  encrypted: Ciphertext,
  key: SymmetricKey,
  aad: Uint8Array,
): Uint8Array {
  return decryptContent(encrypted, key, aad);
}
