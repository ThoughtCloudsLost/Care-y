import { Permission, RoleId } from "@care-y/shared";
import type { RoleIdValue } from "@care-y/shared";
import type {
  UserSortField,
  UserStatus,
  KeyStatus,
} from "$lib/stores/user-filters.svelte.js";
import type { QueueSortField } from "$lib/stores/queue-filters.svelte.js";
import type { ClientSortField } from "$lib/stores/client-filters.svelte.js";

export type PeopleTab = "users" | "queues" | "clients";

export const SORT_FIELDS: readonly UserSortField[] = ["name", "role", "status"];

export const QUEUE_SORT_FIELDS: readonly QueueSortField[] = [
  "order",
  "name",
  "members",
  "open",
  "closed",
  "hold",
];

export const VALID_ROLES: ReadonlySet<string> = new Set([
  RoleId.VOLUNTEER,
  RoleId.MANAGER,
  RoleId.ADMIN,
]);

export const VALID_STATUSES: ReadonlySet<string> = new Set<UserStatus>([
  "active",
  "inactive",
]);

export const VALID_KEY_STATUSES: ReadonlySet<string> = new Set<KeyStatus>([
  "ok",
  "no_keys",
  "no_org_key",
]);

export const CLIENT_SORT_FIELDS: readonly ClientSortField[] = [
  "alias",
  "created_at",
  "ticket_count",
];

export function isPeopleTab(value: string): value is PeopleTab {
  return value === "users" || value === "queues" || value === "clients";
}

export function isClientSortField(value: string): value is ClientSortField {
  return (CLIENT_SORT_FIELDS as readonly string[]).includes(value);
}

export function defaultTab(permissions: ReadonlySet<string>): PeopleTab {
  if (permissions.has(Permission.MANAGE_USERS)) return "users";
  if (permissions.has(Permission.MANAGE_QUEUES)) return "queues";
  if (permissions.has(Permission.VIEW_CLIENTS)) return "clients";
  return "queues";
}

export function isSortField(value: string): value is UserSortField {
  return (SORT_FIELDS as readonly string[]).includes(value);
}

export function isQueueSortField(value: string): value is QueueSortField {
  return (QUEUE_SORT_FIELDS as readonly string[]).includes(value);
}

export function isRoleId(v: string): v is RoleIdValue {
  return VALID_ROLES.has(v);
}

export function isUserStatus(v: string): v is UserStatus {
  return VALID_STATUSES.has(v);
}

export function isKeyStatus(v: string): v is KeyStatus {
  return VALID_KEY_STATUSES.has(v);
}
