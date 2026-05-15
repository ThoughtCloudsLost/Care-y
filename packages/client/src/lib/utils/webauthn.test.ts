import { describe, it, expect } from "vitest";
import { base64urlToBuffer, bufferToBase64url } from "./webauthn.js";

describe("base64urlToBuffer / bufferToBase64url", () => {
  it("roundtrips an empty buffer", () => {
    const original = new ArrayBuffer(0);
    const encoded = bufferToBase64url(original);
    expect(encoded).toBe("");
    const decoded = base64urlToBuffer(encoded);
    expect(new Uint8Array(decoded)).toEqual(new Uint8Array(original));
  });

  it("roundtrips a known byte sequence", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    const encoded = bufferToBase64url(bytes.buffer);
    const decoded = base64urlToBuffer(encoded);
    expect(new Uint8Array(decoded)).toEqual(bytes);
  });

  it("roundtrips bytes spanning the full 0-255 range", () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) original[i] = i;
    const encoded = bufferToBase64url(original.buffer);
    const decoded = base64urlToBuffer(encoded);
    expect(new Uint8Array(decoded)).toEqual(original);
  });

  it("produces URL-safe characters (no +, /, or =)", () => {
    // Bytes that produce + and / in standard base64
    const bytes = new Uint8Array([251, 239, 190]);
    const encoded = bufferToBase64url(bytes.buffer);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("decodes a known base64url string correctly", () => {
    // "Hello" in base64url = "SGVsbG8"
    const decoded = base64urlToBuffer("SGVsbG8");
    const text = String.fromCharCode(...new Uint8Array(decoded));
    expect(text).toBe("Hello");
  });

  it("handles padding-free base64url input", () => {
    // base64url omits trailing = padding
    // "ab" in base64 = "YWI=" -> base64url = "YWI"
    const decoded = base64urlToBuffer("YWI");
    const text = String.fromCharCode(...new Uint8Array(decoded));
    expect(text).toBe("ab");
  });

  it("roundtrips a WebAuthn-sized credential ID (32 bytes)", () => {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) bytes[i] = i * 8;
    const encoded = bufferToBase64url(bytes.buffer);
    const decoded = base64urlToBuffer(encoded);
    expect(new Uint8Array(decoded)).toEqual(bytes);
  });
});
