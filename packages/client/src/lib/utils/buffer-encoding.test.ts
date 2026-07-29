import { describe, it, expect } from "vitest";
import { uint8ArrayToBase64, base64ToUint8Array } from "./buffer-encoding.js";

describe("uint8ArrayToBase64 / base64ToUint8Array", () => {
  it("roundtrips an empty array", () => {
    const original = new Uint8Array([]);
    expect(base64ToUint8Array(uint8ArrayToBase64(original))).toEqual(original);
  });

  it("roundtrips a known byte sequence", () => {
    const original = new Uint8Array([72, 101, 108, 108, 111]);
    const encoded = uint8ArrayToBase64(original);
    expect(encoded).toBe(btoa("Hello"));
    expect(base64ToUint8Array(encoded)).toEqual(original);
  });

  it("roundtrips bytes spanning the full 0-255 range", () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) original[i] = i;
    expect(base64ToUint8Array(uint8ArrayToBase64(original))).toEqual(original);
  });

  it("encodes to standard base64 (not URL-safe)", () => {
    // Bytes that produce + and / in standard base64
    const bytes = new Uint8Array([251, 239, 190]);
    const result = uint8ArrayToBase64(bytes);
    expect(result).toBe(btoa(String.fromCharCode(251, 239, 190)));
  });
});
