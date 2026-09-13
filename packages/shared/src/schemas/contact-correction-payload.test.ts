import { describe, it, expect } from "vitest";
import {
  contactCorrectionPayloadSchema,
  serializeContactCorrection,
  parseContactCorrection,
} from "./contact-correction-payload.js";

describe("contactCorrectionPayloadSchema", () => {
  it("accepts phone only", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 1,
      phone: "+15551234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts email only", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 1,
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts both phone and email", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 1,
      phone: "+15551234567",
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when neither phone nor email is present", () => {
    const result = contactCorrectionPayloadSchema.safeParse({ v: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects wrong version", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 2,
      phone: "+15551234567",
    });
    expect(result.success).toBe(false);
  });

  it("trims phone whitespace", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 1,
      phone: "  +15551234567  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+15551234567");
    }
  });

  it("rejects phone exceeding 32 characters", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 1,
      phone: "+1" + "0".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 1,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty phone string (after trim)", () => {
    const result = contactCorrectionPayloadSchema.safeParse({
      v: 1,
      phone: "   ",
    });
    expect(result.success).toBe(false);
  });
});

describe("serializeContactCorrection", () => {
  it("produces valid JSON containing the payload", () => {
    const payload = { v: 1, phone: "+15551234567" } as const;
    const json = serializeContactCorrection(payload);
    expect(JSON.parse(json)).toEqual(payload);
  });

  it("round-trips with parseContactCorrection", () => {
    const payload = {
      v: 1,
      phone: "+15551234567",
      email: "user@example.com",
    } as const;
    const json = serializeContactCorrection(payload);
    const parsed = parseContactCorrection(json);
    expect(parsed).toEqual(payload);
  });
});

describe("parseContactCorrection", () => {
  it("returns null for legacy prose content", () => {
    const result = parseContactCorrection(
      "Contact correction request. New phone number: +15551234567",
    );
    expect(result).toBeNull();
  });

  it("returns null for non-JSON content", () => {
    expect(parseContactCorrection("hello world")).toBeNull();
  });

  it("returns null for valid JSON with wrong shape", () => {
    expect(parseContactCorrection('{"foo":"bar"}')).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseContactCorrection("")).toBeNull();
  });

  it("parses a valid v1 payload", () => {
    const json = JSON.stringify({ v: 1, phone: "+15551234567" });
    const result = parseContactCorrection(json);
    expect(result).toEqual({ v: 1, phone: "+15551234567" });
  });

  it("parses a v1 payload with email only", () => {
    const json = JSON.stringify({ v: 1, email: "user@example.com" });
    const result = parseContactCorrection(json);
    expect(result).toEqual({ v: 1, email: "user@example.com" });
  });
});
