import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("phone_blacklist")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("phone_hash", "text", (col) => col.notNull().unique())
    .addColumn("encrypted_number", "bytea", (col) => col.notNull())
    .addColumn("added_by", "uuid", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("phone_blacklist_phone_hash_idx")
    .on("phone_blacklist")
    .column("phone_hash")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("phone_blacklist").execute();
}
