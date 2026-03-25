import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("recommend_close_days", "integer")
    .execute();

  await db.schema
    .alterTable("org_config")
    .addColumn("media_retention_days", "integer", (col) =>
      col.notNull().defaultTo(90),
    )
    .execute();

  await db.schema
    .alterTable("org_config")
    .addColumn("media_purge_days", "integer", (col) =>
      col.notNull().defaultTo(30),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("media_purge_days")
    .execute();

  await db.schema
    .alterTable("org_config")
    .dropColumn("media_retention_days")
    .execute();

  await db.schema
    .alterTable("org_config")
    .dropColumn("recommend_close_days")
    .execute();
}
