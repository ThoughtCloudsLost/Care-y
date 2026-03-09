import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pg from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import { createOrgService, type OrgService } from "./service.js";
import { ValidationError, ConflictError } from "../errors.js";

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
    expect(org.createdAt).toBeInstanceOf(Date);
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
