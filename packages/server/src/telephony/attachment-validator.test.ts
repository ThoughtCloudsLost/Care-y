import { describe, it, expect } from "vitest";

import { validateAttachment } from "./attachment-validator.js";
import { AttachmentValidationError } from "../errors.js";

/**
 * Helper: creates a buffer with given magic bytes at the specified offset,
 * padded to `totalLength`.
 */
function makeBuffer(
  magicBytes: number[],
  offset: number,
  totalLength: number,
): Buffer {
  const buf = Buffer.alloc(totalLength);
  for (let i = 0; i < magicBytes.length; i++) {
    buf[offset + i] = magicBytes[i]!;
  }
  return buf;
}

// Magic byte constants for each format
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const GIF_MAGIC = [0x47, 0x49, 0x46, 0x38];
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46];
// WebP: RIFF at offset 0 (4 bytes), then file size (4 bytes), then "WEBP" at offset 8
const RIFF_HEADER = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP_MARK = [0x57, 0x45, 0x42, 0x50]; // "WEBP"

function makeWebpBuffer(totalLength: number): Buffer {
  const buf = Buffer.alloc(totalLength);
  for (let i = 0; i < RIFF_HEADER.length; i++) {
    buf[i] = RIFF_HEADER[i]!;
  }
  // bytes 4-7: file size (arbitrary, just padding)
  for (let i = 0; i < WEBP_MARK.length; i++) {
    buf[8 + i] = WEBP_MARK[i]!;
  }
  return buf;
}

const FIVE_MB = 5 * 1024 * 1024;

describe("validateAttachment", () => {
  describe("valid files", () => {
    it("accepts a valid JPEG buffer with image/jpeg content type", () => {
      const buf = makeBuffer(JPEG_MAGIC, 0, 100);
      const result = validateAttachment(buf, "image/jpeg");
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe("image/jpeg");
      expect(result.sizeBytes).toBe(100);
    });

    it("accepts a valid PNG buffer with image/png content type", () => {
      const buf = makeBuffer(PNG_MAGIC, 0, 100);
      const result = validateAttachment(buf, "image/png");
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe("image/png");
      expect(result.sizeBytes).toBe(100);
    });

    it("accepts a valid GIF buffer with image/gif content type", () => {
      const buf = makeBuffer(GIF_MAGIC, 0, 100);
      const result = validateAttachment(buf, "image/gif");
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe("image/gif");
    });

    it("accepts a valid WebP buffer with image/webp content type", () => {
      const buf = makeWebpBuffer(100);
      const result = validateAttachment(buf, "image/webp");
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe("image/webp");
    });

    it("accepts a valid PDF buffer with application/pdf content type", () => {
      const buf = makeBuffer(PDF_MAGIC, 0, 100);
      const result = validateAttachment(buf, "application/pdf");
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe("application/pdf");
    });

    it("accepts a file exactly at the 5 MB limit", () => {
      const buf = makeBuffer(JPEG_MAGIC, 0, FIVE_MB);
      const result = validateAttachment(buf, "image/jpeg");
      expect(result.valid).toBe(true);
      expect(result.sizeBytes).toBe(FIVE_MB);
    });

    it("normalizes content type with charset suffix", () => {
      const buf = makeBuffer(JPEG_MAGIC, 0, 100);
      const result = validateAttachment(buf, "image/jpeg; charset=utf-8");
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe("image/jpeg");
    });
  });

  describe("size validation", () => {
    it("rejects an oversized file (5 MB + 1 byte) with reason 'size'", () => {
      const buf = Buffer.alloc(FIVE_MB + 1);
      try {
        validateAttachment(buf, "image/jpeg");
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AttachmentValidationError);
        const ave = err as AttachmentValidationError;
        expect(ave.reason).toBe("size");
      }
    });
  });

  describe("content type validation", () => {
    it("rejects disallowed content type 'text/html' with reason 'content_type'", () => {
      const buf = Buffer.alloc(100);
      try {
        validateAttachment(buf, "text/html");
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AttachmentValidationError);
        const ave = err as AttachmentValidationError;
        expect(ave.reason).toBe("content_type");
      }
    });
  });

  describe("magic bytes validation", () => {
    it("rejects JPEG declared type when buffer has PNG magic bytes", () => {
      const buf = makeBuffer(PNG_MAGIC, 0, 100);
      try {
        validateAttachment(buf, "image/jpeg");
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AttachmentValidationError);
        const ave = err as AttachmentValidationError;
        expect(ave.reason).toBe("magic_bytes");
      }
    });

    it("rejects an empty buffer with reason 'magic_bytes'", () => {
      const buf = Buffer.alloc(0);
      try {
        validateAttachment(buf, "image/jpeg");
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AttachmentValidationError);
        const ave = err as AttachmentValidationError;
        expect(ave.reason).toBe("magic_bytes");
      }
    });
  });
});
