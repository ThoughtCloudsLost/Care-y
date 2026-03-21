import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("telephony_config")
    .addColumn("org_id", "uuid", (col) =>
      col.primaryKey().references("orgs.id").onDelete("restrict"),
    )
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

  // CHECK constraint on provider values.
  await sql`
    ALTER TABLE telephony_config
    ADD CONSTRAINT valid_provider
    CHECK (provider IN ('twilio', 'signalwire'))
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("telephony_config").execute();
}
