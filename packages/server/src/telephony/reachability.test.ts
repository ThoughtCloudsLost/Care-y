import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  classifyReachability,
  getReachabilityForUsers,
  type VolunteerReachability,
} from "./reachability.js";
import {
  createTestDb,
  createTestUser,
  type TestDb,
  testFieldEncryptor,
  testSealedBox,
} from "../test-utils.js";

// ---------------------------------------------------------------------------
// Pure classification (host-runnable, no DB)
// ---------------------------------------------------------------------------

describe("classifyReachability", () => {
  it("returns 'none' for null input", () => {
    expect(classifyReachability(null)).toBe("none");
  });

  it("returns 'unverified' when is_verified is false", () => {
    expect(
      classifyReachability({
        isVerified: false,
        smsPingsEnabled: false,
        hasOpsPhone: false,
      }),
    ).toBe("unverified");
  });

  it("returns 'unverified' even when pings enabled but not verified", () => {
    expect(
      classifyReachability({
        isVerified: false,
        smsPingsEnabled: true,
        hasOpsPhone: true,
      }),
    ).toBe("unverified");
  });

  it("returns 'verified' when verified with pings disabled", () => {
    expect(
      classifyReachability({
        isVerified: true,
        smsPingsEnabled: false,
        hasOpsPhone: false,
      }),
    ).toBe("verified");
  });

  it("returns 'verified' when verified with pings enabled but no OPS copy (mid re-verification)", () => {
    // This is the mid-reverification state: volunteer is verified, has pings
    // enabled, but the OPS copy was cleared during re-verification. The dispatch
    // fallback correctly routes to email during this window.
    expect(
      classifyReachability({
        isVerified: true,
        smsPingsEnabled: true,
        hasOpsPhone: false,
      }),
    ).toBe("verified");
  });

  it("returns 'verified_sms' when all three flags are true", () => {
    expect(
      classifyReachability({
        isVerified: true,
        smsPingsEnabled: true,
        hasOpsPhone: true,
      }),
    ).toBe("verified_sms");
  });

  it("returns 'verified' when verified with OPS copy but pings disabled", () => {
    expect(
      classifyReachability({
        isVerified: true,
        smsPingsEnabled: false,
        hasOpsPhone: true,
      }),
    ).toBe("verified");
  });

  // Truth table exhaustive coverage (2^3 boolean combos + null)
  const truthTable: Array<{
    row: {
      isVerified: boolean;
      smsPingsEnabled: boolean;
      hasOpsPhone: boolean;
    } | null;
    expected: VolunteerReachability;
  }> = [
    { row: null, expected: "none" },
    {
      row: { isVerified: false, smsPingsEnabled: false, hasOpsPhone: false },
      expected: "unverified",
    },
    {
      row: { isVerified: false, smsPingsEnabled: false, hasOpsPhone: true },
      expected: "unverified",
    },
    {
      row: { isVerified: false, smsPingsEnabled: true, hasOpsPhone: false },
      expected: "unverified",
    },
    {
      row: { isVerified: false, smsPingsEnabled: true, hasOpsPhone: true },
      expected: "unverified",
    },
    {
      row: { isVerified: true, smsPingsEnabled: false, hasOpsPhone: false },
      expected: "verified",
    },
    {
      row: { isVerified: true, smsPingsEnabled: false, hasOpsPhone: true },
      expected: "verified",
    },
    {
      row: { isVerified: true, smsPingsEnabled: true, hasOpsPhone: false },
      expected: "verified",
    },
    {
      row: { isVerified: true, smsPingsEnabled: true, hasOpsPhone: true },
      expected: "verified_sms",
    },
  ];

  it.each(truthTable)(
    "truth table: row=$row -> $expected",
    ({ row, expected }) => {
      expect(classifyReachability(row)).toBe(expected);
    },
  );
});

