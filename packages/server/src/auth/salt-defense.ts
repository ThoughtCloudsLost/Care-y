/**
 * Salt endpoint enumeration defense.
 *
 * Prevents user enumeration via the salt endpoint by generating deterministic
 * fake salts for nonexistent users. The constant-time contract ensures both
 * HMAC computation and DB query execute on every call, regardless of whether
 * the user exists. Per RFC 9807 section 6.3.2.2: "all operations should be
 * constant-time and independent of the bits of any secrets."
 *
 * The fake-salt HMAC key is derived from OPS_SECRETS_KEY via HKDF-SHA512 with
 * a domain-separated info label. Compromise of the derived key does not expose
 * OPS_SECRETS_KEY or other subkeys (field encryption, blind indexing).
 *
 * The OPRF login flow calls getSalt first: client gets salt, runs Argon2id
 * locally, then calls the OPRF endpoint.
 *
 * Login uses opaque identifiers (not email). The salt endpoint accepts an
 * identifier and uses BlindIndexer to compute the identifier_hash for DB
 * lookup (users table has no plaintext identifier column).
 */

import { hkdf, createHmac } from "node:crypto";
import { promisify } from "node:util";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import { CryptoError } from "../errors.js";
import type { OrgId, UserId } from "@care-y/shared";

const hkdfAsync = promisify(hkdf);

const FAKE_SALT_INFO = "care-y-fake-salt-v1";
const SALT_LENGTH = 16; // RFC 9106 section 3.1: 16 bytes RECOMMENDED
const DERIVED_KEY_LENGTH = 32; // HMAC-SHA256 key size

/**
 * Derives the fake-salt HMAC key from OPS_SECRETS_KEY at startup.
 * The derived key is isolated: compromise of fakeSaltKey does not expose OPS_SECRETS_KEY.
 *
 * Uses HKDF-SHA512 per RFC 5869 with domain-separated info label.
 * The returned Buffer is 32 bytes (HMAC-SHA256 key size).
 */
export async function deriveFakeSaltKey(
  opsSecretsKeyHex: string,
): Promise<Buffer> {
  if (
    opsSecretsKeyHex.length !== 64 ||
    !/^[0-9a-f]+$/i.test(opsSecretsKeyHex)
  ) {
    throw new CryptoError("OPS_SECRETS_KEY must be exactly 64 hex characters");
  }
  const ikm = Buffer.from(opsSecretsKeyHex, "hex");
  const derived = await hkdfAsync(
    "sha512",
    ikm,
    Buffer.alloc(0),
    FAKE_SALT_INFO,
    DERIVED_KEY_LENGTH,
  );
  return Buffer.from(derived);
}

/**
 * Computes a deterministic fake salt for a nonexistent user.
 * HMAC-SHA256(fakeSaltKey, orgUuid || identifier) truncated to 16 bytes.
 *
 * The orgUuid is immutable (not the mutable slug). A mutable slug would
 * cause behavioral changes on rename, re-enabling enumeration.
 * Per RFC 5869 section 3.2: KDF context inputs must be uniquely bound.
 */
export function computeFakeSalt(
  fakeSaltKey: Buffer,
  orgUuid: OrgId,
  identifier: string,
): Buffer {
  const hmac = createHmac("sha256", fakeSaltKey);
  hmac.update(orgUuid);
  hmac.update(identifier.toLowerCase());
  return hmac.digest().subarray(0, SALT_LENGTH);
}

/**
 * Derives a deterministic fake UUID v4 for a non-existent user.
 * HMAC-SHA256(fakeSaltKey, "fake-uuid:" + orgUuid + ":" + identifier), take first
 * 16 bytes, format as UUID v4 (version + variant bits set per RFC 9562 section 4.4).
 * Deterministic per (orgUuid, identifier) pair.
 */
export function computeFakeUuid(
  fakeSaltKey: Buffer,
  orgUuid: OrgId,
  identifier: string,
): UserId {
  const hmac = createHmac("sha256", fakeSaltKey);
  hmac.update("fake-uuid:");
  hmac.update(orgUuid);
  hmac.update(":");
  hmac.update(identifier.toLowerCase());
  const bytes = hmac.digest().subarray(0, 16);

  // Set version 4 (bits 4-7 of byte 6)
  const byte6 = bytes[6];
  const byte8 = bytes[8];
  if (byte6 === undefined || byte8 === undefined) {
    throw new CryptoError("HMAC digest too short for UUID generation");
  }
  bytes[6] = (byte6 & 0x0f) | 0x40;
  // Set variant 1 (bits 6-7 of byte 8)
  bytes[8] = (byte8 & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join("-") as UserId;
}

// --- SaltDefense interface and factory ---

export interface SaltDefenseConfig {
  readonly fakeSaltKey: Buffer;
  readonly orgUuid: OrgId;
}

export interface SaltLookupResult {
  /** The salt to return to the client (real or fake). Always 16 bytes. */
  readonly salt: Buffer;
  /** The user's UUID (real for existing users, deterministic fake for non-existent). */
  readonly userId: UserId;
}

export interface SaltDefense {
  /**
   * Returns the Argon2id salt for a given identifier. Always returns a
   * 16-byte salt, regardless of whether the user exists. Execution time
   * is constant (always performs both HMAC and DB query).
   */
  getSalt(identifier: string): Promise<SaltLookupResult>;
}

/**
 * Creates a SaltDefense instance scoped to a specific org.
 *
 * CONSTANT-TIME CONTRACT:
 * Both the HMAC computation and DB query execute on every call.
 * The result selection (real vs fake) uses only the DB result's
 * presence, not a timing-variable branch.
 *
 * The db parameter must be a tenantDb(orgSchema)-scoped Kysely instance
 * (from ctx.org.tenantDb). An unscoped instance would query the wrong schema.
 *
 * The indexer computes the blind index (HMAC-SHA256) of the identifier for
 * DB lookup. The users table stores identifier_hash, not plaintext identifiers.
 */
export function createSaltDefense(
  db: Kysely<TenantDatabase>,
  config: SaltDefenseConfig,
  indexer: BlindIndexer,
): SaltDefense {
  return {
    async getSalt(identifier: string): Promise<SaltLookupResult> {
      const normalized = identifier.toLowerCase().trim();

      // Compute the blind index for DB lookup (same HMAC as registration).
      const identifierHash = indexer.hashIdentifier(normalized, config.orgUuid);

      // ALWAYS execute both operations, regardless of user existence.
      // Parallel execution: both start immediately, neither is conditional.
      const [fakeSalt, dbResult] = await Promise.all([
        // 1. Compute fake salt (HMAC, microseconds)
        Promise.resolve(
          computeFakeSalt(config.fakeSaltKey, config.orgUuid, normalized),
        ),
        // 2. Query DB for real salt + userId (joins user_keys via users.identifier_hash)
        db
          .selectFrom("user_keys")
          .innerJoin("users", "users.id", "user_keys.user_id")
          .select(["user_keys.salt", "users.id as userId"])
          .where("users.identifier_hash", "=", identifierHash)
          .where("users.is_active", "=", true)
          .executeTakeFirst(),
      ]);

      // Select result: real salt + userId if user exists, fake values otherwise.
      // No timing difference: both values are already computed.
      const salt = dbResult?.salt ?? fakeSalt;
      const userId =
        dbResult?.userId ??
        computeFakeUuid(config.fakeSaltKey, config.orgUuid, normalized);

      return {
        salt: Buffer.isBuffer(salt) ? salt : Buffer.from(salt),
        userId,
      };
    },
  };
}
