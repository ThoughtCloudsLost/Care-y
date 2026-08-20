import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import { createProviderFactory, type ProviderFactory } from "./factory.js";
import { createTwilioProvider } from "./twilio.js";
import {
  createMockProvider,
  DEV_MOCK_ACCOUNT_SID,
  DEV_MOCK_AUTH_TOKEN,
} from "./mock-provider.js";
import type {
  TelephonyProvider,
  TelephonyProviderStatic,
  MaskedTelephonyConfig,
} from "./provider.js";
import {
  createTelephonyConfigService,
  type TelephonyConfigService,
  type TelephonyConfigServiceDeps,
} from "./config-service.js";
import { _resetEnvCache } from "../env.js";
import {
  NotFoundError,
  SecretCryptoError,
  TelephonyConfigError,
} from "../errors.js";
import {
  createMockProviderFactory,
  createTestDb,
  type TestDb,
  TEST_OPS_KEY,
} from "../test-utils.js";
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
      const factory = createMockProviderFactory({
        getProvider: vi.fn(async () => ({
          ...({} as TelephonyProvider),
          maskConfig: () => MASKED_CONFIG,
        })),
      });
      const deps = buildMockDeps({ factory });
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

    it("throws TelephonyConfigError when the stored provider has no registered implementation", async () => {
      const deps = buildMockDeps({
        dbOptions: {
          selectResult: {
            org_id: "org-unit-test",
            provider: "ghost-provider",
            config: Buffer.concat([Buffer.from("ENC:"), Buffer.from("{}")]),
          },
        },
      });
      const service = createTelephonyConfigService(deps);

      await expect(
        service.provisionWebhooks("org-unit-test", "https://api.example.com"),
      ).rejects.toThrow(TelephonyConfigError);
    });

    it("reports zero phone numbers when the provisioned config has none", async () => {
      const storedConfig = {
        mode: "byot",
        accountSid: "ACunit05",
        authToken: "test-tok-unit-05",
        phoneNumbers: [],
      };
      const deps: TelephonyConfigServiceDeps = {
        db: createMockDb({
          selectResult: {
            org_id: "org-unit-test",
            provider: "twilio",
            config: Buffer.concat([
              Buffer.from("ENC:"),
              Buffer.from(JSON.stringify(storedConfig)),
            ]),
          },
        }),
        secretsEncryptor: createMockEncryptor(),
        providerFactory: createMockProviderFactory(),
        providerStatics: new Map([
          [
            "twilio",
            {
              validateConfig: (raw: unknown): unknown => raw,
              // Provider returns a config shape with no phoneNumbers array
              // (a provider whose provisioning does not report numbers).
              provisionWebhooks: async (): Promise<unknown> => ({
                mode: "byot",
                accountSid: "ACunit05",
                authToken: "test-tok-unit-05",
              }),
            },
          ],
        ]),
      };
      const service = createTelephonyConfigService(deps);

      const result = await service.provisionWebhooks(
        "org-unit-test",
        "https://api.example.com",
      );

      expect(result).toEqual({ success: true, phoneNumberCount: 0 });
    });
  });

  describe("devSeedConfigWithPhones (unit)", () => {
    it("is not exposed outside development", () => {
      // Dev-only seeding must be absent in test and production builds so a
      // deployed server can never fabricate telephony configs. Pin NODE_ENV
      // to "test" so the assertion holds regardless of the ambient shell env.
      const prevNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";
      _resetEnvCache();
      try {
        const service = createTelephonyConfigService(buildMockDeps());
        expect(service.devSeedConfigWithPhones).toBeUndefined();
      } finally {
        if (prevNodeEnv === undefined) {
          delete process.env.NODE_ENV;
        } else {
          process.env.NODE_ENV = prevNodeEnv;
        }
        _resetEnvCache();
      }
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

    /** Encrypts a JSON-serializable object with the real test encryptor. */
    function encryptJson(configObj: unknown): Buffer {
      return secretsEncryptor.encrypt(
        Buffer.from(JSON.stringify(configObj), "utf-8"),
      );
    }

    /** Inserts an orgs row (FK target for telephony_config) and registers
     *  it for cleanup. Returns the new org id. */
    async function insertOrgRow(label: string): Promise<string> {
      const id = randomUUID();
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id,
          slug: `cfg-svc-${label}-${id.slice(0, 8)}`,
          schema_name: `test_cfg_${id.slice(0, 8)}`,
        })
        .execute();
      createdOrgIds.push(id);
      return id;
    }

    /** Inserts a raw telephony_config row for read-path tests that need
     *  stored shapes saveConfig would never produce. Returns the org id. */
    async function insertRawConfigRow(
      provider: string,
      config: Buffer,
    ): Promise<string> {
      const orgId = await insertOrgRow("raw");
      await testDb.platformDb
        .insertInto("telephony_config")
        .values({ org_id: orgId, provider, config })
        .execute();
      return orgId;
    }

    /** Real provider factory wired to the test DB and encryptor, so cache
     *  and lifecycle assertions observe actual provider behavior. */
    function buildRealFactory(): ProviderFactory {
      return createProviderFactory({
        db: testDb.platformDb,
        secretsEncryptor,
        providerConstructors: new Map([
          ["twilio", createTwilioProvider],
          ["mock", createMockProvider],
        ]),
      });
    }

    /** Deps whose twilio static provisions the given phone numbers. The
     *  static is stubbed at the network boundary: the real one calls
     *  Twilio's API to reconfigure webhook URLs on the account. */
    function buildProvisioningDeps(
      factory: ProviderFactory,
      provisionedPhones: readonly { number: string; sid: string }[],
    ): TelephonyConfigServiceDeps {
      return {
        db: testDb.platformDb,
        secretsEncryptor,
        providerFactory: factory,
        providerStatics: new Map([
          [
            "twilio",
            {
              validateConfig: (raw: unknown): unknown =>
                twilioConfigSchema.parse(raw),
              provisionWebhooks: async (config: unknown): Promise<unknown> => ({
                ...(config as Record<string, unknown>),
                phoneNumbers: [...provisionedPhones],
              }),
            },
          ],
        ]),
      };
    }

    /** Creates the service with NODE_ENV=development so the dev-only
     *  seeding method is exposed. Restores the env before returning. */
    function createServiceInDevEnv(
      deps: TelephonyConfigServiceDeps,
    ): TelephonyConfigService {
      const prevNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      _resetEnvCache();
      try {
        return createTelephonyConfigService(deps);
      } finally {
        if (prevNodeEnv === undefined) {
          delete process.env.NODE_ENV;
        } else {
          process.env.NODE_ENV = prevNodeEnv;
        }
        _resetEnvCache();
      }
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

      it("serves the updated config to providers fetched after save", async () => {
        // Observable cache-invalidation behavior: prime the factory cache,
        // save a new config, and verify a subsequently fetched provider
        // reflects the new credentials instead of stale cached ones. Uses
        // the real factory and Twilio constructor; the Twilio mask keeps
        // the last 4 characters of the account SID visible, enough to tell
        // the two configs apart.
        const factory = createProviderFactory({
          db: testDb.platformDb,
          secretsEncryptor,
          providerConstructors: new Map([["twilio", createTwilioProvider]]),
        });
        const deps: TelephonyConfigServiceDeps = {
          ...buildDbDeps(),
          providerFactory: factory,
        };
        const service = createTelephonyConfigService(deps);

        await service.saveConfig({
          orgId: TEST_ORG_ID,
          provider: "twilio",
          accountId: "ACcacheold03aa",
          authToken: "test-tok-cache-03a",
        });
        const before = await factory.getProvider(TEST_ORG_ID);
        expect(before.maskConfig().maskedAccountId).toContain("03aa");

        await service.saveConfig({
          orgId: TEST_ORG_ID,
          provider: "twilio",
          accountId: "ACcachenew03bb",
          authToken: "test-tok-cache-03b",
        });
        const after = await factory.getProvider(TEST_ORG_ID);
        expect(after.maskConfig().maskedAccountId).toContain("03bb");
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

      it("persists nothing when the credentials fail provider validation", async () => {
        const orgId = await insertOrgRow("save-invalid");
        const service = createTelephonyConfigService(buildDbDeps());

        // An empty account id fails the twilio config schema inside the
        // provider static. The thrown type is the validator's own (a
        // ZodError today), so the assertion is on the no-write contract.
        await expect(
          service.saveConfig({
            orgId,
            provider: "twilio",
            accountId: "",
            authToken: "test-tok-invalid-07",
          }),
        ).rejects.toThrow();

        expect(await service.lookupWebhookConfig(orgId)).toBeNull();
      });

      it("clears previously provisioned phone numbers when credentials are re-saved", async () => {
        const orgId = await insertOrgRow("resave");
        const factory = buildRealFactory();
        const service = createTelephonyConfigService(
          buildProvisioningDeps(factory, [
            { number: "+15550300005", sid: "PNprov005" },
          ]),
        );

        await service.saveConfig({
          orgId,
          provider: "twilio",
          accountId: "ACresave05aa",
          authToken: "test-tok-resave-05",
        });
        await service.provisionWebhooks(orgId, "https://hooks.example.test");
        expect(await service.lookupProvisionedPhones(orgId)).toHaveLength(1);

        await service.saveConfig({
          orgId,
          provider: "twilio",
          accountId: "ACresave05bb",
          authToken: "test-tok-resave-06",
        });

        // Contract: re-saving credentials resets the config to an
        // unprovisioned state; webhook provisioning must run again.
        expect(await service.lookupProvisionedPhones(orgId)).toEqual([]);
        expect(await service.lookupWebhookConfig(orgId)).toEqual({
          provider: "twilio",
          accountSid: "ACresave05bb",
          authToken: "test-tok-resave-06",
        });
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

      it("throws TelephonyConfigError when the stored blob fails the provider schema", async () => {
        // saveConfig validates before writing, so a schema-invalid blob can
        // only exist via direct DB writes (manual ops, restore drift).
        const orgId = await insertRawConfigRow(
          "twilio",
          encryptJson({ mode: "byot" }),
        );
        const service = createTelephonyConfigService(buildDbDeps());

        await expect(service.lookupWebhookConfig(orgId)).rejects.toThrow(
          TelephonyConfigError,
        );
      });

      it("throws TelephonyConfigError for a valid signalwire config (webhook fields are twilio-shaped)", async () => {
        // Pins a known gap: lookupWebhookConfig extracts accountSid/authToken,
        // which signalwire configs do not carry (projectId/apiToken/spaceUrl).
        // When SignalWire webhook validation is implemented, that contract
        // changes and this test should be updated alongside it.
        const orgId = await insertRawConfigRow(
          "signalwire",
          encryptJson({
            mode: "cloud",
            projectId: "proj-test-1",
            apiToken: "test-tok-sw-1",
            spaceUrl: "example.signalwire.com",
            phoneNumbers: [],
          }),
        );
        const service = createTelephonyConfigService(buildDbDeps());

        await expect(service.lookupWebhookConfig(orgId)).rejects.toThrow(
          TelephonyConfigError,
        );
      });

      it("throws SecretCryptoError when the stored blob cannot be decrypted", async () => {
        const orgId = await insertRawConfigRow("twilio", randomBytes(64));
        const service = createTelephonyConfigService(buildDbDeps());

        await expect(service.lookupWebhookConfig(orgId)).rejects.toThrow(
          SecretCryptoError,
        );
      });
    });

    describe("clearConfig", () => {
      it("removes the config so reads return empty and provisioning reports not configured", async () => {
        const orgId = await insertOrgRow("clear");
        const service = createTelephonyConfigService(buildDbDeps());
        await service.saveConfig({
          orgId,
          provider: "twilio",
          accountId: "ACclearme01",
          authToken: "test-tok-clear-01",
        });
        expect(await service.lookupWebhookConfig(orgId)).not.toBeNull();

        await service.clearConfig(orgId);

        // Read-after-delete contract: webhook lookup returns null, phones
        // are empty, and provisioning fails with NotFoundError.
        expect(await service.lookupWebhookConfig(orgId)).toBeNull();
        expect(await service.lookupProvisionedPhones(orgId)).toEqual([]);
        await expect(
          service.provisionWebhooks(orgId, "https://hooks.example.test"),
        ).rejects.toThrow(NotFoundError);
      });

      it("stops serving a previously cached provider after delete", async () => {
        const orgId = await insertOrgRow("clear-cache");
        const factory = buildRealFactory();
        const service = createTelephonyConfigService({
          ...buildDbDeps(),
          providerFactory: factory,
        });

        await service.saveConfig({
          orgId,
          provider: "twilio",
          accountId: "ACdeleteme02aa",
          authToken: "test-tok-clear-02",
        });
        const before = await service.getMaskedConfig(orgId);
        expect(before?.maskedAccountId).toContain("02aa");

        await service.clearConfig(orgId);

        // The factory served this org before the delete; afterwards it must
        // not keep serving the deleted credentials from its cache.
        expect(await service.getMaskedConfig(orgId)).toBeNull();
        await expect(factory.getProvider(orgId)).rejects.toThrow(NotFoundError);
      });

      it("leaves other orgs' configs untouched", async () => {
        const orgA = await insertOrgRow("iso-a");
        const orgB = await insertOrgRow("iso-b");
        const service = createTelephonyConfigService(buildDbDeps());
        await service.saveConfig({
          orgId: orgA,
          provider: "twilio",
          accountId: "ACisolate0a",
          authToken: "test-tok-iso-0a",
        });
        await service.saveConfig({
          orgId: orgB,
          provider: "twilio",
          accountId: "ACisolate0b",
          authToken: "test-tok-iso-0b",
        });

        await service.clearConfig(orgA);

        expect(await service.lookupWebhookConfig(orgA)).toBeNull();
        expect(await service.lookupWebhookConfig(orgB)).toEqual({
          provider: "twilio",
          accountSid: "ACisolate0b",
          authToken: "test-tok-iso-0b",
        });
      });

      it("is a no-op for an org that has no config", async () => {
        const orgId = await insertOrgRow("clear-none");
        const service = createTelephonyConfigService(buildDbDeps());

        await expect(service.clearConfig(orgId)).resolves.toBeUndefined();
      });
    });

    describe("provisionWebhooks", () => {
      it("persists provisioned numbers and serves them to providers fetched after", async () => {
        const orgId = await insertOrgRow("prov");
        const factory = buildRealFactory();
        const phones = [
          { number: "+15550300001", sid: "PNprov001" },
          { number: "+15550300002", sid: "PNprov002" },
        ];
        const service = createTelephonyConfigService(
          buildProvisioningDeps(factory, phones),
        );

        await service.saveConfig({
          orgId,
          provider: "twilio",
          accountId: "ACprovision03",
          authToken: "test-tok-prov-03",
        });
        const before = await factory.getProvider(orgId);
        expect(before.maskConfig().phoneNumbers).toEqual([]);

        const result = await service.provisionWebhooks(
          orgId,
          "https://hooks.example.test",
        );

        expect(result).toEqual({ success: true, phoneNumberCount: 2 });
        expect(await service.lookupProvisionedPhones(orgId)).toEqual(phones);

        // Cache-invalidation contract: a provider fetched after provisioning
        // serves the updated phone list, not the pre-provisioning config.
        const after = await factory.getProvider(orgId);
        expect(after.maskConfig().phoneNumbers).toEqual([
          { number: "+15550300001" },
          { number: "+15550300002" },
        ]);
      });

      it("persists nothing when the provisioned config fails validation", async () => {
        const orgId = await insertOrgRow("prov-invalid");
        // The number missing its "+" prefix fails the twilio config schema
        // after provisioning returns.
        const service = createTelephonyConfigService(
          buildProvisioningDeps(buildRealFactory(), [
            { number: "15550300009", sid: "PNbad001" },
          ]),
        );

        await service.saveConfig({
          orgId,
          provider: "twilio",
          accountId: "ACprovbad04",
          authToken: "test-tok-prov-04",
        });

        // The thrown type is the provider validator's own (a ZodError
        // today), so the assertion is on the state contract below.
        await expect(
          service.provisionWebhooks(orgId, "https://hooks.example.test"),
        ).rejects.toThrow();

        expect(await service.lookupWebhookConfig(orgId)).toEqual({
          provider: "twilio",
          accountSid: "ACprovbad04",
          authToken: "test-tok-prov-04",
        });
        expect(await service.lookupProvisionedPhones(orgId)).toEqual([]);
      });
    });

    describe("lookupProvisionedPhones", () => {
      it("returns empty array when the stored config has no phone number list", async () => {
        const orgId = await insertRawConfigRow(
          "twilio",
          encryptJson({
            accountSid: "ACnophones01",
            authToken: "test-tok-nophones",
          }),
        );
        const service = createTelephonyConfigService(buildDbDeps());

        expect(await service.lookupProvisionedPhones(orgId)).toEqual([]);
      });

      it("normalizes provider-specific phone ids to sid", async () => {
        const orgId = await insertRawConfigRow(
          "signalwire",
          encryptJson({
            phoneNumbers: [
              { number: "+15550600001", id: "SWID001" },
              { number: "+15550600002" },
            ],
          }),
        );
        const service = createTelephonyConfigService(buildDbDeps());

        // sid falls back to the provider-specific id, then to the number.
        expect(await service.lookupProvisionedPhones(orgId)).toEqual([
          { number: "+15550600001", sid: "SWID001" },
          { number: "+15550600002", sid: "+15550600002" },
        ]);
      });
    });

    describe("getPhonePurpose / setPhonePurpose", () => {
      it("round-trips purpose assignments through tenant org_config", async () => {
        // org_config is a singleton row that a fresh test schema lacks.
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
        const service = createTelephonyConfigService(buildDbDeps());

        expect(await service.getPhonePurpose(testDb.db)).toEqual({
          outboundSid: null,
          systemSid: null,
        });

        await service.setPhonePurpose(testDb.db, {
          outboundSid: "PNpurpose01",
          systemSid: "PNpurpose02",
        });
        expect(await service.getPhonePurpose(testDb.db)).toEqual({
          outboundSid: "PNpurpose01",
          systemSid: "PNpurpose02",
        });

        await service.setPhonePurpose(testDb.db, {
          outboundSid: "PNpurpose03",
          systemSid: null,
        });
        expect(await service.getPhonePurpose(testDb.db)).toEqual({
          outboundSid: "PNpurpose03",
          systemSid: null,
        });
      });
    });

    describe("devSeedConfigWithPhones", () => {
      it("seeds a valid mock provider config that serves the given phones (development only)", async () => {
        const orgId = await insertOrgRow("devseed");
        const factory = buildRealFactory();
        const service = createServiceInDevEnv({
          ...buildDbDeps(),
          providerFactory: factory,
        });

        expect(service.devSeedConfigWithPhones).toBeDefined();
        await service.devSeedConfigWithPhones?.(orgId, [
          { number: "+15550500001", sid: "PNseed001", label: "Main" },
          { number: "+15550500002", sid: "PNseed002" },
        ]);

        expect(await service.lookupProvisionedPhones(orgId)).toEqual([
          { number: "+15550500001", sid: "PNseed001" },
          { number: "+15550500002", sid: "PNseed002" },
        ]);

        // The seeded blob must be a valid mock config: a real provider is
        // constructible from it and serves the seeded numbers.
        const provider = await factory.getProvider(orgId);
        expect(provider.providerId).toBe("mock");
        expect(provider.maskConfig().phoneNumbers).toEqual([
          { number: "+15550500001", label: "Main" },
          { number: "+15550500002", label: undefined },
        ]);

        const webhookCfg = await service.lookupWebhookConfig(orgId);
        expect(webhookCfg?.provider).toBe("mock");
        expect(webhookCfg?.accountSid).toBe(DEV_MOCK_ACCOUNT_SID);
        expect(webhookCfg?.authToken).toBe(DEV_MOCK_AUTH_TOKEN);
      });
    });
  },
);
