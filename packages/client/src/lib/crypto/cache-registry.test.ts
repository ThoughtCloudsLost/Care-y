/**
 * Tests for CacheRegistry.
 *
 * The cacheRegistry singleton manages all caches holding decrypted
 * content. Tests verify createMap registration, clearAll behavior,
 * duplicate detection, and the register() escape hatch.
 */

import { describe, it, expect, vi } from "vitest";
import { cacheRegistry } from "./cache-registry.js";

// The registry is a module-level singleton. clearAll() wipes map contents
// but does not unregister names. Tests use unique names per test to avoid
// cross-test interference.
let testCounter = 0;
function uniqueName(base: string): string {
  return `${base}-${++testCounter}`;
}

describe("CacheRegistry", () => {
  describe("createMap", () => {
    it("returns a SvelteMap and registers it by name", () => {
      const name = uniqueName("test-map");
      const map = cacheRegistry.createMap<string, string>(name);

      // SvelteMap has a .set() method (duck-type check).
      expect(typeof map.set).toBe("function");
      expect(cacheRegistry.registered).toContain(name);
    });

    it("returned map is reactive (supports get/set/has/clear)", () => {
      const name = uniqueName("reactive-map");
      const map = cacheRegistry.createMap<string, number>(name);

      map.set("a", 1);
      expect(map.get("a")).toBe(1);
      expect(map.has("a")).toBe(true);
      expect(map.size).toBe(1);

      map.clear();
      expect(map.size).toBe(0);
    });
  });

  describe("register", () => {
    it("accepts a custom clearable object", () => {
      const name = uniqueName("custom-clearable");
      const clearFn = vi.fn();
      cacheRegistry.register(name, { clear: clearFn });

      expect(cacheRegistry.registered).toContain(name);

      cacheRegistry.clearAll();
      expect(clearFn).toHaveBeenCalledOnce();
    });
  });

  describe("clearAll", () => {
    it("clears all registered maps", () => {
      const nameA = uniqueName("clear-a");
      const nameB = uniqueName("clear-b");
      const mapA = cacheRegistry.createMap<string, string>(nameA);
      const mapB = cacheRegistry.createMap<string, string>(nameB);

      mapA.set("key", "value");
      mapB.set("key", "value");
      expect(mapA.size).toBe(1);
      expect(mapB.size).toBe(1);

      cacheRegistry.clearAll();

      expect(mapA.size).toBe(0);
      expect(mapB.size).toBe(0);
    });

    it("calls clear() on custom-registered clearables", () => {
      const name = uniqueName("custom-clear");
      const clearFn = vi.fn();
      cacheRegistry.register(name, { clear: clearFn });

      cacheRegistry.clearAll();

      expect(clearFn).toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("clears cache contents and removes all registrations", () => {
      const nameA = uniqueName("reset-a");
      const nameB = uniqueName("reset-b");
      const mapA = cacheRegistry.createMap<string, string>(nameA);
      const mapB = cacheRegistry.createMap<string, string>(nameB);

      mapA.set("key", "value");
      mapB.set("key", "value");

      const sizeBefore = cacheRegistry.size;
      expect(sizeBefore).toBeGreaterThanOrEqual(2);

      cacheRegistry.reset();

      expect(mapA.size).toBe(0);
      expect(mapB.size).toBe(0);
      expect(cacheRegistry.size).toBe(0);
      expect(cacheRegistry.registered).toEqual([]);
    });

    it("allows fresh registration after reset without duplicate warnings", () => {
      const name = uniqueName("reset-reuse");
      cacheRegistry.createMap(name);

      cacheRegistry.reset();

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());
      cacheRegistry.createMap(name);
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("duplicate registration", () => {
    it("logs a warning in dev mode", () => {
      const name = uniqueName("dup");
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());

      cacheRegistry.createMap(name);
      cacheRegistry.createMap(name);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("duplicate registration"),
      );

      warnSpy.mockRestore();
    });
  });

  describe("registered", () => {
    it("returns an array of registered cache names", () => {
      const name = uniqueName("list-check");
      cacheRegistry.createMap(name);

      const names = cacheRegistry.registered;
      expect(Array.isArray(names)).toBe(true);
      expect(names).toContain(name);
    });
  });

  describe("size", () => {
    it("reflects the number of registered caches", () => {
      const before = cacheRegistry.size;
      const name = uniqueName("size-check");
      cacheRegistry.createMap(name);
      expect(cacheRegistry.size).toBe(before + 1);
    });
  });
});
