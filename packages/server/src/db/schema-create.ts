// Org schema provisioning script.
// Creates a new org_<uuid> schema and runs all tenant migrations against it.
//
// Usage: tsx schema-create.ts org_<uuid>
//   e.g. tsx schema-create.ts org_f47ac10b-58cc-4372-a567-0e02b2c3d479
//
// Called during org onboarding and admin setup wizard.
// On migration failure: drops the schema (no half-provisioned orgs).

import { sql } from "kysely";
import { db, tenantDb } from "./db.js";
import {
  isValidOrgSchemaName,
  schemaExists,
  createTenantMigrator,
  logMigrationResults,
} from "./schema-utils.js";

const schemaName = process.argv[2];

if (schemaName === undefined || schemaName === "") {
  console.error("Usage: tsx schema-create.ts org_<uuid>");
  process.exit(1);
}

// Validate schema name before any SQL execution (prevents injection).
if (!isValidOrgSchemaName(schemaName)) {
  console.error(
    `Invalid schema name "${schemaName}". Must match: org_<uuid> (UUID v4 format).`,
  );
  process.exit(1);
}

// Check schema does not already exist.
if (await schemaExists(db, schemaName)) {
  console.error(`Schema "${schemaName}" already exists. Aborting.`);
  process.exit(1);
}

// Create schema.
await db.schema.createSchema(schemaName).execute();
console.log(`Created schema: ${schemaName}`);

// Run tenant migrations. On failure, drop schema to keep state clean.
const migrator = createTenantMigrator(tenantDb(schemaName), schemaName);
const { error, results } = await migrator.migrateToLatest();
logMigrationResults(schemaName, results);

if (error !== undefined) {
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
