import { describe, it, expect } from "vitest";
import { RoleId, Permission, ROLE_ID_VALUES, PACKAGE_NAME } from "./index.js";

/**
 * Public API surface test for @care-y/shared.
 *
 * Justified: this is a barrel export consumed by every other package.
 * These tests guard against accidental removal of re-exports during
 * refactors. They test the public contract ("these symbols exist and
 * have the expected shape"), not internal implementation.
 */
describe("@care-y/shared exports", () => {
  it("exports PACKAGE_NAME constant", () => {
    expect(PACKAGE_NAME).toBe("@care-y/shared");
  });

  it("exports RoleId enum with expected members", () => {
    expect(RoleId.ADMIN).toBeDefined();
    expect(RoleId.MANAGER).toBeDefined();
    expect(RoleId.VOLUNTEER).toBeDefined();
  });

  it("exports Permission enum with expected members", () => {
    expect(Permission.VIEW_TICKETS).toBeDefined();
    expect(Permission.MANAGE_USERS).toBeDefined();
    expect(Permission.MANAGE_ROLES).toBeDefined();
  });

  it("ROLE_ID_VALUES contains all RoleId members", () => {
    expect(ROLE_ID_VALUES).toContain(RoleId.ADMIN);
    expect(ROLE_ID_VALUES).toContain(RoleId.MANAGER);
    expect(ROLE_ID_VALUES).toContain(RoleId.VOLUNTEER);
  });
});
