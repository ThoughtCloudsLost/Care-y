import { describe, it, expect } from "vitest";
import { normalizePhoneNumber, isE164 } from "./phone-utils.js";
import { ValidationError } from "../errors.js";

describe("normalizePhoneNumber", () => {
  describe("US/CA (+1)", () => {
    it("normalizes formatted US number", () => {
      expect(normalizePhoneNumber("(212) 555-1234", "+1")).toBe("+12125551234");
    });

    it("strips leading 1 from 11-digit input", () => {
      expect(normalizePhoneNumber("1-212-555-1234", "+1")).toBe("+12125551234");
    });

    it("normalizes dash-separated number", () => {
      expect(normalizePhoneNumber("212-555-1234", "+1")).toBe("+12125551234");
    });

    it("passes through E.164 format", () => {
      expect(normalizePhoneNumber("+12125551234", "+1")).toBe("+12125551234");
    });

    it("rejects 9 digits", () => {
      expect(() => normalizePhoneNumber("212-555-123", "+1")).toThrow(
        ValidationError,
      );
    });

    it("rejects 12 digits", () => {
      expect(() => normalizePhoneNumber("121255512345", "+1")).toThrow(
        ValidationError,
      );
    });
  });

  describe("UK (+44)", () => {
    it("normalizes mobile with leading 0", () => {
      expect(normalizePhoneNumber("07700 900123", "+44")).toBe("+447700900123");
    });

    it("normalizes landline with leading 0", () => {
      expect(normalizePhoneNumber("020 7946 0958", "+44")).toBe(
        "+442079460958",
      );
    });

    it("rejects too-short number after stripping 0", () => {
      expect(() => normalizePhoneNumber("0123456", "+44")).toThrow(
        ValidationError,
      );
    });
  });

  describe("Australia (+61)", () => {
    it("normalizes mobile with leading 0", () => {
      expect(normalizePhoneNumber("0412 345 678", "+61")).toBe("+61412345678");
    });

    it("rejects 8 digits after stripping 0", () => {
      expect(() => normalizePhoneNumber("041234567", "+61")).toThrow(
        ValidationError,
      );
    });
  });

  describe("Germany (+49)", () => {
    it("normalizes Berlin landline", () => {
      expect(normalizePhoneNumber("030 12345", "+49")).toBe("+493012345");
    });

    it("normalizes mobile", () => {
      expect(normalizePhoneNumber("0170 1234567", "+49")).toBe("+491701234567");
    });
  });

  describe("generic fallback", () => {
    it("normalizes Ukrainian number", () => {
      expect(normalizePhoneNumber("50 123 4567", "+380")).toBe("+380501234567");
    });

    it("rejects number with fewer than 4 digits", () => {
      expect(() => normalizePhoneNumber("123", "+380")).toThrow(
        ValidationError,
      );
    });
  });

  describe("already E.164", () => {
    it("passes through valid E.164", () => {
      expect(normalizePhoneNumber("+442079460958", "+44")).toBe(
        "+442079460958",
      );
    });

    it("normalizes E.164 with spaces", () => {
      expect(normalizePhoneNumber("+1 (212) 555-1234", "+1")).toBe(
        "+12125551234",
      );
    });
  });

  describe("edge cases", () => {
    it("throws on unknown country code", () => {
      expect(() => normalizePhoneNumber("12345", "+99")).toThrow(
        ValidationError,
      );
    });

    it("throws on empty string", () => {
      expect(() => normalizePhoneNumber("", "+1")).toThrow(ValidationError);
    });

    it("throws on whitespace-only", () => {
      expect(() => normalizePhoneNumber("   ", "+1")).toThrow(ValidationError);
    });

    it("throws on letters-only", () => {
      expect(() => normalizePhoneNumber("abcdef", "+1")).toThrow(
        ValidationError,
      );
    });
  });
});

describe("isE164", () => {
  it("accepts valid E.164 numbers", () => {
    expect(isE164("+12125551234")).toBe(true);
    expect(isE164("+442079460958")).toBe(true);
    expect(isE164("+380501234567")).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(isE164("12125551234")).toBe(false);
    expect(isE164("+0125551234")).toBe(false);
    expect(isE164("+1")).toBe(false);
    expect(isE164("")).toBe(false);
    expect(isE164("+1234567890123456")).toBe(false);
  });
});
