/**
 * Org keypair generation and sealed box encryption for the non-PII tier.
 *
 * The org keypair (Curve25519) is generated client-side during admin
 * onboarding. The public key is uploaded to the server; the secret key
 * is ECIES-wrapped per-volunteer and never leaves the browser unencrypted.
 *
 * sealForOrgKey() uses crypto_box_seal (anonymous sealed boxes) so that
 * any holder of the public key can encrypt, but only the secret key
 * holder can decrypt. Used for KB articles, branding, and org config.
 *
 * References:
 *   SEC-040  OWASP Cryptographic Storage
 *   libsodium docs: Sealed boxes (crypto_box_seal)
 */

import { requireSodium } from "./sodium.js";
import { CryptoError } from "./errors.js";

/**
 * Generate a Curve25519 keypair for the org non-PII tier.
 * Called once during admin onboarding. The caller must zero
 * the secretKey after wrapping it for storage.
 */
export function generateOrgKeypair(): {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
} {
  const sodium = requireSodium();
  const kp = sodium.crypto_box_keypair();
  return { publicKey: kp.publicKey, secretKey: kp.privateKey };
}

/**
 * Seal plaintext so only the org secret key holder can decrypt.
 * Uses crypto_box_seal (anonymous sealed box, Curve25519).
 *
 * @param plaintext - Data to encrypt (UTF-8 bytes or arbitrary)
 * @param orgPublicKey - 32-byte Curve25519 public key from org_config
 * @returns Ciphertext (plaintext.length + crypto_box_SEALBYTES bytes)
 */
export function sealForOrgKey(
  plaintext: Uint8Array,
  orgPublicKey: Uint8Array,
): Uint8Array {
  const sodium = requireSodium();
  if (orgPublicKey.length !== sodium.crypto_box_PUBLICKEYBYTES) {
    throw new CryptoError(
      "INVALID_KEY_LENGTH",
      `orgPublicKey must be ${String(sodium.crypto_box_PUBLICKEYBYTES)} bytes, got ${String(orgPublicKey.length)}`,
    );
  }
  return sodium.crypto_box_seal(plaintext, orgPublicKey);
}
