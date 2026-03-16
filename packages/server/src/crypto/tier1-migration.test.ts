import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestUser,
  createTestSession,
  testFieldEncryptor,
  type TestDb,
} from "../test-utils.js";
import { runTier1Migration } from "./tier1-migration.js";
import { createSealedBoxEncryptor } from "./sealed-box.js";
import type { SealedBoxEncryptor } from "./sealed-box.js";

/**
 * Generate a Curve25519 keypair using Node.js crypto. The raw public
 * key is the last 32 bytes of the SPKI DER encoding.
 */
function generateTestKeypair(): { publicKey: Buffer } {
  const kp = crypto.generateKeyPairSync("x25519");
  const spki = kp.publicKey.export({ type: "spki", format: "der" });
  return {
    publicKey: Buffer.from(spki.subarray(spki.length - 32)),
  };
}

/** Shorthand: create user with real secretbox encryption (not noop). */
function createEncryptedUser(db: TestDb["db"]) {
  return createTestUser(db, { encryptor: testFieldEncryptor });
}

/** Shorthand: create session with real secretbox encryption. */
function createEncryptedSession(db: TestDb["db"], userId: string) {
  return createTestSession(db, { user_id: userId }, testFieldEncryptor);
}

describe.skipIf(!process.env.DATABASE_URL)("runTier1Migration", () => {
  let testDb: TestDb;
  let sealedBox: SealedBoxEncryptor;

  beforeAll(async () => {
    testDb = await createTestDb();
    sealedBox = createSealedBoxEncryptor(generateTestKeypair().publicKey)!;
  });

  // runTier1Migration processes ALL rows in users and sessions.
  // Each test needs secretbox-encrypted rows as input, so we must
  // clear any sealed-box rows left by previous tests.
  beforeEach(async () => {
    await testDb.db.deleteFrom("sessions").execute();
    await testDb.db.deleteFrom("user_keys").execute();
    await testDb.db.deleteFrom("users").execute();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("re-encrypts user display_name from secretbox to sealed box", async () => {
    const user = await createEncryptedUser(testDb.db);

    const beforeRow = await testDb.db
      .selectFrom("users")
      .select("encrypted_display_name")
      .where("id", "=", user.id)
      .executeTakeFirstOrThrow();
    const originalCiphertext = Buffer.from(beforeRow.encrypted_display_name);

    const result = await runTier1Migration(
      testDb.db,
      testFieldEncryptor,
      sealedBox,
    );

    expect(result.usersProcessed).toBe(1);

    const afterRow = await testDb.db
      .selectFrom("users")
      .select("encrypted_display_name")
      .where("id", "=", user.id)
      .executeTakeFirstOrThrow();

    // Sealed box ciphertext differs from secretbox ciphertext
    expect(
      Buffer.compare(afterRow.encrypted_display_name, originalCiphertext),
    ).not.toBe(0);

    // Sealed box adds crypto_box_SEALBYTES (48) overhead, so the
    // ciphertext length will differ from the secretbox one
    expect(afterRow.encrypted_display_name.length).not.toBe(
      originalCiphertext.length,
    );
  });

  it("re-encrypts session ip_address and user_agent", async () => {
    const user = await createEncryptedUser(testDb.db);
    const session = await createEncryptedSession(testDb.db, user.id);

    const beforeRow = await testDb.db
      .selectFrom("sessions")
      .select(["encrypted_ip_address", "encrypted_user_agent"])
      .where("id", "=", session.id)
      .executeTakeFirstOrThrow();
    const originalIp = Buffer.from(beforeRow.encrypted_ip_address);
    const originalUa = Buffer.from(beforeRow.encrypted_user_agent);

    const result = await runTier1Migration(
      testDb.db,
      testFieldEncryptor,
      sealedBox,
    );

    expect(result.sessionsProcessed).toBe(1);

    const afterRow = await testDb.db
      .selectFrom("sessions")
      .select(["encrypted_ip_address", "encrypted_user_agent"])
      .where("id", "=", session.id)
      .executeTakeFirstOrThrow();

    expect(Buffer.compare(afterRow.encrypted_ip_address, originalIp)).not.toBe(
      0,
    );
    expect(Buffer.compare(afterRow.encrypted_user_agent, originalUa)).not.toBe(
      0,
    );
  });

  it("returns correct counts for multiple rows", async () => {
    const user1 = await createEncryptedUser(testDb.db);
    const user2 = await createEncryptedUser(testDb.db);
    await createEncryptedSession(testDb.db, user1.id);
    await createEncryptedSession(testDb.db, user2.id);
    await createEncryptedSession(testDb.db, user1.id);

    const result = await runTier1Migration(
      testDb.db,
      testFieldEncryptor,
      sealedBox,
    );

    expect(result.usersProcessed).toBe(2);
    expect(result.sessionsProcessed).toBe(3);
  });

  it("processes zero rows without error when tables are empty", async () => {
    const result = await runTier1Migration(
      testDb.db,
      testFieldEncryptor,
      sealedBox,
    );

    expect(result.usersProcessed).toBe(0);
    expect(result.sessionsProcessed).toBe(0);
  });
});
