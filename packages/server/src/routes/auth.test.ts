/**
 * Integration tests for auth and org tRPC routers.
 *
 * Uses a real PostgreSQL database (via createTestDb) to test the full
 * tRPC procedure chain: middleware -> service -> repository -> DB.
 * Requires DATABASE_URL (runs inside Docker container).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { sql, type Kysely } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  testFieldEncryptor,
  testBlindIndexer,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createAuthService } from "../auth/service.js";
import { createOrgService } from "../org/service.js";
import { createAppRouter } from "./router.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

/** Builds a minimal mock IncomingMessage for tRPC context. */
function mockReq(headers?: Record<string, string>): IncomingMessage {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", {
    value: "127.0.0.1",
    writable: true,
  });

  const req = Object.create(IncomingMessage.prototype) as IncomingMessage;
  Object.defineProperty(req, "socket", { value: socket, writable: false });
  Object.defineProperty(req, "headers", {
    value: { "user-agent": "test-agent", ...headers },
    writable: true,
  });

  return req;
}

/** Builds a minimal mock ServerResponse that captures Set-Cookie headers. */
function mockRes(): ServerResponse & { getCapturedCookies: () => string[] } {
  const cookies: string[] = [];
  const res = Object.create(ServerResponse.prototype) as ServerResponse;

  res.setHeader = ((name: string, value: string | string[]): ServerResponse => {
    if (name.toLowerCase() === "set-cookie") {
      if (Array.isArray(value)) {
        cookies.push(...value);
      } else {
        cookies.push(value);
      }
    }
    return res;
  }) as ServerResponse["setHeader"];

  return Object.assign(res, {
    getCapturedCookies(): string[] {
      return cookies;
    },
  });
}

function makeTenantDbFactory(
  platformDb: Kysely<PlatformDatabase>,
): (schema: string) => Kysely<TenantDatabase> {
  return (schema: string) =>
    platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
}

/** Creates AuthService scoped to the test tenant DB. */
function makeAuthService(
  tenantDb: Kysely<TenantDatabase>,
  orgId: string = TEST_ORG_ID,
): ReturnType<typeof createAuthService> {
  const sessions = createDbSessionRepository(tenantDb, testFieldEncryptor);
  return createAuthService(
    tenantDb,
    createScryptHasher(),
    sessions,
    testFieldEncryptor,
    testBlindIndexer,
    orgId,
  );
}

