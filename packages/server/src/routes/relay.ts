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
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { ConsultantService } from "../telephony/consultant-service.js";
import type { PendingClient } from "../tickets/ticket-service.js";
import type { CallTracker } from "../telephony/call-tracker.js";
import { generateTwilioAccessToken } from "../telephony/twilio-token.js";
import type { OrgIdentifiers } from "../telephony/phone-resolver.js";
import { createPhoneRepository } from "../telephony/models/phone-repo.js";
import { isE164Buffer } from "../telephony/phone-utils.js";
import { getStrings } from "../notifications/i18n.js";
import { RateLimitError } from "../errors.js";
import {
  readRawBody,
  extractBufferField,
  extractBooleanField,
  extractStringField,
  authenticateRelay,
  sendJsonResponse,
  sendRelayError,
  MAX_RELAY_BODY,
  type RelaySession,
  type OrgResolver,
} from "./relay-utils.js";
import { readFormBody } from "./webhooks.js";
import { randomUUID, timingSafeEqual } from "node:crypto";

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
   * Takes both org identifiers so it can query both the tenant schema
   * (for purpose SIDs) and the platform table (for provisioned numbers).
   */
  readonly resolveCallerIdByPurpose: (
    org: OrgIdentifiers,
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
  readonly indexer: BlindIndexer;
  readonly fieldEncryptor: FieldEncryptor;
  readonly pendingClients: Map<string, PendingClient>;
  readonly callTracker: CallTracker;
  readonly resolveClientPhone?: (
    ticketId: string,
    tenantDb: Kysely<TenantDatabase>,
    fieldEncryptor: FieldEncryptor,
  ) => Promise<Buffer | null>;
  /** Blind indexer keyed with the consultant-phone-index HKDF label (ADR-065). */
  readonly consultantPhoneIndexer: BlindIndexer;
  /** Factory: builds a SealedBoxEncryptor from the org's public key. */
  readonly getSealedBoxEncryptor: (
    orgSchema: string,
  ) => Promise<SealedBoxEncryptor | null>;
  /** Factory: creates a tenant-scoped ConsultantService. */
  readonly createConsultantService: (
    db: Kysely<TenantDatabase>,
  ) => ConsultantService;
}

export interface PendingCall {
  readonly clientPhoneBuf: Buffer;
  readonly callerIdBuf: Buffer;
  /** Platform-table key: the raw org UUID. Used by getAuthToken/getProvider. */
  readonly orgId: string;
  /** Tenant-schema name. Carried for any confirm-path logic that needs it. */
  readonly orgSchema: string;
  readonly createdAt: number;
}

// ---------------------------------------------------------------------------
// Top-level dispatcher
// ---------------------------------------------------------------------------

/**
 * Creates the relay HTTP handler function.
 * Dispatches by URL path prefix:
 *   POST /relay/sms          -> SMS relay
 *   POST /relay/call         -> Call relay (ticketId + consultantPhone)
 *   POST /relay/webrtc-token -> WebRTC capability token
 *   POST /relay/call-confirm/<orgSchema> -> DTMF callback from Twilio
 */
export interface RelayHandler {
  (req: IncomingMessage, res: ServerResponse): Promise<void>;
  cleanup(): void;
}

export function createRelayHandler(deps: RelayHandlerDeps): RelayHandler {
  const cleanupTimer = startPendingClientCleanup(deps.pendingClients);

  async function handler(
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
    } else if (url === "/relay/phone-lookup") {
      await handlePhoneLookup(req, res, session, deps);
    } else if (url === "/relay/consultant-verify") {
      await handleConsultantVerifyRelay(req, res, session, deps);
    } else {
      res.writeHead(404);
      res.end();
    }
  }

  return Object.assign(handler, {
    cleanup(): void {
      clearInterval(cleanupTimer);
    },
  });
}

// ---------------------------------------------------------------------------
// SMS Relay (POST /relay/sms)
// ---------------------------------------------------------------------------

/**
 * Receives { ticketId, body }. Resolves client phone server-side via OPS
 * decryption, forwards to provider.sendSms(), zeros Buffers.
 */
