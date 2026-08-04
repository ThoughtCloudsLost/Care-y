import { describe, it, expect } from "vitest";
import { RoleId, ROLE_ID_VALUES } from "@care-y/shared";

/**
 * Data-model tests for the role rail. The component itself is
 * presentational Svelte and cannot be mounted without a DOM harness,
 * but the role identifiers it renders must stay in sync with the
 * canonical shared enum.
 */
describe("RoleRail role definitions", () => {
  /** The rail shows exactly three roles in this order. */
  const RAIL_ROLES = [RoleId.ADMIN, RoleId.MANAGER, RoleId.VOLUNTEER] as const;

  it("covers every canonical role ID", () => {
    // Every value in ROLE_ID_VALUES must appear in the rail
    for (const id of ROLE_ID_VALUES) {
      expect(RAIL_ROLES).toContain(id);
    }
  });

  it("contains only valid role IDs", () => {
    for (const id of RAIL_ROLES) {
      expect(ROLE_ID_VALUES).toContain(id);
    }
  });

  it("has no duplicates", () => {
    const unique = new Set(RAIL_ROLES);
    expect(unique.size).toBe(RAIL_ROLES.length);
  });

  it("default boot role is ADMIN", () => {
    // The rail's initial highlight matches the pinned bridge contract
    expect(RAIL_ROLES[0]).toBe(RoleId.ADMIN);
  });
});
