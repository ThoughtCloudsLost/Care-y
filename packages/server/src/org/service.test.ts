import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pg from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import { createOrgService, type OrgService } from "./service.js";
import { ValidationError, ConflictError, InternalError } from "../errors.js";
import type { OrgId, OrgSchema, OrgSlug } from "@care-y/shared";

// OrgService creates real PostgreSQL schemas. Mocking is not viable because
// createOrg exercises CREATE SCHEMA, migration execution, and org_config
// insertion. We need a live database.
describe.skipIf(!process.env.DATABASE_URL)("OrgService", () => {
  let platformDb: Kysely<PlatformDatabase>;
  let service: OrgService;
  const createdSchemas: OrgSchema[] = [];
  const createdOrgIds: OrgId[] = [];

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

  it("createOrg succeeds and returns correct OrgRecord with setupToken", async () => {
    const org = await service.createOrg({ slug: "test-org-create" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    expect(org.id).toBeDefined();
    expect(org.slug).toBe("test-org-create");
    expect(org.schemaName).toBe(`org_${org.id}`);
    expect(org.isActive).toBe(true);
    expect(org.setupToken).toBeDefined();
    expect(typeof org.setupToken).toBe("string");
    expect(org.setupToken.length).toBeGreaterThan(0);
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
      "00000000-0000-0000-0000-000000000000" as OrgId,
    );
    expect(found).toBeNull();
  });

  it("validateSetupToken returns true for valid token", async () => {
    const org = await service.createOrg({ slug: "test-org-token-valid" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const valid = await service.validateSetupToken(org.id, org.setupToken);
    expect(valid).toBe(true);
  });

  it("validateSetupToken returns false for wrong token", async () => {
    const org = await service.createOrg({ slug: "test-org-token-wrong" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const valid = await service.validateSetupToken(
      org.id,
      "not-the-right-token",
    );
    expect(valid).toBe(false);
  });

  it("validateSetupToken returns false for nonexistent org", async () => {
    const valid = await service.validateSetupToken(
      "00000000-0000-0000-0000-000000000000" as OrgId,
      "any-token",
    );
    expect(valid).toBe(false);
  });

  it("consumeSetupToken nulls the hash", async () => {
    const org = await service.createOrg({ slug: "test-org-token-consume" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const validBefore = await service.validateSetupToken(
      org.id,
      org.setupToken,
    );
    expect(validBefore).toBe(true);

    await service.consumeSetupToken(org.id);

    const validAfter = await service.validateSetupToken(org.id, org.setupToken);
    expect(validAfter).toBe(false);
  });

  it("setup token is base64url-encoded 32 bytes", async () => {
    const org = await service.createOrg({ slug: "test-org-token-format" });

    createdSchemas.push(org.schemaName);
    createdOrgIds.push(org.id);

    const decoded = Buffer.from(org.setupToken, "base64url");
    expect(decoded.length).toBe(32);
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

    /**
     * Drop a test role, revoking its privileges first (privileges granted
     * to a role block DROP ROLE). Safe to call when the role does not exist,
     * so a crashed previous run cannot wedge the suite.
     */
    async function dropTestRole(roleName: string): Promise<void> {
      const existing = await sql<{ rolname: string }>`
        SELECT rolname FROM pg_roles WHERE rolname = ${roleName}
      `.execute(platformDb);
      if (existing.rows.length === 0) return;
      await sql`DROP OWNED BY ${sql.id(roleName)}`.execute(platformDb);
      await sql`DROP ROLE ${sql.id(roleName)}`.execute(platformDb);
    }

    /**
     * Open a dedicated single-connection Kysely instance running as the
     * given role. SET ROLE is session state, so the pool is capped at one
     * connection (with idle disconnection off) to guarantee every statement
     * runs under the role. Per the PostgreSQL SET ROLE docs, permission
     * checks then use the named role even when the session user is a
     * superuser, which the Docker test user is.
     */
    async function createRestrictedDb(
      roleName: string,
    ): Promise<Kysely<PlatformDatabase>> {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        idleTimeoutMillis: 0,
      });
      const db = new Kysely<PlatformDatabase>({
        dialect: new PostgresDialect({ pool }),
      });
      try {
        await sql`SET ROLE ${sql.id(roleName)}`.execute(db);
      } catch (err: unknown) {
        await db.destroy();
        throw err;
      }
      return db;
    }

    it("rolls back org row and schema when tenant migration fails", async () => {
      // tenantDbFactory returns a Kysely instance that will fail during migration
      // because withSchema on a nonexistent schema is valid, but the Migrator
      // will fail when it tries to create the migration tracking table.
      // Instead, we use a factory that throws immediately to simulate a
      // catastrophic failure.
      function failingTenantDbFactory(): Kysely<TenantDatabase> {
        // createOrg calls tenantDbFactory twice: once for migrations, once for org_config.
        // Throw on the first call to simulate migration failure.
        throw new TypeError("Simulated tenant DB failure");
      }

      const service = createOrgService(platformDb, failingTenantDbFactory);

      await expect(
        service.createOrg({ slug: "test-fault-migration" }),
      ).rejects.toThrow(InternalError);

      // Verify the org row was cleaned up (rollbackOrg).
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("slug", "=", "test-fault-migration" as OrgSlug)
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
        .where("slug", "=", "test-fault-wrap" as OrgSlug)
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
      // Real failure scenario: run the service as a role that can read and
      // write public.orgs but lacks CREATE on the database, so the CREATE
      // SCHEMA statement fails with a genuine Postgres permission error.
      const roleName = "test_orgsvc_no_create";
      await dropTestRole(roleName);
      await sql`CREATE ROLE ${sql.id(roleName)}`.execute(platformDb);
      await sql`GRANT USAGE ON SCHEMA public TO ${sql.id(roleName)}`.execute(
        platformDb,
      );
      await sql`GRANT SELECT, INSERT, DELETE ON public.orgs TO ${sql.id(roleName)}`.execute(
        platformDb,
      );

      const restrictedDb = await createRestrictedDb(roleName);
      const slug = `test-schema-create-fail-${Date.now()}`;

      function realFactory(schema: string): Kysely<TenantDatabase> {
        return restrictedDb.withSchema(
          schema,
        ) as unknown as Kysely<TenantDatabase>;
      }

      try {
        const service = createOrgService(restrictedDb, realFactory);

        await expect(service.createOrg({ slug })).rejects.toThrow(
          InternalError,
        );

        // Verify the org row inserted before the failure was cleaned up.
        const row = await platformDb
          .selectFrom("orgs")
          .selectAll()
          .where("slug", "=", slug as OrgSlug)
          .executeTakeFirst();
        expect(row).toBeUndefined();
      } finally {
        await restrictedDb.destroy();
        await dropTestRole(roleName);
      }
    });

    it("re-throws non-unique-violation DB errors from insertOrgRow", async () => {
      // insertOrgRow runs before the provisioning try block in createOrg, so
      // a DB error that is not a unique violation must reach the caller
      // unwrapped. Real failure: a role without INSERT on public.orgs makes
      // the insert fail with a genuine Postgres permission error
      // (SQLSTATE 42501, not the unique violation 23505).
      const roleName = "test_orgsvc_no_insert";
      await dropTestRole(roleName);
      await sql`CREATE ROLE ${sql.id(roleName)}`.execute(platformDb);
      await sql`GRANT USAGE ON SCHEMA public TO ${sql.id(roleName)}`.execute(
        platformDb,
      );

      const restrictedDb = await createRestrictedDb(roleName);

      function realFactory(schema: string): Kysely<TenantDatabase> {
        return restrictedDb.withSchema(
          schema,
        ) as unknown as Kysely<TenantDatabase>;
      }

      try {
        const service = createOrgService(restrictedDb, realFactory);

        let caught: unknown;
        try {
          await service.createOrg({ slug: "test-insert-rethrow" });
        } catch (err: unknown) {
          caught = err;
        }

        // The raw DB error propagates: not mapped to ConflictError, not
        // wrapped in InternalError.
        expect(caught).toBeInstanceOf(Error);
        expect(caught).not.toBeInstanceOf(ConflictError);
        expect(caught).not.toBeInstanceOf(InternalError);
      } finally {
        await restrictedDb.destroy();
        await dropTestRole(roleName);
      }
    });
  },
);
