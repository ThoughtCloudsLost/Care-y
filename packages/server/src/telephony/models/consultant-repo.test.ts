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
} from "../../test-utils.js";
import {
  createConsultantRepository,
  type ConsultantRepository,
} from "./consultant-repo.js";

describe.skipIf(!process.env.DATABASE_URL)("ConsultantRepository", () => {
  let testDb: TestDb;
  let repo: ConsultantRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    repo = createConsultantRepository(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  function encryptedPhone(raw: string): Buffer {
    return testSealedBox.sealBuffer(Buffer.from(raw));
  }

  function consultantPhoneHash(raw: string): string {
    return testBlindIndexer.hash(raw, TEST_ORG_ID);
  }

  it("create inserts and findByUserId retrieves", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010001"),
      phoneHash: consultantPhoneHash("+15553010001"),
      preferredCallMethod: "phone_callback",
    });

    expect(consultant.id).toBeDefined();
    expect(consultant.userId).toBe(user.id);
    expect(consultant.isVerified).toBe(false);
    expect(consultant.preferredCallMethod).toBe("phone_callback");

    const found = await repo.findByUserId(user.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(consultant.id);
    expect(found!.userId).toBe(user.id);
    expect(Buffer.isBuffer(found!.encryptedPhone)).toBe(true);
    expect(found!.phoneHash).toBe(consultantPhoneHash("+15553010001"));
  });

  it("findByUserId returns null for unknown user", async () => {
    const found = await repo.findByUserId(
      "00000000-0000-0000-0000-ffffffffffff",
    );
    expect(found).toBeNull();
  });

  it("setVerificationCode stores hash and expiry", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010002"),
      phoneHash: consultantPhoneHash("+15553010002"),
      preferredCallMethod: "phone_callback",
    });

    const codeHash = "sha256-test-hash-value";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

    // Read the raw row to confirm the values were stored
    const row = await testDb.db
      .selectFrom("consultants")
      .select(["verification_code_hash", "verification_expires_at"])
      .where("id", "=", consultant.id)
      .executeTakeFirstOrThrow();

    expect(row.verification_code_hash).toBe(codeHash);
    expect(row.verification_expires_at).not.toBeNull();
  });

  it("verifyAndActivate returns true for correct hash before expiry and sets is_verified", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010003"),
      phoneHash: consultantPhoneHash("+15553010003"),
      preferredCallMethod: "phone_callback",
    });

    const codeHash = "valid-code-hash";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

    const now = new Date();
    const result = await repo.verifyAndActivate(consultant.id, codeHash, now);
    expect(result).toBe(true);

    // Confirm is_verified is now true
    const found = await repo.findByUserId(user.id);
    expect(found).not.toBeNull();
    expect(found!.isVerified).toBe(true);
  });

  it("verifyAndActivate returns false for wrong hash", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010004"),
      phoneHash: consultantPhoneHash("+15553010004"),
      preferredCallMethod: "phone_callback",
    });

    const codeHash = "correct-hash";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

    const result = await repo.verifyAndActivate(
      consultant.id,
      "wrong-hash",
      new Date(),
    );
    expect(result).toBe(false);

    // Confirm is_verified remains false
    const found = await repo.findByUserId(user.id);
    expect(found!.isVerified).toBe(false);
  });

  it("verifyAndActivate returns false after expiry", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010005"),
      phoneHash: consultantPhoneHash("+15553010005"),
      preferredCallMethod: "phone_callback",
    });

    const codeHash = "expired-code-hash";
    const pastExpiry = new Date(Date.now() - 60 * 1000); // expired 1 minute ago
    await repo.setVerificationCode(consultant.id, codeHash, pastExpiry);

    // Pass "now" as a time after the expiry
    const now = new Date();
    const result = await repo.verifyAndActivate(consultant.id, codeHash, now);
    expect(result).toBe(false);
  });

  it("updatePreferredCallMethod changes the method", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010006"),
      phoneHash: consultantPhoneHash("+15553010006"),
      preferredCallMethod: "phone_callback",
    });

    await repo.updatePreferredCallMethod(consultant.id, "webrtc");

    const found = await repo.findByUserId(user.id);
    expect(found).not.toBeNull();
    expect(found!.preferredCallMethod).toBe("webrtc");
  });

  it("delete removes the consultant", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010007"),
      phoneHash: consultantPhoneHash("+15553010007"),
      preferredCallMethod: "phone_callback",
    });

    await repo.delete(consultant.id);

    const found = await repo.findByUserId(user.id);
    expect(found).toBeNull();
  });

  it("verifyAndActivate returns false when no verification code was ever set", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010010"),
      phoneHash: consultantPhoneHash("+15553010010"),
      preferredCallMethod: "phone_callback",
    });

    // No call to setVerificationCode, so code_hash and expires_at are null
    const result = await repo.verifyAndActivate(
      consultant.id,
      "any-hash",
      new Date(),
    );
    expect(result).toBe(false);
    expect((await repo.findByUserId(user.id))!.isVerified).toBe(false);
  });

  it("verifyAndActivate returns false when code was already consumed", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010011"),
      phoneHash: consultantPhoneHash("+15553010011"),
      preferredCallMethod: "phone_callback",
    });

    const codeHash = "consume-test-hash";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

    // First verify succeeds and nulls out the code
    const first = await repo.verifyAndActivate(
      consultant.id,
      codeHash,
      new Date(),
    );
    expect(first).toBe(true);

    // Second verify with same hash fails (fields are now null)
    const second = await repo.verifyAndActivate(
      consultant.id,
      codeHash,
      new Date(),
    );
    expect(second).toBe(false);
  });

  it("duplicate user_id insert throws", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await repo.create({
      userId: user.id,
      encryptedPhone: encryptedPhone("+15553010008"),
      phoneHash: consultantPhoneHash("+15553010008"),
      preferredCallMethod: "phone_callback",
    });

    await expect(
      repo.create({
        userId: user.id,
        encryptedPhone: encryptedPhone("+15553010009"),
        phoneHash: consultantPhoneHash("+15553010009"),
        preferredCallMethod: "phone_callback",
      }),
    ).rejects.toThrow();
  });
});
