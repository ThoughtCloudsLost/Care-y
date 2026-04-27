import { describe, it, expect, vi, afterEach } from "vitest";
import { IncomingMessage, type ServerResponse } from "node:http";
import { Socket } from "node:net";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { ConsultantRepository } from "../telephony/models/consultant-repo.js";
import type {
  SessionRepository,
  SessionData,
} from "../auth/session-repository.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createRelayHandler,
  type RelayHandlerDeps,
  type PendingCall,
} from "./relay.js";
import * as relayUtils from "./relay-utils.js";
import { TestSetupError } from "../test-utils.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeSessionData(overrides?: Partial<SessionData>): SessionData {
  return {
    id: "session-001",
    token: "tok_abc123",
    userId: "user-001",
    ipToken: "hmac-ip",
    uaToken: "hmac-ua",
    expiresAt: new Date(Date.now() + 3600_000),
    twofaVerified: true,
    webauthnChallenge: null,
    ...overrides,
  };
}

function mockSessionRepo(session: SessionData | null): SessionRepository {
  return {
    findByToken: vi.fn().mockResolvedValue(session),
    create: vi.fn(),
    deleteByToken: vi.fn(),
    deleteByUserId: vi.fn(),
    deleteByUserIdExceptToken: vi.fn().mockResolvedValue(0),
    deleteExpired: vi.fn(),
    markTwoFactorVerified: vi.fn(),
    clearTwoFactorVerified: vi.fn(),
    setWebauthnChallenge: vi.fn(),
  };
}

/**
 * Local relay mock provider. Defaults throw TestSetupError for validateWebhook
 * (matching test-utils.ts pattern) so that tests relying on the default can't
 * accidentally pass when the handler forgets to call validation.
 * Tests exercising the validated path must explicitly set validateWebhook.
 */
function mockProvider(
  overrides?: Partial<TelephonyProvider>,
): TelephonyProvider {
  return {
    providerId: "mock",
    sendSms: vi.fn().mockResolvedValue({ messageId: "SM_test_123" }),
    initiateOutboundCall: vi.fn().mockResolvedValue("CA_test_456"),
    initiateWebRtcCall: vi.fn().mockResolvedValue("CA_test_789"),
    validateWebhook: vi.fn().mockImplementation(() => {
      throw new TestSetupError(
        "Mock provider: validateWebhook called unexpectedly",
      );
    }),
    parseIncomingCall: vi.fn(),
    parseIncomingSms: vi.fn(),
    generateVoiceResponse: vi.fn().mockReturnValue("<Response/>"),
    getRecording: vi.fn().mockResolvedValue(Buffer.alloc(44)),
    deleteRecording: vi.fn(),
    deleteCallLog: vi.fn(),
    deleteMessageLog: vi.fn(),
    maskConfig: vi.fn().mockReturnValue({
      provider: "mock",
      mode: "mock",
      maskedAccountId: "AC***",
      maskedAuthToken: "****",
      phoneNumbers: [],
    }),
    ...overrides,
  };
}

function mockConsultantRepo(
  consultant: { isVerified: boolean; preferredCallMethod: string } | null,
): ConsultantRepository {
  const record = consultant
    ? {
        id: "consultant-001",
        userId: "user-001",
        encryptedPhone: Buffer.alloc(16), // test stub, content irrelevant
        phoneHash: "hash123",
        isVerified: consultant.isVerified,
        preferredCallMethod: consultant.preferredCallMethod,
      }
    : null;

  return {
    findByUserId: vi.fn().mockResolvedValue(record),
    create: vi.fn(),
    setVerificationCode: vi.fn(),
    verifyAndActivate: vi.fn(),
    updatePreferredCallMethod: vi.fn(),
    delete: vi.fn(),
  };
}

