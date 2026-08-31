/**
 * Public HTTP handler for serving PWA icon images.
 *
 * Path: /api/branding/<orgSlug>/icon-<size>.png
 * Variants: standard and maskable
 *
 * Unauthenticated. Icons are stored as plain PNG bytes (ADR-094 overturns the
 * encryption rationale in ADR-024; the BlobStore storage split itself stands).
 *
 * ETag (blob key) + must-revalidate keeps clients current while allowing 304
 * responses that skip the blob read entirely.
 *
 * The handler owns HTTP concerns only; tenant reads go through the injected
 * branding service factory.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { OrgSchema } from "@care-y/shared";
import type { BlobStore } from "../storage/store.js";
import type { OrgService } from "../org/service.js";
import type {
  BrandingService,
  IconSize,
} from "../branding/branding-service.js";

export interface BrandingIconHandlerDeps {
  readonly blobStore: BlobStore;
  readonly orgService: OrgService;
  readonly corsHeaders: Readonly<Record<string, string>>;
  readonly createBrandingSvc: (
    orgSchema: OrgSchema,
  ) => Pick<BrandingService, "iconBlobKey">;
}

const CACHE_CONTROL = "public, max-age=300, must-revalidate";
const PATH_PREFIX = "/api/branding/";

function parseIconSize(filename: string): IconSize | null {
  if (filename === "icon-192.png") return "192";
  if (filename === "icon-512.png") return "512";
  if (filename === "icon-maskable.png") return "maskable";
  return null;
}

export function createBrandingIconHandler(
  deps: BrandingIconHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { blobStore, orgService, corsHeaders, createBrandingSvc } = deps;

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

      const blobKey = await createBrandingSvc(org.schemaName).iconBlobKey(
        iconSize,
      );
      if (blobKey === null) {
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

      const iconBlob = await blobStore.get(blobKey);
      if (iconBlob === null) {
        res.writeHead(404);
        res.end();
        return;
      }

      res.writeHead(200, {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Content-Length": String(iconBlob.length),
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": CACHE_CONTROL,
        ETag: etag,
      });
      res.end(iconBlob);
    } catch {
      res.writeHead(500);
      res.end();
    }
  };
}
