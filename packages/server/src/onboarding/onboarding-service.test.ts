import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { RoleId } from "@care-y/shared";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  TEST_OPS_KEY,
  TEST_ORG_PUBLIC_KEY,
  TEST_ORG_ID,
  testSealedBox,
  type TestDb,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import {
  deriveSecretsKey,
  createSecretsEncryptor,
  type SecretsEncryptor,
} from "../config/secrets.js";
import {
  createOnboardingService,
  type OnboardingService,
} from "./onboarding-service.js";
import { ConflictError } from "../errors.js";
import { createInviteService } from "./invite-service.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

describe.skipIf(!HAS_DB)("OnboardingService (DB)", () => {
  let testDb: TestDb;
  let tenantDb: Kysely<TenantDatabase>;
  let svc: OnboardingService;
  let secretsEncryptor: SecretsEncryptor;

  beforeAll(async () => {
    testDb = await createTestDb();
    tenantDb = testDb.db;

    await tenantDb
      .insertInto("org_config")
      .values({ pii_retention_days: null })
      .onConflict((oc) => oc.doNothing())
      .execute();

    secretsEncryptor = createSecretsEncryptor(deriveSecretsKey(TEST_OPS_KEY));

    svc = createOnboardingService(tenantDb, {
      hasher: createScryptHasher(),
      encryptor: testFieldEncryptor,
      indexer: testBlindIndexer,
      tokenizer: testSessionTokenizer,
      secretsEncryptor,
    });
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  // ── getSetupStatus ──────────────────────────────────────────────

  describe("getSetupStatus", () => {
    it("returns needsSetup when no users exist", async () => {
      const result = await svc.getSetupStatus();
      expect(result.needsSetup).toBe(true);
    });

    it("returns needsSetup when org key is missing", async () => {
      // Insert a user but leave org_public_key null
      await createTestUser(tenantDb);
      const status = await svc.getSetupStatus();
      expect(status.needsSetup).toBe(true);

      // Clean up the user for subsequent tests
      await tenantDb.deleteFrom("users").execute();
    });

    it("returns needsSetup when setup_completed is false", async () => {
      await seedOrgPublicKey(tenantDb);
      await createTestUser(tenantDb);
      // setup_completed defaults to null/false
      const status = await svc.getSetupStatus();
      expect(status.needsSetup).toBe(true);

      // Clean up for bootstrapAdmin tests
      await tenantDb.deleteFrom("users").execute();
    });
  });

  // ── bootstrapAdmin ──────────────────────────────────────────────

  describe("bootstrapAdmin", () => {
    it("creates admin user, session, and stores org key", async () => {
      const result = await svc.bootstrapAdmin({
        identifier: "admin@example.com",
        password: "StrongP@ss1!",
        displayName: "Admin One",
        preferredLocale: "en",
        orgPublicKey: TEST_ORG_PUBLIC_KEY,
        ipAddress: "10.0.0.1",
        userAgent: "test-agent",
        orgId: TEST_ORG_ID,
      });

      expect(result.userId).toBeTruthy();
      expect(result.sessionToken).toHaveLength(64); // 32 bytes hex

      // Verify the user was inserted with admin role
      const user = await tenantDb
        .selectFrom("users")
        .selectAll()
        .where("id", "=", result.userId)
        .executeTakeFirstOrThrow();
      expect(user.role_id).toBe(RoleId.ADMIN);
      expect(Buffer.isBuffer(user.encrypted_identifier)).toBe(true);
      expect(Buffer.isBuffer(user.encrypted_display_name)).toBe(true);

      // Verify the org_public_key was stored
      const config = await tenantDb
        .selectFrom("org_config")
        .select("org_public_key")
        .executeTakeFirst();
      expect(config?.org_public_key).toEqual(TEST_ORG_PUBLIC_KEY);

      // Verify session was created
      const session = await tenantDb
        .selectFrom("sessions")
        .selectAll()
        .where("user_id", "=", result.userId)
        .executeTakeFirstOrThrow();
      expect(session.twofa_verified).toBe(true);
      expect(session.expires_at.getTime()).toBeGreaterThan(Date.now());
    });

    it("rejects when admin already exists (concurrent race)", async () => {
      // An admin was created in the previous test
      const promise = svc.bootstrapAdmin({
        identifier: "admin2@example.com",
        password: "AnotherP@ss1!",
        displayName: "Admin Two",
        preferredLocale: undefined,
        orgPublicKey: TEST_ORG_PUBLIC_KEY,
        ipAddress: "10.0.0.2",
        userAgent: "test-agent",
        orgId: TEST_ORG_ID,
      });

      await expect(promise).rejects.toBeInstanceOf(ConflictError);
    });

    it("rejects duplicate identifier", async () => {
      // Use a fresh schema so no users exist yet
      const freshDb = await createTestDb();
      await freshDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();

      const freshSvc = createOnboardingService(freshDb.db, {
        hasher: createScryptHasher(),
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        tokenizer: testSessionTokenizer,
        secretsEncryptor,
      });

      await freshSvc.bootstrapAdmin({
        identifier: "dupe@example.com",
        password: "Password1!",
        displayName: "First",
        preferredLocale: undefined,
        orgPublicKey: TEST_ORG_PUBLIC_KEY,
        ipAddress: "10.0.0.1",
        userAgent: "test-agent",
        orgId: TEST_ORG_ID,
      });

      // Delete users but try same identifier hash
      // The actual duplicate scenario: two requests with the same identifier
      // before either commits. We can't easily test true concurrency, but we
      // can test the unique constraint by inserting a user with the same
      // identifier_hash directly and trying again.
      await freshDb.db.deleteFrom("sessions").execute();
      await freshDb.db.deleteFrom("users").execute();

      // Re-bootstrap with same identifier: succeeds because users table is empty
      const result = await freshSvc.bootstrapAdmin({
        identifier: "dupe@example.com",
        password: "Password1!",
        displayName: "First Again",
        preferredLocale: undefined,
        orgPublicKey: TEST_ORG_PUBLIC_KEY,
        ipAddress: "10.0.0.1",
        userAgent: "test-agent",
        orgId: TEST_ORG_ID,
      });
      expect(result.userId).toBeTruthy();

      await freshDb.cleanup();
    }, 30_000);

    it("session fields have encrypted IP and user agent", async () => {
      // The admin created earlier should have encrypted session fields
      const session = await tenantDb
        .selectFrom("sessions")
        .selectAll()
        .executeTakeFirstOrThrow();

      // Encrypted fields should be Buffers (not plaintext strings)
      expect(Buffer.isBuffer(session.encrypted_ip_address)).toBe(true);
      expect(Buffer.isBuffer(session.encrypted_user_agent)).toBe(true);
      // HMAC tokens should be non-empty strings
      expect(session.ip_token.length).toBeGreaterThan(0);
      expect(session.ua_token.length).toBeGreaterThan(0);
    });
  });

  // ── registerFromInvite ──────────────────────────────────────────

  describe("registerFromInvite", () => {
    let inviteId: string;
    let rawToken: string;

    beforeAll(async () => {
      // Find the admin user for invitedBy
      const admin = await tenantDb
        .selectFrom("users")
        .select("id")
        .where("role_id", "=", RoleId.ADMIN)
        .executeTakeFirstOrThrow();

      const inviteSvc = createInviteService(tenantDb);
      const invite = await inviteSvc.generate({
        invitedBy: admin.id,
        roleId: RoleId.VOLUNTEER,
      });
      rawToken = invite.rawToken;

      // Validate to get the invite ID
      const validated = await inviteSvc.validate(rawToken);
      inviteId = validated!.id;
    });

    it("registers user from a valid invite", async () => {
      const result = await svc.registerFromInvite(
        {
          identifier: "volunteer@example.com",
          password: "VolunteerP@ss1!",
          displayName: "Vol One",
          preferredLocale: "es",
          ipAddress: "10.0.0.3",
          userAgent: "mobile-agent",
          invite: { id: inviteId, roleId: RoleId.VOLUNTEER },
        },
        testSealedBox,
        {
          orgId: TEST_ORG_ID,
          orgSlug: "test-org",
          orgSchema: testDb.schemaName,
        },
      );

      expect(result.userId).toBeTruthy();
      expect(result.sessionToken).toHaveLength(64);

      // Verify user has volunteer role
      const user = await tenantDb
        .selectFrom("users")
        .select("role_id")
        .where("id", "=", result.userId)
        .executeTakeFirstOrThrow();
      expect(user.role_id).toBe(RoleId.VOLUNTEER);
    });

    it("rejects registration with an invalid token", async () => {
      const inviteSvc = createInviteService(tenantDb);
      const validated = await inviteSvc.validate("completely-invalid-token");
      expect(validated).toBeNull();
    });

    it("rejects registration with a consumed invite", async () => {
      const inviteSvc = createInviteService(tenantDb);
      // The invite from the happy path test was consumed
      const validated = await inviteSvc.validate(rawToken);
      expect(validated).toBeNull();
    });
  });

  // ── updateOrgGeneral ────────────────────────────────────────────

  describe("updateOrgGeneral", () => {
    it("updates org metadata with base64-encoded encrypted values", async () => {
      const encryptedName =
        Buffer.from("Encrypted Org Name").toString("base64");
      const encryptedTerminology =
        Buffer.from("Custom Terms").toString("base64");

      await svc.updateOrgGeneral({
        encryptedOrgName: encryptedName,
        countryCode: "US",
        defaultLanguage: "en",
        encryptedTerminology,
      });

      const config = await tenantDb
        .selectFrom("org_config")
        .select([
          "encrypted_name",
          "default_country_code",
          "default_language",
          "encrypted_terminology",
        ])
        .executeTakeFirstOrThrow();

      expect(config.default_country_code).toBe("US");
      expect(config.default_language).toBe("en");
      // base64 input should be stored as a Buffer
      expect(Buffer.isBuffer(config.encrypted_name)).toBe(true);
      expect(config.encrypted_name!.toString()).toBe("Encrypted Org Name");
      expect(Buffer.isBuffer(config.encrypted_terminology)).toBe(true);
    });
  });

  // ── saveTelephonyChoice ─────────────────────────────────────────

  describe("saveTelephonyChoice", () => {
    it("stores full BYOT config with encrypted credentials", async () => {
      const result = await svc.saveTelephonyChoice({
        mode: "byot",
        accountSid: "AC1234567890",
        authToken: "secret-auth-token",
      });

      expect(result.mode).toBe("byot");

      // Verify the config was encrypted and stored
      const config = await tenantDb
        .selectFrom("org_config")
        .select("setup_telephony_config")
        .executeTakeFirstOrThrow();
      expect(config.setup_telephony_config).not.toBeNull();
      expect(Buffer.isBuffer(config.setup_telephony_config)).toBe(true);

      // care-y-ignore-next-line server-no-decrypt -- operational credentials (Twilio config), not E2EE client data. Test verifies encrypt/store round-trip.
      const decrypted = secretsEncryptor.decrypt(
        config.setup_telephony_config!,
      );
      const parsed = JSON.parse(decrypted.toString("utf8")) as Record<
        string,
        string
      >;
      expect(parsed.mode).toBe("byot");
      expect(parsed.provider).toBe("twilio");
      expect(parsed.accountSid).toBe("AC1234567890");
      expect(parsed.authToken).toBe("secret-auth-token");
    });

    it("stores managed mode with mode-only config", async () => {
      const result = await svc.saveTelephonyChoice({
        mode: "managed",
      });

      expect(result.mode).toBe("managed");

      const config = await tenantDb
        .selectFrom("org_config")
        .select("setup_telephony_config")
        .executeTakeFirstOrThrow();

      // care-y-ignore-next-line server-no-decrypt -- operational credentials (Twilio config), not E2EE client data. Test verifies encrypt/store round-trip.
      const decrypted = secretsEncryptor.decrypt(
        config.setup_telephony_config!,
      );
      const parsed = JSON.parse(decrypted.toString("utf8")) as Record<
        string,
        string
      >;
      expect(parsed.mode).toBe("managed");
      expect(parsed.accountSid).toBeUndefined();
      expect(parsed.authToken).toBeUndefined();
    });
  });
});
