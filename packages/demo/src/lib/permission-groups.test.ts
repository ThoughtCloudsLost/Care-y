import { describe, it, expect } from "vitest";
import { Permission } from "@care-y/shared";
import { GROUPS, PERMISSION_LABELS } from "./permission-groups.js";

describe("permission-groups", () => {
  /** All enum member values extracted from the Permission enum. */
  const allPermissions = Object.values(Permission) as Permission[];

  it("every Permission enum member appears in exactly one group", () => {
    const seen = new Map<Permission, number>();

    for (const group of GROUPS) {
      for (const perm of group.permissions) {
        seen.set(perm, (seen.get(perm) ?? 0) + 1);
      }
    }

    for (const perm of allPermissions) {
      const count = seen.get(perm);
      expect(count, `${perm} missing from all groups`).toBeDefined();
      expect(count, `${perm} appears ${count} times (expected 1)`).toBe(1);
    }

    // No extra permissions in groups that are not in the enum
    const allGroupPerms = GROUPS.flatMap((g) => [...g.permissions]);
    expect(allGroupPerms.length).toBe(allPermissions.length);
  });

  it("every group is non-empty", () => {
    for (const group of GROUPS) {
      expect(group.permissions.length, "empty group found").toBeGreaterThan(0);
    }
  });

  it("label map covers every Permission enum member", () => {
    for (const perm of allPermissions) {
      const entry = PERMISSION_LABELS.get(perm);
      expect(entry, `${perm} missing from PERMISSION_LABELS`).toBeDefined();
      // labelFn should return a non-empty string
      expect(entry!.labelFn().length).toBeGreaterThan(0);
    }
  });

  it("there are exactly 8 groups", () => {
    expect(GROUPS.length).toBe(8);
  });
});
