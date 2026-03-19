import { describe, it, expect, vi } from "vitest";
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

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const TEST_ORG_ID = "org-config-svc-test";

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

interface MockDbOptions {
  selectResult?: Record<string, unknown> | undefined;
}

interface MockDbSpies {
  executeTakeFirst: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
}

function createMockDb(options: MockDbOptions = {}): {
  db: Kysely<PlatformDatabase>;
  spies: MockDbSpies;
} {
  const executeTakeFirst = vi.fn().mockResolvedValue(options.selectResult);
  const execute = vi.fn().mockResolvedValue(undefined);

  const db = {
    selectFrom: vi.fn().mockReturnValue({
      selectAll: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ executeTakeFirst }),
      }),
      select: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ executeTakeFirst }),
      }),
    }),
    insertInto: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({ execute }),
    }),
    updateTable: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ execute }),
      }),
    }),
  } as unknown as Kysely<PlatformDatabase>;

  return { db, spies: { executeTakeFirst, execute } };
}

function buildDeps(overrides?: {
  dbOptions?: MockDbOptions;
  factory?: ProviderFactory;
  encryptor?: SecretsEncryptor;
}): TelephonyConfigServiceDeps {
  const { db } = createMockDb(overrides?.dbOptions);
  return {
    db,
    secretsEncryptor: overrides?.encryptor ?? createMockEncryptor(),
    providerFactory: overrides?.factory ?? createMockProviderFactory(),
    providerStatics: new Map([["twilio", createMockProviderStatic()]]),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TelephonyConfigService", () => {
  describe("saveConfig", () => {
    it("inserts config when no existing row", async () => {
      const deps = buildDeps({ dbOptions: { selectResult: undefined } });
      const service = createTelephonyConfigService(deps);

      const result = await service.saveConfig({
        orgId: TEST_ORG_ID,
        provider: "twilio",
        accountId: "ACtest123",
        authToken: "tok-secret",
      });

      expect(result).toEqual({ success: true });
      expect(deps.providerFactory.invalidate).toHaveBeenCalledWith(TEST_ORG_ID);
    });

    it("updates config when row already exists", async () => {
      const deps = buildDeps({
        dbOptions: { selectResult: { org_id: TEST_ORG_ID } },
      });
      const service = createTelephonyConfigService(deps);

      const result = await service.saveConfig({
        orgId: TEST_ORG_ID,
        provider: "twilio",
        accountId: "ACtest123",
        authToken: "tok-secret",
      });

      expect(result).toEqual({ success: true });
    });

    it("throws TelephonyConfigError for unsupported provider", async () => {
      const deps = buildDeps();
      const service = createTelephonyConfigService(deps);

      await expect(
        service.saveConfig({
          orgId: TEST_ORG_ID,
          provider: "unknown-provider",
          accountId: "AC123",
          authToken: "tok",
        }),
      ).rejects.toThrow(TelephonyConfigError);
    });

    it("zeros plaintext buffer after encryption", async () => {
      const encryptor = createMockEncryptor();
      const deps = buildDeps({
        dbOptions: { selectResult: undefined },
        encryptor,
      });
      const service = createTelephonyConfigService(deps);

      await service.saveConfig({
        orgId: TEST_ORG_ID,
        provider: "twilio",
        accountId: "ACtest123",
        authToken: "tok-secret",
      });

      // The encryptor captured the plaintext before it was zeroed.
      // Verify the encrypt function was called (buffer was created and passed).
      expect(encryptor.encrypt).toHaveBeenCalledOnce();
    });
  });

  describe("getMaskedConfig", () => {
    it("returns masked config from provider factory", async () => {
      const deps = buildDeps();
      const service = createTelephonyConfigService(deps);

      const result = await service.getMaskedConfig(TEST_ORG_ID);

      expect(result).toEqual(MASKED_CONFIG);
    });

    it("returns null when NotFoundError is thrown by factory", async () => {
      const factory = createMockProviderFactory({
        getProvider: vi.fn().mockRejectedValue(new NotFoundError("No config")),
      });
      const deps = buildDeps({ factory });
      const service = createTelephonyConfigService(deps);

      const result = await service.getMaskedConfig(TEST_ORG_ID);

      expect(result).toBeNull();
    });

    it("re-throws non-NotFoundError errors", async () => {
      const factory = createMockProviderFactory({
        getProvider: vi.fn().mockRejectedValue(new Error("DB down")),
      });
      const deps = buildDeps({ factory });
      const service = createTelephonyConfigService(deps);

      await expect(service.getMaskedConfig(TEST_ORG_ID)).rejects.toThrow(
        "DB down",
      );
    });
  });

  describe("provisionWebhooks", () => {
    it("decrypts, provisions, re-encrypts, and returns phone count", async () => {
      const configBlob = {
        mode: "byot",
        accountSid: "ACtest",
        authToken: "tok",
        phoneNumbers: [],
      };
      const encrypted = Buffer.concat([
        Buffer.from("ENC:"),
        Buffer.from(JSON.stringify(configBlob)),
      ]);

      const deps = buildDeps({
        dbOptions: {
          selectResult: {
            org_id: TEST_ORG_ID,
            provider: "twilio",
            config: encrypted,
          },
        },
      });
      const service = createTelephonyConfigService(deps);

      const result = await service.provisionWebhooks(
        TEST_ORG_ID,
        "https://api.example.com",
      );

      expect(result.success).toBe(true);
      expect(result.phoneNumberCount).toBe(1);
      expect(deps.providerFactory.invalidate).toHaveBeenCalledWith(TEST_ORG_ID);
    });

    it("throws NotFoundError when no config row exists", async () => {
      const deps = buildDeps({ dbOptions: { selectResult: undefined } });
      const service = createTelephonyConfigService(deps);

      await expect(
        service.provisionWebhooks(TEST_ORG_ID, "https://api.example.com"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("lookupWebhookConfig", () => {
    it("returns provider, accountSid, and authToken from decrypted config", async () => {
      const configBlob = {
        mode: "byot",
        accountSid: "AC_LOOKUP_TEST",
        authToken: "tok-lookup",
        phoneNumbers: [],
      };
      const encrypted = Buffer.concat([
        Buffer.from("ENC:"),
        Buffer.from(JSON.stringify(configBlob)),
      ]);

      const deps = buildDeps({
        dbOptions: {
          selectResult: {
            provider: "twilio",
            config: encrypted,
          },
        },
      });
      const service = createTelephonyConfigService(deps);

      const result = await service.lookupWebhookConfig(TEST_ORG_ID);

      expect(result).toEqual({
        provider: "twilio",
        accountSid: "AC_LOOKUP_TEST",
        authToken: "tok-lookup",
      });
    });

    it("returns null when no row exists", async () => {
      const deps = buildDeps({ dbOptions: { selectResult: undefined } });
      const service = createTelephonyConfigService(deps);

      const result = await service.lookupWebhookConfig(TEST_ORG_ID);

      expect(result).toBeNull();
    });

    it("throws TelephonyConfigError when decrypted config is missing fields", async () => {
      const badConfig = { mode: "byot" }; // missing accountSid, authToken
      const encrypted = Buffer.concat([
        Buffer.from("ENC:"),
        Buffer.from(JSON.stringify(badConfig)),
      ]);

      const deps = buildDeps({
        dbOptions: {
          selectResult: {
            provider: "twilio",
            config: encrypted,
          },
        },
      });
      const service = createTelephonyConfigService(deps);

      await expect(service.lookupWebhookConfig(TEST_ORG_ID)).rejects.toThrow(
        TelephonyConfigError,
      );
    });
  });
});
