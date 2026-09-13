import { describe, it, expect, beforeAll } from "vitest";
import { getSodium } from "@care-y/crypto";
import {
  makeRistrettoKeypair,
  decryptTripleB64,
} from "../portal/test-helpers/crypto.js";
import { sealPortalCopy } from "./seal-portal-copy.js";

beforeAll(async () => {
  await getSodium();
});

describe("sealPortalCopy", () => {
  it("seals text the holder of the client private key can decrypt", () => {
    const { publicB64, privateScalar } = makeRistrettoKeypair();
    const result = sealPortalCopy(publicB64, "hello portal");

    expect(result).toBeDefined();
    expect(decryptTripleB64(result!, privateScalar)).toBe("hello portal");
  });

  it("returns undefined when clientPublic is null", () => {
    expect(sealPortalCopy(null, "hello")).toBeUndefined();
  });

  it("returns undefined when clientPublic is an empty string", () => {
    expect(sealPortalCopy("", "hello")).toBeUndefined();
  });

  it("produces a triple with three non-empty string parts", () => {
    const { publicB64 } = makeRistrettoKeypair();
    const result = sealPortalCopy(publicB64, "test body");
    expect(result).toBeDefined();
    expect(result!.ephemeralPoint.length).toBeGreaterThan(0);
    expect(result!.nonce.length).toBeGreaterThan(0);
    expect(result!.ciphertext.length).toBeGreaterThan(0);
  });
});
