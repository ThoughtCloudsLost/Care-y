import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("recordings")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.references("followups.id").onDelete("set null"),
    )
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("size_bytes", "integer", (col) => col.notNull())
    .addColumn("duration_seconds", "integer")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("recordings_ticket_id_idx")
    .on("recordings")
    .column("ticket_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("recordings_ticket_id_idx").execute();
  await db.schema.dropTable("recordings").execute();
}
