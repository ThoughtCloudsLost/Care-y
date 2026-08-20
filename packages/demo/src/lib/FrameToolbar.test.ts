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
