// JobQueue interface for persistent background job processing.
// Backed by Postgres (FOR UPDATE SKIP LOCKED). No Redis dependency.
// Payloads must never contain PII (IDs and references only).

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

export class JobQueueError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "JobQueueError";
  }
}
