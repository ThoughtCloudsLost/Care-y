/**
 * DB integration tests for role permission override endpoints.
 *
 * Exercises the three role permission override endpoints end to end.
 * Validates sparse storage (default-equal deletes row), locked permission
 * rejection, audit row side-effects, and admin-only enforcement.
 *
 * Requires DATABASE_URL (runs inside Docker via pnpm test:server:db).
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  vi,
} from "vitest";
import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, UsersTable } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  expectTrpcError,
  mockReq,
  mockRes,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  createMockEmailSender,
  createThrowingProviderFactory,
  type TestDb,
} from "../test-utils.js";
import { RoleId, Permission, ErrorCode } from "@care-y/shared";
import { createAuthRouter, type AuthRouterDeps } from "./auth.js";
import { createCallerFactory } from "../trpc/trpc.js";
import { createAuditService } from "../tickets/audit.js";
import { invalidateRolePermissionCache } from "../auth/roles.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryTotpReplayCache } from "../auth/totp-replay-cache.js";

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "role permission override endpoints (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgCtx: OrgContext;
    let adminUser: Selectable<UsersTable>;
    let volunteerUser: Selectable<UsersTable>;
    let managerUser: Selectable<UsersTable>;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      orgCtx = {
        orgId: "org-role-perm-test",
        orgSlug: "test-role-perms",
        orgSchema: testDb.schemaName,
        tenantDb,
        sealedBox: testSealedBox,
      };

      adminUser = await createTestUser(tenantDb, {
        overrides: { role_id: RoleId.ADMIN },
      });
      volunteerUser = await createTestUser(tenantDb);
      managerUser = await createTestUser(tenantDb, {
        overrides: { role_id: RoleId.MANAGER },
      });
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    beforeEach(async () => {
      // Clean override rows and invalidate cache between tests
      await tenantDb.deleteFrom("role_permission_overrides").execute();
      invalidateRolePermissionCache(orgCtx.orgSchema);
    });

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    function buildDeps(): AuthRouterDeps {
      return {
        hasher: createScryptHasher(),
        loginLimiter: createInMemoryRateLimiter({
          windowMs: 60_000,
          maxRequests: 100,
        }),
        saltLimiter: createInMemoryRateLimiter({
          windowMs: 60_000,
          maxRequests: 100,
        }),
        fakeSaltKey: Buffer.alloc(32, 0),
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        tokenizer: testSessionTokenizer,
        isSecureCookie: false,
        emailSender: createMockEmailSender(),
        providerFactory: createThrowingProviderFactory(),
        resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
        totpReplayCache: createInMemoryTotpReplayCache(),
        createAuditSvc: (tDb) => createAuditService(tDb),
      };
    }

    function createAuthedCaller(user: Selectable<UsersTable>) {
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgCtx,
        session: {
          id: `sess-${user.id}`,
          token: `tok-${user.id}`,
          userId: user.id,
          ipToken: "ip-tok",
          uaToken: "ua-tok",
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: user.id,
          encryptedIdentifier: user.encrypted_identifier.toString("base64"),
          encryptedDisplayName: user.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: true,
        },
      };
      const deps = buildDeps();
      return createCallerFactory(createAuthRouter(deps))(ctx);
    }

    function createUnauthenticatedCaller() {
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgCtx,
        session: null,
        user: null,
      };
      const deps = buildDeps();
      return createCallerFactory(createAuthRouter(deps))(ctx);
    }

    // -----------------------------------------------------------------------
    // getRolePermissions
    // -----------------------------------------------------------------------

    describe("getRolePermissions", () => {
      it("returns all three roles with effective permissions and locked list", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.getRolePermissions();

        expect(result.roles).toHaveLength(3);
        expect(result.locked).toEqual(
          expect.arrayContaining([
            Permission.MANAGE_KEYS,
            Permission.MANAGE_ROLES,
            Permission.MANAGE_INFRASTRUCTURE,
          ]),
        );

        const volunteerRole = result.roles.find(
          (r) => r.roleId === RoleId.VOLUNTEER,
        );
        expect(volunteerRole).toBeDefined();
        expect(volunteerRole?.permissions).toContain(Permission.VIEW_TICKETS);
        expect(volunteerRole?.overridden).toHaveLength(0);
      });
    });

    // -----------------------------------------------------------------------
    // setRolePermission
    // -----------------------------------------------------------------------

    describe("setRolePermission", () => {
      it("toggling a non-default permission shows in overridden and creates a row", async () => {
        const caller = createAuthedCaller(adminUser);

        // VIEW_REPORTS is not in Volunteer defaults
        await caller.setRolePermission({
          roleId: RoleId.VOLUNTEER,
          permission: Permission.VIEW_REPORTS,
          enabled: true,
        });

        const result = await caller.getRolePermissions();
        const volunteerRole = result.roles.find(
          (r) => r.roleId === RoleId.VOLUNTEER,
        );
        expect(volunteerRole?.permissions).toContain(Permission.VIEW_REPORTS);
        expect(volunteerRole?.overridden).toContain(Permission.VIEW_REPORTS);

        // Verify a DB row exists
        const rows = await tenantDb
          .selectFrom("role_permission_overrides")
          .selectAll()
          .where("role_id", "=", RoleId.VOLUNTEER)
          .where("permission", "=", Permission.VIEW_REPORTS)
          .execute();
        expect(rows).toHaveLength(1);
      });

      it("setting a value equal to the default deletes the row (sparse storage)", async () => {
        const caller = createAuthedCaller(adminUser);

        // First, add a non-default override
        await caller.setRolePermission({
          roleId: RoleId.VOLUNTEER,
          permission: Permission.VIEW_REPORTS,
          enabled: true,
        });

        // Verify row exists
        let rows = await tenantDb
          .selectFrom("role_permission_overrides")
          .selectAll()
          .where("role_id", "=", RoleId.VOLUNTEER)
          .where("permission", "=", Permission.VIEW_REPORTS)
          .execute();
        expect(rows).toHaveLength(1);

        // Now set back to false (the default for Volunteer)
        await caller.setRolePermission({
          roleId: RoleId.VOLUNTEER,
          permission: Permission.VIEW_REPORTS,
          enabled: false,
        });

        // Row should be deleted
        rows = await tenantDb
          .selectFrom("role_permission_overrides")
          .selectAll()
          .where("role_id", "=", RoleId.VOLUNTEER)
          .where("permission", "=", Permission.VIEW_REPORTS)
          .execute();
        expect(rows).toHaveLength(0);
      });

      it("rejects locked permission with FORBIDDEN and PERMISSION_LOCKED", async () => {
        const caller = createAuthedCaller(adminUser);

        await expectTrpcError(
          caller.setRolePermission({
            roleId: RoleId.VOLUNTEER,
            permission: Permission.MANAGE_KEYS,
            enabled: true,
          }),
          "FORBIDDEN",
          ErrorCode.PERMISSION_LOCKED,
        );

        // No DB row should have been written
        const rows = await tenantDb
          .selectFrom("role_permission_overrides")
          .selectAll()
          .where("permission", "=", Permission.MANAGE_KEYS)
          .execute();
        expect(rows).toHaveLength(0);

        // Allow audit writes to settle
        await new Promise((resolve) => setTimeout(resolve, 200));

        // No audit entry for a rejected write
        const auditRows = await tenantDb
          .selectFrom("audit_log")
          .selectAll()
          .where("event_type", "=", "role_permission_changed")
          .execute();
        const lockedAudit = auditRows.filter(
          (r) => r.metadata.permission === Permission.MANAGE_KEYS,
        );
        expect(lockedAudit).toHaveLength(0);
      });

      it("writes audit entry with correct metadata on successful change", async () => {
        const caller = createAuthedCaller(adminUser);

        // Earlier tests in this shared schema also toggle VIEW_REPORTS for
        // Volunteer; only rows written after this point count.
        const auditWindowStart = new Date();

        await caller.setRolePermission({
          roleId: RoleId.VOLUNTEER,
          permission: Permission.VIEW_REPORTS,
          enabled: true,
        });

        // Allow audit log write to complete (fire-and-forget)
        await new Promise((resolve) => setTimeout(resolve, 200));

        const auditRows = await tenantDb
          .selectFrom("audit_log")
          .selectAll()
          .where("event_type", "=", "role_permission_changed")
          .where("created_at", ">", auditWindowStart)
          .execute();
        const matching = auditRows.filter(
          (r) =>
            r.metadata.roleId === RoleId.VOLUNTEER &&
            r.metadata.permission === Permission.VIEW_REPORTS,
        );
        expect(matching).toHaveLength(1);
        expect(matching[0]?.actor_id).toBe(adminUser.id);
        expect(matching[0]?.metadata).toMatchObject({
          roleId: RoleId.VOLUNTEER,
          permission: Permission.VIEW_REPORTS,
          enabled: true,
        });
      });
    });

    // -----------------------------------------------------------------------
    // resetRolePermissions
    // -----------------------------------------------------------------------

    describe("resetRolePermissions", () => {
      it("removes all override rows and writes audit entry", async () => {
        const caller = createAuthedCaller(adminUser);

        // Insert some overrides first
        await caller.setRolePermission({
          roleId: RoleId.VOLUNTEER,
          permission: Permission.VIEW_REPORTS,
          enabled: true,
        });
        await caller.setRolePermission({
          roleId: RoleId.MANAGER,
          permission: Permission.VIEW_TICKETS,
          enabled: false,
        });

        let overrideCount = await tenantDb
          .selectFrom("role_permission_overrides")
          .selectAll()
          .execute();
        expect(overrideCount.length).toBeGreaterThan(0);

        // Reset
        const resetResult = await caller.resetRolePermissions();
        expect(resetResult.reset).toBe(true);

        // All rows gone
        overrideCount = await tenantDb
          .selectFrom("role_permission_overrides")
          .selectAll()
          .execute();
        expect(overrideCount).toHaveLength(0);

        // Allow audit writes to settle
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Audit entry for reset
        const auditRows = await tenantDb
          .selectFrom("audit_log")
          .selectAll()
          .where("event_type", "=", "role_permissions_reset")
          .execute();
        expect(auditRows.length).toBeGreaterThanOrEqual(1);
        const resetRow = auditRows[auditRows.length - 1];
        expect(resetRow?.actor_id).toBe(adminUser.id);
      });

      it("subsequent getRolePermissions reflects defaults after reset", async () => {
        const caller = createAuthedCaller(adminUser);

        // Add an override
        await caller.setRolePermission({
          roleId: RoleId.VOLUNTEER,
          permission: Permission.VIEW_REPORTS,
          enabled: true,
        });

        // Verify override is visible
        let result = await caller.getRolePermissions();
        let vol = result.roles.find((r) => r.roleId === RoleId.VOLUNTEER);
        expect(vol?.permissions).toContain(Permission.VIEW_REPORTS);

        // Reset
        await caller.resetRolePermissions();

        // Verify defaults restored
        result = await caller.getRolePermissions();
        vol = result.roles.find((r) => r.roleId === RoleId.VOLUNTEER);
        expect(vol?.permissions).not.toContain(Permission.VIEW_REPORTS);
        expect(vol?.overridden).toHaveLength(0);
      });
    });

    // -----------------------------------------------------------------------
    // Auth enforcement (non-admin FORBIDDEN)
    // -----------------------------------------------------------------------

    describe("auth enforcement", () => {
      it("rejects volunteer on getRolePermissions", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.getRolePermissions(), "FORBIDDEN");
      });

      it("rejects manager on getRolePermissions", async () => {
        const caller = createAuthedCaller(managerUser);
        await expectTrpcError(caller.getRolePermissions(), "FORBIDDEN");
      });

      it("rejects volunteer on setRolePermission", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.setRolePermission({
            roleId: RoleId.VOLUNTEER,
            permission: Permission.VIEW_REPORTS,
            enabled: true,
          }),
          "FORBIDDEN",
        );
      });

      it("rejects volunteer on resetRolePermissions", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.resetRolePermissions(), "FORBIDDEN");
      });

      it("rejects unauthenticated caller on all three endpoints", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(caller.getRolePermissions(), "UNAUTHORIZED");
        await expectTrpcError(
          caller.setRolePermission({
            roleId: RoleId.VOLUNTEER,
            permission: Permission.VIEW_REPORTS,
            enabled: true,
          }),
          "UNAUTHORIZED",
        );
        await expectTrpcError(caller.resetRolePermissions(), "UNAUTHORIZED");
      });
    });
  },
);
