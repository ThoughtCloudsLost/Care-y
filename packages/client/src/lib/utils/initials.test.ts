import { describe, it, expect } from "vitest";
import { personInitials, orgInitial } from "./initials.js";

describe("personInitials", () => {
  it("takes the first character of the first two words", () => {
    expect(personInitials("Jane Doe")).toBe("JD");
  });

  it("yields one character for a single-word name", () => {
    expect(personInitials("Sky")).toBe("S");
  });

  it("ignores words beyond the first two", () => {
    expect(personInitials("Ana Maria Silva")).toBe("AM");
  });

  it("uppercases lowercase initials", () => {
    expect(personInitials("jane doe")).toBe("JD");
  });

  it("survives extra surrounding and inner whitespace", () => {
    expect(personInitials("  Jane   Doe  ")).toBe("JD");
  });

  it("returns null for an empty name", () => {
    expect(personInitials("")).toBeNull();
  });

  it("returns null for a whitespace-only name", () => {
    expect(personInitials("   ")).toBeNull();
  });
});

describe("orgInitial", () => {
  it("takes the first grapheme uppercased", () => {
    expect(orgInitial("harbor collective")).toBe("H");
  });

  it("keeps a leading emoji grapheme whole", () => {
    expect(orgInitial("🌈 Collective")).toBe("🌈");
  });

  it("trims before segmenting", () => {
    expect(orgInitial("  harbor")).toBe("H");
  });

  it("returns undefined for an empty name", () => {
    expect(orgInitial("")).toBeUndefined();
  });

  it("returns undefined for a whitespace-only name", () => {
    expect(orgInitial("   ")).toBeUndefined();
  });
});
