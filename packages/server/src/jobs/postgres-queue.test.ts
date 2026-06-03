import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import pg from "pg";
import { sql, Kysely, PostgresDialect } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import type { PlatformDatabase } from "../db/types.js";
import { computeBackoffMs, createPostgresJobQueue } from "./postgres-queue.js";
import type { JobQueue } from "./queue.js";
import { JobQueueError } from "./queue.js";
import { TestSetupError } from "../test-utils.js";

pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
  parseInt(val, 10),
);

// ---------------------------------------------------------------------------
// Unit tests (no DB required)
// ---------------------------------------------------------------------------

describe("computeBackoffMs", () => {
  it("computes exponential backoff", () => {
    const base = 60_000;
    expect(computeBackoffMs("exponential", 0, base)).toBe(60_000); // 60s * 2^0
    expect(computeBackoffMs("exponential", 1, base)).toBe(120_000); // 60s * 2^1
    expect(computeBackoffMs("exponential", 2, base)).toBe(240_000); // 60s * 2^2
    expect(computeBackoffMs("exponential", 3, base)).toBe(480_000); // 60s * 2^3
  });

  it("computes linear backoff", () => {
    const base = 60_000;
    expect(computeBackoffMs("linear", 0, base)).toBe(60_000); // 60s * 1
    expect(computeBackoffMs("linear", 1, base)).toBe(120_000); // 60s * 2
    expect(computeBackoffMs("linear", 2, base)).toBe(180_000); // 60s * 3
  });

  it("caps at 24 hours", () => {
    const maxMs = 24 * 60 * 60 * 1000;
    expect(computeBackoffMs("exponential", 30, 60_000)).toBe(maxMs);
    expect(computeBackoffMs("linear", 999_999, 60_000)).toBe(maxMs);
  });

  it("handles zero base delay", () => {
    expect(computeBackoffMs("exponential", 0, 0)).toBe(0);
    expect(computeBackoffMs("linear", 0, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// DB integration tests (require DATABASE_URL)
// ---------------------------------------------------------------------------

interface PlatformTestDb {
  readonly db: Kysely<PlatformDatabase>;
  readonly cleanup: () => Promise<void>;
}

/** Creates a platform DB with all platform migrations applied. */
async function createPlatformTestDb(): Promise<PlatformTestDb> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new TestSetupError("DATABASE_URL not set");
  }

  const pool = new pg.Pool({ connectionString, max: 5 });
  const dialect = new PostgresDialect({ pool });
  const db = new Kysely<PlatformDatabase>({ dialect });

  // Run platform migrations against the public schema.
  const platformDir = path.join(
    import.meta.dirname,
    "..",
    "db",
    "migrations",
    "platform",
  );

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: platformDir,
    }),
  });

  const { error } = await migrator.migrateToLatest();
  if (error) {
    await pool.end();
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    throw new TestSetupError(`Platform migration failed: ${msg}`);
  }

  async function cleanup(): Promise<void> {
    // Clean up pending_jobs rows created during tests (leave table for other suites).
    await sql`DELETE FROM pending_jobs`.execute(db);
    await db.destroy();
  }

  return { db, cleanup };
}