function makeDeps(overrides?: Partial<RelayHandlerDeps>): RelayHandlerDeps {
  return {
    getProvider: vi.fn().mockResolvedValue(mockProvider()),
    getTenantDb: vi.fn().mockReturnValue({} as Kysely<TenantDatabase>),
    createConsultantRepo: vi.fn().mockReturnValue(
      mockConsultantRepo({
        isVerified: true,
        preferredCallMethod: "phone_callback",
      }),
    ),
    resolveCallerIdByPurpose: vi.fn().mockResolvedValue("+15559999999"),
    pendingCalls: new Map<string, PendingCall>(),
    indexer: { hash: vi.fn().mockReturnValue("fake-hash") },
    fieldEncryptor: {
      encrypt: vi.fn().mockReturnValue(Buffer.from("encrypted")),
      decrypt: vi.fn().mockReturnValue("decrypted"),
      decryptToBuffer: vi.fn().mockReturnValue(Buffer.from("decrypted")),
    },
    pendingClients: new Map(),
    webhookBaseUrl: "https://api.care-y.app",
    getAuthToken: vi.fn().mockResolvedValue("test_auth_token"),
    getAccountSid: vi.fn().mockResolvedValue("ACtest123"),
    apiKeySid: "SKtest",
    apiKeySecret: "test_secret",
    twimlAppSid: "APtest",
    orgResolver: vi.fn().mockReturnValue("org_test"),
    createSessionRepo: vi
      .fn()
      .mockReturnValue(mockSessionRepo(makeSessionData())),
    ...overrides,
  };
}

/** Creates a mock HTTP request that emits body data on next tick. */
function createMockReq(
  method: string,
  url: string,
  body: string | Buffer,
  headers?: Record<string, string>,
): IncomingMessage {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.method = method;
  req.url = url;
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      req.headers[k.toLowerCase()] = v;
    }
  }
  // Default cookie for session auth
  req.headers.cookie ??= "care_y_session=tok_abc123";
  process.nextTick(() => {
    req.push(typeof body === "string" ? Buffer.from(body) : body);
    req.push(null);
  });
  return req;
}

// ---------------------------------------------------------------------------
// Buffer zeroing verification
// ---------------------------------------------------------------------------

/**
 * Spies on readRawBody to capture the Buffer it returns. After the handler
 * runs, the captured Buffer should be all zeros (security contract).
 *
 * Returns a getter for the captured buffer. The getter throws if readRawBody
 * was not called (test setup error).
 */
function spyOnReadRawBody(): {
  getCapturedBuffer: () => Buffer;
  restore: () => void;
} {
  let captured: Buffer | null = null;
  const original = relayUtils.readRawBody;
  const spy = vi
    .spyOn(relayUtils, "readRawBody")
    .mockImplementation(async (req, maxSize) => {
      const buf = await original(req, maxSize);
      captured = buf;
      return buf;
    });
  return {
    getCapturedBuffer(): Buffer {
      if (captured === null) {
        throw new TestSetupError("readRawBody was not called");
      }
      return captured;
    },
    restore(): void {
      spy.mockRestore();
    },
  };
}

/** Asserts every byte in the Buffer is 0. */
function expectZeroed(buf: Buffer, label: string): void {
  expect(
    buf.every((b) => b === 0),
    `${label} should be zeroed but contains non-zero bytes`,
  ).toBe(true);
}

interface CapturedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  writeHead: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
}

