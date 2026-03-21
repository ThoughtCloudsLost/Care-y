import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import type { ProviderFactory } from "./factory.js";
import type {
  TelephonyProviderStatic,
  MaskedTelephonyConfig,
} from "./provider.js";
import {
  createTelephonyConfigService,
  type TelephonyConfigServiceDeps,
} from "./config-service.js";
import { NotFoundError, TelephonyConfigError } from "../errors.js";
import { createTestDb, type TestDb, TEST_OPS_KEY } from "../test-utils.js";
import { createSecretsEncryptor } from "../config/secrets.js";
import { twilioConfigSchema } from "./schemas.js";

// ---------------------------------------------------------------------------
// Shared mock factories (used by both unit and DB integration tests)
// ---------------------------------------------------------------------------

function createMockEncryptor(): SecretsEncryptor & {
  lastEncryptInput: Buffer | null;
} {
  let lastEncryptInput: Buffer | null = null;
  return {
    get lastEncryptInput() {
      return lastEncryptInput;
    },
    encrypt: vi.fn((plaintext: Buffer) => {
      lastEncryptInput = Buffer.from(plaintext);
      return Buffer.concat([Buffer.from("ENC:"), plaintext]);
    }),
    // care-y-ignore-next-line server-no-decrypt -- test-only noop decryption for config service unit tests
    decrypt: vi.fn((sealed: Buffer) => Buffer.from(sealed.subarray(4))),
  };
}

const MASKED_CONFIG: MaskedTelephonyConfig = {
  provider: "twilio",
  mode: "byot",
  maskedAccountId: "AC***",
  maskedAuthToken: "********",
  phoneNumbers: [{ number: "+15551234567" }],
};

function createMockProviderFactory(
  overrides?: Partial<ProviderFactory>,
): ProviderFactory {
  return {
    getProvider: vi.fn(async () => ({
      providerId: "twilio",
      maskConfig: () => MASKED_CONFIG,
      sendSms: vi.fn(),
      initiateOutboundCall: vi.fn(),
      initiateWebRtcCall: vi.fn(),
      validateWebhook: vi.fn(),
      parseIncomingCall: vi.fn(),
      parseIncomingSms: vi.fn(),
      generateVoiceResponse: vi.fn(),
      getRecording: vi.fn(),
      deleteRecording: vi.fn(),
      deleteCallLog: vi.fn(),
      deleteMessageLog: vi.fn(),
    })),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
    ...overrides,
  };
}

function createMockProviderStatic(): TelephonyProviderStatic {
  return {
    validateConfig: vi.fn((raw: unknown) => raw),
    provisionWebhooks: vi.fn(async (config: unknown) => {
      const c = config as Record<string, unknown>;
      return {
        ...c,
        phoneNumbers: [{ number: "+15551234567", sid: "PN123" }],
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Unit tests (mocked DB, for non-persistence logic)
// ---------------------------------------------------------------------------

interface MockDbOptions {
  selectResult?: Record<string, unknown> | undefined;
}

function createMockDb(options: MockDbOptions = {}): Kysely<PlatformDatabase> {
  const executeTakeFirst = vi.fn().mockResolvedValue(options.selectResult);
  const execute = vi.fn().mockResolvedValue(undefined);

  return {
    selectFrom: vi.fn().mockReturnValue({
      selectAll: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ executeTakeFirst }),
      }),
      select: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ executeTakeFirst }),
      }),
    }),
    insertInto: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        execute,
        onConflict: vi.fn().mockReturnValue({ execute }),
      }),
    }),
    updateTable: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ execute }),
      }),
    }),
  } as unknown as Kysely<PlatformDatabase>;
}

function buildMockDeps(overrides?: {
  dbOptions?: MockDbOptions;
  factory?: ProviderFactory;
  encryptor?: SecretsEncryptor;
}): TelephonyConfigServiceDeps {
  const db = createMockDb(overrides?.dbOptions);
  return {
    db,
    secretsEncryptor: overrides?.encryptor ?? createMockEncryptor(),
    providerFactory: overrides?.factory ?? createMockProviderFactory(),
    providerStatics: new Map([["twilio", createMockProviderStatic()]]),
  };
}

