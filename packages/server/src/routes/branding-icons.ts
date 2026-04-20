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
 * Aggressive caching minimizes repeated decryption overhead.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import sodium from "sodium-native";
import type { BlobStore } from "../storage/store.js";
import type { OrgService } from "../org/service.js";
import { tenantDb } from "../db/db.js";

export interface BrandingIconHandlerDeps {
  readonly blobStore: BlobStore;
  readonly orgService: OrgService;
  readonly corsHeaders: Readonly<Record<string, string>>;
}

const CACHE_CONTROL = "public, max-age=604800, immutable";
const PATH_PREFIX = "/api/branding/";
const BRANDING_LABEL = "care-y-branding-v1";

type IconSize = "192" | "512" | "maskable";

const ICON_COLUMN_MAP: Readonly<
  Record<
    IconSize,
    "icon_192_blob_key" | "icon_512_blob_key" | "icon_maskable_blob_key"
  >
> = {
  "192": "icon_192_blob_key",
  "512": "icon_512_blob_key",
  maskable: "icon_maskable_blob_key",
};

function parseIconSize(filename: string): IconSize | null {
  if (filename === "icon-192.png") return "192";
  if (filename === "icon-512.png") return "512";
  if (filename === "icon-maskable.png") return "maskable";
  return null;
}

function deriveBrandingKey(orgPublicKey: Buffer): Buffer {
  const labelBytes = Buffer.from(BRANDING_LABEL, "utf-8");
  const input = Buffer.concat([labelBytes, orgPublicKey]);
  const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
  sodium.crypto_generichash(key, input);
  return key;
}

function decryptIconBlob(encryptedBlob: Buffer, key: Buffer): Buffer | null {
  const nonceLen = sodium.crypto_secretbox_NONCEBYTES;
  const macLen = sodium.crypto_secretbox_MACBYTES;

  if (encryptedBlob.length < nonceLen + macLen) return null;

  const nonce = encryptedBlob.subarray(0, nonceLen);
  const ciphertext = encryptedBlob.subarray(nonceLen);
  const plaintext = Buffer.alloc(ciphertext.length - macLen);

  const ok = sodium.crypto_secretbox_open_easy(
    plaintext,
    ciphertext,
    nonce,
    key,
  );
  if (!ok) return null;

  return plaintext;
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

    const url = req.url ?? "";
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

      const encryptedBlob = await blobStore.get(blobKey);
      if (encryptedBlob === null) {
        res.writeHead(404);
        res.end();
        return;
      }

      const key = deriveBrandingKey(orgPublicKey);
      let plaintext: Buffer | null;
      try {
        plaintext = decryptIconBlob(encryptedBlob, key);
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
      });
      res.end(plaintext);
    } catch {
      res.writeHead(500);
      res.end();
    }
  };
}
