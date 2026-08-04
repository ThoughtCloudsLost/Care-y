import {
  RoleId,
  Permission,
  ErrorCode,
  ROLE_ID_VALUES,
  type RoleIdValue,
} from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
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
  Permission.VIEW_CLIENTS,
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

/**
 * Permissions that remain with Admin regardless of DB overrides.
 * Enforced at both write time (the role permission mutations reject) and read time
 * (mergePermissions force-adds for Admin, force-removes for others).
 * A hand-inserted DB row granting MANAGE_KEYS to Volunteer has no effect.
 */
export const LOCKED_PERMISSIONS: ReadonlySet<Permission> = new Set([
  Permission.MANAGE_KEYS,
  Permission.MANAGE_ROLES,
  Permission.MANAGE_INFRASTRUCTURE,
]);

// Module-level cache: orgSchema -> roleId -> effective permission set.
// Single-process server; all override writes flow through the role permission mutations,
// which call invalidateRolePermissionCache. No TTL needed.
const permissionCache = new Map<
  string,
  Map<RoleIdValue, ReadonlySet<Permission>>
>();

/**
 * Returns true if the given role_id has the specified permission
 * using only the hardcoded default map.
 *
 * WARNING: This checks defaults only. Use hasPermissionForOrg wherever
 * org context exists so that per-org overrides and locked-permission
 * enforcement take effect.
 */
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

/**
 * Pure merge helper: computes effective permissions from a role's defaults
 * and a list of override rows. Exported for unit testing without DB access.
 *
 * Algorithm:
 * 1. Start from the role's default permission set (from ROLE_CONFIG).
 * 2. Apply each override: enabled adds the permission, disabled removes it.
 *    Override rows whose permission string is not a known Permission value
 *    are silently ignored (forward-compat with removed permissions).
 * 3. Enforce locks: for Admin, force-add every LOCKED_PERMISSIONS member;
 *    for all other roles, force-remove every LOCKED_PERMISSIONS member.
 */
export function mergePermissions(
  roleId: RoleIdValue,
  overrides: readonly {
    readonly permission: string;
    readonly enabled: boolean;
  }[],
): ReadonlySet<Permission> {
  const config = ROLE_CONFIG.get(roleId);
  if (!config) return new Set<Permission>();

  const result = new Set<Permission>(config.permissions);

  for (const row of overrides) {
    // Ignore unknown permission strings (removed or future permissions)
    if (!isKnownPermission(row.permission)) continue;

    if (row.enabled) {
      result.add(row.permission);
    } else {
      result.delete(row.permission);
    }
  }

  // Lock enforcement (defense in depth against hand-inserted DB rows)
  if (roleId === RoleId.ADMIN) {
    for (const locked of LOCKED_PERMISSIONS) {
      result.add(locked);
    }
  } else {
    for (const locked of LOCKED_PERMISSIONS) {
      result.delete(locked);
    }
  }

  return result;
}

/**
 * Returns the effective permission set for a role in a specific org,
 * accounting for DB overrides and locked-permission enforcement.
 *
 * On cache miss, loads ALL override rows for the org in one query and
 * fills all three role caches at once (avoids per-role queries).
 */
export async function getEffectivePermissions(
  tDb: Kysely<TenantDatabase>,
  orgSchema: string,
  roleId: RoleIdValue,
): Promise<ReadonlySet<Permission>> {
  const orgCache = permissionCache.get(orgSchema);
  const cached = orgCache?.get(roleId);
  if (cached) return cached;

  // Cache miss: load all override rows for this org and fill all roles
  const rows = await tDb
    .selectFrom("role_permission_overrides")
    .select(["role_id", "permission", "enabled"])
    .execute();

  // Group overrides by role_id
  const byRole = new Map<string, { permission: string; enabled: boolean }[]>();
  for (const row of rows) {
    let list = byRole.get(row.role_id);
    if (!list) {
      list = [];
      byRole.set(row.role_id, list);
    }
    list.push({ permission: row.permission, enabled: row.enabled });
  }

  // Compute and cache effective sets for all three roles
  const newOrgCache = new Map<RoleIdValue, ReadonlySet<Permission>>();
  for (const rid of ROLE_ID_VALUES) {
    const roleOverrides = byRole.get(rid) ?? [];
    newOrgCache.set(rid, mergePermissions(rid, roleOverrides));
  }
  permissionCache.set(orgSchema, newOrgCache);

  const result = newOrgCache.get(roleId);
  if (!result) return new Set<Permission>();
  return result;
}

/**
 * Checks a single permission for a role in a specific org. Returns false
 * for invalid role IDs. This is the org-aware replacement for hasPermission
 * in all contexts where org information is available.
 */
export async function hasPermissionForOrg(
  tDb: Kysely<TenantDatabase>,
  orgSchema: string,
  roleId: string,
  permission: Permission,
): Promise<boolean> {
  if (!isValidRoleId(roleId)) return false;
  const effective = await getEffectivePermissions(tDb, orgSchema, roleId);
  return effective.has(permission);
}

/**
 * Async equivalent of requirePermission for org-aware contexts.
 * Throws ForbiddenError if the role lacks the permission after
 * applying org-specific overrides and lock enforcement.
 */
export async function requirePermissionForOrg(
  tDb: Kysely<TenantDatabase>,
  orgSchema: string,
  roleId: string,
  permission: Permission,
): Promise<void> {
  const allowed = await hasPermissionForOrg(tDb, orgSchema, roleId, permission);
  if (!allowed) {
    throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

/**
 * Drops one org's cached permission sets. Must be called from every
 * override mutation (set, reset, delete) so that revoked permissions
 * stop working on the next request, not after some TTL.
 */
export function invalidateRolePermissionCache(orgSchema: string): void {
  permissionCache.delete(orgSchema);
}

/** All known Permission string values, for type-guard lookups. */
const KNOWN_PERMISSIONS: ReadonlySet<string> = new Set(
  Object.values(Permission),
);

/** Type guard for known Permission enum values. */
function isKnownPermission(value: string): value is Permission {
  return KNOWN_PERMISSIONS.has(value);
}
