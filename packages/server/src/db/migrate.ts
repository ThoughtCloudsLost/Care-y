import { db, tenantDb } from "./db.js";
import {
  createPlatformMigrator,
  createTenantMigrator,
  listTenantSchemas,
  logMigrationResults,
} from "./schema-utils.js";

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
const targetSchema =
  schemaFlag !== undefined ? schemaFlag.slice("--schema=".length) : null;
const allSchemas = args.includes("--all-schemas");

async function runMigrator(
  label: string,
  dir: "up" | "down",
  schemaName?: string,
): Promise<void> {
  const migrator =
    schemaName !== undefined
      ? createTenantMigrator(tenantDb(schemaName), schemaName)
      : createPlatformMigrator(db);

  const { error, results } =
    dir === "down"
      ? await migrator.migrateDown()
      : await migrator.migrateToLatest();

  logMigrationResults(label, results, dir);

  if (error !== undefined) {
    console.error(`[${label}] Migration failed:`, error);
    process.exit(1);
  }
}

// --- Main ---

if (targetSchema !== null) {
  // Single tenant schema
  await runMigrator(targetSchema, direction, targetSchema);
} else if (allSchemas) {
  // Platform first, then all tenant schemas
  await runMigrator("platform", direction);
  const schemas = await listTenantSchemas(db);
  for (const schema of schemas) {
    await runMigrator(schema, direction, schema);
  }
} else {
  // Default: platform only
  await runMigrator("platform", direction);
}

await db.destroy();
