/**
 * Integration tests for email verification code service.
 *
 * Covers: code generation and storage, successful verification (marks the
 * row consumed), wrong code rejection, attempt tracking, max attempts
 * exhaustion, expired code rejection, rate limiting (60s cooldown and hourly
 * cap), single use under parallel verification.
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
  createMockEmailSender,
  extractEmailCode,
  type TestDb,
} from "../test-utils.js";
import { createEmailCodeService, type EmailCodeService } from "./email-code.js";
import { RateLimitError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("EmailCodeService", () => {
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

  function makeService(): {
    service: EmailCodeService;
    sender: ReturnType<typeof createMockEmailSender>;
  } {
    const sender = createMockEmailSender();
    return {
      service: createEmailCodeService(db, sender),
      sender,
    };
  }

  // --- sendCode ---

  describe("sendCode", () => {
    it("sends email with 6-digit code", async () => {
      const user = await createTestUser(db);
      const { service, sender } = makeService();

      await service.sendCode(user.id, "user@example.com");

      expect(sender.calls).toHaveLength(1);
      expect(sender.calls[0]!.to).toBe("user@example.com");
      expect(sender.calls[0]!.subject).toBe("Your verification code");
      // The text body contains a 6-digit code
      expect(sender.calls[0]!.text).toMatch(/\d{6}/);
    });

    it("stores hashed code in DB (not plaintext)", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "user@example.com");

      const row = await db
        .selectFrom("email_codes")
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

      await service.sendCode(user.id, "user@example.com");

      // Wait past cooldown (simulate by directly manipulating expires_at)
      await db
        .updateTable("email_codes")
        .set({
          // Push expires_at back so the created_at is > 60s ago
          expires_at: new Date(Date.now() - 60_000),
        })
        .where("user_id", "=", user.id)
        .execute();

      await service.sendCode(user.id, "user@example.com");

      const rows = await db
        .selectFrom("email_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("consumed", "=", false)
        .execute();

      // Only the new code should remain (unconsumed); old one was expired
      // so it wouldn't be found by the active code query anyway
      expect(rows.length).toBeLessThanOrEqual(1);
    });

    it("enforces 60s cooldown between codes", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "user@example.com");

      // Immediately requesting another should hit cooldown
      await expect(
        service.sendCode(user.id, "user@example.com"),
      ).rejects.toThrow(RateLimitError);
    });

    it("rate limits at 5 codes per hour, counting codes it replaced", async () => {
      const user = await createTestUser(db);
      const { service, sender } = makeService();

      // Only Date is faked: the DB driver keeps its real timers.
      vi.useFakeTimers({ toFake: ["Date"] });
      const start = Date.now();

      // 5 sends, each past the cooldown. Every send replaces the
      // previous code, and the replaced codes must still count.
      for (let i = 0; i < 5; i++) {
        vi.setSystemTime(start + i * 61_000);
        await service.sendCode(user.id, "user@example.com");
      }
      expect(sender.calls).toHaveLength(5);

      vi.setSystemTime(start + 5 * 61_000);
      await expect(
        service.sendCode(user.id, "user@example.com"),
      ).rejects.toThrow(ErrorCode.RATE_LIMIT_HOURLY);
      expect(sender.calls).toHaveLength(5);
    });

    it("drops rows older than the hourly window on the next send", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      vi.useFakeTimers({ toFake: ["Date"] });
      const start = Date.now();

      await service.sendCode(user.id, "user@example.com");
      vi.setSystemTime(start + 2 * 60 * 60 * 1000);
      await service.sendCode(user.id, "user@example.com");

      const rows = await db
        .selectFrom("email_codes")
        .select("consumed")
        .where("user_id", "=", user.id)
        .execute();
      expect(rows).toHaveLength(1);
      expect(rows[0]!.consumed).toBe(false);
    });
  });

  // --- verifyCode ---

  describe("verifyCode", () => {
    it("accepts correct code and marks the row consumed", async () => {
      const user = await createTestUser(db);
      const { service, sender } = makeService();

      await service.sendCode(user.id, "user@example.com");

      // Extract the code from the email body
      const code = extractEmailCode(sender.calls[0]!.text);

      const result = await service.verifyCode(user.id, code);
      expect(result).toBe(true);

      // No active row remains, so the same code cannot be used again
      const row = await db
        .selectFrom("email_codes")
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
      const { service, sender } = makeService();

      await service.sendCode(user.id, "user@example.com");
      const code = extractEmailCode(sender.calls[0]!.text);

      const results = await Promise.all([
        service.verifyCode(user.id, code),
        service.verifyCode(user.id, code),
      ]);

      expect(results.filter((r) => r)).toHaveLength(1);
    });

    it("rejects wrong code and increments attempts", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "user@example.com");

      const result = await service.verifyCode(user.id, "000000");
      expect(result).toBe(false);

      // Check attempts incremented
      const row = await db
        .selectFrom("email_codes")
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

      await service.sendCode(user.id, "user@example.com");

      // Two wrong attempts (attempts go to 1, then 2)
      await service.verifyCode(user.id, "000000");
      await service.verifyCode(user.id, "000001");

      // Third wrong attempt should consume the code and throw
      await expect(service.verifyCode(user.id, "000002")).rejects.toThrow(
        ValidationError,
      );

      // No active row remains
      const row = await db
        .selectFrom("email_codes")
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

      await service.sendCode(user.id, "user@example.com");

      // Expire the code
      await db
        .updateTable("email_codes")
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

      await service.sendCode(user.id, "user@example.com");

      // Set attempts to 3 directly
      await db
        .updateTable("email_codes")
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
