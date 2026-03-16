import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add org public key to org_config (singleton per tenant)
  await db.schema
    .alterTable("org_config")
    .addColumn("org_public_key", "bytea") // Curve25519, 32 bytes. Null until first admin onboarding.
    .execute();

  // Per-volunteer wrapped copies of the org secret key (ECIES wrapping)
  await db.schema
    .createTable("wrapped_org_keys")
    .addColumn("user_id", "uuid", (col) =>
      col.primaryKey().references("users.id").onDelete("cascade"),
    )
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull()) // ristretto255, 32 bytes
    .addColumn("wrapped_key", "bytea", (col) => col.notNull())
    .addColumn("nonce", "bytea", (col) => col.notNull()) // 24 bytes
    .addColumn("key_version", "integer", (col) => col.notNull().defaultTo(1))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("wrapped_org_keys").execute();
  await db.schema
    .alterTable("org_config")
    .dropColumn("org_public_key")
    .execute();
}
