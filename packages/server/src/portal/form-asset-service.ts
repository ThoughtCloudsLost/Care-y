/**
 * Form asset service.
 *
 * Handles storage metadata for form asset blobs (images embedded in
 * rich-text fields and banners). The form_assets table stores the
 * mapping from a short blob ID to the full BlobStore key and the
 * declared content type.
 *
 * Upload business logic (size validation, content-type enforcement)
 * lives here. The route stays thin.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { OrgSchema, FormAssetId } from "@care-y/shared";
import {
  KB_ATTACHMENT_MAX_BYTES,
  FORM_ASSET_CONTENT_TYPES,
  formAssetIdSchema,
  type BlobKey,
} from "@care-y/shared";
import { ValidationError, AttachmentValidationError } from "../errors.js";

/** Content types accepted for form asset images. */
const ALLOWED_CONTENT_TYPES: ReadonlySet<string> = new Set<string>(
  FORM_ASSET_CONTENT_TYPES,
);

/** The blob key category segment for form assets. */
const FORM_ASSET_CATEGORY = "form-asset" as const;

// ---------------------------------------------------------------------------
// Public resolve (unauthenticated serving path)
// ---------------------------------------------------------------------------

export interface FormAssetMeta {
  readonly blobKey: BlobKey;
  readonly contentType: string;
  readonly orgPublicKey: Buffer;
}

/**
 * Resolves form asset metadata for the serving handler. Returns null
 * when the asset is not found, the blob key is outside the form-asset
 * namespace, or the content type is not in the allowlist.
 */
export async function resolveFormAsset(
  tDb: Kysely<TenantDatabase>,
  blobId: string,
): Promise<FormAssetMeta | null> {
  const parsed = formAssetIdSchema.safeParse(blobId);
  if (!parsed.success) return null;

  const config = await tDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  if (!config?.org_public_key) return null;

  const asset = await tDb
    .selectFrom("form_assets")
    .select(["blob_key", "content_type"])
    .where("blob_id", "=", parsed.data)
    .executeTakeFirst();

  if (!asset) return null;

  const blobKey = asset.blob_key;

  // Enforce form-asset/ category in the blob key.
  // Keys are <orgSchema>/<category>/<uuid>; the category is the second segment.
  const parts = blobKey.split("/");
  if (parts.length !== 3 || parts[1] !== FORM_ASSET_CATEGORY) return null;

  // Validate stored content type against the allowlist
  if (!ALLOWED_CONTENT_TYPES.has(asset.content_type)) return null;

  return {
    blobKey,
    contentType: asset.content_type,
    orgPublicKey: config.org_public_key,
  };
}

// ---------------------------------------------------------------------------
// Upload (admin mutation path)
// ---------------------------------------------------------------------------

export interface UploadFormAssetResult {
  readonly blobKey: BlobKey;
  readonly blobId: FormAssetId;
}

/**
 * Validates and stores a form asset blob. Returns the blob key and
 * the short blob ID used in serving URLs.
 *
 * The blob is already encrypted client-side under the branding key.
 * This function validates size and content-type allowlist, then stores
 * in BlobStore under the form-asset category. Magic byte checks are
 * not possible on encrypted ciphertext.
 */
export async function uploadFormAsset(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  orgSchema: OrgSchema,
  blob: Buffer,
  declaredSize: number,
  contentType: string,
): Promise<UploadFormAssetResult> {
  // Server-side size validation (client limit is easily bypassed)
  if (blob.byteLength > KB_ATTACHMENT_MAX_BYTES) {
    throw new ValidationError(
      `Form asset exceeds ${String(KB_ATTACHMENT_MAX_BYTES)} byte limit`,
    );
  }

  // Declared size must match actual blob size
  if (declaredSize !== blob.byteLength) {
    throw new ValidationError(
      `Declared size ${String(declaredSize)} does not match actual blob size ${String(blob.byteLength)}`,
    );
  }

  // Content type allowlist
  const normalizedType = (contentType.split(";")[0] ?? "").trim().toLowerCase();
  if (!ALLOWED_CONTENT_TYPES.has(normalizedType)) {
    throw new AttachmentValidationError(
      `Content type "${normalizedType}" is not allowed. Accepted: ${[...ALLOWED_CONTENT_TYPES].join(", ")}`,
      "content_type",
    );
  }

  // The blob is encrypted ciphertext, so magic byte checks cannot run on it.
  // Content-type spoofing is caught at the serving path: the handler derives
  // the branding key and decrypts, so a mismatched type produces garbage
  // (not a security issue, just a broken image). The content type stored in
  // form_assets is the declared type from the upload.

  // Store the encrypted blob
  const blobKey = await blobStore.put(orgSchema, FORM_ASSET_CATEGORY, blob);

  // Extract the UUID portion from the blob key (last segment)
  const rawBlobId = blobKey.split("/").pop();
  if (rawBlobId === undefined || rawBlobId.length === 0) {
    throw new ValidationError("BlobStore returned a key without an ID segment");
  }
  const blobId = formAssetIdSchema.parse(rawBlobId);

  // Record the metadata so the serving handler can resolve blobId -> blobKey
  await tDb
    .insertInto("form_assets")
    .values({
      blob_id: blobId,
      blob_key: blobKey,
      content_type: normalizedType,
    })
    .execute();

  return { blobKey, blobId };
}
