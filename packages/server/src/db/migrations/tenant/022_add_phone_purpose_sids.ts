import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("phone_outbound_sid", "text")
    .execute();

  await db.schema
    .alterTable("org_config")
    .addColumn("phone_system_sid", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("phone_outbound_sid")
    .execute();

  await db.schema
    .alterTable("org_config")
    .dropColumn("phone_system_sid")
    .execute();
}
