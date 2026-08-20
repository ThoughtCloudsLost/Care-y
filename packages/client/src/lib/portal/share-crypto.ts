/**
 * Client-side share-link encryption and decryption. Runs on the main thread.
 *
 * The share view page has no session, no Worker, no CryptoBridge.
 * The volunteer compose sheet uses this for the share-key encrypt only;
 * the follow-up copy (ticket-key) goes through CryptoBridge as usual.
 *
 * Same main-thread justification as intake-crypto.ts: the plaintext is
 * already in the DOM (volunteer typed it or client is reading it) and no
 * session keys exist on the public page. The key is zeroed in a finally
 * block immediately after sealing or unsealing. No await between generate
 * and zero.
 *
 * Uses @care-y/crypto directly. No Worker, no CryptoBridge, no OrgKeyManager.
 */

import {
  generateContentKey,
  encryptContent,
  decryptContent,
  buildContentAad,
  requireSodium,
  encode,
  decode,
  toSymmetricKey,
  type SymmetricKey,
  type Ciphertext,
} from "@care-y/crypto";

const SHARE_SLOT = "share-content";
const textEncoder = new TextEncoder();

export interface EncryptedShare {
  /** Base64url ciphertext blob for the createShare mutation. */
  readonly ciphertext: string;
  /** Base64url symmetric key for the URL fragment ONLY. */
  readonly fragmentKey: string;
}

/**
 * Encrypt share text under a fresh random key. Key bytes are zeroed
 * in the finally block immediately after sealing.
 *
 * @param shareId - Client-minted UUID, AAD-bound to the ciphertext
 * @param text - Plaintext content the volunteer wants to share
 * @returns Base64url ciphertext and fragment key
 */
export function encryptShare(shareId: string, text: string): EncryptedShare {
  const key: SymmetricKey = generateContentKey();
  try {
    const aad = buildContentAad(shareId, SHARE_SLOT);
    const ct = encryptContent(textEncoder.encode(text), key, aad);
    return { ciphertext: encode(ct), fragmentKey: encode(key) };
  } finally {
    requireSodium().memzero(key);
  }
}

/**
 * Decrypt share content on the share view page.
 *
 * @param shareId - The share id from the URL path
 * @param ciphertext - Base64url ciphertext from the openShare response
 * @param fragmentKey - Base64url key from the URL fragment
 * @returns Decrypted plaintext
 * @throws DecryptionError on wrong key, tampered ciphertext, or AAD mismatch
 */
export function decryptShare(
  shareId: string,
  ciphertext: string,
  fragmentKey: string,
): string {
  const key = toSymmetricKey(decode(fragmentKey));
  try {
    const aad = buildContentAad(shareId, SHARE_SLOT);
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Ciphertext is a branded Uint8Array; the base64url-decoded bytes are XChaCha20-Poly1305 AEAD ciphertext from the openShare response */
    const plain = decryptContent(decode(ciphertext) as Ciphertext, key, aad);
    return new TextDecoder().decode(plain);
  } finally {
    requireSodium().memzero(key);
  }
}
