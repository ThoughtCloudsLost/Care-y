/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> Salt, Nonce) are the standard pattern
   for phantom-branded newtypes. The __brand field never exists at runtime;
   length is validated by libsodium constants at each boundary. */

/**
 * Passphrase-based escrow encryption for offline key backup.
 *
 * Protects OPRF keys and org keys for disaster recovery. Uses Argon2id
 * with heavier-than-login parameters (256 MB / 4 iterations; libsodium fixes
 * the lane count at 1) since escrow decryption runs on an admin workstation,
 * not a browser.
 *
 * All operations use Uint8Array exclusively. No JS string conversion of key
 * material (SOG-33). The caller converts from user input via TextEncoder.
 *
 * Serialization format: salt (16) || nonce (24) || ciphertext (variable)
 *
 * References:
 *   SEC-008  RFC 9106 Section 3.1 (Argon2id salt requirements)
 *   SEC-009  RFC 9106 Section 4 (Argon2id parameter choices, escrow-heavy params)
 *   SEC-041  OWASP Key Management (symmetric encryption for key backup)
 *   SEC-051  libsodium Argon2id (crypto_pwhash API)
 *   SEC-052  libsodium crypto_secretbox (XSalsa20-Poly1305 for escrow encryption)
 *   SEC-054  libsodium memory management (memzero for derived escrow key)
 *   SEC-164  Argon2 reference specification (256 MB / 4i escrow cost justification)
 */

import { requireSodium } from "./sodium.js";
import { DecryptionError, InvalidInputError } from "./errors.js";
import { concatBytes } from "./bytes.js";
import {
  ARGON2_ESCROW_PARAMS,
  type EscrowBlob,
  type Salt,
  type Nonce,
} from "./types.js";

/**
 * Derive a symmetric key from a passphrase using Argon2id (escrow params).
 * Shared by encrypt and decrypt to keep the derivation in one place.
 */
function deriveEscrowKey(passphrase: Uint8Array, salt: Uint8Array): Uint8Array {
  const sodium = requireSodium();
  return sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    passphrase,
    salt,
    ARGON2_ESCROW_PARAMS.iterations,
    ARGON2_ESCROW_PARAMS.memoryKiB * 1024, // libsodium expects bytes
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );
}

/**
 * Encrypt data with a passphrase for offline escrow storage.
 *
 * @param data - The secret to protect (OPRF key, org key, etc.)
 * @param passphrase - UTF-8 encoded passphrase (caller uses TextEncoder)
 * @returns EscrowBlob containing salt, nonce, and ciphertext
 * @throws InvalidInputError if passphrase is empty
 */
export function encryptWithPassphrase(
  data: Uint8Array,
  passphrase: Uint8Array,
): EscrowBlob {
  const sodium = requireSodium();

  if (passphrase.length === 0) {
    throw new InvalidInputError("Passphrase must not be empty");
  }

  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  const key = deriveEscrowKey(passphrase, salt);

  try {
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = sodium.crypto_secretbox_easy(data, nonce, key);

    return {
      salt: salt as Salt,
      nonce: nonce as Nonce,
      ciphertext,
    };
  } finally {
    sodium.memzero(key);
  }
}

/**
 * Decrypt escrow data with a passphrase.
 *
 * @param blob - EscrowBlob from encryptWithPassphrase
 * @param passphrase - UTF-8 encoded passphrase (same as used for encryption)
 * @returns Decrypted secret data
 * @throws DecryptionError if passphrase is wrong or data is corrupted
 */
export function decryptWithPassphrase(
  blob: EscrowBlob,
  passphrase: Uint8Array,
): Uint8Array {
  const sodium = requireSodium();

  const key = deriveEscrowKey(passphrase, blob.salt);

  try {
    return sodium.crypto_secretbox_open_easy(blob.ciphertext, blob.nonce, key);
  } catch {
    throw new DecryptionError(
      "Escrow decryption failed: wrong passphrase or corrupted data",
    );
  } finally {
    sodium.memzero(key);
  }
}

/**
 * Escrow serialization version byte.
 * v1 = Argon2id(256MB/4i) + XSalsa20-Poly1305.
 * If params or cipher change, bump the version and branch in deserialize.
 */
const ESCROW_VERSION = 0x01;

/**
 * Serialize an EscrowBlob to a single Uint8Array for file storage.
 * Format: version (1) || salt (16) || nonce (24) || ciphertext (variable)
 *
 * @param blob - EscrowBlob to serialize
 * @returns Single contiguous byte array with version prefix
 */
export function serializeEscrowBlob(blob: EscrowBlob): Uint8Array {
  return concatBytes(
    new Uint8Array([ESCROW_VERSION]),
    blob.salt,
    blob.nonce,
    blob.ciphertext,
  );
}

/**
 * Deserialize a Uint8Array back to an EscrowBlob.
 *
 * @param data - Serialized escrow blob (version || salt || nonce || ciphertext)
 * @returns Parsed EscrowBlob
 * @throws InvalidInputError if data is too short or version is unrecognized
 */
export function deserializeEscrowBlob(data: Uint8Array): EscrowBlob {
  const sodium = requireSodium();

  if (data.length < 1) {
    throw new InvalidInputError("Escrow blob is empty");
  }

  const version = data[0];
  if (version !== ESCROW_VERSION) {
    throw new InvalidInputError(
      `Unknown escrow version: ${String(version)} (expected ${String(ESCROW_VERSION)})`,
    );
  }

  const saltLen = sodium.crypto_pwhash_SALTBYTES;
  const nonceLen = sodium.crypto_secretbox_NONCEBYTES;
  // +1 for the version byte
  const minLen = 1 + saltLen + nonceLen + sodium.crypto_secretbox_MACBYTES;

  if (data.length < minLen) {
    throw new InvalidInputError(
      `Escrow blob too short: expected at least ${String(minLen)} bytes`,
    );
  }

  return {
    salt: data.subarray(1, 1 + saltLen) as Salt,
    nonce: data.subarray(1 + saltLen, 1 + saltLen + nonceLen) as Nonce,
    ciphertext: data.subarray(1 + saltLen + nonceLen),
  };
}
