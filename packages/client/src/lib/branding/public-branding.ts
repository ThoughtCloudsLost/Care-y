/**
 * Public branding: fetch plain fields for pre-auth pages.
 *
 * The server returns plaintext branding fields (ADR-094). No client-side
 * decryption is needed. orgPublicKey is retained on the wire shape for
 * intake form crypto consumers (ADR-026), but this module does not use it.
 */

import { createQuery, type CreateQueryResult } from "@tanstack/svelte-query";
import { trpc } from "$lib/trpc/index.js";
import { brandingIconUrl, sanitizeOrgName } from "$lib/branding/index.js";
import { brandingKeys } from "$lib/query/keys.js";

export interface PublicBranding {
  orgName: string;
  primaryColor: string;
  accentColor: string | null;
  iconUrl: string | null;
  orgSlug: string;
  /**
   * Name clients see above messages from the org. Empty when the org has
   * set nothing, in which case the portal keeps its built-in wording.
   */
  supportLabel: string;
  /**
   * Where quick exit sends a client, or null when the org has configured
   * nothing. Validated as an absolute https URL server-side, so a page can
   * hand it straight to the shell.
   *
   * It arrives here rather than only through the portal bootstrap, which
   * needs a channel and therefore never reached intake or share links.
   */
  safeExitUrl: string | null;
}

async function fetchPublicBranding(): Promise<PublicBranding | null> {
  if (!trpc.branding) return null;

  const data = await trpc.branding.getPublicBranding.query();

  const iconUrl = data.hasIcons
    ? brandingIconUrl(data.orgSlug, "192", data.iconVersion)
    : null;

  return {
    orgName: sanitizeOrgName(data.name ?? ""),
    primaryColor: data.primaryColor ?? "#636366",
    accentColor: data.accentColor ?? null,
    iconUrl,
    orgSlug: data.orgSlug,
    // Same untrusted-text treatment as the org name: this is admin-authored
    // content rendered into the page.
    supportLabel: sanitizeOrgName(data.supportLabel ?? ""),
    safeExitUrl: data.safeExitUrl,
  };
}

export function createPublicBrandingQuery(): CreateQueryResult<PublicBranding | null> {
  return createQuery(() => ({
    queryKey: brandingKeys.public(),
    queryFn: fetchPublicBranding,
    staleTime: 5 * 60 * 1000,
    // A single no-retry attempt meant one dropped request left a client
    // page without the org's name, colors, or exit URL for the rest of
    // the session. Server injection covers the common case now, and the
    // backoff covers the case where injection had nothing cached either.
    retry: 3,
    retryDelay: (attempt: number) => Math.min(500 * 2 ** attempt, 8_000),
  }));
}
