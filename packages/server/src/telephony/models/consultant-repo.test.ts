import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  type TestDb,
  TEST_ORG_ID,
  TEST_OPS_KEY,
  testSealedBox,
  testFieldEncryptor,
  seedOrgPublicKey,
} from "../../test-utils.js";
import {
  createConsultantRepository,
  type ConsultantRepository,
} from "./consultant-repo.js";
import {
  deriveConsultantPhoneIndexKey,
  createBlindIndexer,
} from "../../crypto/field-encryptor.js";

const consultantIndexKey = deriveConsultantPhoneIndexKey(TEST_OPS_KEY);
const consultantIndexer = createBlindIndexer(consultantIndexKey);

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

  function makeArtifacts(
    phone: string,
    wantsPings: boolean,
  ): {
    orgSealedPhone: Buffer;
    opsPhoneHash: string;
    opsEncryptedPhone: Buffer | null;
  } {
    return {
      orgSealedPhone: testSealedBox.sealBuffer(Buffer.from(phone)),
      opsPhoneHash: consultantIndexer.hash(phone, TEST_ORG_ID),
      opsEncryptedPhone: wantsPings
        ? testFieldEncryptor.encryptBuffer(Buffer.from(phone))
        : null,
    };
  }

  // --- create + findByUserId ---

  it("create inserts metadata-only and findByUserId retrieves", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    expect(consultant.id).toBeDefined();
    expect(consultant.userId).toBe(user.id);
    expect(consultant.isVerified).toBe(false);
    expect(consultant.preferredCallMethod).toBe("phone_callback");
    expect(consultant.encryptedPhone).toBeNull();
    expect(consultant.opsPhoneHash).toBeNull();
    expect(consultant.smsPingsEnabled).toBe(false);

    const found = await repo.findByUserId(user.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(consultant.id);
    expect(found!.userId).toBe(user.id);
  });

  it("findByUserId returns null for unknown user", async () => {
    const found = await repo.findByUserId(
      "00000000-0000-0000-0000-ffffffffffff",
    );
    expect(found).toBeNull();
  });

  // --- setVerificationCode ---

  it("setVerificationCode stores hash, expiry, and resets attempts", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const codeHash = "sha256-test-hash-value";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

    const row = await testDb.db
      .selectFrom("consultants")
      .select([
        "verification_code_hash",
        "verification_expires_at",
        "verification_attempts",
      ])
      .where("id", "=", consultant.id)
      .executeTakeFirstOrThrow();

    expect(row.verification_code_hash).toBe(codeHash);
    expect(row.verification_expires_at).not.toBeNull();
    expect(row.verification_attempts).toBe(0);
  });

  // --- stageVerification ---

  it("stageVerification stages artifacts when rate limits pass", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const consultant = await repo.findByUserId(user.id);
    const artifacts = makeArtifacts("+15553010020", true);
    const now = new Date();
    const cooldownNotBefore = new Date(now.getTime() - 60_000);
    const hourlyWindowNotBefore = new Date(now.getTime() - 3_600_000);

    const rows = await repo.stageVerification(
      consultant!.id,
      artifacts,
      "code-hash-1",
      new Date(now.getTime() + 900_000),
      now,
      cooldownNotBefore,
      hourlyWindowNotBefore,
      5,
    );

    expect(rows).toBe(1);

    const found = await repo.findByUserId(user.id);
    expect(found!.encryptedPhone).not.toBeNull();
    expect(found!.opsPhoneHash).toBe(artifacts.opsPhoneHash);
    expect(found!.opsEncryptedPhone).not.toBeNull();
    expect(found!.isVerified).toBe(false);
    expect(found!.verificationCodeHash).toBe("code-hash-1");
    expect(found!.verifySendsInHour).toBe(1);
  });

  it("stageVerification returns 0 when cooldown active", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const consultant = await repo.findByUserId(user.id);
    const artifacts = makeArtifacts("+15553010021", false);
    const now = new Date();

    // First call succeeds
    await repo.stageVerification(
      consultant!.id,
      artifacts,
      "hash-a",
      new Date(now.getTime() + 900_000),
      now,
      new Date(now.getTime() - 60_000),
      new Date(now.getTime() - 3_600_000),
      5,
    );

    // Second call with now = same time: cooldown threshold is now - 60s,
    // but verify_last_sent_at was just set to now, which is > now - 60s,
    // so the WHERE clause will not match.
    const rows = await repo.stageVerification(
      consultant!.id,
      artifacts,
      "hash-b",
      new Date(now.getTime() + 900_000),
      now,
      new Date(now.getTime() - 60_000),
      new Date(now.getTime() - 3_600_000),
      5,
    );

    expect(rows).toBe(0);
  });

  it("stageVerification returns 0 when hourly cap hit", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const consultant = await repo.findByUserId(user.id);

    // Seed counter to 5 within a current window
    const now = new Date();
    await testDb.db
      .updateTable("consultants")
      .set({
        verify_sends_in_hour: 5,
        verify_sends_hour_start: now,
        verify_last_sent_at: new Date(now.getTime() - 120_000), // past cooldown
      })
      .where("id", "=", consultant!.id)
      .execute();

    const artifacts = makeArtifacts("+15553010022", false);
    const rows = await repo.stageVerification(
      consultant!.id,
      artifacts,
      "hash-c",
      new Date(now.getTime() + 900_000),
      now,
      new Date(now.getTime() - 60_000),
      new Date(now.getTime() - 3_600_000),
      5,
    );

    expect(rows).toBe(0);
  });

  // --- verifyAndActivate ---

  it("verifyAndActivate returns true for correct hash before expiry", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const codeHash = "valid-code-hash";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

    const result = await repo.verifyAndActivate(
      consultant.id,
      codeHash,
      new Date(),
    );
    expect(result).toBe(true);

    const found = await repo.findByUserId(user.id);
    expect(found!.isVerified).toBe(true);
  });

  it("verifyAndActivate returns false for wrong hash", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
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

    const found = await repo.findByUserId(user.id);
    expect(found!.isVerified).toBe(false);
  });

  it("verifyAndActivate returns false after expiry", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const codeHash = "expired-code-hash";
    const pastExpiry = new Date(Date.now() - 60 * 1000);
    await repo.setVerificationCode(consultant.id, codeHash, pastExpiry);

    const result = await repo.verifyAndActivate(
      consultant.id,
      codeHash,
      new Date(),
    );
    expect(result).toBe(false);
  });

  it("verifyAndActivate returns false when no code was ever set", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

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
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const codeHash = "consume-test-hash";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

    const first = await repo.verifyAndActivate(
      consultant.id,
      codeHash,
      new Date(),
    );
    expect(first).toBe(true);

    const second = await repo.verifyAndActivate(
      consultant.id,
      codeHash,
      new Date(),
    );
    expect(second).toBe(false);
  });

  // --- incrementVerificationAttempts ---

  it("incrementVerificationAttempts returns new count", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    const count1 = await repo.incrementVerificationAttempts(consultant.id);
    expect(count1).toBe(1);

    const count2 = await repo.incrementVerificationAttempts(consultant.id);
    expect(count2).toBe(2);
  });

  // --- clearVerificationCode ---

  it("clearVerificationCode resets code, expiry, and attempts", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    await repo.setVerificationCode(
      consultant.id,
      "hash-to-clear",
      new Date(Date.now() + 600_000),
    );
    await repo.incrementVerificationAttempts(consultant.id);

    await repo.clearVerificationCode(consultant.id);

    const found = await repo.findByUserId(user.id);
    expect(found!.verificationCodeHash).toBeNull();
    expect(found!.verificationExpiresAt).toBeNull();
    expect(found!.verificationAttempts).toBe(0);
  });

  // --- updatePreferredCallMethod ---

  it("updatePreferredCallMethod changes the method", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    await repo.updatePreferredCallMethod(consultant.id, "webrtc");

    const found = await repo.findByUserId(user.id);
    expect(found!.preferredCallMethod).toBe("webrtc");
  });

  // --- setSmsPingsEnabled ---

  it("setSmsPingsEnabled(false) nulls ops_encrypted_phone", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    // Stage with ops copy
    const artifacts = makeArtifacts("+15553010030", true);
    const now = new Date();
    await repo.stageVerification(
      consultant.id,
      artifacts,
      "hash-sms",
      new Date(now.getTime() + 900_000),
      now,
      new Date(now.getTime() - 60_000),
      new Date(now.getTime() - 3_600_000),
      5,
    );

    await repo.setSmsPingsEnabled(consultant.id, true);
    let found = await repo.findByUserId(user.id);
    expect(found!.smsPingsEnabled).toBe(true);

    await repo.setSmsPingsEnabled(consultant.id, false);
    found = await repo.findByUserId(user.id);
    expect(found!.smsPingsEnabled).toBe(false);
    expect(found!.opsEncryptedPhone).toBeNull();
  });

  // --- delete ---

  it("delete removes the consultant", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const consultant = await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    await repo.delete(consultant.id);

    const found = await repo.findByUserId(user.id);
    expect(found).toBeNull();
  });

  // --- uniqueness ---

  it("duplicate user_id insert throws", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await repo.create({
      userId: user.id,
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: false,
    });

    await expect(
      repo.create({
        userId: user.id,
        preferredCallMethod: "phone_callback",
        smsPingsOptIn: false,
      }),
    ).rejects.toThrow();
  });
});
