/**
 * Public HTTP handler for serving form asset images.
 *
 * Path: /api/forms/<orgSlug>/<blobId>
 *
 * Unauthenticated. Form asset blobs are encrypted at rest under the
 * branding key = BLAKE2b("care-y-branding-v1" || orgPublicKey), the same
 * derivation as PWA icons (ADR-024). The handler decrypts on-the-fly and
 * serves the image with Content-Type from the stored metadata row.
 *
 * Only blobs stored under the "form-asset/" prefix are served. The prefix
 * check is enforced by the service layer (resolveFormAsset).
 *
 * Content-Type is restricted to image/png, image/jpeg, image/webp.
 *
 * ETag (blob key hash) + must-revalidate matches the branding-icons
 * caching posture.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import sodium from "sodium-native";
import type { BlobStore } from "../storage/store.js";
import type { OrgService } from "../org/service.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { OrgSchema } from "@care-y/shared";
import {
  deriveBrandingKey,
  decryptBrandingBlob,
} from "../branding/branding-crypto.js";
import {
  resolveFormAsset,
  type FormAssetMeta,
} from "../portal/form-asset-service.js";

export interface FormAssetHandlerDeps {
  readonly blobStore: BlobStore;
  readonly orgService: OrgService;
  readonly corsHeaders: Readonly<Record<string, string>>;
  readonly createTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>;
}

const CACHE_CONTROL = "public, max-age=300, must-revalidate";
const PATH_PREFIX = "/api/forms/";

export function createFormAssetHandler(
  deps: FormAssetHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { blobStore, orgService, corsHeaders, createTenantDb } = deps;

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

    // Parse: /api/forms/<orgSlug>/<blobId>
    const pathAfterPrefix = decodeURIComponent(url.slice(PATH_PREFIX.length));
    const slashIdx = pathAfterPrefix.indexOf("/");
    if (slashIdx === -1) {
      res.writeHead(404);
      res.end();
      return;
    }

    const orgSlug = pathAfterPrefix.slice(0, slashIdx);
    const blobId = pathAfterPrefix.slice(slashIdx + 1);

    // blobId must be a non-empty string with no path traversal
    if (blobId.length === 0 || blobId.includes("/") || blobId.includes("..")) {
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

      const tDb = createTenantDb(org.schemaName);
      const asset: FormAssetMeta | null = await resolveFormAsset(tDb, blobId);

      if (!asset) {
        res.writeHead(404);
        res.end();
        return;
      }

      const etag = `"${asset.blobKey}"`;
      const ifNoneMatch = req.headers["if-none-match"];
      if (ifNoneMatch === etag) {
        res.writeHead(304, { ...corsHeaders, ETag: etag });
        res.end();
        return;
      }

      const encryptedBlob = await blobStore.get(asset.blobKey);
      if (encryptedBlob === null) {
        res.writeHead(404);
        res.end();
        return;
      }

      const key = deriveBrandingKey(asset.orgPublicKey);
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
        "Content-Type": asset.contentType,
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
