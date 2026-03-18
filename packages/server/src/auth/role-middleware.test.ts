/**
 * Tests for requireRole middleware.
 *
 * Uses createCallerFactory to test the middleware through the public tRPC
 * caller interface rather than reaching into tRPC internals. This means
 * the tests verify observable behavior (correct HTTP error codes, message
 * content, access granted/denied) and survive tRPC version upgrades.
 */

import { describe, it, expect } from "vitest";
import { RoleId, Permission } from "@care-y/shared";
import {
  router,
  authed2faProcedure,
  createCallerFactory,
  requireRole,
} from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import {
  mockReq,
  mockRes,
  expectTrpcError,
  testSealedBox,
} from "../test-utils.js";

// --- Stubs ---

const stubOrg: OrgContext = {
  orgId: "00000000-0000-0000-0000-000000000001",
  orgSlug: "test",
  orgSchema: "test_schema",
  tenantDb: {} as OrgContext["tenantDb"],
  sealedBox: testSealedBox,
};

function makeCtx(overrides?: Partial<Context>): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: stubOrg,
    session: {
      id: "session-id",
      token: "token",
      userId: "user-id",
      ipToken: "test-ip-token",
      uaToken: "test-ua-token",
      expiresAt: new Date(Date.now() + 60_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-id",
      identifier: "testuser",
      encryptedDisplayName: "Test User",
      roleId: RoleId.VOLUNTEER,
      isActive: true,
    },
    ...overrides,
  };
}

function makeCtxWithRole(roleId: string): Context {
  return makeCtx({
    user: {
      id: "user-id",
      identifier: "testuser",
      encryptedDisplayName: "Test User",
      roleId,
      isActive: true,
    },
  });
}

// Build a mini-router with one procedure per permission level.
// requireRole is chained after authed2faProcedure (the real usage pattern).
const testRouter = router({
  viewTickets: authed2faProcedure
    .use(requireRole(Permission.VIEW_TICKETS))
    .query(() => "tickets-visible"),
  manageUsers: authed2faProcedure
    .use(requireRole(Permission.MANAGE_USERS))
    .query(() => "users-managed"),
  manageRoles: authed2faProcedure
    .use(requireRole(Permission.MANAGE_ROLES))
    .query(() => "roles-managed"),
});

const factory = createCallerFactory(testRouter);

describe("requireRole", () => {
  describe("when user has the required permission", () => {
    it("allows volunteer to VIEW_TICKETS", async () => {
      const caller = factory(makeCtxWithRole(RoleId.VOLUNTEER));
      const result = await caller.viewTickets();
      expect(result).toBe("tickets-visible");
    });

    it("allows manager to MANAGE_USERS", async () => {
      const caller = factory(makeCtxWithRole(RoleId.MANAGER));
      const result = await caller.manageUsers();
      expect(result).toBe("users-managed");
    });

    it("allows admin to MANAGE_ROLES", async () => {
      const caller = factory(makeCtxWithRole(RoleId.ADMIN));
      const result = await caller.manageRoles();
      expect(result).toBe("roles-managed");
    });

    it("allows all three roles to VIEW_TICKETS (inherited permission)", async () => {
      for (const roleId of [RoleId.VOLUNTEER, RoleId.MANAGER, RoleId.ADMIN]) {
        const caller = factory(makeCtxWithRole(roleId));
        const result = await caller.viewTickets();
        expect(result).toBe("tickets-visible");
      }
    });
  });

  describe("when user lacks the required permission", () => {
    it("rejects volunteer from MANAGE_ROLES with FORBIDDEN", async () => {
      const caller = factory(makeCtxWithRole(RoleId.VOLUNTEER));
      await expectTrpcError(caller.manageRoles(), "FORBIDDEN");
    });

    it("rejects manager from MANAGE_ROLES with FORBIDDEN", async () => {
      const caller = factory(makeCtxWithRole(RoleId.MANAGER));
      await expectTrpcError(caller.manageRoles(), "FORBIDDEN");
    });

    it("rejects volunteer from MANAGE_USERS with FORBIDDEN", async () => {
      const caller = factory(makeCtxWithRole(RoleId.VOLUNTEER));
      await expectTrpcError(caller.manageUsers(), "FORBIDDEN");
    });

    it("error message does not reveal the required permission name", async () => {
      const caller = factory(makeCtxWithRole(RoleId.VOLUNTEER));
      try {
        await caller.manageRoles();
        expect.fail("should have thrown");
      } catch (err: unknown) {
        const message = (err as Error).message;
        expect(message).not.toContain("MANAGE_ROLES");
        expect(message).not.toContain("manage_roles");
      }
    });

    it("error message does not reveal the user's role ID", async () => {
      const caller = factory(makeCtxWithRole(RoleId.VOLUNTEER));
      try {
        await caller.manageRoles();
        expect.fail("should have thrown");
      } catch (err: unknown) {
        const message = (err as Error).message;
        expect(message).not.toContain(RoleId.VOLUNTEER);
      }
    });
  });

  describe("redundant auth guards (defense in depth)", () => {
    it("rejects when session is null with UNAUTHORIZED", async () => {
      const caller = factory(makeCtx({ session: null }));
      await expectTrpcError(caller.viewTickets(), "UNAUTHORIZED");
    });

    it("rejects when user is null with UNAUTHORIZED", async () => {
      const caller = factory(makeCtx({ user: null }));
      await expectTrpcError(caller.viewTickets(), "UNAUTHORIZED");
    });

    it("rejects when org is null with NOT_FOUND", async () => {
      const caller = factory(makeCtx({ org: null }));
      await expectTrpcError(caller.viewTickets(), "NOT_FOUND");
    });
  });
});
