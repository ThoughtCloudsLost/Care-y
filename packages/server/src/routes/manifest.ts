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

export interface ManifestHandlerDeps {
  readonly orgService: OrgService;
}

const BRANDING_LABEL = "care-y-branding-v1";
const DEFAULT_NAME = "CARE-Y";
const DEFAULT_THEME = "#000000";
const DEFAULT_BG = "#0C0C0C";

function deriveBrandingKey(orgPublicKey: Buffer): Buffer {
  const labelBytes = Buffer.from(BRANDING_LABEL, "utf-8");
  const input = Buffer.concat([labelBytes, orgPublicKey]);
  const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
  sodium.crypto_generichash(key, input);
  return key;
}

function decryptBlob(encrypted: Buffer, key: Buffer): Buffer | null {
  const nonceLen = sodium.crypto_secretbox_NONCEBYTES;
  const macLen = sodium.crypto_secretbox_MACBYTES;
  if (encrypted.length < nonceLen + macLen) return null;

  const nonce = encrypted.subarray(0, nonceLen);
  const ciphertext = encrypted.subarray(nonceLen);
  const plaintext = Buffer.alloc(ciphertext.length - macLen);

  const ok = sodium.crypto_secretbox_open_easy(
    plaintext,
    ciphertext,
    nonce,
    key,
  );
  return ok ? plaintext : null;
}

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
              const plaintext = decryptBlob(
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
