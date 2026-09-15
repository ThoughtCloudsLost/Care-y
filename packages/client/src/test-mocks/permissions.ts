/**
 * Shared vi.mock() helper for permission fixtures.
 *
 * Typed to the Permission enum so that a bare string literal is a compile
 * error. This matters: when every test spelled permissions as plain strings,
 * a rename of an enum member left the tests compiling and passing while
 * granting a permission that no longer existed. Typing the set and the
 * setter to Permission closes that gap.
 *
 * Usage inside a test file:
 *
 *   import { Permission } from "@care-y/shared";
 *   import {
 *     mockPermissions,
 *     setPermissions,
 *     resetPermissions,
 *     getMockPermissions,
 *   } from "$mocks/permissions.js";
 *
 *   vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
 *     ...(await importOriginal<typeof ContextNS>()),
 *     getCurrentPermissions: () => getMockPermissions,
 *   }));
 *
 *   beforeEach(() => {
 *     resetPermissions();          // or setPermissions(Permission.VIEW_CASES);
 *   });
 */

import type { Permission } from "@care-y/shared";

/**
 * The mutable permission set read by getCurrentPermissions mocks.
 * Tests should prefer `setPermissions` / `resetPermissions` over
 * direct mutation, but the set is exported for the rare test that
 * needs `.add()` or `.delete()` mid-scenario.
 */
export let mockPermissions: Set<Permission> = new Set<Permission>();

/** Replace the current permission set with the given members. */
export function setPermissions(...perms: Permission[]): void {
  mockPermissions = new Set<Permission>(perms);
}

/** Clear all permissions (empty set). Called from beforeEach. */
export function resetPermissions(): void {
  mockPermissions = new Set<Permission>();
}

/**
 * Getter shaped for the `getCurrentPermissions: () => () => <set>` mock.
 * Wire it as: `getCurrentPermissions: () => getMockPermissions`.
 */
export function getMockPermissions(): Set<Permission> {
  return mockPermissions;
}
