import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, it, expect, vi } from "vitest";
import {
  parseWebhookPath,
  readFormBody,
  reconstructPublicUrl,
  createWebhookHandler,
  type WebhookHandlerDeps,
  type WebhookDispatch,
} from "./webhooks.js";
import { twilioHmacValidator } from "../telephony/webhook-crypto.js";
import type {
  RateLimitResult,
  RateLimiter,
} from "../ratelimit/rate-limiter.js";
import type { DedupStore } from "../telephony/dedup-store.js";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { ProviderFactory } from "../telephony/factory.js";
import type { TelephonyConfigService } from "../telephony/config-service.js";

// ---------------------------------------------------------------------------
// Test constants
// ---------------------------------------------------------------------------

const TEST_ORG_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_AUTH_TOKEN = "test-auth-token-12345";
const TEST_ACCOUNT_SID = "AC_TEST_12345";
const WEBHOOK_BASE_URL = "https://api.care-y.app";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function createMockReq(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}): IncomingMessage {
  const readable = new Readable({
    read() {
      // No-op: data is pushed manually via process.nextTick below
    },
  }) as IncomingMessage;
  Object.defineProperty(readable, "method", {
    value: options.method ?? "POST",
  });
  Object.defineProperty(readable, "url", { value: options.url ?? "/" });
  Object.defineProperty(readable, "headers", {
    value: {
      "content-type": "application/x-www-form-urlencoded",
      ...options.headers,
    },
  });
  if (options.body !== undefined) {
    process.nextTick(() => {
      readable.push(options.body);
      readable.push(null);
    });
  } else {
    process.nextTick(() => readable.push(null));
  }
  return readable;
}

