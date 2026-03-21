/**
 * Outbound relay HTTP handlers.
 *
 * These are raw HTTP handlers (not tRPC) because the browser sends decrypted
 * plaintext (phone numbers, SMS bodies) that the server must forward to the
 * telephony provider and immediately zero from memory. tRPC's JSON parser
 * creates immutable JS strings. Raw handlers read the body as Buffer and
 * .fill(0) in finally blocks.
 *
 * Mounting: registered in createHttpServer via URL prefix "/relay/*".
 * Auth: session cookie (same session functions as tRPC, called directly).
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { ConsultantRepository } from "../telephony/models/consultant-repo.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SessionRepository } from "../auth/session-repository.js";
import { generateTwilioAccessToken } from "../telephony/twilio-token.js";
import {
  readRawBody,
  extractBufferField,
  authenticateRelay,
  sendJsonResponse,
  sendRelayError,
  MAX_RELAY_BODY,
  type RelaySession,
  type OrgResolver,
} from "./relay-utils.js";
import { readFormBody } from "./webhooks.js";

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

export interface RelayHandlerDeps {
  readonly getProvider: (orgId: string) => Promise<TelephonyProvider | null>;
  readonly getTenantDb: (orgSchema: string) => Kysely<TenantDatabase>;
  readonly createConsultantRepo: (
    db: Kysely<TenantDatabase>,
  ) => ConsultantRepository;
  /**
   * Resolve a caller ID E.164 number by purpose.
   * Uses org_config purpose SIDs with fallback chain.
   */
  readonly resolveCallerIdByPurpose: (
    orgSchema: string,
    purpose: "outbound" | "system",
  ) => Promise<string | null>;
  /** Map of CallSid -> pending call state for DTMF confirmation. */
  readonly pendingCalls: Map<string, PendingCall>;
  readonly webhookBaseUrl: string;
  /** Retrieve the auth token for an org's Twilio account (for HMAC validation). */
  readonly getAuthToken: (orgId: string) => Promise<string | null>;
  /** Retrieve the Twilio Account SID for a given org. */
  readonly getAccountSid: (orgId: string) => Promise<string>;
  /** Twilio API Key SID for signing Access Tokens. Platform-level, not per-org. */
  readonly apiKeySid: string;
  /** Twilio API Key Secret for signing Access Tokens. */
  readonly apiKeySecret: string;
  /** TwiML Application SID for WebRTC scope. */
  readonly twimlAppSid: string;
  /** Org resolver (Host header -> orgSchema). Injected for testability. */
  readonly orgResolver: OrgResolver;
  /** Create a tenant-scoped session repository. May be async (DB lookup for org key). */
  readonly createSessionRepo: (
    orgSchema: string,
  ) => SessionRepository | Promise<SessionRepository>;
}

export interface PendingCall {
  readonly clientPhoneBuf: Buffer;
  readonly callerIdBuf: Buffer;
  readonly orgId: string;
  readonly createdAt: number;
}

// ---------------------------------------------------------------------------
// Top-level dispatcher
// ---------------------------------------------------------------------------

/**
 * Creates the relay HTTP handler function.
 * Dispatches by URL path prefix:
 *   POST /relay/sms          -> SMS relay
 *   POST /relay/call         -> Call relay (two-leg or WebRTC redirect)
 *   POST /relay/webrtc-token -> WebRTC capability token
 *   POST /relay/call-confirm/<orgSchema> -> DTMF callback from Twilio
 */
export function createRelayHandler(
  deps: RelayHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  return async function handleRelay(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const url = req.url ?? "";

    // DTMF callback is Twilio-signed (not session auth)
    if (url.startsWith("/relay/call-confirm/")) {
      await handleCallConfirm(req, res, deps);
      return;
    }

    // All other relay endpoints require POST + session auth
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }

    const authResult = await authenticateRelay(
      req,
      deps.orgResolver,
      deps.createSessionRepo,
    );
    if (!authResult.ok) {
      sendRelayError(
        res,
        authResult.status,
        authResult.status === 401 ? "UNAUTHORIZED" : "TWO_FACTOR_REQUIRED",
      );
      return;
    }
    const session = authResult.session;

    if (url === "/relay/sms") {
      await handleSmsRelay(req, res, session, deps);
    } else if (url === "/relay/call") {
      await handleCallRelay(req, res, session, deps);
    } else if (url === "/relay/webrtc-token") {
      await handleWebrtcToken(req, res, session, deps);
    } else {
      res.writeHead(404);
      res.end();
    }
  };
}

