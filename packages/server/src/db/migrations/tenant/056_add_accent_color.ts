import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("encrypted_accent_color", "bytea")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("encrypted_accent_color")
    .execute();
}
