import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "./types.js";

// int8 (PostgreSQL bigint) is returned as string by pg by default.
// Override the parser so COUNT(*) and other int8 results come back as number.
// Must be set before creating the Pool.
pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
  parseInt(val, 10),
);

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

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
export function tenantDb(orgSchema: string): Kysely<TenantDatabase> {
  return db.withSchema(orgSchema) as unknown as Kysely<TenantDatabase>;
}
