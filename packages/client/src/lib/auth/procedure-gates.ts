/**
 * Permission gate helpers for client-side visibility checks.
 *
 * Three sources, checked in this order:
 *
 *  1. Procedure gate (canCall): the control fronts a single tRPC
 *     procedure. The PROCEDURE_PERMISSIONS manifest is test-locked to
 *     the server router, so a wrong or stale entry fails CI.
 *
 *  2. Admin surface (canEnterAdminRoute in destinations.ts): the
 *     control guards an admin page or tab whose admission is derived
 *     from the destination registry.
 *
 *  3. Inline-checked capability (canUseInline): the server checks
 *     the permission inside a resolver rather than through procedure
 *     middleware, so no manifest path exists. The
 *     INLINE_CHECKED_CAPABILITIES map is test-locked to the server's
 *     INLINE_CHECKED list.
 *
 *  4. Anything else needs explicit user approval and stays as a raw
 *     Permission literal in the ESLint allowlist.
 */

import {
  PROCEDURE_PERMISSIONS,
  INLINE_CHECKED_CAPABILITIES,
  type GatedProcedurePath,
  type InlineCheckedCapability,
  type Permission,
} from "@care-y/shared";

// Map lookups rather than bracket access: the exported signatures already
// forbid unknown keys at the call site, and a Map keeps the
// security/detect-object-injection lint rule satisfied without a disable.
const procedurePermissionByPath: ReadonlyMap<string, Permission> = new Map(
  Object.entries(PROCEDURE_PERMISSIONS),
);

const inlinePermissionByCapability: ReadonlyMap<string, Permission> = new Map(
  Object.entries(INLINE_CHECKED_CAPABILITIES),
);

/**
 * Returns true when the given permissions set satisfies the permission
 * required by the named tRPC procedure.
 *
 * The path parameter is typed as `GatedProcedurePath`, so a nonexistent
 * procedure path is a compile error.
 */
export function canCall(
  permissions: ReadonlySet<Permission>,
  path: GatedProcedurePath,
): boolean {
  const required = procedurePermissionByPath.get(path);
  return required !== undefined && permissions.has(required);
}

/**
 * Returns true when the given permissions set satisfies the permission
 * for a capability the server checks inside a resolver (no procedure
 * metadata exists by design).
 *
 * The capability parameter is typed as `InlineCheckedCapability`, so a
 * nonexistent capability key is a compile error.
 */
export function canUseInline(
  permissions: ReadonlySet<Permission>,
  capability: InlineCheckedCapability,
): boolean {
  const required = inlinePermissionByCapability.get(capability);
  return required !== undefined && permissions.has(required);
}
