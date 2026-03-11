/**
 * Subdomain extraction from Host header values.
 *
 * Pure string utility with no runtime dependencies. Used by both the
 * server (tRPC context org resolution) and client (SvelteKit hooks).
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
