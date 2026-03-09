/**
 * Test database infrastructure for server integration tests.
 *
 * Provides schema lifecycle (create/migrate/drop) and test data factories.
 * Each test suite calls createTestDb() in beforeAll and cleanup() in afterAll,
 * getting a fully isolated PostgreSQL schema with all tenant migrations applied.
 *
 * Runs inside the Docker container via `docker compose exec app pnpm vitest run`.
 * Requires DATABASE_URL in the environment (provided by docker-compose env_file).
 */

import * as crypto from "node:crypto";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import pg from "pg";
import {
  Kysely,
  PostgresDialect,
  FileMigrationProvider,
  Migrator,
  sql,
} from "kysely";
import type { Insertable, Selectable } from "kysely";
import type {
  PlatformDatabase,
  TenantDatabase,
  UsersTable,
  SessionsTable,
} from "./db/types.js";

// Override int8 parser (same as db.ts). Must be set before creating the Pool.
pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
  parseInt(val, 10),
);

/** Thrown when test database setup or teardown fails. */
class TestSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestSetupError";
  }
}

export interface TestDb {
  /** Kysely instance scoped to the test schema (tenant tables). */
  readonly db: Kysely<TenantDatabase>;
  /** Kysely instance on the public schema (platform tables). */
  readonly platformDb: Kysely<PlatformDatabase>;
  /** Schema name (for debugging or raw queries). */
  readonly schemaName: string;
  /** Drops the schema and destroys the pool. Call in afterAll. */
  readonly cleanup: () => Promise<void>;
}

/**
 * Creates an isolated test schema with all tenant migrations applied.
 *
 * Each call creates a fresh `test_<random>` schema, runs the full migration
 * set, and returns scoped Kysely instances. The cleanup function drops the
 * schema with CASCADE and closes the connection pool.
 */
export async function createTestDb(): Promise<TestDb> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new TestSetupError(
      "DATABASE_URL is not set. Tests must run inside the Docker container: " +
        "docker compose exec app pnpm vitest run --project server",
    );
  }

  const pool = new pg.Pool({ connectionString, max: 5 });
  const dialect = new PostgresDialect({ pool });
  const platformDb = new Kysely<PlatformDatabase>({ dialect });

  const suffix = crypto.randomUUID().slice(0, 8);
  const schemaName = `test_${suffix}`;

  // Create the test schema.
  await sql`CREATE SCHEMA ${sql.id(schemaName)}`.execute(platformDb);

  // Build a tenant-scoped instance and run migrations against it.
  const db = platformDb.withSchema(
    schemaName,
  ) as unknown as Kysely<TenantDatabase>;

  const tenantDir = path.join(
    import.meta.dirname,
    "db",
    "migrations",
    "tenant",
  );

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: tenantDir,
    }),
    migrationTableSchema: schemaName,
  });

  const { error, results } = await migrator.migrateToLatest();

  if (error) {
    // Roll back: drop the schema so we don't leak partial schemas.
    await sql`DROP SCHEMA ${sql.id(schemaName)} CASCADE`.execute(platformDb);
    await pool.end();
    throw new TestSetupError(
      `Test schema migration failed (${schemaName}): ${String(error)}`,
    );
  }

  // Log migration results for debugging (silent in normal runs).
  results?.forEach((r) => {
    if (r.status === "Error") {
      console.error(`[${schemaName}] Migration error: ${r.migrationName}`);
    }
  });

  async function cleanup(): Promise<void> {
    await sql`DROP SCHEMA ${sql.id(schemaName)} CASCADE`.execute(platformDb);
    await platformDb.destroy();
  }

  return { db, platformDb, schemaName, cleanup };
}

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

type UserOverrides = Partial<Insertable<UsersTable>>;
type SessionOverrides = Partial<Insertable<SessionsTable>> & {
  user_id: string;
};

// Fake password hash for test rows. Format matches createScryptHasher output
// (scrypt:<32-hex-salt>:<128-hex-key>) but the key is not a real derivation.
// Tests that need actual password verification should hash via createScryptHasher.
const DEFAULT_PASSWORD_HASH =
  "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64);

/**
 * Inserts a user row with sensible defaults. Override any column via the
 * overrides parameter. Returns the full row from RETURNING *.
 *
 * The email and display_name columns are volunteer auth fields (login
 * identifiers), not client PII. They are stored in plaintext by design
 * for credential lookup. Values here are synthetic test fixtures in
 * ephemeral test_* schemas that are dropped after each test suite.
 */
export async function createTestUser(
  db: Kysely<TenantDatabase>,
  overrides?: UserOverrides,
): Promise<Selectable<UsersTable>> {
  const uid = crypto.randomUUID().slice(0, 8);
  // Volunteer auth defaults. email and display_name are login identifiers
  // (not client PII), stored in plaintext for credential lookup by design.
  const defaults: Insertable<UsersTable> = {
    email: `test-${uid}@example.com`,
    password_hash: DEFAULT_PASSWORD_HASH,
    display_name: `Test User ${uid}`,
    role_id: "volunteer",
  };
  return db
    .insertInto("users")
    .values({ ...defaults, ...overrides })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Inserts a session row. Requires user_id (no default, since sessions must
 * belong to a user). All other columns have sensible defaults.
 * Returns the full row from RETURNING *.
 */
export async function createTestSession(
  db: Kysely<TenantDatabase>,
  overrides: SessionOverrides,
): Promise<Selectable<SessionsTable>> {
  const uid = crypto.randomUUID();
  return db
    .insertInto("sessions")
    .values({
      token: uid,
      ip_address: "127.0.0.1",
      user_agent: "test-agent",
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      ...overrides,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}
