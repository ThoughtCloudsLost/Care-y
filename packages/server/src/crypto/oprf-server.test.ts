import { describe, it, expect, beforeAll } from "vitest";
import {
  getSodium,
  lagrangeInterpolate,
  deriveTaggedShare,
  oprfBlind,
  oprfFinalize,
  type SodiumBackend,
  type RistrettoPoint,
  type EvaluatedElement,
} from "@care-y/crypto";
import { blindEvaluate, taggedBlindEvaluate } from "./oprf-server.js";
import { CryptoError } from "../errors.js";

let sodium: SodiumBackend;

beforeAll(async () => {
  sodium = await getSodium();
});

/**
 * Generate 2-of-2 Shamir shares of a ristretto255 scalar.
 * Polynomial f(x) = k + a*x where k is the secret, a is random.
 * shareA = f(1) = k + a, shareB = f(2) = k + 2a
 */
function shamirSplit(key: Uint8Array): {
  shareA: Uint8Array;
  shareB: Uint8Array;
} {
  const a = sodium.crypto_core_ristretto255_scalar_random();

  // shareA = k + a
  const shareA = sodium.crypto_core_ristretto255_scalar_add(key, a);

  // shareB = k + 2a
  const twoA = sodium.crypto_core_ristretto255_scalar_add(a, a);
  const shareB = sodium.crypto_core_ristretto255_scalar_add(key, twoA);

  return { shareA, shareB };
}

