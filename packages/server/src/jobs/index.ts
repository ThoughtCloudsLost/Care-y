// JobQueue factory.
// Selects the implementation. Currently only Postgres-backed.
// If pg-boss or BullMQ is ever needed, add a case here.

export type {
  JobQueue,
  JobStatus,
  BackoffStrategy,
  EnqueueOptions,
  DeadJobReader,
  DeadJobSummary,
} from "./queue.js";
export { JobQueueError } from "./queue.js";

import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { DeadJobReader, JobQueue } from "./queue.js";
import {
  createPostgresJobQueue,
  type PostgresJobQueueOptions,
} from "./postgres-queue.js";

/**
 * Creates a JobQueue backed by the platform Postgres instance. The same
 * object reads dead jobs for the operator alert.
 */
export function createJobQueue(
  db: Kysely<PlatformDatabase>,
  queueOptions?: PostgresJobQueueOptions,
): JobQueue & DeadJobReader {
  return createPostgresJobQueue(db, queueOptions);
}
