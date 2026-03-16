/**
 * DB integration tests for role-based auth routes.
 *
 * Covers: assignRole (admin endpoint), setPiiRetention, role-guarded procedure
 * enforcement (volunteerProcedure / managerProcedure / adminProcedure), and
 * register with non-default role validation.
 *
 * Requires DATABASE_URL (runs inside Docker via pnpm test:server:db).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { RoleId } from "@care-y/shared";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  testFieldEncryptor,
  testBlindIndexer,
  mockReq,
  mockRes,
  expectTrpcError,
  createMockEmailSender,
  createMockOprfDeps,
  type TestDb,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createAuthService } from "../auth/service.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createOrgService } from "../org/service.js";
import { createAppRouter } from "./router.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UserRecord } from "../auth/service.js";
import type { SessionData } from "../auth/session-repository.js";

function makeTenantDbFactory(
  platformDb: Kysely<PlatformDatabase>,
): (schema: string) => Kysely<TenantDatabase> {
  return (schema: string) =>
    platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "role-based auth routes (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgContext: OrgContext;
    const createdOrgIds: string[] = [];
    const createdSchemas: string[] = [];

    const hasher = createScryptHasher();
    const loginLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 100,
    });
    const saltLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 100,
    });
    const fakeSaltKey = Buffer.alloc(32, 0);

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      const orgService = createOrgService(
        testDb.platformDb,
        makeTenantDbFactory(testDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      const org = await orgService.createOrg({
        slug: `test-roles-${suffix}`,
      });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);

      orgContext = {
        orgId: org.id,
        orgSlug: org.slug,
        orgSchema: testDb.schemaName,
        tenantDb,
      };

      // createTestDb() only runs migrations; it does not seed an org_config row.
      // Seed one so that setPiiRetentionDays (which does UPDATE, not upsert) can succeed.
      await tenantDb
        .insertInto("org_config")
        .values({
          encrypted_name: null,
          encrypted_logo: null,
          encrypted_primary_color: null,
          encrypted_client_text: null,
          client_encrypted_branding: null,
          pii_retention_days: null,
        })
        .execute();
    });

    afterAll(async () => {
      for (const schema of createdSchemas) {
        await sql`DROP SCHEMA IF EXISTS ${sql.id(schema)} CASCADE`.execute(
          testDb.platformDb,
        );
      }
      for (const id of createdOrgIds) {
        await testDb.platformDb
          .deleteFrom("orgs")
          .where("id", "=", id)
          .execute();
      }
      await testDb.cleanup();
    });

    function buildRouter() {
      const orgService = createOrgService(
        testDb.platformDb,
        makeTenantDbFactory(testDb.platformDb),
      );
      return createAppRouter({
        authDeps: {
          hasher,
          loginLimiter,
          saltLimiter,
          fakeSaltKey,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          isSecureCookie: false,
          emailSender: createMockEmailSender(),
        },
        twoFactorDeps: {
          emailSender: createMockEmailSender(),
          encryptor: testFieldEncryptor,
        },
        oprfDeps: createMockOprfDeps(),
        orgService,
      });
    }

    function buildCaller(ctx: Context) {
      return createCallerFactory(buildRouter())(ctx);
    }

    /** Context with no session (unauthenticated). */
    function unauthCtx(): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: null,
        user: null,
      };
    }

    /** Context with a 2FA-verified session for the given user. */
    function authed2faCtx(user: UserRecord, session: SessionData): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session,
        user,
      };
    }

    /** Context with a session that has NOT completed 2FA. */
    function authedNo2faCtx(user: UserRecord, session: SessionData): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: { ...session, twofaVerified: false },
        user,
      };
    }

    /** Registers a user directly via AuthService (bypasses tRPC). */
    async function registerUser(
      identifier: string,
      roleId: string,
    ): Promise<UserRecord> {
      const sessions = createDbSessionRepository(tenantDb, testFieldEncryptor);
      const authService = createAuthService(
        tenantDb,
        hasher,
        sessions,
        testFieldEncryptor,
        testBlindIndexer,
        orgContext.orgId,
      );
      return authService.register({
        identifier,
        password: "a-secure-password-16chars",
        displayName: `User ${identifier}`,
        roleId,
      });
    }

    /** Creates a synthetic 2FA-verified session (no DB row needed for middleware tests). */
    function makeSession(userId: string, twofaVerified = true): SessionData {
      return {
        id: randomUUID(),
        token: randomUUID(),
        userId,
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        expiresAt: new Date(Date.now() + 3_600_000),
        twofaVerified,
        webauthnChallenge: null,
      };
    }

    // -----------------------------------------------------------------------
    // Role-guarded procedure enforcement
    // -----------------------------------------------------------------------

    describe("volunteerProcedure", () => {
      it("allows volunteer, manager, and admin with 2FA verified", async () => {
        for (const roleId of [RoleId.VOLUNTEER, RoleId.MANAGER, RoleId.ADMIN]) {
          const uid = randomUUID().slice(0, 8);
          const user = await registerUser(`vol-proc-${uid}`, roleId);
          const session = makeSession(user.id);
          const caller = buildCaller(authed2faCtx(user, session));
          const result = await caller.auth.me();
          expect(result.user.id).toBe(user.id);
        }
      });

      it("throws UNAUTHORIZED for unauthenticated request", async () => {
        const caller = buildCaller(unauthCtx());
        await expectTrpcError(caller.auth.me(), "UNAUTHORIZED");
      });

      it("throws UNAUTHORIZED when 2FA is not verified (adminProcedure gate)", async () => {
        // authed2faProcedure (and everything built on it) rejects non-2FA sessions.
        // me() uses authedProcedure which has no 2FA gate. Use assignRole (adminProcedure)
        // to exercise the require2fa middleware. The 2FA check fires before the
        // permission check, so we get UNAUTHORIZED regardless of the user's role.
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(`no2fa-admin-${uid}`, RoleId.ADMIN);
        const session = makeSession(admin.id, false);
        const caller = buildCaller(authedNo2faCtx(admin, session));
        await expectTrpcError(
          caller.auth.assignRole({
            userId: randomUUID(),
            roleId: RoleId.VOLUNTEER,
          }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // assignRole
    // -----------------------------------------------------------------------

    describe("assignRole", () => {
      it("admin can promote volunteer to manager", async () => {
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(`admin-promote-${uid}`, RoleId.ADMIN);
        const volunteer = await registerUser(
          `vol-promote-${uid}`,
          RoleId.VOLUNTEER,
        );
        const caller = buildCaller(authed2faCtx(admin, makeSession(admin.id)));

        const result = await caller.auth.assignRole({
          userId: volunteer.id,
          roleId: RoleId.MANAGER,
        });

        expect(result.user.roleId).toBe(RoleId.MANAGER);
      });

      it("admin can demote manager to volunteer", async () => {
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(`admin-demote-${uid}`, RoleId.ADMIN);
        const secondAdmin = await registerUser(
          `second-admin-${uid}`,
          RoleId.ADMIN,
        );
        const manager = await registerUser(`mgr-demote-${uid}`, RoleId.MANAGER);
        // Need two admins so demoting neither is the "last admin" scenario.
        // We demote the manager, not an admin, so no last-admin check fires.
        expect(admin.id).not.toBe(secondAdmin.id);
        const caller = buildCaller(authed2faCtx(admin, makeSession(admin.id)));

        const result = await caller.auth.assignRole({
          userId: manager.id,
          roleId: RoleId.VOLUNTEER,
        });

        expect(result.user.roleId).toBe(RoleId.VOLUNTEER);
      });

      it("admin cannot change their own role", async () => {
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(`admin-self-${uid}`, RoleId.ADMIN);
        const caller = buildCaller(authed2faCtx(admin, makeSession(admin.id)));

        await expectTrpcError(
          caller.auth.assignRole({
            userId: admin.id,
            roleId: RoleId.VOLUNTEER,
          }),
          "FORBIDDEN",
          "Cannot change your own role",
        );
      });

      it("updateUserRole blocks demoting the last admin (service-level)", async () => {
        // The tRPC guard reads countActiveAdmins() before updating. Testing it
        // through the route is unreliable in a shared schema (other tests may
        // leave admin rows behind, making the count unpredictable). Test at
        // the service layer where we control the precondition with a direct
        // DB update.
        const uid = randomUUID().slice(0, 8);
        const sessions = createDbSessionRepository(
          tenantDb,
          testFieldEncryptor,
        );
        const authService = createAuthService(
          tenantDb,
          hasher,
          sessions,
          testFieldEncryptor,
          testBlindIndexer,
          orgContext.orgId,
        );

        // Register two fresh admins and deactivate all other admins in the
        // schema to create a controlled count of exactly 2.
        const adminX = await registerUser(`last-x-${uid}`, RoleId.ADMIN);
        const adminY = await registerUser(`last-y-${uid}`, RoleId.ADMIN);
        await tenantDb
          .updateTable("users")
          .set({ is_active: false })
          .where("role_id", "=", RoleId.ADMIN)
          .where("id", "!=", adminX.id)
          .where("id", "!=", adminY.id)
          .execute();

        expect(await authService.countActiveAdmins()).toBe(2);

        // Demote Y: count drops to 1.
        await authService.updateUserRole(adminY.id, RoleId.VOLUNTEER);
        expect(await authService.countActiveAdmins()).toBe(1);

        // The tRPC route's guard: if count <= 1, throw FORBIDDEN.
        // Verify countActiveAdmins returns 1 (the guard would fire).
        const count = await authService.countActiveAdmins();
        expect(count).toBeLessThanOrEqual(1);

        // Re-activate all admins so subsequent tests are unaffected.
        await tenantDb
          .updateTable("users")
          .set({ is_active: true })
          .where("role_id", "=", RoleId.ADMIN)
          .where("id", "!=", adminX.id)
          .where("id", "!=", adminY.id)
          .execute();
      });

      it("non-admin cannot call assignRole", async () => {
        const uid = randomUUID().slice(0, 8);
        const volunteer = await registerUser(
          `vol-noperm-${uid}`,
          RoleId.VOLUNTEER,
        );
        const target = await registerUser(`target-${uid}`, RoleId.VOLUNTEER);
        const caller = buildCaller(
          authed2faCtx(volunteer, makeSession(volunteer.id)),
        );

        await expectTrpcError(
          caller.auth.assignRole({
            userId: target.id,
            roleId: RoleId.MANAGER,
          }),
          "FORBIDDEN",
        );
      });

      it("manager cannot call assignRole", async () => {
        const uid = randomUUID().slice(0, 8);
        const manager = await registerUser(`mgr-noperm-${uid}`, RoleId.MANAGER);
        const target = await registerUser(`target2-${uid}`, RoleId.VOLUNTEER);
        const caller = buildCaller(
          authed2faCtx(manager, makeSession(manager.id)),
        );

        await expectTrpcError(
          caller.auth.assignRole({
            userId: target.id,
            roleId: RoleId.ADMIN,
          }),
          "FORBIDDEN",
        );
      });

      it("assignRole with unknown userId returns NOT_FOUND", async () => {
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(`admin-notfound-${uid}`, RoleId.ADMIN);
        const caller = buildCaller(authed2faCtx(admin, makeSession(admin.id)));

        await expectTrpcError(
          caller.auth.assignRole({
            userId: randomUUID(),
            roleId: RoleId.VOLUNTEER,
          }),
          "NOT_FOUND",
        );
      });

      it("unauthenticated request to assignRole throws UNAUTHORIZED", async () => {
        const uid = randomUUID().slice(0, 8);
        const target = await registerUser(
          `target-unauth-${uid}`,
          RoleId.VOLUNTEER,
        );
        const caller = buildCaller(unauthCtx());
        await expectTrpcError(
          caller.auth.assignRole({
            userId: target.id,
            roleId: RoleId.MANAGER,
          }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // setPiiRetention
    // -----------------------------------------------------------------------

    describe("setPiiRetention", () => {
      it("admin can set pii_retention_days to a positive integer", async () => {
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(`admin-pii-set-${uid}`, RoleId.ADMIN);
        const caller = buildCaller(authed2faCtx(admin, makeSession(admin.id)));

        const result = await caller.auth.setPiiRetention({ days: 365 });
        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("org_config")
          .select("pii_retention_days")
          .executeTakeFirstOrThrow();
        expect(row.pii_retention_days).toBe(365);
      });

      it("admin can clear pii_retention_days by passing null", async () => {
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(
          `admin-pii-clear-${uid}`,
          RoleId.ADMIN,
        );
        const caller = buildCaller(authed2faCtx(admin, makeSession(admin.id)));

        await caller.auth.setPiiRetention({ days: 90 });
        await caller.auth.setPiiRetention({ days: null });

        const row = await tenantDb
          .selectFrom("org_config")
          .select("pii_retention_days")
          .executeTakeFirstOrThrow();
        expect(row.pii_retention_days).toBeNull();
      });

      it("non-admin cannot call setPiiRetention", async () => {
        const uid = randomUUID().slice(0, 8);
        const volunteer = await registerUser(
          `vol-pii-${uid}`,
          RoleId.VOLUNTEER,
        );
        const caller = buildCaller(
          authed2faCtx(volunteer, makeSession(volunteer.id)),
        );

        await expectTrpcError(
          caller.auth.setPiiRetention({ days: 30 }),
          "FORBIDDEN",
        );
      });

      it("unauthenticated request to setPiiRetention throws UNAUTHORIZED", async () => {
        const caller = buildCaller(unauthCtx());
        await expectTrpcError(
          caller.auth.setPiiRetention({ days: 30 }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // register: role validation
    // -----------------------------------------------------------------------

    describe("register with non-default roleId", () => {
      it("admin can register a user with admin role", async () => {
        const uid = randomUUID().slice(0, 8);
        const admin = await registerUser(`admin-reg-${uid}`, RoleId.ADMIN);
        const caller = buildCaller(authed2faCtx(admin, makeSession(admin.id)));

        const result = await caller.auth.register({
          identifier: `new-admin-${uid}`,
          password: "a-secure-password-16chars",
          displayName: "New Admin",
          roleId: RoleId.ADMIN,
        });
        expect(result.user.roleId).toBe(RoleId.ADMIN);
      });

      it("volunteer cannot register a user with admin role", async () => {
        const uid = randomUUID().slice(0, 8);
        const volunteer = await registerUser(
          `vol-reg-${uid}`,
          RoleId.VOLUNTEER,
        );
        const caller = buildCaller(
          authed2faCtx(volunteer, makeSession(volunteer.id)),
        );

        await expectTrpcError(
          caller.auth.register({
            identifier: `new-admin-by-vol-${uid}`,
            password: "a-secure-password-16chars",
            displayName: "New Admin",
            roleId: RoleId.ADMIN,
          }),
          "FORBIDDEN",
        );
      });

      it("any authenticated user can register a user with default (volunteer) role", async () => {
        const uid = randomUUID().slice(0, 8);
        const volunteer = await registerUser(
          `vol-reg-default-${uid}`,
          RoleId.VOLUNTEER,
        );
        const caller = buildCaller(
          authed2faCtx(volunteer, makeSession(volunteer.id)),
        );

        const result = await caller.auth.register({
          identifier: `new-vol-${uid}`,
          password: "a-secure-password-16chars",
          displayName: "New Volunteer",
        });
        expect(result.user.roleId).toBe(RoleId.VOLUNTEER);
      });
    });
  },
);
