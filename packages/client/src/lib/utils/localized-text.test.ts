import { describe, it, expect } from "vitest";
import {
  readLocale,
  setLocaleText,
  hasContent,
  trimLocalized,
} from "./localized-text.js";
import type { LocalizedText } from "@care-y/shared";

describe("readLocale", () => {
  it("returns English value for 'en' locale", () => {
    const text: LocalizedText = { en: "hello", es: "hola" };
    expect(readLocale(text, "en")).toBe("hello");
  });

  it("returns Spanish value for 'es' locale", () => {
    const text: LocalizedText = { en: "hello", es: "hola" };
    expect(readLocale(text, "es")).toBe("hola");
  });

  it("returns empty string when the locale key is missing", () => {
    expect(readLocale({}, "en")).toBe("");
    expect(readLocale({}, "es")).toBe("");
  });

  it("returns empty string when the locale value is undefined", () => {
    const text: LocalizedText = { en: undefined };
    expect(readLocale(text, "en")).toBe("");
  });
});

describe("setLocaleText", () => {
  it("sets English value without mutating the original", () => {
    const original: LocalizedText = { en: "old", es: "viejo" };
    const result = setLocaleText(original, "en", "new");
    expect(result.en).toBe("new");
    expect(result.es).toBe("viejo");
    expect(original.en).toBe("old");
  });

  it("sets Spanish value without mutating the original", () => {
    const original: LocalizedText = { en: "hello" };
    const result = setLocaleText(original, "es", "hola");
    expect(result.en).toBe("hello");
    expect(result.es).toBe("hola");
  });

  it("overwrites an existing value", () => {
    const text: LocalizedText = { es: "uno" };
    const result = setLocaleText(text, "es", "dos");
    expect(result.es).toBe("dos");
  });
});

describe("hasContent", () => {
  it("returns false for an empty object", () => {
    expect(hasContent({})).toBe(false);
  });

  it("returns false when all values are empty strings", () => {
    expect(hasContent({ en: "", es: "" })).toBe(false);
  });

  it("returns false when all values are whitespace only", () => {
    expect(hasContent({ en: "   ", es: "\t" })).toBe(false);
  });

  it("returns true when English has content", () => {
    expect(hasContent({ en: "hello" })).toBe(true);
  });

  it("returns true when Spanish has content", () => {
    expect(hasContent({ es: "hola" })).toBe(true);
  });

  it("returns true when both have content", () => {
    expect(hasContent({ en: "hello", es: "hola" })).toBe(true);
  });
});

describe("trimLocalized", () => {
  it("returns empty object when no locale has content", () => {
    expect(trimLocalized({ en: "", es: "  " })).toEqual({});
  });

  it("trims whitespace from values", () => {
    expect(trimLocalized({ en: "  hello  " })).toEqual({ en: "hello" });
  });

  it("preserves only locales with content", () => {
    const result = trimLocalized({ en: "hi", es: "" });
    expect(result).toEqual({ en: "hi" });
    expect(result).not.toHaveProperty("es");
  });

  it("trims both locales", () => {
    expect(trimLocalized({ en: " a ", es: " b " })).toEqual({
      en: "a",
      es: "b",
    });
  });

  it("does not mutate the input", () => {
    const input: LocalizedText = { en: " x " };
    trimLocalized(input);
    expect(input.en).toBe(" x ");
  });

  it("handles undefined values", () => {
    const text: LocalizedText = { en: undefined, es: "hola" };
    expect(trimLocalized(text)).toEqual({ es: "hola" });
  });
});
