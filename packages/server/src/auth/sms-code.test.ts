/**
 * Integration tests for SMS verification code service.
 *
 * Covers: code generation and storage, successful verification (deletes row),
 * wrong code rejection, attempt tracking, max attempts deletion, expired code
 * rejection, rate limiting (90s cooldown and hourly cap of 3), caller ID
 * resolution from provider config.
 *
 * DB integration: requires Docker test containers (DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createMockTelephonyProvider,
  type TestDb,
} from "../test-utils.js";
import { createSmsCodeService, type SmsCodeService } from "./sms-code.js";
import type { MaskedTelephonyConfig } from "../telephony/provider.js";
import { RateLimitError, ValidationError } from "../errors.js";

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

  function makeService(): {
    service: SmsCodeService;
    provider: ReturnType<typeof createMockTelephonyProvider>;
  } {
    const provider = createMockTelephonyProvider();
    return {
      service: createSmsCodeService(db, provider),
      provider,
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

    it("deletes previous active code before creating new one", async () => {
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

      // Only the new code should remain (unconsumed)
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

    it("rate limits at 3 codes per hour", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      // Insert 3 code rows directly with recent timestamps
      const now = Date.now();
      for (let i = 0; i < 3; i++) {
        await db
          .insertInto("sms_codes")
          .values({
            user_id: user.id,
            code_hash: `scrypt:${"aa".repeat(16)}:${"bb".repeat(32)}`,
            // expires_at set so creation time is within the hour
            expires_at: new Date(now + 5 * 60 * 1000 - i * 90_000),
            consumed: true, // consumed so they don't interfere with cooldown
          })
          .execute();
      }

      // Attempting to send hits hourly limit
      await expect(service.sendCode(user.id, "+15559876543")).rejects.toThrow(
        RateLimitError,
      );
    });

    it("throws ValidationError when provider has no phone numbers", async () => {
      const user = await createTestUser(db);
      const provider = createMockTelephonyProvider();

      // Override maskConfig to return empty phone numbers
      const emptyConfig: MaskedTelephonyConfig = {
        provider: "twilio",
        mode: "byot",
        maskedAccountId: "AC****1234",
        maskedAuthToken: "••••••••",
        phoneNumbers: [],
      };
      vi.spyOn(provider, "maskConfig").mockReturnValue(emptyConfig);

      const service = createSmsCodeService(db, provider);

      await expect(service.sendCode(user.id, "+15559876543")).rejects.toThrow(
        ValidationError,
      );
    });
  });

  // --- verifyCode ---

  describe("verifyCode", () => {
    it("accepts correct code and deletes the row", async () => {
      const user = await createTestUser(db);
      const { service, provider } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Extract the code from the SMS body
      const codeMatch = /(\d{6})/.exec(provider.smsCalls[0]!.body);
      expect(codeMatch).not.toBeNull();
      const code = codeMatch![1] as string;

      const result = await service.verifyCode(user.id, code);
      expect(result).toBe(true);

      // Row should be deleted
      const row = await db
        .selectFrom("sms_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("consumed", "=", false)
        .executeTakeFirst();
      expect(row).toBeUndefined();
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

    it("deletes code after max attempts (3) and throws ValidationError", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "+15559876543");

      // Two wrong attempts (attempts go to 1, then 2)
      await service.verifyCode(user.id, "000000");
      await service.verifyCode(user.id, "000001");

      // Third wrong attempt deletes and throws
      await expect(service.verifyCode(user.id, "000002")).rejects.toThrow(
        ValidationError,
      );

      // Row should be deleted
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

      // Should detect max attempts and delete
      await expect(service.verifyCode(user.id, "123456")).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
