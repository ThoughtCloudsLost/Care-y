import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("invite_tokens")
    .addColumn("encrypted_token", "bytea")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("invite_tokens")
    .dropColumn("encrypted_token")
    .execute();
}
