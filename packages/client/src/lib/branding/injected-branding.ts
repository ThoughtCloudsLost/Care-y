/**
 * Readers for the org identity the server substituted into the document.
 *
 * The values ride attributes on the html element rather than a load
 * function, because the app runs with `ssr = false` and no client device
 * may hold a branding cache. Reading them costs no request, so a client
 * page can name the org on the first frame instead of waiting for the
 * branding query, and can still reach the org's configured exit URL when
 * that query fails outright.
 *
 * Both values are public: the branding blob's key derives from the org
 * public key, which is served on every unauthenticated page.
 */

import { browser } from "$app/environment";

function readDocumentAttribute(name: string): string | null {
  if (!browser) return null;
  const value = document.documentElement.getAttribute(name);
  return value !== null && value !== "" ? value : null;
}

/** The org's display name, or null when the server injected nothing. */
export function readInjectedOrgName(): string | null {
  return readDocumentAttribute("data-org-name");
}

/**
 * The org's configured quick exit URL, or null when unset.
 *
 * Validated as an absolute https URL server-side before injection, since
 * it becomes the argument to `location.replace()`.
 */
export function readInjectedSafeExitUrl(): string | null {
  return readDocumentAttribute("data-safe-exit-url");
}
