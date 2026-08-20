/**
 * Shim for packages/server/src/db/schema-utils.ts
 *
 * Replaces FileMigrationProvider (fs-based) with import.meta.glob providers.
 * Preserves all exported names and semantics (migrationTableSchema, etc.).
 *
 * Mirrors: packages/server/src/db/schema-utils.ts:1-113
 */

import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { MigrationProvider, Migration } from "kysely/migration";
import { Migrator } from "kysely/migration";
import type {
  PlatformDatabase,
  TenantDatabase,
} from "../../../../../server/src/db/types.js";

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

// ── Glob-based migration providers ──────────────────────────────────

// import.meta.glob paths are relative from THIS file's location in
// packages/demo/src/lib/engine/server/
const platformGlob: Record<string, () => Promise<Record<string, unknown>>> =
  import.meta.glob(
    "../../../../../server/src/db/migrations/platform/*.ts",
  ) as Record<string, () => Promise<Record<string, unknown>>>;

const tenantGlob: Record<string, () => Promise<Record<string, unknown>>> =
  import.meta.glob(
    "../../../../../server/src/db/migrations/tenant/*.ts",
  ) as Record<string, () => Promise<Record<string, unknown>>>;

/**
 * Extracts the bare filename (without extension) from a glob key path.
 * Kysely runs migrations in name order, so keys must sort correctly.
 */
function extractMigrationName(globKey: string): string {
  const parts = globKey.split("/");
  const filename = parts[parts.length - 1] ?? globKey;
  return filename.replace(/\.ts$/, "");
}

function createGlobProvider(
  globMap: Record<string, () => Promise<Record<string, unknown>>>,
): MigrationProvider {
  return {
    async getMigrations(): Promise<Record<string, Migration>> {
      const migrationMap = new Map<string, Migration>();
      const entries = Object.entries(globMap).sort(([a], [b]) =>
        a.localeCompare(b),
      );

      for (const [path, loader] of entries) {
        const name = extractMigrationName(path);
        const mod = await loader();
        // Migration modules export { up, down }. The glob loader types
        // them as Record<string, unknown>; cast through unknown because
        // the shapes do not overlap at the type level.
        migrationMap.set(name, mod as unknown as Migration);
      }

      return Object.fromEntries(migrationMap);
    },
  };
}

// ── Migration factories ──────────────────────────────────────────────

export function createPlatformMigrator(db: Kysely<PlatformDatabase>): Migrator {
  return new Migrator({
    db,
    provider: createGlobProvider(platformGlob),
  });
}

export function createTenantMigrator(
  db: Kysely<TenantDatabase>,
  schemaName: string,
): Migrator {
  return new Migrator({
    db,
    provider: createGlobProvider(tenantGlob),
    migrationTableSchema: schemaName,
  });
}

// ── Migration logging ────────────────────────────────────────────────

export function logMigrationResults(
  label: string,
  results: readonly { status: string; migrationName: string }[] | undefined,
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

/** Returns the count of platform migration files. */
export function getPlatformMigrationCount(): number {
  return Object.keys(platformGlob).length;
}

/** Returns the count of tenant migration files. */
export function getTenantMigrationCount(): number {
  return Object.keys(tenantGlob).length;
}
