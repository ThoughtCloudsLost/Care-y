import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("sms_responses")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("response_type", "text", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull())
    .addColumn("text", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("sms_responses_locale_type_idx")
    .on("sms_responses")
    .columns(["locale", "response_type"])
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("sms_responses_locale_type_idx").execute();
  await db.schema.dropTable("sms_responses").execute();
}
