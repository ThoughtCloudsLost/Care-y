import { describe, expect, it } from "vitest";
import {
  RoleId,
  ROLE_LEVEL,
  ROLE_ID_VALUES,
  meetsRoleThreshold,
  getAllowedRoleIds,
} from "./roles.js";

describe("meetsRoleThreshold", () => {
  const cases: Array<{
    label: string;
    userRoleId: string;
    minRoleId: string;
    expected: boolean;
  }> = [
    {
      label: "admin meets volunteer threshold",
      userRoleId: RoleId.ADMIN,
      minRoleId: RoleId.VOLUNTEER,
      expected: true,
    },
    {
      label: "volunteer does not meet admin threshold",
      userRoleId: RoleId.VOLUNTEER,
      minRoleId: RoleId.ADMIN,
      expected: false,
    },
    {
      label: "equal roles meet threshold (boundary)",
      userRoleId: RoleId.MANAGER,
      minRoleId: RoleId.MANAGER,
      expected: true,
    },
    {
      label: "unknown userRoleId falls back to 0, fails threshold",
      userRoleId: "unknown-role-id",
      minRoleId: RoleId.VOLUNTEER,
      expected: false,
    },
    {
      label: "unknown minRoleId falls back to 0, passes threshold",
      userRoleId: RoleId.VOLUNTEER,
      minRoleId: "unknown-role-id",
      expected: true,
    },
    {
      label: "both unknown returns true (0 >= 0)",
      userRoleId: "bogus-a",
      minRoleId: "bogus-b",
      expected: true,
    },
  ];

  for (const { label, userRoleId, minRoleId, expected } of cases) {
    it(label, () => {
      expect(meetsRoleThreshold(userRoleId, minRoleId)).toBe(expected);
    });
  }
});

describe("getAllowedRoleIds", () => {
  it("admin gets all role IDs", () => {
    const result = getAllowedRoleIds(RoleId.ADMIN);
    expect(result).toEqual(expect.arrayContaining([...ROLE_ID_VALUES]));
    expect(result).toHaveLength(ROLE_ID_VALUES.length);
  });

  it("volunteer gets only volunteer", () => {
    const result = getAllowedRoleIds(RoleId.VOLUNTEER);
    expect(result).toEqual([RoleId.VOLUNTEER]);
  });

  it("manager gets manager and volunteer", () => {
    const result = getAllowedRoleIds(RoleId.MANAGER);
    expect(result).toEqual(
      expect.arrayContaining([RoleId.VOLUNTEER, RoleId.MANAGER]),
    );
    expect(result).toHaveLength(2);
  });

  it("unknown role gets empty array (level 0, nothing at or below)", () => {
    const result = getAllowedRoleIds("unknown-role-id");
    expect(result).toEqual([]);
  });
});

describe("ROLE_LEVEL", () => {
  it("has an entry for every value in ROLE_ID_VALUES", () => {
    for (const id of ROLE_ID_VALUES) {
      expect(ROLE_LEVEL.has(id)).toBe(true);
    }
  });

  it("levels are strictly ascending: volunteer < manager < admin", () => {
    const vol = ROLE_LEVEL.get(RoleId.VOLUNTEER)!;
    const mgr = ROLE_LEVEL.get(RoleId.MANAGER)!;
    const adm = ROLE_LEVEL.get(RoleId.ADMIN)!;
    expect(vol).toBeLessThan(mgr);
    expect(mgr).toBeLessThan(adm);
  });
});
