/**
 * Tests for TicketDecryptCache.
 *
 * Uses a mock CryptoBridge (actual ECIES decrypt requires the crypto
 * Worker). Tests verify cache behavior: miss triggers bridge.decrypt(),
 * hit returns cached value, error handling, pending de-duplication.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { CryptoWorkerError } from "$lib/workers/crypto-bridge-errors.js";
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
const ENCRYPTED_TITLE = "SGVsbG8";

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
        TICKET_ID,
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

  describe("worker key-cache id", () => {
    it("passes the ticket id for every slot of one ticket, so the Worker unwraps the ticket key once", () => {
      // The Worker caches the unwrapped ticket key under the key-cache id
      // (third bridge.decrypt argument). If any slot passed its prefixed
      // cache key instead, that slot would trigger its own ECIES unwrap.
      cache.decryptTitle(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptDescription(TICKET_ID, KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptFollowUp(TICKET_ID, "fu-001", KEY_WRAP, ENCRYPTED_TITLE);
      cache.decryptReadCursor(TICKET_ID, "user-1", KEY_WRAP, "cursor-ct");

      expect(mockDecrypt).toHaveBeenCalledTimes(4);
      for (const call of mockDecrypt.mock.calls) {
        expect(call[2]).toBe(TICKET_ID);
      }
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

    it("misses and decrypts anew after the ticket's cursor prefix is evicted", async () => {
      const otherTicketId = "ticket-002";
      const secondCiphertext = "cursor-ct-version-two-padding";
      const v2Key = `cursor:${TICKET_ID}:${secondCiphertext.slice(0, 24)}`;
      const otherKey = `cursor:${otherTicketId}:${CIPHERTEXT.slice(0, 24)}`;

      cache.decryptReadCursor(TICKET_ID, USER_ID, KEY_WRAP, CIPHERTEXT);
      cache.decryptReadCursor(TICKET_ID, USER_ID, KEY_WRAP, secondCiphertext);
      cache.decryptReadCursor(otherTicketId, USER_ID, KEY_WRAP, CIPHERTEXT);
      await vi.waitFor(() => {
        expect(cache.has(CACHE_KEY)).toBe(true);
        expect(cache.has(v2Key)).toBe(true);
        expect(cache.has(otherKey)).toBe(true);
      });

      // The flush success path evicts every version for the one ticket.
      cache.deleteByPrefix(`cursor:${TICKET_ID}:`);

      expect(cache.has(CACHE_KEY)).toBe(false);
      expect(cache.has(v2Key)).toBe(false);
      expect(cache.has(otherKey)).toBe(true);

      mockDecrypt.mockClear();
      const result = cache.decryptReadCursor(
        TICKET_ID,
        USER_ID,
        KEY_WRAP,
        CIPHERTEXT,
      );
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
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

  describe("decryptTitle via intakeWrap", () => {
    const INTAKE_WRAP = "sealed-tk-blob-fake-b64";
    const TITLE_CT = "ct-title-fake-b64";

    function createIntakeBridge(): {
      bridge: CryptoBridge;
      intakeDecrypt: ReturnType<typeof vi.fn>;
      mockUnwrapIntakeTk: ReturnType<typeof vi.fn>;
    } {
      const intakeDecrypt = vi.fn<() => Promise<string>>();
      intakeDecrypt.mockResolvedValue("Intake Title Decrypted");

      const mockUnwrapIntakeTk = vi.fn<() => Promise<void>>();
      mockUnwrapIntakeTk.mockResolvedValue(undefined);

      const bridge = {
        decrypt: intakeDecrypt,
        unwrapIntakeTk: mockUnwrapIntakeTk,
        getState: () => "KEYED",
      } as unknown as CryptoBridge;

      return { bridge, intakeDecrypt, mockUnwrapIntakeTk };
    }

    it("returns undefined on first call and triggers unseal + decrypt", () => {
      cacheRegistry.reset();
      const { bridge } = createIntakeBridge();
      const c = new TicketDecryptCache(bridge);

      const result = c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);
      expect(result).toBeUndefined();
    });

    it("chains unwrapIntakeTk then bridge.decrypt for the title slot", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk, intakeDecrypt } =
        createIntakeBridge();
      const c = new TicketDecryptCache(bridge);

      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);

      await vi.waitFor(() => {
        expect(c.has(TICKET_ID)).toBe(true);
      });

      expect(mockUnwrapIntakeTk).toHaveBeenCalledOnce();
      expect(mockUnwrapIntakeTk).toHaveBeenCalledWith(TICKET_ID, INTAKE_WRAP);
      expect(intakeDecrypt).toHaveBeenCalledOnce();
      // Worker receives empty key-wrap strings (tk already cached)
      expect(intakeDecrypt).toHaveBeenCalledWith(
        TICKET_ID,
        "title",
        TICKET_ID,
        "",
        "",
        "",
        TITLE_CT,
      );
      expect(c.get(TICKET_ID)).toBe("Intake Title Decrypted");
    });

    it("de-duplicates concurrent intake wrap requests for the same ticket", () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeBridge();
      const c = new TicketDecryptCache(bridge);

      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);
      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);
      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);

      // Only one unseal chain fires; repeats see intakePending and return undefined
      expect(mockUnwrapIntakeTk).toHaveBeenCalledOnce();
    });

    it("returns cached value on subsequent calls after resolve", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeBridge();
      const c = new TicketDecryptCache(bridge);

      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);
      await vi.waitFor(() => {
        expect(c.has(TICKET_ID)).toBe(true);
      });

      mockUnwrapIntakeTk.mockClear();
      const result = c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);
      expect(result).toBe("Intake Title Decrypted");
      expect(mockUnwrapIntakeTk).not.toHaveBeenCalled();
    });

    it("sets error sentinel when unseal fails", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeBridge();
      mockUnwrapIntakeTk.mockRejectedValue(new Error("unseal failed"));
      const c = new TicketDecryptCache(bridge);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // silenced
      });

      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);

      await vi.waitFor(() => {
        expect(c.has(TICKET_ID)).toBe(true);
      });
      expect(isDecryptError(c.get(TICKET_ID))).toBe(true);
      warnSpy.mockRestore();
    });

    it("sets error sentinel when decrypt after unseal fails", async () => {
      cacheRegistry.reset();
      const { bridge, intakeDecrypt } = createIntakeBridge();
      intakeDecrypt.mockRejectedValue(new Error("AEAD failure"));
      const c = new TicketDecryptCache(bridge);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // silenced
      });

      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);

      await vi.waitFor(() => {
        expect(c.has(TICKET_ID)).toBe(true);
      });
      expect(isDecryptError(c.get(TICKET_ID))).toBe(true);
      warnSpy.mockRestore();
    });

    it("silently swallows BRIDGE_DESTROYED without sentinel or warning", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeBridge();
      mockUnwrapIntakeTk.mockRejectedValue(
        new CryptoWorkerError("Bridge is destroyed", "BRIDGE_DESTROYED"),
      );
      const c = new TicketDecryptCache(bridge);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // silenced
      });

      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);

      // Let the rejection settle
      await new Promise((r) => setTimeout(r, 10));
      expect(c.has(TICKET_ID)).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("returns undefined without firing when bridge is DESTROYED", () => {
      cacheRegistry.reset();
      const mockUnwrapIntakeTk = vi.fn();
      const destroyedBridge = {
        decrypt: vi.fn(),
        unwrapIntakeTk: mockUnwrapIntakeTk,
        getState: () => "DESTROYED",
      } as unknown as CryptoBridge;
      const c = new TicketDecryptCache(destroyedBridge);

      const result = c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);
      expect(result).toBeUndefined();
      expect(mockUnwrapIntakeTk).not.toHaveBeenCalled();
    });

    it("treats null intakeWrap with null keyWrap as missing key material", async () => {
      const result = cache.decryptTitle(TICKET_ID, null, TITLE_CT, null);
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("treats undefined intakeWrap with null keyWrap as missing key material", () => {
      const result = cache.decryptTitle(TICKET_ID, null, TITLE_CT, undefined);
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("treats empty-string intakeWrap with null keyWrap as missing key material", () => {
      const result = cache.decryptTitle(TICKET_ID, null, TITLE_CT, "");
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("cleans up intakePending after failure so a retry can fire", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeBridge();
      const c = new TicketDecryptCache(bridge);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // silenced
      });

      mockUnwrapIntakeTk.mockRejectedValueOnce(new Error("transient"));
      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);

      await vi.waitFor(() => {
        expect(c.has(TICKET_ID)).toBe(true);
      });

      // Reset: clear error sentinel so the next call re-triggers
      c.clear();
      mockUnwrapIntakeTk.mockResolvedValueOnce(undefined);
      c.decryptTitle(TICKET_ID, null, TITLE_CT, INTAKE_WRAP);

      // Second attempt should fire another unwrap
      expect(mockUnwrapIntakeTk).toHaveBeenCalledTimes(2);
      warnSpy.mockRestore();
    });
  });

  describe("decryptDescription via intakeWrap", () => {
    const INTAKE_WRAP = "sealed-tk-blob-fake-b64";
    const DESC_CT = "ct-desc-fake-b64";

    function createIntakeDescBridge(): {
      bridge: CryptoBridge;
      intakeDecrypt: ReturnType<typeof vi.fn>;
      mockUnwrapIntakeTk: ReturnType<typeof vi.fn>;
    } {
      const intakeDecrypt = vi.fn<() => Promise<string>>();
      intakeDecrypt.mockResolvedValue("Intake Desc Decrypted");

      const mockUnwrapIntakeTk = vi.fn<() => Promise<void>>();
      mockUnwrapIntakeTk.mockResolvedValue(undefined);

      const bridge = {
        decrypt: intakeDecrypt,
        unwrapIntakeTk: mockUnwrapIntakeTk,
        getState: () => "KEYED",
      } as unknown as CryptoBridge;

      return { bridge, intakeDecrypt, mockUnwrapIntakeTk };
    }

    it("chains unwrapIntakeTk then decrypt for the description slot", async () => {
      cacheRegistry.reset();
      const {
        bridge,
        mockUnwrapIntakeTk,
        intakeDecrypt: md,
      } = createIntakeDescBridge();
      const c = new TicketDecryptCache(bridge);

      c.decryptDescription(TICKET_ID, null, DESC_CT, INTAKE_WRAP);

      await vi.waitFor(() => {
        expect(c.has(`desc:${TICKET_ID}`)).toBe(true);
      });

      expect(mockUnwrapIntakeTk).toHaveBeenCalledOnce();
      expect(md).toHaveBeenCalledWith(
        TICKET_ID,
        "description",
        TICKET_ID,
        "",
        "",
        "",
        DESC_CT,
      );
      expect(c.get(`desc:${TICKET_ID}`)).toBe("Intake Desc Decrypted");
    });

    it("de-duplicates concurrent intake wrap requests for the description", () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeDescBridge();
      const c = new TicketDecryptCache(bridge);

      c.decryptDescription(TICKET_ID, null, DESC_CT, INTAKE_WRAP);
      c.decryptDescription(TICKET_ID, null, DESC_CT, INTAKE_WRAP);
      expect(mockUnwrapIntakeTk).toHaveBeenCalledOnce();
    });

    it("returns cached value after intake desc resolve", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeDescBridge();
      const c = new TicketDecryptCache(bridge);

      c.decryptDescription(TICKET_ID, null, DESC_CT, INTAKE_WRAP);
      await vi.waitFor(() => {
        expect(c.has(`desc:${TICKET_ID}`)).toBe(true);
      });

      mockUnwrapIntakeTk.mockClear();
      const result = c.decryptDescription(
        TICKET_ID,
        null,
        DESC_CT,
        INTAKE_WRAP,
      );
      expect(result).toBe("Intake Desc Decrypted");
      expect(mockUnwrapIntakeTk).not.toHaveBeenCalled();
    });

    it("sets error sentinel when intake desc unseal fails", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeDescBridge();
      mockUnwrapIntakeTk.mockRejectedValue(new Error("unseal desc failed"));
      const c = new TicketDecryptCache(bridge);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // silenced
      });

      c.decryptDescription(TICKET_ID, null, DESC_CT, INTAKE_WRAP);

      await vi.waitFor(() => {
        expect(c.has(`desc:${TICKET_ID}`)).toBe(true);
      });
      expect(isDecryptError(c.get(`desc:${TICKET_ID}`))).toBe(true);
      warnSpy.mockRestore();
    });

    it("silently swallows BRIDGE_DESTROYED for intake desc path", async () => {
      cacheRegistry.reset();
      const { bridge, mockUnwrapIntakeTk } = createIntakeDescBridge();
      mockUnwrapIntakeTk.mockRejectedValue(
        new CryptoWorkerError("Bridge is destroyed", "BRIDGE_DESTROYED"),
      );
      const c = new TicketDecryptCache(bridge);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // silenced
      });

      c.decryptDescription(TICKET_ID, null, DESC_CT, INTAKE_WRAP);

      await new Promise((r) => setTimeout(r, 10));
      expect(c.has(`desc:${TICKET_ID}`)).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("returns undefined when bridge is DESTROYED for intake desc", () => {
      cacheRegistry.reset();
      const destroyedBridge = {
        decrypt: vi.fn(),
        unwrapIntakeTk: vi.fn(),
        getState: () => "DESTROYED",
      } as unknown as CryptoBridge;
      const c = new TicketDecryptCache(destroyedBridge);

      const result = c.decryptDescription(
        TICKET_ID,
        null,
        DESC_CT,
        INTAKE_WRAP,
      );
      expect(result).toBeUndefined();
    });

    it("treats null intakeWrap on description as missing key material", () => {
      const result = cache.decryptDescription(TICKET_ID, null, DESC_CT, null);
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
    });

    it("treats empty-string intakeWrap on description as missing key material", () => {
      const result = cache.decryptDescription(TICKET_ID, null, DESC_CT, "");
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
    });
  });

  describe("decryptTitle null keyWrap error sentinel via microtask", () => {
    it("defers setError to avoid state_unsafe_mutation in render", async () => {
      const result = cache.decryptTitle(TICKET_ID, null, ENCRYPTED_TITLE);
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      // Before microtask: the sentinel was returned but the has() may not
      // yet reflect the cache write. After flushing microtasks it must.
      await new Promise((r) => setTimeout(r, 0));
      expect(cache.has(TICKET_ID)).toBe(true);
      expect(isDecryptError(cache.get(TICKET_ID))).toBe(true);
    });

    it("does not double-write the sentinel on repeated calls", async () => {
      cache.decryptTitle(TICKET_ID, null, ENCRYPTED_TITLE);
      cache.decryptTitle(TICKET_ID, null, ENCRYPTED_TITLE);
      await new Promise((r) => setTimeout(r, 0));
      // Only one sentinel entry
      expect(cache.size).toBe(1);
    });
  });

  describe("decryptDescription null keyWrap error sentinel via microtask", () => {
    it("defers error sentinel write for description too", async () => {
      const result = cache.decryptDescription(TICKET_ID, null, "ct-desc");
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      await new Promise((r) => setTimeout(r, 0));
      expect(cache.has(`desc:${TICKET_ID}`)).toBe(true);
      expect(isDecryptError(cache.get(`desc:${TICKET_ID}`))).toBe(true);
    });
  });

  describe("decryptReadCursor null keyWrap error sentinel via microtask", () => {
    it("defers error sentinel write for read cursor", async () => {
      const ct = "cursor-ct-fake-padding-24ch";
      const result = cache.decryptReadCursor(TICKET_ID, "user-1", null, ct);
      expect(result).toBe(DECRYPT_ERROR_SENTINEL);
      const ck = `cursor:${TICKET_ID}:${ct.slice(0, 24)}`;
      await new Promise((r) => setTimeout(r, 0));
      expect(cache.has(ck)).toBe(true);
      expect(isDecryptError(cache.get(ck))).toBe(true);
    });
  });
});
