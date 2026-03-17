/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> RistrettoPoint, Nonce) are the standard
   pattern for phantom-branded newtypes. The __brand field never exists at
   runtime; length is validated at each function boundary. */

/**
 * ECIES per-volunteer wrapping on ristretto255.
 *
 * Wraps a plaintext (typically a 32-byte ticket key) to a recipient's
 * public key using an ephemeral Diffie-Hellman exchange.
 *
 * Encrypt:
 *   1. ephemeral = random scalar
 *   2. E = ephemeral * G  (ephemeral public point)
 *   3. shared = ephemeral * recipientPublic  (ECDH)
 *   4. K = HKDF(shared, "care-y-ecies-wrap-v1")
 *   5. nonce = randombytes(24)  (defense-in-depth; SOG-32)
 *   6. ciphertext = crypto_secretbox(plaintext, nonce, K)
 *   7. Zero shared, K, and ephemeral
 *
 * Decrypt reverses steps 1-3 using the recipient's private key.
 *
 * Nonce reuse across wraps is harmless because each wrap uses a unique
 * ephemeral scalar, producing a unique derived key K. The nonce provides
 * defense-in-depth; the ephemeral scalar is the primary uniqueness guarantee.
 *
 * References:
 *   SEC-040  OWASP Cryptographic Storage (ECIES construction guidance)
 *   SEC-004  RFC 5869 (HKDF for ephemeral shared secret to wrap key)
 *   SEC-011  RFC 9496 (ristretto255 group for ECDH)
 *   SEC-052  libsodium crypto_secretbox (XSalsa20-Poly1305 for wrapping)
 *   SEC-053  libsodium ristretto255 API (scalarmult, scalar_random)
 *   SEC-054  libsodium memory management (memzero for shared secret, wrap key)
 */

import { requireSodium } from "./sodium.js";
import { hkdfDerive32 } from "./hkdf.js";
import { DecryptionError } from "./errors.js";
import { assertKeyLength, assertInputLength } from "./validation.js";
import {
  type RistrettoPoint,
  type Scalar,
  type Nonce,
  type EciesOutput,
  HKDF_LABELS,
} from "./types.js";

/**
 * ECIES encrypt on ristretto255.
 *
 * @param plaintext - Data to encrypt (typically a 32-byte ticket key)
 * @param recipientPublic - Recipient's ristretto255 public point
 * @returns Ephemeral point, nonce, and ciphertext
 * @throws InvalidKeyError if recipientPublic is wrong length
 */
export function eciesEncrypt(
  plaintext: Uint8Array,
  recipientPublic: RistrettoPoint,
): EciesOutput {
  const sodium = requireSodium();
  assertKeyLength(
    recipientPublic,
    sodium.crypto_core_ristretto255_BYTES,
    "Recipient public key",
  );

  // 1-2. Ephemeral keypair
  const ephemeral = sodium.crypto_core_ristretto255_scalar_random();
  const ephemeralPoint = sodium.crypto_scalarmult_ristretto255_base(ephemeral);

  // 3. ECDH shared secret
  const shared = sodium.crypto_scalarmult_ristretto255(
    ephemeral,
    recipientPublic,
  );

  // 4. Domain-separated key derivation
  const wrapKey = hkdfDerive32(shared, HKDF_LABELS.ECIES_WRAP);

  try {
    // 5. Random nonce (defense-in-depth)
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    // 6. Encrypt
    const ciphertext = sodium.crypto_secretbox_easy(plaintext, nonce, wrapKey);

    return {
      ephemeralPoint: ephemeralPoint as RistrettoPoint,
      nonce: nonce as Nonce,
      ciphertext,
    };
  } finally {
    sodium.memzero(ephemeral);
    sodium.memzero(shared);
    sodium.memzero(wrapKey);
  }
}

/**
 * ECIES decrypt on ristretto255.
 *
 * @param ephemeralPoint - The sender's ephemeral public point
 * @param nonce - The nonce used during encryption
 * @param ciphertext - The encrypted data (secretbox output)
 * @param recipientPrivate - Recipient's ristretto255 private scalar
 * @returns Decrypted plaintext
 * @throws InvalidKeyError if ephemeralPoint is wrong length
 * @throws InvalidInputError if nonce is wrong length
 * @throws DecryptionError if the key is wrong or ciphertext is tampered
 */
export function eciesDecrypt(
  ephemeralPoint: RistrettoPoint,
  nonce: Nonce,
  ciphertext: Uint8Array,
  recipientPrivate: Scalar,
): Uint8Array {
  const sodium = requireSodium();
  assertKeyLength(
    ephemeralPoint,
    sodium.crypto_core_ristretto255_BYTES,
    "Ephemeral point",
  );
  assertInputLength(nonce, sodium.crypto_secretbox_NONCEBYTES, "Nonce");

  // 1. ECDH
  const shared = sodium.crypto_scalarmult_ristretto255(
    recipientPrivate,
    ephemeralPoint,
  );

  // 2. Derive wrap key
  const wrapKey = hkdfDerive32(shared, HKDF_LABELS.ECIES_WRAP);

  // 3. Decrypt, zeroing intermediates on all exit paths
  try {
    return sodium.crypto_secretbox_open_easy(ciphertext, nonce, wrapKey);
  } catch {
    throw new DecryptionError(
      "ECIES decryption failed: wrong key or tampered ciphertext",
    );
  } finally {
    sodium.memzero(shared);
    sodium.memzero(wrapKey);
  }
}
