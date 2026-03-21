import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("phone_greetings")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("phone_id", "uuid", (col) =>
      col.notNull().references("phones.id").onDelete("restrict"),
    )
    .addColumn("greeting_type", "text", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull())
    .addColumn("text", "text", (col) => col.notNull())
    .addColumn("is_audio", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("audio_blob_key", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("phone_greetings_phone_locale_type_idx")
    .on("phone_greetings")
    .columns(["phone_id", "locale", "greeting_type"])
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("phone_greetings_phone_locale_type_idx").execute();
  await db.schema.dropTable("phone_greetings").execute();
}
