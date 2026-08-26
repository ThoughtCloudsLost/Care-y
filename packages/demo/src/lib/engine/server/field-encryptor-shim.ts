/**
 * Shim for packages/server/src/crypto/field-encryptor.ts
 *
 * Replaces sodium-native with libsodium-wrappers-sumo.
 * Replaces node:crypto hkdfSync/createHmac with the node-crypto-shim.
 *
 * Mirrors: packages/server/src/crypto/field-encryptor.ts:1-196
 */

import _sodium from "libsodium-wrappers-sumo";
import { hkdfSync, createHmac } from "./node-crypto-shim.js";
import { assertSodiumReady } from "./sodium-ready.js";
import type {
  OrgId,
  IdentifierHash,
  UsernameHash,
  PhoneHash,
  OpsPhoneHash,
} from "@care-y/shared";

class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CryptoError";
  }
}

// ── Interfaces (same as server) ─────────────────────────────────────

export interface FieldEncryptor {
  encrypt(plaintext: string): Buffer;
  encryptBuffer(plaintext: Buffer): Buffer;
  decrypt(ciphertext: Buffer): string;
  decryptToBuffer(ciphertext: Buffer): Buffer;
}

export interface BlindIndexer {
  hash(input: string, orgId: OrgId): string;
  hashBuffer(input: Buffer, orgId: OrgId): string;
  hashIdentifier(input: string, orgId: OrgId): IdentifierHash;
  hashUsername(input: string, orgId: OrgId): UsernameHash;
  hashPhone(input: string, orgId: OrgId): PhoneHash;
  hashPhoneBuffer(input: Buffer, orgId: OrgId): PhoneHash;
  hashConsultantPhoneBuffer(input: Buffer, orgId: OrgId): OpsPhoneHash;
}

export interface DerivedKeys {
  readonly blindIndexKey: Buffer;
  readonly fieldEncryptKey: Buffer;
}

// ── Key Derivation ──────────────────────────────────────────────────

const BLIND_INDEX_INFO = "care-y-blind-index-v1";
const FIELD_ENCRYPT_INFO = "care-y-field-encrypt-v1";
const REQUIRED_KEY_LENGTH = 32;

export function deriveKeys(opsSecretsKey: Buffer): DerivedKeys {
  assertSodiumReady();
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

// ── Field Encryption ────────────────────────────────────────────────

const NONCE_BYTES = 24; // crypto_secretbox_NONCEBYTES
const MAC_BYTES = 16; // crypto_secretbox_MACBYTES
const KEY_BYTES = 32; // crypto_secretbox_KEYBYTES

function decryptRaw(sealed: Buffer, key: Buffer): Buffer {
  if (sealed.length < NONCE_BYTES + MAC_BYTES) {
    throw new CryptoError("Ciphertext too short to contain nonce + MAC");
  }

  const nonce = new Uint8Array(sealed.subarray(0, NONCE_BYTES));
  const ciphertext = new Uint8Array(sealed.subarray(NONCE_BYTES));

  try {
    const plaintext = _sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      new Uint8Array(key),
    );
    return Buffer.from(plaintext);
  } catch (err: unknown) {
    throw new CryptoError(
      `Decryption failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function createFieldEncryptor(key: Buffer): FieldEncryptor {
  if (key.length !== KEY_BYTES) {
    throw new CryptoError(
      `Field encryption key must be ${String(KEY_BYTES)} bytes, got ${String(key.length)}`,
    );
  }

  const keyU8 = new Uint8Array(key);

  return {
    encrypt(plaintext: string): Buffer {
      const message = Buffer.from(plaintext, "utf-8");
      try {
        const nonce = _sodium.randombytes_buf(NONCE_BYTES);
        const ciphertext = _sodium.crypto_secretbox_easy(
          new Uint8Array(message),
          nonce,
          keyU8,
        );
        return Buffer.concat([Buffer.from(nonce), Buffer.from(ciphertext)]);
      } finally {
        message.fill(0);
      }
    },

    encryptBuffer(plaintext: Buffer): Buffer {
      try {
        const nonce = _sodium.randombytes_buf(NONCE_BYTES);
        const ciphertext = _sodium.crypto_secretbox_easy(
          new Uint8Array(plaintext),
          nonce,
          keyU8,
        );
        return Buffer.concat([Buffer.from(nonce), Buffer.from(ciphertext)]);
      } finally {
        plaintext.fill(0);
      }
    },

    decrypt(sealed: Buffer): string {
      const plaintext = decryptRaw(sealed, key);
      try {
        return plaintext.toString("utf-8");
      } finally {
        plaintext.fill(0);
      }
    },

    decryptToBuffer(sealed: Buffer): Buffer {
      try {
        return decryptRaw(sealed, key);
      } catch (err: unknown) {
        if (err instanceof CryptoError) throw err;
        throw new CryptoError(
          `Decryption failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
  };
}

// ── Blind Indexing ──────────────────────────────────────────────────

export function createBlindIndexer(key: Buffer): BlindIndexer {
  if (key.length !== REQUIRED_KEY_LENGTH) {
    throw new CryptoError(
      `Blind index key must be ${String(REQUIRED_KEY_LENGTH)} bytes, got ${String(key.length)}`,
    );
  }

  function hashRaw(input: string, orgId: OrgId): string {
    const normalized = input.toLowerCase().trim();
    return createHmac("sha256", key)
      .update(orgId + ":" + normalized)
      .digest("hex");
  }

  return {
    hash: hashRaw,
    hashBuffer(input: Buffer, orgId: OrgId): string {
      return hashRaw(input.toString("utf-8"), orgId);
    },
    hashIdentifier(input: string, orgId: OrgId): IdentifierHash {
      return hashRaw(input, orgId) as IdentifierHash;
    },
    hashUsername(input: string, orgId: OrgId): UsernameHash {
      return hashRaw(input, orgId) as UsernameHash;
    },
    hashPhone(input: string, orgId: OrgId): PhoneHash {
      return hashRaw(input, orgId) as PhoneHash;
    },
    hashPhoneBuffer(input: Buffer, orgId: OrgId): PhoneHash {
      return hashRaw(input.toString("utf-8"), orgId) as PhoneHash;
    },
    hashConsultantPhoneBuffer(input: Buffer, orgId: OrgId): OpsPhoneHash {
      return hashRaw(input.toString("utf-8"), orgId) as OpsPhoneHash;
    },
  };
}

// ── Test Helpers ────────────────────────────────────────────────────

export function createNoopFieldEncryptor(): FieldEncryptor {
  return {
    encrypt(plaintext: string): Buffer {
      return Buffer.from(plaintext, "utf-8");
    },
    encryptBuffer(plaintext: Buffer): Buffer {
      return Buffer.from(plaintext);
    },
    decrypt(ciphertext: Buffer): string {
      return ciphertext.toString("utf-8");
    },
    decryptToBuffer(ciphertext: Buffer): Buffer {
      return Buffer.from(ciphertext);
    },
  };
}
