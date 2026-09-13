import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProviderFactory,
  type ProviderFactoryDeps,
  type ProviderConstructor,
} from "./factory.js";
import type { TelephonyProvider } from "./provider.js";
import { deriveSecretsKey, createSecretsEncryptor } from "../config/secrets.js";
import { NotFoundError, TelephonyConfigError } from "../errors.js";
import {
  createMockProvider,
  DEV_MOCK_ACCOUNT_SID,
  DEV_MOCK_AUTH_TOKEN,
} from "./mock-provider.js";
import type { OrgId, CallSid, E164, StoredProviderId } from "@care-y/shared";

const TEST_OPS_KEY = Buffer.from(
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe",
  "hex",
);

const secretsKey = deriveSecretsKey(TEST_OPS_KEY);
const secretsEncryptor = createSecretsEncryptor(secretsKey);

/** Minimal TelephonyProvider stub for testing. */
function createStubProvider(providerId: StoredProviderId): TelephonyProvider {
  return {
    providerId,
    async sendSms() {
      return { messageId: "stub" };
    },
    async initiateOutboundCall() {
      return "stub-call";
    },
    async initiateWebRtcCall() {
      return "stub-webrtc";
    },
    validateWebhook() {
      return true;
    },
    parseIncomingCall() {
      return {
        callId: "c" as CallSid,
        from: "+10000000000" as E164,
        to: "+10000000001" as E164,
        direction: "inbound" as const,
      };
    },
    parseIncomingSms() {
      return {
        messageId: "m",
        from: "+10000000000" as E164,
        to: "+10000000001" as E164,
        body: "",
        numMedia: 0,
        mediaUrls: [],
        mediaContentTypes: [],
      };
    },
    generateVoiceResponse() {
      return "<Response/>";
    },
    async getRecording() {
      return Buffer.alloc(0);
    },
    async getCallDetails() {
      return { from: "+15550000001" as E164, to: "+15550000002" as E164 };
    },
    async deleteRecording() {
      // no-op stub
    },
    async deleteCallLog() {
      // no-op stub
    },
    async deleteMessageLog() {
      // no-op stub
    },
    maskConfig() {
      return {
        provider: providerId,
        mode: "byot",
        maskedAccountId: "AC***",
        maskedAuthToken: "****",
        phoneNumbers: [],
      };
    },
  };
}

function createMockDb(row: Record<string, unknown> | undefined): {
  db: ProviderFactoryDeps["db"];
} {
  const executeTakeFirst = vi.fn().mockResolvedValue(row);
  const where = vi.fn().mockReturnValue({ executeTakeFirst });
  const selectAll = vi.fn().mockReturnValue({ where });
  const selectFrom = vi.fn().mockReturnValue({ selectAll });
  const db = { selectFrom } as unknown as ProviderFactoryDeps["db"];
  return { db };
}

function encryptConfig(config: Record<string, unknown>): Buffer {
  const plaintext = Buffer.from(JSON.stringify(config), "utf-8");
  return secretsEncryptor.encrypt(plaintext);
}

const VALID_TWILIO_CONFIG = {
  mode: "byot",
  accountSid: "ACtest123",
  authToken: "tok123",
  phoneNumbers: [{ number: "+15551234567", sid: "PN123" }],
};

