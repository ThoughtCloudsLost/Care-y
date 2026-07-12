import { describe, it, expect } from "vitest";
import { isHighlightable, splitByTerm } from "./highlight.js";

describe("isHighlightable", () => {
  it("rejects null, undefined, and terms under 2 characters", () => {
    expect(isHighlightable(null)).toBe(false);
    expect(isHighlightable(undefined)).toBe(false);
    expect(isHighlightable("")).toBe(false);
    expect(isHighlightable("a")).toBe(false);
  });

  it("accepts terms of 2+ characters", () => {
    expect(isHighlightable("ab")).toBe(true);
    expect(isHighlightable("housing")).toBe(true);
  });
});

describe("splitByTerm", () => {
  it("returns one unhighlighted segment when nothing matches", () => {
    expect(splitByTerm("hello world", "zzz")).toEqual([
      { text: "hello world", highlight: false },
    ]);
  });

  it("matches case-insensitively and keeps the original casing", () => {
    expect(splitByTerm("Housing referral", "housing")).toEqual([
      { text: "Housing", highlight: true },
      { text: " referral", highlight: false },
    ]);
  });

  it("marks every occurrence", () => {
    expect(splitByTerm("aba aba", "ab")).toEqual([
      { text: "ab", highlight: true },
      { text: "a ", highlight: false },
      { text: "ab", highlight: true },
      { text: "a", highlight: false },
    ]);
  });

  it("handles a match at the end of the text", () => {
    expect(splitByTerm("emergency housing", "housing")).toEqual([
      { text: "emergency ", highlight: false },
      { text: "housing", highlight: true },
    ]);
  });

  it("returns no segments for empty text", () => {
    expect(splitByTerm("", "term")).toEqual([]);
  });

  it("returns one unhighlighted segment for an empty term (guards the zero-length loop)", () => {
    expect(splitByTerm("hello", "")).toEqual([
      { text: "hello", highlight: false },
    ]);
  });

  it("does not fold accents (literal matching only)", () => {
    expect(splitByTerm("Artículo", "articulo")).toEqual([
      { text: "Artículo", highlight: false },
    ]);
  });
});
