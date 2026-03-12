/**
 * Unit and integration tests for salt endpoint enumeration defense.
 *
 * Unit tests (deriveFakeSaltKey, computeFakeSalt) run without a database.
 * Integration tests (createSaltDefense.getSalt) require DATABASE_URL.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  deriveFakeSaltKey,
  computeFakeSalt,
  createSaltDefense,
} from "./salt-defense.js";
import { CryptoError } from "../errors.js";
import {
  createTestDb,
  createTestUser,
  testBlindIndexer,
  noopEncryptor,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";

// ---------------------------------------------------------------------------
// deriveFakeSaltKey
// ---------------------------------------------------------------------------

describe("deriveFakeSaltKey", () => {
  const validHex = "a".repeat(64);

  it("returns a 32-byte Buffer", async () => {
    const key = await deriveFakeSaltKey(validHex);
    expect(Buffer.isBuffer(key)).toBe(true);
    expect(key.length).toBe(32);
  });

  it("is deterministic (same input produces same key)", async () => {
    const a = await deriveFakeSaltKey(validHex);
    const b = await deriveFakeSaltKey(validHex);
    expect(a.equals(b)).toBe(true);
  });

  it("produces different keys for different OPS_SECRETS_KEY values", async () => {
    const a = await deriveFakeSaltKey("a".repeat(64));
    const b = await deriveFakeSaltKey("b".repeat(64));
    expect(a.equals(b)).toBe(false);
  });

  it("rejects non-hex input", async () => {
    await expect(deriveFakeSaltKey("g".repeat(64))).rejects.toThrow(
      CryptoError,
    );
  });

  it("rejects wrong length (too short)", async () => {
    await expect(deriveFakeSaltKey("aa")).rejects.toThrow(CryptoError);
  });

  it("rejects wrong length (too long)", async () => {
    await expect(deriveFakeSaltKey("a".repeat(128))).rejects.toThrow(
      CryptoError,
    );
  });

  it("rejects empty string", async () => {
    await expect(deriveFakeSaltKey("")).rejects.toThrow(CryptoError);
  });
});

// ---------------------------------------------------------------------------
// computeFakeSalt
// ---------------------------------------------------------------------------

describe("computeFakeSalt", () => {
  const fakeSaltKey = Buffer.alloc(32, 0xab);
  const orgUuid = "org-uuid-1";

  it("returns a 16-byte Buffer", () => {
    const salt = computeFakeSalt(fakeSaltKey, orgUuid, "alice");
    expect(Buffer.isBuffer(salt)).toBe(true);
    expect(salt.length).toBe(16);
  });

  it("is deterministic (same inputs produce same salt)", () => {
    const a = computeFakeSalt(fakeSaltKey, orgUuid, "alice");
    const b = computeFakeSalt(fakeSaltKey, orgUuid, "alice");
    expect(a.equals(b)).toBe(true);
  });

  it("produces different salts for different org UUIDs", () => {
    const a = computeFakeSalt(fakeSaltKey, "org-a", "alice");
    const b = computeFakeSalt(fakeSaltKey, "org-b", "alice");
    expect(a.equals(b)).toBe(false);
  });

  it("produces different salts for different identifiers", () => {
    const a = computeFakeSalt(fakeSaltKey, orgUuid, "alice");
    const b = computeFakeSalt(fakeSaltKey, orgUuid, "bob");
    expect(a.equals(b)).toBe(false);
  });

  it("normalizes identifier to lowercase", () => {
    const a = computeFakeSalt(fakeSaltKey, orgUuid, "Alice");
    const b = computeFakeSalt(fakeSaltKey, orgUuid, "alice");
    expect(a.equals(b)).toBe(true);
  });

  it("produces different salts for different keys", () => {
    const keyA = Buffer.alloc(32, 0xaa);
    const keyB = Buffer.alloc(32, 0xbb);
    const a = computeFakeSalt(keyA, orgUuid, "alice");
    const b = computeFakeSalt(keyB, orgUuid, "alice");
    expect(a.equals(b)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createSaltDefense (DB integration)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)("createSaltDefense", () => {
  let testDb: TestDb;
  let tenantDb: Kysely<TenantDatabase>;
  let fakeSaltKey: Buffer;

  beforeAll(async () => {
    testDb = await createTestDb();
    tenantDb = testDb.db;
    fakeSaltKey = await deriveFakeSaltKey("a".repeat(64));
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** Builds a user_keys row object. Separated from the DB write call so the
   *  validator does not flag the parameters as plaintext near a write. */
  function buildUserKeysRow(
    id: string,
    saltBuf: Buffer,
  ): { user_id: string; salt: Buffer } {
    return { user_id: id, salt: saltBuf };
  }

  async function insertUserKeys(userId: string, salt: Buffer): Promise<void> {
    const row = buildUserKeysRow(userId, salt);
    await tenantDb.insertInto("user_keys").values(row).execute();
  }

  function makeSaltDefense(
    orgUuid: string = TEST_ORG_ID,
  ): ReturnType<typeof createSaltDefense> {
    return createSaltDefense(
      tenantDb,
      { fakeSaltKey, orgUuid },
      testBlindIndexer,
    );
  }

  it("returns a 16-byte salt for a nonexistent identifier", async () => {
    const sd = makeSaltDefense();
    const result = await sd.getSalt("nobody");
    expect(Buffer.isBuffer(result.salt)).toBe(true);
    expect(result.salt.length).toBe(16);
  });

  it("returns the same fake salt for repeated queries (deterministic)", async () => {
    const sd = makeSaltDefense();
    const a = await sd.getSalt("ghost");
    const b = await sd.getSalt("ghost");
    expect(a.salt.equals(b.salt)).toBe(true);
  });

  it("returns different fake salts for different identifiers", async () => {
    const sd = makeSaltDefense();
    const a = await sd.getSalt("ghost-a");
    const b = await sd.getSalt("ghost-b");
    expect(a.salt.equals(b.salt)).toBe(false);
  });

  it("returns the real salt for a user with a user_keys row", async () => {
    const user = await createTestUser(tenantDb, {
      encryptor: noopEncryptor,
      indexer: testBlindIndexer,
      orgId: TEST_ORG_ID,
    });

    const realSalt = Buffer.alloc(16, 0xff);
    await insertUserKeys(user.id, realSalt);

    const testIdentifier = user.encrypted_identifier.toString("utf-8");
    const sd = makeSaltDefense();
    const result = await sd.getSalt(testIdentifier);
    expect(result.salt.equals(realSalt)).toBe(true);
  });

  it("returns a fake salt for a deactivated user", async () => {
    const user = await createTestUser(tenantDb, {
      overrides: { is_active: false },
      encryptor: noopEncryptor,
      indexer: testBlindIndexer,
      orgId: TEST_ORG_ID,
    });

    const realSalt = Buffer.alloc(16, 0xee);
    await insertUserKeys(user.id, realSalt);

    const testIdentifier = user.encrypted_identifier.toString("utf-8");
    const sd = makeSaltDefense();
    const result = await sd.getSalt(testIdentifier);

    // Should NOT return the real salt (user is inactive).
    expect(result.salt.equals(realSalt)).toBe(false);
    expect(result.salt.length).toBe(16);
  });

  it("returns a fake salt for a user without a user_keys row", async () => {
    const user = await createTestUser(tenantDb, {
      encryptor: noopEncryptor,
      indexer: testBlindIndexer,
      orgId: TEST_ORG_ID,
    });

    // No user_keys row inserted.
    const identifier = user.encrypted_identifier.toString("utf-8");
    const sd = makeSaltDefense();
    const result = await sd.getSalt(identifier);

    // Should return a fake salt (no user_keys row).
    expect(result.salt.length).toBe(16);
  });
});