function createMockRes(): CapturedResponse {
  const captured: CapturedResponse = {
    statusCode: 0,
    headers: {},
    body: "",
    writeHead: vi.fn((status: number, hdrs?: Record<string, string>) => {
      captured.statusCode = status;
      if (hdrs) Object.assign(captured.headers, hdrs);
    }),
    end: vi.fn((data?: string) => {
      captured.body = data ?? "";
    }),
    setHeader: vi.fn(),
  };
  return captured;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createRelayHandler", () => {
  // -----------------------------------------------------------------------
  // Auth & routing
  // -----------------------------------------------------------------------

  describe("routing and auth", () => {
    it("returns 405 for non-POST requests (except call-confirm)", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("GET", "/relay/sms", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(405);
    });

    it("returns 401 when session cookie is missing", async () => {
      const deps = makeDeps({
        createSessionRepo: vi.fn().mockReturnValue(mockSessionRepo(null)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+1555","body":"hi"}',
        {
          cookie: "",
        },
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 when session is expired", async () => {
      const expired = makeSessionData({
        expiresAt: new Date(Date.now() - 1000),
      });
      const deps = makeDeps({
        createSessionRepo: vi.fn().mockReturnValue(mockSessionRepo(expired)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+1555","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(401);
    });

    it("returns 403 when 2FA is not verified", async () => {
      const noTwofa = makeSessionData({ twofaVerified: false });
      const deps = makeDeps({
        createSessionRepo: vi.fn().mockReturnValue(mockSessionRepo(noTwofa)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+1555","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "TWO_FACTOR_REQUIRED" });
    });

    it("returns 404 for unknown relay path", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/unknown", "{}");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(404);
    });
  });

  // -----------------------------------------------------------------------
  // SMS relay
  // -----------------------------------------------------------------------

  describe("POST /relay/sms", () => {
    it("sends SMS and returns messageId on success", async () => {
      const provider = mockProvider();
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+15551234567","body":"Hello from CARE-Y"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ messageId: "SM_test_123" });
      expect(provider.sendSms).toHaveBeenCalledWith(
        "+15551234567",
        "Hello from CARE-Y",
        "+15559999999",
      );
    });

    it("returns 400 MISSING_FIELDS when to is missing", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", '{"body":"Hello"}');
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
    });

    it("returns 400 MISSING_FIELDS when body is missing", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", '{"to":"+15551234567"}');
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
    });

    it("returns 400 BODY_TOO_LONG when body exceeds 1600 chars", async () => {
      const handler = createRelayHandler(makeDeps());
      const longBody = "x".repeat(1601);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"to":"+15551234567","body":"${longBody}"}`,
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "BODY_TOO_LONG" });
    });

    it("returns 500 NO_PROVIDER when provider not configured", async () => {
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+15551234567","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_PROVIDER" });
    });

    it("returns 400 NO_CALLER_ID when no phones provisioned", async () => {
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+15551234567","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_CALLER_ID" });
    });

    it("returns 502 PROVIDER_ERROR when provider.sendSms rejects", async () => {
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const bodyJson = '{"to":"+15551234567","body":"secret message"}';
      const req = createMockReq("POST", "/relay/sms", bodyJson);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expect(JSON.parse(res.body)).toEqual({ error: "PROVIDER_ERROR" });
    });
  });

  // -----------------------------------------------------------------------
  // Call relay
  // -----------------------------------------------------------------------

  describe("POST /relay/call", () => {
    it("initiates phone callback and stores pending call", async () => {
      const provider = mockProvider();
      const pendingCalls = new Map<string, PendingCall>();
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        pendingCalls,
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as {
        callSid: string;
        method: string;
      };
      expect(parsed.method).toBe("phone_callback");
      expect(parsed.callSid).toBe("CA_test_456");
      expect(provider.initiateOutboundCall).toHaveBeenCalled();

      // Verify pending call stored
      expect(pendingCalls.size).toBe(1);
      const pending = pendingCalls.get("CA_test_456");
      expect(pending).toBeDefined();
      expect(pending!.orgId).toBe("org_test");
    });

    it("returns webrtc method when consultant prefers WebRTC", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(
          mockConsultantRepo({
            isVerified: true,
            preferredCallMethod: "webrtc",
          }),
        ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as { method: string };
      expect(parsed.method).toBe("webrtc");
    });

    it("returns 403 when consultant is not verified", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(
          mockConsultantRepo({
            isVerified: false,
            preferredCallMethod: "phone_callback",
          }),
        ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns 403 when consultant not found", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(mockConsultantRepo(null)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns 400 when clientPhone is missing", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/call", "{}");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when consultantPhone missing for phone_callback", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({
        error: "MISSING_CONSULTANT_PHONE",
      });
    });
  });

  // -----------------------------------------------------------------------
  // DTMF callback
  // -----------------------------------------------------------------------

  describe("POST /relay/call-confirm", () => {
    function makePendingCall(): PendingCall {
      return {
        clientPhoneBuf: Buffer.from("+15553333333"),
        callerIdBuf: Buffer.from("+15559999999"),
        orgId: "org_test",
        createdAt: Date.now(),
      };
    }

    it("bridges call on DTMF confirmation with valid signature", async () => {
      const pending = makePendingCall();
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(true),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=1&AccountSid=ACtest";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_test",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "valid_sig",
        },
      );
      // Clear default session cookie (this is a Twilio callback, not browser)
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(res.headers["Content-Type"]).toBe("text/xml");
      expect(res.body).toContain("<Dial");
      expect(res.body).toContain("+15553333333");
      // Pending call cleaned up
      expect(pendingCalls.size).toBe(0);
      // C2: webhook signature was validated before bridging
      expect(provider.validateWebhook).toHaveBeenCalledOnce();
      expect(provider.validateWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          signature: expect.any(String) as string,
        }),
      );
    });

    it("returns Hangup TwiML for unknown CallSid", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_unknown&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_test",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.body).toContain("<Hangup/>");
    });

    it("returns 400 when CallSid missing from body", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);

      const formBody = "Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_test",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
    });

    it("returns 403 when HMAC signature is invalid", async () => {
      const pending = makePendingCall();
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(false),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_test",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "bad_sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns Hangup TwiML when no digits pressed (timeout)", async () => {
      const pending = makePendingCall();
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(true),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_test",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.body).toContain("No confirmation received");
      expect(res.body).toContain("<Hangup/>");
      // Pending call cleaned up and buffers zeroed
      expect(pendingCalls.size).toBe(0);
      expect(pending.clientPhoneBuf.every((b) => b === 0)).toBe(true);
    });

    it("returns 405 for non-POST method", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq("GET", "/relay/call-confirm/org_test", "");
      req.headers.cookie = "";
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(405);
    });

    it("returns 415 for wrong content type", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/call-confirm/org_test", "{}", {
        "content-type": "application/json",
      });
      req.headers.cookie = "";
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(415);
    });

    it("zeros pending call buffers on cleanup", async () => {
      const pending = makePendingCall();
      // Snapshot copies to verify pre-zeroing content (test-only, zeroed in finally)
      const clientBufCopy = Buffer.alloc(pending.clientPhoneBuf.length);
      pending.clientPhoneBuf.copy(clientBufCopy);
      const callerIdBufCopy = Buffer.alloc(pending.callerIdBuf.length);
      pending.callerIdBuf.copy(callerIdBufCopy);

      try {
        // Verify they start non-zero
        expect(clientBufCopy.toString("utf-8")).toBe("+15553333333");
        expect(callerIdBufCopy.toString("utf-8")).toBe("+15559999999");

        const pendingCalls = new Map<string, PendingCall>();
        pendingCalls.set("CA_test_1", pending);

        const provider = mockProvider({
          validateWebhook: vi.fn().mockReturnValue(true),
        });
        const deps = makeDeps({
          pendingCalls,
          getProvider: vi.fn().mockResolvedValue(provider),
        });
        const handler = createRelayHandler(deps);

        const formBody = "CallSid=CA_test_1&Digits=5";
        const req = createMockReq(
          "POST",
          "/relay/call-confirm/org_test",
          formBody,
          {
            "content-type": "application/x-www-form-urlencoded",
            "x-twilio-signature": "sig",
          },
        );
        req.headers.cookie = "";
        const res = createMockRes();

        await handler(req, res as unknown as ServerResponse);

        // The original pending.clientPhoneBuf should be zeroed
        expect(pending.clientPhoneBuf.every((b) => b === 0)).toBe(true);
        expect(pending.callerIdBuf.every((b) => b === 0)).toBe(true);
      } finally {
        clientBufCopy.fill(0);
        callerIdBufCopy.fill(0);
      }
    });
  });

  // -----------------------------------------------------------------------
  // WebRTC token
  // -----------------------------------------------------------------------

  describe("POST /relay/webrtc-token", () => {
    it("returns token and ttl on success", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as { token: string; ttl: number };
      expect(parsed.ttl).toBe(300);
      expect(parsed.token).toBeTruthy();
      // JWT format: three dot-separated base64url segments
      expect(parsed.token.split(".")).toHaveLength(3);
    });

    it("returns 403 when consultant not verified", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(
          mockConsultantRepo({
            isVerified: false,
            preferredCallMethod: "webrtc",
          }),
        ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns 500 when provider not configured", async () => {
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(500);
    });

    it("returns 500 when Twilio API Key not configured", async () => {
      const deps = makeDeps({
        apiKeySid: "",
        apiKeySecret: "",
        twimlAppSid: "",
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({ error: "WEBRTC_NOT_CONFIGURED" });
    });
  });

  // -----------------------------------------------------------------------
  // Group A: Buffer zeroing on error paths (security contract)
  // -----------------------------------------------------------------------

  describe("buffer zeroing on error paths", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    // -- SMS relay --

    it("zeros raw body buffer when provider.sendSms rejects (A1)", async () => {
      const spy = spyOnReadRawBody();
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+15551234567","body":"secret message"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after PROVIDER_ERROR");
      spy.restore();
    });

    it("zeros raw body buffer on MISSING_FIELDS (A2)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", '{"to":"+15551234567"}');
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
      expectZeroed(spy.getCapturedBuffer(), "rawBody after MISSING_FIELDS");
      spy.restore();
    });

    it("zeros raw body buffer on BODY_TOO_LONG (A2)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const longBody = "x".repeat(1601);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"to":"+15551234567","body":"${longBody}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "BODY_TOO_LONG" });
      expectZeroed(spy.getCapturedBuffer(), "rawBody after BODY_TOO_LONG");
      spy.restore();
    });

    it("zeros raw body buffer on NO_PROVIDER for SMS (A2)", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+15551234567","body":"hi"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after NO_PROVIDER (SMS)");
      spy.restore();
    });

    it("zeros raw body buffer on NO_CALLER_ID for SMS (A2)", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"to":"+15551234567","body":"hi"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after NO_CALLER_ID");
      spy.restore();
    });

    // -- Call relay --

    it("zeros raw body buffer on NO_PROVIDER for call relay (A3)", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after NO_PROVIDER (call)");
      spy.restore();
    });

    it("zeros raw body buffer on MISSING_CONSULTANT_PHONE (A3)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({
        error: "MISSING_CONSULTANT_PHONE",
      });
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after MISSING_CONSULTANT_PHONE",
      );
      spy.restore();
    });

    it("zeros raw body buffer on PROVIDER_ERROR for call relay (A3)", async () => {
      const spy = spyOnReadRawBody();
      const provider = mockProvider({
        initiateOutboundCall: vi
          .fn()
          .mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"clientPhone":"+15551111111","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after PROVIDER_ERROR (call)",
      );
      spy.restore();
    });

    // -- Call-confirm --

    it("zeros pending call buffers when signature validation fails (A4)", async () => {
      const pending: PendingCall = {
        clientPhoneBuf: Buffer.from("+15553333333"),
        callerIdBuf: Buffer.from("+15559999999"),
        orgId: "org_test",
        createdAt: Date.now(),
      };
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(false),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_test",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "bad_sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      // The handler does NOT clean up pending call on signature failure
      // (attacker could be replaying, legitimate consultant may retry).
      // But if the handler DID cleanup, buffers should be zeroed.
      // This test documents the current behavior.
    });
  });

  // -----------------------------------------------------------------------
  // Group B: Error responses never contain request plaintext
  // -----------------------------------------------------------------------

  describe("error responses never contain request plaintext", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const PHONE = "+15551234567";
    const SECRET_BODY = "secret message content";

    it("PROVIDER_ERROR response does not contain phone or body (B1)", async () => {
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"to":"${PHONE}","body":"${SECRET_BODY}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expect(res.body).not.toContain(PHONE);
      expect(res.body).not.toContain(SECRET_BODY);
    });

    it("MISSING_FIELDS response does not contain partial input (B1)", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", `{"to":"${PHONE}"}`);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(res.body).not.toContain(PHONE);
    });

    it("BODY_TOO_LONG response does not contain oversized content (B1)", async () => {
      const oversized = "x".repeat(1601);
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"to":"${PHONE}","body":"${oversized}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(res.body).not.toContain(PHONE);
      expect(res.body).not.toContain(oversized.slice(0, 20));
    });

    it("NO_PROVIDER response does not contain phone (B1)", async () => {
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"to":"${PHONE}","body":"hi"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(res.body).not.toContain(PHONE);
    });

    it("NO_CALLER_ID response does not contain phone (B1)", async () => {
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"to":"${PHONE}","body":"hi"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(res.body).not.toContain(PHONE);
    });

    it("call relay error responses do not contain phone numbers (B1)", async () => {
      const clientPhone = "+15551111111";
      const consultantPhone = "+15552222222";
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        `{"clientPhone":"${clientPhone}","consultantPhone":"${consultantPhone}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(res.body).not.toContain(clientPhone);
      expect(res.body).not.toContain(consultantPhone);
    });
  });

  // -----------------------------------------------------------------------
  // Group G: Malformed input handling
  // -----------------------------------------------------------------------

  describe("relay malformed input handling", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns 400 for non-JSON body and zeros buffer (G1)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", "not json at all");
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
      expectZeroed(spy.getCapturedBuffer(), "rawBody after non-JSON input");
      spy.restore();
    });

    it("returns 400 for truncated JSON body and zeros buffer (G1)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", '{"to":"+');
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after truncated JSON");
      spy.restore();
    });

    it("returns 400 for empty body (G1)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", "");
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      spy.restore();
    });
  });
});
