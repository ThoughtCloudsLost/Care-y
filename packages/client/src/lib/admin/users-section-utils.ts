import { RoleId } from "@care-y/shared";
import type { KeyStatus } from "$lib/stores/user-filters.svelte.js";
import { normalizeForSearch } from "$lib/search/normalize.js";

export interface UserRecord {
  readonly id: string;
  readonly roleId: string;
  readonly isActive: boolean;
  readonly hasKeys: boolean;
  readonly hasOrgKeyWrap: boolean;
  readonly encryptedDisplayName: string;
  readonly identifier: string;
}

export interface UserFilterCriteria {
  readonly roles: ReadonlySet<string>;
  readonly statuses: ReadonlySet<string>;
  readonly keyStatuses: ReadonlySet<KeyStatus>;
  readonly queueIds: ReadonlySet<string>;
}

export interface UserSortConfig {
  readonly field: "name" | "role" | "status";
  readonly direction: "asc" | "desc";
}

export interface InviteRecord {
  readonly roleId: string;
}

export const ROLE_SORT_ORDER: Readonly<Record<string, number>> = {
  [RoleId.ADMIN]: 0,
  [RoleId.MANAGER]: 1,
  [RoleId.VOLUNTEER]: 2,
};

export function deriveKeyStatus(user: {
  hasKeys: boolean;
  hasOrgKeyWrap: boolean;
}): KeyStatus {
  if (user.hasKeys && user.hasOrgKeyWrap) return "ok";
  if (!user.hasKeys) return "no_keys";
  return "no_org_key";
}

export function buildUserQueueMap(
  assignments: readonly { readonly queueId: string; readonly userId: string }[],
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const a of assignments) {
    let set = map.get(a.userId);
    if (!set) {
      set = new Set<string>();
      map.set(a.userId, set);
    }
    set.add(a.queueId);
  }
  return map;
}

export function filterUsers(
  users: readonly UserRecord[],
  criteria: UserFilterCriteria,
  userQueueMap: Map<string, Set<string>>,
  searchQuery: string,
  decryptName: (userId: string, encrypted: string) => string | null,
): UserRecord[] {
  let result: readonly UserRecord[] = users;

  if (criteria.roles.size > 0) {
    result = result.filter((u) => criteria.roles.has(u.roleId));
  }
  if (criteria.statuses.size > 0) {
    result = result.filter((u) =>
      criteria.statuses.has(u.isActive ? "active" : "inactive"),
    );
  }
  if (criteria.keyStatuses.size > 0) {
    result = result.filter((u) => criteria.keyStatuses.has(deriveKeyStatus(u)));
  }
  if (criteria.queueIds.size > 0) {
    result = result.filter((u) => {
      const userQueues = userQueueMap.get(u.id);
      if (!userQueues) return false;
      for (const qId of criteria.queueIds) {
        if (userQueues.has(qId)) return true;
      }
      return false;
    });
  }

  if (searchQuery.length >= 2) {
    const norm = normalizeForSearch(searchQuery);
    result = result.filter((u) => {
      const name = decryptName(u.id, u.encryptedDisplayName);
      if (name === null) return false;
      return normalizeForSearch(name).includes(norm);
    });
  }

  return [...result];
}

export function sortUsers(
  users: UserRecord[],
  sort: UserSortConfig,
  decryptName: (userId: string, encrypted: string) => string | null,
): UserRecord[] {
  const dir = sort.direction === "asc" ? 1 : -1;
  const sorted = [...users];

  const nameCache = new Map<string, string>();
  if (sort.field === "name") {
    for (const u of sorted) {
      nameCache.set(u.id, decryptName(u.id, u.encryptedDisplayName) ?? "￿");
    }
  }

  sorted.sort((a, b) => {
    switch (sort.field) {
      case "name":
        return (
          dir *
          (nameCache.get(a.id) ?? "￿").localeCompare(nameCache.get(b.id) ?? "￿")
        );
      case "role":
        return (
          dir *
          ((ROLE_SORT_ORDER[a.roleId] ?? 3) - (ROLE_SORT_ORDER[b.roleId] ?? 3))
        );
      case "status": {
        const aVal = a.isActive ? 0 : 1;
        const bVal = b.isActive ? 0 : 1;
        return dir * (aVal - bVal);
      }
      default:
        return 0;
    }
  });

  return sorted;
}

export function countUsers(users: readonly { isActive: boolean }[]): {
  active: number;
  inactive: number;
  total: number;
} {
  let active = 0;
  let inactive = 0;
  for (const u of users) {
    if (u.isActive) active++;
    else inactive++;
  }
  return { active, inactive, total: active + inactive };
}

export function filterInvites<T extends InviteRecord>(
  invites: readonly T[],
  roleFilter: ReadonlySet<string>,
): T[] {
  if (roleFilter.size === 0) return [...invites];
  return invites.filter((inv) => roleFilter.has(inv.roleId));
}

export function computeQueueDiff(
  current: ReadonlySet<string>,
  original: ReadonlySet<string>,
): { added: string[]; removed: string[] } {
  const added = [...current].filter((id) => !original.has(id));
  const removed = [...original].filter((id) => !current.has(id));
  return { added, removed };
}

export function hasQueueChanges(
  current: ReadonlySet<string>,
  original: ReadonlySet<string>,
): boolean {
  if (current.size !== original.size) return true;
  for (const id of current) {
    if (!original.has(id)) return true;
  }
  return false;
}
