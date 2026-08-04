// Escalation rules and idempotency ledger for time-based automated
// escalation. Rules are per-queue config that the background job reads
// autonomously; ADR-018 does not apply to config rows. The firings
// table records (rule, ticket) pairs that have already fired, capping
// each pair at one notification ever.

import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("escalation_rules")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("cascade"),
    )
    .addColumn("rule_type", "text", (col) => col.notNull())
    .addColumn("threshold_minutes", "integer", (col) => col.notNull())
    .addColumn("action", "text", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // CHECK: rule_type must be one of the known condition types.
  await sql`
    ALTER TABLE escalation_rules
    ADD CONSTRAINT escalation_rules_valid_rule_type
    CHECK (rule_type IN ('unassigned_duration', 'inactive_duration'))
  `.execute(db);

  // CHECK: action must be one of the known action types.
  await sql`
    ALTER TABLE escalation_rules
    ADD CONSTRAINT escalation_rules_valid_action
    CHECK (action IN ('notify_managers', 'notify_queue_watchers'))
  `.execute(db);

  // CHECK: threshold must be at least 5 minutes (checker runs every 5 min).
  await sql`
    ALTER TABLE escalation_rules
    ADD CONSTRAINT escalation_rules_min_threshold
    CHECK (threshold_minutes >= 5)
  `.execute(db);

  // Index for the checker's read path: active rules by queue.
  await db.schema
    .createIndex("escalation_rules_queue_active_idx")
    .on("escalation_rules")
    .columns(["queue_id", "is_active"])
    .execute();

  // Idempotency ledger: one row per (rule, ticket) pair, fires once ever.
  await db.schema
    .createTable("escalation_rule_firings")
    .addColumn("rule_id", "uuid", (col) =>
      col.notNull().references("escalation_rules.id").onDelete("cascade"),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("fired_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addPrimaryKeyConstraint("escalation_rule_firings_pk", [
      "rule_id",
      "ticket_id",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("escalation_rule_firings").execute();
  await db.schema.dropTable("escalation_rules").execute();
}
