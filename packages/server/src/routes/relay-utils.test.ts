import { describe, it, expect, vi } from "vitest";
import { IncomingMessage, type ServerResponse } from "node:http";
import { Socket } from "node:net";
import type { SessionRepository } from "../auth/session-repository.js";
import type { SessionData } from "../auth/session-repository.js";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgId,
  OrgSchema,
} from "@care-y/shared";
import {
  readRawBody,
  extractBufferField,
  extractStringField,
  parseCookieValue,
  authenticateRelay,
  sendJsonResponse,
  sendRelayError,
  MAX_RELAY_BODY,
} from "./relay-utils.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a minimal IncomingMessage backed by a Readable stream with data. */
function createMockReq(
  body: string | Buffer,
  headers?: Record<string, string>,
): IncomingMessage {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      req.headers[k.toLowerCase()] = v;
    }
  }
  // Push data then signal end
  process.nextTick(() => {
    req.push(typeof body === "string" ? Buffer.from(body) : body);
    req.push(null);
  });
  return req;
}

/** Creates a mock ServerResponse that captures writeHead + end calls. */
function createMockRes(): {
  writeHead: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  statusCode: number;
  body: string;
} {
  const state = { statusCode: 0, body: "" };
  return {
    writeHead: vi.fn((status: number) => {
      state.statusCode = status;
    }),
    end: vi.fn((data?: string) => {
      state.body = data ?? "";
    }),
    get statusCode() {
      return state.statusCode;
    },
    get body() {
      return state.body;
    },
  };
}

const TEST_SESSION_ID = "00000000-0000-4000-8000-000000000010" as SessionId;
const TEST_SESSION_TOKEN = "tok_abc123" as SessionToken;
const TEST_USER_ID = "00000000-0000-4000-8000-000000000020" as UserId;
const TEST_IP_TOKEN = "hmac-ip" as IpToken;
const TEST_UA_TOKEN = "hmac-ua" as UaToken;
const TEST_ORG_ID = "00000000-0000-4000-8000-aaaaaaaaaaaa" as OrgId;
const TEST_ORG_SCHEMA = "org_00000000-0000-4000-8000-aaaaaaaaaaaa" as OrgSchema;

