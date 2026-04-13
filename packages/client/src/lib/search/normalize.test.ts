import { describe, expect, it } from "vitest";
import { normalizeForSearch } from "./normalize.js";

describe("normalizeForSearch", () => {
  it("strips accents and lowercases", () => {
    expect(normalizeForSearch("Artículo")).toBe("articulo");
  });

  it("handles multiple accented characters", () => {
    expect(normalizeForSearch("José García")).toBe("jose garcia");
  });

  it("lowercases ASCII without accents", () => {
    expect(normalizeForSearch("HOUSING")).toBe("housing");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeForSearch("")).toBe("");
  });

  it("preserves numbers and punctuation", () => {
    expect(normalizeForSearch("Ticket #123")).toBe("ticket #123");
  });

  it("handles mixed scripts", () => {
    expect(normalizeForSearch("Ñoño")).toBe("nono");
  });
});
