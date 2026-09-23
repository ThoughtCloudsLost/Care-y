import { describe, it, expect } from "vitest";
import {
  shouldBackstopUnmute,
  backstopDecision,
  relinkDecision,
  dirtyGuardDecision,
  readingChipDecision,
} from "./scroll-intent-guard.js";

describe("shouldBackstopUnmute", () => {
  // -----------------------------------------------------------------
  // Regression: backstop must not unmute while page is misaligned
  // -----------------------------------------------------------------

  it("returns false when derived position does not match the suppression target", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    // The page is at an intermediate login sub during a smooth scroll
    expect(shouldBackstopUnmute(target, "login", "totp")).toBe(false);
  });

  it("returns false when derived section differs from target", () => {
    const target = { section: "tickets" as const, sub: "sort" };
    expect(shouldBackstopUnmute(target, "login", "credentials")).toBe(false);
  });

  it("returns false when derived sub is null but target has a sub", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    expect(shouldBackstopUnmute(target, "login", null)).toBe(false);
  });

  // -----------------------------------------------------------------
  // Normal unmuting when aligned
  // -----------------------------------------------------------------

  it("returns true when derived position matches the target exactly", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    expect(shouldBackstopUnmute(target, "login", "key-derivation")).toBe(true);
  });

  it("returns true when target is null (layout-shift suppression)", () => {
    expect(shouldBackstopUnmute(null, "login", "credentials")).toBe(true);
  });

  it("returns true when derived section is null (geometry not ready)", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    expect(shouldBackstopUnmute(target, null, null)).toBe(true);
  });

  it("returns true when both section and sub match with null sub", () => {
    const target = { section: "tickets" as const, sub: null };
    expect(shouldBackstopUnmute(target, "tickets", null)).toBe(true);
  });
});

describe("backstopDecision", () => {
  // -----------------------------------------------------------------
  // Regression: a click must not be overridden by a stale derived
  // position when the first alignment lands short (frame preset
  // spring, hole re-layout past the fixed-point cap). The backstop
  // gets one healing re-align before it may surrender.
  // -----------------------------------------------------------------

  it("realigns when misaligned and no retry has been spent", () => {
    const target = { section: "login" as const, sub: "two-factor" };
    expect(backstopDecision(target, "login", "credentials", false)).toBe(
      "realign",
    );
  });

  it("surrenders when misaligned after the retry was spent", () => {
    const target = { section: "login" as const, sub: "two-factor" };
    expect(backstopDecision(target, "login", "credentials", true)).toBe(
      "surrender",
    );
  });

  it("unmutes when the derived position reaches the target", () => {
    const target = { section: "login" as const, sub: "two-factor" };
    expect(backstopDecision(target, "login", "two-factor", false)).toBe(
      "unmute",
    );
    expect(backstopDecision(target, "login", "two-factor", true)).toBe(
      "unmute",
    );
  });

  it("unmutes for targetless layout-shift suppression without realigning", () => {
    expect(backstopDecision(null, "tickets", "sort", false)).toBe("unmute");
  });

  it("unmutes when geometry is not ready rather than realigning blind", () => {
    const target = { section: "tickets" as const, sub: "sort" };
    expect(backstopDecision(target, null, null, false)).toBe("unmute");
  });
});

describe("relinkDecision", () => {
  // -----------------------------------------------------------------
  // Relink reconciliation: whichever side moved most recently during
  // the unlink wins. 0 means that side never moved.
  // -----------------------------------------------------------------

  it("returns none when neither side moved during the unlink", () => {
    expect(relinkDecision(0, 0)).toBe("none");
  });

  it("pushes the local location when only the story moved", () => {
    expect(relinkDecision(5000, 0)).toBe("push-local");
  });

  it("adopts the phone position when only the phone moved", () => {
    expect(relinkDecision(0, 5000)).toBe("adopt-phone");
  });

  it("pushes the local location when the story moved after the phone", () => {
    expect(relinkDecision(9000, 5000)).toBe("push-local");
  });

  it("adopts the phone position when the phone moved after the story", () => {
    expect(relinkDecision(5000, 9000)).toBe("adopt-phone");
  });

  it("favors the reader on a same-millisecond tie", () => {
    expect(relinkDecision(5000, 5000)).toBe("push-local");
  });
});

