import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProviderFactory,
  type ProviderFactoryDeps,
  type ProviderConstructor,
} from "./factory.js";
import type { TelephonyProvider } from "./provider.js";
import { deriveSecretsKey, createSecretsEncryptor } from "../config/secrets.js";
import { NotFoundError, TelephonyConfigError } from "../errors.js";

const TEST_OPS_KEY = Buffer.from(
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe",
  "hex",
);

const secretsKey = deriveSecretsKey(TEST_OPS_KEY);
const secretsEncryptor = createSecretsEncryptor(secretsKey);

/** Minimal TelephonyProvider stub for testing. */
function createStubProvider(providerId: string): TelephonyProvider {
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
        callId: "c",
        from: "+1",
        to: "+1",
        direction: "inbound" as const,
      };
    },
    parseIncomingSms() {
      return {
        messageId: "m",
        from: "+1",
        to: "+1",
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

interface MockDb {
  db: ProviderFactoryDeps["db"];
  selectFromSpy: ReturnType<typeof vi.fn>;
}

function createMockDb(row: Record<string, unknown> | undefined): MockDb {
  const executeTakeFirst = vi.fn().mockResolvedValue(row);
  const where = vi.fn().mockReturnValue({ executeTakeFirst });
  const selectAll = vi.fn().mockReturnValue({ where });
  const selectFromSpy = vi.fn().mockReturnValue({ selectAll });
  const db = {
    selectFrom: selectFromSpy,
  } as unknown as ProviderFactoryDeps["db"];
  return { db, selectFromSpy };
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
    const provider = await factory.getProvider("org-1");
    expect(provider.providerId).toBe("twilio");
    expect(mockConstructor).toHaveBeenCalledOnce();
  });

  it("throws NotFoundError when no config row exists", async () => {
    const { db } = createMockDb(undefined);
    const factory = buildFactory(db);
    await expect(factory.getProvider("org-1")).rejects.toThrow(NotFoundError);
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
    await expect(factory.getProvider("org-1")).rejects.toThrow(
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
    await expect(factory.getProvider("org-1")).rejects.toThrow(
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
    await expect(factory.getProvider("org-1")).rejects.toThrow(
      TelephonyConfigError,
    );
  });

  it("caches: second call returns same instance without re-querying DB", async () => {
    const { db, selectFromSpy } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const first = await factory.getProvider("org-1");
    const second = await factory.getProvider("org-1");
    expect(second).toBe(first);
    expect(selectFromSpy).toHaveBeenCalledTimes(1);
  });

  it("invalidate: next call rebuilds provider from DB", async () => {
    const { db, selectFromSpy } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const first = await factory.getProvider("org-1");
    factory.invalidate("org-1");
    const second = await factory.getProvider("org-1");
    expect(second).not.toBe(first);
    expect(selectFromSpy).toHaveBeenCalledTimes(2);
  });

  it("invalidateAll: clears all cached entries", async () => {
    const { db, selectFromSpy } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const first = await factory.getProvider("org-1");
    factory.invalidateAll();
    const second = await factory.getProvider("org-1");
    expect(second).not.toBe(first);
    expect(selectFromSpy).toHaveBeenCalledTimes(2);
  });

  it("succeeds after decrypting and parsing config", async () => {
    const { db } = createMockDb({
      org_id: "org-1",
      provider: "twilio",
      config: encryptConfig(VALID_TWILIO_CONFIG),
      key_version: 1,
    });
    const factory = buildFactory(db);
    const provider = await factory.getProvider("org-1");
    expect(provider.providerId).toBe("twilio");
  });
});
