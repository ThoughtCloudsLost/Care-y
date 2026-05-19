import { describe, it, expect } from "vitest";
import {
  assessPassphraseStrength,
  looksLikeCommonPattern,
} from "./passphrase-strength.js";

describe("assessPassphraseStrength", () => {
  it("returns too-short for empty string", () => {
    expect(assessPassphraseStrength("")).toBe("too-short");
  });

  it("returns too-short for 19 characters", () => {
    expect(assessPassphraseStrength("a".repeat(19))).toBe("too-short");
  });

  it("returns acceptable at exactly 20 characters", () => {
    expect(assessPassphraseStrength("a".repeat(20))).toBe("acceptable");
  });

  it("returns acceptable for 29 characters", () => {
    expect(assessPassphraseStrength("a".repeat(29))).toBe("acceptable");
  });

  it("returns good at exactly 30 characters", () => {
    expect(assessPassphraseStrength("a".repeat(30))).toBe("good");
  });

  it("returns good for 39 characters", () => {
    expect(assessPassphraseStrength("a".repeat(39))).toBe("good");
  });

  it("returns strong at exactly 40 characters", () => {
    expect(assessPassphraseStrength("a".repeat(40))).toBe("strong");
  });

  it("returns strong for very long passphrases", () => {
    expect(assessPassphraseStrength("a".repeat(100))).toBe("strong");
  });
});

describe("assessPassphraseStrength with custom minLength", () => {
  it("returns too-short below minLength=16", () => {
    expect(assessPassphraseStrength("a".repeat(15), 16)).toBe("too-short");
  });

  it("returns acceptable at exactly minLength=16", () => {
    expect(assessPassphraseStrength("a".repeat(16), 16)).toBe("acceptable");
  });

  it("returns acceptable for 25 characters with minLength=16", () => {
    expect(assessPassphraseStrength("a".repeat(25), 16)).toBe("acceptable");
  });

  it("returns good at minLength+10 (26 for minLength=16)", () => {
    expect(assessPassphraseStrength("a".repeat(26), 16)).toBe("good");
  });

  it("returns good for 35 characters with minLength=16", () => {
    expect(assessPassphraseStrength("a".repeat(35), 16)).toBe("good");
  });

  it("returns strong at minLength+20 (36 for minLength=16)", () => {
    expect(assessPassphraseStrength("a".repeat(36), 16)).toBe("strong");
  });

  it("preserves default behavior when minLength is omitted", () => {
    expect(assessPassphraseStrength("a".repeat(19))).toBe("too-short");
    expect(assessPassphraseStrength("a".repeat(20))).toBe("acceptable");
  });
});

describe("looksLikeCommonPattern", () => {
  it("detects all-same-character strings", () => {
    expect(looksLikeCommonPattern("aaaaaaaaaaaaaaaaaaaa")).toBe(true);
  });

  it("detects short numeric-only strings", () => {
    expect(looksLikeCommonPattern("12345678901234567890")).toBe(true);
  });

  it("allows long numeric strings (30+ chars)", () => {
    expect(looksLikeCommonPattern("0".repeat(30))).toBe(true);
  });

  it("allows mixed-character strings", () => {
    expect(looksLikeCommonPattern("morning river quiet lantern")).toBe(false);
  });

  it("allows strings with mixed character types", () => {
    expect(looksLikeCommonPattern("abc123def456ghi789jk")).toBe(false);
  });

  it("detects single character repeated", () => {
    expect(looksLikeCommonPattern("XXXXXXXXXXXXXXXXXXXX")).toBe(true);
  });
});
