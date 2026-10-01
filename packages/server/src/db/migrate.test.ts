import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { Kysely } from "kysely";
import pg from "pg";
import { newOrgId, orgSchemaFor, type OrgSchema } from "@care-y/shared";
import { main } from "./migrate.js";
import { pool as processPool } from "./db.js";
import {
  createTenantMigrator,
  SafeIntrospectionPostgresDialect,
} from "./schema-utils.js";
import type { PlatformDatabase } from "./types.js";

// main() runs the same code path as the CLI, called without spawning it.
// The platform instance uses the catalog-only dialect so a schema dropped
// by a concurrently running test file cannot fail the platform migrator's
// table check.
describe.skipIf(!process.env.DATABASE_URL)("migrate main (DB)", () => {
  let pool: pg.Pool;
  let platformDb: Kysely<PlatformDatabase>;
  const orgSchemas: OrgSchema[] = [];

  beforeAll(() => {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
    });
    platformDb = new Kysely<PlatformDatabase>({
      dialect: new SafeIntrospectionPostgresDialect({ pool }, "public"),
    });
  });

  afterAll(async () => {
    for (const schema of orgSchemas) {
      await platformDb.schema.dropSchema(schema).ifExists().cascade().execute();
    }
    // Ends the shared pool, which the tenant migrators below also use.
    await platformDb.destroy();
    // Importing migrate.ts builds db.ts's process pool. It never connected
    // here; end() releases it without a round trip.
    await processPool.end();
  });

  /** True when every tenant migration has been applied to `schema`. */
  async function isFullyMigrated(schema: OrgSchema): Promise<boolean> {
    const migrations = await createTenantMigrator(pool, schema).getMigrations();
    return migrations.every((m) => m.executedAt !== undefined);
  }

  it("--all-schemas applies pending migrations to every org schema", async () => {
    // Two orgs, each migrated to latest and then rolled back one step, so
    // each has exactly one pending migration for the run to apply.
    for (let i = 0; i < 2; i += 1) {
      const schema = orgSchemaFor(newOrgId());
      orgSchemas.push(schema);
      await platformDb.schema.createSchema(schema).execute();
      const migrator = createTenantMigrator(pool, schema);
      const up = await migrator.migrateToLatest();
      expect(up.error).toBeUndefined();
      const down = await migrator.migrateDown();
      expect(down.error).toBeUndefined();
      expect(await isFullyMigrated(schema)).toBe(false);
    }

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      await main(["--all-schemas"], { db: platformDb, pool });
    } finally {
      logSpy.mockRestore();
    }

    for (const schema of orgSchemas) {
      expect(await isFullyMigrated(schema)).toBe(true);
    }
  }, 120_000);
});
