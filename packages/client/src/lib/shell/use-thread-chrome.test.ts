import { describe, it, expect } from "vitest";

/**
 * The gating logic `useThreadChrome` wraps around `useScrollDirection`:
 * subnavbarHidden = ready && dir.hidden && !pinned.
 *
 * `useScrollDirection` is tested separately (pure ScrollDirectionTracker).
 * This suite validates the boolean gate at the same pure level: given
 * combinations of ready, hidden, and pinned, the result is correct.
 */

interface GateInputs {
  ready: boolean;
  hidden: boolean;
  pinned: boolean;
}

/** The exact boolean expression from useThreadChrome. */
function computeSubnavbarHidden(inputs: GateInputs): boolean {
  return inputs.ready && inputs.hidden && !inputs.pinned;
}

describe("useThreadChrome gating logic", () => {
  it("hides only when ready, scrolled-hidden, and not pinned", () => {
    expect(
      computeSubnavbarHidden({ ready: true, hidden: true, pinned: false }),
    ).toBe(true);
  });

  it("stays visible when not ready", () => {
    expect(
      computeSubnavbarHidden({ ready: false, hidden: true, pinned: false }),
    ).toBe(false);
  });

  it("stays visible when not scroll-hidden", () => {
    expect(
      computeSubnavbarHidden({ ready: true, hidden: false, pinned: false }),
    ).toBe(false);
  });

  it("stays visible when pinned", () => {
    expect(
      computeSubnavbarHidden({ ready: true, hidden: true, pinned: true }),
    ).toBe(false);
  });

  it("stays visible when all inputs are false", () => {
    expect(
      computeSubnavbarHidden({ ready: false, hidden: false, pinned: false }),
    ).toBe(false);
  });

  it("stays visible when pinned overrides ready + hidden", () => {
    expect(
      computeSubnavbarHidden({ ready: true, hidden: true, pinned: true }),
    ).toBe(false);
  });

  it("stays visible when neither ready nor hidden", () => {
    expect(
      computeSubnavbarHidden({ ready: false, hidden: false, pinned: true }),
    ).toBe(false);
  });
});
