import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("preset_replies")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("encrypted_title", "bytea", (col) => col.notNull())
    .addColumn("encrypted_body", "bytea", (col) => col.notNull())
    .addColumn("queue_id", "uuid", (col) =>
      col.references("queues.id").onDelete("set null"),
    )
    .addColumn("created_by", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("preset_replies").execute();
}
