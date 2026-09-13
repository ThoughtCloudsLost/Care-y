import { describe, it, expect, beforeEach } from "vitest";
import {
  RoleId,
  Permission,
  ROLE_ID_VALUES,
  type OrgSchema,
} from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  ROLE_CONFIG,
  hasPermission,
  isValidRoleId,
  getDefaultRoleId,
  LOCKED_PERMISSIONS,
  mergePermissions,
  getEffectivePermissions,
  hasPermissionForOrg,
  invalidateRolePermissionCache,
} from "./roles.js";

/** Shorthand cast for test org schema names. */
const schema = (s: string): OrgSchema => s as OrgSchema;

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

describe("LOCKED_PERMISSIONS", () => {
  it("contains MANAGE_KEYS, MANAGE_ROLES, MANAGE_INFRASTRUCTURE", () => {
    expect(LOCKED_PERMISSIONS.has(Permission.MANAGE_KEYS)).toBe(true);
    expect(LOCKED_PERMISSIONS.has(Permission.MANAGE_ROLES)).toBe(true);
    expect(LOCKED_PERMISSIONS.has(Permission.MANAGE_INFRASTRUCTURE)).toBe(true);
  });

  it("contains exactly three permissions", () => {
    expect(LOCKED_PERMISSIONS.size).toBe(3);
  });
});

describe("mergePermissions", () => {
  it("returns defaults when no overrides exist", () => {
    const result = mergePermissions(RoleId.VOLUNTEER, []);
    const defaults = ROLE_CONFIG.get(RoleId.VOLUNTEER)!.permissions;
    expect(result.size).toBe(defaults.size);
    for (const perm of defaults) {
      expect(result.has(perm)).toBe(true);
    }
  });

  it("adds a permission when override has enabled=true", () => {
    const result = mergePermissions(RoleId.VOLUNTEER, [
      { permission: Permission.VIEW_REPORTS, enabled: true },
    ]);
    expect(result.has(Permission.VIEW_REPORTS)).toBe(true);
  });

  it("removes a permission when override has enabled=false", () => {
    const result = mergePermissions(RoleId.VOLUNTEER, [
      { permission: Permission.VIEW_TICKETS, enabled: false },
    ]);
    expect(result.has(Permission.VIEW_TICKETS)).toBe(false);
  });

  it("ignores unknown permission strings", () => {
    const defaults = ROLE_CONFIG.get(RoleId.VOLUNTEER)!.permissions;
    const result = mergePermissions(RoleId.VOLUNTEER, [
      { permission: "nonexistent_future_permission", enabled: true },
    ]);
    expect(result.size).toBe(defaults.size);
  });

  it("forces locked permissions present for Admin even when rows disable them", () => {
    const result = mergePermissions(RoleId.ADMIN, [
      { permission: Permission.MANAGE_KEYS, enabled: false },
      { permission: Permission.MANAGE_ROLES, enabled: false },
      { permission: Permission.MANAGE_INFRASTRUCTURE, enabled: false },
    ]);
    expect(result.has(Permission.MANAGE_KEYS)).toBe(true);
    expect(result.has(Permission.MANAGE_ROLES)).toBe(true);
    expect(result.has(Permission.MANAGE_INFRASTRUCTURE)).toBe(true);
  });

  it("forces locked permissions absent for Volunteer even when rows enable them", () => {
    const result = mergePermissions(RoleId.VOLUNTEER, [
      { permission: Permission.MANAGE_KEYS, enabled: true },
      { permission: Permission.MANAGE_ROLES, enabled: true },
      { permission: Permission.MANAGE_INFRASTRUCTURE, enabled: true },
    ]);
    expect(result.has(Permission.MANAGE_KEYS)).toBe(false);
    expect(result.has(Permission.MANAGE_ROLES)).toBe(false);
    expect(result.has(Permission.MANAGE_INFRASTRUCTURE)).toBe(false);
  });

  it("forces locked permissions absent for Manager even when rows enable them", () => {
    const result = mergePermissions(RoleId.MANAGER, [
      { permission: Permission.MANAGE_KEYS, enabled: true },
      { permission: Permission.MANAGE_ROLES, enabled: true },
      { permission: Permission.MANAGE_INFRASTRUCTURE, enabled: true },
    ]);
    expect(result.has(Permission.MANAGE_KEYS)).toBe(false);
    expect(result.has(Permission.MANAGE_ROLES)).toBe(false);
    expect(result.has(Permission.MANAGE_INFRASTRUCTURE)).toBe(false);
  });

  it("applies non-locked overrides correctly alongside lock enforcement", () => {
    // Grant VIEW_REPORTS to Volunteer, also try to grant MANAGE_KEYS (locked)
    const result = mergePermissions(RoleId.VOLUNTEER, [
      { permission: Permission.VIEW_REPORTS, enabled: true },
      { permission: Permission.MANAGE_KEYS, enabled: true },
    ]);
    expect(result.has(Permission.VIEW_REPORTS)).toBe(true);
    expect(result.has(Permission.MANAGE_KEYS)).toBe(false);
  });

  it("handles multiple overrides for the same permission (last wins)", () => {
    const result = mergePermissions(RoleId.VOLUNTEER, [
      { permission: Permission.VIEW_REPORTS, enabled: true },
      { permission: Permission.VIEW_REPORTS, enabled: false },
    ]);
    // Second override (false) wins because it's applied later
    expect(result.has(Permission.VIEW_REPORTS)).toBe(false);
  });
});