// ---------------------------------------------------------------------------
// SMS Relay (POST /relay/sms)
// ---------------------------------------------------------------------------

/**
 * Receives { to, body }, forwards to provider.sendSms(), zeros Buffers.
 * Caller ID resolved server-side via org_config.phone_outbound_sid.
 */
async function handleSmsRelay(
  req: IncomingMessage,
  res: ServerResponse,
  session: RelaySession,
  deps: RelayHandlerDeps,
): Promise<void> {
  let rawBody: Buffer | null = null;
  let toBuf: Buffer | null = null;
  let bodyBuf: Buffer | null = null;

  try {
    rawBody = await readRawBody(req, MAX_RELAY_BODY);

    toBuf = extractBufferField(rawBody, "to");
    bodyBuf = extractBufferField(rawBody, "body");

    if (!toBuf || !bodyBuf || toBuf.length === 0 || bodyBuf.length === 0) {
      sendRelayError(res, 400, "MISSING_FIELDS");
      return;
    }

    if (bodyBuf.length > 1600) {
      sendRelayError(res, 400, "BODY_TOO_LONG");
      return;
    }

    const provider = await deps.getProvider(session.orgSchema);
    if (!provider) {
      sendRelayError(res, 500, "NO_PROVIDER");
      return;
    }

    const callerIdStr = await deps.resolveCallerIdByPurpose(
      session.orgSchema,
      "outbound",
    );
    if (callerIdStr === null) {
      sendRelayError(res, 400, "NO_CALLER_ID");
      return;
    }

    // Convert Buffers to strings at the last possible moment.
    // RESIDUAL RISK: these JS string copies are immutable and persist until
    // GC collects them. The TelephonyProvider interface (4a) accepts strings,
    // not Buffers. The exposure window is short (provider.sendSms awaits a
    // single HTTP call) and the strings hold no references after this scope
    // exits, so they become GC-eligible immediately.
    const toStr = toBuf.toString("utf-8");
    const bodyStr = bodyBuf.toString("utf-8");

    let result: { messageId: string };
    try {
      result = await provider.sendSms(toStr, bodyStr, callerIdStr);
    } catch {
      sendRelayError(res, 502, "PROVIDER_ERROR");
      return;
    }

    sendJsonResponse(res, 200, { messageId: result.messageId });
  } finally {
    rawBody?.fill(0);
    toBuf?.fill(0);
    bodyBuf?.fill(0);
  }
}

// ---------------------------------------------------------------------------
// Call Relay (POST /relay/call)
// ---------------------------------------------------------------------------

/**
 * Initiates an outbound call. The method (phone_callback or webrtc) is
 * determined by the consultant's preference, not the request body.
 *
 * For phone_callback: browser sends { clientPhone, consultantPhone }.
 * Server cannot decrypt consultant's sealed-box encrypted phone (Proton model).
 */
