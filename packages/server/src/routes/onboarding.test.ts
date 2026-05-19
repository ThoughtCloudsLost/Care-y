/**
 * Integration tests for the onboarding tRPC router.
 *
 * Tests bootstrapAdmin (first admin creation), invite generation, and
 * org basics update against a real PostgreSQL database.
 * Requires DATABASE_URL (Docker container).
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  TEST_ORG_PUBLIC_KEY,
  mockReq,
  mockRes,
  expectTrpcError,
  registerMethodDirectly,
  type TestDb,
} from "../test-utils.js";
import { RoleId, TwoFactorMethod } from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createOrgService } from "../org/service.js";
import {
  createOnboardingRouter,
  type OnboardingRouterDeps,
} from "./onboarding.js";
import { createCallerFactory, router } from "../trpc/trpc.js";
import type { Context } from "../trpc/context.js";
import { deriveSecretsKey, createSecretsEncryptor } from "../config/secrets.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);
const TEST_OPS_KEY = Buffer.from(
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe",
  "hex",
);

function makeTenantDbFactory(
  platformDb: Kysely<PlatformDatabase>,
): (schema: string) => Kysely<TenantDatabase> {
  return (schema: string) =>
    platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
}

describe.skipIf(!HAS_DB)("onboarding router (DB integration)", () => {
  let testDb: TestDb;
  let tenantDb: Kysely<TenantDatabase>;
  let orgSlug: string;
  const hasher = createScryptHasher();
  const createdOrgIds: string[] = [];
  const createdSchemas: string[] = [];

  beforeAll(async () => {
    testDb = await createTestDb();
    tenantDb = testDb.db;

    await tenantDb
      .insertInto("org_config")
      .values({ pii_retention_days: null })
      .onConflict((oc) => oc.doNothing())
      .execute();

    const orgService = createOrgService(
      testDb.platformDb,
      makeTenantDbFactory(testDb.platformDb),
    );
    const suffix = randomUUID().slice(0, 8);
    orgSlug = `test-onboard-${suffix}`;
    const org = await orgService.createOrg({ slug: orgSlug });
    createdOrgIds.push(org.id);
    createdSchemas.push(org.schemaName);
  });

  afterAll(async () => {
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

  function buildOnboardingDeps(): OnboardingRouterDeps {
    const orgService = createOrgService(
      testDb.platformDb,
      makeTenantDbFactory(testDb.platformDb),
    );
    const secretsKey = deriveSecretsKey(TEST_OPS_KEY);
    return {
      orgService,
      hasher,
      encryptor: testFieldEncryptor,
      indexer: testBlindIndexer,
      tokenizer: testSessionTokenizer,
      bootstrapLimiter: createInMemoryRateLimiter({
        windowMs: 3600_000,
        maxRequests: 10,
      }),
      isSecureCookie: false,
      tenantDbFactory: makeTenantDbFactory(testDb.platformDb),
      secretsEncryptor: createSecretsEncryptor(secretsKey),
    };
  }

  function buildCaller(orgSlugHeader: string) {
    const deps = buildOnboardingDeps();
    const onboardingRouter = createOnboardingRouter(deps);
    const appRouter = router({ onboarding: onboardingRouter });
    const factory = createCallerFactory(appRouter);
    const res = mockRes();
    const req = mockReq({
      headers: { "x-org-slug": orgSlugHeader },
    });
    const ctx: Context = { req, res, org: null, session: null, user: null };
    return { caller: factory(ctx), res };
  }

  describe("getStatus", () => {
    it("returns needsSetup=true when no users exist", async () => {
      const { caller } = buildCaller(orgSlug);
      const status = await caller.onboarding.getStatus();
      expect(status.needsSetup).toBe(true);
    });
  });

  describe("bootstrapAdmin", () => {
    let freshTestDb: TestDb;
    let freshOrgSlug: string;
    let freshSetupToken: string;

    beforeEach(async () => {
      freshTestDb = await createTestDb();
      const freshTenantDb = freshTestDb.db;
      await freshTenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();

      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      freshOrgSlug = `test-bootstrap-${suffix}`;
      const org = await orgService.createOrg({ slug: freshOrgSlug });
      freshSetupToken = org.setupToken;
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);
    });

    afterEach(async () => {
      await freshTestDb.cleanup();
    });

    it("creates admin user and session when org has 0 users", async () => {
      const { caller, res } = buildCaller(freshOrgSlug);

      const result = await caller.onboarding.bootstrapAdmin({
        identifier: "admin-test",
        password: "securepassword12345",
        displayName: "Test Admin",
        orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
        setupToken: freshSetupToken,
      });

      expect(result.userId).toBeDefined();
      expect(typeof result.userId).toBe("string");

      const cookies = res.getCapturedCookies();
      expect(cookies.length).toBeGreaterThan(0);
      expect(cookies[0]).toContain("care_y_session=");
    });

    it("rejects with consumed setup token after successful bootstrap", async () => {
      const { caller } = buildCaller(freshOrgSlug);

      await caller.onboarding.bootstrapAdmin({
        identifier: "first-admin",
        password: "securepassword12345",
        displayName: "First Admin",
        orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
        setupToken: freshSetupToken,
      });

      await expectTrpcError(
        caller.onboarding.bootstrapAdmin({
          identifier: "second-admin",
          password: "securepassword12345",
          displayName: "Second Admin",
          orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
          setupToken: freshSetupToken,
        }),
        "UNAUTHORIZED",
      );
    });

    it("stores org_public_key in org_config", async () => {
      const { caller } = buildCaller(freshOrgSlug);

      await caller.onboarding.bootstrapAdmin({
        identifier: "admin-key-test",
        password: "securepassword12345",
        displayName: "Key Admin",
        orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
        setupToken: freshSetupToken,
      });

      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const org = await orgService.findBySlug(freshOrgSlug);
      const tDb = freshTestDb.platformDb.withSchema(
        org!.schemaName,
      ) as unknown as Kysely<TenantDatabase>;

      const config = await tDb
        .selectFrom("org_config")
        .select("org_public_key")
        .executeTakeFirst();

      expect(config?.org_public_key).toBeDefined();
      expect(config!.org_public_key!.equals(TEST_ORG_PUBLIC_KEY)).toBe(true);
    });

    it("creates user with admin role", async () => {
      const { caller } = buildCaller(freshOrgSlug);

      const { userId } = await caller.onboarding.bootstrapAdmin({
        identifier: "admin-role-test",
        password: "securepassword12345",
        displayName: "Role Admin",
        orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
        setupToken: freshSetupToken,
      });

      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const org = await orgService.findBySlug(freshOrgSlug);
      const tDb = freshTestDb.platformDb.withSchema(
        org!.schemaName,
      ) as unknown as Kysely<TenantDatabase>;

      const user = await tDb
        .selectFrom("users")
        .select("role_id")
        .where("id", "=", userId)
        .executeTakeFirst();

      expect(user?.role_id).toBe(RoleId.ADMIN);
    });
  });

  describe("reauthenticate", () => {
    let freshTestDb: TestDb;
    let freshOrgSlug: string;
    let freshSetupToken: string;

    beforeEach(async () => {
      freshTestDb = await createTestDb();
      const freshTenantDb = freshTestDb.db;
      await freshTenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();

      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      freshOrgSlug = `test-reauth-${suffix}`;
      const org = await orgService.createOrg({ slug: freshOrgSlug });
      freshSetupToken = org.setupToken;
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);
    });

    afterEach(async () => {
      await freshTestDb.cleanup();
    });

    /** Bootstrap an admin so the org has a public key and a user with valid credentials. */
    async function bootstrapAndGetUserId(slug: string): Promise<string> {
      const { caller } = buildCaller(slug);
      const result = await caller.onboarding.bootstrapAdmin({
        identifier: "reauth-admin",
        password: "reauth-password-long-enough",
        displayName: "Reauth Admin",
        orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
        setupToken: freshSetupToken,
      });
      return result.userId;
    }

    it("returns requiresTwoFactor=false when user has no 2FA methods", async () => {
      await bootstrapAndGetUserId(freshOrgSlug);

      const { caller, res } = buildCaller(freshOrgSlug);
      const result = await caller.onboarding.reauthenticate({
        identifier: "reauth-admin",
        password: "reauth-password-long-enough",
      });

      expect(result.userId).toBeDefined();
      expect(result.requiresTwoFactor).toBe(false);
      expect(result.enrolledMethods).toEqual([]);

      // Session cookie must be set (inline 2FA verification requires it).
      const cookies = res.getCapturedCookies();
      expect(cookies.length).toBeGreaterThan(0);
      expect(cookies[0]).toContain("care_y_session=");
    });

    it("returns requiresTwoFactor=true with enrolled method types when user has 2FA", async () => {
      const userId = await bootstrapAndGetUserId(freshOrgSlug);

      // Insert a TOTP method directly into the tenant DB.
      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const org = await orgService.findBySlug(freshOrgSlug);
      const tDb = freshTestDb.platformDb.withSchema(
        org!.schemaName,
      ) as unknown as Kysely<TenantDatabase>;
      await registerMethodDirectly(tDb, userId, TwoFactorMethod.TOTP);

      const { caller, res } = buildCaller(freshOrgSlug);
      const result = await caller.onboarding.reauthenticate({
        identifier: "reauth-admin",
        password: "reauth-password-long-enough",
      });

      expect(result.userId).toBe(userId);
      expect(result.requiresTwoFactor).toBe(true);
      expect(result.enrolledMethods).toContain(TwoFactorMethod.TOTP);

      // Session cookie must be set even when 2FA is required (the 2FA
      // verify endpoints need the session to identify the user).
      const cookies = res.getCapturedCookies();
      expect(cookies.length).toBeGreaterThan(0);
      expect(cookies[0]).toContain("care_y_session=");
    });
  });
});
