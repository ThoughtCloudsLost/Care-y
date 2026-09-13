/**
 * Tests for the telephony admin tRPC router.
 *
 * Unit tests exercise procedure wiring, auth enforcement, input validation,
 * and error mapping with a mock configService. The DB integration suite
 * exercises the blocklist, phone purpose, and config lifecycle end to end
 * with the real TelephonyConfigService (real encryption, real provider
 * factory) and runs inside Docker via pnpm test:server:db.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { randomUUID } from "node:crypto";
import type { MaskedTelephonyConfig } from "../telephony/provider.js";
import {
  createTelephonyConfigService,
  type TelephonyConfigService,
} from "../telephony/config-service.js";
import { createProviderFactory } from "../telephony/factory.js";
import { createTwilioProvider } from "../telephony/twilio.js";
import { twilioConfigSchema } from "../telephony/schemas.js";
import {
  createSecretsEncryptor,
  type SecretsEncryptor,
} from "../config/secrets.js";
import {
  createTelephonyAdminRouter,
  type TelephonyAdminRouterDeps,
} from "./telephony-admin.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
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
  PhoneSid,
  IdentifierHash,
  UsernameHash,
  PhoneHash,
  OpsPhoneHash,
} from "@care-y/shared";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import { NotFoundError, TelephonyConfigError } from "../errors.js";
import { _resetEnvCache } from "../env.js";
import {
  createTestDb,
  createTestUser,
  expectTrpcError,
  mockReq,
  mockRes,
  testBlindIndexer,
  testSealedBox,
  testUnseal,
  TEST_OPS_KEY,
  type TestDb,
  stubTenantDbDefaultRoles,
} from "../test-utils.js";

// --- Stubs and mock factories ---

const TEST_ORG_ID = "00000000-0000-4000-8000-000000004400" as OrgId;

const MASKED_CONFIG: MaskedTelephonyConfig = {
  provider: "twilio",
  mode: "byot",
  maskedAccountId: "AC***",
  maskedAuthToken: "********",
  phoneNumbers: [{ number: "+15551234567" }],
};

function createMockConfigService(
  overrides?: Partial<TelephonyConfigService>,
): TelephonyConfigService {
  return {
    saveConfig: vi.fn().mockResolvedValue({ success: true as const }),
    getMaskedConfig: vi.fn().mockResolvedValue(MASKED_CONFIG),
    provisionWebhooks: vi
      .fn()
      .mockResolvedValue({ success: true as const, phoneNumberCount: 2 }),
    lookupWebhookConfig: vi.fn().mockResolvedValue(null),
    lookupProvisionedPhones: vi.fn().mockResolvedValue([]),
    clearConfig: vi.fn().mockResolvedValue(undefined),
    getPhonePurpose: vi
      .fn()
      .mockResolvedValue({ outboundSid: null, systemSid: null }),
    setPhonePurpose: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createMockOrgContext(): OrgContext {
  return {
    orgId: TEST_ORG_ID,
    orgSlug: "test-org" as OrgSlug,
    orgSchema: "org_test" as OrgSchema,
    tenantDb: stubTenantDbDefaultRoles(),
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createMockContext(): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "sess-1" as SessionId,
      token: "tok-1" as SessionToken,
      userId: "user-1" as UserId,
      ipToken: "ip-tok" as IpToken,
      uaToken: "ua-tok" as UaToken,
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-1" as UserId,
      encryptedIdentifier: "admin",
      encryptedDisplayName: "encrypted",
      encryptedPreferredLocale: null,
      roleId: RoleId.ADMIN,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function createUnauthenticatedContext(): Context {
  return { ...createMockContext(), session: null, user: null };
}

function createContextWithRole(roleId: RoleIdValue): Context {
  const base = createMockContext();
  return {
    ...base,
    user: base.user === null ? null : { ...base.user, roleId },
  };
}

function createTwofaPendingContext(): Context {
  const base = createMockContext();
  return {
    ...base,
    session:
      base.session === null ? null : { ...base.session, twofaVerified: false },
  };
}

function createNoOrgContext(): Context {
  return { ...createMockContext(), org: null };
}

// --- Tests ---

describe("createTelephonyAdminRouter", () => {
  let mockConfigService: TelephonyConfigService;

  beforeEach(() => {
    mockConfigService = createMockConfigService();
  });

  const mockIndexer: BlindIndexer = {
    hash: vi.fn((input: string, orgId: OrgId) => `hash_${orgId}_${input}`),
    hashBuffer: vi.fn(
      (input: Buffer, orgId: OrgId) =>
        `hash_${orgId}_${input.toString("utf-8")}`,
    ),
    hashIdentifier: vi.fn(
      (input: string, orgId: OrgId) => `id_${orgId}_${input}` as IdentifierHash,
    ),
    hashUsername: vi.fn(
      (input: string, orgId: OrgId) => `user_${orgId}_${input}` as UsernameHash,
    ),
    hashPhone: vi.fn(
      (input: string, orgId: OrgId) => `phone_${orgId}_${input}` as PhoneHash,
    ),
    hashPhoneBuffer: vi.fn(
      (input: Buffer, orgId: OrgId) =>
        `phone_${orgId}_${input.toString("utf-8")}` as PhoneHash,
    ),
    hashConsultantPhoneBuffer: vi.fn(
      (input: Buffer, orgId: OrgId) =>
        `cons_${orgId}_${input.toString("utf-8")}` as OpsPhoneHash,
    ),
  };

  function buildDeps(
    serviceOverride?: TelephonyConfigService,
  ): TelephonyAdminRouterDeps {
    return {
      configService: serviceOverride ?? mockConfigService,
      webhookBaseUrl: "https://example.com",
      indexer: mockIndexer,
    };
  }

  function createCaller(
    ctx: Context,
    serviceOverride?: TelephonyConfigService,
  ) {
    const appRouter = createTelephonyAdminRouter(buildDeps(serviceOverride));
    return createCallerFactory(appRouter)(ctx);
  }

  it("creates a router without errors", () => {
    const routerInstance = createTelephonyAdminRouter(buildDeps());
    expect(routerInstance).toBeDefined();
  });

  describe("saveConfig", () => {
    it("delegates to configService.saveConfig with org context", async () => {
      const saveSpy = vi.fn().mockResolvedValue({ success: true as const });
      const service = createMockConfigService({ saveConfig: saveSpy });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.saveConfig({
        provider: "twilio",
        accountId: "ACtest123",
        authToken: "tok123",
      });

      expect(result).toEqual({ success: true });
      expect(saveSpy).toHaveBeenCalledWith({
        orgId: TEST_ORG_ID,
        provider: "twilio",
        accountId: "ACtest123",
        authToken: "tok123",
      });
    });
  });

  describe("getConfig", () => {
    it("returns masked config from configService", async () => {
      const appRouter = createTelephonyAdminRouter(buildDeps());
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.getConfig();

      expect(result).toEqual(MASKED_CONFIG);
    });

    it("returns null when configService returns null", async () => {
      const service = createMockConfigService({
        getMaskedConfig: vi.fn().mockResolvedValue(null),
      });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.getConfig();

      expect(result).toBeNull();
    });
  });

  describe("changeMode", () => {
    it("delegates to configService.saveConfig for BYOT mode", async () => {
      const saveSpy = vi.fn().mockResolvedValue({ success: true as const });
      const service = createMockConfigService({ saveConfig: saveSpy });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.changeMode({
        mode: "byot",
        provider: "twilio",
        accountId: "ACnew123",
        authToken: "newtok123",
      });

      expect(result).toEqual({ success: true, mode: "byot" });
      expect(saveSpy).toHaveBeenCalledWith({
        orgId: TEST_ORG_ID,
        provider: "twilio",
        accountId: "ACnew123",
        authToken: "newtok123",
      });
    });

    it("delegates to configService.clearConfig for managed mode", async () => {
      const clearSpy = vi.fn().mockResolvedValue(undefined);
      const service = createMockConfigService({ clearConfig: clearSpy });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.changeMode({ mode: "managed" });

      expect(result).toEqual({ success: true, mode: "managed" });
      expect(clearSpy).toHaveBeenCalledWith(TEST_ORG_ID);
    });
  });

  describe("provisionWebhooks", () => {
    it("delegates to configService.provisionWebhooks with orgId and baseUrl", async () => {
      const provisionSpy = vi
        .fn()
        .mockResolvedValue({ success: true as const, phoneNumberCount: 3 });
      const service = createMockConfigService({
        provisionWebhooks: provisionSpy,
      });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.provisionWebhooks();

      expect(result).toEqual({ success: true, phoneNumberCount: 3 });
      expect(provisionSpy).toHaveBeenCalledWith(
        TEST_ORG_ID,
        "https://example.com",
      );
    });
  });

  describe("getProvisionedPhones", () => {
    it("returns the provisioned numbers from configService", async () => {
      const phones = [{ number: "+15551230001", sid: "PNunit001" as PhoneSid }];
      const service = createMockConfigService({
        lookupProvisionedPhones: vi.fn().mockResolvedValue(phones),
      });
      const caller = createCaller(createMockContext(), service);

      expect(await caller.getProvisionedPhones()).toEqual(phones);
    });
  });

  describe("getPhonePurpose", () => {
    it("returns purpose assignments from configService", async () => {
      const service = createMockConfigService({
        getPhonePurpose: vi.fn().mockResolvedValue({
          outboundSid: "PNout1" as PhoneSid,
          systemSid: "PNsys1" as PhoneSid,
        }),
      });
      const caller = createCaller(createMockContext(), service);

      expect(await caller.getPhonePurpose()).toEqual({
        outboundSid: "PNout1" as PhoneSid,
        systemSid: "PNsys1" as PhoneSid,
      });
    });
  });

  describe("setPhonePurpose", () => {
    it("persists the assignment via configService against the org tenant DB", async () => {
      const setSpy = vi.fn().mockResolvedValue(undefined);
      const service = createMockConfigService({ setPhonePurpose: setSpy });
      const ctx = createMockContext();
      const caller = createCaller(ctx, service);

      await expect(
        caller.setPhonePurpose({
          outboundSid: "PNout2" as PhoneSid,
          systemSid: null,
        }),
      ).resolves.toBeUndefined();

      expect(setSpy).toHaveBeenCalledWith(ctx.org?.tenantDb, {
        outboundSid: "PNout2" as PhoneSid,
        systemSid: null,
      });
    });
  });

  describe("auth enforcement", () => {
    // Every procedure in this router is built on adminProcedure (verified in
    // telephony-admin.ts): org -> session -> 2FA -> MANAGE_ROLES. The table
    // exercises each procedure against the two failure modes that matter per
    // procedure; the shared inner guards (2FA, volunteer role, missing org)
    // are exercised once each below since the identical middleware chain
    // runs for every procedure.
    // The asserted messages are ErrorCode constants the client branches on,
    // which makes them part of the API contract rather than display copy.
    type AdminCaller = ReturnType<typeof createCaller>;
    const procedureInvocations: ReadonlyArray<{
      name: string;
      invoke: (caller: AdminCaller) => Promise<unknown>;
    }> = [
      {
        name: "saveConfig",
        invoke: (caller) =>
          caller.saveConfig({
            provider: "twilio",
            accountId: "ACfake0000",
            authToken: "fake-token-0000",
          }),
      },
      { name: "getConfig", invoke: (caller) => caller.getConfig() },
      {
        name: "provisionWebhooks",
        invoke: (caller) => caller.provisionWebhooks(),
      },
      {
        name: "changeMode",
        invoke: (caller) => caller.changeMode({ mode: "managed" }),
      },
      {
        name: "addToBlocklist",
        invoke: (caller) =>
          caller.addToBlocklist({ phoneNumber: "+15550001234" }),
      },
      {
        name: "removeFromBlocklist",
        invoke: (caller) => caller.removeFromBlocklist({ id: randomUUID() }),
      },
      { name: "listBlocklist", invoke: (caller) => caller.listBlocklist() },
      {
        name: "getProvisionedPhones",
        invoke: (caller) => caller.getProvisionedPhones(),
      },
      {
        name: "getPhonePurpose",
        invoke: (caller) => caller.getPhonePurpose(),
      },
      {
        name: "setPhonePurpose",
        invoke: (caller) =>
          caller.setPhonePurpose({ outboundSid: null, systemSid: null }),
      },
    ];

    for (const { name, invoke } of procedureInvocations) {
      it(`rejects unauthenticated callers on ${name}`, async () => {
        const caller = createCaller(createUnauthenticatedContext());

        await expectTrpcError(
          invoke(caller),
          "UNAUTHORIZED",
          ErrorCode.NOT_AUTHENTICATED,
        );
      });

      it(`rejects non-admin callers on ${name}`, async () => {
        const caller = createCaller(createContextWithRole(RoleId.MANAGER));

        await expectTrpcError(
          invoke(caller),
          "FORBIDDEN",
          ErrorCode.INSUFFICIENT_PERMISSIONS,
        );
      });
    }

    it("rejects volunteer callers", async () => {
      const caller = createCaller(createContextWithRole(RoleId.VOLUNTEER));

      await expectTrpcError(
        caller.getConfig(),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });

    it("rejects sessions without completed 2FA", async () => {
      const caller = createCaller(createTwofaPendingContext());

      await expectTrpcError(
        caller.getConfig(),
        "UNAUTHORIZED",
        ErrorCode.TWOFA_REQUIRED,
      );
    });

    it("rejects requests without a resolved org", async () => {
      const caller = createCaller(createNoOrgContext());

      await expectTrpcError(caller.getConfig(), "NOT_FOUND");
    });
  });

  describe("input validation", () => {
    it("rejects an unknown provider on saveConfig", async () => {
      const caller = createCaller(createMockContext());

      await expectTrpcError(
        caller.saveConfig({
          provider: "carrier-pigeon" as unknown as "twilio",
          accountId: "ACvalid000",
          authToken: "valid-token-000",
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects empty credentials on saveConfig", async () => {
      const caller = createCaller(createMockContext());

      await expectTrpcError(
        caller.saveConfig({
          provider: "twilio",
          accountId: "",
          authToken: "valid-token-000",
        }),
        "BAD_REQUEST",
      );
      await expectTrpcError(
        caller.saveConfig({
          provider: "twilio",
          accountId: "ACvalid000",
          authToken: "",
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects a non-E.164 number on addToBlocklist", async () => {
      const caller = createCaller(createMockContext());

      await expectTrpcError(
        caller.addToBlocklist({ phoneNumber: "5551234" }),
        "BAD_REQUEST",
      );
    });

    it("rejects a non-UUID id on removeFromBlocklist", async () => {
      const caller = createCaller(createMockContext());

      await expectTrpcError(
        caller.removeFromBlocklist({ id: "not-a-uuid" }),
        "BAD_REQUEST",
      );
    });

    it("rejects byot changeMode without credentials", async () => {
      const caller = createCaller(createMockContext());

      await expectTrpcError(
        caller.changeMode({ mode: "byot" } as unknown as {
          mode: "managed";
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects an unknown mode on changeMode", async () => {
      const caller = createCaller(createMockContext());

      await expectTrpcError(
        caller.changeMode({ mode: "carrier" } as unknown as {
          mode: "managed";
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects setPhonePurpose input with a missing field", async () => {
      const caller = createCaller(createMockContext());

      await expectTrpcError(
        caller.setPhonePurpose({
          outboundSid: "PNonly" as PhoneSid,
        } as unknown as {
          outboundSid: string | null;
          systemSid: string | null;
        }),
        "BAD_REQUEST",
      );
    });
  });

  describe("error mapping", () => {
    it("maps NotFoundError from provisioning to NOT_FOUND", async () => {
      const service = createMockConfigService({
        provisionWebhooks: vi
          .fn()
          .mockRejectedValue(
            new NotFoundError(ErrorCode.TELEPHONY_NOT_CONFIGURED),
          ),
      });
      const caller = createCaller(createMockContext(), service);

      await expectTrpcError(
        caller.provisionWebhooks(),
        "NOT_FOUND",
        ErrorCode.TELEPHONY_NOT_CONFIGURED,
      );
    });

    it("maps non-operational TelephonyConfigError to a generic internal error", async () => {
      const service = createMockConfigService({
        saveConfig: vi
          .fn()
          .mockRejectedValue(
            new TelephonyConfigError("decrypt failed: secret detail"),
          ),
      });
      const caller = createCaller(createMockContext(), service);

      // The message assertion is the security contract: non-operational
      // errors must reach the client as a generic message, never internal
      // details (see throwAsTrpc in trpc.ts).
      const err = await expectTrpcError(
        caller.saveConfig({
          provider: "twilio",
          accountId: "ACvalid000",
          authToken: "valid-token-000",
        }),
        "INTERNAL_SERVER_ERROR",
        "Internal server error",
      );
      expect(err.message).not.toContain("secret detail");
    });

    it("maps unexpected errors to INTERNAL_SERVER_ERROR", async () => {
      const service = createMockConfigService({
        getMaskedConfig: vi.fn().mockRejectedValue(new Error("boom")),
      });
      const caller = createCaller(createMockContext(), service);

      await expectTrpcError(caller.getConfig(), "INTERNAL_SERVER_ERROR");
    });
  });

  describe("devSeedTelephony (development only)", () => {
    // The dev-only procedure is registered only when the router is created
    // under NODE_ENV=development; every other test in this file creates the
    // router under the test env and exercises the procedure's absence.
    function createRouterInDevEnv(deps: TelephonyAdminRouterDeps) {
      const prevNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      _resetEnvCache();
      try {
        return createTelephonyAdminRouter(deps);
      } finally {
        if (prevNodeEnv === undefined) {
          delete process.env.NODE_ENV;
        } else {
          process.env.NODE_ENV = prevNodeEnv;
        }
        _resetEnvCache();
      }
    }

    it("skips seeding when telephony is already configured", async () => {
      let seedCalled = false;
      const service = createMockConfigService({
        devSeedConfigWithPhones: async () => {
          seedCalled = true;
        },
      });
      const routerInstance = createRouterInDevEnv(buildDeps(service));
      const caller = createCallerFactory(routerInstance)(createMockContext());

      const result = await caller.devSeedTelephony?.();

      expect(result).toEqual({ skipped: true });
      expect(seedCalled).toBe(false);
    });

    it("seeds phones and assigns purposes from the seeded sids when unconfigured", async () => {
      let seededOrgId: string | null = null;
      // Captures live on an object: TS keeps let locals narrowed to their
      // null initializer across closure assignments (microsoft/TypeScript
      // #9998), while property narrowing resets at the router call below.
      const captured: {
        phones:
          readonly { number: string; sid: string; label?: string }[] | null;
        purposes: {
          outboundSid: string | null;
          systemSid: string | null;
        } | null;
      } = { phones: null, purposes: null };
      const service = createMockConfigService({
        getMaskedConfig: vi.fn().mockResolvedValue(null),
        devSeedConfigWithPhones: async (orgIdArg, phones) => {
          seededOrgId = orgIdArg;
          captured.phones = phones;
        },
        setPhonePurpose: async (_tenantDb, input) => {
          captured.purposes = input;
        },
      });
      const routerInstance = createRouterInDevEnv(buildDeps(service));
      const caller = createCallerFactory(routerInstance)(createMockContext());

      const result = await caller.devSeedTelephony?.();

      expect(result).toEqual({ skipped: false });
      expect(seededOrgId).toBe(TEST_ORG_ID);
      const seededPhones = captured.phones;
      const purposes = captured.purposes;
      expect(seededPhones).not.toBeNull();
      expect(purposes).not.toBeNull();

      // The assigned purposes must reference sids that were actually
      // seeded, whatever the seeded numbers happen to be.
      const seededSids = (seededPhones ?? []).map((p) => p.sid);
      expect(seededSids.length).toBeGreaterThan(0);
      expect(seededSids).toContain(purposes?.outboundSid);
      expect(seededSids).toContain(purposes?.systemSid);
    });

    it("fails loudly rather than seeding a numberless config when dev seeding is absent", async () => {
      const saveSpy = vi.fn().mockResolvedValue({ success: true as const });
      // The default mock service has no devSeedConfigWithPhones method.
      // That state is unreachable in practice, since this route and that
      // method are gated on the same development check, so the route
      // refuses rather than writing a config with no phone numbers.
      const service = createMockConfigService({
        getMaskedConfig: vi.fn().mockResolvedValue(null),
        saveConfig: saveSpy,
      });
      const routerInstance = createRouterInDevEnv(buildDeps(service));
      const caller = createCallerFactory(routerInstance)(createMockContext());

      await expect(caller.devSeedTelephony?.()).rejects.toThrow();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// DB integration tests (real PostgreSQL + real TelephonyConfigService,
// run via pnpm test:server:db)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "telephony admin routes (DB integration)",
  () => {
    let testDb: TestDb;
    let secretsEncryptor: SecretsEncryptor;
    let adminUserId: UserId;
    let dbOrgId: OrgId;
    let emptyOrgId: OrgId;
    const createdOrgIds: OrgId[] = [];

    const ROUTE_PROVISIONED_PHONE = {
      number: "+15550400001",
      sid: "PNroute001" as PhoneSid,
    };

    beforeAll(async () => {
      testDb = await createTestDb();
      secretsEncryptor = createSecretsEncryptor(TEST_OPS_KEY);

      dbOrgId = randomUUID() as OrgId;
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: dbOrgId,
          slug: `tel-admin-${dbOrgId.slice(0, 8)}` as OrgSlug,
          schema_name: testDb.schemaName as OrgSchema,
        })
        .execute();
      createdOrgIds.push(dbOrgId);

      // A second org that never gets a telephony config, for
      // not-configured contract tests.
      emptyOrgId = randomUUID() as OrgId;
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: emptyOrgId,
          slug: `tel-admin-empty-${emptyOrgId.slice(0, 8)}` as OrgSlug,
          schema_name: `test_tae_${emptyOrgId.slice(0, 8)}` as OrgSchema,
        })
        .execute();
      createdOrgIds.push(emptyOrgId);

      // org_config singleton row: the phone purpose endpoints read and
      // update it, and a fresh test schema has no row.
      const existing = await testDb.db
        .selectFrom("org_config")
        .select("id")
        .executeTakeFirst();
      if (!existing) {
        await testDb.db
          .insertInto("org_config")
          .values({ pii_retention_days: null })
          .execute();
      }

      // addToBlocklist records added_by with a FK to users.
      adminUserId = (
        await createTestUser(testDb.db, {
          overrides: { role_id: RoleId.ADMIN },
        })
      ).id;
    });

    afterAll(async () => {
      for (const id of createdOrgIds) {
        await testDb.platformDb
          .deleteFrom("telephony_config")
          .where("org_id", "=", id)
          .execute();
        await testDb.platformDb
          .deleteFrom("orgs")
          .where("id", "=", id)
          .execute();
      }
      await testDb.cleanup();
    });

    function buildDbRouter() {
      const providerFactory = createProviderFactory({
        db: testDb.platformDb,
        secretsEncryptor,
        providerConstructors: new Map([["twilio", createTwilioProvider]]),
      });
      const configService = createTelephonyConfigService({
        db: testDb.platformDb,
        secretsEncryptor,
        providerFactory,
        providerStatics: new Map([
          [
            "twilio",
            {
              validateConfig: (raw: unknown): unknown =>
                twilioConfigSchema.parse(raw),
              // Stubbed at the network boundary: the real static calls
              // Twilio's API to reconfigure webhook URLs on the account.
              provisionWebhooks: async (config: unknown): Promise<unknown> => ({
                ...(config as Record<string, unknown>),
                phoneNumbers: [ROUTE_PROVISIONED_PHONE],
              }),
            },
          ],
        ]),
      });
      return createTelephonyAdminRouter({
        configService,
        webhookBaseUrl: "https://hooks.example.test",
        indexer: testBlindIndexer,
      });
    }

    function dbContext(orgIdForCtx: OrgId): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: {
          orgId: orgIdForCtx,
          orgSlug: "tel-admin-test" as OrgSlug,
          orgSchema: testDb.schemaName as OrgSchema,
          tenantDb: testDb.db,
          sealedBox: testSealedBox,
        },
        session: {
          id: "sess-db-1" as SessionId,
          token: "tok-db-1" as SessionToken,
          userId: adminUserId,
          ipToken: "ip-tok" as IpToken,
          uaToken: "ua-tok" as UaToken,
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: adminUserId,
          encryptedIdentifier: "admin",
          encryptedDisplayName: "encrypted",
          encryptedPreferredLocale: null,
          roleId: RoleId.ADMIN,
          isActive: true,
          hasSeenBriefing: true,
        },
      };
    }

    function createDbCaller(orgIdForCtx?: OrgId) {
      return createCallerFactory(buildDbRouter())(
        dbContext(orgIdForCtx ?? dbOrgId),
      );
    }

    describe("saveConfig and getConfig", () => {
      it("stores credentials encrypted at rest and serves a masked view", async () => {
        const caller = createDbCaller();

        const result = await caller.saveConfig({
          provider: "twilio",
          accountId: "ACroutesave01xx",
          authToken: "test-tok-route-01",
        });
        expect(result).toEqual({ success: true });

        const masked = await caller.getConfig();
        expect(masked?.provider).toBe("twilio");
        expect(masked?.mode).toBe("byot");
        // Mask contract: enough of the SID to recognize it, never the
        // whole value, and no part of the auth token.
        expect(masked?.maskedAccountId.endsWith("01xx")).toBe(true);
        expect(masked?.maskedAccountId).not.toBe("ACroutesave01xx");
        expect(masked?.maskedAuthToken).not.toContain("test-tok-route-01");
        expect(masked?.phoneNumbers).toEqual([]);

        const row = await testDb.platformDb
          .selectFrom("telephony_config")
          .select("config")
          .where("org_id", "=", dbOrgId)
          .executeTakeFirstOrThrow();
        const raw = row.config.toString("utf-8");
        expect(raw).not.toContain("ACroutesave01xx");
        expect(raw).not.toContain("test-tok-route-01");
      });

      it("getConfig returns null for an unconfigured org", async () => {
        const caller = createDbCaller(emptyOrgId);

        expect(await caller.getConfig()).toBeNull();
      });
    });

    describe("changeMode", () => {
      it("switching to managed deletes the stored config", async () => {
        const caller = createDbCaller();
        await caller.saveConfig({
          provider: "twilio",
          accountId: "ACmodedel02xx",
          authToken: "test-tok-route-02",
        });

        const result = await caller.changeMode({ mode: "managed" });
        expect(result).toEqual({ success: true, mode: "managed" });

        // Read-after-delete contract: masked config is gone and the row
        // no longer exists.
        expect(await caller.getConfig()).toBeNull();
        const row = await testDb.platformDb
          .selectFrom("telephony_config")
          .selectAll()
          .where("org_id", "=", dbOrgId)
          .executeTakeFirst();
        expect(row).toBeUndefined();
      });

      it("switching to byot stores the new credentials", async () => {
        const caller = createDbCaller();

        const result = await caller.changeMode({
          mode: "byot",
          provider: "twilio",
          accountId: "ACmodebyot03xx",
          authToken: "test-tok-route-03",
        });

        expect(result).toEqual({ success: true, mode: "byot" });
        const masked = await caller.getConfig();
        expect(masked?.maskedAccountId.endsWith("03xx")).toBe(true);
      });
    });

    describe("provisionWebhooks and getProvisionedPhones", () => {
      it("reports NOT_FOUND for an unconfigured org", async () => {
        const caller = createDbCaller(emptyOrgId);

        await expectTrpcError(
          caller.provisionWebhooks(),
          "NOT_FOUND",
          ErrorCode.TELEPHONY_NOT_CONFIGURED,
        );
      });

      it("provisions numbers and serves them via getProvisionedPhones", async () => {
        const caller = createDbCaller();
        await caller.saveConfig({
          provider: "twilio",
          accountId: "ACprovroute04x",
          authToken: "test-tok-route-04",
        });
        expect(await caller.getProvisionedPhones()).toEqual([]);

        const result = await caller.provisionWebhooks();
        expect(result).toEqual({ success: true, phoneNumberCount: 1 });

        expect(await caller.getProvisionedPhones()).toEqual([
          ROUTE_PROVISIONED_PHONE,
        ]);
        // The masked view reflects the provisioned number after the
        // factory cache is invalidated.
        const masked = await caller.getConfig();
        expect(masked?.phoneNumbers).toEqual([
          { number: ROUTE_PROVISIONED_PHONE.number },
        ]);
      });
    });

    describe("phone purpose", () => {
      it("round-trips assignments through tenant org_config", async () => {
        const caller = createDbCaller();

        expect(await caller.getPhonePurpose()).toEqual({
          outboundSid: null,
          systemSid: null,
        });

        await caller.setPhonePurpose({
          outboundSid: "PNroutep01" as PhoneSid,
          systemSid: "PNroutep02" as PhoneSid,
        });
        expect(await caller.getPhonePurpose()).toEqual({
          outboundSid: "PNroutep01" as PhoneSid,
          systemSid: "PNroutep02" as PhoneSid,
        });

        await caller.setPhonePurpose({ outboundSid: null, systemSid: null });
        expect(await caller.getPhonePurpose()).toEqual({
          outboundSid: null,
          systemSid: null,
        });
      });
    });

    describe("blocklist", () => {
      it("addToBlocklist stores hash plus sealed ciphertext and returns the entry", async () => {
        const caller = createDbCaller();
        const phoneNumber = "+15556660001";

        const entry = await caller.addToBlocklist({ phoneNumber });

        expect(entry.phoneHash).toBe(
          testBlindIndexer.hash(phoneNumber, dbOrgId),
        );
        expect(entry.addedBy).toBe(adminUserId);
        expect(entry.createdAt).toBeInstanceOf(Date);
        // Sealed-box tier: only the org key holder can read the number
        // back; the committed test keypair verifies the round trip.
        expect(testUnseal(entry.encryptedNumber)).toBe(phoneNumber);

        const row = await testDb.db
          .selectFrom("phone_blocklist")
          .selectAll()
          .where("id", "=", entry.id)
          .executeTakeFirstOrThrow();
        expect(row.encrypted_number.toString("utf-8")).not.toContain(
          phoneNumber,
        );
      });

      it("rejects adding an already-blocked number with CONFLICT", async () => {
        const caller = createDbCaller();
        await caller.addToBlocklist({ phoneNumber: "+15556660002" });

        await expectTrpcError(
          caller.addToBlocklist({ phoneNumber: "+15556660002" }),
          "CONFLICT",
        );
      });

      it("listBlocklist returns stored entries", async () => {
        const caller = createDbCaller();
        const first = await caller.addToBlocklist({
          phoneNumber: "+15556660003",
        });
        const second = await caller.addToBlocklist({
          phoneNumber: "+15556660004",
        });

        const list = await caller.listBlocklist();

        const ids = list.map((entry) => entry.id);
        expect(ids).toContain(first.id);
        expect(ids).toContain(second.id);
      });

      it("removeFromBlocklist deletes the entry and tolerates unknown ids", async () => {
        const caller = createDbCaller();
        const entry = await caller.addToBlocklist({
          phoneNumber: "+15556660005",
        });

        await caller.removeFromBlocklist({ id: entry.id });

        const list = await caller.listBlocklist();
        expect(list.map((e) => e.id)).not.toContain(entry.id);

        // Idempotent: removing a nonexistent id is not an error.
        await expect(
          caller.removeFromBlocklist({ id: randomUUID() }),
        ).resolves.toBeUndefined();
      });
    });
  },
);
