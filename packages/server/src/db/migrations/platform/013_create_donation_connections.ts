import { type Kysely } from "kysely";

/**
 * Creates the donation_connections table in the public schema.
 *
 * One row per connected donation provider account, so an org may hold
 * several (Givebutter today, others later), each with its own id. config
 * is a JSON blob sealed under OPS_SECRETS_KEY holding the provider's API
 * key and, once registered, the provider's webhook id and signing secret.
 * Nothing about donors or amounts is stored here; fund totals are fetched
 * from the provider on demand.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("donation_connections")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("org_id", "uuid", (col) =>
      col.notNull().references("orgs.id").onDelete("restrict"),
    )
    // Deliberately unconstrained, for the same reason as
    // telephony_config.provider: the config schema registry and the
    // constructor map define the valid providers, and the factory fails
    // closed on a value missing from either. A database allowlist would be
    // a third registry to keep in sync by hand.
    .addColumn("provider", "text", (col) => col.notNull())
    .addColumn("config", "bytea", (col) => col.notNull())
    .addColumn("key_version", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("idx_donation_connections_org_id")
    .on("donation_connections")
    .column("org_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("donation_connections").execute();
}
