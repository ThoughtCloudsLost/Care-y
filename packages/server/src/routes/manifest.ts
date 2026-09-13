/**
 * Dynamic PWA manifest handler.
 *
 * Path: /manifest.webmanifest
 *
 * Unauthenticated. Reads the org's plaintext name and primary color through
 * the branding service to populate the manifest name and theme_color, and
 * falls back to defaults when branding is not configured.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { OrgSchema } from "@care-y/shared";
import type { OrgService } from "../org/service.js";
import type { BrandingService } from "../branding/branding-service.js";
import { extractOrgSlug } from "../org/slug-resolver.js";

export interface ManifestHandlerDeps {
  readonly orgService: OrgService;
  readonly createBrandingSvc: (
    orgSchema: OrgSchema,
  ) => Pick<BrandingService, "getPublicBranding">;
}

const DEFAULT_NAME = "CARE-Y";
const DEFAULT_THEME = "#000000";
const DEFAULT_BG = "#0C0C0C";

export function createManifestHandler(
  deps: ManifestHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { orgService, createBrandingSvc } = deps;

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" });
      res.end();
      return;
    }

    let name = DEFAULT_NAME;
    let themeColor = DEFAULT_THEME;
    let orgSlug: string | null = null;
    let hasIcons = false;
    let iconVersion: string | null = null;

    try {
      const slug = extractOrgSlug(req);
      if (slug !== null) {
        const org = await orgService.findBySlug(slug);
        if (org?.isActive === true) {
          orgSlug = slug;
          const branding = await createBrandingSvc(
            org.schemaName,
          ).getPublicBranding();

          if (branding.name !== null && branding.name.length > 0) {
            name = branding.name;
          }
          if (
            branding.primaryColor !== null &&
            branding.primaryColor.length > 0
          ) {
            themeColor = branding.primaryColor;
          }

          hasIcons = branding.hasIcons;
          iconVersion = branding.iconVersion;
        }
      }
    } catch {
      // Fall through to defaults
    }

    function vUrl(slug: string, size: string): string {
      const base = `/api/branding/${slug}/icon-${size}.png`;
      if (iconVersion !== null) {
        const v: string = iconVersion;
        return `${base}?v=${v}`;
      }
      return base;
    }

    const slug = orgSlug;
    const icons =
      slug !== null && hasIcons
        ? [
            {
              src: vUrl(slug, "192"),
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: vUrl(slug, "512"),
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: vUrl(slug, "maskable"),
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ]
        : [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          ];

    const manifest = {
      name,
      short_name: name,
      display: "standalone",
      background_color: DEFAULT_BG,
      theme_color: themeColor,
      icons,
    };

    res.writeHead(200, {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache",
    });
    res.end(JSON.stringify(manifest));
  };
}
