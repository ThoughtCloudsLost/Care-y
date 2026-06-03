/**
 * Vitest globalSetup for the server project.
 *
 * Runs once before all test suites. Ensures platform-level migrations
 * (public schema tables like `orgs`) are applied, mirroring how CI would
 * run migrations before the test step.
 *
 * Skips silently when DATABASE_URL is not set.
 * (host-only runs where DB tests are skipped anyway).
 */

import * as path from "node:path";
import * as fs from "node:fs/promises";
import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import type { PlatformDatabase } from "./db/types.js";

export async function setup(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;

  pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
    parseInt(val, 10),
  );

  const pool = new pg.Pool({ connectionString, max: 2 });
  const db = new Kysely<PlatformDatabase>({
    dialect: new PostgresDialect({ pool }),
  });

  const platformDir = path.join(
    import.meta.dirname,
    "db",
    "migrations",
    "platform",
  );

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: platformDir,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((r) => {
    if (r.status === "Error") {
      console.error(`[platform migration] Error: ${r.migrationName}`);
    }
  });

  if (error) {
    await db.destroy();
    throw error instanceof Error
      ? error
      : new Error("Platform migration failed");
  }

  await db.destroy();
}
