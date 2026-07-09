/**
 * Tests for TicketDecryptCache.
 *
 * Uses a mock CryptoBridge (actual ECIES decrypt requires the crypto
 * Worker). Tests verify cache behavior: miss triggers bridge.decrypt(),
 * hit returns cached value, error handling, pending de-duplication.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { TicketDecryptCache } from "./ticket-decrypt-cache.js";
import {
  DECRYPT_ERROR_SENTINEL,
  isDecryptError,
} from "./async-decrypt-cache.js";
import { cacheRegistry } from "./cache-registry.js";

const TICKET_ID = "ticket-001";
const KEY_WRAP = {
  ephemeralPoint: "ep-base64",
  nonce: "nonce-base64",
  wrappedKey: "wk-base64",
};
const ENCRYPTED_TITLE = {
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
        ticketId: string,
        ep: string,
        nonce: string,
        wk: string,
        ct: string,
      ) => Promise<string>
    >();
  mockDecrypt.mockResolvedValue("Decrypted Title");

  const bridge = {
    decrypt: mockDecrypt,
    getState: () => "KEYED",
  } as unknown as CryptoBridge;

  return { bridge, mockDecrypt };
}

describe("TicketDecryptCache", () => {
  let cache: TicketDecryptCache;
  let mockDecrypt: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cacheRegistry.reset();
    const { bridge, mockDecrypt: md } = createMockBridge();
    mockDecrypt = md;
    cache = new TicketDecryptCache(bridge);
  });

  describe("decryptDescription", () => {
    it("returns undefined and triggers async decrypt at the description slot", () => {
      const result = cache.decryptDescription(
        TICKET_ID,
        KEY_WRAP,
        ENCRYPTED_TITLE,
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
      expect(mockDecrypt).toHaveBeenCalledWith(
        TICKET_ID,
        "description",
        `desc:${TICKET_ID}`,
        KEY_WRAP.ephemeralPoint,
        KEY_WRAP.nonce,
        KEY_WRAP.wrappedKey,
        expect.any(String),
      );
    });

    it("returns cached value after async decrypt resolves", async () => {
      cache.decryptDescription(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      await vi.waitFor(() => {
        expect(cache.has(`desc:${TICKET_ID}`)).toBe(true);
      });
      const result = cache.decryptDescription(
        TICKET_ID,
        KEY_WRAP,
        ENCRYPTED_TITLE,
      );
      expect(result).toBe("Decrypted Title");
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("returns error sentinel for null keyWrap without calling bridge", () => {
      const result = cache.decryptDescription(TICKET_ID, null, ENCRYPTED_TITLE);
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      expect(isDecryptError(result)).toBe(true);
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("caches independently of the title entry for the same ticket", async () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptDescription(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      await vi.waitFor(() => {
        expect(cache.has(TICKET_ID)).toBe(true);
        expect(cache.has(`desc:${TICKET_ID}`)).toBe(true);
      });
      expect(mockDecrypt).toHaveBeenCalledTimes(2);
    });
  });

  describe("decryptReadCursor", () => {
    const USER_ID = "user-1";
    const CIPHERTEXT = "cursor-ct-version-one-padding";
    const CACHE_KEY = `cursor:${TICKET_ID}:${CIPHERTEXT.slice(0, 24)}`;

    it("mirrors the detail call: per-user slot, ticket id as key-cache id", () => {
      const result = cache.decryptReadCursor(
        TICKET_ID,
        USER_ID,
        KEY_WRAP,
        CIPHERTEXT,
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
      expect(mockDecrypt).toHaveBeenCalledWith(
        TICKET_ID,
        `cursor:${USER_ID}`,
        TICKET_ID,
        KEY_WRAP.ephemeralPoint,
        KEY_WRAP.nonce,
        KEY_WRAP.wrappedKey,
        CIPHERTEXT,
      );
    });

    it("caches under a ciphertext-prefixed key", async () => {
      cache.decryptReadCursor(TICKET_ID, USER_ID, KEY_WRAP, CIPHERTEXT);
      await vi.waitFor(() => {
        expect(cache.has(CACHE_KEY)).toBe(true);
      });
      const result = cache.decryptReadCursor(
        TICKET_ID,
        USER_ID,
        KEY_WRAP,
        CIPHERTEXT,
      );
      expect(result).toBe("Decrypted Title");
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("re-decrypts when the cursor ciphertext changes", async () => {
      cache.decryptReadCursor(TICKET_ID, USER_ID, KEY_WRAP, CIPHERTEXT);
      await vi.waitFor(() => {
        expect(cache.has(CACHE_KEY)).toBe(true);
      });

      cache.decryptReadCursor(
        TICKET_ID,
        USER_ID,
        KEY_WRAP,
        "cursor-ct-version-two-padding",
      );
      expect(mockDecrypt).toHaveBeenCalledTimes(2);
    });

    it("returns error sentinel for null keyWrap without calling bridge", () => {
      const result = cache.decryptReadCursor(
        TICKET_ID,
        USER_ID,
        null,
        CIPHERTEXT,
      );
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      expect(isDecryptError(result)).toBe(true);
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("stores error sentinel when the blob fails AEAD (dummy row)", async () => {
      mockDecrypt.mockRejectedValueOnce(new Error("AEAD failure"));

      cache.decryptReadCursor(TICKET_ID, USER_ID, KEY_WRAP, CIPHERTEXT);
      await vi.waitFor(() => {
        expect(cache.has(CACHE_KEY)).toBe(true);
      });
      expect(isDecryptError(cache.get(CACHE_KEY))).toBe(true);
    });

    it("stays out of the follow-up prefix namespace", async () => {
      cache.decryptReadCursor(TICKET_ID, USER_ID, KEY_WRAP, CIPHERTEXT);
      await vi.waitFor(() => {
        expect(cache.has(CACHE_KEY)).toBe(true);
      });
      cache.clearFollowUps();
      expect(cache.has(CACHE_KEY)).toBe(true);
    });
  });

  describe("decryptTitle", () => {
    it("returns undefined and triggers async decrypt on cache miss", () => {
      const result = cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
      expect(mockDecrypt).toHaveBeenCalledWith(
        TICKET_ID,
        "title",
        TICKET_ID,
        KEY_WRAP.ephemeralPoint,
        KEY_WRAP.nonce,
        KEY_WRAP.wrappedKey,
        expect.any(String),
      );
    });

    it("returns cached value after async decrypt resolves", async () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);

      // Wait for the mock promise to resolve.
      await vi.waitFor(() => {
        expect(cache.has(TICKET_ID)).toBe(true);
      });

      const result = cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(result).toBe("Decrypted Title");
      // Should not call decrypt again (cache hit).
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("returns error sentinel for null keyWrap without calling bridge", () => {
      const result = cache.decryptTitle(TICKET_ID, null, ENCRYPTED_TITLE);
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      expect(isDecryptError(result)).toBe(true);
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("de-duplicates concurrent calls for the same ticket", () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("stores error sentinel on decrypt failure", async () => {
      mockDecrypt.mockRejectedValueOnce(new Error("ECIES decrypt failed"));

      const result = cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(result).toBeUndefined();

      // After failure, cache should contain the error sentinel.
      await vi.waitFor(() => {
        expect(cache.has(TICKET_ID)).toBe(true);
      });

      expect(cache.get(TICKET_ID)).toBe(DECRYPT_ERROR_SENTINEL);
      expect(isDecryptError(cache.get(TICKET_ID))).toBe(true);
    });

    it("handles string encryptedTitle (already base64)", () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, "already-base64-string");
      expect(mockDecrypt).toHaveBeenCalledWith(
        TICKET_ID,
        "title",
        TICKET_ID,
        KEY_WRAP.ephemeralPoint,
        KEY_WRAP.nonce,
        KEY_WRAP.wrappedKey,
        "already-base64-string",
      );
    });

    it("caches different tickets independently", async () => {
      mockDecrypt.mockResolvedValueOnce("Title A");
      mockDecrypt.mockResolvedValueOnce("Title B");

      cache.decryptTitle("ticket-a", KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptTitle("ticket-b", KEY_WRAP, ENCRYPTED_TITLE);

      await vi.waitFor(() => {
        expect(cache.size).toBe(2);
      });

      expect(cache.get("ticket-a")).toBe("Title A");
      expect(cache.get("ticket-b")).toBe("Title B");
    });
  });

  describe("has", () => {
    it("returns false for unseen ticket", () => {
      expect(cache.has("unknown")).toBe(false);
    });

    it("returns true after successful decrypt", async () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      await vi.waitFor(() => {
        expect(cache.has(TICKET_ID)).toBe(true);
      });
    });
  });

  describe("get", () => {
    it("returns undefined for unseen ticket", () => {
      expect(cache.get("unknown")).toBeUndefined();
    });

    it("returns cached title after decrypt", async () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      await vi.waitFor(() => {
        expect(cache.get(TICKET_ID)).toBe("Decrypted Title");
      });
    });
  });

  describe("clear", () => {
    it("empties cache and pending set", async () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      await vi.waitFor(() => {
        expect(cache.size).toBe(1);
      });
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has(TICKET_ID)).toBe(false);
    });
  });

  describe("size", () => {
    it("returns 0 for empty cache", () => {
      expect(cache.size).toBe(0);
    });
  });

  describe("cache registry", () => {
    it("registers with cacheRegistry on construction", () => {
      expect(cacheRegistry.registered).toContain("TicketDecryptCache");
    });
  });
});