// ---------------------------------------------------------------------------
// Batch query helper (requires Docker / DATABASE_URL)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)("getReachabilityForUsers", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("returns empty map for empty input without querying", async () => {
    const result = await getReachabilityForUsers(testDb.db, []);
    expect(result.size).toBe(0);
  });

  it("returns 'none' for users with no consultant row", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const result = await getReachabilityForUsers(testDb.db, [user.id]);
    expect(result.get(user.id)).toBe("none");
  });

  it("returns 'unverified' for an unverified consultant", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await testDb.db
      .insertInto("consultants")
      .values({
        user_id: user.id,
        encrypted_phone: testSealedBox.sealBuffer(Buffer.from("+15550010001")),
        preferred_call_method: "phone_callback",
        is_verified: false,
        sms_pings_enabled: false,
      })
      .execute();

    const result = await getReachabilityForUsers(testDb.db, [user.id]);
    expect(result.get(user.id)).toBe("unverified");
  });

  it("returns 'verified' for a verified consultant without SMS opt-in", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await testDb.db
      .insertInto("consultants")
      .values({
        user_id: user.id,
        encrypted_phone: testSealedBox.sealBuffer(Buffer.from("+15550010002")),
        preferred_call_method: "phone_callback",
        is_verified: true,
        sms_pings_enabled: false,
      })
      .execute();

    const result = await getReachabilityForUsers(testDb.db, [user.id]);
    expect(result.get(user.id)).toBe("verified");
  });

  it("returns 'verified' for verified + pings enabled but NULL OPS copy (mid re-verification)", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    await testDb.db
      .insertInto("consultants")
      .values({
        user_id: user.id,
        encrypted_phone: testSealedBox.sealBuffer(Buffer.from("+15550010003")),
        preferred_call_method: "phone_callback",
        is_verified: true,
        sms_pings_enabled: true,
        // ops_encrypted_phone is NULL (not set)
      })
      .execute();

    const result = await getReachabilityForUsers(testDb.db, [user.id]);
    expect(result.get(user.id)).toBe("verified");
  });

  it("returns 'verified_sms' when all three conditions are met", async () => {
    const user = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    const fakeOpsEncrypted = testFieldEncryptor.encrypt("+15550010004");

    await testDb.db
      .insertInto("consultants")
      .values({
        user_id: user.id,
        encrypted_phone: testSealedBox.sealBuffer(Buffer.from("+15550010004")),
        preferred_call_method: "phone_callback",
        is_verified: true,
        sms_pings_enabled: true,
        ops_encrypted_phone: fakeOpsEncrypted,
      })
      .execute();

    const result = await getReachabilityForUsers(testDb.db, [user.id]);
    expect(result.get(user.id)).toBe("verified_sms");
  });

  it("batches multiple users in one query with mixed reachability", async () => {
    const userNone = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const userUnverified = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const userVerified = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });
    const userSms = await createTestUser(testDb.db, {
      encryptor: testFieldEncryptor,
    });

    // userNone has no consultant row

    await testDb.db
      .insertInto("consultants")
      .values({
        user_id: userUnverified.id,
        encrypted_phone: testSealedBox.sealBuffer(Buffer.from("+15550020001")),
        preferred_call_method: "phone_callback",
        is_verified: false,
        sms_pings_enabled: false,
      })
      .execute();

    await testDb.db
      .insertInto("consultants")
      .values({
        user_id: userVerified.id,
        encrypted_phone: testSealedBox.sealBuffer(Buffer.from("+15550020002")),
        preferred_call_method: "phone_callback",
        is_verified: true,
        sms_pings_enabled: false,
      })
      .execute();

    await testDb.db
      .insertInto("consultants")
      .values({
        user_id: userSms.id,
        encrypted_phone: testSealedBox.sealBuffer(Buffer.from("+15550020003")),
        preferred_call_method: "phone_callback",
        is_verified: true,
        sms_pings_enabled: true,
        ops_encrypted_phone: testFieldEncryptor.encrypt("+15550020003"),
      })
      .execute();

    const result = await getReachabilityForUsers(testDb.db, [
      userNone.id,
      userUnverified.id,
      userVerified.id,
      userSms.id,
    ]);

    expect(result.size).toBe(4);
    expect(result.get(userNone.id)).toBe("none");
    expect(result.get(userUnverified.id)).toBe("unverified");
    expect(result.get(userVerified.id)).toBe("verified");
    expect(result.get(userSms.id)).toBe("verified_sms");
  });
});
