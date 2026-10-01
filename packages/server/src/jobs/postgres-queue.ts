// Postgres-backed JobQueue using FOR UPDATE SKIP LOCKED polling.
// ~150 lines of real logic. Same mechanism as pg-boss, minus the dependency.
// If this ever proves insufficient, swap to pg-boss behind the same interface.

import { sql, type Kysely, type NotNull } from "kysely";
import { orgIdSchema } from "@care-y/shared";
import type { PlatformDatabase } from "../db/types.js";
import type {
  JobQueue,
  EnqueueOptions,
  BackoffStrategy,
  DeadJobReader,
  DeadJobSummary,
} from "./queue.js";
import { JobQueueError } from "./queue.js";

/** Default poll interval: 5 seconds. */
const DEFAULT_POLL_MS = 5_000;

/** Max jobs fetched per poll cycle. Keeps each cycle short. */
const POLL_BATCH_SIZE = 10;

/** Days to retain completed/dead jobs before cleanup. */
const RETENTION_DAYS = 7;

/** Base delay per backoff strategy (ms). */
const BASE_DELAY_MS = 60_000; // 1 minute

type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

/**
 * Computes the next attempt timestamp after a failure.
 *
 * Exponential: base * 2^retryCount (1min, 2min, 4min, 8min, ...)
 * Linear:      base * (retryCount + 1) (1min, 2min, 3min, ...)
 *
 * Capped at 24 hours to prevent unbounded delays.
 */
export function computeBackoffMs(
  strategy: BackoffStrategy,
  retryCount: number,
  baseMs: number = BASE_DELAY_MS,
): number {
  const MAX_DELAY_MS = 24 * 60 * 60 * 1000;
  let delay: number;

  if (strategy === "exponential") {
    delay = baseMs * Math.pow(2, retryCount);
  } else {
    delay = baseMs * (retryCount + 1);
  }

  return Math.min(delay, MAX_DELAY_MS);
}

export interface PostgresJobQueueOptions {
  /**
   * Called at the end of every poll cycle that completed without an error,
   * never after one that threw. The scheduler heartbeat hangs off it.
   */
  readonly onPollComplete?: () => void;
}

