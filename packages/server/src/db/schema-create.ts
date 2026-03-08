// Org schema provisioning script.
// Creates a new org_<uuid> schema and runs all tenant migrations against it.
//
// Usage: tsx schema-create.ts org_<uuid>
//   e.g. tsx schema-create.ts org_f47ac10b-58cc-4372-a567-0e02b2c3d479
//
// Called during org onboarding (Phase 2 / Phase 6 wizard).
// On migration failure: drops the schema (no half-provisioned orgs).

import * as path from "node:path";
import * as fs from "node:fs/promises";
import { FileMigrationProvider, Migrator, sql } from "kysely";
import { db, tenantDb } from "./db.js";

const ORG_SCHEMA_PATTERN =
  /^org_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const schemaName = process.argv[2];

if (!schemaName) {
  console.error("Usage: tsx schema-create.ts org_<uuid>");
  process.exit(1);
}

// Validate schema name before any SQL execution (prevents injection).
if (!ORG_SCHEMA_PATTERN.test(schemaName)) {
  console.error(
    `Invalid schema name "${schemaName}". Must match: org_<uuid> (UUID v4 format).`,
  );
  process.exit(1);
}

// Check schema does not already exist.
const existing = await db
  .selectFrom(sql<{ schema_name: string }>`information_schema.schemata`.as("s"))
  .select("schema_name")
  .where("schema_name", "=", schemaName)
  .executeTakeFirst();

if (existing) {
  console.error(`Schema "${schemaName}" already exists. Aborting.`);
  process.exit(1);
}

// Create schema.
await db.schema.createSchema(schemaName).execute();
console.log(`Created schema: ${schemaName}`);

// Run tenant migrations. On failure, drop schema to keep state clean.
const tenantDir = path.join(import.meta.dirname, "migrations", "tenant");
const migrator = new Migrator({
  db: tenantDb(schemaName),
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: tenantDir,
  }),
  migrationTableSchema: schemaName,
});

const { error, results } = await migrator.migrateToLatest();

if (!results || results.length === 0) {
  console.log(`[${schemaName}] No tenant migrations to apply`);
}
results?.forEach((r) => {
  console.log(`[${schemaName}] ${r.status} ${r.migrationName}`);
});

if (error) {
  console.error(`[${schemaName}] Migration failed:`, error);
  console.error(`Rolling back: dropping schema "${schemaName}"`);
  // CASCADE drops any tables created by partial migrations.
  await sql`DROP SCHEMA ${sql.id(schemaName)} CASCADE`.execute(db);
  console.error("Schema dropped. Org provisioning aborted.");
  await db.destroy();
  process.exit(1);
}

console.log(`Org schema "${schemaName}" provisioned successfully.`);
await db.destroy();
