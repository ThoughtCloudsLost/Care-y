import { describe, it, expect } from "vitest";
import { evaluateAdvance } from "./login-advance-guard.js";
import type { LoginStage, LoginAdvanceTarget } from "./bridge.js";

describe("evaluateAdvance", () => {
  // -----------------------------------------------------------------
  // Regression: crypto in-flight blocks rewind
  // -----------------------------------------------------------------

  describe("crypto in-flight blocks lower-rank rewind", () => {
    const derivingStage: LoginStage = "deriving";

    // Every login sub except key-derivation maps to rank 2 or lower
    const lowerRankTargets: LoginAdvanceTarget[] = [
      "form",
      "twofa-picker",
      "method-totp",
      "method-passkey",
      "method-email",
      "method-sms",
      "method-push",
      "method-backup",
    ];

    for (const target of lowerRankTargets) {
      it(`drops target "${target}" while stage is "deriving" and crypto is in flight`, () => {
        expect(evaluateAdvance(derivingStage, target, true)).toBe("drop");
      });
    }

    // Same targets without crypto in-flight should rewind
    for (const target of lowerRankTargets) {
      it(`rewinds for target "${target}" while stage is "deriving" when crypto is idle`, () => {
        expect(evaluateAdvance(derivingStage, target, false)).toBe("rewind");
      });
    }

    // The verify-to-derive gap: stage is still "twofa-method" (rank 2)
    // but crypto is already in flight. A form target (rank 0) should
    // be dropped to prevent the second submit.
    it('drops target "form" at stage "twofa-method" when crypto is in flight', () => {
      expect(evaluateAdvance("twofa-method", "form", true)).toBe("drop");
    });

    it('drops target "twofa-picker" at stage "twofa-method" when crypto is in flight', () => {
      expect(evaluateAdvance("twofa-method", "twofa-picker", true)).toBe(
        "drop",
      );
    });
  });

  // -----------------------------------------------------------------
  // Forward targets proceed
  // -----------------------------------------------------------------

  describe("forward targets proceed normally", () => {
    it('proceeds from "form" to "twofa-picker"', () => {
      expect(evaluateAdvance("form", "twofa-picker", false)).toBe("proceed");
    });

    it('proceeds from "twofa-picker" to "method-totp"', () => {
      expect(evaluateAdvance("twofa-picker", "method-totp", false)).toBe(
        "proceed",
      );
    });

    it('proceeds from "twofa-method" to "done"', () => {
      expect(evaluateAdvance("twofa-method", "done", false)).toBe("proceed");
    });

    it('proceeds from "form" to "done"', () => {
      expect(evaluateAdvance("form", "done", false)).toBe("proceed");
    });

    // Forward targets still proceed even when crypto is in flight
    // (the "done" target is the legitimate completion path)
    it('proceeds from "twofa-method" to "done" even when crypto is in flight', () => {
      expect(evaluateAdvance("twofa-method", "done", true)).toBe("proceed");
    });
  });

  // -----------------------------------------------------------------
  // Same-rank targets
  // -----------------------------------------------------------------

  describe("same-rank targets", () => {
    it('returns "already" for non-method target at its own rank', () => {
      expect(evaluateAdvance("form", "form", false)).toBe("already");
    });

    it('returns "already" for "twofa-picker" at rank 1', () => {
      expect(evaluateAdvance("twofa-picker", "twofa-picker", false)).toBe(
        "already",
      );
    });

    // Method targets at equal rank proceed (method switch)
    it("proceeds for method target at equal rank (method switch)", () => {
      expect(evaluateAdvance("twofa-method", "method-email", false)).toBe(
        "proceed",
      );
    });

    // "done" at deriving rank proceeds (play forward to completion)
    it('proceeds for "done" at deriving stage', () => {
      expect(evaluateAdvance("deriving", "done", false)).toBe("proceed");
    });
  });
});
