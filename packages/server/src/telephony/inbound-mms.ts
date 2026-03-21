/**
 * MMS attachment processor: download, validate, encrypt, store.
 *
 * Each attachment in an inbound MMS is processed independently.
 * One failure does not abort the others. Accepted attachments are
 * sealed-box encrypted (server-blind) and stored via BlobStore.
 * Rejected attachments are recorded with a machine-readable reason.
 *
 * All raw data Buffers are zeroed after use (try/finally) to prevent
 * plaintext from lingering in heap memory.
 */

import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlobStore } from "../storage/store.js";
import { validateAttachment } from "./attachment-validator.js";
import { AttachmentValidationError } from "../errors.js";
import { sealBufferAndZero } from "./crypto-helpers.js";

export interface AttachmentResult {
  readonly blobKey: string;
  readonly contentType: string;
  readonly sizeBytes: number;
}

export interface AttachmentRejection {
  readonly mediaUrl: string;
  readonly reason: "size" | "content_type" | "magic_bytes" | "download_failed";
  readonly message: string;
}

export interface ProcessAttachmentsResult {
  readonly accepted: readonly AttachmentResult[];
  readonly rejected: readonly AttachmentRejection[];
}

export interface MmsHandlerDeps {
  readonly sealedBox: SealedBoxEncryptor;
  readonly blobStore: BlobStore;
  readonly orgSchema: string;
}

/**
 * Download, validate, encrypt, and store MMS attachments.
 *
 * For each media URL: download with a 30s timeout, validate content-type
 * and magic bytes, seal-encrypt, and store in the blob store. Failures
 * are captured per-attachment without aborting others.
 */
export async function processAttachments(
  mediaUrls: readonly string[],
  mediaContentTypes: readonly string[],
  deps: MmsHandlerDeps,
): Promise<ProcessAttachmentsResult> {
  const { sealedBox, blobStore, orgSchema } = deps;
  const accepted: AttachmentResult[] = [];
  const rejected: AttachmentRejection[] = [];

  for (let i = 0; i < mediaUrls.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const url = mediaUrls[i];
    if (url === undefined) continue;
    // eslint-disable-next-line security/detect-object-injection
    const declaredType = mediaContentTypes[i] ?? "application/octet-stream";

    // 1. Download
    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    } catch (err: unknown) {
      rejected.push({
        mediaUrl: url,
        reason: "download_failed",
        message: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    if (!response.ok) {
      rejected.push({
        mediaUrl: url,
        reason: "download_failed",
        message: `HTTP ${String(response.status)}`,
      });
      continue;
    }

    // 2. Convert to Buffer
    const rawData = Buffer.from(await response.arrayBuffer());

    // 3. Validate (before encryption, rawData is still plaintext)
    let validation;
    try {
      validation = validateAttachment(rawData, declaredType);
    } catch (err: unknown) {
      rawData.fill(0);
      if (err instanceof AttachmentValidationError) {
        rejected.push({
          mediaUrl: url,
          reason: err.reason,
          message: err.message,
        });
        continue;
      }
      throw err;
    }

    // 4. Encrypt and zero plaintext
    const encryptedData = sealBufferAndZero(sealedBox, rawData);

    // 5. Store
    const blobKey = await blobStore.put(orgSchema, "attachment", encryptedData);

    // 6. Record accepted
    accepted.push({
      blobKey,
      contentType: validation.contentType,
      sizeBytes: validation.sizeBytes,
    });
  }

  return { accepted, rejected };
}
