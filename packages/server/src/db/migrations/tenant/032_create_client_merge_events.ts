import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("client_merge_events")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("primary_client_id", "uuid", (col) =>
      col.notNull().references("clients.id").onDelete("restrict"),
    )
    .addColumn("secondary_client_id", "uuid", (col) =>
      col.notNull().references("clients.id").onDelete("restrict"),
    )
    .addColumn("merged_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("snapshot", "bytea", (col) => col.notNull())
    .addColumn("undo_locked", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("is_undone", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("client_merge_events").execute();
}
