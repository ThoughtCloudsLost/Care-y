import {
  RoleId,
  Permission,
  ErrorCode,
  type RoleIdValue,
} from "@care-y/shared";
import { ForbiddenError } from "../errors.js";

export interface RoleConfig {
  readonly id: RoleIdValue;
  /** Human-readable name. Server-side only until crypto provides
   *  encrypted admin config for UI display. */
  readonly displayName: string;
  /** Permissions granted to this role. */
  readonly permissions: ReadonlySet<Permission>;
  /**
   * Hierarchy level for comparison (higher = more privileged).
   * Used only for "at least this role" checks, not exposed to clients.
   */
  readonly level: number;
}

const VOLUNTEER_PERMISSIONS: ReadonlySet<Permission> = new Set([
  Permission.VIEW_TICKETS,
  Permission.MANAGE_OWN_TICKETS,
  Permission.VIEW_KNOWLEDGE_BASE,
  Permission.EDIT_KNOWLEDGE_BASE,
  Permission.VIEW_OWN_SHIFTS,
]);

const MANAGER_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...VOLUNTEER_PERMISSIONS,
  Permission.MODERATE_CONTENT,
  Permission.MANAGE_USERS,
  Permission.MANAGE_QUEUES,
  Permission.MANAGE_PRESETS,
  Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
  Permission.VIEW_REPORTS,
  Permission.DELETE_CLIENTS,
]);

const ADMIN_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...MANAGER_PERMISSIONS,
  Permission.MANAGE_ROLES,
  Permission.MANAGE_ORG_CONFIG,
  Permission.MANAGE_KEYS,
  Permission.MANAGE_INFRASTRUCTURE,
]);

export const ROLE_CONFIG: ReadonlyMap<RoleIdValue, RoleConfig> = new Map([
  [
    RoleId.VOLUNTEER,
    {
      id: RoleId.VOLUNTEER,
      displayName: "Volunteer",
      permissions: VOLUNTEER_PERMISSIONS,
      level: 1,
    },
  ],
  [
    RoleId.MANAGER,
    {
      id: RoleId.MANAGER,
      displayName: "Manager",
      permissions: MANAGER_PERMISSIONS,
      level: 2,
    },
  ],
  [
    RoleId.ADMIN,
    {
      id: RoleId.ADMIN,
      displayName: "Admin",
      permissions: ADMIN_PERMISSIONS,
      level: 3,
    },
  ],
]);

/** Returns true if the given role_id has the specified permission. */
export function hasPermission(roleId: string, permission: Permission): boolean {
  if (!isValidRoleId(roleId)) return false;
  const config = ROLE_CONFIG.get(roleId);
  if (!config) return false;
  return config.permissions.has(permission);
}

/** Returns true if the given role_id is a known, valid role. */
export function isValidRoleId(roleId: string): roleId is RoleIdValue {
  return (
    roleId === RoleId.VOLUNTEER ||
    roleId === RoleId.MANAGER ||
    roleId === RoleId.ADMIN
  );
}

/** Throws ForbiddenError if the role lacks the given permission. */
export function requirePermission(
  roleId: string,
  permission: Permission,
): void {
  if (!hasPermission(roleId, permission)) {
    throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

/** Returns the default role for new user registration. */
export function getDefaultRoleId(): RoleIdValue {
  return RoleId.VOLUNTEER;
}
