import { describe, it, expect } from "vitest";
import { hasExactMessageCoverage } from "./message-coverage.js";

describe("hasExactMessageCoverage", () => {
  it("accepts an exact partition of the rows", () => {
    expect(hasExactMessageCoverage(["a", "b", "c"], ["a", "c"], ["b"])).toBe(
      true,
    );
  });

  it("accepts empty sets over an empty channel", () => {
    expect(hasExactMessageCoverage([], [], [])).toBe(true);
  });

  it("accepts all-rewrapped and all-skipped extremes", () => {
    expect(hasExactMessageCoverage(["a", "b"], ["a", "b"], [])).toBe(true);
    expect(hasExactMessageCoverage(["a", "b"], [], ["a", "b"])).toBe(true);
  });

  it("rejects an uncovered row (message arrived mid-operation)", () => {
    expect(hasExactMessageCoverage(["a", "b"], ["a"], [])).toBe(false);
  });

  it("rejects overlap between the two sets", () => {
    expect(hasExactMessageCoverage(["a", "b"], ["a"], ["a"])).toBe(false);
  });

  it("rejects a stray ID that matches no row", () => {
    expect(hasExactMessageCoverage(["a"], ["a"], ["ghost"])).toBe(false);
    expect(hasExactMessageCoverage(["a"], ["ghost"], ["a"])).toBe(false);
  });

  it("rejects duplicate IDs in either set", () => {
    expect(hasExactMessageCoverage(["a", "b"], ["a", "a"], ["b"])).toBe(false);
    expect(hasExactMessageCoverage(["a", "b"], ["a"], ["b", "b"])).toBe(false);
  });
});
