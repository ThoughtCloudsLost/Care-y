import { describe, it, expect } from "vitest";
import { computeGaps } from "./gap-indicators.js";

function makeItem(
  key: string,
  firstPosition: number,
  lastPosition: number = firstPosition,
): {
  readonly key: string;
  readonly firstPosition: number;
  readonly lastPosition: number;
} {
  return { key, firstPosition, lastPosition };
}

describe("computeGaps", () => {
  it("returns empty map for empty entries array", () => {
    const gaps = computeGaps([], 10);

    expect(gaps.size).toBe(0);
  });

  it("returns empty map when totalCount is undefined and no internal gaps", () => {
    const gaps = computeGaps([makeItem("a", 1)], undefined);

    expect(gaps.size).toBe(0);
  });

  it("sets __before__ when first entry starts after position 1", () => {
    const gaps = computeGaps([makeItem("a", 4)], undefined);

    expect(gaps.get("__before__")).toBe(3);
  });

  it("omits __before__ when first entry starts at position 1", () => {
    const gaps = computeGaps([makeItem("a", 1)], undefined);

    expect(gaps.has("__before__")).toBe(false);
  });

  it("detects gap between two consecutive entries", () => {
    const entries = [makeItem("a", 1, 1), makeItem("b", 5, 5)];
    const gaps = computeGaps(entries, undefined);

    expect(gaps.get("b")).toBe(3);
  });

  it("omits gap entry when entries are adjacent (no hidden items)", () => {
    const entries = [makeItem("a", 1, 2), makeItem("b", 3, 4)];
    const gaps = computeGaps(entries, undefined);

    expect(gaps.has("b")).toBe(false);
  });

  it("detects gap between multiple entries with mixed spacing", () => {
    const entries = [
      makeItem("a", 1, 1),
      makeItem("b", 2, 2),
      makeItem("c", 6, 6),
    ];
    const gaps = computeGaps(entries, undefined);

    expect(gaps.has("b")).toBe(false);
    expect(gaps.get("c")).toBe(3);
  });

  it("sets __after__ when last entry ends before totalCount", () => {
    const entries = [makeItem("a", 1, 3)];
    const gaps = computeGaps(entries, 7);

    expect(gaps.get("__after__")).toBe(4);
  });

  it("omits __after__ when last entry ends at totalCount", () => {
    const entries = [makeItem("a", 1, 5)];
    const gaps = computeGaps(entries, 5);

    expect(gaps.has("__after__")).toBe(false);
  });

  it("omits __after__ when totalCount is undefined", () => {
    const entries = [makeItem("a", 1, 3)];
    const gaps = computeGaps(entries, undefined);

    expect(gaps.has("__after__")).toBe(false);
  });

  it("computes all three gap types simultaneously", () => {
    const entries = [makeItem("a", 3, 3), makeItem("b", 7, 8)];
    const gaps = computeGaps(entries, 12);

    expect(gaps.get("__before__")).toBe(2);
    expect(gaps.get("b")).toBe(3);
    expect(gaps.get("__after__")).toBe(4);
  });
});
