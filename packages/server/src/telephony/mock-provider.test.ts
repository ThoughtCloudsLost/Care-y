import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createMockProvider,
  mockProviderStatic,
  DEV_MOCK_ACCOUNT_SID,
  DEV_MOCK_AUTH_TOKEN,
} from "./mock-provider.js";
import type { MockTelephonyProvider } from "./mock-provider.js";
import type { MockConfig } from "./schemas.js";
import { createHmacValidator, twilioPayloadBuilder } from "./webhook-crypto.js";
import { TelephonyConfigError } from "../errors.js";

/** Minimal valid mock config for tests that do not care about phone numbers. */
const MINIMAL_CONFIG: MockConfig = {
  accountSid: DEV_MOCK_ACCOUNT_SID,
  authToken: DEV_MOCK_AUTH_TOKEN,
  phoneNumbers: [],
};

/** Config with seeded phone numbers for maskConfig tests. */
const CONFIG_WITH_PHONES: MockConfig = {
  accountSid: DEV_MOCK_ACCOUNT_SID,
  authToken: DEV_MOCK_AUTH_TOKEN,
  phoneNumbers: [
    { number: "+15550001111", sid: "PNdev001", label: "Main" },
    { number: "+15550002222", sid: "PNdev002" },
  ],
};

describe("createMockProvider", () => {
  let provider: MockTelephonyProvider;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    provider = createMockProvider(MINIMAL_CONFIG);
    // Silences the mock provider's per-call console.warn output.
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("throws TelephonyConfigError for invalid config", () => {
    expect(() => createMockProvider({ bad: true })).toThrow(
      TelephonyConfigError,
    );
  });

  describe("sendSms", () => {
    it("returns SID with SM_mock_ prefix", async () => {
      const result = await provider.sendSms(
        "+15559876543",
        "Test message",
        "+15551234567",
      );

      expect(result.messageId).toMatch(/^SM_mock_/);
    });

    it("returns a valid UUID after the prefix", async () => {
      const result = await provider.sendSms(
        "+15550001111",
        "hi",
        "+15550002222",
      );
      const uuid = result.messageId.replace("SM_mock_", "");

      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe("initiateOutboundCall", () => {
    it("returns SID with CA_mock_ prefix", async () => {
      const sid = await provider.initiateOutboundCall({
        consultantPhone: "+15550001111",
        clientPhone: "+15550002222",
        callerId: "+15551234567",
        confirmWebhookUrl: "https://example.com/confirm",
        statusWebhookUrl: "https://example.com/status",
      });

      expect(sid).toMatch(/^CA_mock_/);
    });
  });

  describe("initiateWebRtcCall", () => {
    it("returns SID with CA_mock_ prefix", async () => {
      const sid = await provider.initiateWebRtcCall({
        clientPhone: "+15550003333",
        callerId: "+15551234567",
        statusWebhookUrl: "https://example.com/webrtc-status",
      });

      expect(sid).toMatch(/^CA_mock_/);
    });
  });

  describe("validateWebhook", () => {
    const hmac = createHmacValidator({
      algorithm: "sha1",
      buildPayload: twilioPayloadBuilder,
    });

    it("accepts a correctly-signed request", () => {
      const url = "https://example.com/webhooks/mock/org-1/sms";
      const body = { CallSid: "CA123", From: "+15550001111" };
      const signature = hmac.computeSignature(url, body, DEV_MOCK_AUTH_TOKEN);

      const result = provider.validateWebhook({
        url,
        body,
        signature,
        authToken: DEV_MOCK_AUTH_TOKEN,
      });

      expect(result).toBe(true);
    });

    it("rejects a bad signature", () => {
      const result = provider.validateWebhook({
        url: "https://example.com/webhook",
        body: { CallSid: "CA123" },
        signature: "completely-wrong-signature",
        authToken: DEV_MOCK_AUTH_TOKEN,
      });

      expect(result).toBe(false);
    });
  });

  describe("parseIncomingCall", () => {
    it("extracts CallSid, From, To from body params", () => {
      const data = provider.parseIncomingCall({
        CallSid: "CA_INCOMING_555",
        From: "+15551111111",
        To: "+15552222222",
        CallStatus: "ringing",
      });

      expect(data).toEqual({
        callId: "CA_INCOMING_555",
        from: "+15551111111",
        to: "+15552222222",
        direction: "inbound",
      });
    });

    it("uses fallback defaults when body params are missing", () => {
      const data = provider.parseIncomingCall({});

      expect(data.callId).toMatch(/^mock-call-/);
      expect(data.from).toBe("+10000000000");
      expect(data.to).toBe("+10000000001");
      expect(data.direction).toBe("inbound");
    });
  });

  describe("parseIncomingSms", () => {
    it("extracts structured data from body with media fields", () => {
      const data = provider.parseIncomingSms({
        MessageSid: "SM_INCOMING_777",
        From: "+15551111111",
        To: "+15552222222",
        Body: "Hello from SMS",
        NumMedia: "2",
        MediaUrl0: "https://api.twilio.com/media/0.jpg",
        MediaContentType0: "image/jpeg",
        MediaUrl1: "https://api.twilio.com/media/1.png",
        MediaContentType1: "image/png",
      });

      expect(data).toEqual({
        messageId: "SM_INCOMING_777",
        from: "+15551111111",
        to: "+15552222222",
        body: "Hello from SMS",
        numMedia: 2,
        mediaUrls: [
          "https://api.twilio.com/media/0.jpg",
          "https://api.twilio.com/media/1.png",
        ],
        mediaContentTypes: ["image/jpeg", "image/png"],
      });
    });

    it("uses fallback defaults when body params are missing", () => {
      const data = provider.parseIncomingSms({});

      expect(data.messageId).toMatch(/^mock-msg-/);
      expect(data.from).toBe("+10000000000");
      expect(data.to).toBe("+10000000001");
      expect(data.body).toBe("");
      expect(data.numMedia).toBe(0);
      expect(data.mediaUrls).toEqual([]);
      expect(data.mediaContentTypes).toEqual([]);
    });

    it("handles zero media with empty arrays", () => {
      const data = provider.parseIncomingSms({
        MessageSid: "SM_NO_MEDIA",
        From: "+15551111111",
        To: "+15552222222",
        Body: "No attachments",
        NumMedia: "0",
      });

      expect(data.numMedia).toBe(0);
      expect(data.mediaUrls).toEqual([]);
      expect(data.mediaContentTypes).toEqual([]);
    });
  });

  describe("generateVoiceResponse", () => {
    it("returns a bare Response element", () => {
      const xml = provider.generateVoiceResponse([
        { type: "say", attributes: { text: "Hello" } },
        { type: "hangup" },
      ]);

      expect(xml).toBe("<Response></Response>");
    });
  });

  describe("getRecording", () => {
    it("returns a 44-byte zero buffer", async () => {
      const buf = await provider.getRecording("RE_MOCK_123");

      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(buf.length).toBe(44);
      expect(buf.every((byte) => byte === 0)).toBe(true);
    });
  });

  describe("deleteRecording", () => {
    it("completes without throwing", async () => {
      await expect(
        provider.deleteRecording("RE_MOCK_456"),
      ).resolves.toBeUndefined();
    });
  });

  describe("deleteCallLog", () => {
    it("completes without throwing", async () => {
      await expect(
        provider.deleteCallLog("CA_MOCK_789"),
      ).resolves.toBeUndefined();
    });
  });

  describe("deleteMessageLog", () => {
    it("completes without throwing", async () => {
      await expect(
        provider.deleteMessageLog("SM_MOCK_321"),
      ).resolves.toBeUndefined();
    });
  });

  describe("maskConfig", () => {
    it("returns empty phoneNumbers for a config with none", () => {
      const masked = provider.maskConfig();

      expect(masked).toEqual({
        provider: "mock",
        mode: "mock",
        maskedAccountId: "MOCK_ACCOUNT",
        maskedAuthToken: "****",
        phoneNumbers: [],
      });
    });

    it("reports seeded phone numbers with labels", () => {
      const p = createMockProvider(CONFIG_WITH_PHONES);
      const masked = p.maskConfig();

      expect(masked.phoneNumbers).toEqual([
        { number: "+15550001111", label: "Main" },
        { number: "+15550002222", label: undefined },
      ]);
    });

    it("masks credentials (does not return raw accountSid or authToken)", () => {
      const p = createMockProvider(CONFIG_WITH_PHONES);
      const masked = p.maskConfig();

      expect(masked.maskedAccountId).toBe("MOCK_ACCOUNT");
      expect(masked.maskedAuthToken).toBe("****");
      // The masked config must not contain the raw credentials
      const serialized = JSON.stringify(masked);
      expect(serialized).not.toContain(DEV_MOCK_ACCOUNT_SID);
      expect(serialized).not.toContain(DEV_MOCK_AUTH_TOKEN);
    });
  });

  describe("getCallLog", () => {
    it("records all calls in order", async () => {
      await provider.sendSms("+15550001111", "msg1", "+15550009999");
      provider.validateWebhook({
        url: "https://example.com/hook",
        body: {},
        signature: "sig",
        authToken: "tok",
      });
      await provider.deleteCallLog("CA_LOG");

      const log = provider.getCallLog();

      expect(log).toHaveLength(3);
      expect(log[0]!.method).toBe("sendSms");
      expect(log[1]!.method).toBe("validateWebhook");
      expect(log[2]!.method).toBe("deleteCallLog");

      // Timestamps are monotonically non-decreasing
      for (let i = 1; i < log.length; i++) {
        expect(log[i]!.timestamp).toBeGreaterThanOrEqual(log[i - 1]!.timestamp);
      }
    });

    it("captures method arguments", async () => {
      await provider.sendSms("+15550001111", "the body", "+15550009999");

      const log = provider.getCallLog();
      expect(log[0]!.args).toEqual([
        "+15550001111",
        "the body",
        "+15550009999",
      ]);
    });
  });

  describe("clearCallLog", () => {
    it("empties the call history", async () => {
      await provider.sendSms("+15550001111", "msg", "+15550009999");
      expect(provider.getCallLog()).toHaveLength(1);

      provider.clearCallLog();
      expect(provider.getCallLog()).toHaveLength(0);
    });

    it("does not affect subsequent recordings", async () => {
      await provider.sendSms("+15550001111", "before", "+15550009999");
      provider.clearCallLog();
      await provider.sendSms("+15550002222", "after", "+15550008888");

      const log = provider.getCallLog();
      expect(log).toHaveLength(1);
      expect(log[0]!.args[0]).toBe("+15550002222");
    });
  });

  describe("providerId", () => {
    it("is set to mock", () => {
      expect(provider.providerId).toBe("mock");
    });
  });
});

describe("mockProviderStatic", () => {
  describe("validateConfig", () => {
    it("accepts a valid mock config", () => {
      const result = mockProviderStatic.validateConfig(MINIMAL_CONFIG);
      expect(result).toEqual(MINIMAL_CONFIG);
    });

    it("throws TelephonyConfigError for invalid config", () => {
      expect(() => mockProviderStatic.validateConfig({})).toThrow(
        TelephonyConfigError,
      );
    });
  });

  describe("provisionWebhooks", () => {
    it("returns the config unchanged (no remote provider)", async () => {
      const result = await mockProviderStatic.provisionWebhooks(
        MINIMAL_CONFIG,
        "org-1",
        "https://hooks.example.test",
      );
      expect(result).toBe(MINIMAL_CONFIG);
    });
  });
});

describe("dev credential constants", () => {
  it("account id carries the AC prefix the webhook handler compares against", () => {
    // routes/webhooks.ts checks body.AccountSid against the stored config,
    // and a simulator sending a differently shaped id would be rejected.
    expect(DEV_MOCK_ACCOUNT_SID).toMatch(/^AC/);
  });

  it("auth token is long enough to serve as an HMAC key", () => {
    expect(DEV_MOCK_AUTH_TOKEN.length).toBeGreaterThanOrEqual(32);
  });

  it("account id and auth token are distinct", () => {
    expect(DEV_MOCK_ACCOUNT_SID).not.toBe(DEV_MOCK_AUTH_TOKEN);
  });
});
