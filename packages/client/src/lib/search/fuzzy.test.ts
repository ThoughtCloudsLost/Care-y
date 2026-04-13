import { describe, expect, it } from "vitest";
import { fuzzySearch } from "./fuzzy.js";

describe("fuzzySearch", () => {
  it("matches with typo tolerance (missing character)", () => {
    const results = fuzzySearch(["housing", "transport"], "housng");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.index).toBe(0); // "housing"
  });

  it("matches with accent folding", () => {
    const results = fuzzySearch(["Artículo"], "articulo");
    expect(results.length).toBe(1);
    expect(results[0]!.index).toBe(0);
  });

  it("returns empty array for no matches", () => {
    const results = fuzzySearch(["apple", "banana"], "xyz");
    expect(results).toEqual([]);
  });

  it("returns multiple results when multiple items match", () => {
    const haystack = ["housing assistance program", "housing", "house plans"];
    const results = fuzzySearch(haystack, "housing");
    // At least the exact match and the phrase containing it should match
    expect(results.length).toBeGreaterThanOrEqual(2);
    // All returned indices should be valid
    for (const r of results) {
      expect(r.index).toBeGreaterThanOrEqual(0);
      expect(r.index).toBeLessThan(haystack.length);
    }
  });

  it("handles empty haystack", () => {
    const results = fuzzySearch([], "test");
    expect(results).toEqual([]);
  });

  it("handles empty query", () => {
    const results = fuzzySearch(["apple", "banana"], "");
    // uFuzzy with empty query may return all or none depending on config
    // The important thing is it doesn't throw
    expect(Array.isArray(results)).toBe(true);
  });

  it("matches with character transposition", () => {
    const results = fuzzySearch(["housing"], "huosing");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.index).toBe(0);
  });

  it("matches accent-folded query against plain haystack", () => {
    const results = fuzzySearch(["jose"], "José");
    expect(results.length).toBe(1);
    expect(results[0]!.index).toBe(0);
  });
});