interface MockRes {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

function createMockRes(): ServerResponse & MockRes {
  const res = {
    statusCode: 0,
    body: "",
    headers: {} as Record<string, string>,
    writeHead(
      status: number,
      headersArg?: Record<string, string>,
    ): ServerResponse {
      res.statusCode = status;
      if (headersArg) {
        for (const [k, v] of Object.entries(headersArg)) {
          res.headers[k] = v;
        }
      }
      return res as unknown as ServerResponse;
    },
    end(body?: string): ServerResponse {
      res.body = body ?? "";
      return res as unknown as ServerResponse;
    },
  } as unknown as ServerResponse & MockRes;
  return res;
}

function createMockProvider(validateResult: boolean): TelephonyProvider {
  return {
    providerId: "twilio",
    async sendSms() {
      return { messageId: "stub" };
    },
    async initiateOutboundCall() {
      return "stub";
    },
    async initiateWebRtcCall() {
      return "stub";
    },
    validateWebhook() {
      return validateResult;
    },
    parseIncomingCall() {
      return { callId: "c", from: "+1", to: "+1", direction: "inbound" };
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
      // no-op
    },
    async deleteCallLog() {
      // no-op
    },
    async deleteMessageLog() {
      // no-op
    },
    maskConfig() {
      return {
        provider: "twilio",
        mode: "byot",
        maskedAccountId: "AC***",
        maskedAuthToken: "****",
        phoneNumbers: [],
      };
    },
  };
}

function createMockConfigService(
  configLookup: {
    provider: string;
    accountSid: string;
    authToken: string;
  } | null,
): TelephonyConfigService {
  return {
    saveConfig: vi.fn(),
    getMaskedConfig: vi.fn(),
    provisionWebhooks: vi.fn(),
    lookupWebhookConfig: vi.fn().mockResolvedValue(configLookup),
  } as unknown as TelephonyConfigService;
}

function createMockRateLimiter(allowed = true): RateLimiter {
  return {
    check: vi.fn(
      (): RateLimitResult => ({
        allowed,
        remaining: allowed ? 99 : 0,
        retryAfterMs: allowed ? 0 : 60_000,
      }),
    ),
    reset: vi.fn(),
  };
}

function createMockDedupStore(
  isDuplicate = false,
): DedupStore & { markProcessedSpy: ReturnType<typeof vi.fn> } {
  const markProcessedSpy = vi.fn();
  return {
    isDuplicate: vi.fn(() => isDuplicate),
    markProcessed: markProcessedSpy,
    markProcessedSpy,
    stop: vi.fn(),
  };
}

/**
 * Build a valid webhook body with matching signature for test assertions.
 * Encodes body as form data and computes the Twilio HMAC-SHA1 signature.
 */
function buildSignedRequest(options: {
  orgId?: string;
  endpoint?: string;
  provider?: string;
  timestamp?: number | null;
  extraBody?: Record<string, string>;
}): {
  url: string;
  body: string;
  signature: string;
  bodyRecord: Record<string, string>;
} {
  const orgId = options.orgId ?? TEST_ORG_ID;
  const endpoint = options.endpoint ?? "sms";
  const provider = options.provider ?? "twilio";
  const ts = options.timestamp;
  const tsQuery = ts !== null && ts !== undefined ? `?ts=${String(ts)}` : "";
  const path = `/webhooks/${provider}/${orgId}/${endpoint}${tsQuery}`;
  const fullUrl = WEBHOOK_BASE_URL + path;

  const bodyRecord: Record<string, string> = {
    AccountSid: TEST_ACCOUNT_SID,
    MessageSid: "SM_TEST_001",
    From: "+15559876543",
    To: "+15551234567",
    Body: "test message",
    ...options.extraBody,
  };

  const signature = twilioHmacValidator.computeSignature(
    fullUrl,
    bodyRecord,
    TEST_AUTH_TOKEN,
  );

  const params = new URLSearchParams(bodyRecord);
  return { url: path, body: params.toString(), signature, bodyRecord };
}

interface TestHarness {
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
  deps: WebhookHandlerDeps;
  dispatch: Required<WebhookDispatch>;
  dedupStore: DedupStore & { markProcessedSpy: ReturnType<typeof vi.fn> };
}

function createTestHarness(overrides?: {
  rateLimitAllowed?: boolean;
  isDuplicate?: boolean;
  validateSignature?: boolean;
  configLookup?: {
    provider: string;
    accountSid: string;
    authToken: string;
  } | null;
}): TestHarness {
  const rateLimiter = createMockRateLimiter(
    overrides?.rateLimitAllowed ?? true,
  );
  const dedupStore = createMockDedupStore(overrides?.isDuplicate ?? false);
  const providerFactory: ProviderFactory = {
    getProvider: vi
      .fn()
      .mockResolvedValue(
        createMockProvider(overrides?.validateSignature ?? true),
      ),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
  };

  const hasExplicitLookup =
    overrides !== undefined && "configLookup" in overrides;
  const defaultLookup = {
    provider: "twilio",
    accountSid: TEST_ACCOUNT_SID,
    authToken: TEST_AUTH_TOKEN,
  };

  const deps: WebhookHandlerDeps = {
    configService: createMockConfigService(
      hasExplicitLookup ? (overrides.configLookup ?? null) : defaultLookup,
    ),
    providerFactory,
    rateLimiter,
    dedupStore,
  };

  const dispatch: Required<WebhookDispatch> = {
    onInboundSms: vi.fn().mockResolvedValue(null),
    onInboundVoice: vi.fn().mockResolvedValue(null),
    onStatusCallback: vi.fn().mockResolvedValue(undefined),
  };

  const handler = createWebhookHandler(deps, dispatch, WEBHOOK_BASE_URL);
  return { handler, deps, dispatch, dedupStore };
}

// ---------------------------------------------------------------------------
// Tests: parseWebhookPath
// ---------------------------------------------------------------------------

describe("parseWebhookPath", () => {
  it("extracts provider, orgId, endpoint, and timestamp from valid path", () => {
    const result = parseWebhookPath(
      `/webhooks/twilio/${TEST_ORG_ID}/sms?ts=1700000000`,
    );
    expect(result).toEqual({
      provider: "twilio",
      orgId: TEST_ORG_ID,
      endpoint: "sms",
      timestamp: 1700000000,
    });
  });

  it("parses voice endpoint without timestamp", () => {
    const result = parseWebhookPath(`/webhooks/twilio/${TEST_ORG_ID}/voice`);
    expect(result).toEqual({
      provider: "twilio",
      orgId: TEST_ORG_ID,
      endpoint: "voice",
      timestamp: null,
    });
  });

  it("parses status endpoint", () => {
    const result = parseWebhookPath(
      `/webhooks/signalwire/${TEST_ORG_ID}/status`,
    );
    expect(result).toEqual({
      provider: "signalwire",
      orgId: TEST_ORG_ID,
      endpoint: "status",
      timestamp: null,
    });
  });

  it("returns null for invalid endpoint", () => {
    const result = parseWebhookPath(`/webhooks/twilio/${TEST_ORG_ID}/invalid`);
    expect(result).toBeNull();
  });

  it("returns null for missing segments", () => {
    expect(parseWebhookPath("/webhooks/twilio")).toBeNull();
    expect(parseWebhookPath("/webhooks/twilio/org-1")).toBeNull();
  });

  it("returns null for wrong prefix", () => {
    expect(parseWebhookPath(`/api/twilio/${TEST_ORG_ID}/sms`)).toBeNull();
  });

  it("returns null for extra segments", () => {
    expect(
      parseWebhookPath(`/webhooks/twilio/${TEST_ORG_ID}/sms/extra`),
    ).toBeNull();
  });

  it("returns null timestamp for non-numeric ts", () => {
    const result = parseWebhookPath(
      `/webhooks/twilio/${TEST_ORG_ID}/sms?ts=abc`,
    );
    expect(result).not.toBeNull();
    expect(result?.timestamp).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: readFormBody
// ---------------------------------------------------------------------------

describe("readFormBody", () => {
  it("parses form-encoded body into key-value pairs", async () => {
    const req = createMockReq({
      body: "AccountSid=AC123&Body=hello+world",
    });
    const result = await readFormBody(req);
    expect(result).toEqual({ AccountSid: "AC123", Body: "hello world" });
  });

  it("returns null when body exceeds max size", async () => {
    const largeBody = "x=".padEnd(100, "a");
    const req = createMockReq({ body: largeBody });
    // Use a tiny max size to trigger rejection
    const result = await readFormBody(req, 10);
    expect(result).toBeNull();
  });

  it("returns empty object for empty body", async () => {
    const req = createMockReq({ body: "" });
    const result = await readFormBody(req);
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Tests: reconstructPublicUrl
// ---------------------------------------------------------------------------

describe("reconstructPublicUrl", () => {
  it("concatenates base URL and request path", () => {
    const req = createMockReq({ url: "/webhooks/twilio/org-1/sms?ts=123" });
    const result = reconstructPublicUrl(req, "https://api.care-y.app");
    expect(result).toBe(
      "https://api.care-y.app/webhooks/twilio/org-1/sms?ts=123",
    );
  });

  it("strips trailing slash from base URL", () => {
    const req = createMockReq({ url: "/webhooks/twilio/org-1/sms" });
    const result = reconstructPublicUrl(req, "https://api.care-y.app/");
    expect(result).toBe("https://api.care-y.app/webhooks/twilio/org-1/sms");
  });
});

// ---------------------------------------------------------------------------
// Tests: createWebhookHandler
// ---------------------------------------------------------------------------

describe("createWebhookHandler", () => {
  describe("HTTP method and content type validation", () => {
    it("returns 405 for non-POST methods", async () => {
      const { handler } = createTestHarness();
      const req = createMockReq({
        method: "GET",
        url: "/webhooks/twilio/org/sms",
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(405);
    });

    it("returns 415 for wrong Content-Type", async () => {
      const { handler } = createTestHarness();
      const req = createMockReq({
        url: "/webhooks/twilio/org/sms",
        headers: { "content-type": "application/json" },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(415);
    });
  });

  describe("rate limiting", () => {
    it("returns 429 when rate limit is exceeded", async () => {
      const { handler } = createTestHarness({ rateLimitAllowed: false });
      const { url, body, signature } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(429);
    });
  });

  describe("path parsing", () => {
    it("returns 404 for invalid paths", async () => {
      const { handler } = createTestHarness();
      const req = createMockReq({
        url: "/not-webhooks/twilio/org/sms",
        body: "AccountSid=AC123",
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("replay protection", () => {
    it("returns 403 for expired timestamp (older than 5 minutes)", async () => {
      const { handler } = createTestHarness();
      const expiredTs = Math.floor(Date.now() / 1000) - 400; // 6+ min ago
      const { url, body, signature } = buildSignedRequest({
        timestamp: expiredTs,
      });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });

    it("returns 403 for timestamp more than 1 minute in the future", async () => {
      const { handler } = createTestHarness();
      const futureTs = Math.floor(Date.now() / 1000) + 120; // 2 min in future
      const { url, body, signature } = buildSignedRequest({
        timestamp: futureTs,
      });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("org config lookup", () => {
    it("returns 403 for non-existent org (does not reveal org existence)", async () => {
      const { handler } = createTestHarness({ configLookup: null });
      const { url, body, signature } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });

    it("returns 403 for provider mismatch", async () => {
      const { handler } = createTestHarness({
        configLookup: {
          provider: "signalwire",
          accountSid: TEST_ACCOUNT_SID,
          authToken: TEST_AUTH_TOKEN,
        },
      });
      const { url, body, signature } = buildSignedRequest({
        provider: "twilio",
      });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("signature validation", () => {
    it("returns 403 when X-Twilio-Signature header is missing", async () => {
      const { handler } = createTestHarness();
      const { url, body } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": undefined as unknown as string },
      });
      // Remove the header so it becomes undefined
      delete (req.headers as Record<string, string | undefined>)[
        "x-twilio-signature"
      ];
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });

    it("returns 403 for invalid signature", async () => {
      const { handler } = createTestHarness({ validateSignature: false });
      const { url, body } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": "invalid-signature" },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });

    it("returns 200 for valid signature", async () => {
      const { handler } = createTestHarness();
      const { url, body, signature } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
    });
  });

  describe("AccountSid secondary check", () => {
    it("returns 403 when body AccountSid does not match config", async () => {
      const { handler } = createTestHarness();
      const { url, body, signature } = buildSignedRequest({
        extraBody: { AccountSid: "AC_WRONG_SID" },
      });
      // The signature was computed with AC_WRONG_SID, but the provider mock
      // validates any signature. The check we're testing is the secondary
      // AccountSid comparison against config.
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("idempotency (dedup)", () => {
    it("returns 200 without dispatching for duplicate SID", async () => {
      const { handler, dispatch } = createTestHarness({ isDuplicate: true });
      const { url, body, signature } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(dispatch.onInboundSms).not.toHaveBeenCalled();
    });

    it("marks SID as processed after successful dispatch", async () => {
      const { handler, dedupStore } = createTestHarness();
      const { url, body, signature } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(dedupStore.markProcessedSpy).toHaveBeenCalledWith("SM_TEST_001");
    });
  });

  describe("dispatch routing", () => {
    it("dispatches SMS webhook to onInboundSms", async () => {
      const { handler, dispatch } = createTestHarness();
      const { url, body, signature } = buildSignedRequest({ endpoint: "sms" });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(dispatch.onInboundSms).toHaveBeenCalledWith(
        TEST_ORG_ID,
        expect.objectContaining({ MessageSid: "SM_TEST_001" }),
      );
    });

    it("dispatches voice webhook to onInboundVoice", async () => {
      const { handler, dispatch } = createTestHarness();
      // Voice webhooks have CallSid, not MessageSid. Build without default
      // MessageSid by using a custom body record.
      const orgId = TEST_ORG_ID;
      const endpoint = "voice";
      const path = `/webhooks/twilio/${orgId}/${endpoint}`;
      const fullUrl = WEBHOOK_BASE_URL + path;
      const voiceBody: Record<string, string> = {
        AccountSid: TEST_ACCOUNT_SID,
        CallSid: "CA_TEST_001",
        From: "+15559876543",
        To: "+15551234567",
      };
      const signature = twilioHmacValidator.computeSignature(
        fullUrl,
        voiceBody,
        TEST_AUTH_TOKEN,
      );
      const params = new URLSearchParams(voiceBody);
      const req = createMockReq({
        url: path,
        body: params.toString(),
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(dispatch.onInboundVoice).toHaveBeenCalledWith(
        TEST_ORG_ID,
        expect.objectContaining({ CallSid: "CA_TEST_001" }),
      );
    });

    it("dispatches status webhook to onStatusCallback", async () => {
      const { handler, dispatch } = createTestHarness();
      const { url, body, signature } = buildSignedRequest({
        endpoint: "status",
        extraBody: { CallSid: "CA_TEST_002" },
      });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(dispatch.onStatusCallback).toHaveBeenCalledWith(
        TEST_ORG_ID,
        expect.objectContaining({ CallSid: "CA_TEST_002" }),
      );
    });
  });

  describe("TwiML response", () => {
    it("returns TwiML with text/xml content type when dispatch returns a string", async () => {
      const { handler, dispatch } = createTestHarness();
      (dispatch.onInboundSms as ReturnType<typeof vi.fn>).mockResolvedValue(
        "<Response><Message>Thanks</Message></Response>",
      );
      const { url, body, signature } = buildSignedRequest({ endpoint: "sms" });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers["Content-Type"]).toBe("text/xml");
      expect(res.body).toBe("<Response><Message>Thanks</Message></Response>");
    });

    it("returns empty 200 when dispatch returns null", async () => {
      const { handler } = createTestHarness();
      const { url, body, signature } = buildSignedRequest({ endpoint: "sms" });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBe("");
    });
  });

  describe("body size limit", () => {
    it("returns 413 when body exceeds maximum size", async () => {
      const { handler } = createTestHarness();
      // Build a valid path first
      const path = `/webhooks/twilio/${TEST_ORG_ID}/sms`;
      // Create a body that is far too large (simulate via the stream, the actual
      // limit is 1MB but we just need readFormBody to return null).
      // We'll use a custom approach: create a req that emits a huge chunk.
      const hugeBody = "x=".padEnd(1_048_577 + 10, "a");
      const req = createMockReq({
        url: path,
        body: hugeBody,
        headers: { "x-twilio-signature": "any" },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(413);
    });
  });

  // -----------------------------------------------------------------------
  // Group B2: Webhook error responses never contain form body content
  // -----------------------------------------------------------------------

  describe("error responses never contain form body content (B2)", () => {
    const SENSITIVE_FROM = "+15559876543";
    const SENSITIVE_TO = "+15551234567";
    const SENSITIVE_BODY = "test message";

    it("invalid signature response does not contain form fields", async () => {
      const { handler } = createTestHarness({ validateSignature: false });
      const { url, body } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": "invalid-signature" },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).not.toContain(SENSITIVE_FROM);
      expect(res.body).not.toContain(SENSITIVE_TO);
      expect(res.body).not.toContain(SENSITIVE_BODY);
    });

    it("AccountSid mismatch response does not contain form fields", async () => {
      const { handler } = createTestHarness();
      const { url, body, signature } = buildSignedRequest({
        extraBody: { AccountSid: "AC_WRONG_SID" },
      });
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).not.toContain(SENSITIVE_FROM);
      expect(res.body).not.toContain(SENSITIVE_TO);
      expect(res.body).not.toContain(SENSITIVE_BODY);
    });

    it("rate-limited response does not contain form fields", async () => {
      const { handler } = createTestHarness({ rateLimitAllowed: false });
      const { url, body, signature } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(429);
      expect(res.body).not.toContain(SENSITIVE_FROM);
      expect(res.body).not.toContain(SENSITIVE_TO);
      expect(res.body).not.toContain(SENSITIVE_BODY);
    });

    it("dedup rejection response does not contain form fields", async () => {
      const { handler } = createTestHarness({ isDuplicate: true });
      const { url, body, signature } = buildSignedRequest({});
      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      // Dedup returns 200 (not an error), but verify anyway
      expect(res.statusCode).toBe(200);
      expect(res.body).not.toContain(SENSITIVE_FROM);
      expect(res.body).not.toContain(SENSITIVE_BODY);
    });
  });
});
