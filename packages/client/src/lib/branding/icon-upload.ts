/**
 * PWA icon upload pipeline shared by onboarding and admin branding flows.
 *
 * Generates three icon variants from a source image, base64-encodes the raw
 * PNG bytes, uploads via tRPC, then updates the branding cache and
 * apple-touch-icon link.
 */

import { generateIconVariants } from "$lib/branding/icon-generator.js";
import { updateBrandingCache } from "$lib/branding/index.js";
import { setAppleTouchIconHref } from "$lib/branding/icon-link.svelte.js";
import { getOrgSlug } from "$lib/utils/org-slug.js";

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

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function uploadPwaIcons(
  source: Blob,
  router: IconUploadRouter,
): Promise<IconUploadResult> {
  const variants = await generateIconVariants(source);

  let icon192 = "";
  let icon512 = "";
  let iconMaskable = "";

  for (const variant of variants) {
    const arrayBuffer = await variant.blob.arrayBuffer();
    const b64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

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
