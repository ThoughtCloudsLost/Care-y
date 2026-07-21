/**
 * PWA icon upload pipeline shared by onboarding and admin branding flows.
 *
 * Generates three icon variants from a source image, encrypts each with
 * the public-key-derived branding key, uploads via tRPC, then updates
 * the branding cache and apple-touch-icon link.
 */

import { encryptClientBranding } from "@care-y/crypto";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import { OrgKeyNotLoadedError } from "$lib/crypto/org-key.js";
import { generateIconVariants } from "$lib/branding/icon-generator.js";
import { updateBrandingCache } from "$lib/branding/index.js";
import { setAppleTouchIconHref } from "$lib/branding/icon-link.svelte.js";
import { getOrgSlug } from "$lib/utils/org-slug.js";
import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";

export interface IconUploadRouter {
  readonly uploadIcons: {
    mutate(input: {
      icon192: string;
      icon512: string;
      iconMaskable: string;
    }): Promise<unknown>;
  };
}

export interface IconUploadResult {
  readonly version: string;
}

export async function uploadPwaIcons(
  source: Blob,
  orgKeyManager: OrgKeyManager,
  router: IconUploadRouter,
): Promise<IconUploadResult> {
  const orgPubKey = orgKeyManager.getPublicKey();
  if (!orgPubKey) {
    throw new OrgKeyNotLoadedError();
  }

  const variants = await generateIconVariants(source);

  let icon192 = "";
  let icon512 = "";
  let iconMaskable = "";

  for (const variant of variants) {
    const arrayBuffer = await variant.blob.arrayBuffer();
    const encrypted = encryptClientBranding(
      new Uint8Array(arrayBuffer),
      orgPubKey,
    );
    const b64 = uint8ArrayToBase64(encrypted);

    if (variant.purpose === "maskable") {
      iconMaskable = b64;
    } else if (variant.size === 192) {
      icon192 = b64;
    } else {
      icon512 = b64;
    }
  }

  await router.uploadIcons.mutate({ icon192, icon512, iconMaskable });

  const version = String(Date.now());
  void updateBrandingCache({ hasIcons: true, iconVersion: version }).catch(
    (err: unknown) => {
      console.warn("branding cache update failed", err);
    },
  );
  const slug = getOrgSlug();
  if (slug !== null) {
    setAppleTouchIconHref(`/api/branding/${slug}/icon-192.png?v=${version}`);
  }

  return { version };
}
