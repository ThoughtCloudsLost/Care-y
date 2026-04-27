import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("phone_greetings")
    .dropConstraint("phone_greetings_phone_id_fkey")
    .execute();

  await db.schema.dropIndex("phone_greetings_phone_locale_type_idx").execute();

  await db.schema
    .alterTable("phone_greetings")
    .addColumn("phone_number", "text")
    .execute();

  await db.schema
    .alterTable("phone_greetings")
    .dropColumn("phone_id")
    .execute();

  await db.schema
    .alterTable("phone_greetings")
    .alterColumn("phone_number", (ac) => ac.setNotNull())
    .execute();

  await db.schema
    .createIndex("phone_greetings_number_locale_type_idx")
    .on("phone_greetings")
    .columns(["phone_number", "locale", "greeting_type"])
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("phone_greetings_number_locale_type_idx").execute();

  await db.schema
    .alterTable("phone_greetings")
    .addColumn("phone_id", "uuid")
    .execute();

  await db.schema
    .alterTable("phone_greetings")
    .dropColumn("phone_number")
    .execute();

  await db.schema
    .alterTable("phone_greetings")
    .alterColumn("phone_id", (ac) => ac.setNotNull())
    .execute();

  await db.schema
    .createIndex("phone_greetings_phone_locale_type_idx")
    .on("phone_greetings")
    .columns(["phone_id", "locale", "greeting_type"])
    .unique()
    .execute();
}
