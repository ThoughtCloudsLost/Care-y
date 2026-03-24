import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("audit_log")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("actor_id", "uuid", (col) => col.notNull())
    .addColumn("ticket_id", "uuid")
    .addColumn("metadata", "jsonb", (col) => col.notNull().defaultTo("{}"))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("audit_log_event_type_idx")
    .on("audit_log")
    .column("event_type")
    .execute();

  await db.schema
    .createIndex("audit_log_actor_id_idx")
    .on("audit_log")
    .column("actor_id")
    .execute();

  await db.schema
    .createIndex("audit_log_ticket_id_idx")
    .on("audit_log")
    .column("ticket_id")
    .execute();

  await db.schema
    .createIndex("audit_log_created_at_idx")
    .on("audit_log")
    .column("created_at")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("audit_log").execute();
}