describe("getEffectivePermissions + cache", () => {
  let queryCount: number;

  function createStubTDb(
    rows: Array<{ role_id: string; permission: string; enabled: boolean }>,
  ): Kysely<TenantDatabase> {
    // Minimal stub that tracks query count and returns the given rows
    return {
      selectFrom: () => ({
        select: () => ({
          execute: async () => {
            queryCount++;
            return rows;
          },
        }),
      }),
    } as unknown as Kysely<TenantDatabase>;
  }

  beforeEach(() => {
    queryCount = 0;
    // Clear the module-level cache between tests
    invalidateRolePermissionCache(schema("test_org"));
    invalidateRolePermissionCache(schema("other_org"));
  });

  it("returns default permissions when no override rows exist", async () => {
    const tDb = createStubTDb([]);
    const result = await getEffectivePermissions(
      tDb,
      schema("test_org"),
      RoleId.VOLUNTEER,
    );
    const defaults = ROLE_CONFIG.get(RoleId.VOLUNTEER)!.permissions;
    expect(result.size).toBe(defaults.size);
    for (const perm of defaults) {
      expect(result.has(perm)).toBe(true);
    }
  });

  it("applies override rows to the effective set", async () => {
    const tDb = createStubTDb([
      {
        role_id: RoleId.VOLUNTEER,
        permission: Permission.VIEW_REPORTS,
        enabled: true,
      },
    ]);
    const result = await getEffectivePermissions(
      tDb,
      schema("test_org"),
      RoleId.VOLUNTEER,
    );
    expect(result.has(Permission.VIEW_REPORTS)).toBe(true);
  });

  it("caches results (second call issues no query)", async () => {
    const tDb = createStubTDb([]);
    await getEffectivePermissions(tDb, schema("test_org"), RoleId.VOLUNTEER);
    expect(queryCount).toBe(1);

    await getEffectivePermissions(tDb, schema("test_org"), RoleId.VOLUNTEER);
    expect(queryCount).toBe(1);

    // Different role in the same org also cached (filled all three roles)
    await getEffectivePermissions(tDb, schema("test_org"), RoleId.MANAGER);
    expect(queryCount).toBe(1);
  });

  it("invalidation forces a reload on the next call", async () => {
    const tDb = createStubTDb([]);
    await getEffectivePermissions(tDb, schema("test_org"), RoleId.VOLUNTEER);
    expect(queryCount).toBe(1);

    invalidateRolePermissionCache(schema("test_org"));

    await getEffectivePermissions(tDb, schema("test_org"), RoleId.VOLUNTEER);
    expect(queryCount).toBe(2);
  });

  it("invalidation of org A does not affect org B cache", async () => {
    // Stub DBs are built inline below with per-org query counters.
    let countA = 0;
    let countB = 0;

    const stubA = {
      selectFrom: () => ({
        select: () => ({
          execute: async () => {
            countA++;
            return [];
          },
        }),
      }),
    } as unknown as Kysely<TenantDatabase>;

    const stubB = {
      selectFrom: () => ({
        select: () => ({
          execute: async () => {
            countB++;
            return [];
          },
        }),
      }),
    } as unknown as Kysely<TenantDatabase>;

    await getEffectivePermissions(stubA, schema("test_org"), RoleId.VOLUNTEER);
    await getEffectivePermissions(stubB, schema("other_org"), RoleId.VOLUNTEER);
    expect(countA).toBe(1);
    expect(countB).toBe(1);

    invalidateRolePermissionCache(schema("test_org"));

    await getEffectivePermissions(stubA, schema("test_org"), RoleId.VOLUNTEER);
    await getEffectivePermissions(stubB, schema("other_org"), RoleId.VOLUNTEER);
    expect(countA).toBe(2);
    expect(countB).toBe(1); // org B was not invalidated
  });

  it("fills all three roles on a single cache miss", async () => {
    const tDb = createStubTDb([
      {
        role_id: RoleId.VOLUNTEER,
        permission: Permission.VIEW_REPORTS,
        enabled: true,
      },
      {
        role_id: RoleId.MANAGER,
        permission: Permission.VIEW_TICKETS,
        enabled: false,
      },
    ]);

    // First call fills all roles
    const vol = await getEffectivePermissions(
      tDb,
      schema("test_org"),
      RoleId.VOLUNTEER,
    );
    expect(queryCount).toBe(1);
    expect(vol.has(Permission.VIEW_REPORTS)).toBe(true);

    // Manager and Admin are already cached
    const mgr = await getEffectivePermissions(
      tDb,
      schema("test_org"),
      RoleId.MANAGER,
    );
    expect(queryCount).toBe(1);
    expect(mgr.has(Permission.VIEW_TICKETS)).toBe(false);

    const admin = await getEffectivePermissions(
      tDb,
      schema("test_org"),
      RoleId.ADMIN,
    );
    expect(queryCount).toBe(1);
    // Admin defaults are untouched (no overrides for admin role in the stub)
    expect(admin.has(Permission.MANAGE_KEYS)).toBe(true);
  });
});

