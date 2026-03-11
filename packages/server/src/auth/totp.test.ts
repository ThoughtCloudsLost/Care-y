/**
 * Unit tests for TOTP (Time-Based One-Time Password) implementation.
 *
 * Covers: base32 encoding/decoding, secret generation, otpauth URI format,
 * TOTP code verification including clock-drift window, and RFC 6238 test vectors.
 *
 * Pure unit tests: no DB or Docker required.
 */

import { describe, it, expect } from "vitest";
import {
  generateTotpSecret,
  base32Encode,
  base32Decode,
  getTotpUri,
  verifyTotpCode,
} from "./totp.js";

// RFC 6238 test secret: ASCII "12345678901234567890" (20 bytes)
const RFC_SECRET = Buffer.from("12345678901234567890", "ascii");

describe("TOTP", () => {
  // --- base32 ---

  describe("base32Encode", () => {
    it("encodes empty buffer to empty string", () => {
      expect(base32Encode(Buffer.alloc(0))).toBe("");
    });

    it("encodes known value (RFC 4648 test vector)", () => {
      // "f" -> "MY", "fo" -> "MZXQ", "foo" -> "MZXW6", "foob" -> "MZXW6YQ", "fooba" -> "MZXW6YTB", "foobar" -> "MZXW6YTBOI"
      expect(base32Encode(Buffer.from("f"))).toBe("MY");
      expect(base32Encode(Buffer.from("fo"))).toBe("MZXQ");
      expect(base32Encode(Buffer.from("foo"))).toBe("MZXW6");
      expect(base32Encode(Buffer.from("foobar"))).toBe("MZXW6YTBOI");
    });

    it("encodes 20-byte TOTP secret to 32-character base32", () => {
      const result = base32Encode(RFC_SECRET);
      expect(result).toMatch(/^[A-Z2-7]+$/);
      // 20 bytes * 8 bits = 160 bits, 160/5 = 32 base32 chars
      expect(result).toHaveLength(32);
    });
  });

  describe("base32Decode", () => {
    it("decodes empty string to empty buffer", () => {
      expect(base32Decode("")).toEqual(Buffer.alloc(0));
    });

    it("decodes known RFC 4648 test vectors", () => {
      expect(base32Decode("MY").toString("ascii")).toBe("f");
      expect(base32Decode("MZXQ").toString("ascii")).toBe("fo");
      expect(base32Decode("MZXW6YTBOI").toString("ascii")).toBe("foobar");
    });

    it("is case-insensitive", () => {
      expect(base32Decode("mzxw6ytboi")).toEqual(base32Decode("MZXW6YTBOI"));
    });

    it("strips trailing padding", () => {
      expect(base32Decode("MY======")).toEqual(base32Decode("MY"));
    });

    it("skips invalid characters", () => {
      // '8', '9', '0', '1' are not in base32 alphabet (only 2-7)
      // But '0' and '1' would just be skipped, not crash
      expect(base32Decode("MY")).toEqual(base32Decode("M!Y"));
    });
  });

  describe("base32 roundtrip", () => {
    it("roundtrips 20-byte secret", () => {
      const secret = generateTotpSecret();
      const encoded = base32Encode(secret);
      const decoded = base32Decode(encoded);
      expect(decoded).toEqual(secret);
    });

    it("roundtrips RFC test secret", () => {
      const encoded = base32Encode(RFC_SECRET);
      const decoded = base32Decode(encoded);
      expect(decoded).toEqual(RFC_SECRET);
    });
  });

  // --- generateTotpSecret ---

  describe("generateTotpSecret", () => {
    it("returns a 20-byte Buffer", () => {
      const secret = generateTotpSecret();
      expect(Buffer.isBuffer(secret)).toBe(true);
      expect(secret).toHaveLength(20);
    });

    it("generates distinct secrets on consecutive calls", () => {
      const a = generateTotpSecret();
      const b = generateTotpSecret();
      expect(a.equals(b)).toBe(false);
    });
  });

  // --- getTotpUri ---

  describe("getTotpUri", () => {
    it("returns a valid otpauth URI", () => {
      const uri = getTotpUri(RFC_SECRET, "CARE-Y");
      expect(uri).toMatch(/^otpauth:\/\/totp\//);
      expect(uri).toContain("secret=");
      expect(uri).toContain("issuer=CARE-Y");
      expect(uri).toContain("algorithm=SHA1");
      expect(uri).toContain("digits=6");
      expect(uri).toContain("period=30");
    });

    it("encodes issuer with special characters", () => {
      const uri = getTotpUri(RFC_SECRET, "Test & Co.");
      expect(uri).toContain(encodeURIComponent("Test & Co."));
      expect(uri).not.toContain("Test & Co.");
    });
  });

  // --- verifyTotpCode (RFC 6238 test vectors) ---

  describe("verifyTotpCode", () => {
    // RFC 6238 Appendix B test vectors for SHA1
    // Secret = "12345678901234567890" (ASCII), 6 digits, 30s period
    const vectors = [
      { time: 59, expected: "287082" },
      { time: 1111111109, expected: "081804" },
      { time: 1234567890, expected: "005924" },
      { time: 2000000000, expected: "279037" },
    ];

    for (const { time, expected } of vectors) {
      it(`produces ${expected} at T=${String(time)}s`, () => {
        const nowMs = time * 1000;
        const result = verifyTotpCode(RFC_SECRET, expected, 0, nowMs);
        expect(result).toBe(true);
      });
    }

    it("rejects wrong code at exact time step", () => {
      const nowMs = 59 * 1000;
      expect(verifyTotpCode(RFC_SECRET, "000000", 0, nowMs)).toBe(false);
    });

    it("accepts code within default window (1 step)", () => {
      // At T=59s the counter is 1. The code for counter 0 should be accepted
      // with window=1 (default).
      const codeAtCounter0 = "287082"; // This IS the code at T=59 (counter 1)
      // Use T=89 (counter 2). Code for counter 1 should be accepted.
      const nowMs = 89 * 1000; // counter = floor(89/30) = 2
      // verifyTotpCode with window=1 checks counters 1, 2, 3
      expect(verifyTotpCode(RFC_SECRET, codeAtCounter0, 1, nowMs)).toBe(true);
    });

    it("rejects code outside window", () => {
      // Code at T=59 (counter 1), verify at T=150 (counter 5), window=1
      const codeAtCounter1 = "287082";
      const nowMs = 150 * 1000;
      expect(verifyTotpCode(RFC_SECRET, codeAtCounter1, 1, nowMs)).toBe(false);
    });

    it("rejects code with wrong length", () => {
      expect(verifyTotpCode(RFC_SECRET, "12345", 0, 59_000)).toBe(false);
      expect(verifyTotpCode(RFC_SECRET, "1234567", 0, 59_000)).toBe(false);
    });

    it("rejects empty string", () => {
      expect(verifyTotpCode(RFC_SECRET, "", 0, 59_000)).toBe(false);
    });
  });
});
