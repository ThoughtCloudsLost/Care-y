import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("invite_tokens")
    .addColumn("revoked_at", "timestamptz")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("invite_tokens")
    .dropColumn("revoked_at")
    .execute();
}
