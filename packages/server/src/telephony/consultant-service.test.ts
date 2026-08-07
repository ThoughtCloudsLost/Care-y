import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  type TestDb,
  TEST_ORG_ID,
  TEST_OPS_KEY,
  testBlindIndexer,
  testSealedBox,
  testFieldEncryptor,
  seedOrgPublicKey,
} from "../test-utils.js";
import {
  createConsultantService,
  type ConsultantService,
} from "./consultant-service.js";
import {
  NotFoundError,
  AuthError,
  RateLimitError,
  ValidationError,
} from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import { createHash } from "node:crypto";
import {
  deriveConsultantPhoneIndexKey,
  createBlindIndexer,
} from "../crypto/field-encryptor.js";

/** Reproduce the service's internal hashing for test verification. */
function hashCode(code: string): string {
  // care-y-ignore-next-line no-plaintext-db-write -- hashes a 6-digit verification code (not PII), never written to DB directly from tests
  return createHash("sha256").update(code).digest("hex");
}

/** Build verification artifacts from a phone string. */
function makeArtifacts(
  phone: string,
  wantsPings: boolean,
): {
  orgSealedPhone: Buffer;
  opsPhoneHash: string;
  opsEncryptedPhone: Buffer | null;
} {
  const consultantIndexKey = deriveConsultantPhoneIndexKey(TEST_OPS_KEY);
  const consultantIndexer = createBlindIndexer(consultantIndexKey);
  return {
    orgSealedPhone: testSealedBox.sealBuffer(Buffer.from(phone)),
    opsPhoneHash: consultantIndexer.hash(phone, TEST_ORG_ID),
    opsEncryptedPhone: wantsPings
      ? testFieldEncryptor.encryptBuffer(Buffer.from(phone))
      : null,
  };
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

  // --- getByUserId ---

  it("getByUserId returns null when no consultant exists", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const result = await service.getByUserId(user.id);
    expect(result).toBeNull();
  });

  // --- register (metadata-only, ADR-065) ---

  it("register creates a consultant with metadata only", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const result = await service.register(user.id, "phone_callback", false);

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
  });

  it("register does not generate verification codes (ADR-065)", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const result = await service.register(user.id, "phone_callback", false);

    const row = await testDb.db
      .selectFrom("consultants")
      .select(["verification_code_hash", "verification_expires_at"])
      .where("id", "=", result.id)
      .executeTakeFirstOrThrow();

    expect(row.verification_code_hash).toBeNull();
    expect(row.verification_expires_at).toBeNull();
  });

  it("getByUserId returns correct info after register", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await service.register(user.id, "webrtc", true);

    const info = await service.getByUserId(user.id);
    expect(info).not.toBeNull();
    expect(info!.isVerified).toBe(false);
    expect(info!.preferredCallMethod).toBe("webrtc");
    expect(info!.encryptedPhone).toBeNull();
    expect(info!.smsPingsEnabled).toBe(false);
    expect(info!.hasOpsPhone).toBe(false);
  });

  // --- prepareVerification ---

  it("prepareVerification stages artifacts and returns a code", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060001", false);
    const { code } = await service.prepareVerification(user.id, artifacts);

    expect(code).toMatch(/^\d{6}$/);

    // Row should have artifacts staged, is_verified false
    const row = await testDb.db
      .selectFrom("consultants")
      .select([
        "encrypted_phone",
        "ops_phone_hash",
        "is_verified",
        "verification_code_hash",
      ])
      .where("user_id", "=", user.id)
      .executeTakeFirstOrThrow();

    expect(row.encrypted_phone).not.toBeNull();
    expect(row.ops_phone_hash).toBe(artifacts.opsPhoneHash);
    expect(row.is_verified).toBe(false);
    expect(row.verification_code_hash).not.toBeNull();
    // Verify code hash matches
    expect(row.verification_code_hash).toBe(hashCode(code));
  });

  // --- Cooldown enforcement ---

  it("prepareVerification rejects within 60s cooldown", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060002", false);
    await service.prepareVerification(user.id, artifacts);

    // Second call within cooldown should throw
    await expect(
      service.prepareVerification(user.id, artifacts),
    ).rejects.toThrow(RateLimitError);
  });

  // --- Hourly cap enforcement ---

  it("prepareVerification rejects after 5 sends in an hour", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060003", false);

    // Seed the hourly counter to 5 via direct DB update
    await testDb.db
      .updateTable("consultants")
      .set({
        verify_sends_in_hour: 5,
        verify_sends_hour_start: new Date(),
        verify_last_sent_at: new Date(Date.now() - 120_000), // past cooldown
      })
      .where("user_id", "=", user.id)
      .execute();

    await expect(
      service.prepareVerification(user.id, artifacts),
    ).rejects.toThrow(RateLimitError);
  });

  it("hourly window rolls correctly after one hour", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060004", false);

    // Seed a full hourly count but with a window start over an hour ago
    const overAnHourAgo = new Date(Date.now() - 3_700_000);
    await testDb.db
      .updateTable("consultants")
      .set({
        verify_sends_in_hour: 5,
        verify_sends_hour_start: overAnHourAgo,
        verify_last_sent_at: new Date(Date.now() - 120_000), // past cooldown
      })
      .where("user_id", "=", user.id)
      .execute();

    // Should succeed because the hourly window has rolled
    const { code } = await service.prepareVerification(user.id, artifacts);
    expect(code).toMatch(/^\d{6}$/);
  });

  // --- verify ---

  it("verify success sets is_verified atomically", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060005", true);
    const { code } = await service.prepareVerification(user.id, artifacts);

    await service.verify(user.id, code);

    const info = await service.getByUserId(user.id);
    expect(info).not.toBeNull();
    expect(info!.isVerified).toBe(true);
  });

  it("verify with wrong code throws AuthError", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060006", false);
    await service.prepareVerification(user.id, artifacts);

    await expect(service.verify(user.id, "999999")).rejects.toThrow(AuthError);

    const info = await service.getByUserId(user.id);
    expect(info!.isVerified).toBe(false);
  });

  it("verify locks out after 3 wrong attempts", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060007", false);
    await service.prepareVerification(user.id, artifacts);

    // First two wrong attempts throw AuthError
    await expect(service.verify(user.id, "000001")).rejects.toThrow(AuthError);
    await expect(service.verify(user.id, "000002")).rejects.toThrow(AuthError);

    // Third wrong attempt throws ValidationError (TOO_MANY_ATTEMPTS) and clears code
    await expect(service.verify(user.id, "000003")).rejects.toThrow(
      ValidationError,
    );

    // Verify that code was cleared
    const row = await testDb.db
      .selectFrom("consultants")
      .select(["verification_code_hash", "verification_attempts"])
      .where("user_id", "=", user.id)
      .executeTakeFirstOrThrow();

    expect(row.verification_code_hash).toBeNull();
    expect(row.verification_attempts).toBe(0);
  });

  // --- Replace/delete atomicity ---

  it("second prepareVerification replaces all artifacts and resets is_verified", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts1 = makeArtifacts("+15550060010", false);
    const { code: code1 } = await service.prepareVerification(
      user.id,
      artifacts1,
    );
    await service.verify(user.id, code1);

    // Verified now, bypass cooldown for next send
    await testDb.db
      .updateTable("consultants")
      .set({ verify_last_sent_at: new Date(Date.now() - 120_000) })
      .where("user_id", "=", user.id)
      .execute();

    const artifacts2 = makeArtifacts("+15550060011", true);
    await service.prepareVerification(user.id, artifacts2);

    // All artifacts replaced, is_verified reset
    const row = await testDb.db
      .selectFrom("consultants")
      .select(["ops_phone_hash", "is_verified", "ops_encrypted_phone"])
      .where("user_id", "=", user.id)
      .executeTakeFirstOrThrow();

    expect(row.ops_phone_hash).toBe(artifacts2.opsPhoneHash);
    expect(row.is_verified).toBe(false);
    expect(row.ops_encrypted_phone).not.toBeNull();
  });

  it("delete clears encrypted_phone plus verified/ops trio atomically", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    const artifacts = makeArtifacts("+15550060012", true);
    const { code } = await service.prepareVerification(user.id, artifacts);
    await service.verify(user.id, code);

    await service.deleteByUserId(user.id);

    const info = await service.getByUserId(user.id);
    expect(info).toBeNull();
  });

  // --- setSmsPings ---

  it("setSmsPings(false) nulls the ops copy", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", true);

    const artifacts = makeArtifacts("+15550060013", true);
    const { code } = await service.prepareVerification(user.id, artifacts);
    await service.verify(user.id, code);

    // Enable pings (ops copy exists from verification with wantsPings=true)
    await service.setSmsPings(user.id, true);
    let info = await service.getByUserId(user.id);
    expect(info!.smsPingsEnabled).toBe(true);
    expect(info!.hasOpsPhone).toBe(true);

    // Disable pings
    await service.setSmsPings(user.id, false);
    info = await service.getByUserId(user.id);
    expect(info!.smsPingsEnabled).toBe(false);
    expect(info!.hasOpsPhone).toBe(false);
  });

  it("setSmsPings(true) without plaintext throws REVERIFICATION_REQUIRED", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

    // Verify without opting into pings
    const artifacts = makeArtifacts("+15550060014", false);
    const { code } = await service.prepareVerification(user.id, artifacts);
    await service.verify(user.id, code);

    // Enabling pings should fail because ops copy is null
    await expect(service.setSmsPings(user.id, true)).rejects.toThrow(
      ValidationError,
    );

    try {
      await service.setSmsPings(user.id, true);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).message).toBe(
        ErrorCode.REVERIFICATION_REQUIRED,
      );
    }
  });

  // --- updatePreference ---

  it("updatePreference changes preferred call method", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    await service.register(user.id, "phone_callback", false);

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

  it("deleteByUserId throws NotFoundError for unknown user", async () => {
    await expect(
      service.deleteByUserId("00000000-0000-0000-0000-ffffffffffff"),
    ).rejects.toThrow(NotFoundError);
  });

  it("verify throws NotFoundError for unknown user", async () => {
    await expect(
      service.verify("00000000-0000-0000-0000-ffffffffffff", "123456"),
    ).rejects.toThrow(NotFoundError);
  });

  // --- Two-indexer label-split test ---

  it("consultant-phone-index and phones.phone_hash produce different hashes for the same number", () => {
    const phone = "+15551234567";

    // phones.phone_hash uses the default blind index key
    const phonesHash = testBlindIndexer.hash(phone, TEST_ORG_ID);

    // consultant phone uses the consultant-phone-index HKDF label
    const consultantIndexKey = deriveConsultantPhoneIndexKey(TEST_OPS_KEY);
    const consultantIndexer = createBlindIndexer(consultantIndexKey);
    const consultantHash = consultantIndexer.hash(phone, TEST_ORG_ID);

    // Same input, different HKDF labels, must produce different hashes
    expect(phonesHash).not.toBe(consultantHash);

    // Both are deterministic
    expect(testBlindIndexer.hash(phone, TEST_ORG_ID)).toBe(phonesHash);
    expect(consultantIndexer.hash(phone, TEST_ORG_ID)).toBe(consultantHash);
  });
});
