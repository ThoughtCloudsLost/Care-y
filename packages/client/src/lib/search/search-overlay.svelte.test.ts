// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { flushSync } from "svelte";
import { cleanup } from "@testing-library/svelte";
import {
  createSearchOverlay,
  type SearchOverlay,
} from "./search-overlay.svelte.js";

afterEach(cleanup);

function setup(ids: string[] = ["a", "b", "c"]) {
  const scrollSpy = vi.fn<(id: string) => void>();
  let overlay!: SearchOverlay;

  const destroy = $effect.root(() => {
    overlay = createSearchOverlay({
      matches: () => ids,
      getElementId: (id) => `item-${id}`,
      scrollContainer: () => undefined,
      onscroll: scrollSpy,
    });
  });

  flushSync();
  return { overlay, scrollSpy, destroy };
}

describe("createSearchOverlay", () => {
  describe("initial state", () => {
    it("starts inactive with null term and activeId", () => {
      const { overlay, destroy } = setup();
      expect(overlay.term).toBeNull();
      expect(overlay.active).toBe(false);
      expect(overlay.activeId).toBeNull();
      expect(overlay.position).toBe(-1);
      expect(overlay.matchCount).toBe(3);
      expect(overlay.scrollRequested).toBe(false);
      destroy();
    });
  });

  describe("enter", () => {
    it("sets term and defaults to last match", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello");
      expect(overlay.term).toBe("hello");
      expect(overlay.active).toBe(true);
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("c");
      });
      expect(overlay.position).toBe(2);
      destroy();
    });

    it("jumps to targetId when it exists in matches", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello", "b");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("b");
      });
      expect(overlay.position).toBe(1);
      destroy();
    });

    it("falls back to last match when targetId is not in matches", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello", "nonexistent");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("c");
      });
      destroy();
    });

    it("sets scrollRequested on enter", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello");
      await vi.waitFor(() => {
        expect(overlay.scrollRequested).toBe(true);
      });
      destroy();
    });

    it("calls onscroll with the active match ID", async () => {
      const { overlay, scrollSpy, destroy } = setup();
      overlay.enter("hello", "b");
      await vi.waitFor(() => {
        expect(scrollSpy).toHaveBeenCalledWith("b");
      });
      destroy();
    });
  });

  describe("exit", () => {
    it("resets term and activeId to null", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("c");
      });
      overlay.exit();
      expect(overlay.term).toBeNull();
      expect(overlay.activeId).toBeNull();
      expect(overlay.active).toBe(false);
      destroy();
    });
  });

  describe("navigation", () => {
    it("down wraps from last to first", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("c");
      });
      overlay.down();
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("a");
      });
      expect(overlay.position).toBe(0);
      destroy();
    });

    it("up wraps from first to last", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello", "a");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("a");
      });
      overlay.up();
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("c");
      });
      expect(overlay.position).toBe(2);
      destroy();
    });

    it("down steps forward by one", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello", "a");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("a");
      });
      overlay.down();
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("b");
      });
      destroy();
    });

    it("up steps backward by one", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("c");
      });
      overlay.up();
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("b");
      });
      destroy();
    });

    it("is a no-op when matches are empty", async () => {
      const { overlay, destroy } = setup([]);
      overlay.enter("hello");
      await vi.waitFor(() => {
        expect(overlay.active).toBe(true);
      });
      overlay.up();
      expect(overlay.activeId).toBeNull();
      overlay.down();
      expect(overlay.activeId).toBeNull();
      destroy();
    });
  });

  describe("scrollRequested lifecycle", () => {
    it("markScrollComplete clears the flag", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello");
      await vi.waitFor(() => {
        expect(overlay.scrollRequested).toBe(true);
      });
      overlay.markScrollComplete();
      expect(overlay.scrollRequested).toBe(false);
      destroy();
    });

    it("navigation sets scrollRequested again", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello");
      await vi.waitFor(() => {
        expect(overlay.scrollRequested).toBe(true);
      });
      overlay.markScrollComplete();
      overlay.down();
      await vi.waitFor(() => {
        expect(overlay.scrollRequested).toBe(true);
      });
      destroy();
    });
  });

  describe("requestScroll", () => {
    it("calls onscroll with current activeId", async () => {
      const { overlay, scrollSpy, destroy } = setup();
      overlay.enter("hello", "b");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("b");
      });
      scrollSpy.mockClear();
      overlay.requestScroll();
      await vi.waitFor(() => {
        expect(scrollSpy).toHaveBeenCalledWith("b");
      });
      destroy();
    });

    it("is a no-op when activeId is null", () => {
      const { overlay, scrollSpy, destroy } = setup();
      overlay.requestScroll();
      expect(scrollSpy).not.toHaveBeenCalled();
      destroy();
    });

    it("sets scrollRequested", async () => {
      const { overlay, destroy } = setup();
      overlay.enter("hello", "a");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("a");
      });
      overlay.markScrollComplete();
      overlay.requestScroll();
      await vi.waitFor(() => {
        expect(overlay.scrollRequested).toBe(true);
      });
      destroy();
    });
  });

  describe("ID stability", () => {
    it("activeId survives when matches recompute with same IDs", async () => {
      const { overlay, destroy } = setup(["x", "y", "z"]);
      overlay.enter("hello", "y");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("y");
        expect(overlay.position).toBe(1);
      });
      expect(overlay.activeId).toBe("y");
      destroy();
    });
  });
});