describe.skipIf(!HAS_DB)("auth + org routers (DB integration)", () => {
  let testDb: TestDb;
  let tenantDb: Kysely<TenantDatabase>;
  const hasher = createScryptHasher();
  const loginLimiter = createInMemoryRateLimiter({
    windowMs: 60_000,
    maxRequests: 5,
  });

  let orgContext: OrgContext;
  const createdOrgIds: string[] = [];
  const createdSchemas: string[] = [];

  beforeAll(async () => {
    testDb = await createTestDb();
    tenantDb = testDb.db;

    const orgService = createOrgService(
      testDb.platformDb,
      makeTenantDbFactory(testDb.platformDb),
    );
    const suffix = randomUUID().slice(0, 8);
    const org = await orgService.createOrg({ slug: `test-auth-${suffix}` });
    createdOrgIds.push(org.id);
    createdSchemas.push(org.schemaName);

    orgContext = {
      orgId: org.id,
      orgSlug: org.slug,
      orgSchema: testDb.schemaName,
      tenantDb,
    };
  });

  afterAll(async () => {
    // Drop schemas created by org.create tests, then remove org rows.
    for (const schema of createdSchemas) {
      await sql`DROP SCHEMA IF EXISTS ${sql.id(schema)} CASCADE`.execute(
        testDb.platformDb,
      );
    }
    for (const id of createdOrgIds) {
      await testDb.platformDb.deleteFrom("orgs").where("id", "=", id).execute();
    }
    await testDb.cleanup();
  });

  function buildRouter(limiter?: ReturnType<typeof createInMemoryRateLimiter>) {
    const orgService = createOrgService(
      testDb.platformDb,
      makeTenantDbFactory(testDb.platformDb),
    );
    return createAppRouter({
      authDeps: {
        hasher,
        loginLimiter: limiter ?? loginLimiter,
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        isSecureCookie: false,
      },
      orgService,
    });
  }

  function createTestCaller(overrides?: {
    org?: OrgContext | null;
    limiter?: ReturnType<typeof createInMemoryRateLimiter>;
    headers?: Record<string, string>;
  }) {
    const res = mockRes();
    const req = mockReq(overrides?.headers);
    const appRouter = buildRouter(overrides?.limiter);
    const factory = createCallerFactory(appRouter);
    const ctx: Context = {
      req,
      res,
      org: overrides?.org === undefined ? orgContext : overrides.org,
      session: null,
      user: null,
    };
    return { caller: factory(ctx), res };
  }

  function createAuthedCaller(
    user: {
      id: string;
      identifier: string;
      displayName: string;
      roleId: string;
      isActive: boolean;
      createdAt: Date;
    },
    sessionToken: string,
  ) {
    const res = mockRes();
    const req = mockReq();
    const appRouter = buildRouter();
    const factory = createCallerFactory(appRouter);
    const ctx: Context = {
      req,
      res,
      org: orgContext,
      session: {
        id: "test-session-id",
        token: sessionToken,
        userId: user.id,
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        createdAt: new Date(),
      },
      user,
    };
    return { caller: factory(ctx), res };
  }

  // --- Health ---

  it("health returns ok", async () => {
    const { caller } = createTestCaller({ org: null });
    const result = await caller.health();
    expect(result).toEqual({ status: "ok" });
  });

  // --- Org ---

  it("org.create succeeds with valid slug", async () => {
    const slug = `new-org-${randomUUID().slice(0, 8)}`;
    const { caller } = createTestCaller({ org: null });
    const result = await caller.org.create({ slug });
    createdOrgIds.push(result.org.id);
    createdSchemas.push(`org_${result.org.id}`);
    expect(result.org.slug).toBe(slug);
    expect(result.org.id).toBeTruthy();
  });

  it("org.create rejects reserved slug", async () => {
    const { caller } = createTestCaller({ org: null });
    await expect(caller.org.create({ slug: "admin" })).rejects.toThrow();
  });

  it("org.create rejects duplicate slug", async () => {
    const slug = `dup-org-${randomUUID().slice(0, 8)}`;
    const { caller } = createTestCaller({ org: null });
    const first = await caller.org.create({ slug });
    createdOrgIds.push(first.org.id);
    createdSchemas.push(`org_${first.org.id}`);
    await expect(caller.org.create({ slug })).rejects.toThrow();
  });

  // --- Auth: register (requires auth) ---

  it("auth.register rejects unauthenticated caller", async () => {
    const { caller } = createTestCaller();
    await expect(
      caller.auth.register({
        identifier: "newuser",
        password: "a-very-long-password-16",
        displayName: "New User",
        roleId: "volunteer",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  it("auth.register creates user when called by authenticated user", async () => {
    const authService = makeAuthService(tenantDb);
    const admin = await authService.register({
      identifier: "admin-bootstrap",
      password: "admin-password-long-enough",
      displayName: "Admin Bootstrap",
      roleId: "admin",
    });

    const { caller } = createAuthedCaller(admin, "admin-token");
    const result = await caller.auth.register({
      identifier: "invited-user",
      password: "invited-password-long-enough",
      displayName: "Invited User",
      roleId: "volunteer",
    });

    expect(result.user.identifier).toBe("invited-user");
    expect(result.user.displayName).toBe("Invited User");
    expect(result.user.roleId).toBe("volunteer");
  });

  // --- Auth: login ---

  it("auth.login returns user and sets cookie", async () => {
    const authService = makeAuthService(tenantDb, orgContext.orgId);
    await authService.register({
      identifier: "loginuser",
      password: "login-password-long-enough",
      displayName: "Login User",
      roleId: "volunteer",
    });

    loginLimiter.reset("127.0.0.1");
    const { caller, res } = createTestCaller();
    const result = await caller.auth.login({
      identifier: "loginuser",
      password: "login-password-long-enough",
    });

    expect(result.user.identifier).toBe("loginuser");
    expect(result.user.displayName).toBe("Login User");

    const cookies = res.getCapturedCookies();
    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies[0]).toContain("care_y_session=");
    expect(cookies[0]).toContain("HttpOnly");
    expect(cookies[0]).toContain("SameSite=Strict");
  });

  it("auth.login rejects bad credentials", async () => {
    loginLimiter.reset("127.0.0.1");
    const { caller } = createTestCaller();
    await expect(
      caller.auth.login({
        identifier: "loginuser",
        password: "wrong-password-long-enough",
      }),
    ).rejects.toThrow();
  });

  it("auth.login rejects when org is not resolved", async () => {
    const { caller } = createTestCaller({ org: null });
    await expect(
      caller.auth.login({
        identifier: "loginuser",
        password: "login-password-long-enough",
      }),
    ).rejects.toThrow("Organization not found");
  });

  // --- Auth: logout ---

  it("auth.logout clears session cookie", async () => {
    const authService = makeAuthService(tenantDb);
    await authService.register({
      identifier: "logoutuser",
      password: "logout-password-long-enough",
      displayName: "Logout User",
      roleId: "volunteer",
    });

    const loginResult = await authService.login({
      identifier: "logoutuser",
      password: "logout-password-long-enough",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });

    const { caller, res } = createAuthedCaller(
      loginResult.user,
      loginResult.session.token,
    );

    const result = await caller.auth.logout();
    expect(result.success).toBe(true);

    const cookies = res.getCapturedCookies();
    expect(cookies.some((c) => c.includes("Max-Age=0"))).toBe(true);
  });

  // --- Auth: me ---

  it("auth.me returns current user", async () => {
    const authService = makeAuthService(tenantDb);
    const user = await authService.register({
      identifier: "meuser",
      password: "me-password-long-enough-16",
      displayName: "Me User",
      roleId: "volunteer",
    });

    const { caller } = createAuthedCaller(user, "me-token");
    const result = await caller.auth.me();

    expect(result.user.identifier).toBe("meuser");
    expect(result.user.displayName).toBe("Me User");
    expect(result.user.roleId).toBe("volunteer");
  });

  it("auth.me rejects unauthenticated caller", async () => {
    const { caller } = createTestCaller();
    await expect(caller.auth.me()).rejects.toThrow("Not authenticated");
  });

  // --- extractClientIp branches ---

  it("auth.login uses x-forwarded-for header for client IP", async () => {
    const authService = makeAuthService(tenantDb, orgContext.orgId);
    await authService.register({
      identifier: "xff-user",
      password: "xff-password-long-enough",
      displayName: "XFF User",
      roleId: "volunteer",
    });

    const isolatedLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 5,
    });
    const { caller } = createTestCaller({
      limiter: isolatedLimiter,
      headers: { "x-forwarded-for": "203.0.113.42, 10.0.0.1" },
    });

    const result = await caller.auth.login({
      identifier: "xff-user",
      password: "xff-password-long-enough",
    });
    expect(result.user.identifier).toBe("xff-user");
  });

  // --- register error path (throwAsTrpc on duplicate identifier) ---

  it("auth.register throws on duplicate identifier via route", async () => {
    const authService = makeAuthService(tenantDb);
    const admin = await authService.register({
      identifier: "dup-admin",
      password: "dup-admin-password-long-enough",
      displayName: "Dup Admin",
      roleId: "admin",
    });

    const { caller } = createAuthedCaller(admin, "dup-admin-token");

    // First registration succeeds
    await caller.auth.register({
      identifier: "dup-target",
      password: "dup-target-password-long-enough",
      displayName: "First",
      roleId: "volunteer",
    });

    // Second registration with same identifier fails through throwAsTrpc
    const { caller: caller2 } = createAuthedCaller(admin, "dup-admin-token");
    await expect(
      caller2.auth.register({
        identifier: "dup-target",
        password: "dup-target-password-long-enough",
        displayName: "Second",
        roleId: "volunteer",
      }),
    ).rejects.toThrow("already exists");
  });

  // --- Branch coverage: user-agent fallback ---

  it("auth.login uses 'unknown' when user-agent header is missing", async () => {
    const authService = makeAuthService(tenantDb, orgContext.orgId);
    await authService.register({
      identifier: "no-ua-user",
      password: "no-ua-password-long-enough",
      displayName: "No UA User",
      roleId: "volunteer",
    });

    loginLimiter.reset("127.0.0.1");

    // Build caller with no user-agent header to exercise ?? "unknown"
    const res = mockRes();
    const socket = new Socket();
    Object.defineProperty(socket, "remoteAddress", {
      value: "127.0.0.1",
      writable: true,
    });
    const req = Object.create(IncomingMessage.prototype) as IncomingMessage;
    Object.defineProperty(req, "socket", { value: socket, writable: false });
    Object.defineProperty(req, "headers", { value: {}, writable: true });

    const appRouter = buildRouter();
    const factory = createCallerFactory(appRouter);
    const ctx: Context = {
      req,
      res,
      org: orgContext,
      session: null,
      user: null,
    };
    const caller = factory(ctx);

    const result = await caller.auth.login({
      identifier: "no-ua-user",
      password: "no-ua-password-long-enough",
    });
    expect(result.user.identifier).toBe("no-ua-user");
  });

  // --- Branch coverage: register with notificationEmail ---

  it("auth.register passes notificationEmail when provided", async () => {
    const authService = makeAuthService(tenantDb);
    const admin = await authService.register({
      identifier: "email-admin",
      password: "email-admin-password-long-enough",
      displayName: "Email Admin",
      roleId: "admin",
    });

    const { caller } = createAuthedCaller(admin, "email-admin-token");
    const result = await caller.auth.register({
      identifier: "email-user",
      password: "email-user-password-long-enough",
      displayName: "Email User",
      notificationEmail: "user@example.com",
      roleId: "volunteer",
    });

    expect(result.user.identifier).toBe("email-user");
    expect(result.user.displayName).toBe("Email User");
  });

  // --- Rate limiting ---

  it("auth.login rate-limits after max attempts", async () => {
    const isolatedLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 2,
    });

    async function tryLogin(): Promise<void> {
      const { caller } = createTestCaller({ limiter: isolatedLimiter });
      await caller.auth.login({
        identifier: "nonexistent-rate-user",
        password: "wrong-password-long-enough",
      });
    }

    // First two attempts fail with auth error (not rate limit).
    await expect(tryLogin()).rejects.toThrow();
    await expect(tryLogin()).rejects.toThrow();

    // Third attempt hits rate limit.
    try {
      await tryLogin();
      expect.fail("Should have thrown");
    } catch (err: unknown) {
      expect(err).toBeDefined();
      const error = err as { message?: string };
      expect(error.message).toContain("Too many login attempts");
    }
  });
});
