import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .createTable("tracked_calls")
    .addColumn("call_sid", "text", (col) => col.primaryKey())
    .addColumn("ticket_id", "uuid")
    .addColumn("user_id", "uuid")
    .addColumn("direction", "text", (col) => col.notNull())
    .addColumn("client_id", "uuid")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("tracked_calls_created_at_idx")
    .on("tracked_calls")
    .column("created_at")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropIndex("tracked_calls_created_at_idx").execute();
  await db.schema.dropTable("tracked_calls").execute();
}
