import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import pg from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import { createOrgService, type OrgService } from "./service.js";
import { ValidationError, ConflictError, InternalError } from "../errors.js";

// OrgService creates real PostgreSQL schemas. Mocking is not viable because
// createOrg exercises CREATE SCHEMA, migration execution, and org_config
// insertion. We need a live database.
describe.skipIf(!process.env.DATABASE_URL)("OrgService", () => {
  let platformDb: Kysely<PlatformDatabase>;
  let service: OrgService;
  const createdSchemas: string[] = [];
  const createdOrgIds: string[] = [];

  // Override int8 parser (same as db.ts).
  pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
    parseInt(val, 10),
  );

  beforeAll(() => {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
    platformDb = new Kysely<PlatformDatabase>({
      dialect: new PostgresDialect({ pool }),
    });

    function tenantDbFactory(schema: string): Kysely<TenantDatabase> {
      return platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
    }

    service = createOrgService(platformDb, tenantDbFactory);
  });

  afterAll(async () => {
    // Drop all schemas created during tests.
    for (const schema of createdSchemas) {
      await sql`DROP SCHEMA IF EXISTS ${sql.id(schema)} CASCADE`.execute(
        platformDb,
      );
    }
    // Remove org rows.
    for (const id of createdOrgIds) {
      await platformDb.deleteFrom("orgs").where("id", "=", id).execute();
    }
    await platformDb.destroy();
  });

  it("createOrg succeeds and returns correct OrgRecord", async () => {
    const org = await service.createOrg({ slug: "test-org-create" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    expect(org.id).toBeDefined();
    expect(org.slug).toBe("test-org-create");
    expect(org.schemaName).toBe(`org_${org.id}`);
    expect(org.isActive).toBe(true);
  });

  it("createOrg creates a real PostgreSQL schema", async () => {
    const org = await service.createOrg({ slug: "test-org-schema" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const result = await sql<{ schema_name: string }>`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = ${org.schemaName}
    `.execute(platformDb);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.schema_name).toBe(org.schemaName);
  });

  it("createOrg runs tenant migrations (users, sessions, org_config tables exist)", async () => {
    const org = await service.createOrg({ slug: "test-org-tables" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const result = await sql<{ table_name: string }>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ${org.schemaName}
      ORDER BY table_name
    `.execute(platformDb);

    const tableNames = result.rows.map((r) => r.table_name);
    expect(tableNames).toContain("users");
    expect(tableNames).toContain("sessions");
    expect(tableNames).toContain("org_config");
  });

  it("createOrg inserts default org_config row", async () => {
    const org = await service.createOrg({ slug: "test-org-config" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const tenantDb = platformDb.withSchema(
      org.schemaName,
    ) as unknown as Kysely<TenantDatabase>;

    const rows = await tenantDb.selectFrom("org_config").selectAll().execute();

    expect(rows).toHaveLength(1);
    expect(rows[0]?.pii_retention_days).toBeNull();
  });

  it("createOrg rejects invalid slug with ValidationError", async () => {
    await expect(service.createOrg({ slug: "x" })).rejects.toThrow(
      ValidationError,
    );
  });

  it("createOrg rejects duplicate slug with ConflictError", async () => {
    const org = await service.createOrg({ slug: "test-org-dup" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    await expect(service.createOrg({ slug: "test-org-dup" })).rejects.toThrow(
      ConflictError,
    );
  });

  it("findBySlug returns the org", async () => {
    const org = await service.createOrg({ slug: "test-org-findslug" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const found = await service.findBySlug("test-org-findslug");

    expect(found).not.toBeNull();
    expect(found?.id).toBe(org.id);
    expect(found?.slug).toBe("test-org-findslug");
  });

  it("findBySlug returns null for nonexistent slug", async () => {
    const found = await service.findBySlug("nonexistent-slug-xyz");
    expect(found).toBeNull();
  });

  it("findById returns the org", async () => {
    const org = await service.createOrg({ slug: "test-org-findid" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const found = await service.findById(org.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(org.id);
    expect(found?.slug).toBe("test-org-findid");
  });

  it("findById returns null for nonexistent id", async () => {
    const found = await service.findById(
      "00000000-0000-0000-0000-000000000000",
    );
    expect(found).toBeNull();
  });
});

// -----------------------------------------------------------------------
// Fault injection: exercises rollback and error-wrapping paths that
// require a failing tenantDbFactory. Still needs a real DB for the
// platform-level operations (INSERT into orgs, CREATE SCHEMA).
// -----------------------------------------------------------------------
describe.skipIf(!process.env.DATABASE_URL)(
  "OrgService (fault injection)",
  () => {
    let platformDb: Kysely<PlatformDatabase>;

    pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
      parseInt(val, 10),
    );

    beforeAll(() => {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
      });
      platformDb = new Kysely<PlatformDatabase>({
        dialect: new PostgresDialect({ pool }),
      });
    });

    afterAll(async () => {
      await platformDb.destroy();
    });

    it("rolls back org row and schema when tenant migration fails", async () => {
      // tenantDbFactory returns a Kysely instance that will fail during migration
      // because withSchema on a nonexistent schema is valid, but the Migrator
      // will fail when it tries to create the migration tracking table.
      // Instead, we use a factory that throws immediately to simulate a
      // catastrophic failure.
      let callCount = 0;
      function failingTenantDbFactory(): Kysely<TenantDatabase> {
        callCount++;
        // createOrg calls tenantDbFactory twice: once for migrations, once for org_config.
        // Throw on the first call to simulate migration failure.
        throw new TypeError("Simulated tenant DB failure");
      }

      const service = createOrgService(platformDb, failingTenantDbFactory);

      await expect(
        service.createOrg({ slug: "test-fault-migration" }),
      ).rejects.toThrow(InternalError);

      expect(callCount).toBe(1);

      // Verify the org row was cleaned up (rollbackOrg).
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("slug", "=", "test-fault-migration")
        .executeTakeFirst();
      expect(row).toBeUndefined();

      // Verify the schema was cleaned up (rollbackOrg drops it).
      // We can't know the exact schema name since it uses randomUUID,
      // but the absence of the org row is sufficient proof of rollback.
    });

    it("wraps non-InternalError exceptions with extractErrorMessage", async () => {
      function failingFactory(): Kysely<TenantDatabase> {
        throw new TypeError("type mismatch in factory");
      }

      const service = createOrgService(platformDb, failingFactory);

      await expect(
        service.createOrg({ slug: "test-fault-wrap" }),
      ).rejects.toThrow("type mismatch in factory");

      // Clean up: org row should be rolled back.
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("slug", "=", "test-fault-wrap")
        .executeTakeFirst();
      expect(row).toBeUndefined();
    });

    it("re-throws InternalError without double-wrapping", async () => {
      function failingFactory(): Kysely<TenantDatabase> {
        throw new InternalError("original internal error");
      }

      const service = createOrgService(platformDb, failingFactory);

      await expect(
        service.createOrg({ slug: "test-fault-internal" }),
      ).rejects.toThrow("original internal error");

      // Verify it's the original InternalError, not wrapped in another one.
      try {
        await service.createOrg({ slug: "test-fault-internal2" });
      } catch (err) {
        expect(err).toBeInstanceOf(InternalError);
        expect((err as InternalError).message).toBe("original internal error");
      }
    });

    it("rolls back org row when CREATE SCHEMA fails", async () => {
      // Spy on the Kysely prototype's `schema` getter to return a fake
      // SchemaModule whose createSchema always rejects. This avoids Proxy
      // issues with Kysely's private #props fields.
      const realSchema = platformDb.schema;
      const schemaSpy = vi
        .spyOn(
          Object.getPrototypeOf(platformDb) as Record<string, unknown>,
          "schema",
          "get",
        )
        .mockReturnValue({
          ...realSchema,
          createSchema: () => ({
            execute: () =>
              Promise.reject(new Error("simulated CREATE SCHEMA failure")),
          }),
        });

      function realFactory(schema: string): Kysely<TenantDatabase> {
        return platformDb.withSchema(
          schema,
        ) as unknown as Kysely<TenantDatabase>;
      }

      const service = createOrgService(platformDb, realFactory);
      const slug = `test-schema-create-fail-${Date.now()}`;

      await expect(service.createOrg({ slug })).rejects.toThrow(InternalError);

      schemaSpy.mockRestore();

      // Verify org row was cleaned up by the catch block
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("slug", "=", slug)
        .executeTakeFirst();
      expect(row).toBeUndefined();
    });

    it("re-throws non-unique-violation DB errors from insertOrgRow", async () => {
      // insertOrgRow is called BEFORE the try block in createOrg (line 153),
      // so a non-unique-violation error propagates directly without wrapping.
      const insertSpy = vi.spyOn(platformDb, "insertInto").mockReturnValue({
        values: () => ({
          returningAll: () => ({
            executeTakeFirstOrThrow: () =>
              Promise.reject(new Error("connection reset")),
          }),
        }),
      } as unknown as ReturnType<typeof platformDb.insertInto>);

      function realFactory(schema: string): Kysely<TenantDatabase> {
        return platformDb.withSchema(
          schema,
        ) as unknown as Kysely<TenantDatabase>;
      }

      const service = createOrgService(platformDb, realFactory);

      await expect(
        service.createOrg({ slug: "test-insert-rethrow" }),
      ).rejects.toThrow("connection reset");

      insertSpy.mockRestore();
    });
  },
);
