import type { Kysely } from "kysely";

/**
 * Creates the platform_audit_log table in the public schema.
 *
 * Records platform-level events that must outlive the tenant schema, such
 * as an org's erasure. A row holds the action, the org UUID, the actor (a
 * user id or "cli") and the time, nothing else.
 *
 * org_id carries no foreign key to orgs: the orgs row is already gone when
 * the erasure row is written.
 *
 * The runtime role may insert and select but never update or delete; the
 * table is listed in APPEND_ONLY_PLATFORM_TABLES in db/grants.ts.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("platform_audit_log")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("action", "text", (col) => col.notNull())
    .addColumn("org_id", "uuid", (col) => col.notNull())
    .addColumn("actor", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("platform_audit_log").execute();
}
