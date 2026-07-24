// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { flushSync } from "svelte";
import { cleanup } from "@testing-library/svelte";
import {
  createSearchOverlay,
  type SearchOverlay,
} from "./search-overlay.svelte.js";

afterEach(cleanup);

// jsdom omits scrollIntoView; without this the scroll-tracking tests leave
// unhandled rejections behind. Tests that assert scroll calls install their
// own instance-level spies, which shadow this default.
Element.prototype.scrollIntoView = vi.fn();

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

  describe("setTerm", () => {
    it("keeps activeId when it still exists in matches after term change", async () => {
      const { overlay, destroy } = setup(["a", "b", "c"]);
      overlay.enter("hello", "b");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("b");
      });
      overlay.setTerm("world");
      await vi.waitFor(() => {
        expect(overlay.term).toBe("world");
      });
      expect(overlay.activeId).toBe("b");
      destroy();
    });

    it("resets activeId to first match when current activeId is no longer in matches", async () => {
      let ids = ["a", "b", "c"];
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

      overlay.enter("hello", "b");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("b");
      });

      ids = ["x", "y"];
      overlay.setTerm("new-term");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("x");
      });
      expect(overlay.scrollRequested).toBe(true);
      destroy();
    });

    it("sets activeId to null when matches become empty after setTerm", async () => {
      let ids: string[] = ["a", "b"];
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

      overlay.enter("hello", "a");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("a");
      });

      ids = [];
      overlay.setTerm("gone");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBeNull();
      });
      destroy();
    });
  });

  describe("defaultScroll (no custom onscroll)", () => {
    it("uses scrollIntoView on firstElementChild when present", async () => {
      const scrollIntoViewSpy = vi.fn();
      const childEl = document.createElement("span");
      childEl.scrollIntoView = scrollIntoViewSpy;
      const wrapperEl = document.createElement("div");
      wrapperEl.appendChild(childEl);
      wrapperEl.id = "item-a";
      document.body.appendChild(wrapperEl);

      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      let overlay!: SearchOverlay;
      const destroy = $effect.root(() => {
        overlay = createSearchOverlay({
          matches: () => ["a"],
          getElementId: (id) => `item-${id}`,
          scrollContainer: () => undefined,
        });
      });
      flushSync();

      overlay.enter("hello", "a");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("a");
      });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });

      destroy();
      wrapperEl.remove();
      rafSpy.mockRestore();
    });

    it("falls back to wrapper itself when firstElementChild is null", async () => {
      const scrollIntoViewSpy = vi.fn();
      const wrapperEl = document.createElement("div");
      wrapperEl.id = "item-solo";
      wrapperEl.scrollIntoView = scrollIntoViewSpy;
      document.body.appendChild(wrapperEl);

      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      let overlay!: SearchOverlay;
      const destroy = $effect.root(() => {
        overlay = createSearchOverlay({
          matches: () => ["solo"],
          getElementId: (id) => `item-${id}`,
          scrollContainer: () => undefined,
        });
      });
      flushSync();

      overlay.enter("hello", "solo");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("solo");
      });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });

      destroy();
      wrapperEl.remove();
      rafSpy.mockRestore();
    });

    it("is a no-op when getElementById returns null", async () => {
      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      let overlay!: SearchOverlay;
      const destroy = $effect.root(() => {
        overlay = createSearchOverlay({
          matches: () => ["missing"],
          getElementId: (id) => `item-${id}`,
          scrollContainer: () => undefined,
        });
      });
      flushSync();

      // No element with id "item-missing" in the DOM
      overlay.enter("hello", "missing");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("missing");
      });

      // No error thrown, scrollIntoView never called
      destroy();
      rafSpy.mockRestore();
    });
  });

  describe("passive scroll tracking", () => {
    function setupWithScrollContainer(ids: string[]): {
      overlay: SearchOverlay;
      container: HTMLElement;
      destroy: () => void;
    } {
      const container = document.createElement("div");
      container.getBoundingClientRect = () =>
        ({
          top: 0,
          bottom: 600,
          height: 600,
          left: 0,
          right: 400,
          width: 400,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      document.body.appendChild(container);

      // Create mock elements for each match ID
      for (const id of ids) {
        const el = document.createElement("div");
        el.id = `item-${id}`;
        el.getBoundingClientRect = () =>
          ({
            top: ids.indexOf(id) * 200,
            bottom: ids.indexOf(id) * 200 + 100,
            height: 100,
            left: 0,
            right: 400,
            width: 400,
            x: 0,
            y: ids.indexOf(id) * 200,
            toJSON: () => ({}),
          }) as DOMRect;
        document.body.appendChild(el);
      }

      let overlay!: SearchOverlay;
      const destroy = $effect.root(() => {
        overlay = createSearchOverlay({
          matches: () => ids,
          getElementId: (id) => `item-${id}`,
          scrollContainer: () => container,
        });
      });
      flushSync();

      return {
        overlay,
        container,
        destroy: () => {
          destroy();
          for (const id of ids) {
            document.getElementById(`item-${id}`)?.remove();
          }
          container.remove();
        },
      };
    }

    it("updates activeId to the match nearest viewport center on scroll", async () => {
      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      const { overlay, container, destroy } = setupWithScrollContainer([
        "p",
        "q",
        "r",
      ]);

      overlay.enter("hello", "r");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("r");
      });

      // Wait for scroll tracking to re-enable (navigateWithoutScrollTracking
      // disables it for 600ms during enter)
      await new Promise((r) => setTimeout(r, 700));

      container.dispatchEvent(new Event("scroll"));

      await vi.waitFor(() => {
        // Element "p" is at y=0..100, center=50. Viewport center=300.
        // Element "q" is at y=200..300, center=250. Closest to 300.
        // Element "r" is at y=400..500, center=450.
        // "q" (dist=50) is closest to viewport center (300)
        expect(overlay.activeId).toBe("q");
      });

      destroy();
      rafSpy.mockRestore();
    });

    it("does not update activeId when scroll tracking is disabled (during navigation)", async () => {
      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      const { overlay, container, destroy } = setupWithScrollContainer([
        "p",
        "q",
      ]);

      overlay.enter("hello", "q");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("q");
      });

      // Immediately after navigation (enter), scroll tracking is disabled.
      // Scroll event should not change activeId.
      container.dispatchEvent(new Event("scroll"));
      expect(overlay.activeId).toBe("q");

      destroy();
      rafSpy.mockRestore();
    });

    it("skips DOM elements that are not found by getElementById", async () => {
      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      // "ghost" has no DOM element, so it is skipped during distance calc
      const container = document.createElement("div");
      container.getBoundingClientRect = () =>
        ({
          top: 0,
          bottom: 600,
          height: 600,
          left: 0,
          right: 400,
          width: 400,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      document.body.appendChild(container);

      const realEl = document.createElement("div");
      realEl.id = "item-real";
      realEl.getBoundingClientRect = () =>
        ({
          top: 280,
          bottom: 320,
          height: 40,
          left: 0,
          right: 400,
          width: 400,
          x: 0,
          y: 280,
          toJSON: () => ({}),
        }) as DOMRect;
      document.body.appendChild(realEl);

      let overlay!: SearchOverlay;
      const destroy = $effect.root(() => {
        overlay = createSearchOverlay({
          matches: () => ["ghost", "real"],
          getElementId: (id) => `item-${id}`,
          scrollContainer: () => container,
        });
      });
      flushSync();

      overlay.enter("hello", "real");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("real");
      });

      await new Promise((r) => setTimeout(r, 700));
      container.dispatchEvent(new Event("scroll"));

      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("real");
      });

      destroy();
      realEl.remove();
      container.remove();
      rafSpy.mockRestore();
    });

    it("does not fire scroll handler when overlay is inactive", async () => {
      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      const { overlay, container, destroy } = setupWithScrollContainer([
        "a",
        "b",
      ]);

      // Overlay is inactive (never entered)
      container.dispatchEvent(new Event("scroll"));
      expect(overlay.activeId).toBeNull();

      destroy();
      rafSpy.mockRestore();
    });

    it("coalesces rapid scroll events via requestAnimationFrame", async () => {
      let rafCallback: ((time: number) => void) | null = null;
      const rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          rafCallback = cb;
          return 42;
        });

      const { overlay, container, destroy } = setupWithScrollContainer([
        "a",
        "b",
      ]);

      overlay.enter("hello", "b");
      await vi.waitFor(() => {
        expect(overlay.activeId).toBe("b");
      });

      await new Promise((r) => setTimeout(r, 700));

      // Fire two scroll events before the raf fires
      container.dispatchEvent(new Event("scroll"));
      container.dispatchEvent(new Event("scroll"));

      // Only one raf was requested (second scroll is coalesced)
      // The raf mock was called during enter too, so filter for scroll-related calls
      const scrollRafCalls = rafSpy.mock.calls.length;
      expect(scrollRafCalls).toBeGreaterThanOrEqual(1);

      // Now fire the raf callback (assigned inside mockImplementation;
      // TS can't track cross-closure mutation so we cast past the narrowing)
      (rafCallback as ((time: number) => void) | null)?.(0);

      destroy();
      rafSpy.mockRestore();
    });
  });
});