describe.skipIf(!process.env.DATABASE_URL)(
  "PostgresJobQueue (DB integration)",
  () => {
    let testDb: PlatformTestDb;
    let queue: JobQueue;

    beforeAll(async () => {
      testDb = await createPlatformTestDb();
      queue = createPostgresJobQueue(testDb.db);
    });

    afterAll(async () => {
      await queue.stop();
      await testDb.cleanup();
    });

    it("enqueues a job and returns a UUID", async () => {
      const id = await queue.enqueue("test-queue", { action: "test" });
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );

      // Verify row exists in DB
      const result = await sql<{ queue: string; status: string }>`
      SELECT queue, status FROM pending_jobs WHERE id = ${id}::uuid
    `.execute(testDb.db);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.queue).toBe("test-queue");
      expect(result.rows[0]?.status).toBe("pending");
    });

    it("enqueues with custom options", async () => {
      const id = await queue.enqueue(
        "custom-queue",
        { action: "custom" },
        { delay: 5000, maxRetries: 5, backoff: "linear" },
      );

      const result = await sql<{
        max_retries: number;
        backoff: string;
      }>`
      SELECT max_retries, backoff FROM pending_jobs WHERE id = ${id}::uuid
    `.execute(testDb.db);

      expect(result.rows[0]?.max_retries).toBe(5);
      expect(result.rows[0]?.backoff).toBe("linear");
    });

    it("processes a job successfully", async () => {
      const processed: Record<string, unknown>[] = [];

      // Register handler before enqueue
      const localQueue = createPostgresJobQueue(testDb.db);
      localQueue.process("success-queue", async (payload) => {
        processed.push(payload);
      });

      const id = await localQueue.enqueue("success-queue", { key: "value" });

      // Start polling with fast interval
      localQueue.start(100);

      // Wait for processing
      await vi.waitFor(
        async () => {
          const result = await sql<{ status: string }>`
          SELECT status FROM pending_jobs WHERE id = ${id}::uuid
        `.execute(testDb.db);
          expect(result.rows[0]?.status).toBe("completed");
        },
        { timeout: 5000, interval: 200 },
      );

      await localQueue.stop();

      expect(processed).toHaveLength(1);
      expect(processed[0]).toEqual({ key: "value" });
    });

    it("retries a failing job with exponential backoff", async () => {
      let callCount = 0;

      const localQueue = createPostgresJobQueue(testDb.db);
      localQueue.process("retry-queue", async () => {
        callCount++;
        throw new JobQueueError("transient failure");
      });

      const id = await localQueue.enqueue(
        "retry-queue",
        { attempt: true },
        { maxRetries: 2, baseDelayMs: 50 },
      );

      localQueue.start(100);

      // Wait for the job to go dead (exhausted retries: 0, 1 = 2 attempts = max_retries)
      await vi.waitFor(
        async () => {
          const result = await sql<{ status: string; retry_count: number }>`
          SELECT status, retry_count FROM pending_jobs WHERE id = ${id}::uuid
        `.execute(testDb.db);
          expect(result.rows[0]?.status).toBe("dead");
        },
        { timeout: 15000, interval: 500 },
      );

      await localQueue.stop();

      const result = await sql<{
        status: string;
        retry_count: number;
        error: string | null;
      }>`
      SELECT status, retry_count, error FROM pending_jobs WHERE id = ${id}::uuid
    `.execute(testDb.db);

      expect(result.rows[0]?.status).toBe("dead");
      expect(result.rows[0]?.retry_count).toBe(2);
      expect(result.rows[0]?.error).toBe("transient failure");
      expect(callCount).toBeGreaterThanOrEqual(2);
    });

    it("rejects duplicate handler registration", () => {
      const localQueue = createPostgresJobQueue(testDb.db);
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- handler body irrelevant, testing duplicate registration rejection
      localQueue.process("dup-queue", async () => {});
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- same: handler body irrelevant
        localQueue.process("dup-queue", async () => {});
      }).toThrow(JobQueueError);
    });

    it("rejects starting twice", () => {
      const localQueue = createPostgresJobQueue(testDb.db);
      localQueue.start(60_000);
      expect(() => {
        localQueue.start(60_000);
      }).toThrow(JobQueueError);
      void localQueue.stop();
    });

    it("stores error message on failure", async () => {
      const localQueue = createPostgresJobQueue(testDb.db);
      localQueue.process("error-queue", async () => {
        throw new JobQueueError("specific error message");
      });

      const id = await localQueue.enqueue(
        "error-queue",
        { test: true },
        { maxRetries: 1 },
      );

      localQueue.start(100);

      await vi.waitFor(
        async () => {
          const result = await sql<{ status: string }>`
          SELECT status FROM pending_jobs WHERE id = ${id}::uuid
        `.execute(testDb.db);
          expect(result.rows[0]?.status).toBe("dead");
        },
        { timeout: 5000, interval: 200 },
      );

      await localQueue.stop();

      const result = await sql<{ error: string | null }>`
      SELECT error FROM pending_jobs WHERE id = ${id}::uuid
    `.execute(testDb.db);
      expect(result.rows[0]?.error).toBe("specific error message");
    });

    it("skips jobs with no registered handler", async () => {
      const localQueue = createPostgresJobQueue(testDb.db);
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- noop handler; test verifies unhandled-queue stays pending, not that this handler runs
      localQueue.process("other-queue", async () => {});

      const id = await localQueue.enqueue("unhandled-queue", { orphan: true });

      localQueue.start(100);

      // Wait a couple poll cycles
      await new Promise((resolve) => setTimeout(resolve, 500));

      await localQueue.stop();

      // Job should still be pending (not processed, not failed)
      const result = await sql<{ status: string }>`
      SELECT status FROM pending_jobs WHERE id = ${id}::uuid
    `.execute(testDb.db);
      expect(result.rows[0]?.status).toBe("pending");
    });
  },
);
