/**
 * Raw HTTP handler for webhook endpoints.
 *
 * Path format: /webhooks/<provider>/<org-uuid>/<endpoint>?ts=<timestamp>
 *
 * This is NOT a tRPC route. Twilio sends form-encoded POST requests, not JSON.
 * The handler validates signatures, deduplicates by SID, and dispatches to
 * application-layer callbacks.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { ProviderFactory } from "../telephony/factory.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { DedupStore } from "../telephony/dedup-store.js";
import type {
  TelephonyConfigService,
  WebhookConfigLookup,
} from "../telephony/config-service.js";

const MAX_BODY_SIZE = 1_048_576; // 1 MB
const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const FUTURE_SKEW_MS = 60 * 1000; // 1 minute clock drift tolerance
type WebhookEndpoint = "sms" | "voice" | "status";

const VALID_ENDPOINTS: ReadonlySet<string> = new Set<string>([
  "sms",
  "voice",
  "status",
]);

function isWebhookEndpoint(s: string): s is WebhookEndpoint {
  return VALID_ENDPOINTS.has(s);
}

export interface WebhookHandlerDeps {
  readonly configService: TelephonyConfigService;
  readonly providerFactory: ProviderFactory;
  readonly rateLimiter: RateLimiter;
  readonly dedupStore: DedupStore;
}

export interface WebhookDispatch {
  readonly onInboundSms?: (
    orgId: string,
    body: Record<string, string>,
  ) => Promise<string | null>;
  readonly onInboundVoice?: (
    orgId: string,
    body: Record<string, string>,
  ) => Promise<string | null>;
  readonly onStatusCallback?: (
    orgId: string,
    body: Record<string, string>,
  ) => Promise<void>;
}

interface ParsedPath {
  readonly provider: string;
  readonly orgId: string;
  readonly endpoint: WebhookEndpoint;
  readonly timestamp: number | null;
}

/**
 * Parse /webhooks/<provider>/<orgId>/<endpoint>?ts=<timestamp>.
 * Returns null if the path does not match the expected pattern.
 */
export function parseWebhookPath(url: string): ParsedPath | null {
  // Split off the query string
  const questionIdx = url.indexOf("?");
  const pathname = questionIdx >= 0 ? url.slice(0, questionIdx) : url;
  const queryString = questionIdx >= 0 ? url.slice(questionIdx + 1) : "";

  // Match /webhooks/<provider>/<orgId>/<endpoint>
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 4) return null;
  if (segments[0] !== "webhooks") return null;

  const provider = segments[1];
  const orgId = segments[2];
  const endpointCandidate = segments[3];
  if (
    provider === undefined ||
    orgId === undefined ||
    endpointCandidate === undefined
  ) {
    return null;
  }

  if (!isWebhookEndpoint(endpointCandidate)) return null;

  // Parse optional ts query parameter
  let timestamp: number | null = null;
  if (queryString.length > 0) {
    const params = new URLSearchParams(queryString);
    const tsValue = params.get("ts");
    if (tsValue !== null) {
      const parsed = parseInt(tsValue, 10);
      if (!Number.isNaN(parsed)) {
        timestamp = parsed;
      }
    }
  }

  return {
    provider,
    orgId,
    endpoint: endpointCandidate,
    timestamp,
  };
}

/**
 * Read and parse a form-encoded POST body from an IncomingMessage.
 * Rejects bodies exceeding maxSize bytes (returns null).
 */
export async function readFormBody(
  req: IncomingMessage,
  maxSize: number = MAX_BODY_SIZE,
): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let totalLength = 0;
    let aborted = false;

    req.on("data", (chunk: Buffer) => {
      if (aborted) return;
      totalLength += chunk.length;
      if (totalLength > maxSize) {
        aborted = true;
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (aborted) return;
      const raw = Buffer.concat(chunks).toString("utf-8");
      const params = new URLSearchParams(raw);
      resolve(Object.fromEntries(params));
    });

    req.on("error", () => {
      if (!aborted) {
        resolve(null);
      }
    });
  });
}

/**
 * Build the full public URL for HMAC validation.
 * Twilio signs the entire URL, so we need to reconstruct it from the
 * configured base URL and the request path.
 */
export function reconstructPublicUrl(
  req: IncomingMessage,
  baseUrl: string,
): string {
  // Strip trailing slash from baseUrl, req.url already starts with /
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return base + (req.url ?? "/");
}

/** Write an HTTP response and end the stream. */
function sendResponse(
  res: ServerResponse,
  status: number,
  body?: string,
  contentType?: string,
): void {
  const headers: Record<string, string> = {};
  if (contentType !== undefined) {
    headers["Content-Type"] = contentType;
  }
  res.writeHead(status, headers);
  res.end(body ?? "");
}

/**
 * Extract the deduplication SID from a webhook body.
 * Twilio uses MessageSid for SMS, CallSid for voice, and SmsSid as a fallback.
 */
function extractSid(body: Record<string, string>): string | null {
  return body.MessageSid ?? body.CallSid ?? body.SmsSid ?? null;
}

/**
 * Validates the webhook signature and AccountSid in one pass.
 *
 * Checks: signature header present, provider instantiation succeeds,
 * HMAC signature valid, body AccountSid matches config. Returns null
 * on success, or an HTTP status code on failure.
 */
