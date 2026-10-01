import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { Kysely } from "kysely";
import {
  jobIdSchema,
  orgIdSchema,
  type JobId,
  type OrgId,
} from "@care-y/shared";
import type { PlatformDatabase } from "../db/types.js";
import {
  DEAD_JOB_ALERT_INTERVAL_MS,
  DEAD_JOB_ALERT_QUEUE,
  registerDeadJobAlertHandler,
  renderDeadJobAlert,
} from "./dead-job-alert.js";
import { createPostgresJobQueue } from "./postgres-queue.js";
import type { DeadJobReader, DeadJobSummary, JobQueue } from "./queue.js";
import {
  SafeIntrospectionPostgresDialect,
  TestSetupError,
  createCapturingTransport,
} from "../test-utils.js";

const HOST_LABEL = "care-y.example.org";
const OPERATOR_EMAIL = "operator@example.org";
const FROM_EMAIL = "noreply@example.org";
// Fictional 555-01xx number standing in for PII a payload or error could hold.
const SEEDED_PHONE = "+12025550143";

function jobId(): JobId {
  return jobIdSchema.parse(randomUUID());
}

function orgId(): OrgId {
  return orgIdSchema.parse(randomUUID());
}

function summary(
  queue: string,
  overrides?: { readonly orgId?: OrgId | null },
): DeadJobSummary {
  return {
    id: jobId(),
    queue,
    orgId: overrides?.orgId === undefined ? orgId() : overrides.orgId,
    failedAt: new Date("2026-10-01T03:15:00.000Z"),
  };
}

type Handler = (payload: Record<string, unknown>) => Promise<void>;

/**
 * JobQueue fake that captures registered handlers, and a DeadJobReader fake
 * that serves dead-job batches in order.
 */
function createAlertQueue(batches: readonly DeadJobSummary[][]) {
  const handlers = new Map<string, Handler>();
  const listDeadSince = vi.fn<(since: Date) => Promise<DeadJobSummary[]>>();
  for (const batch of batches) {
    listDeadSince.mockResolvedValueOnce(batch);
  }
  const enqueue = vi.fn<JobQueue["enqueue"]>().mockResolvedValue("job-next");
  const queue: JobQueue = {
    enqueue,
    process: vi.fn((name: string, handler: Handler) => {
      handlers.set(name, handler);
    }),
    start: vi.fn(),
    stop: vi.fn<JobQueue["stop"]>().mockResolvedValue(undefined),
  };
  const deadJobReader: DeadJobReader = { listDeadSince };
  return { queue, deadJobReader, handlers, listDeadSince, enqueue };
}

async function runSweep(handlers: Map<string, Handler>): Promise<void> {
  const handler = handlers.get(DEAD_JOB_ALERT_QUEUE);
  if (!handler) {
    throw new TestSetupError("dead-job alert handler was not registered");
  }
  await handler({});
}

// ---------------------------------------------------------------------------
// renderDeadJobAlert
// ---------------------------------------------------------------------------

describe("renderDeadJobAlert", () => {
  it("lists queue, job id, org UUID and failed-at for each job", () => {
    const job = summary("log-deletion");

    const { subject, text } = renderDeadJobAlert([job], HOST_LABEL);

    expect(subject).toBe(`CARE-Y ${HOST_LABEL}: 1 dead background job`);
    expect(text).toContain(`queue=${job.queue}`);
    expect(text).toContain(`job=${job.id}`);
    expect(text).toContain(`org=${String(job.orgId)}`);
    expect(text).toContain(job.failedAt.toISOString());
  });

  it("writes org=none for a job without an org", () => {
    const { text } = renderDeadJobAlert(
      [summary("dead-job-alert", { orgId: null })],
      HOST_LABEL,
    );

    expect(text).toContain("org=none");
  });
});

// ---------------------------------------------------------------------------
// registerDeadJobAlertHandler
// ---------------------------------------------------------------------------

