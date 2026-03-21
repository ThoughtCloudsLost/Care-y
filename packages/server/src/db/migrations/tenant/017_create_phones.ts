import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("phones")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("phone_hash", "text", (col) => col.notNull())
    .addColumn("encrypted_number", "bytea", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull().defaultTo("en-US"))
    .addColumn("location_city", "text")
    .addColumn("location_region", "text")
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("phones_phone_hash_idx")
    .on("phones")
    .column("phone_hash")
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("phones_phone_hash_idx").execute();
  await db.schema.dropTable("phones").execute();
}
