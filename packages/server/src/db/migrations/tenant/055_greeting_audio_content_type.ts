import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("phone_greetings")
    .addColumn("audio_content_type", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("phone_greetings")
    .dropColumn("audio_content_type")
    .execute();
}
