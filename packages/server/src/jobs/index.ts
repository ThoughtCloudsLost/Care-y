// JobQueue factory.
// Selects the implementation. Currently only Postgres-backed.
// If pg-boss or BullMQ is ever needed, add a case here.

export type {
  JobQueue,
  JobStatus,
  BackoffStrategy,
  EnqueueOptions,
} from "./queue.js";
export { JobQueueError } from "./queue.js";

import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { JobQueue } from "./queue.js";
import { createPostgresJobQueue } from "./postgres-queue.js";

/** Creates a JobQueue backed by the platform Postgres instance. */
export function createJobQueue(db: Kysely<PlatformDatabase>): JobQueue {
  return createPostgresJobQueue(db);
}
