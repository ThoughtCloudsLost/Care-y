import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomBytes } from "node:crypto";
import { createTestDb, type TestDb } from "../test-utils.js";
import { createOprfAuditLogger, type OprfAuditLogger } from "./oprf-audit.js";

const TEST_OPS_KEY = Buffer.from(
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2",
  "hex",
);

describe.skipIf(!process.env.DATABASE_URL)(
  "OprfAuditLogger (DB integration)",
  () => {
    let testDb: TestDb;
    let logger: OprfAuditLogger;
    let time: number;

    beforeAll(async () => {
      testDb = await createTestDb();
      time = Date.now();
      logger = createOprfAuditLogger(
        testDb.platformDb,
        TEST_OPS_KEY,
        () => time,
      );
    });

    afterAll(async () => {
      logger.dispose();
      // Clean up any rows we inserted
      await testDb.platformDb.deleteFrom("oprf_audit_log").execute();
      await testDb.cleanup();
    });

    it("inserts a row with hashed IP, userId, reason, and timestamp", async () => {
      const userId = crypto.randomUUID();
      await logger.logFailure(userId, "192.168.1.1", "rate_limited");

      const row = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirstOrThrow();

      expect(row.user_id).toBe(userId);
      expect(row.reason).toBe("rate_limited");
      expect(row.hashed_ip).toBeTruthy();
      expect(row.timestamp).toBeInstanceOf(Date);
    });

    it("hashed IP is deterministic for same IP on same day", async () => {
      const userId1 = crypto.randomUUID();
      const userId2 = crypto.randomUUID();

      await logger.logFailure(userId1, "10.0.0.1", "pow_required");
      await logger.logFailure(userId2, "10.0.0.1", "pow_invalid");

      const row1 = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .select("hashed_ip")
        .where("user_id", "=", userId1)
        .executeTakeFirstOrThrow();

      const row2 = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .select("hashed_ip")
        .where("user_id", "=", userId2)
        .executeTakeFirstOrThrow();

      expect(row1.hashed_ip).toBe(row2.hashed_ip);
    });

    it("hashed IP differs for different IPs on same day", async () => {
      const userId1 = crypto.randomUUID();
      const userId2 = crypto.randomUUID();

      await logger.logFailure(userId1, "10.0.0.1", "oprf_failed");
      await logger.logFailure(userId2, "10.0.0.2", "oprf_failed");

      const row1 = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .select("hashed_ip")
        .where("user_id", "=", userId1)
        .executeTakeFirstOrThrow();

      const row2 = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .select("hashed_ip")
        .where("user_id", "=", userId2)
        .executeTakeFirstOrThrow();

      expect(row1.hashed_ip).not.toBe(row2.hashed_ip);
    });

    it("hashed IP differs for same IP on different days", async () => {
      const userId1 = crypto.randomUUID();
      const userId2 = crypto.randomUUID();

      // Day 1
      time = new Date("2026-03-10T12:00:00Z").getTime();
      const logger1 = createOprfAuditLogger(
        testDb.platformDb,
        TEST_OPS_KEY,
        () => time,
      );
      await logger1.logFailure(userId1, "172.16.0.1", "rate_limited");
      logger1.dispose();

      // Day 2
      time = new Date("2026-03-11T12:00:00Z").getTime();
      const logger2 = createOprfAuditLogger(
        testDb.platformDb,
        TEST_OPS_KEY,
        () => time,
      );
      await logger2.logFailure(userId2, "172.16.0.1", "rate_limited");
      logger2.dispose();

      const row1 = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .select("hashed_ip")
        .where("user_id", "=", userId1)
        .executeTakeFirstOrThrow();

      const row2 = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .select("hashed_ip")
        .where("user_id", "=", userId2)
        .executeTakeFirstOrThrow();

      expect(row1.hashed_ip).not.toBe(row2.hashed_ip);
    });

    it("raw IP never appears in the stored row", async () => {
      const userId = crypto.randomUUID();
      const rawIp = `test-ip-${randomBytes(4).toString("hex")}`;

      await logger.logFailure(userId, rawIp, "session_mismatch");

      const row = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirstOrThrow();

      expect(row.hashed_ip).not.toContain(rawIp);
      expect(JSON.stringify(row)).not.toContain(rawIp);
    });
  },
);
