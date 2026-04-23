/**
 * Public HTTP handler for serving PWA icon images.
 *
 * Path: /api/branding/<orgSlug>/icon-<size>.png
 * Variants: standard and maskable
 *
 * Unauthenticated. Icons are encrypted at rest in the BlobStore and decrypted
 * on-the-fly using branding_key = BLAKE2b("care-y-branding-v1" || orgPublicKey).
 * This key is deterministically derivable from the publicly available org public
 * key, so serving does not weaken the security model (ADR-024).
 *
 * ETag (blob key) + must-revalidate ensures clients always get the current
 * icon while skipping decryption on 304 responses.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import sodium from "sodium-native";
import type { BlobStore } from "../storage/store.js";
import type { OrgService } from "../org/service.js";
import { tenantDb } from "../db/db.js";
import {
  deriveBrandingKey,
  decryptBrandingBlob,
} from "../branding/branding-crypto.js";

export interface BrandingIconHandlerDeps {
  readonly blobStore: BlobStore;
  readonly orgService: OrgService;
  readonly corsHeaders: Readonly<Record<string, string>>;
}

const CACHE_CONTROL = "public, max-age=300, must-revalidate";
const PATH_PREFIX = "/api/branding/";

type IconSize = "192" | "512" | "maskable";

function parseIconSize(filename: string): IconSize | null {
  if (filename === "icon-192.png") return "192";
  if (filename === "icon-512.png") return "512";
  if (filename === "icon-maskable.png") return "maskable";
  return null;
}

export function createBrandingIconHandler(
  deps: BrandingIconHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { blobStore, orgService, corsHeaders } = deps;

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" });
      res.end();
      return;
    }

    const rawUrl = req.url ?? "";
    const qIdx = rawUrl.indexOf("?");
    const url = qIdx === -1 ? rawUrl : rawUrl.slice(0, qIdx);
    if (!url.startsWith(PATH_PREFIX)) {
      res.writeHead(404);
      res.end();
      return;
    }

    // Parse: /api/branding/<orgSlug>/icon-<size>.png
    const pathAfterPrefix = decodeURIComponent(url.slice(PATH_PREFIX.length));
    const slashIdx = pathAfterPrefix.indexOf("/");
    if (slashIdx === -1) {
      res.writeHead(404);
      res.end();
      return;
    }

    const orgSlug = pathAfterPrefix.slice(0, slashIdx);
    const filename = pathAfterPrefix.slice(slashIdx + 1);

    const iconSize = parseIconSize(filename);
    if (iconSize === null) {
      res.writeHead(404);
      res.end();
      return;
    }

    try {
      const org = await orgService.findBySlug(orgSlug);
      if (org?.isActive !== true) {
        res.writeHead(404);
        res.end();
        return;
      }

      const tDb = tenantDb(org.schemaName);
      const config = await tDb
        .selectFrom("org_config")
        .select([
          "org_public_key",
          "icon_192_blob_key",
          "icon_512_blob_key",
          "icon_maskable_blob_key",
        ])
        .executeTakeFirst();

      if (!config) {
        res.writeHead(404);
        res.end();
        return;
      }

      const blobKey =
        iconSize === "192"
          ? config.icon_192_blob_key
          : iconSize === "512"
            ? config.icon_512_blob_key
            : config.icon_maskable_blob_key;
      const orgPublicKey = config.org_public_key;

      if (blobKey === null || orgPublicKey === null) {
        res.writeHead(404);
        res.end();
        return;
      }

      const etag = `"${blobKey}"`;
      const ifNoneMatch = req.headers["if-none-match"];
      if (ifNoneMatch === etag) {
        res.writeHead(304, { ...corsHeaders, ETag: etag });
        res.end();
        return;
      }

      const encryptedBlob = await blobStore.get(blobKey);
      if (encryptedBlob === null) {
        res.writeHead(404);
        res.end();
        return;
      }

      const key = deriveBrandingKey(orgPublicKey);
      let plaintext: Buffer | null;
      try {
        plaintext = decryptBrandingBlob(encryptedBlob, key);
      } finally {
        sodium.sodium_memzero(key);
      }

      if (plaintext === null) {
        res.writeHead(500);
        res.end();
        return;
      }

      res.writeHead(200, {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Content-Length": String(plaintext.length),
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": CACHE_CONTROL,
        ETag: etag,
      });
      res.end(plaintext);
    } catch {
      res.writeHead(500);
      res.end();
    }
  };
}
