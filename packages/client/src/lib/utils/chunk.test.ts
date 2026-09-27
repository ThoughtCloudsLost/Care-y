import { describe, it, expect } from "vitest";
import { chunk } from "./chunk.js";

describe("chunk", () => {
  it("splits into sub-arrays of at most size elements", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns one chunk when the array fits", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("returns no chunks for an empty array", () => {
    expect(chunk([], 3)).toEqual([]);
  });
});
