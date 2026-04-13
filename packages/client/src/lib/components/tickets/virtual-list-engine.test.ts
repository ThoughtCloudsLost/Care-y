import { describe, it, expect } from "vitest";
import { buildPrefixSums, computeRange } from "./virtual-list-engine.js";

describe("buildPrefixSums", () => {
  it("produces correct offsets for uniform measured heights", () => {
    const sums = buildPrefixSums([50, 50, 50], 3, 60);
    expect(sums).toEqual([0, 50, 100, 150]);
  });

  it("falls back to estimateHeight for unmeasured rows", () => {
    // 2 measured, 1 unmeasured (heights array shorter than rowCount)
    const sums = buildPrefixSums([40, 60], 3, 80);
    expect(sums).toEqual([0, 40, 100, 180]);
  });

  it("handles zero rows", () => {
    const sums = buildPrefixSums([], 0, 50);
    expect(sums).toEqual([0]);
  });

  it("handles all unmeasured rows", () => {
    const sums = buildPrefixSums([], 4, 30);
    expect(sums).toEqual([0, 30, 60, 90, 120]);
  });

  it("handles variable row heights", () => {
    const sums = buildPrefixSums([10, 30, 20], 3, 50);
    // Row 0: h=10, Row 1: h=30, Row 2: h=20
    expect(sums).toEqual([0, 10, 40, 60]);
  });
});

describe("computeRange", () => {
  // Helper: build uniform items + prefix sums
  function setup(count: number, height: number) {
    const items = Array.from({ length: count }, (_, i) => `item-${String(i)}`);
    const heights = Array.from({ length: count }, () => height);
    const sums = buildPrefixSums(heights, count, height);
    return { items, sums };
  }

  it("returns empty for zero items", () => {
    const result = computeRange(0, 300, [0], [], 0, 1);
    expect(result.items).toEqual([]);
    expect(result.startOffset).toBe(0);
  });

  it("returns all items when they fit in the viewport", () => {
    const { items, sums } = setup(3, 50); // total 150px
    const result = computeRange(0, 300, sums, items, 0, 1);
    expect(result.items).toHaveLength(3);
    expect(result.items.map((v) => v.item)).toEqual([
      "item-0",
      "item-1",
      "item-2",
    ]);
  });

  it("only returns items visible in the viewport", () => {
    const { items, sums } = setup(10, 100); // 10 items x 100px = 1000px total
    // Viewport: scrollTop=200, height=250 -> rows 2..4 visible
    const result = computeRange(200, 250, sums, items, 0, 1);
    const visible = result.items.map((v) => v.item);
    expect(visible).toContain("item-2");
    expect(visible).toContain("item-3");
    expect(visible).toContain("item-4");
    expect(visible).not.toContain("item-0");
    expect(visible).not.toContain("item-1");
  });

  it("expands visible range by overscan rows", () => {
    const { items, sums } = setup(10, 100);
    // Without overscan: scrollTop=300, height=100 -> row 3 visible
    const noOverscan = computeRange(300, 100, sums, items, 0, 1);
    // With overscan=2: should include 2 extra rows on each side
    const withOverscan = computeRange(300, 100, sums, items, 2, 1);
    expect(withOverscan.items.length).toBeGreaterThan(noOverscan.items.length);
    // Overscan items should include row 1 (2 before row 3)
    expect(withOverscan.items.map((v) => v.item)).toContain("item-1");
  });

  it("clamps overscan at list boundaries", () => {
    const { items, sums } = setup(5, 100);
    // scrollTop=0 with overscan=10: start can't go below 0
    const result = computeRange(0, 200, sums, items, 10, 1);
    expect(result.items[0]?.index).toBe(0);
    // Should include all items since overscan extends past the end
    expect(result.items).toHaveLength(5);
  });

  it("maps grid rows to multiple items per row", () => {
    // 6 items in 2-column grid = 3 rows
    const items = ["a", "b", "c", "d", "e", "f"];
    const sums = buildPrefixSums([50, 50, 50], 3, 50);
    const result = computeRange(0, 200, sums, items, 0, 2);
    expect(result.items).toHaveLength(6);
    // Items should pair: (a,b) row 0, (c,d) row 1, (e,f) row 2
    expect(result.items[0]?.item).toBe("a");
    expect(result.items[1]?.item).toBe("b");
    expect(result.items[0]?.offset).toBe(result.items[1]?.offset);
  });

  it("handles grid with incomplete last row", () => {
    // 5 items in 3-column grid = 2 rows (row 1 has only 2 items)
    const items = ["a", "b", "c", "d", "e"];
    const sums = buildPrefixSums([40, 40], 2, 40);
    const result = computeRange(0, 200, sums, items, 0, 3);
    expect(result.items).toHaveLength(5);
    expect(result.items[4]?.item).toBe("e");
  });

  it("provides correct offset for each virtual item", () => {
    const { items, sums } = setup(5, 60);
    const result = computeRange(0, 500, sums, items, 0, 1);
    // Each item's offset should match its row's prefix sum
    expect(result.items[0]?.offset).toBe(0);
    expect(result.items[1]?.offset).toBe(60);
    expect(result.items[2]?.offset).toBe(120);
  });

  it("scrolled past all items returns last row", () => {
    const { items, sums } = setup(3, 50); // total 150px
    // scrollTop=500, well past end
    const result = computeRange(500, 300, sums, items, 0, 1);
    // Should still return the last row (binary search clamps)
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items[result.items.length - 1]?.item).toBe("item-2");
  });

  it("single item list returns that item when in viewport", () => {
    const { items, sums } = setup(1, 100);
    const result = computeRange(0, 300, sums, items, 0, 1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.item).toBe("item-0");
  });
});
