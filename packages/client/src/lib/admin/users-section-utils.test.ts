import { describe, it, expect, vi } from "vitest";
import { RoleId } from "@care-y/shared";
import {
  deriveKeyStatus,
  buildUserQueueMap,
  filterUsers,
  sortUsers,
  countUsers,
  filterInvites,
  computeQueueDiff,
  hasQueueChanges,
  type UserRecord,
  type UserFilterCriteria,
} from "./users-section-utils.js";

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: "u1",
    roleId: RoleId.VOLUNTEER,
    isActive: true,
    hasKeys: true,
    hasOrgKeyWrap: true,
    encryptedDisplayName: "enc-alice",
    identifier: "alice",
    ...overrides,
  };
}

const emptyFilters: UserFilterCriteria = {
  roles: new Set(),
  statuses: new Set(),
  keyStatuses: new Set(),
  queueIds: new Set(),
};

describe("deriveKeyStatus", () => {
  it("returns 'ok' when user has both keys and org key wrap", () => {
    expect(deriveKeyStatus({ hasKeys: true, hasOrgKeyWrap: true })).toBe("ok");
  });

  it("returns 'no_keys' when user has no keys", () => {
    expect(deriveKeyStatus({ hasKeys: false, hasOrgKeyWrap: false })).toBe(
      "no_keys",
    );
  });

  it("returns 'no_org_key' when user has keys but no org key wrap", () => {
    expect(deriveKeyStatus({ hasKeys: true, hasOrgKeyWrap: false })).toBe(
      "no_org_key",
    );
  });
});

describe("buildUserQueueMap", () => {
  it("builds a map from queue assignments", () => {
    const assignments = [
      { queueId: "q1", userId: "u1" },
      { queueId: "q2", userId: "u1" },
      { queueId: "q1", userId: "u2" },
    ];
    const map = buildUserQueueMap(assignments);

    expect(map.get("u1")).toEqual(new Set(["q1", "q2"]));
    expect(map.get("u2")).toEqual(new Set(["q1"]));
    expect(map.has("u3")).toBe(false);
  });

  it("returns empty map for no assignments", () => {
    expect(buildUserQueueMap([]).size).toBe(0);
  });
});

describe("filterUsers", () => {
  const users: UserRecord[] = [
    makeUser({ id: "u1", roleId: RoleId.ADMIN, isActive: true }),
    makeUser({ id: "u2", roleId: RoleId.VOLUNTEER, isActive: false }),
    makeUser({
      id: "u3",
      roleId: RoleId.MANAGER,
      isActive: true,
      hasKeys: false,
      hasOrgKeyWrap: false,
    }),
  ];
  const noopDecrypt = vi.fn((_id: string, _enc: string) => "Name");
  const emptyQueueMap = new Map<string, Set<string>>();

  it("returns all users with no filters", () => {
    const result = filterUsers(
      users,
      emptyFilters,
      emptyQueueMap,
      "",
      noopDecrypt,
    );
    expect(result).toHaveLength(3);
  });

  it("filters by role", () => {
    const result = filterUsers(
      users,
      { ...emptyFilters, roles: new Set([RoleId.ADMIN]) },
      emptyQueueMap,
      "",
      noopDecrypt,
    );
    expect(result).toHaveLength(1);
    expect(result.at(0)?.id).toBe("u1");
  });

  it("filters by status", () => {
    const result = filterUsers(
      users,
      { ...emptyFilters, statuses: new Set(["inactive"]) },
      emptyQueueMap,
      "",
      noopDecrypt,
    );
    expect(result).toHaveLength(1);
    expect(result.at(0)?.id).toBe("u2");
  });

  it("filters by key status", () => {
    const result = filterUsers(
      users,
      { ...emptyFilters, keyStatuses: new Set(["no_keys"]) },
      emptyQueueMap,
      "",
      noopDecrypt,
    );
    expect(result).toHaveLength(1);
    expect(result.at(0)?.id).toBe("u3");
  });

  it("filters by queue membership", () => {
    const queueMap = new Map([["u2", new Set(["q1"])]]);
    const result = filterUsers(
      users,
      { ...emptyFilters, queueIds: new Set(["q1"]) },
      queueMap,
      "",
      noopDecrypt,
    );
    expect(result).toHaveLength(1);
    expect(result.at(0)?.id).toBe("u2");
  });

  it("filters by search query (min 2 chars)", () => {
    const decrypt = vi.fn((id: string) => (id === "u1" ? "Alice" : "Bob"));
    const result = filterUsers(
      users,
      emptyFilters,
      emptyQueueMap,
      "ali",
      decrypt,
    );
    expect(result).toHaveLength(1);
    expect(result.at(0)?.id).toBe("u1");
  });

  it("skips search filter for queries shorter than 2 chars", () => {
    const result = filterUsers(
      users,
      emptyFilters,
      emptyQueueMap,
      "a",
      noopDecrypt,
    );
    expect(result).toHaveLength(3);
  });

  it("excludes users whose names fail to decrypt", () => {
    const decrypt = vi.fn((_id: string) => null);
    const result = filterUsers(
      users,
      emptyFilters,
      emptyQueueMap,
      "search",
      decrypt,
    );
    expect(result).toHaveLength(0);
  });

  it("combines multiple filters", () => {
    const result = filterUsers(
      users,
      { ...emptyFilters, roles: new Set([RoleId.ADMIN, RoleId.MANAGER]) },
      emptyQueueMap,
      "",
      noopDecrypt,
    );
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.id)).toEqual(["u1", "u3"]);
  });
});

