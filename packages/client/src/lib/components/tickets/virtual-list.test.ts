// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { tick } from "svelte";
import {
  computeRange,
  buildPrefixSums,
  type VirtualItem,
} from "./virtual-list-engine.js";
import VirtualListHarness from "./VirtualListHarness.svelte";

// --- Helper: create items array of given length ---
function makeItems(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `item-${i}`);
}

// Helper: build prefix sums from uniform heights.
function uniformSums(rowCount: number, height: number): number[] {
  return buildPrefixSums(
    Array.from({ length: rowCount }, () => height),
    rowCount,
    height,
  );
}

/** Extract indices from a VisibleRange result. */
function indices(items: VirtualItem<string>[]): number[] {
  return items.map((v) => v.index);
}

// ---------------------------------------------------------------------------
// buildPrefixSums
// ---------------------------------------------------------------------------

describe("buildPrefixSums", () => {
  it("produces cumulative offsets from measured heights", () => {
    const sums = buildPrefixSums([80, 120, 100], 3, 200);
    expect(sums).toEqual([0, 80, 200, 300]);
  });

  it("falls back to estimateHeight for unmeasured rows", () => {
    const sums = buildPrefixSums([80], 3, 200);
    expect(sums).toEqual([0, 80, 280, 480]);
  });

  it("returns [0] for zero rows", () => {
    expect(buildPrefixSums([], 0, 100)).toEqual([0]);
  });
});

// ---------------------------------------------------------------------------
// computeRange
// ---------------------------------------------------------------------------

describe("computeRange", () => {
  describe("single column (list mode)", () => {
    it("returns all items when total height fits in viewport", () => {
      const items = makeItems(5);
      const sums = uniformSums(5, 100);
      const result = computeRange(0, 600, sums, items, 0, 1);

      expect(result.items).toHaveLength(5);
      expect(indices(result.items)).toEqual([0, 1, 2, 3, 4]);
    });

    it("returns correct start/end indices for a scroll position", () => {
      const items = makeItems(20);
      const sums = uniformSums(20, 100);
      const result = computeRange(500, 300, sums, items, 0, 1);

      const idx = indices(result.items);
      expect(idx[0]).toBe(5);
      expect(idx[idx.length - 1]).toBe(7);
    });

    it("includes partially-visible row when scrollTop is mid-row", () => {
      const items = makeItems(20);
      const sums = uniformSums(20, 100);
      // scrollTop=150 is halfway through row 1 (row 1 spans 100-200px).
      // Row 1 is partially visible (bottom 50px showing).
      // Viewport bottom = 450, so row 4 (starts at 400) is the last visible.
      const result = computeRange(150, 300, sums, items, 0, 1);

      const idx = indices(result.items);
      expect(idx[0]).toBe(1); // partially visible, must be included
      expect(idx[idx.length - 1]).toBe(4);
    });

    it("excludes items outside the visible range", () => {
      const items = makeItems(10);
      const sums = uniformSums(10, 100);
      const result = computeRange(200, 300, sums, items, 0, 1);

      const idx = indices(result.items);
      expect(idx).not.toContain(0);
      expect(idx).not.toContain(1);
      expect(idx).toContain(2);
      expect(idx).toContain(3);
      expect(idx).toContain(4);
      expect(idx).not.toContain(5);
    });

    it("extends visible range by overscan rows", () => {
      const items = makeItems(20);
      const sums = uniformSums(20, 100);
      const result = computeRange(500, 300, sums, items, 2, 1);

      const idx = indices(result.items);
      expect(idx[0]).toBe(3);
      expect(idx[idx.length - 1]).toBe(9);
    });

    it("clamps overscan to list boundaries", () => {
      const items = makeItems(10);
      const sums = uniformSums(10, 100);
      const result = computeRange(0, 300, sums, items, 5, 1);

      const idx = indices(result.items);
      expect(idx[0]).toBe(0);
      expect(idx[idx.length - 1]).toBe(7);
    });

    it("returns empty array for zero items", () => {
      const sums = buildPrefixSums([], 0, 100);
      const result = computeRange(0, 300, sums, [] as string[], 3, 1);
      expect(result.items).toHaveLength(0);
    });

    it("handles a single item", () => {
      const items = makeItems(1);
      const sums = uniformSums(1, 100);
      const result = computeRange(0, 300, sums, items, 3, 1);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.index).toBe(0);
      expect(result.items[0]?.offset).toBe(0);
      expect(result.startOffset).toBe(0);
    });

    it("computes correct offsets for variable-height rows", () => {
      const items = makeItems(5);
      const heights = [80, 120, 100, 90, 110];
      const sums = buildPrefixSums(heights, 5, 100);
      const result = computeRange(0, 600, sums, items, 0, 1);

      expect(result.items[0]?.offset).toBe(0);
      expect(result.items[1]?.offset).toBe(80);
      expect(result.items[2]?.offset).toBe(200);
      expect(result.items[3]?.offset).toBe(300);
      expect(result.items[4]?.offset).toBe(390);
    });

    it("returns correct startOffset matching first rendered item", () => {
      const items = makeItems(20);
      const sums = uniformSums(20, 100);
      const result = computeRange(500, 300, sums, items, 1, 1);

      expect(result.startOffset).toBe(400);
      expect(result.items[0]?.offset).toBe(result.startOffset);
    });

    it("handles scrollTop beyond measured content gracefully", () => {
      const items = makeItems(5);
      const sums = uniformSums(5, 100);
      const result = computeRange(9999, 300, sums, items, 0, 1);
      expect(result.items.length).toBeGreaterThan(0);
      expect(indices(result.items)).toContain(4);
    });
  });

  describe("multi-column (grid mode)", () => {
    it("groups items into rows of N columns", () => {
      const items = makeItems(6);
      const sums = uniformSums(3, 100);
      const result = computeRange(0, 400, sums, items, 0, 2);

      expect(result.items).toHaveLength(6);
      expect(result.items[0]?.offset).toBe(result.items[1]?.offset);
      expect(result.items[2]?.offset).toBe(result.items[3]?.offset);
    });

    it("handles partial last row (fewer items than columns)", () => {
      const items = makeItems(5);
      const sums = uniformSums(3, 100);
      const result = computeRange(0, 400, sums, items, 0, 2);

      expect(result.items).toHaveLength(5);
      expect(result.items[result.items.length - 1]?.index).toBe(4);
    });

    it("applies overscan in row units, not item units", () => {
      const items = makeItems(20);
      const sums = uniformSums(10, 100);
      const result = computeRange(300, 300, sums, items, 1, 2);

      const idx = indices(result.items);
      expect(idx[0]).toBe(4);
      expect(idx[idx.length - 1]).toBe(13);
    });
  });
});