async function handleCallRelay(
  req: IncomingMessage,
  res: ServerResponse,
  session: RelaySession,
  deps: RelayHandlerDeps,
): Promise<void> {
  let rawBody: Buffer | null = null;
  let clientPhoneBuf: Buffer | null = null;
  let consultantPhoneBuf: Buffer | null = null;

  try {
    rawBody = await readRawBody(req, MAX_RELAY_BODY);
    clientPhoneBuf = extractBufferField(rawBody, "clientPhone");

    if (!clientPhoneBuf || clientPhoneBuf.length === 0) {
      sendRelayError(res, 400, "MISSING_FIELDS");
      return;
    }

    const tenantDb = deps.getTenantDb(session.orgSchema);
    const consultantRepo = deps.createConsultantRepo(tenantDb);
    const consultant = await consultantRepo.findByUserId(session.userId);

    if (consultant?.isVerified !== true) {
      sendRelayError(res, 403, "CONSULTANT_NOT_VERIFIED");
      return;
    }

    // If WebRTC preferred, tell the client to use the token endpoint instead
    if (consultant.preferredCallMethod === "webrtc") {
      sendJsonResponse(res, 200, {
        callSid: "",
        method: "webrtc",
      });
      return;
    }

    // Phone callback flow
    const provider = await deps.getProvider(session.orgSchema);
    if (!provider) {
      sendRelayError(res, 500, "NO_PROVIDER");
      return;
    }

    const callerIdStr = await deps.resolveCallerIdByPurpose(
      session.orgSchema,
      "outbound",
    );
    if (callerIdStr === null) {
      sendRelayError(res, 400, "NO_CALLER_ID");
      return;
    }

    // Browser must send consultant's phone (Proton model: server can't decrypt)
    consultantPhoneBuf = extractBufferField(rawBody, "consultantPhone");
    if (!consultantPhoneBuf || consultantPhoneBuf.length === 0) {
      sendRelayError(res, 400, "MISSING_CONSULTANT_PHONE");
      return;
    }

    const clientPhoneStr = clientPhoneBuf.toString("utf-8");
    const consultantPhoneStr = consultantPhoneBuf.toString("utf-8");

    const confirmUrl = `${deps.webhookBaseUrl}/relay/call-confirm/${session.orgSchema}`;
    const statusUrl = `${deps.webhookBaseUrl}/webhooks/twilio/${session.orgSchema}/status`;

    let callSid: string;
    try {
      callSid = await provider.initiateOutboundCall({
        consultantPhone: consultantPhoneStr,
        clientPhone: clientPhoneStr,
        callerId: callerIdStr,
        confirmWebhookUrl: confirmUrl,
        statusWebhookUrl: statusUrl,
      });
    } catch {
      sendRelayError(res, 502, "PROVIDER_ERROR");
      return;
    }

    // Store pending call state for DTMF confirmation.
    // Clone the client phone Buffer (original is zeroed in finally).
    const clientPhoneClone = Buffer.from(clientPhoneBuf);
    const callerIdBuf = Buffer.from(callerIdStr);

    deps.pendingCalls.set(callSid, {
      clientPhoneBuf: clientPhoneClone,
      callerIdBuf,
      orgId: session.orgSchema,
      createdAt: Date.now(),
    });

    sendJsonResponse(res, 200, { callSid, method: "phone_callback" });
  } finally {
    rawBody?.fill(0);
    clientPhoneBuf?.fill(0);
    if (consultantPhoneBuf) consultantPhoneBuf.fill(0);
  }
}

// ---------------------------------------------------------------------------
// DTMF Confirmation Callback (POST /relay/call-confirm/<orgSchema>)
// ---------------------------------------------------------------------------

/**
 * Extracts the orgSchema segment from /relay/call-confirm/<orgSchema>.
 * Returns null if the path does not match.
 */
function parseCallConfirmPath(url: string): string | null {
  const prefix = "/relay/call-confirm/";
  if (!url.startsWith(prefix)) return null;
  const orgSchema = url.slice(prefix.length);
  return orgSchema.length > 0 ? orgSchema : null;
}

type CallConfirmValidation =
  | { status: "valid" }
  | { status: "hangup" } // Infrastructure failure (missing auth token or provider)
  | { status: "forbidden" }; // Auth failure (missing or invalid signature)

/**
 * Validates a Twilio HMAC signature for a call-confirm callback.
 * Fetches the auth token and provider for the pending call's org,
 * then delegates to the provider's validateWebhook method.
 *
 * Returns a discriminated result so the caller can distinguish between
 * infrastructure failures (hangup) and auth failures (403).
 */
async function validateCallConfirmSignature(
  req: IncomingMessage,
  body: Record<string, string>,
  pending: PendingCall,
  callSid: string,
  deps: RelayHandlerDeps,
): Promise<CallConfirmValidation> {
  const authToken = await deps.getAuthToken(pending.orgId);
  if (authToken === null) {
    cleanupPendingCall(deps, callSid);
    return { status: "hangup" };
  }

  const signature = req.headers["x-twilio-signature"];
  if (typeof signature !== "string") return { status: "forbidden" };

  const provider = await deps.getProvider(pending.orgId);
  if (!provider) {
    cleanupPendingCall(deps, callSid);
    return { status: "hangup" };
  }

  const fullUrl = deps.webhookBaseUrl + (req.url ?? "");
  const isValid = provider.validateWebhook({
    url: fullUrl,
    body,
    signature,
    authToken,
  });
  return isValid ? { status: "valid" } : { status: "forbidden" };
}

