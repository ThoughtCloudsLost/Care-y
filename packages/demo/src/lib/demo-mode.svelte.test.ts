/**
 * Tests for the demo mode module.
 *
 * Pure helpers (parseModeParam, writeModeParam) are tested directly.
 * The reactive store (createDemoMode) uses rune-backed state, so it
 * is tested through its public accessor/mutator surface.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseModeParam,
  writeModeParam,
  createDemoMode,
} from "./demo-mode.svelte.js";

// -----------------------------------------------------------------------
// parseModeParam
// -----------------------------------------------------------------------

describe("parseModeParam", () => {
  it("returns 'read' for ?mode=read", () => {
    expect(parseModeParam("?mode=read")).toBe("read");
  });

  it("returns 'walk' for ?mode=walk", () => {
    expect(parseModeParam("?mode=walk")).toBe("walk");
  });

  it("returns null for absent param", () => {
    expect(parseModeParam("")).toBeNull();
    expect(parseModeParam("?other=1")).toBeNull();
  });

  it("returns null for invalid values", () => {
    expect(parseModeParam("?mode=run")).toBeNull();
    expect(parseModeParam("?mode=")).toBeNull();
    expect(parseModeParam("?mode=READ")).toBeNull();
  });

  it("preserves other params while reading", () => {
    expect(parseModeParam("?record=1&mode=walk")).toBe("walk");
  });
});

// -----------------------------------------------------------------------
// writeModeParam
// -----------------------------------------------------------------------

describe("writeModeParam", () => {
  it("adds mode param to empty search", () => {
    const result = writeModeParam("", "read");
    expect(result).toContain("mode=read");
    expect(result.startsWith("?")).toBe(true);
  });

  it("overwrites existing mode param", () => {
    const result = writeModeParam("?mode=read", "walk");
    expect(result).toContain("mode=walk");
    expect(result).not.toContain("mode=read");
  });

  it("preserves other params", () => {
    const result = writeModeParam("?record=1&foo=bar", "walk");
    expect(result).toContain("record=1");
    expect(result).toContain("foo=bar");
    expect(result).toContain("mode=walk");
  });
});

// -----------------------------------------------------------------------
// createDemoMode
// -----------------------------------------------------------------------

describe("createDemoMode", () => {
  const originalSearch = location.search;
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    replaceStateSpy = vi.spyOn(history, "replaceState");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: originalSearch },
      writable: true,
      configurable: true,
    });
  });

  it("defaults to walk when isNarrow returns false", () => {
    const store = createDemoMode(() => false);
    expect(store.mode).toBe("walk");
    expect(store.override).toBeNull();
  });

  it("defaults to read when isNarrow returns true", () => {
    const store = createDemoMode(() => true);
    expect(store.mode).toBe("read");
    expect(store.override).toBeNull();
  });

  it("reads override from location.search at creation", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: "?mode=walk" },
      writable: true,
      configurable: true,
    });
    const store = createDemoMode(() => true);
    expect(store.mode).toBe("walk");
    expect(store.override).toBe("walk");
  });

  it("toggle flips from default walk to read", () => {
    const store = createDemoMode(() => false);
    expect(store.mode).toBe("walk");
    store.toggle();
    expect(store.mode).toBe("read");
    expect(store.override).toBe("read");
  });

  it("toggle flips from default read to walk", () => {
    const store = createDemoMode(() => true);
    expect(store.mode).toBe("read");
    store.toggle();
    expect(store.mode).toBe("walk");
    expect(store.override).toBe("walk");
  });

  it("toggle writes URL param via replaceState", () => {
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        search: "",
        pathname: "/demo",
        hash: "#login/overview",
      },
      writable: true,
      configurable: true,
    });
    const store = createDemoMode(() => false);
    store.toggle();
    expect(replaceStateSpy).toHaveBeenCalledOnce();
    const url = replaceStateSpy.mock.calls[0]?.[2] as string;
    expect(url).toContain("mode=read");
    expect(url).toContain("/demo");
    expect(url).toContain("#login/overview");
  });

  it("override is not clobbered by viewport default change", () => {
    let narrow = false;
    const store = createDemoMode(() => narrow);
    // Default: walk (not narrow)
    expect(store.mode).toBe("walk");
    // User toggles to read
    store.toggle();
    expect(store.mode).toBe("read");
    expect(store.override).toBe("read");
    // Viewport crosses the breakpoint (becomes narrow)
    narrow = true;
    // The override still holds: mode is read because of the override,
    // not because of the viewport change
    expect(store.mode).toBe("read");
    expect(store.override).toBe("read");
  });

  it("ignores invalid mode param in URL", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: "?mode=invalid" },
      writable: true,
      configurable: true,
    });
    const store = createDemoMode(() => false);
    expect(store.mode).toBe("walk");
    expect(store.override).toBeNull();
  });

  it("double toggle returns to the opposite of the original default", () => {
    const store = createDemoMode(() => false);
    store.toggle(); // walk -> read
    store.toggle(); // read -> walk
    expect(store.mode).toBe("walk");
    expect(store.override).toBe("walk");
  });

  it("set('read') overrides the walk default (toolbar close button)", () => {
    const store = createDemoMode(() => false);
    expect(store.mode).toBe("walk");
    store.set("read");
    expect(store.mode).toBe("read");
    expect(store.override).toBe("read");
  });

  it("set is idempotent for the current mode", () => {
    const store = createDemoMode(() => true);
    store.set("read");
    expect(store.mode).toBe("read");
    expect(store.override).toBe("read");
  });

  it("set writes URL param via replaceState", () => {
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        search: "",
        pathname: "/demo",
        hash: "#login/overview",
      },
      writable: true,
      configurable: true,
    });
    const store = createDemoMode(() => false);
    store.set("read");
    expect(replaceStateSpy).toHaveBeenCalledOnce();
    const url = replaceStateSpy.mock.calls[0]?.[2] as string;
    expect(url).toContain("mode=read");
    expect(url).toContain("/demo");
    expect(url).toContain("#login/overview");
  });
});
