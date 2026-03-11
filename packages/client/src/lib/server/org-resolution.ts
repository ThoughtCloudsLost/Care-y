/**
 * Org resolution utilities for SvelteKit hooks.
 *
 * Pure functions extracted from hooks.server.ts so they can be tested
 * without mocking SvelteKit internals. The Handle in hooks.server.ts
 * is thin wiring around these.
 */

export { extractSubdomain } from "@care-y/shared";

/**
 * Reads the dev-only X-Org-Slug header if present and non-empty.
 */
export function readDevSlugHeader(headers: Headers): string | null {
  const header = headers.get("x-org-slug");
  return header !== null && header.length > 0 ? header : null;
}
