/**
 * Integration tests for auth and org tRPC routers.
 *
 * Uses a real PostgreSQL database (via createTestDb) to test the full
 * tRPC procedure chain: middleware -> service -> repository -> DB.
 * Requires DATABASE_URL (runs inside Docker container).
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  seedOrgPublicKey,
  TEST_ORG_ID,
  mockReq,
  mockRes,
  expectTrpcError,
  createMockEmailSender,
  createMockOprfDeps,
  createMockProviderFactory,
  type TestDb,
} from "../test-utils.js";
import { RoleId } from "@care-y/shared";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createAuthService } from "../auth/service.js";
import { createOrgService } from "../org/service.js";
import { createAppRouter } from "./router.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

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
  const sessions = createDbSessionRepository(
    tenantDb,
    testSessionTokenizer,
    testSealedBox,
  );
  return createAuthService(
    tenantDb,
    createScryptHasher(),
    sessions,
    testFieldEncryptor,
    testBlindIndexer,
    testSessionTokenizer,
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

    // Seed org_config row + public key (createTestDb runs migrations but
    // doesn't insert application data).
    await tenantDb
      .insertInto("org_config")
      .values({ pii_retention_days: null })
      .onConflict((oc) => oc.doNothing())
      .execute();
    await seedOrgPublicKey(tenantDb);

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
      sealedBox: testSealedBox,
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

  // Deterministic fake-salt key for test use (32 bytes, all zeros is fine for tests).
  const testFakeSaltKey = Buffer.alloc(32, 0);
  const testSaltLimiter = createInMemoryRateLimiter({
    windowMs: 60_000,
    maxRequests: 20,
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
        saltLimiter: testSaltLimiter,
        fakeSaltKey: testFakeSaltKey,
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        tokenizer: testSessionTokenizer,
        isSecureCookie: false,
        emailSender: createMockEmailSender(),
        providerFactory: createMockProviderFactory(),
        resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
      },
      twoFactorDeps: {
        emailSender: createMockEmailSender(),
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        tokenizer: testSessionTokenizer,
        providerFactory: createMockProviderFactory(),
        resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
        pushSender: null,
        pushHmacKey: null,
      },
      oprfDeps: createMockOprfDeps(),
      orgService,
      providerFactory: createMockProviderFactory(),
    });
  }

  /** Shared wiring: builds router, factory, req/res, and returns a caller. */
  function buildCaller(
    ctx: Context,
    limiter?: ReturnType<typeof createInMemoryRateLimiter>,
  ) {
    const appRouter = buildRouter(limiter);
    const factory = createCallerFactory(appRouter);
    return factory(ctx);
  }

  function createTestCaller(overrides?: {
    org?: OrgContext | null;
    limiter?: ReturnType<typeof createInMemoryRateLimiter>;
    headers?: Record<string, string | undefined>;
  }) {
    const res = mockRes();
    const req = mockReq(
      overrides?.headers ? { headers: overrides.headers } : undefined,
    );
    const ctx: Context = {
      req,
      res,
      org: overrides?.org === undefined ? orgContext : overrides.org,
      session: null,
      user: null,
    };
    return { caller: buildCaller(ctx, overrides?.limiter), res };
  }

  function createAuthedCaller(
    user: {
      id: string;
      identifier: string;
      encryptedDisplayName: string;
      roleId: string;
      isActive: boolean;
    },
    sessionToken: string,
  ) {
    const res = mockRes();
    const ctx: Context = {
      req: mockReq(),
      res,
      org: orgContext,
      session: {
        id: "test-session-id",
        token: sessionToken,
        userId: user.id,
        ipToken: "test-ip-token",
        uaToken: "test-ua-token",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        twofaVerified: false,
        webauthnChallenge: null,
      },
      user,
    };
    return { caller: buildCaller(ctx), res };
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
    await expectTrpcError(
      caller.auth.register({
        identifier: "newuser",
        password: "a-very-long-password-16",
        displayName: "New User",
        roleId: RoleId.VOLUNTEER,
      }),
      "UNAUTHORIZED",
      "Not authenticated",
    );
  });

  it("auth.register creates user when called by authenticated user", async () => {
    const authService = makeAuthService(tenantDb);
    const admin = await authService.register({
      identifier: "admin-bootstrap",
      password: "admin-password-long-enough",
      displayName: "Admin Bootstrap",
      roleId: RoleId.ADMIN,
    });

    const { caller } = createAuthedCaller(admin, "admin-token");
    const result = await caller.auth.register({
      identifier: "invited-user",
      password: "invited-password-long-enough",
      displayName: "Invited User",
      roleId: RoleId.VOLUNTEER,
    });

    expect(result.user.identifier).toBe("invited-user");
    expect(result.user.encryptedDisplayName).toBeDefined();
    expect(result.user.roleId).toBe(RoleId.VOLUNTEER);
  });

  // --- Auth: login ---

  it("auth.login returns user and sets cookie", async () => {
    const authService = makeAuthService(tenantDb, orgContext.orgId);
    await authService.register({
      identifier: "loginuser",
      password: "login-password-long-enough",
      displayName: "Login User",
      roleId: RoleId.VOLUNTEER,
    });

    loginLimiter.reset("127.0.0.1");
    const { caller, res } = createTestCaller();
    const result = await caller.auth.login({
      identifier: "loginuser",
      password: "login-password-long-enough",
    });

    expect(result.user.identifier).toBe("loginuser");
    expect(result.user.encryptedDisplayName).toBeDefined();
    expect(result.requiresTwoFactor).toBe(false);
    expect(result.enrolledMethods).toEqual([]);

    // Wire contract: cookie name is read by the client and must not change without a coordinated client update. HttpOnly + SameSite=Strict are security requirements (SEC-042).
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
    await expectTrpcError(
      caller.auth.login({
        identifier: "loginuser",
        password: "login-password-long-enough",
      }),
      "NOT_FOUND",
      "Organization not found",
    );
  });

  // --- Auth: logout ---

  it("auth.logout clears session cookie", async () => {
    const authService = makeAuthService(tenantDb);
    await authService.register({
      identifier: "logoutuser",
      password: "logout-password-long-enough",
      displayName: "Logout User",
      roleId: RoleId.VOLUNTEER,
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
      roleId: RoleId.VOLUNTEER,
    });

    const { caller } = createAuthedCaller(user, "me-token");
    const result = await caller.auth.me();

    expect(result.user.identifier).toBe("meuser");
    expect(result.user.encryptedDisplayName).toBeDefined();
    expect(result.user.roleId).toBe(RoleId.VOLUNTEER);
  });

  it("auth.me rejects unauthenticated caller", async () => {
    const { caller } = createTestCaller();
    await expectTrpcError(
      caller.auth.me(),
      "UNAUTHORIZED",
      "Not authenticated",
    );
  });

  // --- extractClientIp branches ---

  it("auth.login uses x-forwarded-for header for client IP", async () => {
    const authService = makeAuthService(tenantDb, orgContext.orgId);
    await authService.register({
      identifier: "xff-user",
      password: "xff-password-long-enough",
      displayName: "XFF User",
      roleId: RoleId.VOLUNTEER,
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
      roleId: RoleId.ADMIN,
    });

    const { caller } = createAuthedCaller(admin, "dup-admin-token");

    // First registration succeeds
    await caller.auth.register({
      identifier: "dup-target",
      password: "dup-target-password-long-enough",
      displayName: "First",
      roleId: RoleId.VOLUNTEER,
    });

    // Second registration with same identifier fails through throwAsTrpc
    const { caller: caller2 } = createAuthedCaller(admin, "dup-admin-token");
    await expectTrpcError(
      caller2.auth.register({
        identifier: "dup-target",
        password: "dup-target-password-long-enough",
        displayName: "Second",
        roleId: RoleId.VOLUNTEER,
      }),
      "CONFLICT",
    );
  });

  // --- Branch coverage: user-agent fallback ---

  it("auth.login uses 'unknown' when user-agent header is missing", async () => {
    const authService = makeAuthService(tenantDb, orgContext.orgId);
    await authService.register({
      identifier: "no-ua-user",
      password: "no-ua-password-long-enough",
      displayName: "No UA User",
      roleId: RoleId.VOLUNTEER,
    });

    loginLimiter.reset("127.0.0.1");

    // Override user-agent to undefined to exercise the ?? "unknown" fallback.
    const { caller } = createTestCaller({
      headers: { "user-agent": undefined },
    });

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
      roleId: RoleId.ADMIN,
    });

    const { caller } = createAuthedCaller(admin, "email-admin-token");
    const result = await caller.auth.register({
      identifier: "email-user",
      password: "email-user-password-long-enough",
      displayName: "Email User",
      notificationEmail: "user@example.com",
      roleId: RoleId.VOLUNTEER,
    });

    expect(result.user.identifier).toBe("email-user");
    expect(result.user.encryptedDisplayName).toBeDefined();
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
    await expectTrpcError(
      tryLogin(),
      "TOO_MANY_REQUESTS",
      "Too many login attempts",
    );
  });
});
