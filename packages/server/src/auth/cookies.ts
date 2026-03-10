/**
 * Cookie utilities for session management.
 *
 * No external `cookie` package. Parsing and building are simple enough
 * to implement directly, and keeping dependencies minimal reduces
 * supply-chain risk for an auth-critical path.
 */

import { SESSION_COOKIE_NAME } from "./service.js";

/**
 * Parses a raw `Cookie` header string into a Map of name-value pairs.
 * Handles missing/empty headers, values containing `=`, and whitespace.
 */
export function parseCookies(
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
 * Builds a Set-Cookie header value for the session cookie.
 *
 * Attributes: HttpOnly (no JS access), SameSite=Strict (CSRF defense),
 * Path=/ (available on all routes). `Secure` is added only when isSecure
 * is true (production behind TLS).
 */
export function buildSessionCookie(
  token: string,
  maxAgeSeconds: number,
  isSecure: boolean,
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    `Max-Age=${String(maxAgeSeconds)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (isSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/** Builds a Set-Cookie header that clears the session cookie immediately. */
export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`;
}
