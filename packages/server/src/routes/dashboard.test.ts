/**
 * Tests for the dashboard tRPC router.
 *
 * The router is a thin delegation: adminProcedure (authed + 2FA +
 * MANAGE_ROLES) then the real DashboardService against the org tenant
 * DB (the service is constructed in the route, not injected).
 * Unit tests cover the auth and permission gates with
 * mock contexts. The DB integration suite covers the observable
 * envelope (checklist shape, dismissal roundtrip) through the real
 * service; per-item completion logic is asserted in
 * dashboard-service.test.ts and is not re-asserted here.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Selectable } from "kysely";
import { createDashboardRouter } from "./dashboard.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UsersTable } from "../db/types.js";
import { RoleId, ErrorCode, type RoleIdValue } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgId,
  OrgSlug,
  OrgSchema,
} from "@care-y/shared";
import {
  createTestDb,
  createTestUser,
  expectTrpcError,
  mockReq,
  mockRes,
  type TestDb,
  stubTenantDbDefaultRoles,
} from "../test-utils.js";

const factory = createCallerFactory(createDashboardRouter());

// --- Unit-level context builders ---
// The tenant DB is a stub: the guards reject before any resolver DB
// access, and a wrongly admitted call would surface as
// INTERNAL_SERVER_ERROR from the stub, never as the asserted FORBIDDEN.

const UNIT_USER_ID = "00000000-0000-4000-8000-000000001001" as UserId;
const UNIT_ORG_ID = "00000000-0000-4000-8000-000000001100" as OrgId;
const UNIT_ORG_SCHEMA = "org_00000000-0000-4000-8000-000000001100" as OrgSchema;

function createAdminContext(): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: {
      orgId: UNIT_ORG_ID,
      orgSlug: "test-org" as OrgSlug,
      orgSchema: UNIT_ORG_SCHEMA,
      tenantDb: stubTenantDbDefaultRoles(),
      sealedBox: {} as OrgContext["sealedBox"],
    },
    session: {
      id: "00000000-0000-4000-8000-000000100010" as SessionId,
      token: "tok-1" as SessionToken,
      userId: UNIT_USER_ID,
      ipToken: "ip-tok" as IpToken,
      uaToken: "ua-tok" as UaToken,
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: UNIT_USER_ID,
      encryptedIdentifier: "encrypted-identifier",
      encryptedDisplayName: "encrypted-name",
      encryptedPreferredLocale: null,
      roleId: RoleId.ADMIN,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function createUnauthenticatedContext(): Context {
  return { ...createAdminContext(), session: null, user: null };
}

function createContextWithRole(roleId: RoleIdValue): Context {
  const base = createAdminContext();
  return {
    ...base,
    user: base.user === null ? null : { ...base.user, roleId },
  };
}

function createNoOrgContext(): Context {
  return { ...createAdminContext(), org: null };
}

// --- Tests ---

describe("createDashboardRouter", () => {
  describe("auth and permission enforcement", () => {
    // Both procedures use adminProcedure (org + session + 2FA +
    // MANAGE_ROLES), so admin is the only role admitted.
    // The asserted messages are ErrorCode constants the client branches
    // on, part of the API contract rather than display copy.
    type DashboardCaller = ReturnType<typeof factory>;
    const procedureInvocations: ReadonlyArray<{
      name: string;
      invoke: (caller: DashboardCaller) => Promise<unknown>;
    }> = [
      {
        name: "getSetupChecklist",
        invoke: (caller) => caller.getSetupChecklist(),
      },
      {
        name: "dismissSetupChecklist",
        invoke: (caller) => caller.dismissSetupChecklist(),
      },
    ];

    for (const { name, invoke } of procedureInvocations) {
      it(`rejects unauthenticated callers on ${name}`, async () => {
        const caller = factory(createUnauthenticatedContext());

        await expectTrpcError(
          invoke(caller),
          "UNAUTHORIZED",
          ErrorCode.NOT_AUTHENTICATED,
        );
      });

      it(`rejects volunteer callers on ${name}`, async () => {
        const caller = factory(createContextWithRole(RoleId.VOLUNTEER));

        await expectTrpcError(
          invoke(caller),
          "FORBIDDEN",
          ErrorCode.INSUFFICIENT_PERMISSIONS,
        );
      });

      it(`rejects manager callers on ${name} (MANAGE_ROLES is admin-only)`, async () => {
        const caller = factory(createContextWithRole(RoleId.MANAGER));

        await expectTrpcError(
          invoke(caller),
          "FORBIDDEN",
          ErrorCode.INSUFFICIENT_PERMISSIONS,
        );
      });
    }

    it("fails closed for an unrecognized role id", async () => {
      const caller = factory(
        createContextWithRole("not-a-real-role" as RoleIdValue),
      );

      await expectTrpcError(
        caller.getSetupChecklist(),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });

    it("rejects requests without a resolved org", async () => {
      const caller = factory(createNoOrgContext());

      await expectTrpcError(caller.getSetupChecklist(), "NOT_FOUND");
    });
  });
});

// ---------------------------------------------------------------------------
// DB integration tests (real PostgreSQL + real DashboardService,
// run via pnpm test:server:db)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "dashboard routes (DB integration)",
  () => {
    let testDb: TestDb;
    let adminUser: Selectable<UsersTable>;

    function dbAdminContext(): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: {
          orgId: UNIT_ORG_ID,
          orgSlug: "test-org" as OrgSlug,
          orgSchema: testDb.schemaName as OrgSchema,
          tenantDb: testDb.db,
          sealedBox: {} as OrgContext["sealedBox"],
        },
        session: {
          id: "00000000-0000-4000-8000-000000100020" as SessionId,
          token: "tok-db-1" as SessionToken,
          userId: adminUser.id,
          ipToken: "ip-tok" as IpToken,
          uaToken: "ua-tok" as UaToken,
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: adminUser.id,
          encryptedIdentifier:
            adminUser.encrypted_identifier.toString("base64"),
          encryptedDisplayName:
            adminUser.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: adminUser.role_id,
          isActive: adminUser.is_active,
          hasSeenBriefing: true,
        },
      };
    }

    beforeAll(async () => {
      testDb = await createTestDb();
      // org_config singleton: getSetupChecklist reads it and
      // dismissSetupChecklist updates it; a fresh test schema has no row.
      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      adminUser = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.ADMIN },
      });
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("returns the checklist envelope for an admin caller", async () => {
      const caller = factory(dbAdminContext());

      const result = await caller.getSetupChecklist();

      expect(result.dismissed).toBe(false);
      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(typeof item.id).toBe("string");
        expect(item.id).not.toBe("");
        expect(typeof item.complete).toBe("boolean");
      }
      // Item ids are the client's rendering key; duplicates would break
      // the checklist UI.
      const ids = result.items.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("dismissSetupChecklist persists and a subsequent get reports dismissed", async () => {
      const caller = factory(dbAdminContext());

      await expect(caller.dismissSetupChecklist()).resolves.toEqual({
        success: true,
      });
      await expect(caller.getSetupChecklist()).resolves.toEqual({
        dismissed: true,
        items: [],
      });
    });
  },
);
