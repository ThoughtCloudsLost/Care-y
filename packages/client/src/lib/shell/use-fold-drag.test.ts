import { describe, it, expect } from "vitest";
import { decideFoldSnap } from "./use-fold-drag.svelte.js";

describe("decideFoldSnap", () => {
  it("returns false when offset and velocity are both below thresholds", () => {
    expect(decideFoldSnap(40, 0.2, false)).toBe(false);
  });

  it("returns true when offset exceeds 80px threshold", () => {
    expect(decideFoldSnap(81, 0.1, false)).toBe(true);
  });

  it("returns false at exactly 80px (not exceeded)", () => {
    expect(decideFoldSnap(80, 0.1, false)).toBe(false);
  });

  it("returns true when velocity exceeds 0.4px/ms despite low offset", () => {
    expect(decideFoldSnap(20, 0.5, false)).toBe(true);
  });

  it("returns false when swiping back despite exceeding offset threshold", () => {
    expect(decideFoldSnap(100, 0.1, true)).toBe(false);
  });

  it("returns false when swiping back despite exceeding velocity threshold", () => {
    expect(decideFoldSnap(20, 0.6, true)).toBe(false);
  });

  it("returns true when both offset and velocity exceed thresholds", () => {
    expect(decideFoldSnap(100, 0.6, false)).toBe(true);
  });

  it("returns false for zero offset and zero velocity", () => {
    expect(decideFoldSnap(0, 0, false)).toBe(false);
  });

  it("returns false at exactly 0.4px/ms velocity (not exceeded)", () => {
    expect(decideFoldSnap(20, 0.4, false)).toBe(false);
  });
});
