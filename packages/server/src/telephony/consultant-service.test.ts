import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  type TestDb,
  TEST_ORG_ID,
  testBlindIndexer,
  testSealedBox,
  testFieldEncryptor,
  seedOrgPublicKey,
} from "../test-utils.js";
import {
  createConsultantService,
  type ConsultantService,
} from "./consultant-service.js";
import { NotFoundError, AuthError } from "../errors.js";
import { createHash } from "node:crypto";

/** Reproduce the service's internal hashing for test verification. */
function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

describe.skipIf(!process.env.DATABASE_URL)("ConsultantService", () => {
  let testDb: TestDb;
  let service: ConsultantService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    service = createConsultantService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  function encryptedPhone(raw: string): Buffer {
    return testSealedBox.sealBuffer(Buffer.from(raw));
  }

  function phoneHash(raw: string): string {
    return testBlindIndexer.hash(raw, TEST_ORG_ID);
  }

  // --- getByUserId ---

  it("getByUserId returns null when no consultant exists", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const result = await service.getByUserId(user.id);
    expect(result).toBeNull();
  });

  // --- register ---

  it("register creates a consultant and returns its id", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const result = await service.register(
      user.id,
      encryptedPhone("+15550050001"),
      phoneHash("+15550050001"),
      "phone_callback",
    );

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
  });

  // Persistence contract: verification codes must be stored as hashes, not plaintext
  it("register stores verification code hash in the database", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const result = await service.register(
      user.id,
      encryptedPhone("+15550050002"),
      phoneHash("+15550050002"),
      "phone_callback",
    );

    // Check that a verification code hash was stored
    const row = await testDb.db
      .selectFrom("consultants")
      .select(["verification_code_hash", "verification_expires_at"])
      .where("id", "=", result.id)
      .executeTakeFirstOrThrow();

    expect(row.verification_code_hash).not.toBeNull();
    expect(row.verification_expires_at).not.toBeNull();
  });

  // --- getByUserId after register ---

  it("getByUserId returns consultant info after register", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await service.register(
      user.id,
      encryptedPhone("+15550050003"),
      phoneHash("+15550050003"),
      "webrtc",
    );

    const info = await service.getByUserId(user.id);
    expect(info).not.toBeNull();
    expect(info!.isVerified).toBe(false);
    expect(info!.preferredCallMethod).toBe("webrtc");
  });

  // --- verify ---

  it("verify with correct code activates consultant", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const { id } = await service.register(
      user.id,
      encryptedPhone("+15550050004"),
      phoneHash("+15550050004"),
      "phone_callback",
    );

    // Read the stored code hash to derive a matching code.
    // The service uses randomInt internally, so we need to read the stored hash
    // and set up a matching code by writing directly to the DB.
    const knownCode = "123456";
    const knownHash = hashCode(knownCode);
    const futureExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await testDb.db
      .updateTable("consultants")
      .set({
        verification_code_hash: knownHash,
        verification_expires_at: futureExpiry,
      })
      .where("id", "=", id)
      .execute();

    await service.verify(user.id, knownCode);

    const info = await service.getByUserId(user.id);
    expect(info).not.toBeNull();
    expect(info!.isVerified).toBe(true);
  });

  it("verify with wrong code throws AuthError", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const { id } = await service.register(
      user.id,
      encryptedPhone("+15550050005"),
      phoneHash("+15550050005"),
      "phone_callback",
    );

    const knownCode = "111111";
    const knownHash = hashCode(knownCode);
    const futureExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await testDb.db
      .updateTable("consultants")
      .set({
        verification_code_hash: knownHash,
        verification_expires_at: futureExpiry,
      })
      .where("id", "=", id)
      .execute();

    await expect(service.verify(user.id, "999999")).rejects.toThrow(AuthError);

    // Should remain unverified
    const info = await service.getByUserId(user.id);
    expect(info!.isVerified).toBe(false);
  });

  it("verify with expired code throws AuthError", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const { id } = await service.register(
      user.id,
      encryptedPhone("+15550050006"),
      phoneHash("+15550050006"),
      "phone_callback",
    );

    const knownCode = "222222";
    const knownHash = hashCode(knownCode);
    // Set expiry in the past
    const pastExpiry = new Date(Date.now() - 60 * 1000);
    await testDb.db
      .updateTable("consultants")
      .set({
        verification_code_hash: knownHash,
        verification_expires_at: pastExpiry,
      })
      .where("id", "=", id)
      .execute();

    await expect(service.verify(user.id, knownCode)).rejects.toThrow(AuthError);

    const info = await service.getByUserId(user.id);
    expect(info!.isVerified).toBe(false);
  });

  it("verify throws NotFoundError for unknown user", async () => {
    await expect(
      service.verify("00000000-0000-0000-0000-ffffffffffff", "123456"),
    ).rejects.toThrow(NotFoundError);
  });

  // --- updatePreference ---

  it("updatePreference changes preferred call method", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await service.register(
      user.id,
      encryptedPhone("+15550050007"),
      phoneHash("+15550050007"),
      "phone_callback",
    );

    await service.updatePreference(user.id, "webrtc");

    const info = await service.getByUserId(user.id);
    expect(info).not.toBeNull();
    expect(info!.preferredCallMethod).toBe("webrtc");
  });

  it("updatePreference throws NotFoundError for unknown user", async () => {
    await expect(
      service.updatePreference(
        "00000000-0000-0000-0000-ffffffffffff",
        "webrtc",
      ),
    ).rejects.toThrow(NotFoundError);
  });

  // --- deleteByUserId ---

  it("deleteByUserId removes the consultant", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await service.register(
      user.id,
      encryptedPhone("+15550050008"),
      phoneHash("+15550050008"),
      "phone_callback",
    );

    await service.deleteByUserId(user.id);

    const info = await service.getByUserId(user.id);
    expect(info).toBeNull();
  });

  it("deleteByUserId throws NotFoundError for unknown user", async () => {
    await expect(
      service.deleteByUserId("00000000-0000-0000-0000-ffffffffffff"),
    ).rejects.toThrow(NotFoundError);
  });
});
