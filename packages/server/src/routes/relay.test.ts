import { describe, it, expect, vi } from "vitest";
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
    deleteExpired: vi.fn(),
    markTwoFactorVerified: vi.fn(),
    clearTwoFactorVerified: vi.fn(),
    setWebauthnChallenge: vi.fn(),
  };
}

function mockProvider(
  overrides?: Partial<TelephonyProvider>,
): TelephonyProvider {
  return {
    providerId: "mock",
    sendSms: vi.fn().mockResolvedValue({ messageId: "SM_test_123" }),
    initiateOutboundCall: vi.fn().mockResolvedValue("CA_test_456"),
    initiateWebRtcCall: vi.fn().mockResolvedValue("CA_test_789"),
    validateWebhook: vi.fn().mockReturnValue(true),
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

      const deps = makeDeps({ pendingCalls });
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

      const deps = makeDeps({ pendingCalls });
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

        const deps = makeDeps({ pendingCalls });
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
});