// ---------------------------------------------------------------------------
// VirtualList component tests (using harness with real snippet)
// ---------------------------------------------------------------------------

// Mock IntersectionObserver for jsdom.
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(
    callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.elements.push(el);
  }
  unobserve(_el: Element): void {
    /* noop */
  }
  disconnect(): void {
    this.elements = [];
  }

  trigger(isIntersecting: boolean): void {
    if (this.elements.length === 0) return;
    this.callback(
      [
        {
          isIntersecting,
          target: this.elements[0],
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

// Mock ResizeObserver for jsdom.
class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  elements: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.elements.push(el);
  }
  unobserve(_el: Element): void {
    /* noop */
  }
  disconnect(): void {
    this.elements = [];
  }
}

/** Get all rendered test-item text contents from the DOM. */
function getRenderedItems(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll(".test-item"),
    (el) => el.textContent,
  );
}

/** Get all rendered data-index values from the DOM. */
function getRenderedIndices(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll(".test-item")).map((el) =>
    parseInt(el.getAttribute("data-index") ?? "-1", 10),
  );
}

describe("VirtualList component", () => {
  let scrollContainer: HTMLDivElement;

  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    MockIntersectionObserver.instances = [];
    MockResizeObserver.instances = [];

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    scrollContainer = document.createElement("div");
    Object.defineProperty(scrollContainer, "clientHeight", { value: 300 });
    Object.defineProperty(scrollContainer, "scrollTop", {
      value: 0,
      writable: true,
    });
    document.body.appendChild(scrollContainer);
  });

  afterEach(() => {
    cleanup();
    document.body.removeChild(scrollContainer);
    vi.unstubAllGlobals();
  });

  it("renders only the visible items, not all items", () => {
    const items = makeItems(100);

    const { container } = render(VirtualListHarness, {
      props: {
        items,
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
      },
    });

    const rendered = getRenderedItems(container);
    // 300px viewport / 50px per item = 6 visible items (items 0-5).
    expect(rendered).toContain("item-0");
    expect(rendered).toContain("item-5");
    expect(rendered).not.toContain("item-10");
    expect(rendered).not.toContain("item-50");
    expect(rendered).not.toContain("item-99");
  });

  it("passes correct item and index to snippet children", () => {
    const items = makeItems(20);

    const { container } = render(VirtualListHarness, {
      props: {
        items,
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
      },
    });

    const renderedIndices = getRenderedIndices(container);
    const texts = getRenderedItems(container);

    // Each rendered item's data-index should match its position in the items array,
    // and its text content should match the item value.
    for (let i = 0; i < renderedIndices.length; i++) {
      expect(texts[i]).toBe(`item-${renderedIndices[i]}`);
    }
    // First visible item should be index 0.
    expect(renderedIndices[0]).toBe(0);
  });

  it("updates visible items after scroll", async () => {
    const items = makeItems(100);

    const { container } = render(VirtualListHarness, {
      props: {
        items,
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
      },
    });

    // Initially: items 0-5 visible (300px / 50px).
    let rendered = getRenderedItems(container);
    expect(rendered).toContain("item-0");
    expect(rendered).not.toContain("item-20");

    // Simulate scrolling to position 1000 (row 20 starts there).
    Object.defineProperty(scrollContainer, "scrollTop", { value: 1000 });
    scrollContainer.dispatchEvent(new Event("scroll"));
    await tick();

    // After scroll: items around index 20 should be visible, item-0 should be gone.
    rendered = getRenderedItems(container);
    expect(rendered).toContain("item-20");
    expect(rendered).not.toContain("item-0");
  });

  it("keeps DOM node count stable after scroll (no DOM growth)", async () => {
    const items = makeItems(100);

    const { container } = render(VirtualListHarness, {
      props: {
        items,
        scrollContainer,
        estimateHeight: 50,
        overscan: 2,
        columns: 1,
      },
    });

    const initialRowCount = container.querySelectorAll(".virtual-row").length;
    expect(initialRowCount).toBeGreaterThan(0);
    expect(initialRowCount).toBeLessThan(20);

    // Scroll to the middle.
    Object.defineProperty(scrollContainer, "scrollTop", { value: 2000 });
    scrollContainer.dispatchEvent(new Event("scroll"));
    await tick();

    const afterScrollRowCount =
      container.querySelectorAll(".virtual-row").length;
    // Row count should be similar (not growing with scroll).
    expect(afterScrollRowCount).toBeLessThanOrEqual(initialRowCount + 2);
    expect(afterScrollRowCount).toBeGreaterThan(0);
  });

  it("sentinel triggers onloadmore when intersecting", () => {
    const onloadmore = vi.fn();
    const items = makeItems(10);

    render(VirtualListHarness, {
      props: {
        items,
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
        onloadmore,
      },
    });

    const sentinelObserver = MockIntersectionObserver.instances.find(
      (obs) =>
        obs.elements.length > 0 &&
        (obs.elements[0] as HTMLElement).classList.contains("scroll-sentinel"),
    );
    expect(sentinelObserver).toBeDefined();

    sentinelObserver?.trigger(true);
    expect(onloadmore).toHaveBeenCalledOnce();

    sentinelObserver?.trigger(false);
    expect(onloadmore).toHaveBeenCalledOnce();
  });

  it("does not fire onloadmore when sentinel is not intersecting", () => {
    const onloadmore = vi.fn();

    render(VirtualListHarness, {
      props: {
        items: makeItems(5),
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
        onloadmore,
      },
    });

    const sentinelObserver = MockIntersectionObserver.instances.find(
      (obs) =>
        obs.elements.length > 0 &&
        (obs.elements[0] as HTMLElement).classList.contains("scroll-sentinel"),
    );

    sentinelObserver?.trigger(false);
    expect(onloadmore).not.toHaveBeenCalled();
  });

  it("applies grid layout class when columns > 1", () => {
    const { container } = render(VirtualListHarness, {
      props: {
        items: makeItems(6),
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 2,
      },
    });

    expect(
      container.querySelectorAll(".virtual-row-grid").length,
    ).toBeGreaterThan(0);
  });

  it("does not apply grid class in single-column mode", () => {
    const { container } = render(VirtualListHarness, {
      props: {
        items: makeItems(6),
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
      },
    });

    expect(container.querySelectorAll(".virtual-row-grid").length).toBe(0);
  });

  it("renders empty list without crashing", () => {
    const { container } = render(VirtualListHarness, {
      props: {
        items: [],
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
      },
    });

    // Empty list renders nothing.
    expect(container.querySelectorAll(".virtual-row").length).toBe(0);
    expect(container.querySelectorAll(".test-item").length).toBe(0);
  });

  it("sets container height to represent total content", () => {
    const { container } = render(VirtualListHarness, {
      props: {
        items: makeItems(50),
        scrollContainer,
        estimateHeight: 80,
        overscan: 0,
        columns: 1,
      },
    });

    // Total height = 50 * 80 = 4000px, held by the virtual-container.
    const vc = container.querySelector(".virtual-container");
    expect(vc).not.toBeNull();
    expect(vc?.getAttribute("style")).toContain("4000px");
  });

  it("top sentinel triggers onloadprevious when intersecting", () => {
    const onloadprevious = vi.fn();
    const items = makeItems(10);

    render(VirtualListHarness, {
      props: {
        items,
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
        onloadprevious,
      },
    });

    // The top sentinel observer is a separate IntersectionObserver instance
    // that observes the .scroll-sentinel--top element.
    const topSentinelObserver = MockIntersectionObserver.instances.find(
      (obs) =>
        obs.elements.length > 0 &&
        (obs.elements[0] as HTMLElement).classList.contains(
          "scroll-sentinel--top",
        ),
    );
    expect(topSentinelObserver).toBeDefined();

    topSentinelObserver?.trigger(true);
    expect(onloadprevious).toHaveBeenCalledOnce();

    // Non-intersecting should not fire again.
    topSentinelObserver?.trigger(false);
    expect(onloadprevious).toHaveBeenCalledOnce();
  });

  it("does not render top sentinel when onloadprevious is not provided", () => {
    const { container } = render(VirtualListHarness, {
      props: {
        items: makeItems(5),
        scrollContainer,
        estimateHeight: 50,
        overscan: 0,
        columns: 1,
      },
    });

    const topSentinel = container.querySelector(".scroll-sentinel--top");
    expect(topSentinel).toBeNull();
  });
});
