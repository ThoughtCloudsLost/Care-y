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
import type {
  OrgId,
  IdentifierHash,
  UsernameHash,
  PhoneHash,
  OpsPhoneHash,
} from "@care-y/shared";

// --- Interfaces ---

export interface FieldEncryptor {
  encrypt(plaintext: string): Buffer;
  /** Encrypts a Buffer directly without string conversion. Caller MUST zero
   *  the input after use. For relay-grade code paths where JS strings are
   *  prohibited (NEVER-Encryption: no JS strings for plaintext in relay). */
  encryptBuffer(plaintext: Buffer): Buffer;
  decrypt(ciphertext: Buffer): string;
  /** Returns plaintext as a Buffer. Caller MUST zero it after use. */
  decryptToBuffer(ciphertext: Buffer): Buffer;
}

export interface BlindIndexer {
  /**
   * The salt is the org UUID, not the schema name. Both are strings and the
   * two were mixed here, which silently split one org's blind index into two
   * incompatible domains: a caller known to the telephony path looked new to
   * the relay path, and a duplicate client was created with no error. The
   * brand is what keeps them apart now.
   */
  hash(input: string, orgId: OrgId): string;
  /** Hashes a Buffer directly without string conversion. For relay-grade
   *  code paths where JS strings are prohibited. The Buffer content is
   *  treated as UTF-8 and normalized (lowercase + trim) before hashing. */
  hashBuffer(input: Buffer, orgId: OrgId): string;

  /**
   * Hashes a volunteer login identifier, returning a branded IdentifierHash.
   * Delegates to the generic `hash` and casts once. Call sites that feed
   * `users.identifier_hash` should prefer this over the generic method.
   */
  hashIdentifier(input: string, orgId: OrgId): IdentifierHash;

  /**
   * Hashes a client portal username, returning a branded UsernameHash.
   * Same HMAC as hashIdentifier but a separate brand, keeping the two
   * entity types apart at the type level.
   */
  hashUsername(input: string, orgId: OrgId): UsernameHash;

  /**
   * Hashes a client phone number, returning a branded PhoneHash.
   * For `phones.phone_hash`, `phone_blocklist.phone_hash`, and
   * `two_factor_methods.sms_phone_hash`.
   */
  hashPhone(input: string, orgId: OrgId): PhoneHash;

  /**
   * Buffer variant of hashPhone for relay-grade code paths where JS
   * strings are prohibited (NEVER-Encryption: no JS strings for plaintext
   * in relay). Returns a branded PhoneHash.
   */
  hashPhoneBuffer(input: Buffer, orgId: OrgId): PhoneHash;

  /**
   * Hashes a consultant (volunteer) phone number under the consultant-keyed
   * indexer instance, returning a branded OpsPhoneHash. ADR-065 requires
   * that consultant phone hashes and client phone hashes stay in separate
   * key domains so volunteer numbers never surface as client merge
   * suggestions. This method's correctness depends on being called on the
   * consultant-keyed BlindIndexer instance (constructed with
   * deriveConsultantPhoneIndexKey). Calling it on the client-phone indexer
   * would produce a PhoneHash-equivalent value under the wrong brand.
   */
  hashConsultantPhoneBuffer(input: Buffer, orgId: OrgId): OpsPhoneHash;
}

export interface DerivedKeys {
  readonly blindIndexKey: Buffer;
  readonly fieldEncryptKey: Buffer;
}

// --- Key Derivation ---

const BLIND_INDEX_INFO = "care-y-blind-index-v1";
const FIELD_ENCRYPT_INFO = "care-y-field-encrypt-v1";
const CONSULTANT_PHONE_INDEX_INFO = "consultant-phone-index";
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

/**
 * Derives a blind-index key for consultant phone numbers under a separate
 * HKDF label ("consultant-phone-index"). This key MUST NOT be shared with
 * the phones.phone_hash indexer ("care-y-blind-index-v1"); a shared label
 * would surface volunteer numbers as client merge suggestions (ADR-065
 * domain separation).
 */
