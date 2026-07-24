import { describe, expect, it } from "vitest";
import {
  isValidCountryCode,
  E164_COUNTRY_CODES,
  E164_COUNTRY_CODE_OPTIONS,
} from "./country-codes.js";

describe("isValidCountryCode", () => {
  const validCases = ["+1", "+44", "+91"] as const;

  for (const code of validCases) {
    it(`returns true for valid code ${code}`, () => {
      expect(isValidCountryCode(code)).toBe(true);
    });
  }

  const invalidCases: Array<{ code: string; label: string }> = [
    { code: "+999", label: "unassigned code +999" },
    { code: "", label: "empty string" },
    { code: "not-a-code", label: "arbitrary string" },
  ];

  for (const { code, label } of invalidCases) {
    it(`returns false for ${label}`, () => {
      expect(isValidCountryCode(code)).toBe(false);
    });
  }
});

describe("E164_COUNTRY_CODE_OPTIONS", () => {
  it("option count matches the country code set size", () => {
    expect(E164_COUNTRY_CODE_OPTIONS.length).toBe(E164_COUNTRY_CODES.size);
  });

  it("every option code is present in the set", () => {
    for (const option of E164_COUNTRY_CODE_OPTIONS) {
      expect(E164_COUNTRY_CODES.has(option.code)).toBe(true);
    }
  });

  it("every option has a non-empty name", () => {
    for (const option of E164_COUNTRY_CODE_OPTIONS) {
      expect(option.name.length).toBeGreaterThan(0);
    }
  });
});
