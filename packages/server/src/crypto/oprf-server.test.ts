import { describe, it, expect, beforeAll } from "vitest";
import {
  getSodium,
  lagrangeInterpolate,
  oprfBlind,
  oprfFinalize,
  type SodiumBackend,
  type RistrettoPoint,
  type EvaluatedElement,
} from "@care-y/crypto";
import { blindEvaluate } from "./oprf-server.js";
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
