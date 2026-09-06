import type { Kysely } from "kysely";

/**
 * Creates the inbound_email_domains table in the public schema.
 *
 * Maps an email domain to an org so the SMTP receiver can resolve the
 * tenant from the RCPT domain before touching any tenant schema (same
 * public-first shape as webhook URL routing, GAP-02). Domains are
 * stored lowercase; application-layer normalization is required on
 * write. Rows are operator-managed in v1 (no admin UI).
 *
 * The FK to orgs uses ON DELETE RESTRICT (multi-tenancy rule: never
 * CASCADE across the tenant boundary). An org cannot be deleted while
 * it still has an inbound domain row.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("inbound_email_domains")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("domain", "text", (col) => col.notNull().unique())
    .addColumn("org_id", "uuid", (col) =>
      col.notNull().references("orgs.id").onDelete("restrict"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("idx_inbound_email_domains_org_id")
    .on("inbound_email_domains")
    .column("org_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("inbound_email_domains").execute();
}
