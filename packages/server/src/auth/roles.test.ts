import { describe, it, expect } from "vitest";
import { RoleId, Permission, ROLE_ID_VALUES } from "@care-y/shared";
import {
  ROLE_CONFIG,
  hasPermission,
  isValidRoleId,
  getDefaultRoleId,
} from "./roles.js";

describe("ROLE_CONFIG", () => {
  it("has an entry for every RoleId value", () => {
    for (const id of ROLE_ID_VALUES) {
      expect(ROLE_CONFIG.has(id)).toBe(true);
    }
  });

  it("admin permissions are a superset of manager permissions", () => {
    const admin = ROLE_CONFIG.get(RoleId.ADMIN)!;
    const manager = ROLE_CONFIG.get(RoleId.MANAGER)!;
    for (const perm of manager.permissions) {
      expect(admin.permissions.has(perm)).toBe(true);
    }
  });

  it("manager permissions are a superset of volunteer permissions", () => {
    const manager = ROLE_CONFIG.get(RoleId.MANAGER)!;
    const volunteer = ROLE_CONFIG.get(RoleId.VOLUNTEER)!;
    for (const perm of volunteer.permissions) {
      expect(manager.permissions.has(perm)).toBe(true);
    }
  });

  it("roles have strictly increasing level values", () => {
    const volunteer = ROLE_CONFIG.get(RoleId.VOLUNTEER)!;
    const manager = ROLE_CONFIG.get(RoleId.MANAGER)!;
    const admin = ROLE_CONFIG.get(RoleId.ADMIN)!;
    expect(volunteer.level).toBeLessThan(manager.level);
    expect(manager.level).toBeLessThan(admin.level);
  });
});

describe("hasPermission", () => {
  it("returns true for volunteer + VIEW_TICKETS", () => {
    expect(hasPermission(RoleId.VOLUNTEER, Permission.VIEW_TICKETS)).toBe(true);
  });

  it("returns true for manager + MANAGE_USERS", () => {
    expect(hasPermission(RoleId.MANAGER, Permission.MANAGE_USERS)).toBe(true);
  });

  it("returns true for admin + MANAGE_ROLES", () => {
    expect(hasPermission(RoleId.ADMIN, Permission.MANAGE_ROLES)).toBe(true);
  });

  it("returns false for volunteer + MANAGE_ROLES", () => {
    expect(hasPermission(RoleId.VOLUNTEER, Permission.MANAGE_ROLES)).toBe(
      false,
    );
  });

  it("returns false for manager + MANAGE_ROLES", () => {
    expect(hasPermission(RoleId.MANAGER, Permission.MANAGE_ROLES)).toBe(false);
  });

  it("returns false for volunteer + MANAGE_USERS", () => {
    expect(hasPermission(RoleId.VOLUNTEER, Permission.MANAGE_USERS)).toBe(
      false,
    );
  });

  it("returns false for an unknown role ID", () => {
    expect(hasPermission("unknown-role", Permission.VIEW_TICKETS)).toBe(false);
  });

  it("returns false for an empty string role ID", () => {
    expect(hasPermission("", Permission.VIEW_TICKETS)).toBe(false);
  });

  it("allows all three roles to VIEW_TICKETS", () => {
    expect(hasPermission(RoleId.VOLUNTEER, Permission.VIEW_TICKETS)).toBe(true);
    expect(hasPermission(RoleId.MANAGER, Permission.VIEW_TICKETS)).toBe(true);
    expect(hasPermission(RoleId.ADMIN, Permission.VIEW_TICKETS)).toBe(true);
  });
});

describe("isValidRoleId", () => {
  it("returns true for all three known role IDs", () => {
    for (const id of ROLE_ID_VALUES) {
      expect(isValidRoleId(id)).toBe(true);
    }
  });

  it("returns false for the human-readable string 'admin'", () => {
    expect(isValidRoleId("admin")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidRoleId("")).toBe(false);
  });

  it("returns false for an arbitrary unknown string", () => {
    expect(isValidRoleId("super-admin")).toBe(false);
  });
});

describe("getDefaultRoleId", () => {
  it("returns the volunteer role ID", () => {
    expect(getDefaultRoleId()).toBe(RoleId.VOLUNTEER);
  });
});
