/**
 * Public branding: fetch + client-side decrypt for pre-auth pages.
 *
 * The server returns the org public key and encrypted branding blob (both
 * standard base64). The client derives the branding key via BLAKE2b and
 * decrypts locally. This is the B1 two-tier "client-side blob" pattern,
 * reusable for the client portal and intake form.
 */

import { createQuery } from "@tanstack/svelte-query";
import { decryptClientBranding, type Ciphertext } from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
import { brandingIconUrl, sanitizeOrgName } from "$lib/branding/index.js";
import { brandingKeys } from "$lib/query/keys.js";

export interface PublicBranding {
  orgName: string;
  primaryColor: string;
  accentColor: string | null;
  iconUrl: string | null;
  orgSlug: string;
}

interface ClientBrandingPayload {
  name?: string;
  primaryColor?: string;
  accentColor?: string;
}

async function fetchPublicBranding(): Promise<PublicBranding | null> {
  if (!trpc.branding) return null;

  const data = await trpc.branding.getPublicBranding.query();

  if (data.orgPublicKey === null || data.clientEncryptedBranding === null) {
    return null;
  }

  const orgPubKey = base64ToUint8Array(data.orgPublicKey);
  const blob = base64ToUint8Array(data.clientEncryptedBranding);

  /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Ciphertext is a branded Uint8Array; blob bytes are client-produced XChaCha20-Poly1305 AEAD ciphertext (ADR-053) */
  const plaintext = decryptClientBranding(blob as Ciphertext, orgPubKey);
  /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

  const parsed: unknown = JSON.parse(new TextDecoder().decode(plaintext));
  if (typeof parsed !== "object" || parsed === null) return null;
  const payload = parsed as ClientBrandingPayload;

  const iconUrl = data.hasIcons
    ? brandingIconUrl(data.orgSlug, "192", data.iconVersion)
    : null;

  return {
    orgName: sanitizeOrgName(payload.name ?? ""),
    primaryColor: payload.primaryColor ?? "#636366",
    accentColor: payload.accentColor ?? null,
    iconUrl,
    orgSlug: data.orgSlug,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- TanStack Query createQuery return type is deeply generic
export function createPublicBrandingQuery() {
  return createQuery(() => ({
    queryKey: brandingKeys.public(),
    queryFn: fetchPublicBranding,
    staleTime: 5 * 60 * 1000,
    retry: false,
  }));
}
