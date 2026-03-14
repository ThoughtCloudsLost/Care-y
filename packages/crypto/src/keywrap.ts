/**
 * Org key wrapping for non-PII key distribution.
 *
 * Thin semantic wrapper around ECIES. "Wrap" means "encrypt a private key
 * so that only the intended volunteer can unwrap it." Used for distributing
 * the org private key to authorized volunteers.
 *
 * References:
 *   SEC-040 (ECIES construction)
 *   docs/design-ref/crypto-architecture-v2.md (key distribution)
 */

import { eciesEncrypt, eciesDecrypt } from "./ecies.js";
import type { RistrettoPoint, Scalar, Nonce, EciesOutput } from "./types.js";

/**
 * Wrap a private key for a recipient.
 * Uses ECIES: each call generates a fresh ephemeral, so wrapping the same
 * key for the same recipient twice produces different ciphertext.
 *
 * @param privateKey - The key material to wrap (e.g., org private key)
 * @param recipientPublic - Recipient's ristretto255 public point
 * @returns ECIES output (ephemeral point, nonce, ciphertext)
 * @throws InvalidKeyError if recipientPublic is wrong length
 */
export function wrapKey(
  privateKey: Uint8Array,
  recipientPublic: RistrettoPoint,
): EciesOutput {
  return eciesEncrypt(privateKey, recipientPublic);
}

/**
 * Unwrap a private key using the recipient's private key.
 *
 * @param ephemeralPoint - Sender's ephemeral public point
 * @param nonce - Nonce used during wrapping
 * @param wrappedKey - Encrypted key material
 * @param recipientPrivate - Recipient's ristretto255 private scalar
 * @returns Unwrapped key material
 * @throws DecryptionError if key is wrong or ciphertext is tampered
 */
export function unwrapKey(
  ephemeralPoint: RistrettoPoint,
  nonce: Nonce,
  wrappedKey: Uint8Array,
  recipientPrivate: Scalar,
): Uint8Array {
  return eciesDecrypt(ephemeralPoint, nonce, wrappedKey, recipientPrivate);
}