function makeSessionData(overrides?: Partial<SessionData>): SessionData {
  return {
    id: TEST_SESSION_ID,
    token: TEST_SESSION_TOKEN,
    userId: TEST_USER_ID,
    ipToken: TEST_IP_TOKEN,
    uaToken: TEST_UA_TOKEN,
    expiresAt: new Date(Date.now() + 3600_000),
    twofaVerified: true,
    webauthnChallenge: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// readRawBody
// ---------------------------------------------------------------------------

describe("readRawBody", () => {
  it("returns Buffer for valid body", async () => {
    const req = createMockReq("hello world");
    const buf = await readRawBody(req, 1024);
    expect(buf.toString("utf-8")).toBe("hello world");
  });

  it("rejects body exceeding maxSize", async () => {
    const req = createMockReq("x".repeat(100));
    await expect(readRawBody(req, 50)).rejects.toThrow("Body too large");
  });

  it("handles empty body", async () => {
    const req = createMockReq("");
    const buf = await readRawBody(req, 1024);
    expect(buf.length).toBe(0);
  });

  it("handles binary data", async () => {
    const binary = Buffer.from([0x00, 0xff, 0x7f, 0x80]);
    const req = createMockReq(binary);
    const buf = await readRawBody(req, 1024);
    expect(Buffer.compare(buf, binary)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// extractBufferField
// ---------------------------------------------------------------------------

describe("extractBufferField", () => {
  it("extracts a simple field value as Buffer", () => {
    const raw = Buffer.from('{"to":"+15551234567","body":"hello"}');
    const result = extractBufferField(raw, "to");
    expect(result).not.toBeNull();
    expect(result!.toString("utf-8")).toBe("+15551234567");
  });

  it("extracts second field correctly", () => {
    const raw = Buffer.from('{"to":"+15551234567","body":"hello"}');
    const result = extractBufferField(raw, "body");
    expect(result).not.toBeNull();
    expect(result!.toString("utf-8")).toBe("hello");
  });

  it("returns null for missing field", () => {
    const raw = Buffer.from('{"to":"+15551234567"}');
    const result = extractBufferField(raw, "body");
    expect(result).toBeNull();
  });

  it("handles escaped quotes in value", () => {
    const raw = Buffer.from('{"body":"say \\"hello\\""}');
    const result = extractBufferField(raw, "body");
    expect(result).not.toBeNull();
    expect(result!.toString("utf-8")).toBe('say \\"hello\\"');
  });

  it("handles escaped backslash before closing quote", () => {
    // Value is: ends with backslash\\  (the \\\\" is literal \\ + closing ")
    const raw = Buffer.from('{"body":"trail\\\\"}');
    const result = extractBufferField(raw, "body");
    expect(result).not.toBeNull();
    expect(result!.toString("utf-8")).toBe("trail\\\\");
  });

  it("handles field at end of object", () => {
    const raw = Buffer.from('{"to":"+15551234567"}');
    const result = extractBufferField(raw, "to");
    expect(result).not.toBeNull();
    expect(result!.toString("utf-8")).toBe("+15551234567");
  });

  it("handles space after colon", () => {
    const raw = Buffer.from('{"to": "+15551234567"}');
    const result = extractBufferField(raw, "to");
    expect(result).not.toBeNull();
    expect(result!.toString("utf-8")).toBe("+15551234567");
  });

  it("returns a Buffer that shares memory with raw (subarray)", () => {
    const raw = Buffer.from('{"to":"+15551234567"}');
    const result = extractBufferField(raw, "to");
    expect(result).not.toBeNull();
    // Zeroing raw should also zero the extracted field since subarray shares memory
    const valueBefore = result!.toString("utf-8");
    expect(valueBefore).toBe("+15551234567");
    raw.fill(0);
    expect(result!.every((b) => b === 0)).toBe(true);
  });

  it("handles empty string value", () => {
    const raw = Buffer.from('{"to":""}');
    const result = extractBufferField(raw, "to");
    expect(result).not.toBeNull();
    expect(result!.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// extractStringField
// ---------------------------------------------------------------------------

describe("extractStringField", () => {
  it("returns string for existing field", () => {
    const raw = Buffer.from('{"method":"phone_callback"}');
    expect(extractStringField(raw, "method")).toBe("phone_callback");
  });

  it("returns null for missing field", () => {
    const raw = Buffer.from('{"to":"+15551234567"}');
    expect(extractStringField(raw, "method")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseCookieValue
// ---------------------------------------------------------------------------

describe("parseCookieValue", () => {
  it("extracts named cookie from single-cookie header", () => {
    expect(parseCookieValue("care_y_session=abc123", "care_y_session")).toBe(
      "abc123",
    );
  });

  it("extracts named cookie from multi-cookie header", () => {
    const header = "other=xyz; care_y_session=abc123; theme=dark";
    expect(parseCookieValue(header, "care_y_session")).toBe("abc123");
  });

  it("handles leading whitespace after semicolon", () => {
    const header = "other=xyz;  care_y_session=abc123";
    expect(parseCookieValue(header, "care_y_session")).toBe("abc123");
  });

  it("returns null for missing cookie", () => {
    expect(parseCookieValue("other=xyz", "care_y_session")).toBeNull();
  });

  it("returns null for empty header", () => {
    expect(parseCookieValue("", "care_y_session")).toBeNull();
  });

  it("does not partial-match cookie names", () => {
    // "care_y_session_extra" should not match "care_y_session"
    expect(
      parseCookieValue("care_y_session_extra=abc", "care_y_session"),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// authenticateRelay
// ---------------------------------------------------------------------------

describe("authenticateRelay", () => {
  const validOrgResolver = () => ({
    orgId: TEST_ORG_ID,
    orgSchema: TEST_ORG_SCHEMA,
  });

  function mockSessionRepo(
    session: SessionData | null,
  ): (orgSchema: OrgSchema) => SessionRepository {
    return (_orgSchema: OrgSchema) => ({
      findByToken: vi.fn().mockResolvedValue(session),
      create: vi.fn(),
      deleteByToken: vi.fn(),
      deleteByUserId: vi.fn(),
      deleteByUserIdExceptToken: vi.fn().mockResolvedValue(0),
      deleteExpired: vi.fn(),
      markTwoFactorVerified: vi.fn(),
      clearTwoFactorVerified: vi.fn(),
      setWebauthnChallenge: vi.fn(),
    });
  }

  it("returns session data for valid cookie and resolved org", async () => {
    const req = createMockReq("", {
      cookie: "care_y_session=tok_abc123",
    });
    const session = makeSessionData();
    const result = await authenticateRelay(
      req,
      validOrgResolver,
      mockSessionRepo(session),
    );
    expect(result).toEqual({
      ok: true,
      session: {
        userId: TEST_USER_ID,
        orgId: TEST_ORG_ID,
        orgSchema: TEST_ORG_SCHEMA,
        sessionId: TEST_SESSION_ID,
      },
    });
  });

  it("returns 401 for missing cookie", async () => {
    const req = createMockReq("", {});
    const result = await authenticateRelay(
      req,
      validOrgResolver,
      mockSessionRepo(makeSessionData()),
    );
    expect(result).toEqual({ ok: false, status: 401 });
  });

  it("returns 401 when org cannot be resolved", async () => {
    const req = createMockReq("", {
      cookie: "care_y_session=tok_abc123",
    });
    const result = await authenticateRelay(
      req,
      () => null,
      mockSessionRepo(makeSessionData()),
    );
    expect(result).toEqual({ ok: false, status: 401 });
  });

  it("returns 401 for expired session", async () => {
    const req = createMockReq("", {
      cookie: "care_y_session=tok_abc123",
    });
    const expiredSession = makeSessionData({
      expiresAt: new Date(Date.now() - 1000),
    });
    const result = await authenticateRelay(
      req,
      validOrgResolver,
      mockSessionRepo(expiredSession),
    );
    expect(result).toEqual({ ok: false, status: 401 });
  });

  it("returns 403 for session without 2FA verification", async () => {
    const req = createMockReq("", {
      cookie: "care_y_session=tok_abc123",
    });
    const noTwofa = makeSessionData({ twofaVerified: false });
    const result = await authenticateRelay(
      req,
      validOrgResolver,
      mockSessionRepo(noTwofa),
    );
    expect(result).toEqual({ ok: false, status: 403 });
  });

  it("returns 401 when session not found", async () => {
    const req = createMockReq("", {
      cookie: "care_y_session=tok_abc123",
    });
    const result = await authenticateRelay(
      req,
      validOrgResolver,
      mockSessionRepo(null),
    );
    expect(result).toEqual({ ok: false, status: 401 });
  });
});

// ---------------------------------------------------------------------------
// sendJsonResponse / sendRelayError
// ---------------------------------------------------------------------------

describe("sendJsonResponse", () => {
  it("sends JSON with correct status and content-type", () => {
    const res = createMockRes();
    sendJsonResponse(res as unknown as ServerResponse, 200, {
      messageId: "SM_123",
    });
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith('{"messageId":"SM_123"}');
  });
});

describe("sendRelayError", () => {
  it("sends error JSON with code field", () => {
    const res = createMockRes();
    sendRelayError(res as unknown as ServerResponse, 400, "MISSING_FIELDS");
    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith('{"error":"MISSING_FIELDS"}');
  });
});

// ---------------------------------------------------------------------------
// MAX_RELAY_BODY constant
// ---------------------------------------------------------------------------

describe("MAX_RELAY_BODY", () => {
  it("is 64KB", () => {
    // API contract: relay body limit is a security boundary; changing it requires coordinated client+server update.
    expect(MAX_RELAY_BODY).toBe(64 * 1024);
  });
});
