import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .addColumn("key_generation", "uuid")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .dropColumn("key_generation")
    .execute();
}