describe("blindEvaluate", () => {
  it("returns a valid 32-byte ristretto255 point", () => {
    const share = sodium.crypto_core_ristretto255_scalar_random();
    const point = sodium.crypto_scalarmult_ristretto255_base(share);

    const result = blindEvaluate(share, point);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
  });

  it("produces the same result for identical inputs", () => {
    const share = sodium.crypto_core_ristretto255_scalar_random();
    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const result1 = blindEvaluate(share, point);
    const result2 = blindEvaluate(share, point);

    expect(result1).toEqual(result2);
  });

  it("produces different results for different shares", () => {
    const shareA = sodium.crypto_core_ristretto255_scalar_random();
    const shareB = sodium.crypto_core_ristretto255_scalar_random();
    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const resultA = blindEvaluate(shareA, point);
    const resultB = blindEvaluate(shareB, point);

    expect(resultA).not.toEqual(resultB);
  });

  it("produces different results for different blinded elements", () => {
    const share = sodium.crypto_core_ristretto255_scalar_random();
    const pointA = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );
    const pointB = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const resultA = blindEvaluate(share, pointA);
    const resultB = blindEvaluate(share, pointB);

    expect(resultA).not.toEqual(resultB);
  });

  describe("threshold parity", () => {
    it("split-key evaluation matches single-key evaluation", () => {
      const fullKey = sodium.crypto_core_ristretto255_scalar_random();
      const { shareA, shareB } = shamirSplit(fullKey);

      const input = new TextEncoder().encode("threshold-parity-test");
      const { blindedElement, blindState } = oprfBlind(input);

      // Single-key evaluation
      const fullEval = blindEvaluate(fullKey, blindedElement);

      // Threshold evaluation via two shares
      const partialA = blindEvaluate(shareA, blindedElement);
      const partialB = blindEvaluate(shareB, blindedElement);
      const combined = lagrangeInterpolate(
        partialA as RistrettoPoint,
        partialB as RistrettoPoint,
      );

      expect(combined).toEqual(fullEval);

      // Finalize produces identical output from both paths
      const outputFull = oprfFinalize(
        blindState,
        fullEval as EvaluatedElement,
        input,
      );
      const outputThreshold = oprfFinalize(
        blindState,
        combined as EvaluatedElement,
        input,
      );
      expect(outputThreshold).toEqual(outputFull);
    });

    it("holds across multiple random keys", () => {
      for (let i = 0; i < 5; i++) {
        const fullKey = sodium.crypto_core_ristretto255_scalar_random();
        const { shareA, shareB } = shamirSplit(fullKey);

        const input = new TextEncoder().encode(`iteration-${String(i)}`);
        const { blindedElement } = oprfBlind(input);

        const fullEval = blindEvaluate(fullKey, blindedElement);
        const partialA = blindEvaluate(shareA, blindedElement);
        const partialB = blindEvaluate(shareB, blindedElement);
        const combined = lagrangeInterpolate(
          partialA as RistrettoPoint,
          partialB as RistrettoPoint,
        );

        expect(combined).toEqual(fullEval);
      }
    });
  });

  describe("input validation", () => {
    it("rejects share shorter than 32 bytes", () => {
      const shortShare = new Uint8Array(16);
      const point = sodium.crypto_scalarmult_ristretto255_base(
        sodium.crypto_core_ristretto255_scalar_random(),
      );

      expect(() => blindEvaluate(shortShare, point)).toThrow(CryptoError);
    });

    it("rejects share longer than 32 bytes", () => {
      const longShare = new Uint8Array(64);
      const point = sodium.crypto_scalarmult_ristretto255_base(
        sodium.crypto_core_ristretto255_scalar_random(),
      );

      expect(() => blindEvaluate(longShare, point)).toThrow(CryptoError);
    });

    it("rejects blinded element shorter than 32 bytes", () => {
      const share = sodium.crypto_core_ristretto255_scalar_random();
      const shortPoint = new Uint8Array(16);

      expect(() => blindEvaluate(share, shortPoint)).toThrow(CryptoError);
    });

    it("rejects blinded element longer than 32 bytes", () => {
      const share = sodium.crypto_core_ristretto255_scalar_random();
      const longPoint = new Uint8Array(64);

      expect(() => blindEvaluate(share, longPoint)).toThrow(CryptoError);
    });

    it("rejects empty share", () => {
      const emptyShare = new Uint8Array(0);
      const point = sodium.crypto_scalarmult_ristretto255_base(
        sodium.crypto_core_ristretto255_scalar_random(),
      );

      expect(() => blindEvaluate(emptyShare, point)).toThrow(CryptoError);
    });

    it("rejects empty blinded element", () => {
      const share = sodium.crypto_core_ristretto255_scalar_random();
      const emptyPoint = new Uint8Array(0);

      expect(() => blindEvaluate(share, emptyPoint)).toThrow(CryptoError);
    });

    it("includes actual length in error message for wrong share length", () => {
      const badShare = new Uint8Array(20);
      const point = sodium.crypto_scalarmult_ristretto255_base(
        sodium.crypto_core_ristretto255_scalar_random(),
      );

      expect(() => blindEvaluate(badShare, point)).toThrow(/got 20/);
    });

    it("includes actual length in error message for wrong point length", () => {
      const share = sodium.crypto_core_ristretto255_scalar_random();
      const badPoint = new Uint8Array(48);

      expect(() => blindEvaluate(share, badPoint)).toThrow(/got 48/);
    });
  });
});

