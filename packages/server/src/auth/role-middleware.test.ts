/**
 * Unit tests for requireRole middleware.
 *
 * Tests the middleware in isolation by constructing minimal tRPC contexts
 * and verifying the correct TRPCError codes are thrown. No DB required.
 */

import { describe, it, expect } from "vitest";
import type { TRPCError } from "@trpc/server";
import { RoleId, Permission } from "@care-y/shared";
import { requireRole } from "./role-middleware.js";
import type { Context } from "../trpc/context.js";
import type { OrgContext } from "../trpc/context.js";
import type { SessionData } from "./session-repository.js";
import type { UserRecord } from "./service.js";

// Minimal stubs for the middleware context. The middleware only reads
// ctx.session, ctx.user, and ctx.user.roleId (nothing else).

const stubOrg: OrgContext = {
  orgId: "00000000-0000-0000-0000-000000000001",
  orgSlug: "test",
  orgSchema: "test_schema",
  tenantDb: {} as OrgContext["tenantDb"],
};

const stubSession: SessionData = {
  id: "session-id",
  token: "token",
  userId: "user-id",
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
  expiresAt: new Date(Date.now() + 60_000),
  twofaVerified: true,
  webauthnChallenge: null,
};

function makeUser(roleId: string): UserRecord {
  return {
    id: "user-id",
    identifier: "testuser",
    displayName: "Test User",
    roleId,
    isActive: true,
  };
}

function makeCtx(overrides?: {
  session?: SessionData | null;
  user?: UserRecord | null;
  org?: OrgContext | null;
}): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: overrides?.org !== undefined ? overrides.org : stubOrg,
    session: overrides?.session !== undefined ? overrides.session : stubSession,
    user:
      overrides?.user !== undefined
        ? overrides.user
        : makeUser(RoleId.VOLUNTEER),
  };
}

/**
 * Invokes the requireRole middleware with a synthetic context and a no-op
 * next() that returns a resolved value. Returns the resolved value on success
 * or throws on rejection.
 */
async function invokeMiddleware(
  permission: Permission,
  ctx: Context,
): Promise<unknown> {
  const mw = requireRole(permission);

  // Access the internal _middlewares array to get the raw function.
  // This is the same approach tRPC uses internally to chain middleware.
  const fn = (mw as unknown as { _middlewares: unknown[] })
    ._middlewares[0] as (opts: {
    ctx: Context;
    next: (opts: { ctx: Context }) => Promise<{ ctx: Context }>;
    path: string;
    type: string;
    input: unknown;
    getRawInput: () => Promise<unknown>;
    meta: unknown;
    signal: AbortSignal | undefined;
  }) => Promise<unknown>;

  return fn({
    ctx,
    next: (opts: { ctx: Context }) =>
      Promise.resolve({ ok: true, ctx: opts.ctx, data: "passed" }),
    path: "test.path",
    type: "query",
    input: undefined,
    getRawInput: () => Promise.resolve(undefined),
    meta: undefined,
    signal: undefined,
  });
}

describe("requireRole", () => {
  describe("when user has the required permission", () => {
    it("calls next() for volunteer checking VIEW_TICKETS", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.VOLUNTEER) });
      const result = await invokeMiddleware(Permission.VIEW_TICKETS, ctx);
      expect(result).toMatchObject({ ok: true });
    });

    it("calls next() for manager checking MANAGE_USERS", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.MANAGER) });
      const result = await invokeMiddleware(Permission.MANAGE_USERS, ctx);
      expect(result).toMatchObject({ ok: true });
    });

    it("calls next() for admin checking MANAGE_ROLES", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.ADMIN) });
      const result = await invokeMiddleware(Permission.MANAGE_ROLES, ctx);
      expect(result).toMatchObject({ ok: true });
    });

    it("allows all three roles to pass VIEW_TICKETS check", async () => {
      for (const roleId of [RoleId.VOLUNTEER, RoleId.MANAGER, RoleId.ADMIN]) {
        const ctx = makeCtx({ user: makeUser(roleId) });
        const result = await invokeMiddleware(Permission.VIEW_TICKETS, ctx);
        expect(result).toMatchObject({ ok: true });
      }
    });
  });

  describe("when user lacks the required permission", () => {
    it("throws FORBIDDEN for volunteer checking MANAGE_ROLES", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.VOLUNTEER) });
      await expect(
        invokeMiddleware(Permission.MANAGE_ROLES, ctx),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    });

    it("throws FORBIDDEN for manager checking MANAGE_ROLES", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.MANAGER) });
      await expect(
        invokeMiddleware(Permission.MANAGE_ROLES, ctx),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    });

    it("throws FORBIDDEN for volunteer checking MANAGE_USERS", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.VOLUNTEER) });
      await expect(
        invokeMiddleware(Permission.MANAGE_USERS, ctx),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("error message does not reveal the required permission name", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.VOLUNTEER) });
      let err: TRPCError | undefined;
      try {
        await invokeMiddleware(Permission.MANAGE_ROLES, ctx);
      } catch (caught: unknown) {
        err = caught as TRPCError;
      }
      expect(err?.message).not.toContain("MANAGE_ROLES");
      expect(err?.message).not.toContain("manage_roles");
    });

    it("error message does not reveal the user's role ID", async () => {
      const ctx = makeCtx({ user: makeUser(RoleId.VOLUNTEER) });
      let err: TRPCError | undefined;
      try {
        await invokeMiddleware(Permission.MANAGE_ROLES, ctx);
      } catch (caught: unknown) {
        err = caught as TRPCError;
      }
      expect(err?.message).not.toContain(RoleId.VOLUNTEER);
    });
  });

  describe("redundant auth guards", () => {
    it("throws UNAUTHORIZED when session is null", async () => {
      const ctx = makeCtx({ session: null });
      await expect(
        invokeMiddleware(Permission.VIEW_TICKETS, ctx),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("throws UNAUTHORIZED when user is null", async () => {
      const ctx = makeCtx({ user: null });
      await expect(
        invokeMiddleware(Permission.VIEW_TICKETS, ctx),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("throws UNAUTHORIZED when org is null", async () => {
      const ctx = makeCtx({ org: null });
      await expect(
        invokeMiddleware(Permission.VIEW_TICKETS, ctx),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });
  });
});
