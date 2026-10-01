import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { sql, type Kysely } from "kysely";
import type { HashedIp, TicketId, UserId } from "@care-y/shared";
import { createTestDb, type TestDb } from "../test-utils.js";
import {
  applyAllGrants,
  applyPlatformGrants,
  applyTenantGrants,
} from "./grants.js";
import { isPgPermissionDenied } from "./pg-errors.js";
import { listTenantSchemas } from "./schema-utils.js";
import type * as SchemaUtils from "./schema-utils.js";
import type { PlatformDatabase, TenantDatabase } from "./types.js";

// applyAllGrants lists every org_* schema in the database, and other test
// files create and drop org schemas concurrently. The mock wraps the real
// listing so one case can pin it to this file's test schema.
vi.mock("./schema-utils.js", async (importOriginal) => {
  const original = await importOriginal<typeof SchemaUtils>();
  return {
    ...original,
    listTenantSchemas: vi.fn(original.listTenantSchemas),
  };
});

/** Resolves to the rejection reason, or undefined when the promise resolves. */
async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
    return undefined;
  } catch (err: unknown) {
    return err;
  }
}

describe.skipIf(!process.env.DATABASE_URL)("database grants (DB)", () => {
  // Unique per run so parallel runs against one database cannot collide.
  const suffix = randomUUID().slice(0, 8);
  const appRole = `carey_app_test_${suffix}`;
  const allGrantsRole = `carey_app_all_test_${suffix}`;

  let testDb: TestDb;
  let pool: pg.Pool;

  /**
   * Drops a test role, revoking its privileges first (privileges granted to
   * a role block DROP ROLE). Safe when the role does not exist.
   */
  async function dropTestRole(roleName: string): Promise<void> {
    const existing = await sql<{ rolname: string }>`
      SELECT rolname FROM pg_roles WHERE rolname = ${roleName}
    `.execute(testDb.platformDb);
    if (existing.rows.length === 0) return;
    await sql`DROP OWNED BY ${sql.id(roleName)}`.execute(testDb.platformDb);
    await sql`DROP ROLE ${sql.id(roleName)}`.execute(testDb.platformDb);
  }

  /**
   * Runs `fn` on one pinned connection with SET ROLE in effect. Per the
   * PostgreSQL SET ROLE docs, permission checks then use the named role
   * even though the Docker test user is a superuser. RESET ROLE runs before
   * the connection returns to the pool.
   */
  async function asRole<DB, T>(
    db: Kysely<DB>,
    roleName: string,
    fn: (conn: Kysely<DB>) => Promise<T>,
  ): Promise<T> {
    return db.connection().execute(async (conn) => {
      await sql`SET ROLE ${sql.id(roleName)}`.execute(conn);
      try {
        return await fn(conn);
      } finally {
        await sql`RESET ROLE`.execute(conn);
      }
    });
  }

  /** Inserts one audit row as the role and checks UPDATE and DELETE fail. */
  async function expectTenantAuditLogAppendOnly(
    roleName: string,
  ): Promise<void> {
    await asRole(
      testDb.db,
      roleName,
      async (tenant: Kysely<TenantDatabase>) => {
        const row = await tenant
          .insertInto("audit_log")
          .values({
            event_type: "grants_test",
            actor_id: randomUUID() as UserId,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const updateErr = await rejectionOf(
          tenant
            .updateTable("audit_log")
            .set({ event_type: "rewritten" })
            .where("id", "=", row.id)
            .execute(),
        );
        expect(isPgPermissionDenied(updateErr)).toBe(true);

        const deleteErr = await rejectionOf(
          tenant.deleteFrom("audit_log").where("id", "=", row.id).execute(),
        );
        expect(isPgPermissionDenied(deleteErr)).toBe(true);
      },
    );
  }

  /** Inserts one OPRF audit row as the role and checks UPDATE and DELETE fail. */
  async function expectPlatformAuditLogAppendOnly(
    roleName: string,
  ): Promise<void> {
    await asRole(
      testDb.platformDb,
      roleName,
      async (platform: Kysely<PlatformDatabase>) => {
        const row = await platform
          .insertInto("oprf_audit_log")
          .values({
            user_id: randomUUID(),
            hashed_ip: "grants-test" as HashedIp,
            reason: "rate_limited",
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const updateErr = await rejectionOf(
          platform
            .updateTable("oprf_audit_log")
            .set({ reason: "rewritten" })
            .where("id", "=", row.id)
            .execute(),
        );
        expect(isPgPermissionDenied(updateErr)).toBe(true);

        const deleteErr = await rejectionOf(
          platform
            .deleteFrom("oprf_audit_log")
            .where("id", "=", row.id)
            .execute(),
        );
        expect(isPgPermissionDenied(deleteErr)).toBe(true);
      },
    );
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    for (const role of [appRole, allGrantsRole]) {
      await dropTestRole(role);
      await sql`CREATE ROLE ${sql.id(role)} NOLOGIN`.execute(testDb.platformDb);
    }
  });

  afterAll(async () => {
    for (const role of [appRole, allGrantsRole]) {
      await dropTestRole(role);
    }
    // Rows the roles inserted into the platform audit table outlive the test
    // schema, so they are removed by marker here.
    await testDb.platformDb
      .deleteFrom("oprf_audit_log")
      .where("hashed_ip", "=", "grants-test" as HashedIp)
      .execute();
    await pool.end();
    await testDb.cleanup();
  });

  it("the role may insert into the tenant audit_log but not update or delete it", async () => {
    await applyTenantGrants(pool, testDb.schemaName, appRole);

    await expectTenantAuditLogAppendOnly(appRole);
  });

  it("the role keeps UPDATE on ordinary tenant tables", async () => {
    await applyTenantGrants(pool, testDb.schemaName, appRole);

    await asRole(testDb.db, appRole, async (tenant: Kysely<TenantDatabase>) => {
      // No row matches; the privilege check runs regardless of row count.
      const result = await rejectionOf(
        tenant
          .updateTable("tickets")
          .set({ on_hold: false })
          .where("id", "=", randomUUID() as TicketId)
          .execute(),
      );
      expect(result).toBeUndefined();
    });
  });

  it("the role may insert into public.oprf_audit_log but not update or delete it", async () => {
    await applyPlatformGrants(pool, appRole);

    await expectPlatformAuditLogAppendOnly(appRole);
  });

  it("running the grants a second time succeeds and leaves the revokes in place", async () => {
    await applyPlatformGrants(pool, appRole);
    await applyTenantGrants(pool, testDb.schemaName, appRole);

    await expect(applyPlatformGrants(pool, appRole)).resolves.toBeUndefined();
    await expect(
      applyTenantGrants(pool, testDb.schemaName, appRole),
    ).resolves.toBeUndefined();

    await expectTenantAuditLogAppendOnly(appRole);
    await expectPlatformAuditLogAppendOnly(appRole);
  });

  it("applyAllGrants covers public and every listed tenant schema", async () => {
    vi.mocked(listTenantSchemas).mockClear();
    vi.mocked(listTenantSchemas).mockResolvedValueOnce([testDb.schemaName]);

    await applyAllGrants(pool, allGrantsRole);

    expect(listTenantSchemas).toHaveBeenCalledTimes(1);
    await expectTenantAuditLogAppendOnly(allGrantsRole);
    await expectPlatformAuditLogAppendOnly(allGrantsRole);
  });
});
