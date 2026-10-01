/**
 * Shared helpers for org-schema discovery, validation, and migration.
 *
 * Used by migrate.ts (CLI), schema-create.ts (CLI), and org/service.ts (runtime).
 * logMigrationResults is CLI-only (migrate.ts, schema-create.ts).
 * Keeps the Migrator construction and schema queries in one place instead of
 * duplicating them across three files. The schema-scoped introspection
 * dialect lives here too, so tenant provisioning and the test suite share
 * one implementation.
 */

import * as path from "node:path";
import * as fs from "node:fs/promises";
import type { Pool } from "pg";
import {
  Kysely,
  PostgresDialect,
  sql,
  type DatabaseIntrospector,
  type PostgresDialectConfig,
  type TableMetadata,
} from "kysely";
import type { MigrationResult } from "kysely/migration";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import type { OrgSchema } from "@care-y/shared";
import type { PlatformDatabase, TenantDatabase } from "./types.js";

// ── Schema validation ────────────────────────────────────────────────

const ORG_SCHEMA_PATTERN =
  /^org_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isValidOrgSchemaName(name: string): boolean {
  return ORG_SCHEMA_PATTERN.test(name);
}

// ── Schema discovery ─────────────────────────────────────────────────

export async function schemaExists(
  db: Kysely<PlatformDatabase>,
  schemaName: string,
): Promise<boolean> {
  const row = await db
    .selectFrom(
      sql<{ schema_name: string }>`information_schema.schemata`.as("s"),
    )
    .select("schema_name")
    .where("schema_name", "=", schemaName)
    .executeTakeFirst();
  return row !== undefined;
}

export async function listTenantSchemas(
  db: Kysely<PlatformDatabase>,
): Promise<string[]> {
  const rows = await db
    .selectFrom(
      sql<{ schema_name: string }>`information_schema.schemata`.as("s"),
    )
    .select("schema_name")
    .where("schema_name", "like", "org_%")
    .execute();
  return rows.map((r) => r.schema_name);
}

// ── Scoped introspection ─────────────────────────────────────────────

/**
 * Postgres dialect whose introspector survives a concurrent `DROP SCHEMA`.
 *
 * Kysely's Migrator decides whether its bookkeeping tables already exist by
 * listing every table in the database and filtering the result in JavaScript.
 * That listing calls two functions per row that re-resolve a name against the
 * live catalog rather than the query snapshot: `has_schema_privilege()` in the
 * where clause and `pg_get_serial_sequence()` in the select list. Both raise
 * `schema "<name>" does not exist` when the schema is gone, so a `DROP SCHEMA`
 * committed by another session (an org rolled back while another is
 * provisioned, or a test file tearing down) fails an unrelated migration
 * before its first migration runs.
 *
 * This introspector reads `pg_class` and `pg_namespace` directly and calls
 * neither function, so a dropped schema simply drops out of the result. Pass a
 * schema to narrow it further, which also takes the cost from every column in
 * the database down to every table in one schema.
 *
 * The Migrator reads only `name` and `schema` from each entry, so the narrowed
 * result carries everything its one caller uses. Nothing else in the codebase
 * reads `db.introspection`.
 */
export class SafeIntrospectionPostgresDialect extends PostgresDialect {
  readonly #schema: string | undefined;

  constructor(config: PostgresDialectConfig, schema?: string) {
    super(config);
    this.#schema = schema;
  }

  override createIntrospector(
    db: Kysely<PlatformDatabase>,
  ): DatabaseIntrospector {
    const schema = this.#schema;
    const inner = super.createIntrospector(db);

    async function getTables(): Promise<TableMetadata[]> {
      // Catalog query, every object schema-qualified. Same system-schema
      // exclusions as Kysely's own introspector, minus the two calls that
      // resolve names outside the snapshot.
      const schemaFilter =
        schema === undefined
          ? sql`ns.nspname !~ '^pg_' and ns.nspname <> 'information_schema' and ns.nspname <> 'crdb_internal'`
          : sql`ns.nspname = ${schema}`;

      const result = await sql<{
        name: string;
        kind: string;
        schema: string;
      }>`select c.relname as name, c.relkind as kind, ns.nspname as schema
         from pg_catalog.pg_class as c
         join pg_catalog.pg_namespace as ns on c.relnamespace = ns.oid
         where ${schemaFilter}
           and c.relkind in ('r', 'v', 'p', 'f')`.execute(db);

      return result.rows.map((row) => ({
        name: row.name,
        isView: row.kind === "v",
        isForeign: row.kind === "f",
        schema: row.schema,
        columns: [],
      }));
    }

    return {
      getSchemas: () => inner.getSchemas(),
      getTables,
    };
  }
}

// ── Migration factories ──────────────────────────────────────────────

const PLATFORM_MIGRATION_DIR = path.join(
  import.meta.dirname,
  "migrations",
  "platform",
);

const TENANT_MIGRATION_DIR = path.join(
  import.meta.dirname,
  "migrations",
  "tenant",
);

export function createPlatformMigrator(db: Kysely<PlatformDatabase>): Migrator {
  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: PLATFORM_MIGRATION_DIR,
    }),
  });
}

/**
 * Builds the migrator for one tenant schema over the shared connection pool.
 *
 * The migrator gets its own Kysely instance with the scoped introspection
 * dialect, because the stock introspector reads every schema in the database
 * before the first migration runs: a schema dropped concurrently fails that
 * read, and its cost grows with every tenant. The instance is never
 * destroyed, because destroying it would end the pool, which stays with the
 * caller that owns it.
 */
export function createTenantMigrator(
  pool: Pool,
  schemaName: OrgSchema,
): Migrator {
  const db = new Kysely<TenantDatabase>({
    dialect: new SafeIntrospectionPostgresDialect({ pool }, schemaName),
  }).withSchema(schemaName);
  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: TENANT_MIGRATION_DIR,
    }),
    // Each tenant schema gets its own kysely_migration tracking table,
    // co-located in the tenant schema rather than polluting public.
    migrationTableSchema: schemaName,
  });
}

// ── Migration logging ────────────────────────────────────────────────

export function logMigrationResults(
  label: string,
  results: readonly MigrationResult[] | undefined,
  direction: "up" | "down" = "up",
): void {
  if (!results || results.length === 0) {
    const verb = direction === "down" ? "roll back" : "apply";
    console.log(`[${label}] No migrations to ${verb}`);
    return;
  }
  for (const r of results) {
    console.log(`[${label}] ${r.status} ${r.migrationName}`);
  }
}
