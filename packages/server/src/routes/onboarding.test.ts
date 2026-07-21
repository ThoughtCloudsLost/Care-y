/**
 * Integration tests for the onboarding tRPC router.
 *
 * Tests bootstrapAdmin (first admin creation), invite generation, and
 * org general settings update against a real PostgreSQL database.
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
  createTestUser,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  testUnseal,
  TestSetupError,
  TEST_OPS_KEY,
  TEST_ORG_PUBLIC_KEY,
  mockReq,
  mockRes,
  expectTrpcError,
  registerMethodDirectly,
  type TestDb,
} from "../test-utils.js";
import {
  RoleId,
  TwoFactorMethod,
  ErrorCode,
  type RoleIdValue,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createOrgService } from "../org/service.js";
import { createInviteService } from "../onboarding/invite-service.js";
import {
  createOnboardingRouter,
  type OnboardingRouterDeps,
} from "./onboarding.js";
import { createCallerFactory, router } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { deriveSecretsKey, createSecretsEncryptor } from "../config/secrets.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

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

  interface AuthedOrgInfo {
    readonly orgId: string;
    readonly orgSlug: string;
    readonly orgSchema: string;
    readonly tenantDb: Kysely<TenantDatabase>;
  }

  /**
   * Builds a caller with a resolved org context and an authenticated session,
   * for the authedProcedure endpoints (invite management, setup steps).
   * The sealed box is the committed test keypair, valid for any org whose
   * bootstrap stored TEST_ORG_PUBLIC_KEY.
   */
  function buildAuthedCaller(
    orgInfo: AuthedOrgInfo,
    user: { id: string; roleId: string },
  ) {
    const deps = buildOnboardingDeps();
    const onboardingRouter = createOnboardingRouter(deps);
    const appRouter = router({ onboarding: onboardingRouter });
    const factory = createCallerFactory(appRouter);
    const res = mockRes();
    const req = mockReq({ headers: { "x-org-slug": orgInfo.orgSlug } });
    const orgCtx: OrgContext = {
      orgId: orgInfo.orgId,
      orgSlug: orgInfo.orgSlug,
      orgSchema: orgInfo.orgSchema,
      tenantDb: orgInfo.tenantDb,
      sealedBox: testSealedBox,
    };
    const ctx: Context = {
      req,
      res,
      org: orgCtx,
      session: {
        id: "test-session",
        token: "test-token",
        userId: user.id,
        ipToken: "test-ip",
        uaToken: "test-ua",
        expiresAt: new Date(Date.now() + 3_600_000),
        twofaVerified: true,
        webauthnChallenge: null,
      },
      user: {
        id: user.id,
        encryptedIdentifier: "test-encrypted-identifier",
        encryptedDisplayName: "test-encrypted-display-name",
        encryptedPreferredLocale: null,
        roleId: user.roleId,
        isActive: true,
        hasSeenBriefing: true,
      },
    };
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

  describe("invites", () => {
    let freshTestDb: TestDb;
    let inviteOrg: AuthedOrgInfo;
    let adminUserId: string;
    const adminIdentifier = "invite-admin";

    beforeAll(async () => {
      freshTestDb = await createTestDb();
      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      const slug = `test-invites-${suffix}`;
      const org = await orgService.createOrg({ slug });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);
      inviteOrg = {
        orgId: org.id,
        orgSlug: slug,
        orgSchema: org.schemaName,
        tenantDb: makeTenantDbFactory(freshTestDb.platformDb)(org.schemaName),
      };

      const { caller } = buildCaller(slug);
      const result = await caller.onboarding.bootstrapAdmin({
        identifier: adminIdentifier,
        password: "invite-admin-password-ok",
        displayName: "Invite Admin",
        orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
        setupToken: org.setupToken,
      });
      adminUserId = result.userId;
    }, 60_000);

    afterAll(async () => {
      await freshTestDb.cleanup();
    });

    function adminCaller() {
      return buildAuthedCaller(inviteOrg, {
        id: adminUserId,
        roleId: RoleId.ADMIN,
      });
    }

    /** Generates an invite via the route and resolves its raw token + row id. */
    async function generateInviteToken(roleId: RoleIdValue = RoleId.VOLUNTEER) {
      const { caller } = adminCaller();
      const { inviteUrl, expiresAt } = await caller.onboarding.generateInvite({
        roleId,
      });
      const rawToken = inviteUrl.replace("/first-login/", "");
      const pending = await caller.onboarding.listPendingInvites();
      const entry = pending.find(
        (inv) =>
          inv.encryptedToken !== null &&
          testUnseal(inv.encryptedToken) === rawToken,
      );
      if (!entry) {
        throw new TestSetupError("generated invite not found in pending list");
      }
      return { rawToken, expiresAt, tokenId: entry.id };
    }

    it("generateInvite returns a first-login URL and a sealed token copy", async () => {
      const { caller } = adminCaller();
      const result = await caller.onboarding.generateInvite({
        roleId: RoleId.VOLUNTEER,
      });

      expect(result.inviteUrl.startsWith("/first-login/")).toBe(true);
      const rawToken = result.inviteUrl.replace("/first-login/", "");
      expect(rawToken.length).toBeGreaterThan(0);
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());

      // The sealed copy lets org-key holders recover the invite link later.
      // testUnseal opens it with the committed test org keypair.
      const pending = await caller.onboarding.listPendingInvites();
      const entry = pending.find(
        (inv) =>
          inv.encryptedToken !== null &&
          testUnseal(inv.encryptedToken) === rawToken,
      );
      expect(entry).toBeDefined();
      expect(entry!.roleId).toBe(RoleId.VOLUNTEER);
      expect(entry!.invitedBy).toBe(adminUserId);
    });

    it("rejects invite generation without the manage-roles permission", async () => {
      const { caller } = buildAuthedCaller(inviteOrg, {
        id: randomUUID(),
        roleId: RoleId.VOLUNTEER,
      });

      await expectTrpcError(
        caller.onboarding.generateInvite({ roleId: RoleId.VOLUNTEER }),
        "FORBIDDEN",
      );
    });

    it("validateInvite reports a pending token as valid with its expiry", async () => {
      const { rawToken, expiresAt } = await generateInviteToken();

      const { caller } = buildCaller(inviteOrg.orgSlug);
      const result = await caller.onboarding.validateInvite({
        token: rawToken,
      });

      expect(result).toEqual({ valid: true, expiresAt });
    });

    it("validateInvite returns valid=false for an unknown token", async () => {
      const { caller } = buildCaller(inviteOrg.orgSlug);
      const result = await caller.onboarding.validateInvite({
        token: "not-a-real-invite-token",
      });

      expect(result).toEqual({ valid: false });
    });

    it("revoked invites stop validating and cannot be revoked twice", async () => {
      const { rawToken, tokenId } = await generateInviteToken();
      const { caller: admin } = adminCaller();

      const revoked = await admin.onboarding.revokeInvite({ tokenId });
      expect(revoked).toEqual({ success: true });

      const { caller } = buildCaller(inviteOrg.orgSlug);
      const result = await caller.onboarding.validateInvite({
        token: rawToken,
      });
      expect(result).toEqual({ valid: false });

      await expectTrpcError(
        admin.onboarding.revokeInvite({ tokenId }),
        "NOT_FOUND",
      );
    });

    it("validateInvite returns valid=false for an expired token", async () => {
      const { rawToken, tokenId } = await generateInviteToken();
      await inviteOrg.tenantDb
        .updateTable("invite_tokens")
        .set({ expires_at: new Date(Date.now() - 60_000) })
        .where("id", "=", tokenId)
        .execute();

      const { caller } = buildCaller(inviteOrg.orgSlug);
      const result = await caller.onboarding.validateInvite({
        token: rawToken,
      });

      expect(result).toEqual({ valid: false });
    });

    it("registerFromInvite creates the user at the invited role with sealed PII", async () => {
      const { rawToken, tokenId } = await generateInviteToken(RoleId.MANAGER);

      const { caller, res } = buildCaller(inviteOrg.orgSlug);
      const { userId } = await caller.onboarding.registerFromInvite({
        token: rawToken,
        identifier: "invited-manager",
        password: "invited-manager-password",
        displayName: "Invited Manager",
      });

      const cookies = res.getCapturedCookies();
      expect(cookies.length).toBeGreaterThan(0);
      expect(cookies[0]).toContain("care_y_session=");

      const row = await inviteOrg.tenantDb
        .selectFrom("users")
        .selectAll()
        .where("id", "=", userId)
        .executeTakeFirstOrThrow();

      // Role comes from the invite, never from client input
      expect(row.role_id).toBe(RoleId.MANAGER);
      // Invited users have the briefing marked seen during registration
      expect(row.has_seen_briefing).toBe(true);

      // ADR-052 crypto pipeline: identifier and display name are stored as
      // org-key sealed boxes (server-blind); login lookup uses the blind index.
      expect(row.encrypted_identifier.toString("utf-8")).not.toContain(
        "invited-manager",
      );
      expect(testUnseal(row.encrypted_identifier)).toBe("invited-manager");
      expect(testUnseal(row.encrypted_display_name)).toBe("Invited Manager");
      expect(row.identifier_hash).toBe(
        testBlindIndexer.hash("invited-manager", inviteOrg.orgId),
      );

      // The invite is consumed exactly once
      const invite = await inviteOrg.tenantDb
        .selectFrom("invite_tokens")
        .select("consumed_at")
        .where("id", "=", tokenId)
        .executeTakeFirstOrThrow();
      expect(invite.consumed_at).not.toBeNull();
    });

    it("registerFromInvite rejects a consumed token (invites are single-use)", async () => {
      const { rawToken } = await generateInviteToken();

      const first = buildCaller(inviteOrg.orgSlug);
      await first.caller.onboarding.registerFromInvite({
        token: rawToken,
        identifier: "first-invitee",
        password: "first-invitee-password-ok",
      });

      // ErrorCode strings are the typed wire contract for client error copy.
      const second = buildCaller(inviteOrg.orgSlug);
      await expectTrpcError(
        second.caller.onboarding.registerFromInvite({
          token: rawToken,
          identifier: "second-invitee",
          password: "second-invitee-password",
        }),
        "BAD_REQUEST",
        ErrorCode.INVALID_INVITE_TOKEN,
      );
    });

    it("registerFromInvite leaves the invite unconsumed when the identifier conflicts", async () => {
      const { rawToken } = await generateInviteToken();

      const { caller } = buildCaller(inviteOrg.orgSlug);
      await expectTrpcError(
        caller.onboarding.registerFromInvite({
          token: rawToken,
          identifier: adminIdentifier,
          password: "conflicting-password-ok1",
        }),
        "CONFLICT",
      );

      // The registration transaction rolled back, so the invite is still usable
      const revalidated = await buildCaller(
        inviteOrg.orgSlug,
      ).caller.onboarding.validateInvite({ token: rawToken });
      expect(revalidated.valid).toBe(true);
    });

    it("registerFromInvite fails while the org keypair is missing", async () => {
      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      const slug = `test-nokey-${suffix}`;
      const bare = await orgService.createOrg({ slug });
      createdOrgIds.push(bare.id);
      createdSchemas.push(bare.schemaName);
      const bareTenantDb = makeTenantDbFactory(freshTestDb.platformDb)(
        bare.schemaName,
      );

      // Generate the invite at the service level: route-side generation needs
      // an authed org context, which cannot exist before the keypair upload.
      const inviter = await createTestUser(bareTenantDb, {
        overrides: { role_id: RoleId.ADMIN },
      });
      const inviteService = createInviteService(bareTenantDb);
      const { rawToken } = await inviteService.generate({
        invitedBy: inviter.id,
        roleId: RoleId.VOLUNTEER,
      });

      const { caller } = buildCaller(slug);
      await expectTrpcError(
        caller.onboarding.registerFromInvite({
          token: rawToken,
          identifier: "unprovisioned-volunteer",
          password: "unprovisioned-volunteer-pw1",
        }),
        "PRECONDITION_FAILED",
      );
    }, 30_000);
  });

  describe("setup steps", () => {
    let freshTestDb: TestDb;
    let setupOrg: AuthedOrgInfo;
    let adminUserId: string;

    beforeAll(async () => {
      freshTestDb = await createTestDb();
      const orgService = createOrgService(
        freshTestDb.platformDb,
        makeTenantDbFactory(freshTestDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      const slug = `test-setup-${suffix}`;
      const org = await orgService.createOrg({ slug });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);
      setupOrg = {
        orgId: org.id,
        orgSlug: slug,
        orgSchema: org.schemaName,
        tenantDb: makeTenantDbFactory(freshTestDb.platformDb)(org.schemaName),
      };

      const { caller } = buildCaller(slug);
      const result = await caller.onboarding.bootstrapAdmin({
        identifier: "setup-admin",
        password: "setup-admin-password-ok",
        displayName: "Setup Admin",
        orgPublicKey: encode(TEST_ORG_PUBLIC_KEY),
        setupToken: org.setupToken,
      });
      adminUserId = result.userId;
    }, 60_000);

    afterAll(async () => {
      await freshTestDb.cleanup();
    });

    function adminCaller() {
      return buildAuthedCaller(setupOrg, {
        id: adminUserId,
        roleId: RoleId.ADMIN,
      });
    }

    it("updateOrgGeneral stores the encrypted org name verbatim with locale defaults", async () => {
      const encryptedName = Buffer.from("sealed-org-name-blob-01");
      const { caller } = adminCaller();

      const result = await caller.onboarding.updateOrgGeneral({
        encryptedOrgName: encryptedName.toString("base64"),
        countryCode: "+49",
        defaultLanguage: "de",
      });
      expect(result).toEqual({ success: true });

      const config = await setupOrg.tenantDb
        .selectFrom("org_config")
        .select(["encrypted_name", "default_country_code", "default_language"])
        .executeTakeFirstOrThrow();
      // The org name blob is client-encrypted; the server stores it untouched
      expect(config.encrypted_name?.equals(encryptedName)).toBe(true);
      expect(config.default_country_code).toBe("+49");
      expect(config.default_language).toBe("de");
    });

    it("saveTelephonyChoice stores credentials only in encrypted form", async () => {
      const { caller } = adminCaller();

      const result = await caller.onboarding.saveTelephonyChoice({
        mode: "byot",
        accountSid: "ACtest00000000000000000000000000",
        authToken: "synthetic-test-auth-token-value",
      });
      expect(result).toEqual({ success: true, mode: "byot" });

      const config = await setupOrg.tenantDb
        .selectFrom("org_config")
        .select("setup_telephony_config")
        .executeTakeFirstOrThrow();
      expect(config.setup_telephony_config).not.toBeNull();
      // OPS-tier secrets: the stored blob must not contain the plaintext token
      expect(
        config.setup_telephony_config!.includes(
          Buffer.from("synthetic-test-auth-token-value"),
        ),
      ).toBe(false);
    });

    it("markBriefingSeen flips the user's briefing flag", async () => {
      const before = await setupOrg.tenantDb
        .selectFrom("users")
        .select("has_seen_briefing")
        .where("id", "=", adminUserId)
        .executeTakeFirstOrThrow();
      expect(before.has_seen_briefing).toBe(false);

      const { caller } = adminCaller();
      const result = await caller.onboarding.markBriefingSeen();
      expect(result).toEqual({ success: true });

      const after = await setupOrg.tenantDb
        .selectFrom("users")
        .select("has_seen_briefing")
        .where("id", "=", adminUserId)
        .executeTakeFirstOrThrow();
      expect(after.has_seen_briefing).toBe(true);
    });

    it("completeSetup flips getStatus.needsSetup off", async () => {
      const before = await buildCaller(
        setupOrg.orgSlug,
      ).caller.onboarding.getStatus();
      expect(before.needsSetup).toBe(true);

      const { caller } = adminCaller();
      const result = await caller.onboarding.completeSetup();
      expect(result).toEqual({ success: true });

      const after = await buildCaller(
        setupOrg.orgSlug,
      ).caller.onboarding.getStatus();
      expect(after.needsSetup).toBe(false);
    });
  });
});