describe("createProviderFactory", () => {
  let mockConstructor: ReturnType<typeof vi.fn<ProviderConstructor>>;

  beforeEach(() => {
    mockConstructor = vi.fn<ProviderConstructor>((_config: unknown) =>
      createStubProvider("twilio"),
    );
  });

  function buildFactory(
    db: ProviderFactoryDeps["db"],
  ): ReturnType<typeof createProviderFactory> {
    return createProviderFactory({
      db,
      secretsEncryptor,
      providerConstructors: new Map([["twilio", mockConstructor]]),
    });
  }

  it("returns a provider instance for valid config", async () => {
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const provider = await factory.getProvider("org-1" as OrgId);
    expect(provider.providerId).toBe("twilio");
    expect(mockConstructor).toHaveBeenCalledOnce();
  });

  it("throws NotFoundError when no config row exists", async () => {
    const { db } = createMockDb(undefined);
    const factory = buildFactory(db);
    await expect(factory.getProvider("org-1" as OrgId)).rejects.toThrow(
      NotFoundError,
    );
  });

  it("throws TelephonyConfigError for invalid JSON blob", async () => {
    const garbled = secretsEncryptor.encrypt(
      Buffer.from("not json{{{", "utf-8"),
    );
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: garbled,
      key_version: 1,
    });
    const factory = buildFactory(db);
    await expect(factory.getProvider("org-1" as OrgId)).rejects.toThrow(
      TelephonyConfigError,
    );
  });

  it("throws TelephonyConfigError for unknown provider", async () => {
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "unknown",
      config: encryptConfig({ foo: "bar" }),
      key_version: 1,
    });
    const factory = buildFactory(db);
    await expect(factory.getProvider("org-1" as OrgId)).rejects.toThrow(
      TelephonyConfigError,
    );
  });

  it("throws TelephonyConfigError when no constructor is registered", async () => {
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "signalwire",
      config: encryptConfig({
        mode: "cloud",
        projectId: "p1",
        apiToken: "t1",
        spaceUrl: "s1",
        phoneNumbers: [],
      }),
      key_version: 1,
    });
    // Factory only has "twilio" registered, not "signalwire"
    const factory = buildFactory(db);
    await expect(factory.getProvider("org-1" as OrgId)).rejects.toThrow(
      TelephonyConfigError,
    );
  });

  it("caches: second call returns same instance", async () => {
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const first = await factory.getProvider("org-1" as OrgId);
    const second = await factory.getProvider("org-1" as OrgId);
    expect(second).toBe(first);
    // Constructor called only once proves caching works at the behavioral level
    expect(mockConstructor).toHaveBeenCalledTimes(1);
  });

  it("invalidate: next call rebuilds provider", async () => {
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const first = await factory.getProvider("org-1" as OrgId);
    factory.invalidate("org-1" as OrgId);
    const second = await factory.getProvider("org-1" as OrgId);
    expect(second).not.toBe(first);
    expect(mockConstructor).toHaveBeenCalledTimes(2);
  });

  it("invalidateAll: clears all cached entries", async () => {
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const first = await factory.getProvider("org-1" as OrgId);
    factory.invalidateAll();
    const second = await factory.getProvider("org-1" as OrgId);
    expect(second).not.toBe(first);
    expect(mockConstructor).toHaveBeenCalledTimes(2);
  });

  it("constructs a mock provider through the factory when registered", async () => {
    const mockConfig = {
      accountSid: DEV_MOCK_ACCOUNT_SID,
      authToken: DEV_MOCK_AUTH_TOKEN,
      phoneNumbers: [
        { number: "+15550001111", sid: "PNdev001", label: "Main" },
      ],
    };
    const { db } = createMockDb({
      org_id: "org-mock",
      provider: "mock",
      config: encryptConfig(mockConfig),
      key_version: 1,
    });
    const factory = createProviderFactory({
      db,
      secretsEncryptor,
      providerConstructors: new Map<string, ProviderConstructor>([
        ["twilio", mockConstructor],
        ["mock", createMockProvider],
      ]),
    });

    const provider = await factory.getProvider("org-mock" as OrgId);
    expect(provider.providerId).toBe("mock");
    expect(provider.maskConfig().phoneNumbers).toEqual([
      { number: "+15550001111", label: "Main" },
    ]);
  });

  it("production fail-closed: mock schema passes but missing constructor throws TelephonyConfigError", async () => {
    // Simulates production: mock is in providerConfigSchemas (unconditional)
    // but NOT in providerConstructors (prod-gated). Schema validation passes
    // but the constructor lookup fails.
    const mockConfig = {
      accountSid: DEV_MOCK_ACCOUNT_SID,
      authToken: DEV_MOCK_AUTH_TOKEN,
      phoneNumbers: [],
    };
    const { db } = createMockDb({
      org_id: "org-prod-mock",
      provider: "mock",
      config: encryptConfig(mockConfig),
      key_version: 1,
    });
    // Only "twilio" registered, simulating production constructor map
    const factory = buildFactory(db);

    await expect(factory.getProvider("org-prod-mock" as OrgId)).rejects.toThrow(
      TelephonyConfigError,
    );
  });
});
