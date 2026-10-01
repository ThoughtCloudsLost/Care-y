// Must stay the first import: loads the secrets file and fills the getEnv()
// cache before db.ts reads DATABASE_URL at import time (ADR-131).
import "../env-bootstrap.js";
import type { Kysely } from "kysely";
import type { Pool } from "pg";
import { db, pool } from "./db.js";
import {
  createPlatformMigrator,
  createTenantMigrator,
  listTenantSchemas,
  logMigrationResults,
} from "./schema-utils.js";
import type { PlatformDatabase } from "./types.js";
import { orgSchemaNameSchema, type OrgSchema } from "@care-y/shared";

// CLI usage:
//   migrate.ts [down] [--platform | --schema=org_<uuid> | --all-schemas]
//
//   --platform            - platform migrations only (default when no flag given)
//   --schema=org_<uuid>   - tenant migrations for one schema
//   --all-schemas         - platform first, then all org_* tenant schemas
//   down                  - roll back one migration (combine with any target flag)

/** Connections main() migrates over. The caller owns and closes them. */
export interface MigrationConnections {
  readonly db: Kysely<PlatformDatabase>;
  readonly pool: Pool;
}

async function runMigrator(
  label: string,
  dir: "up" | "down",
  connections: MigrationConnections,
  schemaName?: OrgSchema,
): Promise<void> {
  const migrator =
    schemaName !== undefined
      ? createTenantMigrator(connections.pool, schemaName)
      : createPlatformMigrator(connections.db);

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

/**
 * Runs the migrations `args` asks for (the CLI arguments above, without the
 * node and script paths). Exported so tests can call it without spawning a
 * process; they pass their own connections. Leaves the connections open.
 */
export async function main(
  args: readonly string[],
  connections: MigrationConnections = { db, pool },
): Promise<void> {
  const direction = args.includes("down") ? "down" : "up";
  const schemaFlag = args.find((a) => a.startsWith("--schema="));
  const targetSchema =
    schemaFlag !== undefined ? schemaFlag.slice("--schema=".length) : null;
  const allSchemas = args.includes("--all-schemas");

  if (targetSchema !== null) {
    // Single tenant schema
    const parsed = orgSchemaNameSchema.parse(targetSchema);
    await runMigrator(targetSchema, direction, connections, parsed);
  } else if (allSchemas) {
    // Platform first, then all tenant schemas
    await runMigrator("platform", direction, connections);
    const schemas = await listTenantSchemas(connections.db);
    for (const schema of schemas) {
      await runMigrator(
        schema,
        direction,
        connections,
        orgSchemaNameSchema.parse(schema),
      );
    }
  } else {
    // Default: platform only
    await runMigrator("platform", direction, connections);
  }
}

// Run only when executed as a script, not when a test imports main().
const entryArg = process.argv[1] ?? "";
if (entryArg.endsWith("migrate.ts") || entryArg.endsWith("migrate.js")) {
  await main(process.argv.slice(2));
  await db.destroy();
}
