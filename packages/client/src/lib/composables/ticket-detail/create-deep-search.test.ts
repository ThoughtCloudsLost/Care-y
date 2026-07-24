// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createDeepSearch } from "./create-deep-search.svelte.js";

describe("createDeepSearch", () => {
  let loadOlderPage: Mock<() => Promise<void>>;
  let hasMore: boolean;
  let loadedCount: number;
  let totalCount: number;

  beforeEach(() => {
    loadOlderPage = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    hasMore = true;
    loadedCount = 0;
    totalCount = 0;
  });

  function make(overrides?: { overlayTerm?: string | null }) {
    const overlayTerm = overrides?.overlayTerm ?? "search";

    return createDeepSearch({
      getOverlayTerm: () => overlayTerm,
      getHasMoreMessages: () => hasMore,
      getLoadOlderPage: () => loadOlderPage,
      getLoadedCount: () => loadedCount,
      getTotalCount: () => totalCount,
    });
  }

  it("starts in idle phase with no term", () => {
    const ds = make();
    expect(ds.phase).toBe("idle");
    expect(ds.term).toBeNull();
  });

  it("trigger transitions through searching to done", async () => {
    hasMore = false;
    const ds = make();

    await ds.trigger();

    expect(ds.phase).toBe("done");
    expect(ds.term).toBe("search");
  });

  it("trigger loads pages until hasMoreMessages is false", async () => {
    let callCount = 0;
    loadOlderPage.mockImplementation(async () => {
      callCount++;
      if (callCount >= 3) hasMore = false;
    });

    const ds = make();
    await ds.trigger();

    expect(loadOlderPage).toHaveBeenCalledTimes(3);
    expect(ds.phase).toBe("done");
  });

  it("does not trigger when already searching", async () => {
    hasMore = false;
    const ds = make();

    await ds.trigger();
    loadOlderPage.mockClear();

    await ds.trigger();
    expect(loadOlderPage).not.toHaveBeenCalled();
  });

  it("does not trigger when term is too short", async () => {
    const ds = make({ overlayTerm: "a" });
    await ds.trigger();
    expect(loadOlderPage).not.toHaveBeenCalled();
    expect(ds.phase).toBe("idle");
  });

  it("does not trigger when loadOlderPage is undefined", async () => {
    const ds = createDeepSearch({
      getOverlayTerm: () => "search",
      getHasMoreMessages: () => true,
      getLoadOlderPage: () => undefined,
      getLoadedCount: () => 0,
      getTotalCount: () => 0,
    });

    await ds.trigger();
    expect(ds.phase).toBe("idle");
  });

  it("reports the climbing loaded count against the ticket total", async () => {
    loadedCount = 1;
    totalCount = 3;
    const midFlight: Array<{ searched: number; total: number }> = [];

    const ds = make();
    loadOlderPage.mockImplementation(async () => {
      midFlight.push({ searched: ds.searched, total: ds.total });
      loadedCount++;
      if (loadedCount >= totalCount) hasMore = false;
    });

    await ds.trigger();

    expect(midFlight[0]).toEqual({ searched: 1, total: 3 });
    expect(midFlight.every((s) => s.searched < s.total)).toBe(true);
    expect(ds.phase).toBe("done");
    expect(ds.searched).toBe(ds.total);
  });

  describe("reset", () => {
    it("resets phase to idle and clears term", async () => {
      hasMore = false;
      const ds = make();
      await ds.trigger();

      ds.reset();

      expect(ds.phase).toBe("idle");
      expect(ds.term).toBeNull();
    });

    it("allows re-triggering after reset", async () => {
      hasMore = false;
      const ds = make();
      await ds.trigger();

      ds.reset();
      loadOlderPage.mockClear();

      await ds.trigger();
      expect(ds.phase).toBe("done");
    });
  });
});
