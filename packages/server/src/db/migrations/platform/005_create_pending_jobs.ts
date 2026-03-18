// Job queue infrastructure for persistent background job processing.
// Platform schema: jobs are cross-org operational infrastructure.
// Payloads contain IDs only, never PII.

import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("pending_jobs")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("queue", "text", (col) => col.notNull())
    .addColumn("payload", "jsonb", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("retry_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("max_retries", "integer", (col) => col.notNull().defaultTo(3))
    .addColumn("backoff", "text", (col) =>
      col.notNull().defaultTo("exponential"),
    )
    .addColumn("base_delay_ms", "integer", (col) =>
      col.notNull().defaultTo(60000),
    )
    .addColumn("next_attempt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("started_at", "timestamptz")
    .addColumn("completed_at", "timestamptz")
    .addColumn("failed_at", "timestamptz")
    .addColumn("error", "text")
    .execute();

  // CHECK constraint on status values.
  await sql`
    ALTER TABLE pending_jobs
    ADD CONSTRAINT valid_status
    CHECK (status IN ('pending', 'active', 'completed', 'failed', 'dead'))
  `.execute(db);

  // Partial index: only pending jobs participate in poll queries.
  // Covers the WHERE clause in the poller's SELECT.
  await sql`
    CREATE INDEX idx_pending_jobs_poll
    ON pending_jobs (queue, next_attempt)
    WHERE status = 'pending'
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("pending_jobs").execute();
}