describe("registerDeadJobAlertHandler", () => {
  it("sends nothing when no job died", async () => {
    const { queue, deadJobReader, handlers } = createAlertQueue([[]]);
    const sender = createCapturingTransport();
    registerDeadJobAlertHandler({
      queue,
      deadJobReader,
      sender,
      to: OPERATOR_EMAIL,
      from: FROM_EMAIL,
      hostLabel: HOST_LABEL,
      now: () => new Date("2026-10-01T04:00:00.000Z"),
    });

    await runSweep(handlers);

    expect(sender.sent).toHaveLength(0);
  });

  it("sends one message naming both queues when two jobs died", async () => {
    const first = summary("log-deletion");
    const second = summary("notification-sms");
    const { queue, deadJobReader, handlers } = createAlertQueue([
      [first, second],
    ]);
    const sender = createCapturingTransport();
    const logSpy = vi.spyOn(console, "log").mockReturnValue(undefined);
    registerDeadJobAlertHandler({
      queue,
      deadJobReader,
      sender,
      to: OPERATOR_EMAIL,
      from: FROM_EMAIL,
      hostLabel: HOST_LABEL,
      now: () => new Date("2026-10-01T04:00:00.000Z"),
    });

    try {
      await runSweep(handlers);
    } finally {
      logSpy.mockRestore();
    }

    expect(sender.sent).toHaveLength(1);
    const message = sender.sent[0];
    expect(message?.to).toBe(OPERATOR_EMAIL);
    expect(message?.from).toBe(FROM_EMAIL);
    expect(message?.subject).toBe(
      `CARE-Y ${HOST_LABEL}: 2 dead background jobs`,
    );
    expect(message?.text).toContain("Queues: log-deletion, notification-sms");
    expect(message?.text).toContain(`job=${first.id}`);
    expect(message?.text).toContain(`job=${second.id}`);
  });

  it("starts one interval back and advances to each sweep's start time", async () => {
    const registeredAt = new Date("2026-10-01T04:00:00.000Z");
    const firstSweep = new Date("2026-10-01T04:00:01.000Z");
    const secondSweep = new Date("2026-10-01T04:15:01.000Z");
    const clock = vi
      .fn<() => Date>()
      .mockReturnValueOnce(registeredAt)
      .mockReturnValueOnce(firstSweep)
      .mockReturnValueOnce(secondSweep);
    const { queue, deadJobReader, handlers, listDeadSince, enqueue } =
      createAlertQueue([[], []]);
    registerDeadJobAlertHandler({
      queue,
      deadJobReader,
      sender: createCapturingTransport(),
      to: OPERATOR_EMAIL,
      from: FROM_EMAIL,
      hostLabel: HOST_LABEL,
      now: clock,
    });

    await runSweep(handlers);
    await runSweep(handlers);

    expect(listDeadSince.mock.calls[0]?.[0]).toEqual(
      new Date(registeredAt.getTime() - DEAD_JOB_ALERT_INTERVAL_MS),
    );
    expect(listDeadSince.mock.calls[1]?.[0]).toEqual(firstSweep);
    expect(enqueue).toHaveBeenCalledWith(
      DEAD_JOB_ALERT_QUEUE,
      {},
      { delay: DEAD_JOB_ALERT_INTERVAL_MS },
    );
  });

  it("keeps the previous sweep time when the send fails", async () => {
    const registeredAt = new Date("2026-10-01T04:00:00.000Z");
    const clock = vi
      .fn<() => Date>()
      .mockReturnValueOnce(registeredAt)
      .mockReturnValue(new Date("2026-10-01T04:00:01.000Z"));
    const { queue, deadJobReader, handlers, listDeadSince } = createAlertQueue([
      [summary("log-deletion")],
      [],
    ]);
    registerDeadJobAlertHandler({
      queue,
      deadJobReader,
      sender: createCapturingTransport({ failFor: [OPERATOR_EMAIL] }),
      to: OPERATOR_EMAIL,
      from: FROM_EMAIL,
      hostLabel: HOST_LABEL,
      now: clock,
    });

    await expect(runSweep(handlers)).rejects.toThrow();
    await runSweep(handlers);

    const start = new Date(registeredAt.getTime() - DEAD_JOB_ALERT_INTERVAL_MS);
    expect(listDeadSince.mock.calls[0]?.[0]).toEqual(start);
    expect(listDeadSince.mock.calls[1]?.[0]).toEqual(start);
  });
});

