/**
 * Org resolution utilities for SvelteKit hooks.
 *
 * Pure functions extracted from hooks.server.ts so they can be tested
 * without mocking SvelteKit internals. The Handle in hooks.server.ts
 * is thin wiring around these.
 */

/**
 * Extracts the first subdomain from a Host header value.
 * Returns null if the host has fewer than 3 dot-separated parts
 * (i.e. no subdomain in a domain.tld format).
 *
 * Examples:
 *   "testorg.care-y.app"     -> "testorg"
 *   "testorg.care-y.app:443" -> "testorg"
 *   "care-y.app"              -> null
 *   "localhost:5173"           -> null
 */
export function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0] ?? "";
  if (hostname === "") return null;

  const parts = hostname.split(".");
  if (parts.length < 3) return null;

  const subdomain = parts[0] ?? "";
  return subdomain.length > 0 ? subdomain : null;
}

/**
 * Reads the dev-only X-Org-Slug header if present and non-empty.
 */
export function readDevSlugHeader(headers: Headers): string | null {
  const header = headers.get("x-org-slug");
  return header !== null && header.length > 0 ? header : null;
}
