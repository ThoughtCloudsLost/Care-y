import { describe, it, expect } from "vitest";
import { normalizeAlias } from "./normalize-alias.js";

/**
 * Normalization is what makes the alias uniqueness constraint meaningful.
 * The blind index hashes the normalized form, so two aliases that normalize
 * to the same string collide in the database and the second write is
 * rejected. Anything that normalization does not fold can coexist as two
 * separate clients wearing the same label, which is the failure the
 * constraint exists to prevent.
 */
describe("normalizeAlias", () => {
  it("folds case", () => {
    expect(normalizeAlias("Jane")).toBe(normalizeAlias("jane"));
    expect(normalizeAlias("JANE")).toBe(normalizeAlias("jane"));
    expect(normalizeAlias("JaNe")).toBe(normalizeAlias("jane"));
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeAlias(" jane")).toBe(normalizeAlias("jane"));
    expect(normalizeAlias("jane ")).toBe(normalizeAlias("jane"));
    expect(normalizeAlias("\tjane\n")).toBe(normalizeAlias("jane"));
  });

  it("collapses runs of internal whitespace to a single space", () => {
    expect(normalizeAlias("jane  doe")).toBe(normalizeAlias("jane doe"));
    expect(normalizeAlias("jane\t\tdoe")).toBe(normalizeAlias("jane doe"));
    expect(normalizeAlias("jane \n doe")).toBe(normalizeAlias("jane doe"));
  });

  it("applies NFKC, so compatibility forms fold together", () => {
    // Fullwidth Latin (U+FF2A etc.) folds to ASCII under NFKC.
    expect(normalizeAlias("Ｊａｎｅ")).toBe(normalizeAlias("jane"));
    // The fi ligature (U+FB01) decomposes to "fi".
    expect(normalizeAlias("ﬁnch")).toBe(normalizeAlias("finch"));
  });

  it("folds combinations of all four rules at once", () => {
    expect(normalizeAlias("  Ｊａｎｅ   DOE \t")).toBe(
      normalizeAlias("jane doe"),
    );
  });

  it("is idempotent", () => {
    const once = normalizeAlias("  Jane   DOE ");
    expect(normalizeAlias(once)).toBe(once);
  });

  it("leaves a generated alias unchanged", () => {
    // Generated aliases are already lowercase adjective-noun-number, so
    // normalization must be a no-op for them or the server-created and
    // operator-set paths would produce different hashes for the same value.
    expect(normalizeAlias("calm-pebble-40217")).toBe("calm-pebble-40217");
  });

  it("preserves hyphens and digits", () => {
    expect(normalizeAlias("Bright-Cedar-42")).toBe("bright-cedar-42");
  });

  it("does not fold homoglyphs from different scripts", () => {
    // Documented limitation, not an oversight. NFKC folds compatibility
    // forms, not visually confusable characters from other scripts, so
    // Cyrillic a (U+0430) stays distinct from Latin a. Two clients can
    // therefore hold aliases that look identical on screen. Preventing that
    // needs a confusable-skeleton algorithm (UTS #39), which is a larger
    // decision than this helper.
    expect(normalizeAlias("jane")).not.toBe(normalizeAlias("jаne"));
  });

  it("handles the empty string and whitespace-only input", () => {
    expect(normalizeAlias("")).toBe("");
    expect(normalizeAlias("   ")).toBe("");
  });
});