async function validateWebhookSignature(
  req: IncomingMessage,
  body: Record<string, string>,
  parsed: ParsedPath,
  configLookup: WebhookConfigLookup,
  deps: WebhookHandlerDeps,
  webhookBaseUrl: string,
): Promise<number | null> {
  const signatureHeader = req.headers["x-twilio-signature"];
  if (typeof signatureHeader !== "string" || signatureHeader === "") {
    return 403;
  }

  let provider;
  try {
    provider = await deps.providerFactory.getProvider(parsed.orgId);
  } catch {
    return 500;
  }

  const fullUrl = reconstructPublicUrl(req, webhookBaseUrl);
  const signatureValid = provider.validateWebhook({
    url: fullUrl,
    body,
    signature: signatureHeader,
    authToken: configLookup.authToken,
  });

  if (!signatureValid) return 403;

  // Secondary AccountSid check: body AccountSid must match config
  if (body.AccountSid !== configLookup.accountSid) return 403;

  return null;
}

/**
 * Creates the webhook HTTP handler.
 *
 * Returns a function that can be mounted as a raw Node.js HTTP handler
 * for the /webhooks/* path prefix.
 */
export function createWebhookHandler(
  deps: WebhookHandlerDeps,
  dispatch: WebhookDispatch,
  webhookBaseUrl: string,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    // Method check: only POST
    if (req.method !== "POST") {
      sendResponse(res, 405, "Method Not Allowed");
      return;
    }

    // Content-Type check: only form-encoded
    const contentType = req.headers["content-type"] ?? "";
    if (!contentType.startsWith("application/x-www-form-urlencoded")) {
      sendResponse(res, 415, "Unsupported Media Type");
      return;
    }

    // Rate limiting
    const rateResult = deps.rateLimiter.check("webhook-global");
    if (!rateResult.allowed) {
      sendResponse(res, 429, "Too Many Requests");
      return;
    }

    // Parse path
    const parsed = parseWebhookPath(req.url ?? "");
    if (!parsed) {
      sendResponse(res, 404, "Not Found");
      return;
    }

    // Replay protection: reject timestamps outside the acceptable window.
    // Null timestamp means manual URL entry (skip replay check).
    if (parsed.timestamp !== null) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const ageSeconds = nowSeconds - parsed.timestamp;
      const isTooOld = ageSeconds > REPLAY_WINDOW_MS / 1000;
      const isFromFuture =
        parsed.timestamp > nowSeconds + FUTURE_SKEW_MS / 1000;
      if (isTooOld || isFromFuture) {
        sendResponse(res, 403, "Forbidden");
        return;
      }
    }

    // Read and parse body
    const body = await readFormBody(req);
    if (body === null) {
      sendResponse(res, 413, "Payload Too Large");
      return;
    }

    // Look up and decrypt org telephony config via service
    let configLookup;
    try {
      configLookup = await deps.configService.lookupWebhookConfig(parsed.orgId);
    } catch {
      sendResponse(res, 500, "Internal Server Error");
      return;
    }

    // Return 403 (not 404) if missing: do not reveal whether an org exists
    if (!configLookup) {
      sendResponse(res, 403, "Forbidden");
      return;
    }

    // Provider mismatch: the URL says one provider but the config says another
    if (configLookup.provider !== parsed.provider) {
      sendResponse(res, 403, "Forbidden");
      return;
    }

    // Validate signature + AccountSid
    const sigFailure = await validateWebhookSignature(
      req,
      body,
      parsed,
      configLookup,
      deps,
      webhookBaseUrl,
    );
    if (sigFailure !== null) {
      sendResponse(
        res,
        sigFailure,
        sigFailure === 500 ? "Internal Server Error" : "Forbidden",
      );
      return;
    }

    // Idempotency: check for duplicate SID
    const sid = extractSid(body);
    if (sid !== null && deps.dedupStore.isDuplicate(sid)) {
      sendResponse(res, 200);
      return;
    }

    // Dispatch to handler based on endpoint type
    let twimlResponse: string | null = null;
    try {
      switch (parsed.endpoint) {
        case "sms":
          if (dispatch.onInboundSms) {
            twimlResponse = await dispatch.onInboundSms(parsed.orgId, body);
          }
          break;
        case "voice":
          if (dispatch.onInboundVoice) {
            twimlResponse = await dispatch.onInboundVoice(parsed.orgId, body);
          }
          break;
        case "status":
          if (dispatch.onStatusCallback) {
            await dispatch.onStatusCallback(parsed.orgId, body);
          }
          break;
      }
    } catch {
      // Dispatch failure: return 500 but do NOT mark as processed
      // (Twilio will retry)
      sendResponse(res, 500, "Internal Server Error");
      return;
    }

    // Mark SID as processed after successful dispatch
    if (sid !== null) {
      deps.dedupStore.markProcessed(sid);
    }

    // Return TwiML if dispatch returned a string, else empty 200
    if (twimlResponse !== null) {
      sendResponse(res, 200, twimlResponse, "text/xml");
    } else {
      sendResponse(res, 200);
    }
  };
}
