// Notification outbox: transactional outbox table for durable intake
// notification dispatch. Written inside the same transaction as ticket
// creation so notification intent is never lost on process exit.
//
// Columns:
//   id              - row PK
//   event_type      - notification event enum (ticket_created, ticket_escalated)
//   ticket_id       - FK to tickets with ON DELETE CASCADE (purge ticket purges outbox)
//   queue_id        - destination queue (resolution input for recipient building)
//   form_id         - nullable intake form id (resolution input for escalation recipients)
//   actor_user_id   - nullable user to exclude from recipients (null for intake)
//   status          - pending / active / completed / dead
//   attempt_count   - number of drain attempts so far
//   max_attempts    - ceiling before marking dead
//   next_attempt_at - when the drainer should next pick this row
//   created_at      - enqueue time
//   completed_at    - terminal success time
//   failed_at       - terminal dead time
//   last_error      - truncated error message (never ciphertext or PII)

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("notification_outbox")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("queue_id", "uuid", (col) => col.notNull())
    .addColumn("form_id", "uuid")
    .addColumn("actor_user_id", "uuid")
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("attempt_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("max_attempts", "integer", (col) => col.notNull().defaultTo(5))
    .addColumn("next_attempt_at", "timestamptz", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .addColumn("completed_at", "timestamptz")
    .addColumn("failed_at", "timestamptz")
    .addColumn("last_error", "text")
    .execute();

  // The drainer queries by status + next_attempt_at. Index supports the
  // polling WHERE clause (status = 'pending' AND next_attempt_at <= now()).
  await db.schema
    .createIndex("idx_notification_outbox_drain")
    .on("notification_outbox")
    .columns(["status", "next_attempt_at"])
    .execute();

  // Cascade join: ticket deletion removes outbox rows efficiently.
  await db.schema
    .createIndex("idx_notification_outbox_ticket_id")
    .on("notification_outbox")
    .column("ticket_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("notification_outbox").ifExists().execute();
}
