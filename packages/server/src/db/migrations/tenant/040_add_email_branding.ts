import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("email_from_name", "text", (col) =>
      col.notNull().defaultTo("CARE-Y Hotline"),
    )
    .addColumn("email_from_address", "text", (col) =>
      col.notNull().defaultTo("notify@care-y.app"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("email_from_name")
    .dropColumn("email_from_address")
    .execute();
}
