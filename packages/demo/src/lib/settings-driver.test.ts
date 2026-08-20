import { describe, it, expect } from "vitest";
import { extractCodeFromBody, computeTotpCode } from "./settings-driver.js";

describe("extractCodeFromBody", () => {
  it("extracts a 6-digit code from a typical email body", () => {
    expect(
      extractCodeFromBody("Your verification code is 482917. Do not share it."),
    ).toBe("482917");
  });

  it("extracts a code at the start of the body", () => {
    expect(extractCodeFromBody("123456")).toBe("123456");
  });

  it("returns null when no 6-digit code is present", () => {
    expect(extractCodeFromBody("Hello, no code here.")).toBeNull();
  });

  it("returns null for a 5-digit number", () => {
    expect(extractCodeFromBody("Code: 12345")).toBeNull();
  });

  it("returns null for a 7-digit number (no word boundary match)", () => {
    expect(extractCodeFromBody("Code: 1234567")).toBeNull();
  });

  it("extracts the first 6-digit code when multiple are present", () => {
    expect(extractCodeFromBody("Try 111111 or 222222")).toBe("111111");
  });

  it("returns null for empty body", () => {
    expect(extractCodeFromBody("")).toBeNull();
  });
});

describe("computeTotpCode", () => {
  it("returns a 6-digit string", () => {
    // Use a known base32 secret (20 bytes = 32 base32 chars)
    const secret = "JBSWY3DPEHPK3PXP";
    const code = computeTotpCode(secret);
    expect(code).toMatch(/^\d{6}$/);
  });

  it("returns consistent results for the same secret within the same time step", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const a = computeTotpCode(secret);
    const b = computeTotpCode(secret);
    expect(a).toBe(b);
  });
});
