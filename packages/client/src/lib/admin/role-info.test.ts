import { describe, it, expect } from "vitest";
import { ROLE_ID_VALUES } from "@care-y/shared";
import { getRoleInfo } from "./role-info";

const VOLUNTEER_ID = ROLE_ID_VALUES[0]!;
const MANAGER_ID = ROLE_ID_VALUES[1]!;
const ADMIN_ID = ROLE_ID_VALUES[2]!;

describe("getRoleInfo", () => {
  it("maps the admin role to the /admin hub", () => {
    const info = getRoleInfo(ADMIN_ID);
    expect(info.path).toBe("/admin");
    expect(info.name.length).toBeGreaterThan(0);
  });

  it("maps the manager role to /admin/manager", () => {
    const info = getRoleInfo(MANAGER_ID);
    expect(info.path).toBe("/admin/manager");
    expect(info.name.length).toBeGreaterThan(0);
  });

  it("maps the volunteer role to /admin/volunteer", () => {
    const info = getRoleInfo(VOLUNTEER_ID);
    expect(info.path).toBe("/admin/volunteer");
    expect(info.name.length).toBeGreaterThan(0);
  });

  it("resolves the volunteer mapping for unknown role IDs", () => {
    expect(getRoleInfo("not-a-role").path).toBe("/admin/volunteer");
    expect(getRoleInfo("").path).toBe("/admin/volunteer");
  });

  it("resolves manager and volunteer names through org terminology", () => {
    expect(getRoleInfo(MANAGER_ID).name).toBe("Coordinator");
    expect(getRoleInfo(VOLUNTEER_ID).name).toBe("Volunteer");
  });
});
