import { describe, it, expect, beforeAll } from "vitest";
import type { DemoEngineResult } from "./engine.js";
import { bootDemoEngine } from "./engine.js";
import { isTrpcServerError } from "./caller-adapter.js";
import { RoleId, Permission } from "@care-y/shared";

/**
 * Smoke tests for setSignedInRole: the engine-level role switch that
 * mutates the signed-in user's role_id directly in the tenant DB and
 * returns the new permission set via auth.me. The client bridge is
 * already tested in bridge.test.ts and crypto-context.test.ts; these
 * tests cover the server half that touches PGlite.
 *
 * Shares a single booted engine across all tests (PGlite boot is
 * expensive). Tests run sequentially because they mutate the same
 * user row.
 */

// Permission sets from packages/server/src/auth/roles.ts (ROLE_CONFIG).
// Duplicated here as test expectations so a drift between ROLE_CONFIG
// and setSignedInRole's returned array causes a loud failure.
const VOLUNTEER_PERMISSIONS: readonly Permission[] = [
  Permission.VIEW_TICKETS,
  Permission.MANAGE_OWN_TICKETS,
  Permission.VIEW_KNOWLEDGE_BASE,
  Permission.EDIT_KNOWLEDGE_BASE,
  Permission.VIEW_OWN_SHIFTS,
];

const ADMIN_ONLY_PERMISSIONS: readonly Permission[] = [
  Permission.MANAGE_ROLES,
  Permission.MANAGE_ORG_CONFIG,
  Permission.MANAGE_KEYS,
  Permission.MANAGE_INFRASTRUCTURE,
];

// The engine caller is a Proxy with no enumerable keys, so a nested
// Record cast trips noUncheckedIndexedAccess. Naming the two procedures
// these tests dispatch keeps the access typed without index-undefined.
interface EngineTestCaller {
  readonly reports: {
    readonly queueStats: (input?: unknown) => Promise<unknown>;
  };
  readonly auth: {
    readonly assignRole: (input: unknown) => Promise<unknown>;
  };
}

function engineCaller(engine: DemoEngineResult): EngineTestCaller {
  const factory = engine.callerFactory as (
    ctx: typeof engine.adminCtx,
  ) => EngineTestCaller;
  return factory(engine.adminCtx);
}

describe("setSignedInRole", () => {
  let engine: DemoEngineResult;

  beforeAll(async () => {
    engine = await bootDemoEngine();
  }, 120_000);

  it("switching to VOLUNTEER returns exactly the volunteer permission set", async () => {
    const permissions = await engine.setSignedInRole(RoleId.VOLUNTEER);

    // The returned array should contain every volunteer permission
    // and none of the admin-only ones.
    expect([...permissions].sort()).toEqual([...VOLUNTEER_PERMISSIONS].sort());

    for (const adminPerm of ADMIN_ONLY_PERMISSIONS) {
      expect(permissions).not.toContain(adminPerm);
    }
  }, 30_000);

  it("adminCtx.user reflects the new role after setSignedInRole", async () => {
    // setSignedInRole calls refreshAdminUser() directly, so the
    // getter-backed ctx.user must already see VOLUNTEER.
    expect(engine.adminCtx.user?.roleId).toBe(RoleId.VOLUNTEER);
  });

  it("a manager-gated procedure rejects the now-volunteer user", async () => {
    // reports.queueStats requires VIEW_REPORTS (manager+). After the
    // switch to VOLUNTEER, the admin caller's context user is a
    // volunteer, so middleware should reject with FORBIDDEN.
    const caller = engineCaller(engine);

    let forbiddenCode: string | undefined;
    try {
      await caller.reports.queueStats();
    } catch (err: unknown) {
      if (isTrpcServerError(err)) {
        forbiddenCode = err.code;
      }
    }

    expect(forbiddenCode).toBe("FORBIDDEN");
  }, 30_000);

  it("switching back to ADMIN restores admin permissions", async () => {
    const permissions = await engine.setSignedInRole(RoleId.ADMIN);

    for (const adminPerm of ADMIN_ONLY_PERMISSIONS) {
      expect(permissions).toContain(adminPerm);
    }
    // Also includes all volunteer permissions (admin is a superset).
    for (const volPerm of VOLUNTEER_PERMISSIONS) {
      expect(permissions).toContain(volPerm);
    }

    expect(engine.adminCtx.user?.roleId).toBe(RoleId.ADMIN);
  }, 30_000);

  it("admin-gated procedure succeeds after restoring ADMIN", async () => {
    // Verify the dirty-flag / refresh cycle by calling the same
    // reports.queueStats that was forbidden above.
    const caller = engineCaller(engine);

    // Should not throw after restoring ADMIN.
    const result = await caller.reports.queueStats();
    expect(result).toBeDefined();
  }, 30_000);

  it("switching to MANAGER gives an intermediate permission set", async () => {
    const permissions = await engine.setSignedInRole(RoleId.MANAGER);

    // Manager has VIEW_REPORTS but not MANAGE_ROLES.
    expect(permissions).toContain(Permission.VIEW_REPORTS);
    expect(permissions).toContain(Permission.MANAGE_USERS);
    expect(permissions).not.toContain(Permission.MANAGE_ROLES);
    expect(permissions).not.toContain(Permission.MANAGE_KEYS);

    // Restore admin for any subsequent tests sharing this engine.
    await engine.setSignedInRole(RoleId.ADMIN);
  }, 30_000);

  // ── Self-assignment guard documentation ──────────────────────────
  //
  // auth.assignRole rejects self-assignment (CANNOT_CHANGE_OWN_ROLE).
  // That guard is WHY setSignedInRole exists: the demo role switcher
  // needs to change the signed-in user's own role, which the normal
  // tRPC endpoint forbids. setSignedInRole bypasses the router by
  // doing a direct DB UPDATE + refreshAdminUser. The guard itself is
  // tested in the server's auth-roles.test.ts; this test confirms the
  // engine caller also observes the rejection, proving the demo had
  // to go around it.
  it("auth.assignRole rejects self-assignment (proving setSignedInRole is necessary)", async () => {
    const caller = engineCaller(engine);

    let errorMessage = "";
    try {
      await caller.auth.assignRole({
        userId: engine.seedResult.adminUserId,
        roleId: RoleId.VOLUNTEER,
      });
    } catch (err: unknown) {
      if (isTrpcServerError(err)) {
        errorMessage = err.message;
      }
    }

    expect(errorMessage).toContain("CANNOT_CHANGE_OWN_ROLE");
  }, 30_000);
});
