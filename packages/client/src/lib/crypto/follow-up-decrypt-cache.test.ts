/**
 * Tests for FollowUpDecryptCache.
 *
 * Verifies the domain-specific decryptContent() method that wraps the
 * AsyncDecryptCache base with follow-up-specific argument handling
 * (keyWrap unpacking, SerializedBuffer conversion).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { followupSlot } from "@care-y/crypto";
import { FollowUpDecryptCache } from "./follow-up-decrypt-cache.js";
import { cacheRegistry } from "./cache-registry.js";
import { DECRYPT_ERROR_SENTINEL } from "./async-decrypt-cache.js";

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
  mockDecryptAndRewrap: ReturnType<typeof vi.fn>;
} {
  const mockDecrypt =
    vi.fn<
      (
        ticketId: string,
        slot: string,
        keyCacheId: string,
        ep: string,
        nonce: string,
        wk: string,
        ct: string,
      ) => Promise<string>
    >();
  mockDecrypt.mockResolvedValue("Decrypted follow-up content");

  const mockDecryptAndRewrap =
    vi.fn<
      (
        followUpId: string,
        ticketId: string,
        ep: string,
        nonce: string,
        wk: string,
        ct: string,
      ) => Promise<string>
    >();
  mockDecryptAndRewrap.mockResolvedValue("Rewrap-decrypted content");

  return {
    bridge: {
      decrypt: mockDecrypt,
      decryptAndRewrap: mockDecryptAndRewrap,
    } as unknown as CryptoBridge,
    mockDecrypt,
    mockDecryptAndRewrap,
  };
}

const FOLLOW_UP_KEY_WRAP = {
  ephemeralPoint: "fu-ep-base64",
  nonce: "fu-nonce-base64",
  wrappedKey: "fu-wk-base64",
};
const TICKET_ID = "ticket-001";

describe("FollowUpDecryptCache", () => {
  let cache: FollowUpDecryptCache;
  let mockDecrypt: ReturnType<typeof vi.fn>;
  let mockDecryptAndRewrap: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cacheRegistry.reset();
    const {
      bridge,
      mockDecrypt: md,
      mockDecryptAndRewrap: mdr,
    } = createMockBridge();
    mockDecrypt = md;
    mockDecryptAndRewrap = mdr;
    cache = new FollowUpDecryptCache(bridge);
  });

  describe("decryptContent", () => {
    it("returns undefined and triggers bridge.decrypt() on first call", () => {
      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
      expect(mockDecrypt).toHaveBeenCalledWith(
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        FOLLOW_UP_ID,
        KEY_WRAP.ephemeralPoint,
        KEY_WRAP.nonce,
        KEY_WRAP.wrappedKey,
        expect.any(String),
      );
    });

    it("returns cached plaintext after async resolve", async () => {
      cache.decryptContent(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );

      await vi.waitFor(() => {
        expect(cache.has(FOLLOW_UP_ID)).toBe(true);
      });

      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBe("Decrypted follow-up content");
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("returns undefined for null keyWrap without calling bridge", () => {
      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        null,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("handles string encryptedContent (already base64)", () => {
      cache.decryptContent(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        "already-base64",
      );
      expect(mockDecrypt).toHaveBeenCalledWith(
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
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
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBeUndefined();

      await vi.waitFor(() => {
        expect(cache.has(FOLLOW_UP_ID)).toBe(true);
      });

      expect(cache.get(FOLLOW_UP_ID)).toBe(DECRYPT_ERROR_SENTINEL);
    });

    it("routes to decryptAndRewrap when rewrapContext is provided", () => {
      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
        { followUpKeyWrap: FOLLOW_UP_KEY_WRAP, ticketId: TICKET_ID },
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).not.toHaveBeenCalled();
      expect(mockDecryptAndRewrap).toHaveBeenCalledOnce();
      expect(mockDecryptAndRewrap).toHaveBeenCalledWith(
        FOLLOW_UP_ID,
        TICKET_ID,
        FOLLOW_UP_KEY_WRAP.ephemeralPoint,
        FOLLOW_UP_KEY_WRAP.nonce,
        FOLLOW_UP_KEY_WRAP.wrappedKey,
        expect.any(String),
      );
    });

    it("falls back to regular decrypt when no rewrapContext", () => {
      const result = cache.decryptContent(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
      );
      expect(result).toBeUndefined();
      expect(mockDecryptAndRewrap).not.toHaveBeenCalled();
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });
  });
});
