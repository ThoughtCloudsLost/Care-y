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
 * On key rotation, the outgoing secret is encrypted under a chain key
 * derived from the incoming secret (old-under-new). Holders of the
 * current secret can walk back through the generation chain, while a
 * departed volunteer who kept an old secret cannot open anything sealed
 * after their removal.
 *
 * References:
 *   SEC-040  OWASP Cryptographic Storage
 *   SEC-238  Keybase per-team key generation chain
 *   libsodium docs: Sealed boxes (crypto_box_seal)
 */

import { requireSodium } from "./sodium.js";
import { CryptoError, DecryptionError, InvalidKeyError } from "./errors.js";
import { hkdfDerive32 } from "./hkdf.js";
import { HKDF_LABELS } from "./types.js";

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

/**
 * Derive the symmetric chain key used to seal a previous generation's
 * secret under the next generation's secret. Internal helper, not exported.
 */
function deriveChainKey(nextSecret: Uint8Array): Uint8Array {
  const sodium = requireSodium();
  if (nextSecret.length !== sodium.crypto_box_SECRETKEYBYTES) {
    throw new InvalidKeyError(
      `nextSecret must be ${String(sodium.crypto_box_SECRETKEYBYTES)} bytes, got ${String(nextSecret.length)}`,
    );
  }
  return hkdfDerive32(nextSecret, HKDF_LABELS.ORG_CHAIN);
}

/**
 * Seal the previous generation's org secret under the next generation's
 * secret. The previous secret is encrypted under the next, never the
 * reverse: holders of the current key can walk backward through the
 * chain, but a departed volunteer who retained an old secret cannot open
 * anything sealed after their removal.
 *
 * The caller still owns zeroing of both prevSecret and nextSecret.
 */
export function sealPrevGeneration(
  prevSecret: Uint8Array,
  nextSecret: Uint8Array,
): { ciphertext: Uint8Array; nonce: Uint8Array } {
  const sodium = requireSodium();
  if (prevSecret.length !== sodium.crypto_box_SECRETKEYBYTES) {
    throw new InvalidKeyError(
      `prevSecret must be ${String(sodium.crypto_box_SECRETKEYBYTES)} bytes, got ${String(prevSecret.length)}`,
    );
  }
  const chainKey = deriveChainKey(nextSecret);
  try {
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = sodium.crypto_secretbox_easy(
      prevSecret,
      nonce,
      chainKey,
    );
    return { ciphertext, nonce };
  } finally {
    sodium.memzero(chainKey);
  }
}

/**
 * Open a sealed previous-generation org secret using the next generation's
 * secret. Derives the same chain key that sealPrevGeneration used and
 * decrypts the ciphertext.
 *
 * @returns The previous generation's secret key (caller must zero it)
 * @throws DecryptionError if the MAC check fails (wrong key or tampered data)
 */
export function openPrevGeneration(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  nextSecret: Uint8Array,
): Uint8Array {
  const sodium = requireSodium();
  const chainKey = deriveChainKey(nextSecret);
  try {
    return sodium.crypto_secretbox_open_easy(ciphertext, nonce, chainKey);
  } catch {
    throw new DecryptionError(
      "Chain decryption failed: wrong key or corrupted data",
    );
  } finally {
    sodium.memzero(chainKey);
  }
}
