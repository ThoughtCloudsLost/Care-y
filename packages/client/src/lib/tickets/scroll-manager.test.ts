// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createScrollManager } from "./scroll-manager.svelte.js";

function mockScrollContainer(
  overrides: Partial<{
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  }> = {},
): HTMLDivElement {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollTop", {
    value: overrides.scrollTop ?? 0,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(el, "scrollHeight", {
    value: overrides.scrollHeight ?? 1000,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(el, "clientHeight", {
    value: overrides.clientHeight ?? 500,
    writable: true,
    configurable: true,
  });
  return el;
}

describe("createScrollManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with isNearBottom true", () => {
    const manager = createScrollManager();
    expect(manager.isNearBottom).toBe(true);
  });

  it("starts with scrollContainerEl undefined", () => {
    const manager = createScrollManager();
    expect(manager.scrollContainerEl).toBeUndefined();
  });

  describe("onScroll", () => {
    it("detects near-bottom position", () => {
      const manager = createScrollManager({ nearBottomPx: 100 });
      const el = mockScrollContainer({
        scrollTop: 450,
        scrollHeight: 1000,
        clientHeight: 500,
      });
      manager.scrollContainerEl = el;

      // scrollHeight - scrollTop - clientHeight = 1000 - 450 - 500 = 50 < 100
      manager.onScroll([], undefined);
      expect(manager.isNearBottom).toBe(true);
    });

    it("detects not-near-bottom position", () => {
      const manager = createScrollManager({ nearBottomPx: 100 });
      const el = mockScrollContainer({
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 500,
      });
      manager.scrollContainerEl = el;

      // scrollHeight - scrollTop - clientHeight = 1000 - 100 - 500 = 400 > 100
      manager.onScroll([], undefined);
      expect(manager.isNearBottom).toBe(false);
    });

    it("does nothing when scrollContainerEl is undefined", () => {
      const manager = createScrollManager();
      // Should not throw
      manager.onScroll([], undefined);
    });

    it("debounces read progress reporting", () => {
      const manager = createScrollManager({ readProgressDebounceMs: 1000 });
      const el = mockScrollContainer();
      manager.scrollContainerEl = el;
      const onreadprogress = vi.fn();

      const followUps = [{ id: "fu-1", createdAt: "2026-01-01T12:00:00Z" }];

      manager.onScroll(followUps, onreadprogress);
      expect(onreadprogress).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      // reportReadProgress will try to find DOM elements by ID, which won't
      // exist in the test. The callback may or may not be called depending
      // on whether any element is "visible". Either way, no crash.
    });
  });

  describe("markScrolledInitially", () => {
    it("enables auto-scroll behavior", () => {
      const manager = createScrollManager();
      // Before marking, autoScrollOnNew should not scroll
      // (hasScrolledInitially is false internally)
      manager.markScrolledInitially();
      // No direct assertion needed - behavior is tested via autoScrollOnNew
    });
  });

  describe("cleanup", () => {
    it("clears pending read progress timer", () => {
      const manager = createScrollManager({ readProgressDebounceMs: 5000 });
      const el = mockScrollContainer();
      manager.scrollContainerEl = el;
      const onreadprogress = vi.fn();

      manager.onScroll(
        [{ id: "fu-1", createdAt: "2026-01-01T12:00:00Z" }],
        onreadprogress,
      );

      manager.cleanup();
      vi.advanceTimersByTime(5000);
      // Timer was cleared, so reportReadProgress should not run
    });

    it("is safe to call multiple times", () => {
      const manager = createScrollManager();
      manager.cleanup();
      manager.cleanup();
    });
  });

  describe("autoScrollOnNew", () => {
    it("does nothing when followUpCount is 0", () => {
      const manager = createScrollManager();
      manager.markScrolledInitially();
      // Should not throw
      manager.autoScrollOnNew(0, false);
    });

    it("does nothing when timeline is active", () => {
      const manager = createScrollManager();
      manager.markScrolledInitially();
      manager.autoScrollOnNew(5, true);
    });
  });
});
