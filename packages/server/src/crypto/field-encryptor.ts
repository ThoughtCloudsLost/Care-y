/**
 * Field-level PII encryption and blind indexing for server-side data at rest.
 *
 * Encrypts volunteer identifiers and session metadata before they reach the DB.
 * These fields are operational PII that the server legitimately decrypts for login, lookup and session binding.
 *
 * Encryption: XSalsa20-Poly1305 via sodium-native (crypto_secretbox).
 * Blind index: HMAC-SHA256 via Node crypto (deterministic, for UNIQUE lookups).
 * Key derivation: HKDF-SHA256 from OPS_SECRETS_KEY with domain-separated info strings.
 *
 * Wire format: nonce(24) || mac+ciphertext(16+N) stored as bytea.
 */

import { hkdfSync } from "node:crypto";
import { createHmac } from "node:crypto";
import sodium from "sodium-native";
import { CryptoError } from "../errors.js";

// --- Interfaces ---

export interface FieldEncryptor {
  encrypt(plaintext: string): Buffer;
  decrypt(ciphertext: Buffer): string;
}

export interface BlindIndexer {
  hash(input: string, orgId: string): string;
}

export interface DerivedKeys {
  readonly blindIndexKey: Buffer;
  readonly fieldEncryptKey: Buffer;
}

// --- Key Derivation ---

const BLIND_INDEX_INFO = "care-y-blind-index-v1";
const FIELD_ENCRYPT_INFO = "care-y-field-encrypt-v1";
const REQUIRED_KEY_LENGTH = 32;

/**
 * Derives blind-index and field-encryption subkeys from OPS_SECRETS_KEY via HKDF.
 * Call once at startup, pass the results via dependency injection.
 */
export function deriveKeys(opsSecretsKey: Buffer): DerivedKeys {
  if (opsSecretsKey.length !== REQUIRED_KEY_LENGTH) {
    throw new CryptoError(
      `OPS_SECRETS_KEY must be exactly ${String(REQUIRED_KEY_LENGTH)} bytes, got ${String(opsSecretsKey.length)}`,
    );
  }

  const blindIndexKey = Buffer.from(
    hkdfSync("sha256", opsSecretsKey, Buffer.alloc(0), BLIND_INDEX_INFO, 32),
  );

  const fieldEncryptKey = Buffer.from(
    hkdfSync("sha256", opsSecretsKey, Buffer.alloc(0), FIELD_ENCRYPT_INFO, 32),
  );

  return { blindIndexKey, fieldEncryptKey };
}

// --- Field Encryption ---

/**
 * Creates a FieldEncryptor that uses XSalsa20-Poly1305 (crypto_secretbox).
 * Zeroes plaintext buffers in finally blocks to limit exposure in memory.
 */
export function createFieldEncryptor(key: Buffer): FieldEncryptor {
  if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new CryptoError(
      `Field encryption key must be ${String(sodium.crypto_secretbox_KEYBYTES)} bytes, got ${String(key.length)}`,
    );
  }

  return {
    encrypt(plaintext: string): Buffer {
      const message = Buffer.from(plaintext, "utf-8");
      try {
        const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
        sodium.randombytes_buf(nonce);

        const ciphertext = Buffer.alloc(
          message.length + sodium.crypto_secretbox_MACBYTES,
        );
        sodium.crypto_secretbox_easy(ciphertext, message, nonce, key);

        return Buffer.concat([nonce, ciphertext]);
      } finally {
        message.fill(0);
      }
    },

    decrypt(sealed: Buffer): string {
      if (
        sealed.length <
        sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES
      ) {
        throw new CryptoError("Ciphertext too short to contain nonce + MAC");
      }

      const nonce = sealed.subarray(0, sodium.crypto_secretbox_NONCEBYTES);
      const ciphertext = sealed.subarray(sodium.crypto_secretbox_NONCEBYTES);
      const plaintext = Buffer.alloc(
        ciphertext.length - sodium.crypto_secretbox_MACBYTES,
      );

      try {
        const ok = sodium.crypto_secretbox_open_easy(
          plaintext,
          ciphertext,
          nonce,
          key,
        );
        if (!ok) {
          throw new CryptoError(
            "Decryption failed: authentication tag mismatch",
          );
        }
        return plaintext.toString("utf-8");
      } catch (err) {
        if (err instanceof CryptoError) throw err;
        throw new CryptoError(
          `Decryption failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        plaintext.fill(0);
      }
    },
  };
}

// --- Blind Indexing ---

/**
 * Creates a BlindIndexer using HMAC-SHA256 via Node crypto.
 * Input is normalized (lowercase + trim) before hashing for case-insensitive lookup.
 * The orgId is prepended to the HMAC input to prevent cross-org correlation:
 * two users with the same username in different orgs produce different hashes.
 */
export function createBlindIndexer(key: Buffer): BlindIndexer {
  if (key.length !== REQUIRED_KEY_LENGTH) {
    throw new CryptoError(
      `Blind index key must be ${String(REQUIRED_KEY_LENGTH)} bytes, got ${String(key.length)}`,
    );
  }

  return {
    hash(input: string, orgId: string): string {
      const normalized = input.toLowerCase().trim();
      return createHmac("sha256", key)
        .update(orgId + ":" + normalized)
        .digest("hex");
    },
  };
}

// --- Test Helpers ---

/**
 * Noop encryptor for tests that don't need to verify encryption.
 * Stores plaintext as-is in a Buffer and roundtrips without crypto.
 * MUST NOT be used in production code.
 */
export function createNoopFieldEncryptor(): FieldEncryptor {
  return {
    encrypt(plaintext: string): Buffer {
      return Buffer.from(plaintext, "utf-8");
    },
    decrypt(ciphertext: Buffer): string {
      return ciphertext.toString("utf-8");
    },
  };
}
