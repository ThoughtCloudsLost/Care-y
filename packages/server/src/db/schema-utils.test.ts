import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import {
  isValidOrgSchemaName,
  logMigrationResults,
  schemaExists,
  listTenantSchemas,
  createPlatformMigrator,
  createTenantMigrator,
  SafeIntrospectionPostgresDialect,
} from "./schema-utils.js";
import type { MigrationResult } from "kysely/migration";
import { Kysely, sql } from "kysely";
import pg from "pg";
import { newOrgId, orgSchemaFor, type OrgSchema } from "@care-y/shared";
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

// CLI output contract: operators grep migration logs (pnpm migrate,
// migrate:tenant) for migration names and status.
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
      dialect: new SafeIntrospectionPostgresDialect({ pool }),
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

// -----------------------------------------------------------------------
// createTenantMigrator: provisioning while other org schemas come and go
// -----------------------------------------------------------------------
describe.skipIf(!process.env.DATABASE_URL)("createTenantMigrator (DB)", () => {
  let pool: pg.Pool;
  let platformDb: Kysely<PlatformDatabase>;
  // Every schema this block creates, dropped in afterAll if still present.
  const liveSchemas = new Set<OrgSchema>();

  beforeAll(() => {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
    });
    platformDb = new Kysely<PlatformDatabase>({
      dialect: new SafeIntrospectionPostgresDialect({ pool }),
    });
  });

  afterAll(async () => {
    for (const schema of liveSchemas) {
      await platformDb.schema.dropSchema(schema).ifExists().cascade().execute();
    }
    // Ends the shared pool. The Kysely instances built over it below
    // (the migrator's and the scoped introspector's) are never destroyed,
    // because destroying any of them would end the same pool.
    await platformDb.destroy();
  });

  /**
   * Creates an org schema holding one table with a serial column. The serial
   * column matters: it is what makes Kysely's stock introspector call
   * pg_get_serial_sequence() on the schema's rows.
   */
  async function createSchemaWithTable(
    schema: OrgSchema,
    table: string,
  ): Promise<void> {
    liveSchemas.add(schema);
    await platformDb.schema.createSchema(schema).execute();
    await platformDb.schema
      .withSchema(schema)
      .createTable(table)
      .addColumn("id", "serial", (col) => col.primaryKey())
      .execute();
  }

  /**
   * Creates and drops unrelated org schemas back to back until `shouldStop`
   * returns true, calling `onDrop` after each drop commits. This is the
   * production shape of the failure: one org rolled back or provisioned
   * while another is being migrated.
   */
  async function churnUnrelatedSchemas(
    shouldStop: () => boolean,
    onDrop: () => void,
  ): Promise<void> {
    while (!shouldStop()) {
      const schema = orgSchemaFor(newOrgId());
      await createSchemaWithTable(schema, "churn");
      await platformDb.schema.dropSchema(schema).cascade().execute();
      liveSchemas.delete(schema);
      onDrop();
    }
  }

  it("migrates a new org schema while other org schemas are dropped mid-run", async () => {
    const targetSchema = orgSchemaFor(newOrgId());
    liveSchemas.add(targetSchema);
    await platformDb.schema.createSchema(targetSchema).execute();

    let migrationDone = false;
    let migrationStarted = false;
    let dropsDuringMigration = 0;
    let signalFirstDrop: (() => void) | undefined;
    const firstDrop = new Promise<void>((resolve) => {
      signalFirstDrop = resolve;
    });

    const churn = churnUnrelatedSchemas(
      () => migrationDone,
      () => {
        signalFirstDrop?.();
        if (migrationStarted) dropsDuringMigration += 1;
      },
    );

    // Start migrating only once drops are committing, so the migrator's
    // table check runs inside the window where a stock introspector would
    // read a schema whose name no longer resolves.
    await Promise.race([firstDrop, churn]);
    migrationStarted = true;
    const { error, results } = await createTenantMigrator(pool, targetSchema)
      .migrateToLatest()
      .finally(() => {
        migrationDone = true;
      });
    await churn;

    expect(error).toBeUndefined();
    expect(results?.length).toBeGreaterThan(0);
    expect(results?.every((r) => r.status === "Success")).toBe(true);
    expect(dropsDuringMigration).toBeGreaterThan(0);
  }, 30_000);

  it("scoped getTables returns only the target schema's tables", async () => {
    const targetSchema = orgSchemaFor(newOrgId());
    const neighbourSchema = orgSchemaFor(newOrgId());
    await createSchemaWithTable(targetSchema, "target_only");
    await createSchemaWithTable(neighbourSchema, "neighbour_only");

    const scoped = new Kysely<PlatformDatabase>({
      dialect: new SafeIntrospectionPostgresDialect({ pool }, targetSchema),
    });
    const tables = await scoped.introspection.getTables();

    expect(tables.map((t) => ({ name: t.name, schema: t.schema }))).toEqual([
      { name: "target_only", schema: targetSchema },
    ]);
  });
});
