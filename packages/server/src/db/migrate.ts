// Must stay the first import: loads the secrets file and fills the getEnv()
// cache before db.ts reads DATABASE_URL at import time (ADR-129).
import "../env-bootstrap.js";
import { Kysely, PostgresDialect } from "kysely";
import type { Pool } from "pg";
import { createAdminPool } from "./db.js";
import { applyAllGrants } from "./grants.js";
import {
  createPlatformMigrator,
  createTenantMigrator,
  listTenantSchemas,
  logMigrationResults,
} from "./schema-utils.js";
import type { PlatformDatabase } from "./types.js";
import { pruneOprfAuditLog } from "../crypto/oprf-audit.js";
import { getEnv } from "../env.js";
import { orgSchemaNameSchema, type OrgSchema } from "@care-y/shared";

// CLI usage:
//   migrate.ts [down] [--platform | --schema=org_<uuid> | --all-schemas]
//   migrate.ts --grants
//   migrate.ts --prune-oprf-audit
//
//   --platform            - platform migrations only (default when no flag given)
//   --schema=org_<uuid>   - tenant migrations for one schema
//   --all-schemas         - platform first, then all org_* tenant schemas
//   down                  - roll back one migration (combine with any target flag)
//   --grants              - give DATABASE_APP_ROLE DML on public and every
//                           org_* schema, UPDATE and DELETE revoked on the
//                           audit tables; skipped when the role is unset.
//                           Runs no migrations.
//   --prune-oprf-audit    - delete OPRF audit rows past retention. Runs no
//                           migrations.
//
// Every run connects through createAdminPool(), which is the owner role when
// DATABASE_ADMIN_URL is set. Tables created here belong to the owner, not to
// the runtime role.

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

async function runGrants(pool: Pool): Promise<void> {
  const appRole = getEnv().DATABASE_APP_ROLE;
  if (appRole === undefined) {
    console.log("grants: DATABASE_APP_ROLE unset, skipped");
    return;
  }
  await applyAllGrants(pool, appRole);
  console.log("grants: applied to public and every org_* schema");
}

async function runOprfAuditPrune(db: Kysely<PlatformDatabase>): Promise<void> {
  const deleted = await pruneOprfAuditLog(db, new Date());
  console.log(`oprf-audit-prune: deleted ${String(deleted)} rows`);
}

// --- Main ---

/**
 * Runs the migrations `args` asks for (the CLI arguments above, without the
 * node and script paths). Exported so tests can call it without spawning a
 * process; they pass their own connections. Leaves the connections open.
 */
export async function main(
  args: readonly string[],
  connections: MigrationConnections,
): Promise<void> {
  const grants = args.includes("--grants");
  const pruneOprfAudit = args.includes("--prune-oprf-audit");
  if (grants || pruneOprfAudit) {
    if (grants) await runGrants(connections.pool);
    if (pruneOprfAudit) await runOprfAuditPrune(connections.db);
    return;
  }

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
  const adminPool = createAdminPool();
  const adminDb = new Kysely<PlatformDatabase>({
    dialect: new PostgresDialect({ pool: adminPool }),
  });
  try {
    await main(process.argv.slice(2), { db: adminDb, pool: adminPool });
  } finally {
    // Ends the pool directly: destroying a Kysely instance that never ran a
    // query does not reach the pool.
    await adminPool.end();
  }
}
