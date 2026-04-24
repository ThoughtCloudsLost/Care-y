import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .createTable("note_types")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("encrypted_name", "bytea", (col) => col.notNull())
    .addColumn("encrypted_icon", "bytea", (col) => col.notNull())
    .addColumn("encrypted_escalation_targets", "bytea", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("requires_on_close", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropTable("note_types").execute();
}
