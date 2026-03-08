import * as path from "node:path";
import * as fs from "node:fs/promises";
import { FileMigrationProvider, Migrator, sql } from "kysely";
import { db, tenantDb } from "./db.js";

// CLI usage:
//   migrate.ts [down] [--platform | --schema=org_<uuid> | --all-schemas]
//
//   (no flags)            - platform migrations only (default, backward compatible)
//   --platform            - platform migrations only (explicit)
//   --schema=org_<uuid>   - tenant migrations for one schema
//   --all-schemas         - platform first, then all org_* tenant schemas
//   down                  - roll back one migration (combine with any target flag)

const args = process.argv.slice(2);
const direction = args.includes("down") ? "down" : "up";
const schemaFlag = args.find((a) => a.startsWith("--schema="));
const targetSchema = schemaFlag ? schemaFlag.slice("--schema=".length) : null;
const allSchemas = args.includes("--all-schemas");

const platformDir = path.join(import.meta.dirname, "migrations", "platform");
const tenantDir = path.join(import.meta.dirname, "migrations", "tenant");

function makePlatformMigrator(): Migrator {
  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: platformDir,
    }),
  });
}

function makeTenantMigrator(orgSchema: string): Migrator {
  return new Migrator({
    db: tenantDb(orgSchema),
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: tenantDir,
    }),
    // Each tenant schema gets its own kysely_migration tracking table,
    // co-located in the tenant schema rather than polluting public.
    migrationTableSchema: orgSchema,
  });
}

async function runMigrator(
  migrator: Migrator,
  label: string,
  dir: "up" | "down",
): Promise<void> {
  const { error, results } =
    dir === "down"
      ? await migrator.migrateDown()
      : await migrator.migrateToLatest();

  if (!results || results.length === 0) {
    console.log(
      `[${label}] No migrations to ${dir === "down" ? "roll back" : "apply"}`,
    );
  }
  results?.forEach((r) => {
    console.log(`[${label}] ${r.status} ${r.migrationName}`);
  });
  if (error) {
    console.error(`[${label}] Migration failed:`, error);
    process.exit(1);
  }
}

async function discoverTenantSchemas(): Promise<string[]> {
  const rows = await db
    .selectFrom(
      sql<{ schema_name: string }>`information_schema.schemata`.as("s"),
    )
    .select("schema_name")
    .where("schema_name", "like", "org_%")
    .execute();
  return rows.map((r) => r.schema_name);
}

// --- Main ---

if (targetSchema) {
  // Single tenant schema
  const migrator = makeTenantMigrator(targetSchema);
  await runMigrator(migrator, targetSchema, direction);
} else if (allSchemas) {
  // Platform first, then all tenant schemas
  await runMigrator(makePlatformMigrator(), "platform", direction);
  const schemas = await discoverTenantSchemas();
  for (const schema of schemas) {
    await runMigrator(makeTenantMigrator(schema), schema, direction);
  }
} else {
  // Default: platform only
  await runMigrator(makePlatformMigrator(), "platform", direction);
}

await db.destroy();
