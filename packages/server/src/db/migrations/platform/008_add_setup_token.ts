import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("orgs")
    .addColumn("setup_token_hash", "bytea")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("orgs").dropColumn("setup_token_hash").execute();
}