describe("hasPermissionForOrg", () => {
  function createStubTDb(
    rows: Array<{ role_id: string; permission: string; enabled: boolean }>,
  ): Kysely<TenantDatabase> {
    return {
      selectFrom: () => ({
        select: () => ({
          execute: async () => rows,
        }),
      }),
    } as unknown as Kysely<TenantDatabase>;
  }

  beforeEach(() => {
    invalidateRolePermissionCache(schema("perm_test_org"));
  });

  it("returns true when role has the permission by default", async () => {
    const tDb = createStubTDb([]);
    const result = await hasPermissionForOrg(
      tDb,
      schema("perm_test_org"),
      RoleId.VOLUNTEER,
      Permission.VIEW_TICKETS,
    );
    expect(result).toBe(true);
  });

  it("returns false when role lacks the permission by default", async () => {
    const tDb = createStubTDb([]);
    const result = await hasPermissionForOrg(
      tDb,
      schema("perm_test_org"),
      RoleId.VOLUNTEER,
      Permission.MANAGE_USERS,
    );
    expect(result).toBe(false);
  });

  it("returns true when override grants a missing permission", async () => {
    const tDb = createStubTDb([
      {
        role_id: RoleId.VOLUNTEER,
        permission: Permission.VIEW_REPORTS,
        enabled: true,
      },
    ]);
    const result = await hasPermissionForOrg(
      tDb,
      schema("perm_test_org"),
      RoleId.VOLUNTEER,
      Permission.VIEW_REPORTS,
    );
    expect(result).toBe(true);
  });

  it("returns false when override revokes a default permission", async () => {
    const tDb = createStubTDb([
      {
        role_id: RoleId.VOLUNTEER,
        permission: Permission.VIEW_TICKETS,
        enabled: false,
      },
    ]);
    const result = await hasPermissionForOrg(
      tDb,
      schema("perm_test_org"),
      RoleId.VOLUNTEER,
      Permission.VIEW_TICKETS,
    );
    expect(result).toBe(false);
  });

  it("returns false for an invalid role ID", async () => {
    const tDb = createStubTDb([]);
    const result = await hasPermissionForOrg(
      tDb,
      schema("perm_test_org"),
      "invalid-role-id",
      Permission.VIEW_TICKETS,
    );
    expect(result).toBe(false);
  });

  it("enforces locks: Volunteer cannot gain MANAGE_KEYS via override", async () => {
    const tDb = createStubTDb([
      {
        role_id: RoleId.VOLUNTEER,
        permission: Permission.MANAGE_KEYS,
        enabled: true,
      },
    ]);
    const result = await hasPermissionForOrg(
      tDb,
      schema("perm_test_org"),
      RoleId.VOLUNTEER,
      Permission.MANAGE_KEYS,
    );
    expect(result).toBe(false);
  });

  it("enforces locks: Admin cannot lose MANAGE_KEYS via override", async () => {
    const tDb = createStubTDb([
      {
        role_id: RoleId.ADMIN,
        permission: Permission.MANAGE_KEYS,
        enabled: false,
      },
    ]);
    const result = await hasPermissionForOrg(
      tDb,
      schema("perm_test_org"),
      RoleId.ADMIN,
      Permission.MANAGE_KEYS,
    );
    expect(result).toBe(true);
  });
});