describe("sortUsers", () => {
  const admin = makeUser({ id: "u1", roleId: RoleId.ADMIN, isActive: true });
  const vol = makeUser({
    id: "u2",
    roleId: RoleId.VOLUNTEER,
    isActive: false,
  });
  const mgr = makeUser({ id: "u3", roleId: RoleId.MANAGER, isActive: true });
  const users = [vol, admin, mgr];

  it("sorts by role ascending (admin first)", () => {
    const result = sortUsers(
      users,
      { field: "role", direction: "asc" },
      () => null,
    );
    expect(result.map((u) => u.id)).toEqual(["u1", "u3", "u2"]);
  });

  it("sorts by role descending (volunteer first)", () => {
    const result = sortUsers(
      users,
      { field: "role", direction: "desc" },
      () => null,
    );
    expect(result.map((u) => u.id)).toEqual(["u2", "u3", "u1"]);
  });

  it("sorts by status ascending (active first)", () => {
    const result = sortUsers(
      users,
      { field: "status", direction: "asc" },
      () => null,
    );
    expect(result.at(0)?.isActive).toBe(true);
    expect(result.at(-1)?.isActive).toBe(false);
  });

  it("sorts by name ascending", () => {
    const names: Record<string, string> = {
      u1: "Charlie",
      u2: "Alice",
      u3: "Bob",
    };
    const result = sortUsers(
      users,
      { field: "name", direction: "asc" },
      (id) => names[id] ?? null,
    );
    expect(result.map((u) => u.id)).toEqual(["u2", "u3", "u1"]);
  });

  it("sorts undecryptable names to the end", () => {
    const names: Record<string, string | null> = {
      u1: null,
      u2: "Alice",
      u3: "Bob",
    };
    const result = sortUsers(
      users,
      { field: "name", direction: "asc" },
      (id) => names[id] ?? null,
    );
    expect(result.at(-1)?.id).toBe("u1");
  });
});

describe("countUsers", () => {
  it("counts active and inactive users", () => {
    const users = [{ isActive: true }, { isActive: true }, { isActive: false }];
    expect(countUsers(users)).toEqual({ active: 2, inactive: 1, total: 3 });
  });

  it("returns zeros for empty array", () => {
    expect(countUsers([])).toEqual({ active: 0, inactive: 0, total: 0 });
  });
});

describe("filterInvites", () => {
  const invites = [
    { roleId: RoleId.VOLUNTEER, id: "i1" },
    { roleId: RoleId.ADMIN, id: "i2" },
    { roleId: RoleId.MANAGER, id: "i3" },
  ];

  it("returns all invites when no filter is set", () => {
    expect(filterInvites(invites, new Set())).toHaveLength(3);
  });

  it("filters by role", () => {
    const result = filterInvites(invites, new Set([RoleId.ADMIN]));
    expect(result).toHaveLength(1);
    expect(result.at(0)?.id).toBe("i2");
  });
});

describe("computeQueueDiff", () => {
  it("identifies added and removed queues", () => {
    const current = new Set(["q1", "q3"]);
    const original = new Set(["q1", "q2"]);
    const diff = computeQueueDiff(current, original);
    expect(diff.added).toEqual(["q3"]);
    expect(diff.removed).toEqual(["q2"]);
  });

  it("returns empty arrays when sets are identical", () => {
    const both = new Set(["q1", "q2"]);
    const diff = computeQueueDiff(both, both);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
  });
});

describe("hasQueueChanges", () => {
  it("returns false for identical sets", () => {
    const a = new Set(["q1", "q2"]);
    const b = new Set(["q1", "q2"]);
    expect(hasQueueChanges(a, b)).toBe(false);
  });

  it("returns true for different sizes", () => {
    expect(hasQueueChanges(new Set(["q1"]), new Set(["q1", "q2"]))).toBe(true);
  });

  it("returns true for same size but different members", () => {
    expect(hasQueueChanges(new Set(["q1"]), new Set(["q2"]))).toBe(true);
  });
});
