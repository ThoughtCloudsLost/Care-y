import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("kb_items")
    .addColumn("encrypted_excerpt", "bytea")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("kb_items")
    .dropColumn("encrypted_excerpt")
    .execute();
}
