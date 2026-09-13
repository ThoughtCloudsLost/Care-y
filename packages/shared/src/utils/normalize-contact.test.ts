import { describe, it, expect } from "vitest";
import {
  normalizeContactPhone,
  normalizeContactEmail,
  looksLikePhone,
  looksLikeEmail,
} from "./normalize-contact.js";

describe("normalizeContactPhone", () => {
  it("keys E.164 phone number by its last 10 digits", () => {
    expect(normalizeContactPhone("+12125551234")).toBe("2125551234");
  });

  it("keys a formatted national number to the same key as its E.164 form", () => {
    expect(normalizeContactPhone("(212) 555-1234")).toBe(
      normalizeContactPhone("+12125551234"),
    );
  });

  it("strips spaces and dashes", () => {
    expect(normalizeContactPhone("212 555 1234")).toBe("2125551234");
  });

  it("keys international E.164 and national formats identically", () => {
    expect(normalizeContactPhone("+44 7700 900123")).toBe("7700900123");
    expect(normalizeContactPhone("07700 900123")).toBe(
      normalizeContactPhone("+447700900123"),
    );
  });

  it("returns null for too-short input", () => {
    expect(normalizeContactPhone("12345")).toBe(null);
    expect(normalizeContactPhone("123")).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(normalizeContactPhone("")).toBe(null);
  });

  it("returns null for non-digit input", () => {
    expect(normalizeContactPhone("hello")).toBe(null);
  });

  it("handles 7-digit numbers (minimum)", () => {
    expect(normalizeContactPhone("5551234")).toBe("5551234");
  });
});

describe("normalizeContactEmail", () => {
  it("lowercases email", () => {
    expect(normalizeContactEmail("User@Example.COM")).toBe("user@example.com");
  });

  it("trims whitespace", () => {
    expect(normalizeContactEmail("  user@example.com  ")).toBe(
      "user@example.com",
    );
  });

  it("returns null for empty string", () => {
    expect(normalizeContactEmail("")).toBe(null);
    expect(normalizeContactEmail("   ")).toBe(null);
  });
});

describe("looksLikePhone", () => {
  it("matches E.164 format", () => {
    expect(looksLikePhone("+12125551234")).toBe(true);
  });

  it("matches national format with separators", () => {
    expect(looksLikePhone("(212) 555-1234")).toBe(true);
  });

  it("matches digits with spaces", () => {
    expect(looksLikePhone("212 555 1234")).toBe(true);
  });

  it("rejects plain text", () => {
    expect(looksLikePhone("hello world")).toBe(false);
  });

  it("rejects email addresses", () => {
    expect(looksLikePhone("user@example.com")).toBe(false);
  });

  it("rejects too-short strings", () => {
    expect(looksLikePhone("12345")).toBe(false);
  });
});

describe("looksLikeEmail", () => {
  it("matches standard email", () => {
    expect(looksLikeEmail("user@example.com")).toBe(true);
  });

  it("matches email with subdomain", () => {
    expect(looksLikeEmail("user@mail.example.com")).toBe(true);
  });

  it("handles surrounding whitespace", () => {
    expect(looksLikeEmail("  user@example.com  ")).toBe(true);
  });

  it("rejects phone numbers", () => {
    expect(looksLikeEmail("+12125551234")).toBe(false);
  });

  it("rejects plain text", () => {
    expect(looksLikeEmail("hello world")).toBe(false);
  });

  it("rejects missing domain part", () => {
    expect(looksLikeEmail("user@")).toBe(false);
  });

  it("rejects missing local part", () => {
    expect(looksLikeEmail("@example.com")).toBe(false);
  });
});
