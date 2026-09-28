// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { formatCount } from "./format-count.js";

describe("formatCount", () => {
  it("returns the bare number when isLowerBound is false", () => {
    expect(formatCount(7, false)).toBe("7");
  });

  it("returns the at-least label when isLowerBound is true", () => {
    expect(formatCount(20, true)).toBe("20+");
  });

  it("returns '0' for zero with no lower-bound flag", () => {
    expect(formatCount(0, false)).toBe("0");
  });
});
