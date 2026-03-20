/**
 * MMS attachment validator.
 *
 * Checks file size, content-type allowlist, and magic byte signatures
 * before accepting an inbound MMS attachment. Prevents content-type
 * spoofing (e.g. declaring image/jpeg but sending an executable).
 */

import { AttachmentValidationError } from "../errors.js";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

// Magic byte signatures for each allowed content type.
// offset: byte position where the signature starts.
// bytes: expected byte values at that offset.
const MAGIC_BYTES: readonly {
  contentType: string;
  offset: number;
  bytes: readonly number[];
}[] = [
  { contentType: "image/jpeg", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  {
    contentType: "image/png",
    offset: 0,
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  { contentType: "image/gif", offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  { contentType: "image/webp", offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  {
    contentType: "application/pdf",
    offset: 0,
    bytes: [0x25, 0x50, 0x44, 0x46],
  },
];

export interface AttachmentValidationResult {
  readonly valid: true;
  readonly contentType: string;
  readonly sizeBytes: number;
}

/**
 * Validates an MMS attachment buffer against size limits, the
 * content-type allowlist, and magic byte signatures.
 *
 * Throws AttachmentValidationError with a machine-readable `reason`
 * field ("size", "content_type", or "magic_bytes") on failure.
 */
export function validateAttachment(
  data: Buffer,
  declaredContentType: string,
): AttachmentValidationResult {
  // 1. Size check
  if (data.length > MAX_SIZE_BYTES) {
    throw new AttachmentValidationError(
      `Attachment size ${String(data.length)} bytes exceeds limit of ${String(MAX_SIZE_BYTES)} bytes`,
      "size",
    );
  }

  // 2. Normalize and check content-type
  const contentType = (declaredContentType.split(";")[0] ?? "")
    .trim()
    .toLowerCase();

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new AttachmentValidationError(
      `Content type "${contentType}" is not allowed`,
      "content_type",
    );
  }

  // 3. Magic bytes verification
  const entry = MAGIC_BYTES.find((m) => m.contentType === contentType);

  if (!entry) {
    // No magic bytes entry for this content type (should not happen given
    // the allowlist mirrors MAGIC_BYTES, but guard defensively).
    throw new AttachmentValidationError(
      `No magic bytes signature defined for "${contentType}"`,
      "magic_bytes",
    );
  }

  const requiredLength = entry.offset + entry.bytes.length;
  if (data.length < requiredLength) {
    throw new AttachmentValidationError(
      `Attachment too small to contain valid ${contentType} header`,
      "magic_bytes",
    );
  }

  for (let i = 0; i < entry.bytes.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    if (data[entry.offset + i] !== entry.bytes[i]) {
      throw new AttachmentValidationError(
        `Magic bytes do not match declared content type "${contentType}"`,
        "magic_bytes",
      );
    }
  }

  return {
    valid: true,
    contentType,
    sizeBytes: data.length,
  };
}