// ---------------------------------------------------------------------------
// listDeadSince and the rendered body against seeded rows (DB)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "listDeadSince (DB integration)",
  () => {
    const suffix = randomUUID().slice(0, 8);
    const queueA = `test-dead-alert-a-${suffix}`;
    const queueB = `test-dead-alert-b-${suffix}`;
    let db: Kysely<PlatformDatabase>;

    beforeAll(() => {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new TestSetupError("DATABASE_URL not set");
      }
      const pool = new pg.Pool({ connectionString, max: 2 });
      db = new Kysely<PlatformDatabase>({
        dialect: new SafeIntrospectionPostgresDialect({ pool }, "public"),
      });
    });

    afterAll(async () => {
      await db
        .deleteFrom("pending_jobs")
        .where("queue", "in", [queueA, queueB])
        .execute();
      await db.destroy();
    });

    async function seed(row: {
      readonly queue: string;
      readonly status: string;
      readonly failedAt: Date | null;
      readonly payload: Record<string, unknown>;
      readonly error: string | null;
    }): Promise<JobId> {
      const inserted = await db
        .insertInto("pending_jobs")
        .values({
          queue: row.queue,
          payload: row.payload,
          status: row.status,
          failed_at: row.failedAt,
          error: row.error,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      return inserted.id;
    }

    function ownRows(jobs: readonly DeadJobSummary[]): DeadJobSummary[] {
      return jobs.filter((job) => job.queue === queueA || job.queue === queueB);
    }

    it("returns only jobs that died after since, with the payload orgId when valid", async () => {
      const now = Date.now();
      const since = new Date(now - 10 * 60 * 1000);
      const seededOrg = orgId();

      await seed({
        queue: queueA,
        status: "dead",
        failedAt: new Date(now - 20 * 60 * 1000),
        payload: { orgId: seededOrg },
        error: "too old",
      });
      const recentWithOrg = await seed({
        queue: queueA,
        status: "dead",
        failedAt: new Date(now - 60 * 1000),
        payload: { orgId: seededOrg },
        error: "recent",
      });
      const recentBadOrg = await seed({
        queue: queueB,
        status: "dead",
        failedAt: new Date(now - 30 * 1000),
        payload: { orgId: "not-a-uuid" },
        error: "recent",
      });
      await seed({
        queue: queueB,
        status: "pending",
        failedAt: null,
        payload: { orgId: seededOrg },
        error: null,
      });

      const jobs = ownRows(
        await createPostgresJobQueue(db).listDeadSince(since),
      );

      expect(jobs.map((job) => job.id)).toEqual([recentWithOrg, recentBadOrg]);
      expect(jobs[0]?.orgId).toBe(seededOrg);
      expect(jobs[0]?.queue).toBe(queueA);
      expect(jobs[0]?.failedAt).toBeInstanceOf(Date);
      expect(jobs[1]?.orgId).toBeNull();
    });

    it("renders a body that leaves out a phone number held in the payload and the error", async () => {
      const failedAt = new Date(Date.now() - 1000);
      await seed({
        queue: queueA,
        status: "dead",
        failedAt,
        payload: { orgId: orgId(), to: SEEDED_PHONE },
        error: `SMS to ${SEEDED_PHONE} rejected`,
      });

      const jobs = ownRows(
        await createPostgresJobQueue(db).listDeadSince(
          new Date(failedAt.getTime() - 1000),
        ),
      );
      const { subject, text } = renderDeadJobAlert(jobs, HOST_LABEL);

      expect(jobs.length).toBeGreaterThan(0);
      expect(text).not.toContain(SEEDED_PHONE);
      expect(text).not.toContain("2025550143");
      expect(text).not.toContain("rejected");
      expect(subject).not.toContain(SEEDED_PHONE);
    });
  },
);
