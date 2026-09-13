import { describe, it, expect, vi } from "vitest";

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM init.
// Provide encode/decode stubs that use standard base64url (no padding).
vi.mock("@care-y/crypto", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();

  function toBase64Url(buf: Uint8Array): string {
    const binary = String.fromCharCode(...buf);
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function fromBase64Url(s: string): Uint8Array {
    const padded = s.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buf[i] = binary.charCodeAt(i);
    }
    return buf;
  }

  return {
    ...original,
    encode: toBase64Url,
    decode: fromBase64Url,
  };
});

import {
  isPortalChannelDisabledError,
  splitContactEnvelope,
  parseContactJson,
} from "./portal-page-shared.js";
import { encode, decode } from "@care-y/crypto";

// ---------------------------------------------------------------------------
// isPortalChannelDisabledError
// ---------------------------------------------------------------------------

describe("isPortalChannelDisabledError", () => {
  it("returns true when message matches", () => {
    expect(
      isPortalChannelDisabledError({
        message: "PORTAL_CHANNEL_DISABLED",
      }),
    ).toBe(true);
  });

  it("returns true when data.code matches", () => {
    expect(
      isPortalChannelDisabledError({
        data: { code: "PORTAL_CHANNEL_DISABLED" },
      }),
    ).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isPortalChannelDisabledError({ message: "NOT_FOUND" })).toBe(false);
    expect(isPortalChannelDisabledError(null)).toBe(false);
    expect(isPortalChannelDisabledError(42)).toBe(false);
    expect(isPortalChannelDisabledError(undefined)).toBe(false);
    expect(isPortalChannelDisabledError({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// splitContactEnvelope roundtrip
// ---------------------------------------------------------------------------

describe("splitContactEnvelope", () => {
  it("splits a concatenated envelope into three base64url parts", () => {
    // Build a synthetic envelope: 32-byte ephemeralPoint, 24-byte nonce,
    // variable ciphertext.
    const ephemeralPoint = new Uint8Array(32).fill(0xaa);
    const nonce = new Uint8Array(24).fill(0xbb);
    const ciphertext = new Uint8Array([1, 2, 3, 4, 5]);

    const combined = new Uint8Array(32 + 24 + 5);
    combined.set(ephemeralPoint, 0);
    combined.set(nonce, 32);
    combined.set(ciphertext, 56);

    const sealedB64 = encode(combined);
    const parts = splitContactEnvelope(sealedB64);

    const epBytes = decode(parts.ephemeralPoint);
    const nonceBytes = decode(parts.nonce);
    const ctBytes = decode(parts.ciphertext);

    expect(epBytes.length).toBe(32);
    expect(nonceBytes.length).toBe(24);
    expect(ctBytes.length).toBe(5);

    expect(epBytes.every((b) => b === 0xaa)).toBe(true);
    expect(nonceBytes.every((b) => b === 0xbb)).toBe(true);
    expect([...ctBytes]).toEqual([1, 2, 3, 4, 5]);
  });

  it("handles minimal ciphertext (1 byte)", () => {
    const combined = new Uint8Array(32 + 24 + 1);
    combined.fill(0x11, 0, 32);
    combined.fill(0x22, 32, 56);
    combined[56] = 0xff;

    const sealedB64 = encode(combined);
    const parts = splitContactEnvelope(sealedB64);

    expect(decode(parts.ciphertext)).toEqual(new Uint8Array([0xff]));
  });
});

// ---------------------------------------------------------------------------
// parseContactJson
// ---------------------------------------------------------------------------

describe("parseContactJson", () => {
  it("extracts phone and email from valid JSON", () => {
    const result = parseContactJson(
      JSON.stringify({ phone: "555-1234", email: "a@b.com" }),
    );
    expect(result).toEqual({ phone: "555-1234", email: "a@b.com" });
  });

  it("returns only present string fields", () => {
    expect(parseContactJson(JSON.stringify({ phone: "555" }))).toEqual({
      phone: "555",
    });
    expect(parseContactJson(JSON.stringify({ email: "a@b" }))).toEqual({
      email: "a@b",
    });
    expect(parseContactJson(JSON.stringify({}))).toEqual({});
  });

  it("returns empty object for non-object JSON", () => {
    expect(parseContactJson("42")).toEqual({});
    expect(parseContactJson('"just a string"')).toEqual({});
    expect(parseContactJson("null")).toEqual({});
  });

  it("ignores non-string phone/email values", () => {
    expect(
      parseContactJson(JSON.stringify({ phone: 123, email: true })),
    ).toEqual({});
  });
});
