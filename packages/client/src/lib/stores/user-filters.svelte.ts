/**
 * Admin user list filter store. Client-side only (the user list is
 * small enough to filter in-memory without server params).
 *
 * Dimensions:
 * - roles (multi-select): filter by VOLUNTEER / MANAGER / ADMIN
 * - statuses (multi-select): filter by active / inactive
 * - keyStatus (multi-select): ok / no_keys / no_org_key
 * - sort: name / role / status, asc/desc
 */

import { SvelteSet } from "svelte/reactivity";
import type { RoleIdValue } from "@care-y/shared";

export type UserSortField = "name" | "role" | "status";
export type SortDirection = "asc" | "desc";
export type UserStatus = "active" | "inactive";
export type KeyStatus = "ok" | "no_keys" | "no_org_key";

export interface UserSortConfig {
  readonly field: UserSortField;
  readonly direction: SortDirection;
}

function createUserFilterStore(): {
  readonly roles: SvelteSet<RoleIdValue>;
  toggleRole(v: RoleIdValue): void;
  readonly statuses: SvelteSet<UserStatus>;
  toggleStatus(v: UserStatus): void;
  readonly keyStatuses: SvelteSet<KeyStatus>;
  toggleKeyStatus(v: KeyStatus): void;
  readonly queueIds: SvelteSet<string>;
  toggleQueueId(v: string): void;
  readonly sort: UserSortConfig;
  setSort(field: UserSortField, direction: SortDirection): void;
  readonly activeCount: number;
  clearAll(): void;
} {
  const roles = new SvelteSet<RoleIdValue>();
  const statuses = new SvelteSet<UserStatus>();
  const keyStatuses = new SvelteSet<KeyStatus>();
  const queueIds = new SvelteSet<string>();

  let sort = $state<UserSortConfig>({
    field: "name",
    direction: "asc",
  });

  const activeCount = $derived(
    (roles.size > 0 ? 1 : 0) +
      (statuses.size > 0 ? 1 : 0) +
      (keyStatuses.size > 0 ? 1 : 0) +
      (queueIds.size > 0 ? 1 : 0),
  );

  return {
    get roles(): SvelteSet<RoleIdValue> {
      return roles;
    },
    toggleRole(v: RoleIdValue): void {
      if (roles.has(v)) roles.delete(v);
      else roles.add(v);
    },

    get statuses(): SvelteSet<UserStatus> {
      return statuses;
    },
    toggleStatus(v: UserStatus): void {
      if (statuses.has(v)) statuses.delete(v);
      else statuses.add(v);
    },

    get keyStatuses(): SvelteSet<KeyStatus> {
      return keyStatuses;
    },
    toggleKeyStatus(v: KeyStatus): void {
      if (keyStatuses.has(v)) keyStatuses.delete(v);
      else keyStatuses.add(v);
    },

    get queueIds(): SvelteSet<string> {
      return queueIds;
    },
    toggleQueueId(v: string): void {
      if (queueIds.has(v)) queueIds.delete(v);
      else queueIds.add(v);
    },

    get sort(): UserSortConfig {
      return sort;
    },
    setSort(field: UserSortField, direction: SortDirection): void {
      sort = { field, direction };
    },

    get activeCount(): number {
      return activeCount;
    },

    clearAll(): void {
      roles.clear();
      statuses.clear();
      keyStatuses.clear();
      queueIds.clear();
    },
  };
}

export const userFilterStore = createUserFilterStore();
