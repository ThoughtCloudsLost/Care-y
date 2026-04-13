/**
 * Tests for FollowUpDecryptCache.
 *
 * Verifies the domain-specific decryptContent() method that wraps the
 * AsyncDecryptCache base with follow-up-specific argument handling
 * (keyWrap unpacking, SerializedBuffer conversion).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { FollowUpDecryptCache } from "./follow-up-decrypt-cache.js";

const FOLLOW_UP_ID = "fu-001";
const KEY_WRAP = {
  ephemeralPoint: "ep-base64",
  nonce: "nonce-base64",
  wrappedKey: "wk-base64",
};
const ENCRYPTED_CONTENT = {
  type: "Buffer" as const,
  data: [72, 101, 108, 108, 111],
};

function createMockBridge(): {
  bridge: CryptoBridge;
  mockDecrypt: ReturnType<typeof vi.fn>;
} {
  const mockDecrypt =
    vi.fn<
      (
        id: string,
        ep: string,
        nonce: string,
        wk: string,
        ct: string,
      ) => Promise<string>
    >();
  mockDecrypt.mockResolvedValue("Decrypted follow-up content");

  return {
    bridge: { decrypt: mockDecrypt } as unknown as CryptoBridge,
    mockDecrypt,
  };
}

describe("FollowUpDecryptCache", () => {
  let cache: FollowUpDecryptCache;
  let mockDecrypt: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const { bridge, mockDecrypt: md } = createMockBridge();
    mockDecrypt = md;
    cache = new FollowUpDecryptCache(bridge);
  });

  describe("decryptContent", () => {
    it("returns undefined and triggers bridge.decrypt() on first call", () => {
      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
      expect(mockDecrypt).toHaveBeenCalledWith(
        FOLLOW_UP_ID,
        KEY_WRAP.ephemeralPoint,
        KEY_WRAP.nonce,
        KEY_WRAP.wrappedKey,
        expect.any(String),
      );
    });

    it("returns cached plaintext after async resolve", async () => {
      cache.decryptContent(FOLLOW_UP_ID, KEY_WRAP, ENCRYPTED_CONTENT);

      await vi.waitFor(() => {
        expect(cache.has(FOLLOW_UP_ID)).toBe(true);
      });

      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBe("Decrypted follow-up content");
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("returns undefined for null keyWrap without calling bridge", () => {
      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        null,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("handles string encryptedContent (already base64)", () => {
      cache.decryptContent(FOLLOW_UP_ID, KEY_WRAP, "already-base64");
      expect(mockDecrypt).toHaveBeenCalledWith(
        FOLLOW_UP_ID,
        KEY_WRAP.ephemeralPoint,
        KEY_WRAP.nonce,
        KEY_WRAP.wrappedKey,
        "already-base64",
      );
    });

    it("handles decrypt failure gracefully", async () => {
      mockDecrypt.mockRejectedValueOnce(new Error("ECIES failed"));

      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBeUndefined();

      await vi.waitFor(() => {
        expect(cache.has(FOLLOW_UP_ID)).toBe(false);
      });
    });
  });
});
