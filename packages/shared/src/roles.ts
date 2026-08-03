/**
 * Opaque role identifiers stored in the DB.
 * These are deliberately non-descriptive to prevent DB-only attackers
 * from inferring org structure. The mapping to permissions lives in
 * server-side config (packages/server/src/auth/roles.ts).
 *
 * IMPORTANT: Once deployed, these values must never change.
 * The crypto package will encrypt a copy for UI display names.
 */
export const RoleId = {
  VOLUNTEER: "dXwG0zR9BtJp",
  MANAGER: "In1gn8l4eAyp",
  ADMIN: "POFKWG7erXEJ",
} as const;

export type RoleIdValue = (typeof RoleId)[keyof typeof RoleId];

/** All valid role ID values, for Zod validation. */
export const ROLE_ID_VALUES: readonly RoleIdValue[] = [
  RoleId.VOLUNTEER,
  RoleId.MANAGER,
  RoleId.ADMIN,
];

/** Non-empty tuple form required by z.enum(). */
export const ROLE_ID_VALUES_TUPLE: [RoleIdValue, ...RoleIdValue[]] = [
  RoleId.VOLUNTEER,
  RoleId.MANAGER,
  RoleId.ADMIN,
];

/** Hierarchy levels for role comparison. Add new roles here. */
export const ROLE_LEVEL: ReadonlyMap<string, number> = new Map<string, number>([
  [RoleId.VOLUNTEER, 1],
  [RoleId.MANAGER, 2],
  [RoleId.ADMIN, 3],
]);

/** Returns true if the user's role meets or exceeds the minimum required role. */
export function meetsRoleThreshold(
  userRoleId: string,
  minRoleId: string,
): boolean {
  const userLevel = ROLE_LEVEL.get(userRoleId) ?? 0;
  const minLevel = ROLE_LEVEL.get(minRoleId) ?? 0;
  return userLevel >= minLevel;
}

/** Returns true if the given minimum role is above the base volunteer level. */
export function isRoleRestricted(minRoleId: string): boolean {
  return (
    (ROLE_LEVEL.get(minRoleId) ?? 0) > (ROLE_LEVEL.get(RoleId.VOLUNTEER) ?? 0)
  );
}

/** Returns all role IDs at or below the given role's level (for SQL IN filtering). */
export function getAllowedRoleIds(userRoleId: string): RoleIdValue[] {
  const userLevel = ROLE_LEVEL.get(userRoleId) ?? 0;
  return ROLE_ID_VALUES.filter(
    /* v8 ignore next -- defensive fallback: ROLE_LEVEL and ROLE_ID_VALUES derive from the same enum source */
    (id) => (ROLE_LEVEL.get(id) ?? 0) <= userLevel,
  );
}

/**
 * Permissions are action-level, not resource-level.
 * The ticket system adds queue-specific permissions.
 * Append-only after deployment.
 */
export enum Permission {
  // Volunteer-level (all roles have these)
  VIEW_TICKETS = "view_tickets",
  MANAGE_OWN_TICKETS = "manage_own_tickets",
  VIEW_KNOWLEDGE_BASE = "view_knowledge_base",
  EDIT_KNOWLEDGE_BASE = "edit_knowledge_base",
  VIEW_OWN_SHIFTS = "view_own_shifts",

  // Manager-level
  MODERATE_CONTENT = "moderate_content",
  MANAGE_USERS = "manage_users",
  MANAGE_QUEUES = "manage_queues",
  MANAGE_PRESETS = "manage_presets",
  MANAGE_KNOWLEDGE_BASE_CATEGORIES = "manage_knowledge_base_categories",
  VIEW_REPORTS = "view_reports",
  DELETE_CLIENTS = "delete_clients",
  VIEW_CLIENTS = "view_clients",

  // Admin-level
  MANAGE_ROLES = "manage_roles",
  MANAGE_ORG_CONFIG = "manage_org_config",
  MANAGE_KEYS = "manage_keys",
  MANAGE_INFRASTRUCTURE = "manage_infrastructure",
}
