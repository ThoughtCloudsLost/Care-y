import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomBytes } from "node:crypto";
import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { createTestDb, type TestDb } from "../test-utils.js";
import { createOprfAuditLogger, type OprfAuditLogger } from "./oprf-audit.js";
import { main as migrateMain } from "../db/migrate.js";
import { pool as processPool } from "../db/db.js";
import type { PlatformDatabase } from "../db/types.js";
import type { HashedIp, UserId } from "@care-y/shared";

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
      // Clean up any rows we inserted
      await testDb.platformDb.deleteFrom("oprf_audit_log").execute();
      await testDb.cleanup();
      // Importing migrate.ts builds db.ts's process pool. It never connected
      // here; end() releases it without a round trip.
      await processPool.end();
    });

    it("schedules no cleanup interval; retention runs from the admin-role prune", () => {
      const intervalSpy = vi.spyOn(globalThis, "setInterval");
      try {
        createOprfAuditLogger(testDb.platformDb, TEST_OPS_KEY, () => time);
        expect(intervalSpy).not.toHaveBeenCalled();
      } finally {
        intervalSpy.mockRestore();
      }
    });

    it("migrate.ts --prune-oprf-audit deletes only rows past the 7-day retention", async () => {
      const dayMs = 24 * 60 * 60 * 1000;
      const oldSubject = crypto.randomUUID();
      const recentSubject = crypto.randomUUID();
      await testDb.platformDb
        .insertInto("oprf_audit_log")
        .values([
          {
            user_id: oldSubject,
            hashed_ip: "prune-test-old" as HashedIp,
            reason: "rate_limited",
            timestamp: new Date(Date.now() - 8 * dayMs),
          },
          {
            user_id: recentSubject,
            hashed_ip: "prune-test-recent" as HashedIp,
            reason: "rate_limited",
            timestamp: new Date(Date.now() - 6 * dayMs),
          },
        ])
        .execute();

      // main() needs a pool next to the platform instance; the prune uses
      // only the instance. Both close at the end of the case.
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 2,
      });
      const adminDb = new Kysely<PlatformDatabase>({
        dialect: new PostgresDialect({ pool }),
      });
      const logSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => undefined);
      try {
        await migrateMain(["--prune-oprf-audit"], { db: adminDb, pool });
      } finally {
        logSpy.mockRestore();
        await adminDb.destroy();
      }

      const remaining = await testDb.platformDb
        .selectFrom("oprf_audit_log")
        .select("user_id")
        .where("user_id", "in", [oldSubject, recentSubject])
        .execute();
      expect(remaining.map((r) => r.user_id)).toEqual([recentSubject]);
    });

    it("inserts a row with hashed IP, userId, reason, and timestamp", async () => {
      const userId = crypto.randomUUID() as UserId;
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
      const userId1 = crypto.randomUUID() as UserId;
      const userId2 = crypto.randomUUID() as UserId;

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
      const userId1 = crypto.randomUUID() as UserId;
      const userId2 = crypto.randomUUID() as UserId;

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
      const userId1 = crypto.randomUUID() as UserId;
      const userId2 = crypto.randomUUID() as UserId;

      // Day 1
      time = new Date("2026-03-10T12:00:00Z").getTime();
      const logger1 = createOprfAuditLogger(
        testDb.platformDb,
        TEST_OPS_KEY,
        () => time,
      );
      await logger1.logFailure(userId1, "172.16.0.1", "rate_limited");

      // Day 2
      time = new Date("2026-03-11T12:00:00Z").getTime();
      const logger2 = createOprfAuditLogger(
        testDb.platformDb,
        TEST_OPS_KEY,
        () => time,
      );
      await logger2.logFailure(userId2, "172.16.0.1", "rate_limited");

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
      const userId = crypto.randomUUID() as UserId;
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
