/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> SymmetricKey, Ciphertext) are the standard
   pattern for phantom-branded newtypes. The __brand field never exists at
   runtime; length is validated at each function boundary. */

/**
 * Symmetric content encryption using crypto_aead_xchacha20poly1305_ietf
 * (XChaCha20-Poly1305 AEAD).
 *
 * Encrypts ticket content, message text, and structured PII fields. The
 * associated data binds each ciphertext to its storage context (ticket and
 * slot), so a ciphertext relocated to a different slot fails authentication
 * even though every slot of a ticket shares the same key (ADR-053).
 *
 * Each encryption generates a fresh random 24-byte nonce prepended to the
 * ciphertext, producing a single self-contained blob for storage. The
 * 16-byte Poly1305 tag lives inside the AEAD ciphertext (combined mode).
 *
 * Format: nonce (24 bytes) || ciphertext (plaintext + 16-byte tag)
 *
 * References:
 *   SEC-041  OWASP Key Management (nonce || ciphertext storage format)
 *   libsodium AEAD docs (XChaCha20-Poly1305-ietf construction)
 */

import { requireSodium } from "./sodium.js";
import { DecryptionError } from "./errors.js";
import { concatBytes } from "./bytes.js";
import { assertKeyLength } from "./validation.js";
import type { SymmetricKey, Ciphertext } from "./types.js";

const textEncoder = new TextEncoder();

/**
 * Build the associated data that binds a content ciphertext to its slot.
 *
 * Canonical slot identifiers:
 *   `title`, `description`      ticket fields
 *   `followup:<followupId>`     follow-up content
 *   `blob:<rowId>`              attachment / recording binary (row id)
 *   `filename:<attachmentId>`   attachment filename
 *   `cursor:<userId>`           per-user read cursor payload
 *   `field:<name>`              any other named ticket field
 *
 * The decryptor rebuilds the AAD from the stored row (ticket id plus the
 * slot the ciphertext came from), so relocating a ciphertext to another
 * slot or ticket fails authentication. Key generation is deliberately NOT
 * part of the AAD: content is re-encrypted under new key generations
 * during rewraps and the binding must survive that.
 *
 * @param ticketId - The ticket that owns the content
 * @param slot - Canonical slot identifier (see list above)
 * @returns UTF-8 bytes of `${ticketId}:${slot}`
 */
export function buildContentAad(ticketId: string, slot: string): Uint8Array {
  return textEncoder.encode(`${ticketId}:${slot}`);
}

/** Slot for follow-up content. */
export function followupSlot(followupId: string): string {
  return `followup:${followupId}`;
}

/**
 * Slot for an attachment or recording blob, bound to the attachments or
 * recordings ROW id. The blob storage key is deliberately not used: the
 * store mints a fresh key on every temp-key rewrap, while the row id is
 * stable for the life of the blob.
 */
export function blobSlot(blobRowId: string): string {
  return `blob:${blobRowId}`;
}

/** Slot for an attachment's encrypted filename, bound to the row id. */
export function filenameSlot(attachmentId: string): string {
  return `filename:${attachmentId}`;
}

/** Slot for a per-user read cursor payload. */
export function cursorSlot(userId: string): string {
  return `cursor:${userId}`;
}

/** Slot for a named ticket field other than title/description. */
export function fieldSlot(name: string): string {
  return `field:${name}`;
}

/**
 * Generate a random 32-byte ticket key (tk).
 *
 * @returns Fresh random symmetric key for content encryption
 */
export function generateContentKey(): SymmetricKey {
  const sodium = requireSodium();
  return sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
  ) as SymmetricKey;
}

/**
 * Encrypt plaintext with a symmetric key (XChaCha20-Poly1305 AEAD).
 * Returns nonce || ciphertext as a single blob. The associated data is
 * authenticated but not stored; the decryptor must supply the same bytes.
 *
 * @param plaintext - Data to encrypt (zero or more bytes)
 * @param key - 32-byte symmetric key
 * @param aad - Associated data binding the storage context (buildContentAad)
 * @returns Self-contained ciphertext blob (nonce prepended)
 * @throws InvalidKeyError if key is wrong length
 */
export function encryptContent(
  plaintext: Uint8Array,
  key: SymmetricKey,
  aad: Uint8Array,
): Ciphertext {
  const sodium = requireSodium();
  assertKeyLength(
    key,
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    "Content key",
  );

  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
  );
  const sealed = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    aad,
    null,
    nonce,
    key,
  );

  return concatBytes(nonce, sealed) as Ciphertext;
}

/**
 * Decrypt ciphertext (nonce || ciphertext format) with a symmetric key.
 * The associated data must match the bytes supplied at encryption time.
 *
 * @param blob - Self-contained ciphertext blob (nonce || ciphertext)
 * @param key - 32-byte symmetric key (same key used for encryption)
 * @param aad - Associated data bound at encryption time (buildContentAad)
 * @returns Decrypted plaintext
 * @throws InvalidKeyError if key is wrong length
 * @throws DecryptionError if the blob is truncated, the key is wrong, the
 *         data was tampered with, or the associated data does not match
 */
export function decryptContent(
  blob: Ciphertext,
  key: SymmetricKey,
  aad: Uint8Array,
): Uint8Array {
  const sodium = requireSodium();
  assertKeyLength(
    key,
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    "Content key",
  );

  const nonceLen = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
  if (
    blob.length <
    nonceLen + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES
  ) {
    throw new DecryptionError("Ciphertext too short (truncated)");
  }

  const nonce = blob.subarray(0, nonceLen);
  const ciphertext = blob.subarray(nonceLen);

  try {
    return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      aad,
      nonce,
      key,
    );
  } catch {
    throw new DecryptionError(
      "Content decryption failed: wrong key, tampered ciphertext, or context mismatch",
    );
  }
}
