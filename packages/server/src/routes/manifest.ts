/**
 * Dynamic PWA manifest handler.
 *
 * Path: /manifest.webmanifest
 *
 * Unauthenticated. Decrypts the client branding blob (same branding_key
 * derivation as icon serving) to populate name and theme_color. Falls back
 * to defaults when branding is not configured.
 *
 * The branding_key is deterministically derivable from the org public key
 * (which is publicly available), so this does not weaken the security model.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import sodium from "sodium-native";
import type { OrgService } from "../org/service.js";
import { tenantDb } from "../db/db.js";
import { extractOrgSlug } from "../org/slug-resolver.js";
import {
  deriveBrandingKey,
  decryptBrandingBlob,
} from "../branding/branding-crypto.js";

export interface ManifestHandlerDeps {
  readonly orgService: OrgService;
}

const DEFAULT_NAME = "CARE-Y";
const DEFAULT_THEME = "#000000";
const DEFAULT_BG = "#0C0C0C";

interface BrandingPayload {
  name?: string;
  primaryColor?: string;
}

export function createManifestHandler(
  deps: ManifestHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { orgService } = deps;

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
          const tDb = tenantDb(org.schemaName);
          const config = await tDb
            .selectFrom("org_config")
            .select([
              "org_public_key",
              "client_encrypted_branding",
              "icon_192_blob_key",
            ])
            .executeTakeFirst();

          if (config?.org_public_key && config.client_encrypted_branding) {
            const key = deriveBrandingKey(config.org_public_key);
            try {
              const plaintext = decryptBrandingBlob(
                config.client_encrypted_branding,
                key,
              );
              if (plaintext !== null) {
                const parsed: unknown = JSON.parse(plaintext.toString("utf-8"));
                if (typeof parsed === "object" && parsed !== null) {
                  const p = parsed as BrandingPayload;
                  if (typeof p.name === "string" && p.name.length > 0)
                    name = p.name;
                  if (
                    typeof p.primaryColor === "string" &&
                    p.primaryColor.length > 0
                  )
                    themeColor = p.primaryColor;
                }
              }
            } finally {
              sodium.sodium_memzero(key);
            }
          }

          hasIcons =
            config?.icon_192_blob_key !== null &&
            config?.icon_192_blob_key !== undefined;
          if (
            hasIcons &&
            config?.icon_192_blob_key !== null &&
            config?.icon_192_blob_key !== undefined
          ) {
            iconVersion = config.icon_192_blob_key.slice(0, 8);
          }
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
