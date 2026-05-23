import { describe, it, expect } from "vitest";
import { Permission, RoleId } from "@care-y/shared";
import {
  isPeopleTab,
  defaultTab,
  isSortField,
  isQueueSortField,
  isRoleId,
  isUserStatus,
  isKeyStatus,
} from "./people-utils.js";

describe("isPeopleTab", () => {
  it.each(["users", "queues"])('accepts "%s"', (v) => {
    expect(isPeopleTab(v)).toBe(true);
  });

  it.each(["settings", "admin", "", "Users"])('rejects "%s"', (v) => {
    expect(isPeopleTab(v)).toBe(false);
  });
});

describe("defaultTab", () => {
  it("returns 'users' when MANAGE_USERS permission is present", () => {
    const perms = new Set([Permission.MANAGE_USERS, Permission.MANAGE_QUEUES]);
    expect(defaultTab(perms)).toBe("users");
  });

  it("returns 'queues' when MANAGE_USERS permission is absent", () => {
    const perms = new Set([Permission.MANAGE_QUEUES]);
    expect(defaultTab(perms)).toBe("queues");
  });

  it("returns 'queues' for empty permissions", () => {
    expect(defaultTab(new Set())).toBe("queues");
  });
});

describe("isSortField", () => {
  it.each(["name", "role", "status"])('accepts "%s"', (v) => {
    expect(isSortField(v)).toBe(true);
  });

  it.each(["date", "priority", "", "NAME"])('rejects "%s"', (v) => {
    expect(isSortField(v)).toBe(false);
  });
});

describe("isQueueSortField", () => {
  it.each(["order", "name", "members", "open", "closed", "hold"])(
    'accepts "%s"',
    (v) => {
      expect(isQueueSortField(v)).toBe(true);
    },
  );

  it.each(["date", "role", "", "ORDER"])('rejects "%s"', (v) => {
    expect(isQueueSortField(v)).toBe(false);
  });
});

describe("isRoleId", () => {
  it.each([RoleId.VOLUNTEER, RoleId.MANAGER, RoleId.ADMIN])(
    'accepts "%s"',
    (v) => {
      expect(isRoleId(v)).toBe(true);
    },
  );

  it.each(["unknown_role", "", "super_admin"])('rejects "%s"', (v) => {
    expect(isRoleId(v)).toBe(false);
  });
});

describe("isUserStatus", () => {
  it.each(["active", "inactive"])('accepts "%s"', (v) => {
    expect(isUserStatus(v)).toBe(true);
  });

  it.each(["pending", "banned", "", "Active"])('rejects "%s"', (v) => {
    expect(isUserStatus(v)).toBe(false);
  });
});

describe("isKeyStatus", () => {
  it.each(["ok", "no_keys", "no_org_key"])('accepts "%s"', (v) => {
    expect(isKeyStatus(v)).toBe(true);
  });

  it.each(["expired", "revoked", "", "OK"])('rejects "%s"', (v) => {
    expect(isKeyStatus(v)).toBe(false);
  });
});
