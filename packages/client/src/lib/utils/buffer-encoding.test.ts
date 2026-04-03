import { describe, it, expect } from "vitest";
import { serializedBufferToBase64 } from "./buffer-encoding.js";

describe("serializedBufferToBase64", () => {
  it("converts a serialized Buffer object to URL-safe base64", () => {
    // "Hello" in bytes: [72, 101, 108, 108, 111]
    const buf = { type: "Buffer" as const, data: [72, 101, 108, 108, 111] };
    expect(serializedBufferToBase64(buf)).toBe("SGVsbG8");
  });

  it("returns a string input unchanged", () => {
    const b64 = "already-url-safe_base64";
    expect(serializedBufferToBase64(b64)).toBe(b64);
  });

  it("handles an empty Buffer", () => {
    const buf = { type: "Buffer" as const, data: [] as number[] };
    expect(serializedBufferToBase64(buf)).toBe("");
  });

  it("handles binary data with high byte values", () => {
    const buf = { type: "Buffer" as const, data: [0, 128, 255] };
    const result = serializedBufferToBase64(buf);
    // URL-safe base64: no +, /, or = characters
    expect(result).not.toMatch(/[+/=]/);
  });

  it("never produces standard base64 characters (+, /, =)", () => {
    // Bytes that produce +, /, and = in standard base64:
    // 0xFB -> standard base64 contains "+"
    // 0xFF -> standard base64 contains "/"
    // Padding "=" appears when input length is not a multiple of 3
    const buf = { type: "Buffer" as const, data: [0xfb, 0xff, 0xfe] };
    const result = serializedBufferToBase64(buf);
    expect(result).not.toContain("+");
    expect(result).not.toContain("/");
    expect(result).not.toContain("=");
  });

  it("produces output compatible with @care-y/crypto decode()", () => {
    // This test catches the regression where btoa() standard base64
    // was passed to the crypto Worker's decode() which expects URL-safe.
    // Bytes [62, 63] encode to "+/" in standard base64 but "-_" in URL-safe.
    const buf = { type: "Buffer" as const, data: [62, 63] };
    const result = serializedBufferToBase64(buf);
    expect(result).toBe("Pj8"); // URL-safe encoding of [62, 63]
    expect(result).not.toBe("Pj8="); // No padding
  });
});