export function createPostgresJobQueue(
  db: Kysely<PlatformDatabase>,
  queueOptions?: PostgresJobQueueOptions,
): JobQueue & DeadJobReader {
  const handlers = new Map<string, JobHandler>();
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let polling = false;
  let inFlightCount = 0;

  async function pollOnce(): Promise<void> {
    if (polling) return; // guard against overlapping polls
    polling = true;

    try {
      // Jobs for queues without a registered handler are never claimed,
      // so they stay pending across rolling deploys where a new queue is
      // enqueued before its handler exists.
      const registeredQueues = [...handlers.keys()];
      if (registeredQueues.length === 0) return;

      // Claim in one statement so the row locks from FOR UPDATE SKIP
      // LOCKED hold through the status flip (row locks last only to end
      // of transaction, and a standalone SELECT is its own transaction).
      // Multiple Node processes can poll the same table without
      // double-claiming a job.
      const jobs = await db
        .updateTable("pending_jobs")
        .set({ status: "active", started_at: sql<Date>`now()` })
        .where("id", "in", (eb) =>
          eb
            .selectFrom("pending_jobs")
            .select("id")
            .where("status", "=", "pending")
            .where("next_attempt", "<=", sql<Date>`now()`)
            .where("queue", "in", registeredQueues)
            .orderBy("next_attempt", "asc")
            .limit(POLL_BATCH_SIZE)
            .forUpdate()
            .skipLocked(),
        )
        .returning([
          "id",
          "queue",
          "payload",
          "retry_count",
          "max_retries",
          "backoff",
          "base_delay_ms",
        ])
        // The column is text; enqueue is its only writer and takes a
        // BackoffStrategy, and computeBackoffMs treats any other value
        // as linear.
        .$narrowType<{ backoff: BackoffStrategy }>()
        .execute();

      for (const job of jobs) {
        const handler = handlers.get(job.queue);
        if (!handler) {
          // Unreachable in practice (the claim filters to registered
          // queues and handlers are never unregistered), but a claimed
          // row must never strand in active, so release it.
          await db
            .updateTable("pending_jobs")
            .set({ status: "pending", started_at: null })
            .where("id", "=", job.id)
            .execute();
          continue;
        }

        inFlightCount++;
        try {
          await handler(job.payload);

          // Success
          await db
            .updateTable("pending_jobs")
            .set({ status: "completed", completed_at: sql<Date>`now()` })
            .where("id", "=", job.id)
            .execute();
        } catch (err: unknown) {
          const nextRetry = job.retry_count + 1;
          const errorMsg = err instanceof Error ? err.message : String(err);

          if (nextRetry >= job.max_retries) {
            // Exhausted retries. Mark dead.
            await db
              .updateTable("pending_jobs")
              .set({
                status: "dead",
                failed_at: sql<Date>`now()`,
                retry_count: nextRetry,
                error: errorMsg,
              })
              .where("id", "=", job.id)
              .execute();
          } else {
            // Schedule retry with backoff.
            const delayMs = computeBackoffMs(
              job.backoff,
              nextRetry,
              job.base_delay_ms,
            );
            await db
              .updateTable("pending_jobs")
              .set({
                status: "pending",
                retry_count: nextRetry,
                // Interval arithmetic has no builder form, so it stays a
                // sql fragment. It runs on the database clock, the same
                // clock the claim compares next_attempt against.
                next_attempt: sql<Date>`now() + ${delayMs}::integer * interval '1 millisecond'`,
                error: errorMsg,
              })
              .where("id", "=", job.id)
              .execute();
          }
        } finally {
          inFlightCount--;
        }
      }

      // Cleanup old completed/dead jobs (piggyback on poll cycle).
      // Runs a lightweight DELETE, not a separate scheduled task.
      await db
        .deleteFrom("pending_jobs")
        .where("status", "in", ["completed", "dead"])
        .where((eb) =>
          eb(
            eb.fn.coalesce("completed_at", "failed_at"),
            "<",
            // Interval arithmetic has no builder form; see the retry branch.
            sql<Date>`now() - ${RETENTION_DAYS}::integer * interval '1 day'`,
          ),
        )
        .execute();

      queueOptions?.onPollComplete?.();
    } catch (err: unknown) {
      // Log but don't crash. The next poll cycle will retry.
      console.error(
        "JobQueue poll error:",
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      polling = false;
    }
  }

  return {
    async enqueue(
      queue: string,
      payload: Record<string, unknown>,
      options?: EnqueueOptions,
    ): Promise<string> {
      const delay = options?.delay ?? 0;
      const maxRetries = options?.maxRetries ?? 3;
      const backoff = options?.backoff ?? "exponential";
      const baseDelay = options?.baseDelayMs ?? BASE_DELAY_MS;

      try {
        const row = await db
          .insertInto("pending_jobs")
          .values({
            queue,
            payload,
            max_retries: maxRetries,
            backoff,
            base_delay_ms: baseDelay,
            // Interval arithmetic has no builder form; see the retry branch.
            next_attempt: sql<Date>`now() + ${delay}::integer * interval '1 millisecond'`,
          })
          .returning("id")
          .executeTakeFirst();

        if (!row) {
          throw new JobQueueError("INSERT returned no rows");
        }
        return row.id;
      } catch (err: unknown) {
        if (err instanceof JobQueueError) throw err;
        throw new JobQueueError("Failed to enqueue job", err);
      }
    },

    process(queue: string, handler: JobHandler): void {
      if (handlers.has(queue)) {
        throw new JobQueueError(
          `Handler already registered for queue "${queue}"`,
        );
      }
      handlers.set(queue, handler);
    },

    start(pollIntervalMs?: number): void {
      if (pollTimer !== null) {
        throw new JobQueueError("JobQueue already started");
      }
      const interval = pollIntervalMs ?? DEFAULT_POLL_MS;
      // Run immediately, then on interval.
      void pollOnce();
      pollTimer = setInterval(() => void pollOnce(), interval);
    },

    async stop(): Promise<void> {
      if (pollTimer !== null) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      // Wait for in-flight jobs to finish (simple spin-wait with yield).
      const deadline = Date.now() + 30_000; // 30s max wait
      while (inFlightCount > 0 && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (inFlightCount > 0) {
        console.error(
          `JobQueue shutdown: ${String(inFlightCount)} jobs still in-flight after 30s`,
        );
      }
    },

    async listDeadSince(since: Date): Promise<DeadJobSummary[]> {
      try {
        const rows = await db
          .selectFrom("pending_jobs")
          .select([
            "id",
            "queue",
            "failed_at",
            // Only the orgId field is extracted, inside Postgres, so the
            // rest of the payload never leaves the database.
            sql<string | null>`payload ->> 'orgId'`.as("payload_org_id"),
          ])
          .where("status", "=", "dead")
          .where("failed_at", ">", since)
          .orderBy("failed_at", "asc")
          // The comparison above excludes rows whose failed_at is null.
          .$narrowType<{ failed_at: NotNull }>()
          .execute();

        return rows.map((row) => {
          const parsedOrgId = orgIdSchema.safeParse(row.payload_org_id);
          return {
            id: row.id,
            queue: row.queue,
            orgId: parsedOrgId.success ? parsedOrgId.data : null,
            failedAt: row.failed_at,
          };
        });
      } catch (err: unknown) {
        throw new JobQueueError("Failed to list dead jobs", err);
      }
    },
  };
}
