/**
 * Tests for the page-side navigation guard module.
 *
 * Uses the runes-module test idiom (direct function calls, no DOM).
 * The module's $state is reset via resetNavGuard between tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  guardNavigation,
  isNavSuppressed,
  resetNavGuard,
} from "./nav-guard.svelte.js";

beforeEach(() => {
  resetNavGuard();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("nav-guard", () => {
  // -----------------------------------------------------------------
  // guardNavigation
  // -----------------------------------------------------------------

  it("navigates when not dirty", () => {
    expect(guardNavigation(false, 10000)).toBe("navigate");
    expect(isNavSuppressed()).toBe(false);
  });

  it("suppresses when dirty and no prior suppression", () => {
    expect(guardNavigation(true, 10000)).toBe("suppress");
    expect(isNavSuppressed()).toBe(true);
  });

  it("navigates on second tap within the override window", () => {
    // First tap: suppress
    guardNavigation(true, 10000);
    expect(isNavSuppressed()).toBe(true);

    // Second tap 2s later: navigate (within 4s window)
    expect(guardNavigation(true, 12000)).toBe("navigate");
    expect(isNavSuppressed()).toBe(false);
  });

  it("suppresses again after the override window expires", () => {
    // First tap: suppress at t=10000
    guardNavigation(true, 10000);

    // Tap at t=15000 (5s later, outside 4s window): suppress again
    expect(guardNavigation(true, 15000)).toBe("suppress");
    expect(isNavSuppressed()).toBe(true);
  });

  it("navigates when dirty at the boundary (exactly overrideMs)", () => {
    guardNavigation(true, 10000);
    // Exactly 4s later: still within the window
    expect(guardNavigation(true, 14000)).toBe("navigate");
  });

  it("suppresses when dirty just past the boundary", () => {
    guardNavigation(true, 10000);
    // 4001ms later: outside the window
    expect(guardNavigation(true, 14001)).toBe("suppress");
  });

  // -----------------------------------------------------------------
  // isNavSuppressed resets on navigate
  // -----------------------------------------------------------------

  it("clears suppressed flag when navigation succeeds", () => {
    guardNavigation(true, 10000);
    expect(isNavSuppressed()).toBe(true);

    // Navigate (not dirty)
    guardNavigation(false, 11000);
    expect(isNavSuppressed()).toBe(false);
  });

  // -----------------------------------------------------------------
  // Auto-clear of suppressed flag
  // -----------------------------------------------------------------

  it("auto-clears the suppressed flag after the override window", () => {
    guardNavigation(true, 10000);
    expect(isNavSuppressed()).toBe(true);

    // Advance past the 4s auto-clear timer
    vi.advanceTimersByTime(4000);
    expect(isNavSuppressed()).toBe(false);
  });

  // -----------------------------------------------------------------
  // resetNavGuard
  // -----------------------------------------------------------------

  it("resets all state", () => {
    guardNavigation(true, 10000);
    expect(isNavSuppressed()).toBe(true);

    resetNavGuard();
    expect(isNavSuppressed()).toBe(false);

    // After reset, a dirty navigation suppresses fresh
    expect(guardNavigation(true, 20000)).toBe("suppress");
  });
});
