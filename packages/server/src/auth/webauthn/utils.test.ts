import { describe, it, expect } from "vitest";
import {
  toBuffer,
  parseBuffer,
  isBase64url,
  toBase64url,
  parseBase64url,
  sha256,
  bufferToHex,
  concatenateBuffers,
} from "./utils.js";

describe("WebAuthn utils", () => {
  describe("toBuffer / parseBuffer", () => {
    it("roundtrips ASCII strings", () => {
      const input = "hello world";
      expect(parseBuffer(toBuffer(input))).toBe(input);
    });

    it("roundtrips empty string", () => {
      expect(parseBuffer(toBuffer(""))).toBe("");
    });

    it("roundtrips single character", () => {
      expect(parseBuffer(toBuffer("x"))).toBe("x");
    });

    it("handles Latin-1 codepoints (0-255)", () => {
      const latin1 = String.fromCharCode(0, 127, 255);
      expect(parseBuffer(toBuffer(latin1))).toBe(latin1);
    });
  });

  describe("isBase64url", () => {
    it("accepts valid base64url without padding", () => {
      expect(isBase64url("SGVsbG8")).toBe(true);
    });

    it("accepts valid base64url with padding", () => {
      expect(isBase64url("SGVsbG8=")).toBe(true);
    });

    it("accepts URL-safe characters (- and _)", () => {
      expect(isBase64url("abc-def_ghi")).toBe(true);
    });

    it("rejects strings with + (standard base64, not URL-safe)", () => {
      expect(isBase64url("abc+def")).toBe(false);
    });

    it("rejects strings with / (standard base64, not URL-safe)", () => {
      expect(isBase64url("abc/def")).toBe(false);
    });

    it("rejects strings with spaces", () => {
      expect(isBase64url("abc def")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isBase64url("")).toBe(false);
    });
  });

  describe("toBase64url / parseBase64url", () => {
    it("roundtrips arbitrary bytes", () => {
      const bytes = new Uint8Array([0, 1, 127, 128, 255]);
      const encoded = toBase64url(bytes);
      const decoded = new Uint8Array(parseBase64url(encoded));
      expect(decoded).toEqual(bytes);
    });

    it("roundtrips empty ArrayBuffer", () => {
      const empty = new ArrayBuffer(0);
      const encoded = toBase64url(empty);
      const decoded = parseBase64url(encoded);
      expect(decoded.byteLength).toBe(0);
    });

    it("produces URL-safe characters (no +, /, or =)", () => {
      // 0xFB, 0xFF, 0xFE would produce +, /, = in standard base64
      const bytes = new Uint8Array([0xfb, 0xff, 0xfe]);
      const encoded = toBase64url(bytes);
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
    });

    it("accepts Uint8Array with non-zero byteOffset", () => {
      const backing = new ArrayBuffer(8);
      const view = new Uint8Array(backing);
      view.set([0, 0, 0, 42, 43, 44]);
      const slice = new Uint8Array(backing, 3, 3); // [42, 43, 44]
      const encoded = toBase64url(slice);
      const decoded = new Uint8Array(parseBase64url(encoded));
      expect(decoded).toEqual(new Uint8Array([42, 43, 44]));
    });

    it("handles 18-byte challenge-sized input", () => {
      const bytes = new Uint8Array(18);
      crypto.getRandomValues(bytes);
      const encoded = toBase64url(bytes);
      const decoded = new Uint8Array(parseBase64url(encoded));
      expect(decoded).toEqual(bytes);
    });
  });

  describe("sha256", () => {
    it("produces 32-byte output", async () => {
      const result = await sha256(new Uint8Array([1, 2, 3]));
      expect(result.byteLength).toBe(32);
    });

    it("produces known hash for empty input", async () => {
      // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      const result = await sha256(new ArrayBuffer(0));
      expect(bufferToHex(result)).toBe(
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      );
    });

    it("is deterministic", async () => {
      const input = new Uint8Array([10, 20, 30]);
      const hash1 = bufferToHex(await sha256(input));
      const hash2 = bufferToHex(await sha256(input));
      expect(hash1).toBe(hash2);
    });

    it("accepts ArrayBuffer input", async () => {
      const buf = new ArrayBuffer(4);
      new Uint8Array(buf).set([1, 2, 3, 4]);
      const result = await sha256(buf);
      expect(result.byteLength).toBe(32);
    });
  });

  describe("bufferToHex", () => {
    it("converts bytes to lowercase hex", () => {
      const bytes = new Uint8Array([0x0a, 0xff, 0x00]).buffer;
      expect(bufferToHex(bytes)).toBe("0aff00");
    });

    it("handles empty buffer", () => {
      expect(bufferToHex(new ArrayBuffer(0))).toBe("");
    });

    it("pads single-digit hex values with leading zero", () => {
      const bytes = new Uint8Array([0, 1, 2]).buffer;
      expect(bufferToHex(bytes)).toBe("000102");
    });
  });

  describe("concatenateBuffers", () => {
    it("concatenates two non-empty buffers", () => {
      const a = new Uint8Array([1, 2]).buffer;
      const b = new Uint8Array([3, 4, 5]).buffer;
      const result = concatenateBuffers(a, b);
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    it("handles empty first buffer", () => {
      const a = new ArrayBuffer(0);
      const b = new Uint8Array([1]).buffer;
      const result = concatenateBuffers(a, b);
      expect(result).toEqual(new Uint8Array([1]));
    });

    it("handles empty second buffer", () => {
      const a = new Uint8Array([1]).buffer;
      const b = new ArrayBuffer(0);
      const result = concatenateBuffers(a, b);
      expect(result).toEqual(new Uint8Array([1]));
    });

    it("handles both buffers empty", () => {
      const result = concatenateBuffers(new ArrayBuffer(0), new ArrayBuffer(0));
      expect(result).toEqual(new Uint8Array([]));
      expect(result.byteLength).toBe(0);
    });
  });
});
