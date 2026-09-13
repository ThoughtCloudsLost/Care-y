/**
 * Authenticating a portal file download.
 *
 * The blob route serves volunteers through a session cookie and a role
 * check. A client has neither, so this resolves the other two credentials
 * the portal already issues: the channel secret and auth token a Secure
 * Link holds, or the session cookie an account holds.
 *
 * Credentials arrive in headers, never in the query string. A GET with a
 * credential in its URL writes that credential into every access log and
 * proxy cache between the browser and the disk.
 *
 * Resolving a channel is not authorization on its own. It says which
 * channel is asking; whether that channel may read a given file is
 * `resolveChannelBlobKey`'s question (ADR-089).
 */

import type { IncomingMessage } from "node:http";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { channelSecretSchema } from "@care-y/shared";
import { resolveAuthedChannel } from "./channel-service.js";
import type { PortalChannelRow } from "./channel-service.js";
import { resolveAccountSession } from "./account-service.js";

/** Session cookie an Encrypted Account holds. */
export const CLIENT_SESSION_COOKIE = "care_y_client_session";

/**
 * Parses a raw Cookie header string into a Map of name-value pairs.
 *
 * Deliberately not `auth/cookies.ts`: that module imports the volunteer
 * session code, and pulling it in here would tie the client surface to it.
 */
export function parseClientCookies(
  header: string | null | undefined,
): Map<string, string> {
  const cookies = new Map<string, string>();
  if (header == null || header === "") return cookies;

  for (const pair of header.split(";")) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;

    const name = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    if (name) {
      cookies.set(name, value);
    }
  }

  return cookies;
}

/**
 * Reads a header that node may hand back as an array.
 *
 * Takes the raw value rather than a name, so nothing indexes the headers
 * object with a variable. The two call sites name their header literally.
 */
function headerValue(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/**
 * Resolve the portal channel making this request, or null.
 *
 * Null covers every failure the same way: no credential, a malformed one,
 * a revoked channel, an expired session. The caller answers all of them
 * with one 401, because telling them apart tells an attacker which
 * channel ids exist.
 */
export async function resolvePortalBlobChannel(
  db: Kysely<TenantDatabase>,
  req: IncomingMessage,
): Promise<PortalChannelRow | null> {
  // Literal header names rather than constants, so nothing reads the
  // headers object with a variable. x-portal-channel carries the hex
  // channel secret from a Secure Link fragment; x-portal-auth carries the
  // base64 auth token derived from the same fragment.
  const rawChannel = headerValue(req.headers["x-portal-channel"]);
  const rawAuth = headerValue(req.headers["x-portal-auth"]);

  if (
    rawChannel !== undefined &&
    rawChannel !== "" &&
    rawAuth !== undefined &&
    rawAuth !== ""
  ) {
    const parsed = channelSecretSchema.safeParse(rawChannel);
    if (!parsed.success) return null;
    return resolveAuthedChannel(
      db,
      parsed.data,
      Buffer.from(rawAuth, "base64"),
    );
  }

  const sessionToken = parseClientCookies(req.headers.cookie).get(
    CLIENT_SESSION_COOKIE,
  );
  if (sessionToken === undefined || sessionToken === "") return null;

  const session = await resolveAccountSession(db, sessionToken);
  return session?.channel ?? null;
}
