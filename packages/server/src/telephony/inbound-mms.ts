/**
 * MMS attachment processor: download and validate attachments.
 *
 * Each attachment in an inbound MMS is processed independently.
 * One failure does not abort the others. Validated attachments are
 * returned with raw data Buffers for encryption with per-ticket keys.
 * Rejected attachments are recorded with a reason.
 *
 * Raw data Buffers must be zeroed after encryption (the follow-up
 * creation functions handle this).
 */

import { validateAttachment } from "./attachment-validator.js";
import { AttachmentValidationError } from "../errors.js";

export interface AcceptedAttachment {
  readonly data: Buffer;
  readonly contentType: string;
  readonly sizeBytes: number;
}

export interface AttachmentRejection {
  readonly mediaUrl: string;
  readonly reason: "size" | "content_type" | "magic_bytes" | "download_failed";
  readonly message: string;
}

export interface ProcessAttachmentsResult {
  readonly accepted: AcceptedAttachment[];
  readonly rejected: readonly AttachmentRejection[];
}

/**
 * Download and validate MMS attachments. Returns raw (unencrypted)
 * Buffers for the caller to encrypt with the appropriate ticket key.
 */
export async function processAttachments(
  mediaUrls: readonly string[],
  mediaContentTypes: readonly string[],
): Promise<ProcessAttachmentsResult> {
  const accepted: AcceptedAttachment[] = [];
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

    // 3. Validate (before returning, rawData is still plaintext)
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

    // 4. Return raw data for caller to encrypt with per-ticket key
    accepted.push({
      data: rawData,
      contentType: validation.contentType,
      sizeBytes: validation.sizeBytes,
    });
  }

  return { accepted, rejected };
}
