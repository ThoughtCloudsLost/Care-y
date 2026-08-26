import { describe, it, expect } from "vitest";
import {
  shouldPlayIntroSplash,
  SPLASH_HOLD_MS,
  SPLASH_TIP_BEAT_MS,
  SPLASH_CEILING_MS,
  SPLASH_SPRING,
  type IntroSplashConditions,
} from "./splash-intro.js";
import { BOOT_TIP_SHOWN_MS } from "./boot-tip.js";

/** A desktop explore load at the demo's front door, the one case that
 *  plays the splash. */
function base(): IntroSplashConditions {
  return {
    mode: "explore",
    recordMode: false,
    windowW: 1280,
    wideBreakpoint: 900,
    reducedMotion: false,
    deepLinked: false,
  };
}

describe("shouldPlayIntroSplash", () => {
  it("plays on a wide explore load", () => {
    expect(shouldPlayIntroSplash(base())).toBe(true);
  });

  it("plays exactly at the wide breakpoint", () => {
    expect(shouldPlayIntroSplash({ ...base(), windowW: 900 })).toBe(true);
  });

  // -----------------------------------------------------------------
  // Read mode: the frame is hidden until a peek opens it
  // -----------------------------------------------------------------

  it("does not play in read mode", () => {
    expect(shouldPlayIntroSplash({ ...base(), mode: "read" })).toBe(false);
  });

  // -----------------------------------------------------------------
  // Record mode: captures must stay frame-identical
  // -----------------------------------------------------------------

  it("does not play in record mode", () => {
    expect(shouldPlayIntroSplash({ ...base(), recordMode: true })).toBe(false);
  });

  it("does not play in record mode even on a wide explore load", () => {
    expect(
      shouldPlayIntroSplash({ ...base(), recordMode: true, windowW: 1920 }),
    ).toBe(false);
  });

  // -----------------------------------------------------------------
  // Narrow: already fullscreen, nothing to land in
  // -----------------------------------------------------------------

  it("does not play one pixel below the wide breakpoint", () => {
    expect(shouldPlayIntroSplash({ ...base(), windowW: 899 })).toBe(false);
  });

  it("does not play on a phone-width viewport", () => {
    expect(shouldPlayIntroSplash({ ...base(), windowW: 390 })).toBe(false);
  });

  // -----------------------------------------------------------------
  // Deep link: the visitor named a destination
  // -----------------------------------------------------------------

  it("does not play for a deep link", () => {
    expect(shouldPlayIntroSplash({ ...base(), deepLinked: true })).toBe(false);
  });

  it("does not play for a deep link on a wide explore load", () => {
    expect(
      shouldPlayIntroSplash({ ...base(), deepLinked: true, windowW: 1920 }),
    ).toBe(false);
  });

  // -----------------------------------------------------------------
  // Reduced motion
  // -----------------------------------------------------------------

  it("does not play under reduced motion", () => {
    expect(shouldPlayIntroSplash({ ...base(), reducedMotion: true })).toBe(
      false,
    );
  });

  it("does not play under reduced motion on a wide explore load", () => {
    expect(
      shouldPlayIntroSplash({ ...base(), reducedMotion: true, windowW: 1920 }),
    ).toBe(false);
  });
});

describe("splash tuning", () => {
  it("holds until the boot tip has fully faded in", () => {
    expect(SPLASH_HOLD_MS).toBeGreaterThan(BOOT_TIP_SHOWN_MS);
  });

  it("follows the boot tip if its reveal is retimed", () => {
    // The hold is derived, not a copy: the only way this fails is if
    // someone hardcodes it again.
    expect(SPLASH_HOLD_MS).toBe(BOOT_TIP_SHOWN_MS + SPLASH_TIP_BEAT_MS);
  });

  it("leaves the backstop room to be a backstop", () => {
    // The ceiling is armed at splash start and the hold at the bridge
    // handshake, so the ceiling must outlast a hold that starts at once
    // or it would routinely cut the splash short.
    expect(SPLASH_CEILING_MS).toBeGreaterThan(SPLASH_HOLD_MS);
  });

  it("shrinks on a softer spring than the 300ms preset spring", () => {
    expect(SPLASH_SPRING.stiffness).toBeLessThan(0.12);
  });

  it("lands without overshoot (damping ratio at or above critical)", () => {
    // Underdamped below 1: a bounce at the end of a slow shrink reads
    // as a mistake rather than as spring.
    const ratio =
      SPLASH_SPRING.damping / (2 * Math.sqrt(SPLASH_SPRING.stiffness));
    expect(ratio).toBeGreaterThanOrEqual(1);
  });
});
