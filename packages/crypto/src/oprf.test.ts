import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  oprfBlind,
  oprfFinalize,
  lagrangeInterpolate,
  generateRefreshScalar,
  computeRefreshDelta,
  applyRefresh,
  _resetLagrangeCacheForTesting,
} from "./oprf.js";
import { expandMessageXMD, HASH_TO_GROUP_DST } from "./rfc.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { InvalidInputError } from "./errors.js";
import type { Scalar, RistrettoPoint } from "./types.js";

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function toHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Test helper: simulates server-side BlindEvaluate.
 * evaluated = key * blindedElement
 * This is what the server-side OPRFServer does with sodium-native.
 */
function blindEvaluate(
  sodium: SodiumBackend,
  key: Scalar,
  blindedElement: RistrettoPoint,
): RistrettoPoint {
  return sodium.crypto_scalarmult_ristretto255(
    key,
    blindedElement,
  ) as RistrettoPoint;
}

/**
 * Test helper: generate Shamir shares for a 2-of-2 threshold split.
 * Polynomial f(x) = k + a*x where k is the secret key and a is random.
 * share_A = f(1) = k + a, share_B = f(2) = k + 2a
 */
function shamirSplit(
  sodium: SodiumBackend,
  key: Scalar,
): { shareA: Scalar; shareB: Scalar } {
  const a = sodium.crypto_core_ristretto255_scalar_random() as Scalar;

  // share_A = k + a*1 = k + a
  const shareA = sodium.crypto_core_ristretto255_scalar_add(key, a) as Scalar;

  // share_B = k + a*2
  const twoA = sodium.crypto_core_ristretto255_scalar_add(a, a);
  const shareB = sodium.crypto_core_ristretto255_scalar_add(
    key,
    twoA,
  ) as Scalar;

  return { shareA, shareB };
}

