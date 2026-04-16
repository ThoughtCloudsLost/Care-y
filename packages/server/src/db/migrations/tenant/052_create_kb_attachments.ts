import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("kb_attachments")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("item_id", "uuid", (col) =>
      col.notNull().references("kb_items.id").onDelete("cascade"),
    )
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("size_bytes", "integer", (col) => col.notNull())
    .addColumn("encrypted_filename", "bytea")
    .addColumn("content_type", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("kb_attachments_item_id_idx")
    .on("kb_attachments")
    .column("item_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("kb_attachments").execute();
}
