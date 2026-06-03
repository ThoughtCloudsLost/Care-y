import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import {
  isValidOrgSchemaName,
  logMigrationResults,
  schemaExists,
  listTenantSchemas,
  createPlatformMigrator,
} from "./schema-utils.js";
import type { MigrationResult } from "kysely/migration";
import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import type { PlatformDatabase } from "./types.js";

describe("isValidOrgSchemaName", () => {
  it("accepts a valid org schema name", () => {
    expect(
      isValidOrgSchemaName("org_f47ac10b-58cc-4372-a567-0e02b2c3d479"),
    ).toBe(true);
  });

  it("accepts all-zero UUID", () => {
    expect(
      isValidOrgSchemaName("org_00000000-0000-0000-0000-000000000000"),
    ).toBe(true);
  });

  it("accepts all-f UUID", () => {
    expect(
      isValidOrgSchemaName("org_ffffffff-ffff-ffff-ffff-ffffffffffff"),
    ).toBe(true);
  });

  it("rejects missing org_ prefix", () => {
    expect(isValidOrgSchemaName("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(
      false,
    );
  });

  it("rejects uppercase hex", () => {
    expect(
      isValidOrgSchemaName("org_F47AC10B-58CC-4372-A567-0E02B2C3D479"),
    ).toBe(false);
  });

  it("rejects short UUID (missing segment)", () => {
    expect(isValidOrgSchemaName("org_f47ac10b-58cc-4372-a567")).toBe(false);
  });

  it("rejects trailing characters", () => {
    expect(
      isValidOrgSchemaName("org_f47ac10b-58cc-4372-a567-0e02b2c3d479; DROP"),
    ).toBe(false);
  });

  it("rejects leading characters", () => {
    expect(
      isValidOrgSchemaName("x_org_f47ac10b-58cc-4372-a567-0e02b2c3d479"),
    ).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidOrgSchemaName("")).toBe(false);
  });

  it("rejects org_ with no UUID", () => {
    expect(isValidOrgSchemaName("org_")).toBe(false);
  });

  it("rejects UUID without dashes", () => {
    expect(isValidOrgSchemaName("org_f47ac10b58cc4372a5670e02b2c3d479")).toBe(
      false,
    );
  });
});

describe("logMigrationResults", () => {
  it("logs 'No migrations to apply' when results is undefined", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logMigrationResults("platform", undefined);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("No migrations"),
    );
    logSpy.mockRestore();
  });

  it("logs 'No migrations to apply' when results is empty", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logMigrationResults("platform", []);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("No migrations"),
    );
    logSpy.mockRestore();
  });

  it("logs 'No migrations to roll back' for down direction", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logMigrationResults("tenant", undefined, "down");

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("No migrations"),
    );
    logSpy.mockRestore();
  });

  it("logs each migration result with label", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const results: MigrationResult[] = [
      { migrationName: "001_create_users", status: "Success", direction: "Up" },
      { migrationName: "002_add_sessions", status: "Success", direction: "Up" },
    ];

    logMigrationResults("org_abc", results);

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("001_create_users"),
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Success"));
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("002_add_sessions"),
    );
    logSpy.mockRestore();
  });
});

// -----------------------------------------------------------------------
// DB-dependent tests for schemaExists, listTenantSchemas, createPlatformMigrator
// -----------------------------------------------------------------------
describe.skipIf(!process.env.DATABASE_URL)("schema-utils (DB)", () => {
  let platformDb: Kysely<PlatformDatabase>;
  const testSchema = `org_00000000-0000-0000-0000-test${Date.now().toString(36)}`;

  pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
    parseInt(val, 10),
  );

  beforeAll(async () => {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
    });
    platformDb = new Kysely<PlatformDatabase>({
      dialect: new PostgresDialect({ pool }),
    });
  });

  afterAll(async () => {
    await sql`DROP SCHEMA IF EXISTS ${sql.id(testSchema)} CASCADE`.execute(
      platformDb,
    );
    await platformDb.destroy();
  });

  it("schemaExists returns false for non-existent schema", async () => {
    const exists = await schemaExists(
      platformDb,
      "org_ffffffff-ffff-ffff-ffff-doesnotexist",
    );
    expect(exists).toBe(false);
  });

  it("schemaExists returns true for public schema", async () => {
    const exists = await schemaExists(platformDb, "public");
    expect(exists).toBe(true);
  });

  it("listTenantSchemas returns array of org_ schemas", async () => {
    const schemas = await listTenantSchemas(platformDb);
    expect(Array.isArray(schemas)).toBe(true);
    // All returned schemas should start with org_
    for (const s of schemas) {
      expect(s.startsWith("org_")).toBe(true);
    }
  });

  it("createPlatformMigrator returns a Migrator instance", () => {
    const migrator = createPlatformMigrator(platformDb);
    expect(migrator).toBeDefined();
    expect(typeof migrator.migrateToLatest).toBe("function");
  });
});