async function handleSmsRelay(
  req: IncomingMessage,
  res: ServerResponse,
  session: RelaySession,
  deps: RelayHandlerDeps,
): Promise<void> {
  let rawBody: Buffer | null = null;
  let ticketIdBuf: Buffer | null = null;
  let bodyBuf: Buffer | null = null;
  let phoneBuf: Buffer | null = null;

  try {
    rawBody = await readRawBody(req, MAX_RELAY_BODY);

    ticketIdBuf = extractBufferField(rawBody, "ticketId");
    bodyBuf = extractBufferField(rawBody, "body");

    if (
      !ticketIdBuf ||
      !bodyBuf ||
      ticketIdBuf.length === 0 ||
      bodyBuf.length === 0
    ) {
      sendRelayError(res, 400, "MISSING_FIELDS");
      return;
    }

    if (bodyBuf.length > 1600) {
      sendRelayError(res, 400, "BODY_TOO_LONG");
      return;
    }

    const tenantDb = deps.getTenantDb(session.orgSchema);
    const ticketId = ticketIdBuf.toString("utf-8");

    const resolvePhone = deps.resolveClientPhone ?? resolveClientPhone;
    phoneBuf = await resolvePhone(ticketId, tenantDb, deps.fieldEncryptor);
    if (!phoneBuf) {
      sendRelayError(res, 404, "CLIENT_PHONE_NOT_FOUND");
      return;
    }

    const provider = await deps.getProvider(session.orgId);
    if (!provider) {
      sendRelayError(res, 500, "NO_PROVIDER");
      return;
    }

    const callerIdStr = await deps.resolveCallerIdByPurpose(
      { orgId: session.orgId, orgSchema: session.orgSchema },
      "outbound",
    );
    if (callerIdStr === null) {
      sendRelayError(res, 400, "NO_CALLER_ID");
      return;
    }

    // RESIDUAL RISK: JS string copies are immutable and persist until GC.
    // The TelephonyProvider interface accepts strings, not Buffers.
    // Exposure window is short (provider.sendSms awaits a single HTTP call).
    const toStr = phoneBuf.toString("utf-8");
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
    ticketIdBuf?.fill(0);
    bodyBuf?.fill(0);
    phoneBuf?.fill(0);
  }
}

// ---------------------------------------------------------------------------
// Call Relay (POST /relay/call)
// ---------------------------------------------------------------------------

interface CallContext {
  ticketId: string;
  clientPhoneBuf: Buffer;
  consultantPhoneBuf: Buffer;
  provider: TelephonyProvider;
  callerIdStr: string;
}

type CallContextResult = { ok: true; ctx: CallContext } | { ok: false };

async function resolveCallContext(
  rawBody: Buffer,
  session: RelaySession,
  deps: RelayHandlerDeps,
  res: ServerResponse,
): Promise<CallContextResult> {
  const ticketIdBuf = extractBufferField(rawBody, "ticketId");
  if (!ticketIdBuf || ticketIdBuf.length === 0) {
    sendRelayError(res, 400, "MISSING_FIELDS");
    return { ok: false };
  }
  const ticketId = ticketIdBuf.toString("utf-8");
  ticketIdBuf.fill(0);

  const tenantDb = deps.getTenantDb(session.orgSchema);
  const consultantRepo = deps.createConsultantRepo(tenantDb);
  const consultant = await consultantRepo.findByUserId(session.userId);

  if (consultant?.isVerified !== true) {
    sendRelayError(res, 403, "CONSULTANT_NOT_VERIFIED");
    return { ok: false };
  }

  if (consultant.preferredCallMethod === "webrtc") {
    sendJsonResponse(res, 200, { callSid: "", method: "webrtc" });
    return { ok: false };
  }

  const resolvePhone = deps.resolveClientPhone ?? resolveClientPhone;
  const clientPhoneBuf = await resolvePhone(
    ticketId,
    tenantDb,
    deps.fieldEncryptor,
  );
  if (!clientPhoneBuf) {
    sendRelayError(res, 404, "CLIENT_PHONE_NOT_FOUND");
    return { ok: false };
  }

  const provider = await deps.getProvider(session.orgId);
  if (!provider) {
    sendRelayError(res, 500, "NO_PROVIDER");
    return { ok: false };
  }

  const callerIdStr = await deps.resolveCallerIdByPurpose(
    { orgId: session.orgId, orgSchema: session.orgSchema },
    "outbound",
  );
  if (callerIdStr === null) {
    sendRelayError(res, 400, "NO_CALLER_ID");
    return { ok: false };
  }

  const consultantPhoneBuf = extractBufferField(rawBody, "consultantPhone");
  if (!consultantPhoneBuf || consultantPhoneBuf.length === 0) {
    sendRelayError(res, 400, "MISSING_CONSULTANT_PHONE");
    return { ok: false };
  }

  // Verify the submitted number matches the consultant's verified phone.
  // Derive the hash immediately (before any subsequent await) so plaintext
  // lifetime stays minimal and the existing zeroing path is not weakened.
  // Uses session.orgSchema as the salt, matching handleConsultantVerifyRelay.
  if (consultant.opsPhoneHash === null) {
    sendRelayError(res, 403, "CONSULTANT_NOT_VERIFIED");
    return { ok: false };
  }
  const submittedHash = deps.consultantPhoneIndexer.hashBuffer(
    consultantPhoneBuf,
    session.orgSchema,
  );
  const storedBuf = Buffer.from(consultant.opsPhoneHash, "utf-8");
  const submittedBuf = Buffer.from(submittedHash, "utf-8");
  if (
    storedBuf.length !== submittedBuf.length ||
    !timingSafeEqual(storedBuf, submittedBuf)
  ) {
    sendRelayError(res, 403, "CONSULTANT_NOT_VERIFIED");
    return { ok: false };
  }

  return {
    ok: true,
    ctx: {
      ticketId,
      clientPhoneBuf,
      consultantPhoneBuf,
      provider,
      callerIdStr,
    },
  };
}

