import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("vapid_config")
    .addColumn("id", "integer", (col) => col.primaryKey().defaultTo(1))
    .addColumn("public_key", "text", (col) => col.notNull())
    .addColumn("encrypted_private_key", "bytea", (col) => col.notNull())
    .addColumn("key_version", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addCheckConstraint("vapid_config_singleton", sql`id = 1`)
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("vapid_config").execute();
}