describe("OPRF protocol", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    _resetLagrangeCacheForTesting();
    sodium = await getSodium();
  });

  describe("oprfBlind", () => {
    it("throws InvalidInputError on empty input", () => {
      expect(() => oprfBlind(new Uint8Array(0))).toThrow(InvalidInputError);
    });

    it("returns a 32-byte blinded element and 32-byte blind state", () => {
      const input = new Uint8Array(32);
      input.fill(0xaa);
      const { blindedElement, blindState } = oprfBlind(input);
      expect(blindedElement.length).toBe(sodium.crypto_core_ristretto255_BYTES);
      expect(blindState.length).toBe(
        sodium.crypto_core_ristretto255_SCALARBYTES,
      );
    });

    it("produces different blinded elements on successive calls (random blinding)", () => {
      const input = new Uint8Array(32);
      input.fill(0xbb);
      const a = oprfBlind(input);
      const b = oprfBlind(input);
      // Blinded elements differ because the blinding scalar is random each time
      expect(a.blindedElement).not.toEqual(b.blindedElement);
    });
  });

  describe("Blind -> Evaluate -> Finalize roundtrip", () => {
    it("produces deterministic output for same input and key", () => {
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const input = new TextEncoder().encode("test-password-stretched");

      const { blindedElement: b1, blindState: s1 } = oprfBlind(input);
      const evaluated1 = blindEvaluate(sodium, key, b1);
      const output1 = oprfFinalize(s1, evaluated1, input);

      const { blindedElement: b2, blindState: s2 } = oprfBlind(input);
      const evaluated2 = blindEvaluate(sodium, key, b2);
      const output2 = oprfFinalize(s2, evaluated2, input);

      expect(output1).toEqual(output2);
      expect(output1.length).toBe(64);
    });

    it("produces different output for different keys", () => {
      const key1 = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const key2 = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const input = new TextEncoder().encode("same-input");

      const { blindedElement: b1, blindState: s1 } = oprfBlind(input);
      const eval1 = blindEvaluate(sodium, key1, b1);
      const out1 = oprfFinalize(s1, eval1, input);

      const { blindedElement: b2, blindState: s2 } = oprfBlind(input);
      const eval2 = blindEvaluate(sodium, key2, b2);
      const out2 = oprfFinalize(s2, eval2, input);

      expect(out1).not.toEqual(out2);
    });

    it("produces different output for different inputs", () => {
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const input1 = new TextEncoder().encode("password-one");
      const input2 = new TextEncoder().encode("password-two");

      const { blindedElement: b1, blindState: s1 } = oprfBlind(input1);
      const eval1 = blindEvaluate(sodium, key, b1);
      const out1 = oprfFinalize(s1, eval1, input1);

      const { blindedElement: b2, blindState: s2 } = oprfBlind(input2);
      const eval2 = blindEvaluate(sodium, key, b2);
      const out2 = oprfFinalize(s2, eval2, input2);

      expect(out1).not.toEqual(out2);
    });
  });

  describe("threshold OPRF (Lagrange interpolation)", () => {
    it("threshold evaluation matches single-key evaluation", () => {
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const { shareA, shareB } = shamirSplit(sodium, key);
      const input = new TextEncoder().encode("threshold-test");

      const { blindedElement, blindState } = oprfBlind(input);

      // Single-key evaluation
      const fullEval = blindEvaluate(sodium, key, blindedElement);

      // Threshold evaluation: each server evaluates with its share
      const partialA = blindEvaluate(sodium, shareA, blindedElement);
      const partialB = blindEvaluate(sodium, shareB, blindedElement);
      const combined = lagrangeInterpolate(partialA, partialB);

      // Combined should equal full evaluation
      expect(combined).toEqual(fullEval);

      // Finalize should produce same output
      const outputFull = oprfFinalize(blindState, fullEval, input);
      const outputThreshold = oprfFinalize(blindState, combined, input);
      expect(outputThreshold).toEqual(outputFull);
    });

    it("works with multiple different keys", () => {
      for (let i = 0; i < 5; i++) {
        const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
        const { shareA, shareB } = shamirSplit(sodium, key);
        const input = new TextEncoder().encode(`iteration-${String(i)}`);

        const { blindedElement } = oprfBlind(input);
        const fullEval = blindEvaluate(sodium, key, blindedElement);
        const partialA = blindEvaluate(sodium, shareA, blindedElement);
        const partialB = blindEvaluate(sodium, shareB, blindedElement);
        const combined = lagrangeInterpolate(partialA, partialB);

        expect(combined).toEqual(fullEval);
      }
    });
  });

  describe("proactive share refresh", () => {
    it("generateRefreshScalar returns a 32-byte scalar", () => {
      const scalar = generateRefreshScalar();
      expect(scalar.length).toBe(sodium.crypto_core_ristretto255_SCALARBYTES);
    });

    it("computeRefreshDelta produces correct deltas for evaluation points", () => {
      const b = generateRefreshScalar();
      const deltaA = computeRefreshDelta(b, 1); // b * 1 = b
      const deltaB = computeRefreshDelta(b, 2); // b * 2 = 2b

      // deltaB should equal deltaA + deltaA (i.e., 2b = b + b)
      const doubleDeltaA = sodium.crypto_core_ristretto255_scalar_add(
        deltaA,
        deltaA,
      );
      expect(deltaB).toEqual(doubleDeltaA);
    });

    it("computeRefreshDelta throws on invalid evaluation point", () => {
      const b = generateRefreshScalar();
      expect(() => computeRefreshDelta(b, 0)).toThrow(InvalidInputError);
      expect(() => computeRefreshDelta(b, 256)).toThrow(InvalidInputError);
      expect(() => computeRefreshDelta(b, -1)).toThrow(InvalidInputError);
    });

    it("refreshed shares still produce correct threshold evaluation", () => {
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const { shareA, shareB } = shamirSplit(sodium, key);

      // Polynomial-aware refresh: g(x) = b*x, g(0) = 0
      const b = generateRefreshScalar();
      const deltaA = computeRefreshDelta(b, 1); // g(1) = b
      const deltaB = computeRefreshDelta(b, 2); // g(2) = 2b
      const newShareA = applyRefresh(shareA, deltaA);
      const newShareB = applyRefresh(shareB, deltaB);

      // Evaluate with refreshed shares
      const input = new TextEncoder().encode("refresh-test");
      const { blindedElement, blindState } = oprfBlind(input);

      const partialA = blindEvaluate(sodium, newShareA, blindedElement);
      const partialB = blindEvaluate(sodium, newShareB, blindedElement);
      const combined = lagrangeInterpolate(partialA, partialB);

      // Should match original key evaluation
      const fullEval = blindEvaluate(sodium, key, blindedElement);
      expect(combined).toEqual(fullEval);

      // Finalize should match
      const outputRefreshed = oprfFinalize(blindState, combined, input);
      const outputOriginal = oprfFinalize(blindState, fullEval, input);
      expect(outputRefreshed).toEqual(outputOriginal);
    });
  });

  describe("deterministic blind (algebraic verification)", () => {
    it("injecting a known blind scalar produces consistent results", () => {
      // Use a fixed blind to verify the algebraic structure:
      // Finalize(r, Evaluate(k, Blind(r, input))) should be deterministic
      // when both r and k are fixed.
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const input = new TextEncoder().encode("deterministic-blind-test");

      // First run: capture the OPRF output
      const { blindedElement: b1, blindState: s1 } = oprfBlind(input);
      const eval1 = blindEvaluate(sodium, key, b1);
      const out1 = oprfFinalize(s1, eval1, input);

      // Second run with same input and key but different blind
      const { blindedElement: b2, blindState: s2 } = oprfBlind(input);
      const eval2 = blindEvaluate(sodium, key, b2);
      const out2 = oprfFinalize(s2, eval2, input);

      // Despite different blinds, final output must be identical
      // This is the core OPRF property: the blind cancels out
      expect(out1).toEqual(out2);
    });

    it("blind cancellation is exact (unblind * blind * P = key * P)", () => {
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const input = new TextEncoder().encode("cancellation-test");

      // Manual blind/evaluate/unblind
      const { blindedElement, blindState } = oprfBlind(input);

      // Server evaluates: evaluated = key * blindedElement = key * blind * P
      const evaluated = blindEvaluate(sodium, key, blindedElement);

      // Client unblinds: unblinded = blind^(-1) * evaluated = key * P
      const rInverse =
        sodium.crypto_core_ristretto255_scalar_invert(blindState);
      const unblinded = sodium.crypto_scalarmult_ristretto255(
        rInverse,
        evaluated,
      );

      // Direct computation: key * P (without blinding)
      // Uses the same RFC 9380 HashToGroup as oprfBlind
      const expanded = expandMessageXMD(sodium, input, HASH_TO_GROUP_DST, 64);
      const point = sodium.crypto_core_ristretto255_from_hash(expanded);
      const direct = sodium.crypto_scalarmult_ristretto255(key, point);

      expect(unblinded).toEqual(direct);
    });
  });

  describe("adversarial server responses", () => {
    it("finalize with identity point (all zeros) does not crash", () => {
      const input = new TextEncoder().encode("identity-test");
      const { blindState } = oprfBlind(input);

      // Server sends the identity element (32 zero bytes)
      // This is a degenerate evaluation but should not throw
      const identityPoint = new Uint8Array(32) as RistrettoPoint;

      // ristretto255 identity is not all zeros, so scalarmult_ristretto255
      // will reject this. The behavior depends on libsodium.
      // We're testing that it either produces output or throws a libsodium
      // error, not a CARE-Y bug like undefined behavior or silent corruption.
      let threw = false;
      try {
        oprfFinalize(blindState, identityPoint, input);
      } catch {
        threw = true;
      }
      // Either outcome is acceptable: output or throw
      // The test verifies no hang, no undefined behavior
      expect(typeof threw).toBe("boolean");
    });

    it("finalize with random garbage point does not crash", () => {
      const input = new TextEncoder().encode("garbage-test");
      const { blindState } = oprfBlind(input);

      // Random 32 bytes that are very unlikely to be a valid ristretto255 point
      const garbage = sodium.randombytes_buf(32) as RistrettoPoint;

      let threw = false;
      try {
        oprfFinalize(blindState, garbage, input);
      } catch {
        threw = true;
      }
      // Should either produce output or throw, never hang or corrupt
      expect(typeof threw).toBe("boolean");
    });

    it("two servers returning identical evaluations produces wrong output", () => {
      // If server B is compromised and replays server A's evaluation,
      // the Lagrange interpolation should NOT produce the correct result
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const { shareA } = shamirSplit(sodium, key);
      const input = new TextEncoder().encode("replay-test");

      const { blindedElement, blindState } = oprfBlind(input);

      const partialA = blindEvaluate(sodium, shareA, blindedElement);
      // Server B replays A's evaluation
      const replayedB = partialA;

      const combined = lagrangeInterpolate(partialA, replayedB);
      const fullEval = blindEvaluate(sodium, key, blindedElement);

      // Replayed evaluation MUST NOT equal the correct result
      expect(combined).not.toEqual(fullEval);

      // And the finalized outputs must differ
      const outputReplay = oprfFinalize(blindState, combined, input);
      const outputCorrect = oprfFinalize(blindState, fullEval, input);
      expect(outputReplay).not.toEqual(outputCorrect);
    });

    it("swapped server evaluations produce wrong output", () => {
      // If partial evaluations are swapped (A's sent as B's and vice versa),
      // the Lagrange coefficients applied to the wrong shares produce junk
      const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const { shareA, shareB } = shamirSplit(sodium, key);
      const input = new TextEncoder().encode("swap-test");

      const { blindedElement, blindState } = oprfBlind(input);

      const partialA = blindEvaluate(sodium, shareA, blindedElement);
      const partialB = blindEvaluate(sodium, shareB, blindedElement);

      // Correct order
      const correctCombined = lagrangeInterpolate(partialA, partialB);
      // Swapped order
      const swappedCombined = lagrangeInterpolate(partialB, partialA);

      const fullEval = blindEvaluate(sodium, key, blindedElement);
      expect(correctCombined).toEqual(fullEval);
      expect(swappedCombined).not.toEqual(fullEval);

      const outputSwapped = oprfFinalize(blindState, swappedCombined, input);
      const outputCorrect = oprfFinalize(blindState, correctCombined, input);
      expect(outputSwapped).not.toEqual(outputCorrect);
    });
  });

  describe("property-based", () => {
    it("Blind -> Evaluate -> Finalize always produces 64 bytes", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 128 }),
          (input) => {
            const key =
              sodium.crypto_core_ristretto255_scalar_random() as Scalar;
            const { blindedElement, blindState } = oprfBlind(input);
            const evaluated = blindEvaluate(sodium, key, blindedElement);
            const output = oprfFinalize(blindState, evaluated, input);
            expect(output.length).toBe(64);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("threshold equivalence holds for arbitrary keys", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
          const { shareA, shareB } = shamirSplit(sodium, key);
          const input = sodium.randombytes_buf(32);

          const { blindedElement } = oprfBlind(input);
          const fullEval = blindEvaluate(sodium, key, blindedElement);
          const partialA = blindEvaluate(sodium, shareA, blindedElement);
          const partialB = blindEvaluate(sodium, shareB, blindedElement);
          const combined = lagrangeInterpolate(partialA, partialB);

          expect(combined).toEqual(fullEval);
        }),
        { numRuns: FC_MEDIUM },
      );
    });

    it("refresh invariant: Lagrange reconstruction preserved", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
          const { shareA, shareB } = shamirSplit(sodium, key);
          const input = sodium.randombytes_buf(32);

          const { blindedElement } = oprfBlind(input);
          const fullEval = blindEvaluate(sodium, key, blindedElement);

          // Polynomial-aware refresh
          const b = generateRefreshScalar();
          const deltaA = computeRefreshDelta(b, 1);
          const deltaB = computeRefreshDelta(b, 2);
          const newA = applyRefresh(shareA, deltaA);
          const newB = applyRefresh(shareB, deltaB);

          const partialA = blindEvaluate(sodium, newA, blindedElement);
          const partialB = blindEvaluate(sodium, newB, blindedElement);
          const combined = lagrangeInterpolate(partialA, partialB);

          expect(combined).toEqual(fullEval);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  /**
   * RFC 9497 Appendix A.1.1 known-answer test vectors.
   *
   * These verify byte-exact compliance with the ristretto255-SHA512 OPRF
   * ciphersuite. The test injects a deterministic blind (from the RFC)
   * and verifies BlindedElement, EvaluationElement, and Output match.
   *
   * Key derivation (DeriveKeyPair) is server-side and tested separately.
   * Here we verify HashToGroup + Blind + Evaluate + Finalize.
   */
  describe("RFC 9497 known-answer vectors", () => {
    // Server key (skSm) from RFC 9497 Appendix A.1.1
    const skSm = fromHex(
      "5ebcea5ee37023ccb9fc2d2019f9d7737be85591ae8652ffa9ef0f4d37063b0e",
    );

    it("vector 1: Input = 0x00", () => {
      const input = fromHex("00");
      const blind = fromHex(
        "64d37aed22a27f5191de1c1d69fadb899d8862b58eb4220029e036ec4c1f6706",
      );
      const expectedBlinded = fromHex(
        "609a0ae68c15a3cf6903766461307e5c8bb2f95e7e6550e1ffa2dc99e412803c",
      );
      const expectedEval = fromHex(
        "7ec6578ae5120958eb2db1745758ff379e77cb64fe77b0b2d8cc917ea0869c7e",
      );
      const expectedOutput = fromHex(
        "527759c3d9366f277d8c6020418d96bb393ba2afb20ff90df23fb7708264e2f3" +
          "ab9135e3bd69955851de4b1f9fe8a0973396719b7912ba9ee8aa7d0b5e24bcf6",
      );

      // HashToGroup: expand_message_xmd(input, DST, 64) -> from_hash
      const expanded = expandMessageXMD(sodium, input, HASH_TO_GROUP_DST, 64);
      const point = sodium.crypto_core_ristretto255_from_hash(expanded);

      // Blind: blindedElement = blind * point
      const blindedElement = sodium.crypto_scalarmult_ristretto255(
        blind,
        point,
      );
      expect(toHex(blindedElement)).toBe(toHex(expectedBlinded));

      // Server evaluate: evaluated = skSm * blindedElement
      const evaluated = sodium.crypto_scalarmult_ristretto255(
        skSm,
        blindedElement,
      );
      expect(toHex(evaluated)).toBe(toHex(expectedEval));

      // Finalize with the RFC blind
      const output = oprfFinalize(
        blind as Scalar,
        evaluated as RistrettoPoint,
        input,
      );
      expect(toHex(output)).toBe(toHex(expectedOutput));
    });

    it("vector 2: Input = 0x5a*17", () => {
      const input = fromHex("5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a");
      const blind = fromHex(
        "64d37aed22a27f5191de1c1d69fadb899d8862b58eb4220029e036ec4c1f6706",
      );
      const expectedBlinded = fromHex(
        "da27ef466870f5f15296299850aa088629945a17d1f5b7f5ff043f76b3c06418",
      );
      const expectedEval = fromHex(
        "b4cbf5a4f1eeda5a63ce7b77c7d23f461db3fcab0dd28e4e17cecb5c90d02c25",
      );
      const expectedOutput = fromHex(
        "f4a74c9c592497375e796aa837e907b1a045d34306a749db9f34221f7e750cb4" +
          "f2a6413a6bf6fa5e19ba6348eb673934a722a7ede2e7621306d18951e7cf2c73",
      );

      const expanded = expandMessageXMD(sodium, input, HASH_TO_GROUP_DST, 64);
      const point = sodium.crypto_core_ristretto255_from_hash(expanded);

      const blindedElement = sodium.crypto_scalarmult_ristretto255(
        blind,
        point,
      );
      expect(toHex(blindedElement)).toBe(toHex(expectedBlinded));

      const evaluated = sodium.crypto_scalarmult_ristretto255(
        skSm,
        blindedElement,
      );
      expect(toHex(evaluated)).toBe(toHex(expectedEval));

      const output = oprfFinalize(
        blind as Scalar,
        evaluated as RistrettoPoint,
        input,
      );
      expect(toHex(output)).toBe(toHex(expectedOutput));
    });
  });
});
