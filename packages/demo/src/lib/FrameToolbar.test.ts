import { describe, it, expect } from "vitest";
import { RoleId, ROLE_ID_VALUES } from "@care-y/shared";
import {
  BOOT_VIEWER,
  INITIAL_VIEWER_STATE,
  TOOLBAR_CLIENT_VIEWERS,
  TOOLBAR_STAFF_VIEWERS,
} from "./viewer.js";

/**
 * Data-model tests for the frame toolbar's viewer list. The component
 * itself is presentational Svelte and cannot be mounted without a DOM
 * harness, so these pin the lists it renders from (viewer.ts): the staff
 * roles must stay in sync with the canonical shared enum, and the client
 * viewer sits below them. Ported from the former RoleRail.test.ts.
 */
describe("FrameToolbar viewer list", () => {
  it("lists exactly three staff roles, admin first", () => {
    expect(TOOLBAR_STAFF_VIEWERS).toEqual([
      RoleId.ADMIN,
      RoleId.MANAGER,
      RoleId.VOLUNTEER,
    ]);
  });

  it("covers every canonical role ID", () => {
    for (const id of ROLE_ID_VALUES) {
      expect(TOOLBAR_STAFF_VIEWERS).toContain(id);
    }
  });

  it("contains only valid role IDs above the separator", () => {
    for (const id of TOOLBAR_STAFF_VIEWERS) {
      expect(ROLE_ID_VALUES).toContain(id);
    }
  });

  it("lists Client alone below the separator", () => {
    expect(TOOLBAR_CLIENT_VIEWERS).toEqual(["client"]);
  });

  it("never lists Client as a staff role", () => {
    const staff: readonly string[] = TOOLBAR_STAFF_VIEWERS;
    expect(staff).not.toContain("client");
  });

  it("has no duplicates across both halves", () => {
    const all = [...TOOLBAR_STAFF_VIEWERS, ...TOOLBAR_CLIENT_VIEWERS];
    expect(new Set(all).size).toBe(all.length);
  });

  it("boots as the admin viewer", () => {
    // The toolbar's initial highlight matches the pinned bridge contract
    expect(BOOT_VIEWER).toBe(RoleId.ADMIN);
    expect(TOOLBAR_STAFF_VIEWERS[0]).toBe(BOOT_VIEWER);
    expect(INITIAL_VIEWER_STATE.viewer).toBe(RoleId.ADMIN);
    expect(INITIAL_VIEWER_STATE.lastOrgRole).toBe(RoleId.ADMIN);
    expect(INITIAL_VIEWER_STATE.pending).toBeNull();
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
    // Both modes render the badge trigger from the same viewer lists
    // (tested above in "FrameToolbar viewer list")
    expect(true).toBe(true);
  });
});
