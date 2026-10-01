import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "./types.js";
import type { OrgSchema } from "@care-y/shared";
import { getEnv } from "../env.js";

// int8 (PostgreSQL bigint) is returned as string by pg by default.
// Override the parser so COUNT(*) and other int8 results come back as number.
// Must be set before creating the Pool.
pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
  parseInt(val, 10),
);

/**
 * Connection settings shared by the pool and by any dedicated client that
 * must hold one session open. LISTEN registers the current session only,
 * so a listener cannot use a pooled connection.
 *
 * DATABASE_URL comes from getEnv(), not process.env: in production it
 * carries the Postgres password and is loaded from the secrets file
 * (ADR-131). Entry points import env-bootstrap.ts first so the cache is
 * filled before this module is evaluated.
 */
export const pgConnectionConfig: pg.ClientConfig = {
  connectionString: getEnv().DATABASE_URL,
};

/**
 * The process-wide connection pool behind `db` and every `tenantDb()`.
 * Exported for callers that build their own Kysely instance over the same
 * connections instead of opening a second pool.
 */
export const pool = new pg.Pool({
  ...pgConnectionConfig,
  max: 10,
});

const dialect = new PostgresDialect({ pool });

// Platform-level Kysely instance. Queries the `public` schema by default.
// Platform tables (orgs, telephony_config, deletion_requests) go through this instance.
export const db = new Kysely<PlatformDatabase>({ dialect });

// Returns a schema-scoped Kysely instance for a tenant schema (e.g., "org_<uuid>").
//
// Uses Kysely's WithSchemaPlugin, which is an AST transformer: every unqualified
// table reference in the query builder becomes schema-qualified SQL (e.g.,
// "org_abc"."users"). This is stateless per-query (no SET search_path, no session
// state, no transaction required). Safe with pg.Pool.
//
// CRITICAL: Raw sql`` tagged templates bypass WithSchemaPlugin (Kysely #761).
// Never use sql`` for tenant table references. Use the query builder only.
//
// The `as unknown as Kysely<TenantDatabase>` cast is required because
// .withSchema() preserves the source type parameter. At runtime the instance
// is identical except for the added plugin.
export function tenantDb(orgSchema: OrgSchema): Kysely<TenantDatabase> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- .withSchema() preserves source type param; runtime instance is correct, TS can't express the schema swap
  return db.withSchema(orgSchema) as unknown as Kysely<TenantDatabase>;
}