describe("TelephonyConfigService", () => {
  describe("saveConfig (unit)", () => {
    it("throws TelephonyConfigError for unsupported provider", async () => {
      const deps = buildMockDeps();
      const service = createTelephonyConfigService(deps);

      await expect(
        service.saveConfig({
          orgId: "org-unit-test",
          provider: "unknown-provider",
          accountId: "AC123",
          authToken: "tok",
        }),
      ).rejects.toThrow(TelephonyConfigError);
    });
  });

  describe("getMaskedConfig", () => {
    it("returns masked config from provider factory", async () => {
      const deps = buildMockDeps();
      const service = createTelephonyConfigService(deps);

      const result = await service.getMaskedConfig("org-test");

      expect(result).toEqual(MASKED_CONFIG);
    });

    it("returns null when NotFoundError is thrown by factory", async () => {
      const factory = createMockProviderFactory({
        getProvider: vi.fn().mockRejectedValue(new NotFoundError("No config")),
      });
      const deps = buildMockDeps({ factory });
      const service = createTelephonyConfigService(deps);

      const result = await service.getMaskedConfig("org-test");

      expect(result).toBeNull();
    });

    it("re-throws non-NotFoundError errors", async () => {
      const factory = createMockProviderFactory({
        getProvider: vi.fn().mockRejectedValue(new Error("DB down")),
      });
      const deps = buildMockDeps({ factory });
      const service = createTelephonyConfigService(deps);

      await expect(service.getMaskedConfig("org-test")).rejects.toThrow(
        "DB down",
      );
    });
  });

  describe("provisionWebhooks (unit)", () => {
    it("throws NotFoundError when no config row exists", async () => {
      const deps = buildMockDeps({ dbOptions: { selectResult: undefined } });
      const service = createTelephonyConfigService(deps);

      await expect(
        service.provisionWebhooks("org-test", "https://api.example.com"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("lookupWebhookConfig (unit)", () => {
    it("returns null when no row exists", async () => {
      const deps = buildMockDeps({ dbOptions: { selectResult: undefined } });
      const service = createTelephonyConfigService(deps);

      const result = await service.lookupWebhookConfig("org-test");

      expect(result).toBeNull();
    });

    it("throws TelephonyConfigError when decrypted config is missing fields", async () => {
      const badConfig = { mode: "byot" }; // missing accountSid, authToken
      const encrypted = Buffer.concat([
        Buffer.from("ENC:"),
        Buffer.from(JSON.stringify(badConfig)),
      ]);

      const deps = buildMockDeps({
        dbOptions: {
          selectResult: {
            provider: "twilio",
            config: encrypted,
          },
        },
      });
      const service = createTelephonyConfigService(deps);

      await expect(service.lookupWebhookConfig("org-test")).rejects.toThrow(
        TelephonyConfigError,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// DB integration tests (real PostgreSQL, run via pnpm test:server:db)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "TelephonyConfigService (DB integration)",
  () => {
    let testDb: TestDb;
    let secretsEncryptor: SecretsEncryptor;
    const createdOrgIds: string[] = [];
    const TEST_ORG_ID = "cafebabe-cafe-babe-cafe-cafebabe0001";

    beforeAll(async () => {
      testDb = await createTestDb();
      secretsEncryptor = createSecretsEncryptor(TEST_OPS_KEY);

      // Insert an org row (FK for telephony_config.org_id)
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: TEST_ORG_ID,
          slug: "cfg-svc-test",
          schema_name: testDb.schemaName,
        })
        .execute();
      createdOrgIds.push(TEST_ORG_ID);
    });

    afterAll(async () => {
      // Clean up platform rows before dropping the schema
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

    function buildDbDeps(
      factoryOverrides?: Partial<ProviderFactory>,
    ): TelephonyConfigServiceDeps {
      return {
        db: testDb.platformDb,
        secretsEncryptor,
        providerFactory: createMockProviderFactory(factoryOverrides),
        providerStatics: new Map([
          [
            "twilio",
            {
              validateConfig: (raw: unknown) => twilioConfigSchema.parse(raw),
              provisionWebhooks: vi.fn(async (config: unknown) => config),
            },
          ],
        ]),
      };
    }

    describe("saveConfig", () => {
      it("persists config retrievable via lookupWebhookConfig", async () => {
        const deps = buildDbDeps();
        const service = createTelephonyConfigService(deps);

        const result = await service.saveConfig({
          orgId: TEST_ORG_ID,
          provider: "twilio",
          accountId: "ACpersistence01",
          authToken: "test-tok-persist-01",
        });

        expect(result).toEqual({ success: true });

        const lookup = await service.lookupWebhookConfig(TEST_ORG_ID);
        expect(lookup).toEqual({
          provider: "twilio",
          accountSid: "ACpersistence01",
          authToken: "test-tok-persist-01",
        });
      });

      it("upserts on second save (updates, does not duplicate)", async () => {
        const deps = buildDbDeps();
        const service = createTelephonyConfigService(deps);

        // First save was done in the previous test; do another
        await service.saveConfig({
          orgId: TEST_ORG_ID,
          provider: "twilio",
          accountId: "ACupdated02",
          authToken: "test-tok-updated-02",
        });

        const lookup = await service.lookupWebhookConfig(TEST_ORG_ID);
        expect(lookup).toEqual({
          provider: "twilio",
          accountSid: "ACupdated02",
          authToken: "test-tok-updated-02",
        });
      });

      it("invalidates provider cache after save", async () => {
        const deps = buildDbDeps();
        const service = createTelephonyConfigService(deps);

        await service.saveConfig({
          orgId: TEST_ORG_ID,
          provider: "twilio",
          accountId: "ACcache03",
          authToken: "test-tok-cache-03",
        });

        expect(deps.providerFactory.invalidate).toHaveBeenCalledWith(
          TEST_ORG_ID,
        );
      });

      it("stores encrypted config (raw bytes differ from plaintext)", async () => {
        const deps = buildDbDeps();
        const service = createTelephonyConfigService(deps);

        await service.saveConfig({
          orgId: TEST_ORG_ID,
          provider: "twilio",
          accountId: "test-ACencrypt04",
          authToken: "test-tok-encrypt-04",
        });

        const row = await testDb.platformDb
          .selectFrom("telephony_config")
          .select("config")
          .where("org_id", "=", TEST_ORG_ID)
          .executeTakeFirstOrThrow();

        const raw = row.config.toString("utf-8");
        expect(raw).not.toContain("test-ACencrypt04");
        expect(raw).not.toContain("test-tok-encrypt-04");
      });
    });

    describe("lookupWebhookConfig", () => {
      it("returns null for unconfigured org", async () => {
        const unconfiguredOrgId = "cafebabe-cafe-babe-cafe-cafebabe0002";
        await testDb.platformDb
          .insertInto("orgs")
          .values({
            id: unconfiguredOrgId,
            slug: "cfg-svc-unconfigured",
            schema_name: `test_uncfg_${testDb.schemaName.slice(-8)}`,
          })
          .execute();
        createdOrgIds.push(unconfiguredOrgId);

        const deps = buildDbDeps();
        const service = createTelephonyConfigService(deps);
        const result = await service.lookupWebhookConfig(unconfiguredOrgId);

        expect(result).toBeNull();
      });
    });
  },
);
