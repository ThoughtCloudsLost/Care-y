import { describe, it, expect, vi } from "vitest";
import type * as CryptoPkg from "@care-y/crypto";

// vi.mock required: eciesEncrypt needs initialized libsodium (WASM via the
// getSodium() singleton), unavailable in the node test environment without
// the slow JS fallback. Stubs also make the sealed triple deterministic.
vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoPkg>()),
  eciesEncrypt: (_plaintext: Uint8Array, _pub: Uint8Array) => ({
    ephemeralPoint: new Uint8Array([10]),
    nonce: new Uint8Array([20]),
    ciphertext: new Uint8Array([30]),
  }),
  toRistrettoPoint: (b: Uint8Array) => b,
  decode: () => new Uint8Array([9]),
  encode: (b: Uint8Array) => `b64:${String(b[0] ?? "")}`,
}));

import { sealPortalCopy } from "./seal-portal-copy.js";

describe("sealPortalCopy", () => {
  it("returns a sealed triple when given a non-empty client public key", () => {
    const result = sealPortalCopy("client-pub-b64", "hello");

    expect(result).toEqual({
      ephemeralPoint: "b64:10",
      nonce: "b64:20",
      ciphertext: "b64:30",
    });
  });

  it("returns undefined when clientPublic is null", () => {
    expect(sealPortalCopy(null, "hello")).toBeUndefined();
  });

  it("returns undefined when clientPublic is an empty string", () => {
    expect(sealPortalCopy("", "hello")).toBeUndefined();
  });

  it("produces a triple with three non-empty string parts", () => {
    const result = sealPortalCopy("some-key", "test body");
    expect(result).toBeDefined();
    expect(result!.ephemeralPoint.length).toBeGreaterThan(0);
    expect(result!.nonce.length).toBeGreaterThan(0);
    expect(result!.ciphertext.length).toBeGreaterThan(0);
  });
});
