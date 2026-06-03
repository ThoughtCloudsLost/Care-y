// @vitest-environment jsdom
/**
 * 2FA enrollment utilities tests.
 *
 * Tests the WebAuthn base64url helpers used by both 2FA enrollment
 * and verification. Component-level tests for the enrollment sheets
 * are covered by Playwright E2E tests (login -> settings -> 2FA).
 */

import { describe, it, expect } from "vitest";
import { base64urlToBuffer, bufferToBase64url } from "$lib/utils/webauthn.js";

describe("WebAuthn base64url utils", () => {
  it("roundtrips through base64urlToBuffer and bufferToBase64url", () => {
    const original = "SGVsbG8gV29ybGQ";
    const buffer = base64urlToBuffer(original);
    const result = bufferToBase64url(buffer);
    expect(result).toBe(original);
  });

  it("handles URL-safe characters correctly", () => {
    const testBytes = new Uint8Array([255, 239, 190]);
    const encoded = bufferToBase64url(testBytes.buffer);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");

    const decoded = new Uint8Array(base64urlToBuffer(encoded));
    expect(decoded).toEqual(testBytes);
  });

  it("handles empty buffer", () => {
    const empty = new Uint8Array(0);
    const encoded = bufferToBase64url(empty.buffer);
    expect(encoded).toBe("");

    const decoded = new Uint8Array(base64urlToBuffer(""));
    expect(decoded.length).toBe(0);
  });

  it("decodes known base64url value correctly", () => {
    // "Hello World" in base64url = "SGVsbG8gV29ybGQ"
    const decoded = new Uint8Array(base64urlToBuffer("SGVsbG8gV29ybGQ"));
    const text = new TextDecoder().decode(decoded);
    expect(text).toBe("Hello World");
  });

  it("handles values with padding correctly", () => {
    // Input that would need padding: "A" -> base64url "QQ"
    const bytes = new Uint8Array([65]);
    const encoded = bufferToBase64url(bytes.buffer);
    const decoded = new Uint8Array(base64urlToBuffer(encoded));
    expect(decoded[0]).toBe(65);
  });
});
