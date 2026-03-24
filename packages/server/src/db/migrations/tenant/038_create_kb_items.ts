import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("kb_items")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("category_id", "uuid", (col) =>
      col.notNull().references("kb_categories.id").onDelete("restrict"),
    )
    .addColumn("encrypted_title", "bytea", (col) => col.notNull())
    .addColumn("encrypted_body", "bytea", (col) => col.notNull())
    .addColumn("created_by", "text", (col) => col.notNull())
    .addColumn("vote_up_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("vote_down_count", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("rating", "real", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  // Index for category-filtered listing (most common query pattern)
  await db.schema
    .createIndex("idx_kb_items_category_created")
    .on("kb_items")
    .columns(["category_id", "created_at"])
    .execute();

  // Index for rating-sorted listing
  await db.schema
    .createIndex("idx_kb_items_rating")
    .on("kb_items")
    .column("rating")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_kb_items_rating").execute();
  await db.schema.dropIndex("idx_kb_items_category_created").execute();
  await db.schema.dropTable("kb_items").execute();
}
