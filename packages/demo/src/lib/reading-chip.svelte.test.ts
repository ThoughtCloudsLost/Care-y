import { describe, it, expect, beforeEach } from "vitest";
import {
  chipTargetValue,
  isFollowSuspended,
  offerChip,
  dismissChip,
  chipJump,
  resumeFollow,
  resetReadingChip,
  type ChipTarget,
} from "./reading-chip.svelte.js";

const TARGET_A: ChipTarget = { sectionId: "login", subSlug: "credentials" };
const TARGET_B: ChipTarget = { sectionId: "tickets", subSlug: "sort" };

describe("reading-chip store", () => {
  beforeEach(() => {
    resetReadingChip();
  });

  // -------------------------------------------------------------------
  // offerChip / chipTargetValue
  // -------------------------------------------------------------------

  it("starts with no chip target", () => {
    expect(chipTargetValue()).toBeNull();
  });

  it("offers a chip target", () => {
    offerChip(TARGET_A);
    expect(chipTargetValue()).toEqual(TARGET_A);
  });

  it("replaces the chip target on a second offer", () => {
    offerChip(TARGET_A);
    offerChip(TARGET_B);
    expect(chipTargetValue()).toEqual(TARGET_B);
  });

  // -------------------------------------------------------------------
  // dismissChip
  // -------------------------------------------------------------------

  it("dismisses the chip", () => {
    offerChip(TARGET_A);
    dismissChip();
    expect(chipTargetValue()).toBeNull();
  });

  it("dismiss is a no-op when no chip is shown", () => {
    dismissChip();
    expect(chipTargetValue()).toBeNull();
  });

  // -------------------------------------------------------------------
  // chipJump - dwell mode
  // -------------------------------------------------------------------

  it("returns the target and clears the chip in dwell mode", () => {
    offerChip(TARGET_A);
    const result = chipJump("dwell");
    expect(result).toEqual(TARGET_A);
    expect(chipTargetValue()).toBeNull();
    expect(isFollowSuspended()).toBe(false);
  });

  it("returns null when no chip is shown (dwell mode)", () => {
    expect(chipJump("dwell")).toBeNull();
  });

  // -------------------------------------------------------------------
  // chipJump - second-tap mode
  // -------------------------------------------------------------------

  it("returns the target and sets followSuspended in second-tap mode", () => {
    offerChip(TARGET_A);
    const result = chipJump("second-tap");
    expect(result).toEqual(TARGET_A);
    // The chip stays visible (target unchanged) for the resume label.
    expect(chipTargetValue()).toEqual(TARGET_A);
    expect(isFollowSuspended()).toBe(true);
  });

  it("returns null when no chip is shown (second-tap mode)", () => {
    expect(chipJump("second-tap")).toBeNull();
  });

  // -------------------------------------------------------------------
  // resumeFollow
  // -------------------------------------------------------------------

  it("clears suspension and hides the chip", () => {
    offerChip(TARGET_A);
    chipJump("second-tap");
    expect(isFollowSuspended()).toBe(true);
    resumeFollow();
    expect(isFollowSuspended()).toBe(false);
    expect(chipTargetValue()).toBeNull();
  });

  it("resume is safe to call when not suspended", () => {
    resumeFollow();
    expect(isFollowSuspended()).toBe(false);
    expect(chipTargetValue()).toBeNull();
  });

  // -------------------------------------------------------------------
  // resetReadingChip
  // -------------------------------------------------------------------

  it("resets all state", () => {
    offerChip(TARGET_A);
    chipJump("second-tap");
    expect(chipTargetValue()).not.toBeNull();
    expect(isFollowSuspended()).toBe(true);
    resetReadingChip();
    expect(chipTargetValue()).toBeNull();
    expect(isFollowSuspended()).toBe(false);
  });

  // -------------------------------------------------------------------
  // Mode interplay
  // -------------------------------------------------------------------

  it("dwell jump does not set followSuspended", () => {
    offerChip(TARGET_A);
    chipJump("dwell");
    expect(isFollowSuspended()).toBe(false);
  });

  it("second-tap jump followed by offer updates the target but keeps suspension", () => {
    offerChip(TARGET_A);
    chipJump("second-tap");
    // A new phone move offers a different target while suspended.
    offerChip(TARGET_B);
    expect(chipTargetValue()).toEqual(TARGET_B);
    expect(isFollowSuspended()).toBe(true);
  });

  it("dismiss clears target but does not affect followSuspended", () => {
    offerChip(TARGET_A);
    chipJump("second-tap");
    expect(isFollowSuspended()).toBe(true);
    dismissChip();
    expect(chipTargetValue()).toBeNull();
    // Suspension stays: the user dismissed without resuming.
    expect(isFollowSuspended()).toBe(true);
  });
});
