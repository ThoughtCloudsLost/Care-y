import { describe, it, expect } from "vitest";
import { serializedBufferToBase64 } from "./buffer-encoding.js";

describe("serializedBufferToBase64", () => {
  it("converts a serialized Buffer object to base64", () => {
    // "Hello" in bytes: [72, 101, 108, 108, 111]
    const buf = { type: "Buffer" as const, data: [72, 101, 108, 108, 111] };
    expect(serializedBufferToBase64(buf)).toBe(btoa("Hello"));
  });

  it("returns a string input unchanged", () => {
    const b64 = btoa("Already base64");
    expect(serializedBufferToBase64(b64)).toBe(b64);
  });

  it("handles an empty Buffer", () => {
    const buf = { type: "Buffer" as const, data: [] as number[] };
    expect(serializedBufferToBase64(buf)).toBe(btoa(""));
  });

  it("handles binary data with high byte values", () => {
    const buf = { type: "Buffer" as const, data: [0, 128, 255] };
    const result = serializedBufferToBase64(buf);
    // Decode back and verify bytes
    const decoded = atob(result);
    expect(decoded.charCodeAt(0)).toBe(0);
    expect(decoded.charCodeAt(1)).toBe(128);
    expect(decoded.charCodeAt(2)).toBe(255);
  });
});
