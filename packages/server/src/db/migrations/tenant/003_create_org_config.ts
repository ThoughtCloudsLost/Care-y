import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("org_config")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    // Branding columns: NULL until crypto layer populates them
    .addColumn("encrypted_name", "bytea")
    .addColumn("encrypted_logo", "bytea")
    .addColumn("encrypted_primary_color", "bytea")
    .addColumn("encrypted_client_text", "bytea")
    .addColumn("client_encrypted_branding", "bytea")
    // Operational settings
    .addColumn("pii_retention_days", "integer")
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("org_config").execute();
}