describe("dirtyGuardDecision", () => {
  // -----------------------------------------------------------------
  // Not dirty: always navigate
  // -----------------------------------------------------------------

  it("navigates when not dirty", () => {
    expect(dirtyGuardDecision(false, 0, 10000)).toBe("navigate");
  });

  it("navigates when not dirty even with a recent suppression", () => {
    expect(dirtyGuardDecision(false, 9000, 10000)).toBe("navigate");
  });

  // -----------------------------------------------------------------
  // Dirty, no prior suppression
  // -----------------------------------------------------------------

  it("suppresses when dirty and never suppressed (lastSuppressedAt = 0)", () => {
    expect(dirtyGuardDecision(true, 0, 10000)).toBe("suppress");
  });

  // -----------------------------------------------------------------
  // Dirty, within override window
  // -----------------------------------------------------------------

  it("navigates when dirty and within the override window", () => {
    // Suppressed 2s ago, override window is 4s
    expect(dirtyGuardDecision(true, 8000, 10000)).toBe("navigate");
  });

  it("navigates at exactly the override boundary (now - lastSuppressedAt = overrideMs)", () => {
    // Boundary: 10000 - 6000 = 4000, which is <= 4000
    expect(dirtyGuardDecision(true, 6000, 10000)).toBe("navigate");
  });

  // -----------------------------------------------------------------
  // Dirty, outside override window
  // -----------------------------------------------------------------

  it("suppresses when dirty and just past the override window", () => {
    // 10000 - 5999 = 4001, which is > 4000
    expect(dirtyGuardDecision(true, 5999, 10000)).toBe("suppress");
  });

  it("suppresses when dirty and well outside the override window", () => {
    expect(dirtyGuardDecision(true, 1000, 10000)).toBe("suppress");
  });

  // -----------------------------------------------------------------
  // Custom override window
  // -----------------------------------------------------------------

  it("respects a custom override window", () => {
    // 10000 - 8000 = 2000, overrideMs = 2000
    expect(dirtyGuardDecision(true, 8000, 10000, 2000)).toBe("navigate");
    // 10000 - 7999 = 2001, overrideMs = 2000
    expect(dirtyGuardDecision(true, 7999, 10000, 2000)).toBe("suppress");
  });
});

