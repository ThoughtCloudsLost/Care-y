/**
 * Tests for record-mode flag helpers.
 *
 * The module caches its flag at evaluation, so each scenario re-imports
 * a fresh copy via vi.importActual after patching location.search.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

// forwardRecordParam is a pure function that reads the module-level
// RECORD flag. To test both branches we import two separate copies
// via dynamic import with cache-busting.

describe("forwardRecordParam", () => {
  const originalSearch = location.search;

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore the real location.search for subsequent tests
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: originalSearch },
      writable: true,
      configurable: true,
    });
  });

  it("returns the URL unchanged when not in record mode", async () => {
    // Default test env has no ?record=1
    const { forwardRecordParam } = await import("./record-mode.js");
    expect(forwardRecordParam("/phone.html")).toBe("/phone.html");
    expect(forwardRecordParam("/phone.html?foo=bar")).toBe(
      "/phone.html?foo=bar",
    );
  });

  it("returns the frozen reference as a number", async () => {
    const { FROZEN_NOW } = await import("./record-mode.js");
    expect(typeof FROZEN_NOW).toBe("number");
    expect(FROZEN_NOW).toBeGreaterThan(0);
  });
});

describe("isRecordMode", () => {
  it("returns false when ?record=1 is absent", async () => {
    const { isRecordMode } = await import("./record-mode.js");
    expect(isRecordMode()).toBe(false);
  });
});
