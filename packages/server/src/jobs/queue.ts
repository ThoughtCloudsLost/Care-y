// JobQueue interface for persistent background job processing.
// Backed by Postgres (FOR UPDATE SKIP LOCKED). No Redis dependency.
// Payloads must never contain PII (IDs and references only).

import type { JobId, OrgId } from "@care-y/shared";

export type JobStatus = "pending" | "active" | "completed" | "failed" | "dead";

export type BackoffStrategy = "exponential" | "linear";

export interface EnqueueOptions {
  /** Delay in ms before the first attempt. Default: 0. */
  readonly delay?: number;
  /** Maximum number of retries after the first failure. Default: 3. */
  readonly maxRetries?: number;
  /** Backoff strategy between retries. Default: "exponential". */
  readonly backoff?: BackoffStrategy;
  /** Base delay in ms for backoff calculation. Default: 60000 (1 min).
   *  log-deletion: 60000, pii-retention: 3600000 */
  readonly baseDelayMs?: number;
}

export interface JobQueue {
  /** Enqueue a job for processing. Returns the job ID (UUID). */
  enqueue(
    queue: string,
    payload: Record<string, unknown>,
    options?: EnqueueOptions,
  ): Promise<string>;

  /**
   * Register a handler for a named queue. One handler per queue.
   * Must be called before start(). Duplicate registrations throw.
   */
  process(
    queue: string,
    handler: (payload: Record<string, unknown>) => Promise<void>,
  ): void;

  /** Start polling for jobs. Called once at server startup. */
  start(pollIntervalMs?: number): void;

  /** Stop polling and wait for in-flight jobs to finish. Called on graceful shutdown. */
  stop(): Promise<void>;
}

/**
 * Reads dead jobs for the operator alert. Separate from JobQueue so only
 * the dead-job sweep receives it.
 */
export interface DeadJobReader {
  /**
   * Jobs marked dead after `since`, oldest first. Returns the summary fields
   * only: the payload and the error text are never read, because either can
   * quote data.
   */
  listDeadSince(since: Date): Promise<DeadJobSummary[]>;
}

/** What an operator alert may say about a dead job. Nothing else leaves the row. */
export interface DeadJobSummary {
  readonly id: JobId;
  readonly queue: string;
  /** The payload's `orgId` when it carries a valid one, otherwise null. */
  readonly orgId: OrgId | null;
  readonly failedAt: Date;
}

export class JobQueueError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "JobQueueError";
  }
}
