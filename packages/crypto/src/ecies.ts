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
 *   4. K = HKDF(shared || E || recipientPublic, "care-y-ecies-wrap-v1")
 *   5. nonce = randombytes(24)  (defense-in-depth)
 *   6. ciphertext = crypto_secretbox(plaintext, nonce, K)
 *   7. Zero shared, ikm, K, and ephemeral
 *
 * The wrap key binds both public keys (E and recipientPublic), not just the
 * raw shared secret. Binding the parties into the KDF matches standard ECIES
 * guidance and ties each wrap to the exact ephemeral and recipient pair.
 *
 * Decrypt reverses steps 1-3, deriving recipientPublic from the private scalar
 * so the same binding is reconstructed without changing the call signature.
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
import { concatBytes } from "./bytes.js";
import { zeroAll } from "./mem.js";
import { DecryptionError, InvalidKeyError } from "./errors.js";
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

  let ephemeral: Uint8Array | null = null;
  let shared: Uint8Array | null = null;
  let ikm: Uint8Array | null = null;
  let wrapKey: Uint8Array | null = null;

  try {
    // 1-2. Ephemeral keypair
    ephemeral = sodium.crypto_core_ristretto255_scalar_random();
    const ephemeralPoint =
      sodium.crypto_scalarmult_ristretto255_base(ephemeral);

    // 3. ECDH shared secret. A wrong-length key is rejected above; an
    // identity or non-canonical point makes scalarmult fail, which we
    // surface as a typed key error rather than a raw sodium error.
    let sharedSecret: Uint8Array;
    try {
      sharedSecret = sodium.crypto_scalarmult_ristretto255(
        ephemeral,
        recipientPublic,
      );
    } catch {
      throw new InvalidKeyError(
        "Recipient public key is not a valid ristretto255 point",
      );
    }
    shared = sharedSecret;

    // 4. Domain-separated key derivation, binding both public keys so the
    // wrap key is tied to this exact ephemeral and recipient pair.
    ikm = concatBytes(sharedSecret, ephemeralPoint, recipientPublic);
    wrapKey = hkdfDerive32(ikm, HKDF_LABELS.ECIES_WRAP);

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
    zeroAll(ephemeral, shared, ikm, wrapKey);
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

  let shared: Uint8Array | null = null;
  let ikm: Uint8Array | null = null;
  let wrapKey: Uint8Array | null = null;

  try {
    // 1. ECDH shared secret, plus the recipient public key derived from the
    // private scalar so the wrap key binding matches eciesEncrypt. A malformed
    // ephemeral point or a zero private scalar makes scalarmult fail; surface
    // it as a decryption failure so a bad point is indistinguishable from a
    // wrong key.
    let sharedSecret: Uint8Array;
    let recipientPublic: Uint8Array;
    try {
      sharedSecret = sodium.crypto_scalarmult_ristretto255(
        recipientPrivate,
        ephemeralPoint,
      );
      recipientPublic =
        sodium.crypto_scalarmult_ristretto255_base(recipientPrivate);
    } catch {
      throw new DecryptionError(
        "ECIES decryption failed: wrong key or tampered ciphertext",
      );
    }
    shared = sharedSecret;

    // 2. Derive wrap key from the shared secret bound to both public keys.
    ikm = concatBytes(sharedSecret, ephemeralPoint, recipientPublic);
    wrapKey = hkdfDerive32(ikm, HKDF_LABELS.ECIES_WRAP);

    // 3. Decrypt
    try {
      return sodium.crypto_secretbox_open_easy(ciphertext, nonce, wrapKey);
    } catch {
      throw new DecryptionError(
        "ECIES decryption failed: wrong key or tampered ciphertext",
      );
    }
  } finally {
    zeroAll(shared, ikm, wrapKey);
  }
}
