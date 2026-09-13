/**
 * Bootstrap helper for recurring self-enqueue jobs.
 *
 * Self-enqueue chains (ticket-escalation, media-cleanup,
 * escalation-rules-check) need an initial enqueue to start the loop.
 * Without it the chain is dead on a fresh database. This helper
 * enqueues the first job only when no pending or active job exists
 * for the given queue, making it safe to call on every server start.
 */

import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { JobQueue } from "./queue.js";

/**
 * Enqueue the first job for a recurring queue if none is pending or active.
 *
 * Idempotent across restarts. In the worst case two racing calls both
 * enqueue, producing one extra cycle before the self-enqueue deduplicates
 * naturally (the handler always enqueues exactly one successor).
 */
export async function ensureRecurringJob(
  db: Kysely<PlatformDatabase>,
  jobQueue: JobQueue,
  queueName: string,
): Promise<void> {
  const existing = await db
    .selectFrom("pending_jobs")
    .select("id")
    .where("queue", "=", queueName)
    .where("status", "in", ["pending", "active"])
    .executeTakeFirst();

  if (existing === undefined) {
    await jobQueue.enqueue(queueName, {});
  }
}
