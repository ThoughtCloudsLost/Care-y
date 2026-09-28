/**
 * Integration tests for SMS verification code service.
 *
 * Covers: code generation and storage, successful verification (marks the
 * row consumed), wrong code rejection, attempt tracking, max attempts
 * exhaustion, expired code rejection, rate limiting (90s cooldown and hourly
 * cap of 3), single use under parallel verification, caller ID resolution
 * via phone purpose resolver.
 *
 * DB integration: requires Docker test containers (DATABASE_URL).
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createMockTelephonyProvider,
  type TestDb,
} from "../test-utils.js";
import { createSmsCodeService, type SmsCodeService } from "./sms-code.js";
import type {
  CallerIdResolver,
  OrgIdentifiers,
} from "../telephony/phone-resolver.js";
import { RateLimitError, ValidationError } from "../errors.js";
import type { OrgId, OrgSchema, E164 } from "@care-y/shared";
import { ErrorCode, e164Schema } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("SmsCodeService", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;

  beforeAll(async () => {
    testDb = await createTestDb();
    db = testDb.db;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const TEST_ORG_ID = "00000000-0000-4000-8000-000000000001" as OrgId;
  const TEST_ORG_SCHEMA =
    "org_00000000-0000-4000-8000-000000000001" as OrgSchema;
  const TEST_ORG: OrgIdentifiers = {
    orgId: TEST_ORG_ID,
    orgSchema: TEST_ORG_SCHEMA,
  };

  function mockResolver(
    number: E164 | null = e164Schema.parse("+15551234567"),
  ): CallerIdResolver {
    return vi.fn<CallerIdResolver>().mockResolvedValue(number);
  }

  function makeService(): {
    service: SmsCodeService;
    provider: ReturnType<typeof createMockTelephonyProvider>;
    resolveCallerId: CallerIdResolver;
  } {
    const provider = createMockTelephonyProvider();
    const resolveCallerId = mockResolver();
    return {
      service: createSmsCodeService(db, provider, resolveCallerId, TEST_ORG),
      provider,
      resolveCallerId,
    };
  }

  // --- sendCode ---

  describe("sendCode", () => {
    it("sends SMS with 6-digit code via provider", async () => {
      const user = await createTestUser(db);
      const { service, provider } = makeService();

      await service.sendCode(user.id, "+15559876543");

      expect(provider.smsCalls).toHaveLength(1);
      expect(provider.smsCalls[0]!.to).toBe("+15559876543");
      expect(provider.smsCalls[0]!.callerId).toBe("+15551234567");
      expect(provider.smsCalls[0]!.body).toMatch(/\d{6}/);
    });

    it("stores hashed code in DB (not plaintext)", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      const row = await db
        .selectFrom("sms_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      expect(row).toBeDefined();
      expect(row!.code_hash).toMatch(/^scrypt:/);
      expect(row!.consumed).toBe(false);
      expect(row!.attempts).toBe(0);
    });

    it("consumes the previous active code before creating a new one", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Push expires_at back so the created_at is > 90s ago (past cooldown)
      await db
        .updateTable("sms_codes")
        .set({
          expires_at: new Date(Date.now() - 90_000),
        })
        .where("user_id", "=", user.id)
        .execute();

      await service.sendCode(user.id, "+15559876543");

      const rows = await db
        .selectFrom("sms_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("consumed", "=", false)
        .execute();

      // Only the new code should remain unconsumed
      expect(rows.length).toBeLessThanOrEqual(1);
    });

    it("enforces 90s cooldown between codes", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Immediately requesting another hits cooldown
      await expect(service.sendCode(user.id, "+15559876543")).rejects.toThrow(
        RateLimitError,
      );
    });

    it("rate limits at 3 codes per hour, counting codes it replaced", async () => {
      const user = await createTestUser(db);
      const { service, provider } = makeService();

      // Only Date is faked: the DB driver keeps its real timers.
      vi.useFakeTimers({ toFake: ["Date"] });
      const start = Date.now();

      // 3 sends, each past the cooldown. Every send replaces the
      // previous code, and the replaced codes must still count.
      for (let i = 0; i < 3; i++) {
        vi.setSystemTime(start + i * 91_000);
        await service.sendCode(user.id, "+15559876543");
      }
      expect(provider.smsCalls).toHaveLength(3);

      vi.setSystemTime(start + 3 * 91_000);
      await expect(service.sendCode(user.id, "+15559876543")).rejects.toThrow(
        ErrorCode.RATE_LIMIT_HOURLY,
      );
      expect(provider.smsCalls).toHaveLength(3);
    });

    it("drops rows older than the hourly window on the next send", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      vi.useFakeTimers({ toFake: ["Date"] });
      const start = Date.now();

      await service.sendCode(user.id, "+15559876543");
      vi.setSystemTime(start + 2 * 60 * 60 * 1000);
      await service.sendCode(user.id, "+15559876543");

      const rows = await db
        .selectFrom("sms_codes")
        .select("consumed")
        .where("user_id", "=", user.id)
        .execute();
      expect(rows).toHaveLength(1);
      expect(rows[0]!.consumed).toBe(false);
    });

    it("throws ValidationError when resolver returns null (no phones)", async () => {
      const user = await createTestUser(db);
      const provider = createMockTelephonyProvider();
      const resolveCallerId = mockResolver(null);

      const service = createSmsCodeService(
        db,
        provider,
        resolveCallerId,
        TEST_ORG,
      );

      await expect(service.sendCode(user.id, "+15559876543")).rejects.toThrow(
        ValidationError,
      );
    });

    it("passes OrgIdentifiers (not a bare string) to the resolver", async () => {
      const user = await createTestUser(db);
      const { service, resolveCallerId } = makeService();

      await service.sendCode(user.id, "+15559876543");

      expect(resolveCallerId).toHaveBeenCalledWith(
        { orgId: TEST_ORG_ID, orgSchema: TEST_ORG_SCHEMA },
        "system",
      );
    });
  });

  // --- verifyCode ---

  describe("verifyCode", () => {
    it("accepts correct code and marks the row consumed", async () => {
      const user = await createTestUser(db);
      const { service, provider } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Extract the code from the SMS body
      const codeMatch = /(\d{6})/.exec(provider.smsCalls[0]!.body);
      expect(codeMatch).not.toBeNull();
      const code = codeMatch![1] as string;

      const result = await service.verifyCode(user.id, code);
      expect(result).toBe(true);

      // No active row remains, so the same code cannot be used again
      const row = await db
        .selectFrom("sms_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("consumed", "=", false)
        .executeTakeFirst();
      expect(row).toBeUndefined();
      await expect(service.verifyCode(user.id, code)).rejects.toThrow(
        ErrorCode.NO_ACTIVE_CODE,
      );
    });

    it("accepts a correct code exactly once under parallel use", async () => {
      const user = await createTestUser(db);
      const { service, provider } = makeService();

      await service.sendCode(user.id, "+15559876543");
      const codeMatch = /(\d{6})/.exec(provider.smsCalls[0]!.body);
      expect(codeMatch).not.toBeNull();
      const code = codeMatch![1] as string;

      const results = await Promise.all([
        service.verifyCode(user.id, code),
        service.verifyCode(user.id, code),
      ]);

      expect(results.filter((r) => r)).toHaveLength(1);
    });

    it("rejects wrong code and increments attempts", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      const result = await service.verifyCode(user.id, "000000");
      expect(result).toBe(false);

      // Check attempts incremented
      const row = await db
        .selectFrom("sms_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("consumed", "=", false)
        .executeTakeFirst();
      expect(row).toBeDefined();
      expect(row!.attempts).toBe(1);
    });

    it("consumes code after max attempts (3) and throws ValidationError", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Two wrong attempts (attempts go to 1, then 2)
      await service.verifyCode(user.id, "000000");
      await service.verifyCode(user.id, "000001");

      // Third wrong attempt consumes the code and throws
      await expect(service.verifyCode(user.id, "000002")).rejects.toThrow(
        ValidationError,
      );

      // No active row remains
      const row = await db
        .selectFrom("sms_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("consumed", "=", false)
        .executeTakeFirst();
      expect(row).toBeUndefined();
    });

    it("throws ValidationError when no active code exists", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await expect(service.verifyCode(user.id, "123456")).rejects.toThrow(
        ValidationError,
      );
    });

    it("throws ValidationError for expired code", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Expire the code
      await db
        .updateTable("sms_codes")
        .set({ expires_at: new Date(Date.now() - 1000) })
        .where("user_id", "=", user.id)
        .execute();

      await expect(service.verifyCode(user.id, "123456")).rejects.toThrow(
        ValidationError,
      );
    });

    it("throws ValidationError when row has max attempts already set", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Set attempts to 3 directly
      await db
        .updateTable("sms_codes")
        .set({ attempts: 3 })
        .where("user_id", "=", user.id)
        .execute();

      // Should detect max attempts and consume the code
      await expect(service.verifyCode(user.id, "123456")).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
