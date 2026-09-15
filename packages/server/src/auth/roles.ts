import {
  RoleId,
  Permission,
  ErrorCode,
  ROLE_ID_VALUES,
  type RoleIdValue,
  type OrgSchema,
  type UserId,
} from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ForbiddenError, ConfigError } from "../errors.js";

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

/**
 * Defaults an org can change. Each key sits at the level that gated its
 * operations before the permission rewrite, so no role gains or loses an
 * ability by default.
 *
 * The four client-contact keys sit at volunteer level because reaching a
 * client was previously ungated: the relay checked only for a session.
 * An org that wants a back-office role withholds them deliberately rather
 * than discovering on day one that nobody can answer anyone.
 */
const VOLUNTEER_PERMISSIONS: ReadonlySet<Permission> = new Set([
  // The case record
  Permission.VIEW_CASES,
  Permission.OPEN_CASES,
  Permission.EDIT_CASE_SUMMARY,
  Permission.WRITE_CASE_NOTES,
  Permission.CHANGE_CASE_STATUS,
  Permission.LINK_CASES,
  Permission.CLAIM_CASES,
  Permission.ASSIGN_CASES,
  Permission.DOWNLOAD_CASE_MEDIA,
  // Reaching a client
  Permission.SEND_CLIENT_SMS,
  Permission.SEND_CLIENT_MEDIA,
  Permission.SEND_CLIENT_EMAIL,
  Permission.CALL_CLIENTS,
  Permission.MESSAGE_CLIENTS_IN_PORTAL,
  // The client's own access to a case
  Permission.MANAGE_SHARE_LINKS,
  Permission.MANAGE_PORTAL_CHANNEL,
  Permission.RESET_CLIENT_LOGIN,
  Permission.REVOKE_REPLY_LINKS,
  // Knowledge base
  Permission.VIEW_KNOWLEDGE_BASE,
  Permission.EDIT_KNOWLEDGE_BASE,
  // Declared, no feature yet
  Permission.VIEW_OWN_SHIFTS,
]);

const MANAGER_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...VOLUNTEER_PERMISSIONS,
  Permission.VIEW_CLIENTS,
  Permission.EDIT_CLIENT_CONTACT,
  Permission.MERGE_CLIENTS,
  Permission.DELETE_CLIENTS,
  Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
  Permission.DELETE_KNOWLEDGE_BASE_ARTICLES,
  // Managers designed intake forms before this key existed: the old
  // MANAGE_QUEUES sat at manager level and gated the form designer and
  // nothing else. Inheriting by operation rather than by name keeps it
  // here, and an org that wants it admin-only withholds it.
  Permission.MANAGE_INTAKE_FORMS,
  Permission.MANAGE_PRESETS,
  Permission.VIEW_REPORTS,
  Permission.VIEW_AUDIT_LOG,
]);

const ADMIN_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...MANAGER_PERMISSIONS,
  Permission.DELETE_OTHERS_NOTES,
  Permission.VIEW_CLIENT_PII,
  Permission.EDIT_CLIENT_ALIAS,
  Permission.MANAGE_QUEUES,
  Permission.MANAGE_QUEUE_MEMBERSHIP,
  Permission.MANAGE_QUEUE_NOTIFICATIONS,
  Permission.VIEW_INTAKE_RESPONSES,
  Permission.MANAGE_ROLES,
  Permission.MANAGE_USERS,
  Permission.MANAGE_ORG_IDENTITY,
  Permission.MANAGE_CHANNEL_ROUTING,
  Permission.MANAGE_RETENTION,
  Permission.MANAGE_NOTE_TYPES,
  Permission.MANAGE_KEYS,
  Permission.MANAGE_INFRASTRUCTURE,
  Permission.WRITE_CALL_GREETINGS,
  Permission.WRITE_AUTOMATIC_REPLIES,
  Permission.MANAGE_VOICEMAIL_QUARANTINE,
  Permission.MANAGE_ESCALATION,
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
  orgSchema: OrgSchema,
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
  orgSchema: OrgSchema,
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
  orgSchema: OrgSchema,
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
export function invalidateRolePermissionCache(orgSchema: OrgSchema): void {
  permissionCache.delete(orgSchema);
}

/**
 * Refuse to boot when the process-local in-memory permission cache would run
 * across more than one app instance. Each instance caches overrides
 * independently, so an invalidation on one instance (after a role override
 * mutation) would not propagate to the others: they would keep serving the
 * revoked permission set until their process restarts. A shared-store
 * implementation (same cache interface) must back multi-instance deployments;
 * until one is wired, multi-instance is unsupported.
 */
