import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { processAttachments } from "./inbound-mms.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a Buffer with valid JPEG magic bytes followed by padding. */
function makeJpegBuffer(totalSize = 128): Buffer {
  const buf = Buffer.alloc(totalSize);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  return buf;
}

/** Builds a Buffer with valid PNG magic bytes followed by padding. */
function makePngBuffer(totalSize = 128): Buffer {
  const buf = Buffer.alloc(totalSize);
  const magic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < magic.length; i++) {
    buf[i] = magic[i] as number;
  }
  return buf;
}

/** Creates a mock Response that resolves to the given buffer. */
function mockFetchResponse(data: Buffer, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    arrayBuffer: () =>
      Promise.resolve(
        data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
      ),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("processAttachments", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  // --- Happy path ---

  it("accepts a valid JPEG attachment: downloads, validates, and returns raw data", async () => {
    const jpegData = makeJpegBuffer();
    fetchSpy.mockResolvedValueOnce(mockFetchResponse(jpegData));

    const result = await processAttachments(
      ["https://api.twilio.com/media/1"],
      ["image/jpeg"],
    );

    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(0);
    expect(result.accepted[0]?.contentType).toBe("image/jpeg");
    expect(result.accepted[0]?.sizeBytes).toBe(128);
    // Raw data buffer returned for caller to encrypt
    expect(result.accepted[0]?.data).toBeInstanceOf(Buffer);
    expect(result.accepted[0]?.data.length).toBe(128);
  });

  // --- Buffer zeroing on rejection ---

  it("zeros raw attachment buffer when validation rejects it", async () => {
    // Declare image/jpeg but send PNG magic bytes to trigger magic_bytes rejection
    const pngData = makePngBuffer();
    fetchSpy.mockResolvedValueOnce(mockFetchResponse(pngData));

    const result = await processAttachments(
      ["https://api.twilio.com/media/1"],
      ["image/jpeg"],
    );

    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBe("magic_bytes");
  });

  // --- Rejection: size ---

  it("rejects oversized attachment with reason 'size'", async () => {
    const oversized = makeJpegBuffer(5 * 1024 * 1024 + 1);
    fetchSpy.mockResolvedValueOnce(mockFetchResponse(oversized));

    const result = await processAttachments(
      ["https://api.twilio.com/media/big"],
      ["image/jpeg"],
    );

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBe("size");
    expect(result.rejected[0]?.mediaUrl).toBe(
      "https://api.twilio.com/media/big",
    );
  });

  // --- Rejection: content_type ---

  it("rejects disallowed content type with reason 'content_type'", async () => {
    const exeData = Buffer.alloc(64, 0x4d);
    fetchSpy.mockResolvedValueOnce(mockFetchResponse(exeData));

    const result = await processAttachments(
      ["https://api.twilio.com/media/exe"],
      ["application/x-msdownload"],
    );

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBe("content_type");
  });

  // --- Rejection: magic_bytes ---

  it("rejects magic byte mismatch with reason 'magic_bytes'", async () => {
    const pngData = makePngBuffer();
    fetchSpy.mockResolvedValueOnce(mockFetchResponse(pngData));

    const result = await processAttachments(
      ["https://api.twilio.com/media/fake-jpeg"],
      ["image/jpeg"],
    );

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBe("magic_bytes");
  });

  // --- Rejection: download_failed (fetch rejects) ---

  it("rejects with reason 'download_failed' when fetch throws", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    const result = await processAttachments(
      ["https://api.twilio.com/media/down"],
      ["image/jpeg"],
    );

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBe("download_failed");
    expect(result.rejected[0]?.message).toBe("Network error");
  });

  // --- Rejection: download_failed (HTTP error) ---

  it("rejects with reason 'download_failed' when fetch returns HTTP 500", async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse(Buffer.alloc(0), 500));

    const result = await processAttachments(
      ["https://api.twilio.com/media/err"],
      ["image/jpeg"],
    );

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBe("download_failed");
    expect(result.rejected[0]?.message).toBe("HTTP 500");
  });

  // --- Mixed batch ---

  it("handles mixed batch: 1 valid + 1 rejected returns both independently", async () => {
    const jpegData = makeJpegBuffer();
    const badData = Buffer.alloc(64, 0x00);

    fetchSpy
      .mockResolvedValueOnce(mockFetchResponse(jpegData))
      .mockResolvedValueOnce(mockFetchResponse(badData));

    const result = await processAttachments(
      ["https://api.twilio.com/media/good", "https://api.twilio.com/media/bad"],
      ["image/jpeg", "image/jpeg"],
    );

    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
    expect(result.accepted[0]?.contentType).toBe("image/jpeg");
    expect(result.rejected[0]?.reason).toBe("magic_bytes");
  });

  // --- Empty list ---

  it("returns empty accepted and rejected for empty media list", async () => {
    const result = await processAttachments([], []);

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // --- Independence ---

  it("processes each attachment independently (rejection of one does not affect others)", async () => {
    const jpeg1 = makeJpegBuffer();
    const jpeg2 = makeJpegBuffer(256);

    fetchSpy
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(mockFetchResponse(jpeg1))
      .mockResolvedValueOnce(mockFetchResponse(jpeg2));

    const result = await processAttachments(
      [
        "https://api.twilio.com/media/1",
        "https://api.twilio.com/media/2",
        "https://api.twilio.com/media/3",
      ],
      ["image/jpeg", "image/jpeg", "image/jpeg"],
    );

    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.mediaUrl).toBe("https://api.twilio.com/media/1");

    expect(result.accepted).toHaveLength(2);
    expect(result.accepted[0]?.sizeBytes).toBe(128);
    expect(result.accepted[1]?.sizeBytes).toBe(256);
  });
});
