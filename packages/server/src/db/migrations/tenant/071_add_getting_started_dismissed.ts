import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("getting_started_dismissed_at", "timestamptz")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("getting_started_dismissed_at")
    .execute();
}
