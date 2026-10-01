/**
 * Table privileges for the runtime database role.
 *
 * The API connects as a role that owns nothing. An object's owner holds
 * every privilege and grant option on it (PostgreSQL GRANT), so a revoke
 * only binds a role that does not own the table. The owner role runs these
 * grants after every migration, because GRANT ... ON ALL TABLES IN SCHEMA
 * covers only the tables that exist when it runs.
 */

import { Kysely, PostgresDialect, sql } from "kysely";
import type { Pool } from "pg";
import { listTenantSchemas } from "./schema-utils.js";
import type { PlatformDatabase } from "./types.js";

/** Tables the application role may only INSERT into and SELECT from. */
export const APPEND_ONLY_TENANT_TABLES = ["audit_log"] as const;
export const APPEND_ONLY_PLATFORM_TABLES = ["oprf_audit_log"] as const;

const PLATFORM_SCHEMA = "public";

/**
 * Grants the application role every DML privilege in the schema, then
 * revokes UPDATE and DELETE on the append-only tables. Idempotent; run after
 * every migration so a new table never stays unrestricted.
 * Raw SQL is required (GRANT has no builder) and every identifier names its
 * schema explicitly, so the search_path hazard behind the tenant raw-SQL ban
 * does not apply.
 *
 * @param db - connection to run the statements on, normally a transaction
 * @param schema - schema whose tables and sequences are granted
 * @param appRole - the runtime role receiving the privileges
 * @param appendOnly - tables in `schema` that lose UPDATE and DELETE
 */
export async function applySchemaGrants(
  db: Kysely<unknown>,
  schema: string,
  appRole: string,
  appendOnly: readonly string[],
): Promise<void> {
  await sql`grant usage on schema ${sql.id(schema)} to ${sql.id(appRole)}`.execute(
    db,
  );
  await sql`grant select, insert, update, delete on all tables in schema ${sql.id(schema)} to ${sql.id(appRole)}`.execute(
    db,
  );
  await sql`grant usage, select on all sequences in schema ${sql.id(schema)} to ${sql.id(appRole)}`.execute(
    db,
  );
  for (const table of appendOnly) {
    await sql`revoke update, delete on ${sql.id(schema, table)} from ${sql.id(appRole)}`.execute(
      db,
    );
  }
}

/**
 * Throwaway Kysely instance over the caller's pool. Never destroyed:
 * destroying it would end the pool, which stays with the caller.
 */
function kyselyOver(pool: Pool): Kysely<unknown> {
  return new Kysely<unknown>({ dialect: new PostgresDialect({ pool }) });
}

/**
 * Runs one schema's grants in a transaction. The broad grant briefly
 * includes UPDATE and DELETE on the append-only tables until the revoke
 * that follows it; inside one transaction no other session sees that state.
 */
async function applyInTransaction(
  pool: Pool,
  schema: string,
  appRole: string,
  appendOnly: readonly string[],
): Promise<void> {
  await kyselyOver(pool)
    .transaction()
    .execute(async (trx) => {
      await applySchemaGrants(trx, schema, appRole, appendOnly);
    });
}

/**
 * Grants on the platform tables in `public`, with `oprf_audit_log`
 * append-only.
 *
 * @param pool - owner-role pool (createAdminPool)
 * @param appRole - the runtime role
 */
export async function applyPlatformGrants(
  pool: Pool,
  appRole: string,
): Promise<void> {
  await applyInTransaction(
    pool,
    PLATFORM_SCHEMA,
    appRole,
    APPEND_ONLY_PLATFORM_TABLES,
  );
}

/**
 * Grants on one tenant schema, with `audit_log` append-only.
 *
 * @param pool - owner-role pool (createAdminPool)
 * @param schema - the tenant schema
 * @param appRole - the runtime role
 */
export async function applyTenantGrants(
  pool: Pool,
  schema: string,
  appRole: string,
): Promise<void> {
  await applyInTransaction(pool, schema, appRole, APPEND_ONLY_TENANT_TABLES);
}

/**
 * Platform grants, then the tenant grants for every org_* schema, listed
 * with the same query migrate.ts --all-schemas uses.
 *
 * @param pool - owner-role pool (createAdminPool)
 * @param appRole - the runtime role
 */
export async function applyAllGrants(
  pool: Pool,
  appRole: string,
): Promise<void> {
  await applyPlatformGrants(pool, appRole);
  const platformDb = new Kysely<PlatformDatabase>({
    dialect: new PostgresDialect({ pool }),
  });
  for (const schema of await listTenantSchemas(platformDb)) {
    await applyTenantGrants(pool, schema, appRole);
  }
}