describe("readingChipDecision", () => {
  const DEFAULTS = { recentLocalMs: 8000, dwellMs: 15000 };

  // -----------------------------------------------------------------
  // Rule 1: reader never scrolled (lastLocalMoveAt = 0)
  // -----------------------------------------------------------------

  it("follows when the reader never scrolled (dwell mode)", () => {
    expect(readingChipDecision(10000, 0, 10000, "dwell", false, DEFAULTS)).toBe(
      "follow",
    );
  });

  it("follows when the reader never scrolled (second-tap mode)", () => {
    expect(
      readingChipDecision(10000, 0, 10000, "second-tap", false, DEFAULTS),
    ).toBe("follow");
  });

  // -----------------------------------------------------------------
  // Rule 2: reader scrolled within recentLocalMs
  // -----------------------------------------------------------------

  it("offers chip when reader scrolled 1ms ago (dwell mode)", () => {
    expect(
      readingChipDecision(10000, 9999, 10000, "dwell", false, DEFAULTS),
    ).toBe("offer-chip");
  });

  it("offers chip when reader scrolled exactly at recentLocalMs boundary", () => {
    // now - lastLocalMoveAt = 8000 = recentLocalMs (within boundary)
    expect(
      readingChipDecision(10000, 2000, 10000, "dwell", false, DEFAULTS),
    ).toBe("offer-chip");
  });

  it("offers chip in second-tap mode when reader scrolled recently", () => {
    expect(
      readingChipDecision(10000, 9000, 10000, "second-tap", false, DEFAULTS),
    ).toBe("offer-chip");
  });

  // -----------------------------------------------------------------
  // Rule 3: dwell mode between recentLocalMs and dwellMs
  // -----------------------------------------------------------------

  it("offers chip during the dwell window (between recentLocalMs and dwellMs)", () => {
    // now - lastLocalMoveAt = 10000: past recentLocalMs(8000), within dwellMs(15000)
    expect(
      readingChipDecision(20000, 10000, 20000, "dwell", false, DEFAULTS),
    ).toBe("offer-chip");
  });

  it("offers chip at exactly the dwellMs boundary", () => {
    // now - lastLocalMoveAt = 15000 = dwellMs (within boundary)
    expect(
      readingChipDecision(25000, 10000, 25000, "dwell", false, DEFAULTS),
    ).toBe("offer-chip");
  });

  it("follows after dwell expires (just past dwellMs)", () => {
    // now - lastLocalMoveAt = 15001 > dwellMs(15000)
    expect(
      readingChipDecision(25001, 10000, 25001, "dwell", false, DEFAULTS),
    ).toBe("follow");
  });

  it("follows in second-tap mode when past recentLocalMs and not suspended", () => {
    // now - lastLocalMoveAt = 10000 > recentLocalMs(8000), no dwell window
    expect(
      readingChipDecision(20000, 10000, 20000, "second-tap", false, DEFAULTS),
    ).toBe("follow");
  });

  // -----------------------------------------------------------------
  // Rule 4: followSuspended in second-tap mode
  // -----------------------------------------------------------------

  it("offers chip when followSuspended is true in second-tap mode", () => {
    // Even though the reader never scrolled (lastLocalMoveAt = 0),
    // the suspension flag forces the chip.
    expect(
      readingChipDecision(10000, 0, 10000, "second-tap", true, DEFAULTS),
    ).toBe("offer-chip");
  });

  it("offers chip when followSuspended is true and well past dwellMs", () => {
    expect(
      readingChipDecision(100000, 10000, 100000, "second-tap", true, DEFAULTS),
    ).toBe("offer-chip");
  });

  it("ignores followSuspended in dwell mode", () => {
    // followSuspended = true but in dwell mode, so it falls through to
    // timestamp rules. lastLocalMoveAt = 0 means no claim.
    expect(readingChipDecision(10000, 0, 10000, "dwell", true, DEFAULTS)).toBe(
      "follow",
    );
  });

  // -----------------------------------------------------------------
  // lastPhoneMoveAt is currently not used in the decision (it signals
  // freshness via the caller passing Date.now()), but the parameter
  // is accepted for interface consistency.
  // -----------------------------------------------------------------

  it("treats lastPhoneMoveAt as a pass-through (does not affect decision)", () => {
    // Same inputs, different lastPhoneMoveAt values
    const a = readingChipDecision(10000, 9000, 5000, "dwell", false, DEFAULTS);
    const b = readingChipDecision(10000, 9000, 10000, "dwell", false, DEFAULTS);
    expect(a).toBe(b);
  });

  // -----------------------------------------------------------------
  // Custom opts
  // -----------------------------------------------------------------

  it("respects custom recentLocalMs", () => {
    const opts = { recentLocalMs: 3000, dwellMs: 10000 };
    // now - lastLocalMoveAt = 3000 = recentLocalMs
    expect(readingChipDecision(13000, 10000, 13000, "dwell", false, opts)).toBe(
      "offer-chip",
    );
    // now - lastLocalMoveAt = 3001 > recentLocalMs, within dwellMs
    expect(readingChipDecision(13001, 10000, 13001, "dwell", false, opts)).toBe(
      "offer-chip",
    );
  });

  it("respects custom dwellMs", () => {
    const opts = { recentLocalMs: 3000, dwellMs: 5000 };
    // now - lastLocalMoveAt = 5000 = dwellMs (boundary)
    expect(readingChipDecision(15000, 10000, 15000, "dwell", false, opts)).toBe(
      "offer-chip",
    );
    // now - lastLocalMoveAt = 5001 > dwellMs
    expect(readingChipDecision(15001, 10000, 15001, "dwell", false, opts)).toBe(
      "follow",
    );
  });
});
