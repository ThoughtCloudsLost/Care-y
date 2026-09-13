/**
 * Integration tests for email verification code service.
 *
 * Covers: code generation and storage, successful verification (deletes row),
 * wrong code rejection, attempt tracking, max attempts deletion, expired code
 * rejection, rate limiting (60s cooldown and hourly cap).
 *
 * DB integration: requires Docker test containers (DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
import type { CodeHash } from "@care-y/shared";

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

    it("deletes previous active code before creating new one", async () => {
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

    it("rate limits at 5 codes per hour", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      // Insert 5 code rows directly with recent timestamps
      const now = Date.now();
      for (let i = 0; i < 5; i++) {
        await db
          .insertInto("email_codes")
          .values({
            user_id: user.id,
            code_hash:
              `scrypt:${"aa".repeat(16)}:${"bb".repeat(32)}` as CodeHash,
            // expires_at set so that creation time (expires_at - 5min) is within the hour
            expires_at: new Date(now + 5 * 60 * 1000 - i * 60_000),
            consumed: true, // consumed so they don't interfere with cooldown
          })
          .execute();
      }

      // Attempting to send should hit hourly limit
      await expect(
        service.sendCode(user.id, "user@example.com"),
      ).rejects.toThrow(RateLimitError);
    });
  });

  // --- verifyCode ---

  describe("verifyCode", () => {
    it("accepts correct code and deletes the row", async () => {
      const user = await createTestUser(db);
      const { service, sender } = makeService();

      await service.sendCode(user.id, "user@example.com");

      // Extract the code from the email body
      const code = extractEmailCode(sender.calls[0]!.text);

      const result = await service.verifyCode(user.id, code);
      expect(result).toBe(true);

      // Row should be deleted (ADR-017)
      const row = await db
        .selectFrom("email_codes")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("consumed", "=", false)
        .executeTakeFirst();
      expect(row).toBeUndefined();
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

    it("deletes code after max attempts (3) and throws ValidationError", async () => {
      const user = await createTestUser(db);
      const { service } = makeService();

      await service.sendCode(user.id, "user@example.com");

      // Two wrong attempts (attempts go to 1, then 2)
      await service.verifyCode(user.id, "000000");
      await service.verifyCode(user.id, "000001");

      // Third wrong attempt should delete and throw
      await expect(service.verifyCode(user.id, "000002")).rejects.toThrow(
        ValidationError,
      );

      // Row should be deleted
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

      // Should detect max attempts and delete
      await expect(service.verifyCode(user.id, "123456")).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