describe("taggedBlindEvaluate", () => {
  it("returns a valid 32-byte ristretto255 point", () => {
    const masterShare = sodium.crypto_core_ristretto255_scalar_random();
    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const result = taggedBlindEvaluate(
      masterShare,
      "volunteer:test-user",
      point,
    );

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
  });

  it("produces different results for different tags", () => {
    const masterShare = sodium.crypto_core_ristretto255_scalar_random();
    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const resultA = taggedBlindEvaluate(masterShare, "volunteer:user-a", point);
    const resultB = taggedBlindEvaluate(masterShare, "volunteer:user-b", point);

    expect(resultA).not.toEqual(resultB);
  });

  it("produces the same result for the same tag and inputs", () => {
    const masterShare = sodium.crypto_core_ristretto255_scalar_random();
    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const result1 = taggedBlindEvaluate(masterShare, "account:acct-1", point);
    const result2 = taggedBlindEvaluate(masterShare, "account:acct-1", point);

    expect(result1).toEqual(result2);
  });

  it("equals blindEvaluate with the derived scalar", () => {
    const masterShare = sodium.crypto_core_ristretto255_scalar_random();
    const tag = "volunteer:direct-compare";
    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const taggedResult = taggedBlindEvaluate(masterShare, tag, point);

    // Reproduce the derivation manually
    const derivedScalar = deriveTaggedShare(masterShare, tag);
    const directResult = blindEvaluate(derivedScalar, point);

    expect(taggedResult).toEqual(directResult);
  });

  describe("threshold parity with tagged shares", () => {
    it("two tagged partials combined equals scalarmult by the combined tagged key", () => {
      const fullKey = sodium.crypto_core_ristretto255_scalar_random();
      const { shareA, shareB } = shamirSplit(fullKey);
      const tag = "volunteer:threshold-tagged-test";

      const input = new TextEncoder().encode("tagged-threshold-parity");
      const { blindedElement, blindState } = oprfBlind(input);

      // Tagged partials from each share
      const partialA = taggedBlindEvaluate(shareA, tag, blindedElement);
      const partialB = taggedBlindEvaluate(shareB, tag, blindedElement);

      // Combine via Lagrange interpolation
      const combined = lagrangeInterpolate(
        partialA as RistrettoPoint,
        partialB as RistrettoPoint,
      );

      // The combined tagged key is defined by the Lagrange combination
      // of the tagged shares (2*kA(tag) - kB(tag)), NOT by tagging the
      // full key: HKDF is nonlinear, so deriveTaggedShare(fullKey, tag)
      // is a different scalar by design (ADR-091). Compute the true
      // combined scalar and use it as the single-key reference.
      const kATagged = deriveTaggedShare(shareA, tag);
      const kBTagged = deriveTaggedShare(shareB, tag);
      const twoKA = sodium.crypto_core_ristretto255_scalar_add(
        kATagged,
        kATagged,
      );
      const combinedTaggedKey = sodium.crypto_core_ristretto255_scalar_sub(
        twoKA,
        kBTagged,
      );
      const directResult = blindEvaluate(combinedTaggedKey, blindedElement);

      // Threshold tagged evaluation matches single-key tagged evaluation
      expect(combined).toEqual(directResult);

      // Finalize produces identical output from both paths
      const outputThreshold = oprfFinalize(
        blindState,
        combined as EvaluatedElement,
        input,
      );
      const outputDirect = oprfFinalize(
        blindState,
        directResult as EvaluatedElement,
        input,
      );
      expect(outputThreshold).toEqual(outputDirect);
      expect(outputThreshold.length).toBe(64);
    });

    it("different tags produce different OPRF outputs from the same key", () => {
      const fullKey = sodium.crypto_core_ristretto255_scalar_random();
      const { shareA, shareB } = shamirSplit(fullKey);

      const input = new TextEncoder().encode("tag-isolation-test");
      const { blindedElement } = oprfBlind(input);

      const partialA1 = taggedBlindEvaluate(
        shareA,
        "volunteer:user-1",
        blindedElement,
      );
      const partialB1 = taggedBlindEvaluate(
        shareB,
        "volunteer:user-1",
        blindedElement,
      );
      const combined1 = lagrangeInterpolate(
        partialA1 as RistrettoPoint,
        partialB1 as RistrettoPoint,
      );

      const partialA2 = taggedBlindEvaluate(
        shareA,
        "volunteer:user-2",
        blindedElement,
      );
      const partialB2 = taggedBlindEvaluate(
        shareB,
        "volunteer:user-2",
        blindedElement,
      );
      const combined2 = lagrangeInterpolate(
        partialA2 as RistrettoPoint,
        partialB2 as RistrettoPoint,
      );

      expect(combined1).not.toEqual(combined2);
    });
  });

  describe("input validation", () => {
    it("rejects master share with wrong length", () => {
      const badShare = new Uint8Array(16);
      const point = sodium.crypto_scalarmult_ristretto255_base(
        sodium.crypto_core_ristretto255_scalar_random(),
      );

      expect(() =>
        taggedBlindEvaluate(badShare, "volunteer:test", point),
      ).toThrow(CryptoError);
    });

    it("rejects blinded element with wrong length", () => {
      const share = sodium.crypto_core_ristretto255_scalar_random();
      const badPoint = new Uint8Array(16);

      expect(() =>
        taggedBlindEvaluate(share, "volunteer:test", badPoint),
      ).toThrow(CryptoError);
    });
  });
});
