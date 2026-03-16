import { describe, it, expect, beforeEach, vi } from "vitest";
import fc from "fast-check";
import { TkCache } from "./tk-cache.js";

function createTestCache(maxEntries = 50): {
  cache: TkCache;
  memzero: ReturnType<typeof vi.fn>;
} {
  const memzero = vi.fn((buf: Uint8Array) => {
    buf.fill(0);
  });
  const cache = new TkCache({ maxEntries, memzero });
  return { cache, memzero };
}

function fakeTk(byte = 0xaa): Uint8Array {
  const buf = new Uint8Array(32);
  buf.fill(byte);
  return buf;
}

describe("TkCache", () => {
  let cache: TkCache;
  let memzero: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ({ cache, memzero } = createTestCache());
  });

  describe("get", () => {
    it("returns undefined for missing entries", () => {
      expect(cache.get("nonexistent")).toBeUndefined();
    });

    it("returns the cached buffer after set", () => {
      const tk = fakeTk(0x11);
      cache.set("ticket-1", tk);
      expect(cache.get("ticket-1")).toBe(tk);
    });

    it("promotes entry to most-recently-used on access", () => {
      // Fill cache to capacity (3 entries)
      const { cache: small, memzero: mz } = createTestCache(3);
      const tk1 = fakeTk(0x01);
      const tk2 = fakeTk(0x02);
      const tk3 = fakeTk(0x03);

      small.set("a", tk1);
      small.set("b", tk2);
      small.set("c", tk3);

      // Access "a" to promote it to MRU
      small.get("a");

      // Insert a 4th entry. "b" is now the LRU (not "a"), so "b" gets evicted.
      small.set("d", fakeTk(0x04));

      expect(small.get("a")).toBe(tk1); // still present (was promoted)
      expect(small.get("b")).toBeUndefined(); // evicted
      expect(mz).toHaveBeenCalledWith(tk2); // memzero called on evicted buffer
    });
  });

  describe("set", () => {
    it("roundtrips a buffer correctly", () => {
      const tk = fakeTk(0xbb);
      cache.set("t-1", tk);
      const retrieved = cache.get("t-1");
      expect(retrieved).toBe(tk);
      expect(retrieved).toEqual(fakeTk(0xbb));
    });

    it("overwrites an existing entry without increasing size", () => {
      cache.set("t-1", fakeTk(0x01));
      cache.set("t-1", fakeTk(0x02));
      expect(cache.size).toBe(1);
      expect(cache.get("t-1")).toEqual(fakeTk(0x02));
    });

    it("evicts least-recently-used entry when cache is full (51st set with maxEntries=50)", () => {
      // Fill cache to capacity
      const tks: Uint8Array[] = [];
      for (let i = 0; i < 50; i++) {
        const tk = fakeTk(i);
        tks.push(tk);
        cache.set(`ticket-${i}`, tk);
      }
      expect(cache.size).toBe(50);

      // Insert the 51st entry
      cache.set("ticket-50", fakeTk(0xff));
      expect(cache.size).toBe(50); // still at capacity

      // ticket-0 was LRU and should have been evicted
      expect(cache.get("ticket-0")).toBeUndefined();
      // memzero was called on the evicted buffer
      expect(memzero).toHaveBeenCalledWith(tks[0]);
      // the new entry is present
      expect(cache.get("ticket-50")).toBeDefined();
    });

    it("does not call memzero when cache is not full", () => {
      cache.set("a", fakeTk(0x01));
      cache.set("b", fakeTk(0x02));
      expect(memzero).not.toHaveBeenCalled();
    });
  });

  describe("evict", () => {
    it("removes the entry and calls memzero on its buffer", () => {
      const tk = fakeTk(0xcc);
      cache.set("t-1", tk);
      cache.evict("t-1");

      expect(cache.get("t-1")).toBeUndefined();
      expect(cache.size).toBe(0);
      expect(memzero).toHaveBeenCalledWith(tk);
    });

    it("is a no-op for missing entries (no error, no memzero call)", () => {
      cache.evict("nonexistent");
      expect(memzero).not.toHaveBeenCalled();
    });
  });

  describe("zeroAll", () => {
    it("calls memzero on every cached entry and clears the cache", () => {
      const tk1 = fakeTk(0x01);
      const tk2 = fakeTk(0x02);
      const tk3 = fakeTk(0x03);
      cache.set("a", tk1);
      cache.set("b", tk2);
      cache.set("c", tk3);

      cache.zeroAll();

      expect(cache.size).toBe(0);
      expect(memzero).toHaveBeenCalledTimes(3);
      expect(memzero).toHaveBeenCalledWith(tk1);
      expect(memzero).toHaveBeenCalledWith(tk2);
      expect(memzero).toHaveBeenCalledWith(tk3);
    });

    it("does not throw on an empty cache", () => {
      expect(() => {
        cache.zeroAll();
      }).not.toThrow();
      expect(memzero).not.toHaveBeenCalled();
    });
  });

  describe("size", () => {
    it("tracks the number of entries", () => {
      expect(cache.size).toBe(0);
      cache.set("a", fakeTk());
      expect(cache.size).toBe(1);
      cache.set("b", fakeTk());
      expect(cache.size).toBe(2);
      cache.evict("a");
      expect(cache.size).toBe(1);
    });
  });

  describe("property-based", () => {
    it("never exceeds maxEntries after arbitrary set/get/evict operations", () => {
      const maxEntries = 10;

      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.record({
                op: fc.constant("set" as const),
                key: fc.stringMatching(/^[a-z]{1,8}$/),
              }),
              fc.record({
                op: fc.constant("get" as const),
                key: fc.stringMatching(/^[a-z]{1,8}$/),
              }),
              fc.record({
                op: fc.constant("evict" as const),
                key: fc.stringMatching(/^[a-z]{1,8}$/),
              }),
            ),
            { minLength: 1, maxLength: 200 },
          ),
          (ops) => {
            const { cache: propCache } = createTestCache(maxEntries);

            for (const action of ops) {
              switch (action.op) {
                case "set":
                  propCache.set(action.key, fakeTk());
                  break;
                case "get":
                  propCache.get(action.key);
                  break;
                case "evict":
                  propCache.evict(action.key);
                  break;
              }
            }

            return propCache.size <= maxEntries;
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
