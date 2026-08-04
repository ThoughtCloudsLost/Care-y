import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import pg from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import type { PlatformDatabase } from "../db/types.js";
import type { JobQueue } from "./queue.js";
import { ensureRecurringJob } from "./ensure-recurring.js";
import {
  registerEscalationRulesHandler,
  ESCALATION_RULES_QUEUE,
  DEFAULT_ESCALATION_RULES_INTERVAL_MS,
} from "./escalation-checker.js";
import { TestSetupError } from "../test-utils.js";

// ---------------------------------------------------------------------------
// Stub JobQueue (unit tests, no DB)
// ---------------------------------------------------------------------------

function createMockJobQueue(): {
  jobQueue: JobQueue;
  handlers: Map<string, (payload: Record<string, unknown>) => Promise<void>>;
} {
  const handlers = new Map<
    string,
    (payload: Record<string, unknown>) => Promise<void>
  >();

  const jobQueue: JobQueue = {
    enqueue: vi.fn().mockResolvedValue("job-123"),
    process: vi.fn(
      (
        queue: string,
        handler: (p: Record<string, unknown>) => Promise<void>,
      ) => {
        handlers.set(queue, handler);
      },
    ),
    start: vi.fn(),
    stop: vi.fn().mockResolvedValue(undefined),
  };

  return { jobQueue, handlers };
}

// ---------------------------------------------------------------------------
// registerEscalationRulesHandler (unit tests)
// ---------------------------------------------------------------------------

describe("registerEscalationRulesHandler", () => {
  it("registers a handler on the escalation-rules-check queue", () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const runForAllTenants = vi.fn().mockResolvedValue(undefined);

    registerEscalationRulesHandler(jobQueue, runForAllTenants);

    expect(handlers.has(ESCALATION_RULES_QUEUE)).toBe(true);
  });

  it("runs the tenant callback then re-enqueues with the configured delay", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const runForAllTenants = vi.fn().mockResolvedValue(undefined);
    const customInterval = 10_000;

    registerEscalationRulesHandler(jobQueue, runForAllTenants, customInterval);

    const handler = handlers.get(ESCALATION_RULES_QUEUE);
    expect(handler).toBeDefined();

    await handler!({});

    expect(runForAllTenants).toHaveBeenCalledOnce();
    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      ESCALATION_RULES_QUEUE,
      {},
      { delay: customInterval },
    );
  });

  it("uses the default interval when none is specified", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const runForAllTenants = vi.fn().mockResolvedValue(undefined);

    registerEscalationRulesHandler(jobQueue, runForAllTenants);

    const handler = handlers.get(ESCALATION_RULES_QUEUE);
    await handler!({});

    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      ESCALATION_RULES_QUEUE,
      {},
      { delay: DEFAULT_ESCALATION_RULES_INTERVAL_MS },
    );
  });

  it("re-enqueues even when the tenant callback throws", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const tenantError = new Error("tenant blew up");
    const runForAllTenants = vi.fn().mockRejectedValue(tenantError);

    registerEscalationRulesHandler(jobQueue, runForAllTenants);

    const handler = handlers.get(ESCALATION_RULES_QUEUE);

    // The handler itself should not throw to the caller because the
    // finally block re-enqueues. But the original error propagates.
    await expect(handler!({})).rejects.toThrow("tenant blew up");

    // The self-chain must survive: enqueue called despite the error.
    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      ESCALATION_RULES_QUEUE,
      {},
      { delay: DEFAULT_ESCALATION_RULES_INTERVAL_MS },
    );
  });
});

// ---------------------------------------------------------------------------
// ensureRecurringJob (DB integration tests, require DATABASE_URL)
// ---------------------------------------------------------------------------

interface PlatformTestDb {
  readonly db: Kysely<PlatformDatabase>;
  readonly cleanup: () => Promise<void>;
}

async function createPlatformTestDb(): Promise<PlatformTestDb> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new TestSetupError("DATABASE_URL not set");
  }

  const pool = new pg.Pool({ connectionString, max: 5 });
  const dialect = new PostgresDialect({ pool });
  const testDb = new Kysely<PlatformDatabase>({ dialect });

  const platformDir = path.join(
    import.meta.dirname,
    "..",
    "db",
    "migrations",
    "platform",
  );

  const migrator = new Migrator({
    db: testDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: platformDir,
    }),
  });

  const { error } = await migrator.migrateToLatest();
  if (error) {
    throw new TestSetupError(
      `Platform migration failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    );
  }

  return {
    db: testDb,
    cleanup: async () => {
      // Clean up test rows from pending_jobs
      await sql`DELETE FROM pending_jobs WHERE queue LIKE 'test-%'`.execute(
        testDb,
      );
      await testDb.destroy();
    },
  };
}

describe.skipIf(!process.env.DATABASE_URL)("ensureRecurringJob (DB)", () => {
  let testDb: Kysely<PlatformDatabase>;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const result = await createPlatformTestDb();
    testDb = result.db;
    cleanup = result.cleanup;
  });

  afterAll(async () => {
    await cleanup();
  });

  it("enqueues when the queue is empty", async () => {
    const queueName = "test-ensure-empty-" + Date.now().toString(36);
    const { jobQueue } = createMockJobQueue();

    await ensureRecurringJob(testDb, jobQueue, queueName);

    expect(jobQueue.enqueue).toHaveBeenCalledWith(queueName, {});
  });

  it("is a no-op when a pending job exists", async () => {
    const queueName = "test-ensure-pending-" + Date.now().toString(36);

    // Insert a pending job directly
    await sql`
      INSERT INTO pending_jobs (queue, payload, status)
      VALUES (${queueName}, '{}'::jsonb, 'pending')
    `.execute(testDb);

    const { jobQueue } = createMockJobQueue();
    await ensureRecurringJob(testDb, jobQueue, queueName);

    expect(jobQueue.enqueue).not.toHaveBeenCalled();
  });

  it("is a no-op when an active job exists", async () => {
    const queueName = "test-ensure-active-" + Date.now().toString(36);

    // Insert an active job directly
    await sql`
      INSERT INTO pending_jobs (queue, payload, status, started_at)
      VALUES (${queueName}, '{}'::jsonb, 'active', now())
    `.execute(testDb);

    const { jobQueue } = createMockJobQueue();
    await ensureRecurringJob(testDb, jobQueue, queueName);

    expect(jobQueue.enqueue).not.toHaveBeenCalled();
  });

  it("enqueues when only completed jobs exist", async () => {
    const queueName = "test-ensure-completed-" + Date.now().toString(36);

    // Insert a completed job directly
    await sql`
      INSERT INTO pending_jobs (queue, payload, status, completed_at)
      VALUES (${queueName}, '{}'::jsonb, 'completed', now())
    `.execute(testDb);

    const { jobQueue } = createMockJobQueue();
    await ensureRecurringJob(testDb, jobQueue, queueName);

    expect(jobQueue.enqueue).toHaveBeenCalledWith(queueName, {});
  });

  it("enqueues when only dead jobs exist", async () => {
    const queueName = "test-ensure-dead-" + Date.now().toString(36);

    // Insert a dead job directly
    await sql`
      INSERT INTO pending_jobs (queue, payload, status, failed_at)
      VALUES (${queueName}, '{}'::jsonb, 'dead', now())
    `.execute(testDb);

    const { jobQueue } = createMockJobQueue();
    await ensureRecurringJob(testDb, jobQueue, queueName);

    expect(jobQueue.enqueue).toHaveBeenCalledWith(queueName, {});
  });
});
