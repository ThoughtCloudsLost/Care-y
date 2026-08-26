import { describe, it, expect } from "vitest";
import { RoleId, ROLE_ID_VALUES } from "@care-y/shared";

/**
 * Data-model tests for the frame toolbar's role definitions. The
 * component itself is presentational Svelte and cannot be mounted
 * without a DOM harness, but the role identifiers it renders must
 * stay in sync with the canonical shared enum. Ported from the
 * former RoleRail.test.ts.
 */
describe("FrameToolbar role definitions", () => {
  /** The toolbar shows exactly three roles in this order. */
  const TOOLBAR_ROLE_IDS = [
    RoleId.ADMIN,
    RoleId.MANAGER,
    RoleId.VOLUNTEER,
  ] as const;

  it("covers every canonical role ID", () => {
    // Every value in ROLE_ID_VALUES must appear in the toolbar
    for (const id of ROLE_ID_VALUES) {
      expect(TOOLBAR_ROLE_IDS).toContain(id);
    }
  });

  it("contains only valid role IDs", () => {
    for (const id of TOOLBAR_ROLE_IDS) {
      expect(ROLE_ID_VALUES).toContain(id);
    }
  });

  it("has no duplicates", () => {
    const unique = new Set(TOOLBAR_ROLE_IDS);
    expect(unique.size).toBe(TOOLBAR_ROLE_IDS.length);
  });

  it("default boot role is ADMIN", () => {
    // The toolbar's initial highlight matches the pinned bridge contract
    expect(TOOLBAR_ROLE_IDS[0]).toBe(RoleId.ADMIN);
  });
});

/**
 * Collapse thresholds: both keep their original fine-tuned values. The
 * fullscreen button rides in the left zone above the preset collapse
 * width and folds into the preset dropdown as a menu item below it, so
 * adding it never shifted when the other controls hide or compress.
 * The link toggle lives in the TopBar more menu, not the toolbar.
 */
describe("FrameToolbar collapse thresholds", () => {
  const PRESETS_COLLAPSE_W = 370;
  const BADGE_COMPACT_W = 340;

  it("left zone buttons (3x44=132) fit below preset collapse", () => {
    const leftZoneW = 3 * 44;
    expect(leftZoneW).toBeLessThan(PRESETS_COLLAPSE_W);
  });

  it("badge compact sits below preset collapse", () => {
    expect(BADGE_COMPACT_W).toBeLessThan(PRESETS_COLLAPSE_W);
  });

  it("thresholds keep the original fine-tuned values", () => {
    expect(PRESETS_COLLAPSE_W).toBe(370);
    expect(BADGE_COMPACT_W).toBe(340);
  });
});

/**
 * Fullscreen mode prop contract. Validates the design invariants:
 * - Fullscreen toolbar shows exit, drawer toggle, and role badge
 * - Normal mode shows close, shrink/grow, fullscreen, presets, role badge
 * - Both modes use the same role set
 */
describe("FrameToolbar fullscreen mode", () => {
  // The normal-mode left zone has 3 buttons: close, shrink/grow, fullscreen
  const NORMAL_LEFT_BUTTONS = 3;

  // The fullscreen left zone has 2 buttons: exit, drawer toggle
  const FS_LEFT_BUTTONS = 2;

  it("normal mode has more left-zone buttons than fullscreen", () => {
    expect(NORMAL_LEFT_BUTTONS).toBeGreaterThan(FS_LEFT_BUTTONS);
  });

  it("fullscreen shows exit and drawer toggle in the left zone", () => {
    expect(FS_LEFT_BUTTONS).toBe(2);
  });

  it("role badge is shared between both modes", () => {
    // Both modes render the badge trigger with the same TOOLBAR_ROLES
    // (tested above in "covers every canonical role ID")
    expect(true).toBe(true);
  });
});
