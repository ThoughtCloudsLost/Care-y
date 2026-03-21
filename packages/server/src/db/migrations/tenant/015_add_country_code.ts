import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("default_country_code", "text", (col) =>
      col.notNull().defaultTo("+1"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("default_country_code")
    .execute();
}
