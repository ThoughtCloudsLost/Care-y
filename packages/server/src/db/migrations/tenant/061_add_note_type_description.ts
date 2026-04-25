import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("note_types")
    .addColumn("encrypted_description", "bytea")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("note_types")
    .dropColumn("encrypted_description")
    .execute();
}
