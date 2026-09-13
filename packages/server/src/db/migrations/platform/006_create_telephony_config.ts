import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("telephony_config")
    .addColumn("org_id", "uuid", (col) =>
      col.primaryKey().references("orgs.id").onDelete("restrict"),
    )
    // Deliberately unconstrained. Valid provider identities are defined by
    // the config schema registry, the constructor map, and the provider
    // statics map, and the factory fails closed when a stored value is
    // missing from any of them. A database allowlist would be a fourth
    // registry to keep in sync by hand, and it cannot be environment aware,
    // so it could not express that some providers are non-production only.
    .addColumn("provider", "text", (col) => col.notNull().defaultTo("twilio"))
    .addColumn("config", "bytea", (col) => col.notNull())
    .addColumn("key_version", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("telephony_config").execute();
}
