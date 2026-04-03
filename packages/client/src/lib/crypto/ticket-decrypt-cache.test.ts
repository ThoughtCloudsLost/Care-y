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
  } as unknown as CryptoBridge;

  return { bridge, mockDecrypt };
}

describe("TicketDecryptCache", () => {
  let cache: TicketDecryptCache;
  let mockDecrypt: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const { bridge, mockDecrypt: md } = createMockBridge();
    mockDecrypt = md;
    cache = new TicketDecryptCache(bridge);
  });

  describe("decryptTitle", () => {
    it("returns undefined and triggers async decrypt on cache miss", () => {
      const result = cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
      expect(mockDecrypt).toHaveBeenCalledWith(
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

    it("returns undefined for null keyWrap without calling bridge", () => {
      const result = cache.decryptTitle(TICKET_ID, null, ENCRYPTED_TITLE);
      expect(result).toBeUndefined();
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("de-duplicates concurrent calls for the same ticket", () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("handles decrypt failure gracefully (returns undefined)", async () => {
      mockDecrypt.mockRejectedValueOnce(new Error("ECIES decrypt failed"));

      const result = cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(result).toBeUndefined();

      // Wait for the rejection to settle.
      await vi.waitFor(() => {
        // After failure, pending should be cleared so a retry is possible.
        expect(cache.has(TICKET_ID)).toBe(false);
      });
    });

    it("retries after a previous failure", async () => {
      mockDecrypt.mockRejectedValueOnce(new Error("transient"));
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);

      // Wait for failure to clear pending.
      await vi.waitFor(() => {
        expect(mockDecrypt).toHaveBeenCalledOnce();
      });
      // Small delay for the finally block
      await new Promise((r) => setTimeout(r, 10));

      mockDecrypt.mockResolvedValueOnce("Retry Success");
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      expect(mockDecrypt).toHaveBeenCalledTimes(2);

      await vi.waitFor(() => {
        expect(cache.get(TICKET_ID)).toBe("Retry Success");
      });
    });

    it("handles string encryptedTitle (already base64)", () => {
      cache.decryptTitle(TICKET_ID, KEY_WRAP, "already-base64-string");
      expect(mockDecrypt).toHaveBeenCalledWith(
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
});