export function deriveConsultantPhoneIndexKey(opsSecretsKey: Buffer): Buffer {
  if (opsSecretsKey.length !== REQUIRED_KEY_LENGTH) {
    throw new CryptoError(
      `OPS_SECRETS_KEY must be exactly ${String(REQUIRED_KEY_LENGTH)} bytes, got ${String(opsSecretsKey.length)}`,
    );
  }
  return Buffer.from(
    hkdfSync(
      "sha256",
      opsSecretsKey,
      Buffer.alloc(0),
      CONSULTANT_PHONE_INDEX_INFO,
      32,
    ),
  );
}

// --- Field Encryption ---

function decryptRaw(sealed: Buffer, key: Buffer): Buffer {
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
      throw new CryptoError("Decryption failed: authentication tag mismatch");
    }
    return plaintext;
  } catch (err) {
    plaintext.fill(0);
    if (err instanceof CryptoError) throw err;
    throw new CryptoError(
      `Decryption failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

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

    encryptBuffer(plaintext: Buffer): Buffer {
      const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
      sodium.randombytes_buf(nonce);

      const ciphertext = Buffer.alloc(
        plaintext.length + sodium.crypto_secretbox_MACBYTES,
      );
      sodium.crypto_secretbox_easy(ciphertext, plaintext, nonce, key);

      return Buffer.concat([nonce, ciphertext]);
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
      } catch (err) {
        if (err instanceof CryptoError) throw err;
        throw new CryptoError(
          `Decryption failed: ${err instanceof Error ? err.message : String(err)}`,
        );
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
    hash(input: string, orgId: OrgId): string {
      const normalized = input.toLowerCase().trim();
      return createHmac("sha256", key)
        .update(orgId + ":" + normalized)
        .digest("hex");
    },

    hashBuffer(input: Buffer, orgId: OrgId): string {
      // Normalize by converting to lowercase + trim via a temporary Buffer.
      // The temporary is zeroed after use (relay-grade plaintext rule).
      const normalized = Buffer.from(
        input.toString("utf-8").toLowerCase().trim(),
      );
      try {
        return createHmac("sha256", key)
          .update(orgId + ":" + normalized.toString("utf-8"))
          .digest("hex");
      } finally {
        normalized.fill(0);
      }
    },

    hashIdentifier(input: string, orgId: OrgId): IdentifierHash {
      return this.hash(input, orgId) as IdentifierHash;
    },

    hashUsername(input: string, orgId: OrgId): UsernameHash {
      return this.hash(input, orgId) as UsernameHash;
    },

    hashPhone(input: string, orgId: OrgId): PhoneHash {
      return this.hash(input, orgId) as PhoneHash;
    },

    hashPhoneBuffer(input: Buffer, orgId: OrgId): PhoneHash {
      return this.hashBuffer(input, orgId) as PhoneHash;
    },

    hashConsultantPhoneBuffer(input: Buffer, orgId: OrgId): OpsPhoneHash {
      return this.hashBuffer(input, orgId) as OpsPhoneHash;
    },
  };
}

// --- Test Helpers ---

/**
 * Noop encryptor for tests that don't need to verify encryption.
 * Stores plaintext as-is in a Buffer and roundtrips without crypto.
 *
 * Refuses to construct under NODE_ENV=production. Call sites that encrypt PII
 * do not defensively zero their own copies, so a noop reaching production
 * would write plaintext PII to the database with nothing downstream to catch
 * it. Failing at construction turns that from a silent data leak into a
 * startup crash. `env.ts` rejects an unset NODE_ENV, so this check cannot be
 * bypassed by leaving the variable undefined in a deployed process.
 */
export function createNoopFieldEncryptor(): FieldEncryptor {
  if (process.env.NODE_ENV === "production") {
    throw new CryptoError(
      "createNoopFieldEncryptor is a test helper and must never be constructed in production",
    );
  }

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
