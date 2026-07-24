/**
 * Shared helpers for org-schema discovery, validation, and migration.
 *
 * Used by migrate.ts (CLI), schema-create.ts (CLI), and org/service.ts (runtime).
 * logMigrationResults is CLI-only (migrate.ts, schema-create.ts).
 * Keeps the Migrator construction and schema queries in one place instead of
 * duplicating them across three files.
 */

import * as path from "node:path";
import * as fs from "node:fs/promises";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { MigrationResult } from "kysely/migration";
import { FileMigrationProvider, Migrator } from "kysely/migration";
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

export function createTenantMigrator(
  db: Kysely<TenantDatabase>,
  schemaName: string,
): Migrator {
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