async function handleCallRelay(
  req: IncomingMessage,
  res: ServerResponse,
  session: RelaySession,
  deps: RelayHandlerDeps,
): Promise<void> {
  let rawBody: Buffer | null = null;
  let callCtx: CallContext | null = null;

  try {
    rawBody = await readRawBody(req, MAX_RELAY_BODY);
    const result = await resolveCallContext(rawBody, session, deps, res);
    if (!result.ok) return;
    callCtx = result.ctx;

    const clientPhoneStr = callCtx.clientPhoneBuf.toString("utf-8");
    const consultantPhoneStr = callCtx.consultantPhoneBuf.toString("utf-8");

    const confirmUrl = `${deps.webhookBaseUrl}/relay/call-confirm/${session.orgSchema}`;
    const statusUrl = `${deps.webhookBaseUrl}/webhooks/${callCtx.provider.providerId}/${session.orgId}/status`;

    let callSid: string;
    try {
      callSid = await callCtx.provider.initiateOutboundCall({
        consultantPhone: consultantPhoneStr,
        clientPhone: clientPhoneStr,
        callerId: callCtx.callerIdStr,
        confirmWebhookUrl: confirmUrl,
        statusWebhookUrl: statusUrl,
      });
    } catch {
      sendRelayError(res, 502, "PROVIDER_ERROR");
      return;
    }

    const clientPhoneClone = Buffer.from(callCtx.clientPhoneBuf);
    const callerIdBuf = Buffer.from(callCtx.callerIdStr);

    deps.pendingCalls.set(callSid, {
      clientPhoneBuf: clientPhoneClone,
      callerIdBuf,
      orgId: session.orgId,
      orgSchema: session.orgSchema,
      createdAt: Date.now(),
    });

    // A failed tracker write is non-fatal: the call is already placed, and a
    // missing tracker entry causes the later recording webhook to quarantine
    // the voicemail, which is the designed safety net.
    try {
      await deps.callTracker.track(session.orgSchema, callSid, {
        ticketId: callCtx.ticketId,
        userId: session.userId,
        direction: "outbound",
        orgSchema: session.orgSchema,
        clientId: null,
        createdAt: Date.now(),
      });
    } catch (trackErr: unknown) {
      console.error(
        "call-tracker write failed for outbound call",
        trackErr instanceof Error ? trackErr.message : String(trackErr),
      );
    }

    sendJsonResponse(res, 200, { callSid, method: "phone_callback" });
  } finally {
    rawBody?.fill(0);
    callCtx?.clientPhoneBuf.fill(0);
    callCtx?.consultantPhoneBuf.fill(0);
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
 * Reads the webhook signature header for a provider.
 *
 * Each provider is matched explicitly rather than through a lookup table,
 * so neither the provider id nor the header name is ever used as a dynamic
 * object key. An unrecognized provider returns null and the caller rejects
 * the request, which is the correct outcome: guessing a header name for a
 * provider whose documentation has not been read would either reject every
 * callback or, worse, read the wrong header.
 *
 * The mock provider reuses Twilio's HMAC-SHA1 format, so it shares the
 * header.
 */
function readSignatureHeader(
  req: IncomingMessage,
  providerId: string,
): string | null {
  switch (providerId) {
    case "twilio":
    case "mock": {
      const value = req.headers["x-twilio-signature"];
      return typeof value === "string" ? value : null;
    }
    default:
      return null;
  }
}

/**
 * Validates an HMAC signature for a call-confirm callback.
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

  const provider = await deps.getProvider(pending.orgId);
  if (!provider) {
    cleanupPendingCall(deps, callSid);
    return { status: "hangup" };
  }

  const signature = readSignatureHeader(req, provider.providerId);
  if (signature === null) return { status: "forbidden" };

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
 * DTMF callback after consultant presses a digit on leg 1.
 * Validates provider HMAC signature, then bridges to client (leg 2).
 *
 * This is a provider webhook, NOT a browser request.
 * Auth: HMAC signature validation (not session cookie).
 * Body: application/x-www-form-urlencoded (provider format).
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

  const provider = await deps.getProvider(session.orgId);
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
      accountSid: await deps.getAccountSid(session.orgId),
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
// Phone Lookup (POST /relay/phone-lookup)
// ---------------------------------------------------------------------------

const PENDING_CLIENT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const PENDING_CLIENT_CLEANUP_INTERVAL_MS = 60 * 1000;

function startPendingClientCleanup(
  pendingClients: Map<string, PendingClient>,
): NodeJS.Timeout {
  return setInterval(() => {
    const now = Date.now();
    for (const [token, entry] of pendingClients) {
      if (now - entry.createdAt > PENDING_CLIENT_TTL_MS) {
        entry.opsEncryptedPhone.fill(0);
        pendingClients.delete(token);
      }
    }
  }, PENDING_CLIENT_CLEANUP_INTERVAL_MS).unref();
}

async function handlePhoneLookup(
  req: IncomingMessage,
  res: ServerResponse,
  session: RelaySession,
  deps: RelayHandlerDeps,
): Promise<void> {
  let rawBody: Buffer | null = null;
  let phoneBuf: Buffer | null = null;

  try {
    rawBody = await readRawBody(req, MAX_RELAY_BODY);
    phoneBuf = extractBufferField(rawBody, "phone");

    if (!phoneBuf || phoneBuf.length === 0) {
      sendRelayError(res, 400, "MISSING_FIELDS");
      return;
    }

    const tenantDb = deps.getTenantDb(session.orgSchema);

    // Extract optional browser-computed blind index hash (128 hex chars).
    // This is an opaque hash value, not PII, so extractStringField is safe.
    const rawPhoneMatchHash = extractStringField(rawBody, "phoneMatchHash");
    const HEX128_RE = /^[0-9a-f]{128}$/;
    let phoneMatchHash: string | null = null;
    if (rawPhoneMatchHash !== null) {
      if (!HEX128_RE.test(rawPhoneMatchHash)) {
        sendRelayError(res, 400, "INVALID_PHONE_MATCH_HASH");
        return;
      }
      phoneMatchHash = rawPhoneMatchHash;
    }

    // Derive hash + OPS-encrypted phone in a tight scope so the JS string
    // reference drops before the await calls below. The string itself is
    // immutable and persists until GC (accepted residual risk, same as SMS
    // relay). Scoping minimizes the number of closures that capture it.
    let phoneHash: string;
    let opsEncryptedPhone: Buffer;
    {
      const phoneStr = phoneBuf.toString("utf-8");
      phoneHash = deps.indexer.hash(phoneStr, session.orgSchema);
      opsEncryptedPhone = deps.fieldEncryptor.encrypt(phoneStr);
    }

    const phoneRepo = createPhoneRepository(tenantDb);
    const existingPhone = await phoneRepo.findByHash(phoneHash);

    if (existingPhone) {
      const client = await tenantDb
        .selectFrom("clients")
        .select(["id", "encrypted_alias"])
        .where("phone_id", "=", existingPhone.id)
        .where("merged_into", "is", null)
        .executeTakeFirst();

      if (client) {
        const openTicket = await tenantDb
          .selectFrom("tickets")
          .select("id")
          .where("client_id", "=", client.id)
          .where("status", "=", "open")
          .executeTakeFirst();

        // Existing client found: zero the pre-computed OPS-encrypted phone
        // since we won't need it for a pending token.
        opsEncryptedPhone.fill(0);

        sendJsonResponse(res, 200, {
          found: true,
          clientId: client.id,
          encryptedAlias: client.encrypted_alias.toString("base64url"),
          openTicketId: openTicket?.id ?? null,
        });
        return;
      }
    }

    // No match: store pre-computed hash + OPS-encrypted phone in pending map.
    const token = randomUUID();
    deps.pendingClients.set(token, {
      phoneHash,
      opsEncryptedPhone,
      phoneMatchHash,
      orgSchema: session.orgSchema,
      createdAt: Date.now(),
    });

    sendJsonResponse(res, 200, {
      found: false,
      token,
    });
  } finally {
    rawBody?.fill(0);
    phoneBuf?.fill(0);
  }
}

// ---------------------------------------------------------------------------
// Consultant Phone Verification (POST /relay/consultant-verify)
// ---------------------------------------------------------------------------

/**
 * Receives { phone, wantsPings }. Derives all phone artifacts from the one
 * plaintext Buffer (ADR-065 single write path), stages them via
 * prepareVerification, then sends the verification code SMS.
 *
 * The phone Buffer and raw body are zeroed in the finally block.
 * The only toString on the phone Buffer is the provider sendSms call
 * (same accepted boundary as handleCallRelay's consultantPhoneBuf.toString).
 */
async function handleConsultantVerifyRelay(
  req: IncomingMessage,
  res: ServerResponse,
  session: RelaySession,
  deps: RelayHandlerDeps,
): Promise<void> {
  let rawBody: Buffer | null = null;
  let phoneBuf: Buffer | null = null;

  try {
    rawBody = await readRawBody(req, MAX_RELAY_BODY);
    phoneBuf = extractBufferField(rawBody, "phone");

    if (!phoneBuf || !isE164Buffer(phoneBuf)) {
      sendRelayError(res, 400, "INVALID_PHONE");
      return;
    }

    const wantsPings = extractBooleanField(rawBody, "wantsPings") ?? false;

    // Derive all three artifacts from the one buffer (ADR-065).
    // No awaits between derivation and the finally zeroing except the
    // provider send, which requires the phone buffer.
    const sealedBox = await deps.getSealedBoxEncryptor(session.orgSchema);
    if (!sealedBox) {
      sendRelayError(res, 500, "NO_ORG_KEY");
      return;
    }

    const orgSealedPhone = sealedBox.sealBuffer(phoneBuf);
    const opsPhoneHash = deps.consultantPhoneIndexer.hashBuffer(
      phoneBuf,
      session.orgSchema,
    );
    const opsEncryptedPhone = wantsPings
      ? deps.fieldEncryptor.encryptBuffer(phoneBuf)
      : null;

    const tenantDb = deps.getTenantDb(session.orgSchema);
    const consultantService = deps.createConsultantService(tenantDb);

    let code: string;
    try {
      const result = await consultantService.prepareVerification(
        session.userId,
        { orgSealedPhone, opsPhoneHash, opsEncryptedPhone },
      );
      code = result.code;
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        res.setHeader("Retry-After", String(err.retryAfterSeconds));
        sendRelayError(res, 429, "RATE_LIMITED");
        return;
      }
      throw err;
    }

    const provider = await deps.getProvider(session.orgId);
    if (!provider) {
      sendRelayError(res, 500, "NO_PROVIDER");
      return;
    }

    const from = await deps.resolveCallerIdByPurpose(
      { orgId: session.orgId, orgSchema: session.orgSchema },
      "outbound",
    );
    if (from === null) {
      sendRelayError(res, 400, "NO_CALLER_ID");
      return;
    }

    const strings = getStrings("en");
    const smsBody = strings.verificationCode(code);

    try {
      await provider.sendSms(phoneBuf.toString("utf-8"), smsBody, from);
    } catch {
      // Generic failure log with user ID only (no phone, no code, no body)
      console.error(`Verification SMS send failed for user ${session.userId}`);
      sendRelayError(res, 502, "PROVIDER_ERROR");
      return;
    }

    sendJsonResponse(res, 200, { sent: true });
  } catch {
    // Catch-all for unexpected errors (NotFoundError from missing consultant
    // registration, etc.). Log user ID only.
    console.error(`Consultant verify relay failed for user ${session.userId}`);
    sendRelayError(res, 500, "INTERNAL_ERROR");
  } finally {
    rawBody?.fill(0);
    phoneBuf?.fill(0);
  }
}

// ---------------------------------------------------------------------------
// Client phone resolution (ticket -> client -> phone -> OPS decrypt)
// ---------------------------------------------------------------------------

export async function resolveClientPhone(
  ticketId: string,
  tenantDb: Kysely<TenantDatabase>,
  fieldEncryptor: FieldEncryptor,
): Promise<Buffer | null> {
  const row = await tenantDb
    .selectFrom("tickets as t")
    .innerJoin("clients as c", "c.id", "t.client_id")
    .innerJoin("phones as p", "p.id", "c.phone_id")
    .select("p.encrypted_number")
    .where("t.id", "=", ticketId)
    .executeTakeFirst();

  if (!row) return null;
  return fieldEncryptor.decryptToBuffer(row.encrypted_number);
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
