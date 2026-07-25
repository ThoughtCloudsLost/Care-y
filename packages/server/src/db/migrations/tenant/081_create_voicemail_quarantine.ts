import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .createTable("voicemail_quarantine")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("recording_sid", "text", (col) => col.notNull().unique())
    .addColumn("call_sid", "text", (col) => col.notNull())
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("size_bytes", "integer", (col) => col.notNull())
    .addColumn("duration_seconds", "integer")
    .addColumn("reason", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("client_id", "uuid")
    .addColumn("encrypted_caller_number", "bytea")
    .addColumn("encrypted_called_number", "bytea")
    .addColumn("routed_ticket_id", "uuid")
    .addColumn("routed_followup_id", "uuid")
    .addColumn("resolved_by", "uuid")
    .addColumn("resolved_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("voicemail_quarantine_status_idx")
    .on("voicemail_quarantine")
    .column("status")
    .execute();

  await db.schema
    .createIndex("voicemail_quarantine_created_at_idx")
    .on("voicemail_quarantine")
    .column("created_at")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropIndex("voicemail_quarantine_created_at_idx").execute();
  await db.schema.dropIndex("voicemail_quarantine_status_idx").execute();
  await db.schema.dropTable("voicemail_quarantine").execute();
}
