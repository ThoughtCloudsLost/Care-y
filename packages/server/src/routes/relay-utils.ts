/**
 * Shared utilities for relay endpoints (raw HTTP handlers).
 *
 * Relay endpoints receive browser-decrypted plaintext (phone numbers, SMS
 * bodies) and forward them to the telephony provider. They use Buffer-based
 * body parsing to enable deterministic memory zeroing in finally blocks.
 *
 * These utilities are separated from the relay handlers so they can be
 * unit-tested independently with simple mock objects.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { SessionRepository } from "../auth/session-repository.js";

/** Maximum relay request body size (64KB). */
export const MAX_RELAY_BODY = 64 * 1024;

/**
 * Reads the request body as a raw Buffer. Rejects if body exceeds maxSize.
 * Does NOT call JSON.parse. The caller extracts fields from the Buffer.
 */
export async function readRawBody(
  req: IncomingMessage,
  maxSize: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxSize) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

/**
 * Extracts a JSON string field value as a Buffer without creating a JS string.
 *
 * Searches for `"fieldName":"` in the raw Buffer, then reads until the closing
 * quote. Returns null if the field is not found. Handles JSON escape sequences
 * (backslash-escaped quotes and literal backslashes).
 *
 * This is intentionally limited: it only extracts top-level string fields from
 * flat JSON objects. Nested objects, arrays, and non-string values are not
 * supported. The relay schemas are flat specifically to enable this parser.
 */
export function extractBufferField(
  raw: Buffer,
  fieldName: string,
): Buffer | null {
  // Search for "fieldName":"  (with quotes and colon)
  // Needles contain only field names (not sensitive), but zeroed for
  // defense-in-depth per relay-buffer-zero rule.
  const needle = Buffer.from(`"${fieldName}":"`);
  try {
    const idx = raw.indexOf(needle);
    if (idx === -1) {
      const needleSpaced = Buffer.from(`"${fieldName}": "`);
      try {
        const idxSpaced = raw.indexOf(needleSpaced);
        if (idxSpaced === -1) return null;
        return extractValueFromPosition(raw, idxSpaced + needleSpaced.length);
      } finally {
        needleSpaced.fill(0);
      }
    }

    return extractValueFromPosition(raw, idx + needle.length);
  } finally {
    needle.fill(0);
  }
}

/**
 * Reads a JSON string value starting at valueStart (byte after the opening
 * quote) until the closing unescaped quote.
 */
function extractValueFromPosition(
  raw: Buffer,
  valueStart: number,
): Buffer | null {
  // Find closing quote. Count consecutive backslashes before the quote:
  // if even, the quote is real; if odd, the quote is escaped.
  // Simple raw[end-1] check fails for inputs like \\" (literal backslash
  // + real closing quote).
  let end = valueStart;
  while (end < raw.length) {
    // eslint-disable-next-line security/detect-object-injection -- Buffer indexed by loop counter bounded by raw.length
    if (raw[end] === 0x22 /* " */) {
      let backslashes = 0;
      let scan = end - 1;
      // eslint-disable-next-line security/detect-object-injection -- Buffer indexed by decrementing scan, bounded by valueStart
      while (scan >= valueStart && raw[scan] === 0x5c /* \ */) {
        backslashes++;
        scan--;
      }
      if (backslashes % 2 === 0) break; // even = real quote
    }
    end++;
  }

  if (end >= raw.length) return null;
  return raw.subarray(valueStart, end);
}

/**
 * Extracts an optional JSON string field as a regular JS string.
 * Used for non-sensitive fields where string is acceptable.
 */
export function extractStringField(
  raw: Buffer,
  fieldName: string,
): string | null {
  const buf = extractBufferField(raw, fieldName);
  return buf ? buf.toString("utf-8") : null;
}

/** Session data extracted from the cookie for relay auth. */
export interface RelaySession {
  readonly userId: string;
  readonly orgSchema: string;
  readonly sessionId: string;
}

export type RelayAuthResult =
  | { ok: true; session: RelaySession }
  | { ok: false; status: 401 | 403 };

/**
 * Resolves the org schema from the request Host header.
 * Same logic as the tRPC context factory and hooks.server.ts:
 * - Production: extract subdomain from Host (slug.care-y.app -> org_slug)
 * - Dev: read X-Org-Slug header (SOG-07 fallback), then fall back to Host
 *
 * The orgResolver dependency is injected so relay-utils doesn't import
 * org resolution code directly (keeps it testable with a simple mock).
 */
export type OrgResolver = (req: IncomingMessage) => string | null;

/**
 * Authenticates a relay request using the session cookie.
 * Returns the session data or null if auth fails.
 * Does NOT use tRPC context. Calls the same underlying functions.
 *
 * Org resolution is separate from session lookup because SessionData
 * does not contain orgSchema. The org is resolved from the Host header
 * (same as tRPC context factory), then a tenant-scoped session repo
 * is used to look up the session within that org's schema.
 */
export async function authenticateRelay(
  req: IncomingMessage,
  orgResolver: OrgResolver,
  createSessionRepo: (
    orgSchema: string,
  ) => SessionRepository | Promise<SessionRepository>,
): Promise<RelayAuthResult> {
  // Resolve org from Host header (same as tRPC context)
  const orgSchema = orgResolver(req);
  if (orgSchema === null) return { ok: false, status: 401 };

  // Extract session cookie from Cookie header
  const cookieHeader = req.headers.cookie ?? "";
  const sessionToken = parseCookieValue(cookieHeader, "care_y_session");
  if (sessionToken === null) return { ok: false, status: 401 };

  // Look up session in the org's tenant schema
  const sessionRepo = await createSessionRepo(orgSchema);
  const session = await sessionRepo.findByToken(sessionToken);
  if (!session) return { ok: false, status: 401 };

  // Check expiry
  if (session.expiresAt < new Date()) return { ok: false, status: 401 };

  // Check 2FA verification: session exists but 2FA not completed -> 403
  if (!session.twofaVerified) return { ok: false, status: 403 };

  return {
    ok: true,
    session: {
      userId: session.userId,
      orgSchema,
      sessionId: session.id,
    },
  };
}

/** Parses a single cookie value from a Cookie header string. */
export function parseCookieValue(header: string, name: string): string | null {
  const prefix = `${name}=`;
  const cookies = header.split(";");
  for (const cookie of cookies) {
    const trimmed = cookie.trimStart();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length).trim();
    }
  }
  return null;
}

/** Send a JSON response. */
export function sendJsonResponse(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  const json = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(json);
}

/** Send an error response. Never includes plaintext from the request. */
export function sendRelayError(
  res: ServerResponse,
  status: number,
  code: string,
): void {
  sendJsonResponse(res, status, { error: code });
}
