// Postgres-backed JobQueue using FOR UPDATE SKIP LOCKED polling.
// ~150 lines of real logic. Same mechanism as pg-boss, minus the dependency.
// If this ever proves insufficient, swap to pg-boss behind the same interface.

import { sql, type Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { JobQueue, EnqueueOptions, BackoffStrategy } from "./queue.js";
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

export function createPostgresJobQueue(db: Kysely<PlatformDatabase>): JobQueue {
  const handlers = new Map<string, JobHandler>();
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let polling = false;
  let inFlightCount = 0;

  async function pollOnce(): Promise<void> {
    if (polling) return; // guard against overlapping polls
    polling = true;

    try {
      // Fetch pending jobs whose next_attempt has passed.
      // FOR UPDATE SKIP LOCKED: multiple Node processes can poll the same
      // table without conflicts. Each process picks up different jobs.
      const jobs = await sql<{
        id: string;
        queue: string;
        payload: Record<string, unknown>;
        retry_count: number;
        max_retries: number;
        backoff: BackoffStrategy;
        base_delay_ms: number;
      }>`
        SELECT id, queue, payload, retry_count, max_retries, backoff, base_delay_ms
        FROM pending_jobs
        WHERE status = 'pending' AND next_attempt <= now()
        ORDER BY next_attempt
        FOR UPDATE SKIP LOCKED
        LIMIT ${sql.lit(POLL_BATCH_SIZE)}
      `.execute(db);

      for (const job of jobs.rows) {
        const handler = handlers.get(job.queue);
        if (!handler) {
          // No handler registered for this queue. Leave it pending.
          // This happens during rolling deploys where a new queue is
          // enqueued before the handler is registered.
          continue;
        }

        // Mark active
        await sql`
          UPDATE pending_jobs
          SET status = 'active', started_at = now()
          WHERE id = ${job.id}::uuid
        `.execute(db);

        inFlightCount++;
        try {
          await handler(job.payload);

          // Success
          await sql`
            UPDATE pending_jobs
            SET status = 'completed', completed_at = now()
            WHERE id = ${job.id}::uuid
          `.execute(db);
        } catch (err: unknown) {
          const nextRetry = job.retry_count + 1;
          const errorMsg = err instanceof Error ? err.message : String(err);

          if (nextRetry >= job.max_retries) {
            // Exhausted retries. Mark dead.
            await sql`
              UPDATE pending_jobs
              SET status = 'dead',
                  failed_at = now(),
                  retry_count = ${nextRetry},
                  error = ${errorMsg}
              WHERE id = ${job.id}::uuid
            `.execute(db);
          } else {
            // Schedule retry with backoff.
            const delayMs = computeBackoffMs(
              job.backoff,
              nextRetry,
              job.base_delay_ms,
            );
            await sql`
              UPDATE pending_jobs
              SET status = 'pending',
                  retry_count = ${nextRetry},
                  next_attempt = now() + ${delayMs}::integer * interval '1 millisecond',
                  error = ${errorMsg}
              WHERE id = ${job.id}::uuid
            `.execute(db);
          }
        } finally {
          inFlightCount--;
        }
      }

      // Cleanup old completed/dead jobs (piggyback on poll cycle).
      // Runs a lightweight DELETE, not a separate scheduled task.
      await sql`
        DELETE FROM pending_jobs
        WHERE status IN ('completed', 'dead')
          AND COALESCE(completed_at, failed_at) < now() - ${RETENTION_DAYS}::integer * interval '1 day'
      `.execute(db);
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
        const result = await sql<{ id: string }>`
          INSERT INTO pending_jobs (queue, payload, max_retries, backoff, base_delay_ms, next_attempt)
          VALUES (
            ${queue},
            ${JSON.stringify(payload)}::jsonb,
            ${maxRetries},
            ${backoff},
            ${baseDelay},
            now() + ${delay}::integer * interval '1 millisecond'
          )
          RETURNING id
        `.execute(db);

        const row = result.rows[0];
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
  };
}
