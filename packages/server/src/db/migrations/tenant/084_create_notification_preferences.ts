// Per-user notification preferences with scope cascade. Each row is an
// explicit override: absent row at global scope means enabled (the default),
// absent row at queue/ticket scope means inherit from the parent scope.
// No created_at/updated_at columns: the server never acts on preference
// age and the UI never shows it (ADR-018 two-question test).
//
// SSE is deliberately excluded from the channel enum. SSE is the in-app
// feed and is always delivered; storing SSE rows would be dead data.

import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("notification_preferences")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("scope_type", "text", (col) => col.notNull())
    .addColumn("scope_id", "uuid")
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("channel", "text", (col) => col.notNull())
    .addColumn("enabled", "boolean", (col) => col.notNull())
    .addUniqueConstraint(
      "notification_preferences_scope_unique",
      ["user_id", "scope_type", "scope_id", "event_type", "channel"],
      (b) => b.nullsNotDistinct(),
    )
    // CHECK constraints ride on the createTable builder: raw ALTER TABLE
    // statements would bypass the tenant migrator's withSchema() prefixing
    // (Kysely #761) and run against the wrong schema. The sql expressions
    // reference columns only, never table names, so they are schema-safe.
    .addCheckConstraint(
      "notification_preferences_valid_scope_type",
      sql`scope_type IN ('global', 'queue', 'ticket')`,
    )
    .addCheckConstraint(
      "notification_preferences_valid_channel",
      sql`channel IN ('push', 'email', 'sms')`,
    )
    // scope_id is NULL exactly when scope_type is 'global'. Global rows
    // have no referent; queue/ticket rows always have one.
    .addCheckConstraint(
      "notification_preferences_scope_id_null_iff_global",
      sql`(scope_type = 'global') = (scope_id IS NULL)`,
    )
    .execute();

  // Index for the dispatch read path: resolve preferences for a set of
  // users on a given event type without scanning the whole table.
  await db.schema
    .createIndex("notification_preferences_dispatch_idx")
    .on("notification_preferences")
    .columns(["user_id", "event_type"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("notification_preferences").execute();
}
