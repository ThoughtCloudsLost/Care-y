// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createDeepSearch } from "./create-deep-search.svelte.js";

describe("createDeepSearch", () => {
  let loadOlderPage: Mock<() => Promise<void>>;
  let hasMore: boolean;

  beforeEach(() => {
    loadOlderPage = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    hasMore = true;
  });

  function make(overrides?: { overlayTerm?: string | null }) {
    const overlayTerm = overrides?.overlayTerm ?? "search";

    return createDeepSearch({
      getOverlayTerm: () => overlayTerm,
      getHasMoreMessages: () => hasMore,
      getLoadOlderPage: () => loadOlderPage,
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
    });

    await ds.trigger();
    expect(ds.phase).toBe("idle");
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
