// Wire format contract: tests verify exact HTTP requests (URLs, methods, body params, headers)
// sent to the Twilio REST API. Changing these breaks production telephony operations.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TwilioConfig } from "./schemas.js";
import type { VoiceInstruction } from "./provider.js";
import { TelephonyError } from "../errors.js";
import { twilioHmacValidator } from "./webhook-crypto.js";
import {
  createTwilioProvider,
  twilioProviderStatic,
  createTwilioSubaccount,
  suspendTwilioSubaccount,
  closeTwilioSubaccount,
} from "./twilio.js";

const validConfig: TwilioConfig = {
  mode: "byot",
  accountSid: "AC1234567890abcdef",
  authToken: "test-auth-token-secret",
  phoneNumbers: [{ number: "+15551234567", sid: "PN123" }],
};

const ACCOUNT_BASE = `https://api.twilio.com/2010-04-01/Accounts/${validConfig.accountSid}`;
const API_BASE = "https://api.twilio.com/2010-04-01/Accounts";

describe("createTwilioProvider", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe("sendSms", () => {
    it("sends POST to /Messages.json with To, From, Body", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ sid: "SM999" }), { status: 201 }),
      );

      const provider = createTwilioProvider(validConfig);
      const result = await provider.sendSms(
        "+15559876543",
        "Hello there",
        "+15551234567",
      );

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${ACCOUNT_BASE}/Messages.json`);
      expect(init.method).toBe("POST");

      const body = new URLSearchParams(init.body as string);
      expect(body.get("To")).toBe("+15559876543");
      expect(body.get("From")).toBe("+15551234567");
      expect(body.get("Body")).toBe("Hello there");

      expect(result.messageId).toBe("SM999");
    });
  });

  describe("initiateOutboundCall", () => {
    it("sends POST to /Calls.json with correct params", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ sid: "CA111" }), { status: 201 }),
      );

      const provider = createTwilioProvider(validConfig);
      const callSid = await provider.initiateOutboundCall({
        consultantPhone: "+15550001111",
        clientPhone: "+15550002222",
        callerId: "+15551234567",
        confirmWebhookUrl: "https://example.com/confirm",
        statusWebhookUrl: "https://example.com/status",
      });

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${ACCOUNT_BASE}/Calls.json`);
      expect(init.method).toBe("POST");

      const body = new URLSearchParams(init.body as string);
      expect(body.get("To")).toBe("+15550001111");
      expect(body.get("From")).toBe("+15551234567");
      expect(body.get("Url")).toBe("https://example.com/confirm");
      expect(body.get("StatusCallback")).toBe("https://example.com/status");
      expect(body.get("Method")).toBe("POST");
      expect(body.get("StatusCallbackMethod")).toBe("POST");

      expect(callSid).toBe("CA111");
    });
  });

  describe("initiateWebRtcCall", () => {
    it("sends POST to /Calls.json with client phone and status callback", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ sid: "CA222" }), { status: 201 }),
      );

      const provider = createTwilioProvider(validConfig);
      const callSid = await provider.initiateWebRtcCall({
        clientPhone: "+15550003333",
        callerId: "+15551234567",
        statusWebhookUrl: "https://example.com/webrtc-status",
      });

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${ACCOUNT_BASE}/Calls.json`);

      const body = new URLSearchParams(init.body as string);
      expect(body.get("To")).toBe("+15550003333");
      expect(body.get("From")).toBe("+15551234567");
      expect(body.get("StatusCallback")).toBe(
        "https://example.com/webrtc-status",
      );
      expect(body.get("Method")).toBe("POST");
      expect(body.get("StatusCallbackMethod")).toBe("POST");

      expect(callSid).toBe("CA222");
    });
  });

  describe("validateWebhook", () => {
    const webhookBody = { CallSid: "CA123", From: "+15551111111" };
    const webhookUrl = "https://example.com/webhooks/twilio/org1/voice";

    it("returns true for correct signature", () => {
      const signature = twilioHmacValidator.computeSignature(
        webhookUrl,
        webhookBody,
        validConfig.authToken,
      );

      const provider = createTwilioProvider(validConfig);
      const result = provider.validateWebhook({
        url: webhookUrl,
        body: webhookBody,
        authToken: validConfig.authToken,
        signature,
      });

      expect(result).toBe(true);
    });

    it("returns false for wrong signature", () => {
      const provider = createTwilioProvider(validConfig);
      const result = provider.validateWebhook({
        url: webhookUrl,
        body: webhookBody,
        authToken: validConfig.authToken,
        signature: "wrong-signature",
      });

      expect(result).toBe(false);
    });
  });

  describe("parseIncomingCall", () => {
    it("extracts CallSid, From, To", () => {
      const provider = createTwilioProvider(validConfig);
      const data = provider.parseIncomingCall({
        CallSid: "CA555",
        From: "+15551111111",
        To: "+15552222222",
        CallStatus: "ringing",
      });

      expect(data).toEqual({
        callId: "CA555",
        from: "+15551111111",
        to: "+15552222222",
        direction: "inbound",
      });
    });

    it("throws TelephonyError on missing CallSid", () => {
      const provider = createTwilioProvider(validConfig);

      expect(() =>
        provider.parseIncomingCall({
          From: "+15551111111",
          To: "+15552222222",
        }),
      ).toThrow(TelephonyError);
    });
  });

  describe("parseIncomingSms", () => {
    it("extracts MessageSid, From, To, Body, media URLs", () => {
      const provider = createTwilioProvider(validConfig);
      const data = provider.parseIncomingSms({
        MessageSid: "SM777",
        From: "+15551111111",
        To: "+15552222222",
        Body: "Hello",
        NumMedia: "2",
        MediaUrl0: "https://api.twilio.com/media/0.jpg",
        MediaContentType0: "image/jpeg",
        MediaUrl1: "https://api.twilio.com/media/1.png",
        MediaContentType1: "image/png",
      });

      expect(data).toEqual({
        messageId: "SM777",
        from: "+15551111111",
        to: "+15552222222",
        body: "Hello",
        numMedia: 2,
        mediaUrls: [
          "https://api.twilio.com/media/0.jpg",
          "https://api.twilio.com/media/1.png",
        ],
        mediaContentTypes: ["image/jpeg", "image/png"],
      });
    });

    it("handles 0 media (empty arrays)", () => {
      const provider = createTwilioProvider(validConfig);
      const data = provider.parseIncomingSms({
        MessageSid: "SM888",
        From: "+15551111111",
        To: "+15552222222",
        Body: "No media",
        NumMedia: "0",
      });

      expect(data.numMedia).toBe(0);
      expect(data.mediaUrls).toEqual([]);
      expect(data.mediaContentTypes).toEqual([]);
    });

    it("handles 3 media items", () => {
      const provider = createTwilioProvider(validConfig);
      const data = provider.parseIncomingSms({
        MessageSid: "SM999",
        From: "+15551111111",
        To: "+15552222222",
        Body: "",
        NumMedia: "3",
        MediaUrl0: "https://example.com/0.jpg",
        MediaContentType0: "image/jpeg",
        MediaUrl1: "https://example.com/1.mp3",
        MediaContentType1: "audio/mpeg",
        MediaUrl2: "https://example.com/2.pdf",
        MediaContentType2: "application/pdf",
      });

      expect(data.numMedia).toBe(3);
      expect(data.mediaUrls).toHaveLength(3);
      expect(data.mediaContentTypes).toHaveLength(3);
      expect(data.mediaUrls[2]).toBe("https://example.com/2.pdf");
      expect(data.mediaContentTypes[2]).toBe("application/pdf");
    });

    it("throws TelephonyError on missing MessageSid", () => {
      const provider = createTwilioProvider(validConfig);

      expect(() =>
        provider.parseIncomingSms({
          From: "+15551111111",
          To: "+15552222222",
          Body: "hello",
        }),
      ).toThrow(TelephonyError);
    });
  });

  describe("generateVoiceResponse", () => {
    it("produces TwiML from instructions", () => {
      const provider = createTwilioProvider(validConfig);
      const instructions: VoiceInstruction[] = [
        { type: "say", attributes: { text: "Welcome" } },
        { type: "pause", attributes: { length: "1" } },
        { type: "hangup" },
      ];

      const twiml = provider.generateVoiceResponse(instructions);

      expect(twiml).toBe(
        '<?xml version="1.0" encoding="UTF-8"?><Response>' +
          "<Say>Welcome</Say>" +
          '<Pause length="1"/>' +
          "<Hangup/>" +
          "</Response>",
      );
    });
  });

  describe("getRecording", () => {
    it("fetches .wav and returns Buffer", async () => {
      const wavData = new Uint8Array([0x52, 0x49, 0x46, 0x46]); // RIFF header
      fetchSpy.mockResolvedValue(
        new Response(wavData.buffer, {
          status: 200,
          headers: { "Content-Type": "audio/wav" },
        }),
      );

      const provider = createTwilioProvider(validConfig);
      const buffer = await provider.getRecording("RE123");

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${ACCOUNT_BASE}/Recordings/RE123.wav`);
      expect(init.method).toBe("GET");

      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization).toMatch(/^Basic /);

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer[0]).toBe(0x52); // 'R'
    });

    it("throws TelephonyError on non-OK response", async () => {
      fetchSpy.mockResolvedValue(new Response("Not Found", { status: 404 }));

      const provider = createTwilioProvider(validConfig);
      const err = await provider
        .getRecording("RE_MISSING")
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(TelephonyError);
      expect((err as TelephonyError).message).toContain("RE_MISSING");
    });
  });

  describe("deleteRecording", () => {
    it("sends DELETE to /Recordings/{id}.json", async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

      const provider = createTwilioProvider(validConfig);
      await provider.deleteRecording("RE456");

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${ACCOUNT_BASE}/Recordings/RE456.json`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("deleteCallLog", () => {
    it("sends DELETE to /Calls/{id}.json", async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

      const provider = createTwilioProvider(validConfig);
      await provider.deleteCallLog("CA789");

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${ACCOUNT_BASE}/Calls/CA789.json`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("deleteMessageLog", () => {
    it("sends DELETE to /Messages/{id}.json", async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

      const provider = createTwilioProvider(validConfig);
      await provider.deleteMessageLog("SM321");

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${ACCOUNT_BASE}/Messages/SM321.json`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("maskConfig", () => {
    it("returns masked accountSid and fully masked authToken", () => {
      const provider = createTwilioProvider(validConfig);
      const masked = provider.maskConfig();

      expect(masked.provider).toBe("twilio");
      expect(masked.mode).toBe("byot");
      // "AC1234567890abcdef" (18 chars): first 2 "AC", last 4 "cdef", 12 dots in between
      expect(masked.maskedAccountId).toBe(
        "AC\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022cdef",
      );
      expect(masked.maskedAuthToken).toBe(
        "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      );
      expect(masked.phoneNumbers).toEqual([{ number: "+15551234567" }]);
    });

    it("masks short accountSid as all dots", () => {
      const shortConfig: TwilioConfig = {
        ...validConfig,
        accountSid: "AC1234",
      };
      const provider = createTwilioProvider(shortConfig);
      const masked = provider.maskConfig();

      // 6 chars or fewer -> all dots
      expect(masked.maskedAccountId).toBe(
        "\u2022\u2022\u2022\u2022\u2022\u2022",
      );
    });
  });
});

describe("twilioProviderStatic", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe("validateConfig", () => {
    it("parses valid config", () => {
      const result = twilioProviderStatic.validateConfig(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("throws on invalid config", () => {
      expect(() =>
        twilioProviderStatic.validateConfig({ mode: "invalid" }),
      ).toThrow();
    });
  });

  describe("provisionWebhooks", () => {
    it("lists phone numbers then updates each with correct URLs and POST methods", async () => {
      // First call: GET /IncomingPhoneNumbers.json
      const listResponse = {
        incoming_phone_numbers: [
          {
            sid: "PN_AAA",
            phone_number: "+15551112222",
            friendly_name: "Main line",
          },
          {
            sid: "PN_BBB",
            phone_number: "+15553334444",
            friendly_name: "Backup line",
          },
        ],
      };

      // Track call order to return different responses
      let callCount = 0;
      fetchSpy.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // GET list
          return Promise.resolve(
            new Response(JSON.stringify(listResponse), { status: 200 }),
          );
        }
        // POST updates
        return Promise.resolve(
          new Response(JSON.stringify({ sid: "PN_updated" }), { status: 200 }),
        );
      });

      const result = (await twilioProviderStatic.provisionWebhooks(
        validConfig,
        "org-uuid-123",
        "https://care-y.example.com",
      )) as TwilioConfig;

      // 1 GET + 2 POSTs = 3 calls
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      // First call: GET
      const [getUrl, getInit] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(getUrl).toBe(`${ACCOUNT_BASE}/IncomingPhoneNumbers.json`);
      expect(getInit.method).toBe("GET");

      // Second call: POST to update PN_AAA
      const [postUrl1, postInit1] = fetchSpy.mock.calls[1] as [
        string,
        RequestInit,
      ];
      expect(postUrl1).toBe(`${ACCOUNT_BASE}/IncomingPhoneNumbers/PN_AAA.json`);
      expect(postInit1.method).toBe("POST");

      const body1 = new URLSearchParams(postInit1.body as string);
      expect(body1.get("SmsUrl")).toContain(
        "https://care-y.example.com/webhooks/twilio/org-uuid-123/sms",
      );
      expect(body1.get("SmsMethod")).toBe("POST");
      expect(body1.get("VoiceUrl")).toContain(
        "https://care-y.example.com/webhooks/twilio/org-uuid-123/voice",
      );
      expect(body1.get("VoiceMethod")).toBe("POST");
      expect(body1.get("StatusCallback")).toContain(
        "https://care-y.example.com/webhooks/twilio/org-uuid-123/status",
      );
      expect(body1.get("StatusCallbackMethod")).toBe("POST");

      // Third call: POST to update PN_BBB
      const [postUrl2] = fetchSpy.mock.calls[2] as [string, RequestInit];
      expect(postUrl2).toBe(`${ACCOUNT_BASE}/IncomingPhoneNumbers/PN_BBB.json`);

      // Returned config has updated phone numbers
      expect(result.phoneNumbers).toEqual([
        { number: "+15551112222", sid: "PN_AAA" },
        { number: "+15553334444", sid: "PN_BBB" },
      ]);
      expect(result.accountSid).toBe(validConfig.accountSid);
      expect(result.authToken).toBe(validConfig.authToken);
      expect(result.mode).toBe("byot");
    });
  });
});

describe("createTwilioSubaccount", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("sends POST with FriendlyName, returns SID and auth token", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          sid: "AC_SUB_123",
          auth_token: "sub-auth-token-secret",
        }),
        { status: 201 },
      ),
    );

    const result = await createTwilioSubaccount(
      "AC_MASTER",
      "master-auth-token",
      "CARE-Y Org Alpha",
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/.json`);
    expect(init.method).toBe("POST");

    const body = new URLSearchParams(init.body as string);
    expect(body.get("FriendlyName")).toBe("CARE-Y Org Alpha");

    // Verify master creds used for auth
    const headers = init.headers as Record<string, string>;
    const authHeader = headers.Authorization ?? "";
    const decoded = Buffer.from(
      authHeader.replace("Basic ", ""),
      "base64",
    ).toString("utf-8");
    expect(decoded).toBe("AC_MASTER:master-auth-token");

    expect(result.accountSid).toBe("AC_SUB_123");
    expect(result.authToken).toBe("sub-auth-token-secret");
  });
});

describe("suspendTwilioSubaccount", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("sends POST with Status=suspended using master creds", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ status: "suspended" }), { status: 200 }),
    );

    await suspendTwilioSubaccount(
      "AC_MASTER",
      "master-auth-token",
      "AC_SUB_456",
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/AC_SUB_456.json`);
    expect(init.method).toBe("POST");

    const body = new URLSearchParams(init.body as string);
    expect(body.get("Status")).toBe("suspended");

    const headers = init.headers as Record<string, string>;
    const authHeader = headers.Authorization ?? "";
    const decoded = Buffer.from(
      authHeader.replace("Basic ", ""),
      "base64",
    ).toString("utf-8");
    expect(decoded).toBe("AC_MASTER:master-auth-token");
  });
});

describe("closeTwilioSubaccount", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("sends POST with Status=closed using master creds", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ status: "closed" }), { status: 200 }),
    );

    await closeTwilioSubaccount("AC_MASTER", "master-auth-token", "AC_SUB_789");

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/AC_SUB_789.json`);
    expect(init.method).toBe("POST");

    const body = new URLSearchParams(init.body as string);
    expect(body.get("Status")).toBe("closed");

    const headers = init.headers as Record<string, string>;
    const authHeader = headers.Authorization ?? "";
    const decoded = Buffer.from(
      authHeader.replace("Basic ", ""),
      "base64",
    ).toString("utf-8");
    expect(decoded).toBe("AC_MASTER:master-auth-token");
  });
});