export function assertSingleInstancePermissionCache(
  multiInstance: boolean,
): void {
  if (multiInstance) {
    throw new ConfigError(
      "In-memory role permission cache is not safe across multiple app " +
        "instances. Configure a shared-store permission cache before " +
        "enabling APP_MULTI_INSTANCE.",
    );
  }
}

// ---------------------------------------------------------------------------
// Permission holder query (shared by intake services)
// ---------------------------------------------------------------------------

/**
 * Returns active user IDs with vol_public who hold the given permission
 * in any role, accounting for per-org permission overrides.
 *
 * Used by intake-conversion-service and intake-response-service to build
 * the set of principals who should receive ECIES wraps.
 */
export async function getUsersWithPermission(
  db: Kysely<TenantDatabase>,
  orgSchema: OrgSchema,
  permission: Permission,
): Promise<Map<UserId, Buffer>> {
  const rolesWithPerm: RoleIdValue[] = [];
  for (const roleId of ROLE_ID_VALUES) {
    const perms = await getEffectivePermissions(db, orgSchema, roleId);
    if (perms.has(permission)) {
      rolesWithPerm.push(roleId);
    }
  }

  if (rolesWithPerm.length === 0) return new Map();

  const users = await db
    .selectFrom("users")
    .innerJoin("user_keys", "user_keys.user_id", "users.id")
    .select(["users.id", "user_keys.vol_public"])
    .where("users.role_id", "in", rolesWithPerm)
    .where("users.is_active", "=", true)
    .where("user_keys.vol_public", "is not", null)
    .execute();

  const result = new Map<UserId, Buffer>();
  for (const u of users) {
    if (u.vol_public !== null) {
      result.set(u.id, u.vol_public);
    }
  }
  return result;
}

/** All known Permission string values, for type-guard lookups. */
const KNOWN_PERMISSIONS: ReadonlySet<string> = new Set(
  Object.values(Permission),
);

/** Type guard for known Permission enum values. */
function isKnownPermission(value: string): value is Permission {
  return KNOWN_PERMISSIONS.has(value);
}

// ---------------------------------------------------------------------------
// Role permission override repository (thin DB access for the auth router)
// ---------------------------------------------------------------------------

/**
 * Returns all override rows for the org. Used by getRolePermissions to
 * compute which permissions differ from the ROLE_CONFIG default.
 */
export async function listAllOverrides(
  tDb: Kysely<TenantDatabase>,
): Promise<
  readonly { role_id: string; permission: string; enabled: boolean }[]
> {
  return tDb
    .selectFrom("role_permission_overrides")
    .select(["role_id", "permission", "enabled"])
    .execute();
}

/**
 * Returns the set of overridden permission names for a role by comparing
 * the effective set against the ROLE_CONFIG defaults. A permission is
 * "overridden" if an explicit DB row exists that differs from the default.
 */
export function computeOverridden(
  roleId: RoleIdValue,
  overrideRows: readonly {
    role_id: string;
    permission: string;
    enabled: boolean;
  }[],
): readonly Permission[] {
  const roleRows = overrideRows.filter((r) => r.role_id === roleId);
  const result: Permission[] = [];
  for (const row of roleRows) {
    if (isKnownPermission(row.permission)) {
      result.push(row.permission);
    }
  }
  return result;
}

/**
 * Returns true if the given permission is enabled by default for the role.
 */
export function isDefaultEnabled(
  roleId: RoleIdValue,
  permission: Permission,
): boolean {
  const config = ROLE_CONFIG.get(roleId);
  if (!config) return false;
  return config.permissions.has(permission);
}

/**
 * Upserts a role permission override row. If a row for (role_id, permission)
 * already exists, updates its enabled flag; otherwise inserts a new row.
 */
export async function upsertOverride(
  tDb: Kysely<TenantDatabase>,
  roleId: RoleIdValue,
  permission: Permission,
  enabled: boolean,
): Promise<void> {
  await tDb
    .insertInto("role_permission_overrides")
    .values({ role_id: roleId, permission, enabled })
    .onConflict((oc) =>
      oc.columns(["role_id", "permission"]).doUpdateSet({ enabled }),
    )
    .execute();
}

/**
 * Deletes the override row for a specific (role_id, permission) pair.
 * Called when the caller sets a permission back to its ROLE_CONFIG default,
 * keeping the table sparse.
 */
export async function deleteOverride(
  tDb: Kysely<TenantDatabase>,
  roleId: RoleIdValue,
  permission: Permission,
): Promise<void> {
  await tDb
    .deleteFrom("role_permission_overrides")
    .where("role_id", "=", roleId)
    .where("permission", "=", permission)
    .execute();
}

/**
 * Deletes all role permission override rows for the org (full reset).
 */
export async function deleteAllOverrides(
  tDb: Kysely<TenantDatabase>,
): Promise<void> {
  await tDb.deleteFrom("role_permission_overrides").execute();
}