/**
 * Twilio DTMF callback after consultant presses a digit on leg 1.
 * Validates Twilio HMAC signature, then bridges to client (leg 2).
 *
 * This is a Twilio webhook, NOT a browser request.
 * Auth: HMAC signature validation (not session cookie).
 * Body: application/x-www-form-urlencoded (Twilio format).
 */
async function handleCallConfirm(
  req: IncomingMessage,
  res: ServerResponse,
  deps: RelayHandlerDeps,
): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end();
    return;
  }

  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded")) {
    res.writeHead(415);
    res.end();
    return;
  }

  const orgSchema = parseCallConfirmPath(req.url ?? "");
  if (orgSchema === null) {
    res.writeHead(400);
    res.end();
    return;
  }

  const body = await readFormBody(req, MAX_RELAY_BODY);
  if (body === null) {
    res.writeHead(400);
    res.end();
    return;
  }

  const callSid = body.CallSid;
  if (callSid === undefined || callSid === "") {
    res.writeHead(400);
    res.end();
    return;
  }

  const pending = deps.pendingCalls.get(callSid);
  if (!pending) {
    respondTwiml(res, "<Response><Hangup/></Response>");
    return;
  }

  const validation = await validateCallConfirmSignature(
    req,
    body,
    pending,
    callSid,
    deps,
  );
  if (validation.status === "hangup") {
    respondTwiml(res, "<Response><Hangup/></Response>");
    return;
  }
  if (validation.status === "forbidden") {
    res.writeHead(403);
    res.end();
    return;
  }

  // Check if consultant pressed a digit (any digit = confirm)
  const digits = body.Digits;
  if (digits === undefined || digits === "") {
    respondTwiml(
      res,
      "<Response><Say>No confirmation received. Goodbye.</Say><Hangup/></Response>",
    );
    cleanupPendingCall(deps, callSid);
    return;
  }

  // Bridge to client (leg 2)
  const clientPhone = pending.clientPhoneBuf.toString("utf-8");
  const callerId = pending.callerIdBuf.toString("utf-8");

  const twiml = `<Response><Dial callerId="${escapeXml(callerId)}"><Number>${escapeXml(clientPhone)}</Number></Dial></Response>`;

  respondTwiml(res, twiml);
  cleanupPendingCall(deps, callSid);
}

// ---------------------------------------------------------------------------
// WebRTC Token (POST /relay/webrtc-token)
// ---------------------------------------------------------------------------

/**
 * Returns a short-lived Twilio Access Token for browser-based calling.
 * Session auth required. Token scoped to the org's TwiML app.
 */
async function handleWebrtcToken(
  _req: IncomingMessage,
  res: ServerResponse,
  session: RelaySession,
  deps: RelayHandlerDeps,
): Promise<void> {
  // Verify consultant registration
  const tenantDb = deps.getTenantDb(session.orgSchema);
  const consultantRepo = deps.createConsultantRepo(tenantDb);
  const consultant = await consultantRepo.findByUserId(session.userId);

  if (consultant?.isVerified !== true) {
    sendRelayError(res, 403, "CONSULTANT_NOT_VERIFIED");
    return;
  }

  const provider = await deps.getProvider(session.orgSchema);
  if (!provider) {
    sendRelayError(res, 500, "NO_PROVIDER");
    return;
  }

  // Platform-level Twilio API Key must be configured for WebRTC
  if (!deps.apiKeySid || !deps.apiKeySecret || !deps.twimlAppSid) {
    sendRelayError(res, 500, "WEBRTC_NOT_CONFIGURED");
    return;
  }

  const ttl = 300; // 5 minutes
  const token = generateTwilioAccessToken(
    {
      accountSid: await deps.getAccountSid(session.orgSchema),
      apiKeySid: deps.apiKeySid,
      apiKeySecret: deps.apiKeySecret,
      twimlAppSid: deps.twimlAppSid,
    },
    {
      identity: session.userId,
      ttl,
    },
  );

  sendJsonResponse(res, 200, { token, ttl });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function respondTwiml(res: ServerResponse, twiml: string): void {
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanupPendingCall(deps: RelayHandlerDeps, callSid: string): void {
  const pending = deps.pendingCalls.get(callSid);
  if (pending) {
    pending.clientPhoneBuf.fill(0);
    pending.callerIdBuf.fill(0);
    deps.pendingCalls.delete(callSid);
  }
}
