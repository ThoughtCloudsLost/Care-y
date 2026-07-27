import { describe, it, expect } from "vitest";
import { sanitizeLike, maskPhone, formatPhone } from "./sql.js";

describe("sanitizeLike", () => {
  it("escapes percent wildcard", () => {
    expect(sanitizeLike("100%")).toBe("100\\%");
  });

  it("escapes underscore wildcard", () => {
    expect(sanitizeLike("user_name")).toBe("user\\_name");
  });

  it("escapes backslash", () => {
    expect(sanitizeLike("path\\file")).toBe("path\\\\file");
  });

  it("escapes all special chars in one string", () => {
    expect(sanitizeLike("50% off_sale\\promo")).toBe(
      "50\\% off\\_sale\\\\promo",
    );
  });

  it("passes through plain alphanumeric input", () => {
    expect(sanitizeLike("calm-pebble-7")).toBe("calm-pebble-7");
  });

  it("passes through empty string", () => {
    expect(sanitizeLike("")).toBe("");
  });

  it("handles multiple consecutive wildcards", () => {
    expect(sanitizeLike("%%__\\\\")).toBe("\\%\\%\\_\\_\\\\\\\\");
  });
});

describe("maskPhone", () => {
  it("returns ***NNNN for a standard phone number", () => {
    const buf = Buffer.from("+15551234567");
    expect(maskPhone(buf)).toBe("***4567");
  });

  it("zeros the buffer after extraction", () => {
    const buf = Buffer.from("+15559876543");
    maskPhone(buf);
    expect(buf.every((b) => b === 0)).toBe(true);
  });

  it("handles short input (fewer than 4 chars)", () => {
    const buf = Buffer.from("AB");
    expect(maskPhone(buf)).toBe("***AB");
    expect(buf.every((b) => b === 0)).toBe(true);
  });

  it("handles empty buffer", () => {
    const buf = Buffer.alloc(0);
    expect(maskPhone(buf)).toBe("***");
  });

  it("zeros buffer even if slice throws (defensive check)", () => {
    const buf = Buffer.from("+15550001111");
    const result = maskPhone(buf);
    expect(result).toBe("***1111");
    expect(buf.every((b) => b === 0)).toBe(true);
  });
});

describe("formatPhone", () => {
  it("formats US +1 numbers as +1 (AAA) BBB-CCCC", () => {
    const buf = Buffer.from("+15550001234");
    expect(formatPhone(buf)).toBe("+1 (555) 000-1234");
  });

  it("zeros the buffer after formatting", () => {
    const buf = Buffer.from("+15559876543");
    formatPhone(buf);
    expect(buf.every((b) => b === 0)).toBe(true);
  });

  it("returns raw E.164 for non-US numbers", () => {
    const buf = Buffer.from("+447911123456");
    expect(formatPhone(buf)).toBe("+447911123456");
    expect(buf.every((b) => b === 0)).toBe(true);
  });

  it("returns raw E.164 for +1 numbers with unexpected length", () => {
    const buf = Buffer.from("+155500012345");
    expect(formatPhone(buf)).toBe("+155500012345");
  });

  it("handles empty buffer", () => {
    const buf = Buffer.alloc(0);
    expect(formatPhone(buf)).toBe("");
    expect(buf.every((b) => b === 0)).toBe(true);
  });
});
