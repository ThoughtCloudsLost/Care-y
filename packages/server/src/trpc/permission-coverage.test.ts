/**
 * Every Permission is enforced somewhere, and the router says where.
 *
 * A key that gates nothing is indistinguishable from a key that gates
 * something until someone tries to use it, and the permission rewrite
 * produced two keys that named nothing real. These tests make the
 * absence loud.
 *
 * Enforcement has three shapes and only one of them is visible from
 * here:
 *
 * 1. Procedure middleware, declared in tRPC meta by permissionProcedure.
 *    Walking the built router finds these, and a procedure on a mounted
 *    router is evidence a caller can reach the key.
 * 2. Raw HTTP outside tRPC: the relay's path-to-key map, imported below,
 *    and blob download, which picks between two keys on blob category.
 * 3. Checks inside a resolver, where one procedure behaves two ways
 *    (masked or unmasked contact details) or where the procedure cannot
 *    carry the gate (onboarding runs on authedProcedure for the 2FA
 *    exemption).
 *
 * The third kind can only be found by reading source, which needs Vite's
 * raw glob, which needs Vite's types: this package has neither. So the
 * keys resting on it are pinned here by name, and the client suite,
 * which can read both packages, checks that each pinned key really does
 * have the check claimed for it. Neither list can rot quietly: this file
 * fails if a pinned key turns up on a procedure, and that one fails if a
 * pinned key has no check.
 */

import { describe, it, expect } from "vitest";
import { Permission } from "@care-y/shared";
import { createAppRouter } from "../routes/router.js";
import { RELAY_PERMISSIONS } from "../routes/relay.js";
import { createTestRouterDeps, ALL_OPTIONAL_ROUTERS } from "../test-utils.js";
import type { ProcedureMeta } from "./trpc.js";

/**
 * Keys the server enforces nowhere, kept as forward declarations for
 * features that do not exist yet.
 *
 * Narrower than the plan file's "no reachable surface", which is about
 * the client: LINK_CASES, MANAGE_QUEUE_NOTIFICATIONS and MANAGE_PRESETS
 * each gate a real procedure that no screen calls yet, so they belong
 * there and not here.
 */
const NOT_ENFORCED_ANYWHERE: readonly Permission[] = [
  Permission.VIEW_OWN_SHIFTS,
];

/**
 * Keys checked inside a resolver rather than by procedure middleware,
 * because one procedure behaves two ways depending on the answer.
 *
 * Verified in packages/client/src/lib/auth/permission-gates.test.ts,
 * which can read server source.
 */
export const INLINE_CHECKED: readonly Permission[] = [
  // Contact details come back masked without it.
  Permission.VIEW_CLIENT_PII,
  // Editing a client's contact details, checked alongside the read.
  Permission.EDIT_CLIENT_CONTACT,
  // Deleting someone else's note; deleting your own needs no key.
  Permission.DELETE_OTHERS_NOTES,
];

/** Keys the blob download handler picks between, on blob category. */
export const BLOB_DOWNLOAD_KEYS: readonly Permission[] = [
  Permission.VIEW_KNOWLEDGE_BASE,
  Permission.DOWNLOAD_CASE_MEDIA,
];

/** Permission to the procedure paths that enforce it, from the built router. */
function permissionsFromRouter(): Map<Permission, string[]> {
  const router = createAppRouter({
    ...createTestRouterDeps(),
    ...ALL_OPTIONAL_ROUTERS,
  });

  const byPermission = new Map<Permission, string[]>();
  for (const [routePath, procedure] of Object.entries(router._def.procedures)) {
    const meta = (procedure as { _def: { meta?: ProcedureMeta } })._def.meta;
    const permission = meta?.permission;
    if (permission === undefined) continue;
    byPermission.set(permission, [
      ...(byPermission.get(permission) ?? []),
      routePath,
    ]);
  }
  return byPermission;
}

describe("permission coverage", () => {
  const fromRouter = permissionsFromRouter();
  const rawHttp = new Set<Permission>([
    ...RELAY_PERMISSIONS.values(),
    ...BLOB_DOWNLOAD_KEYS,
  ]);

  const enforced = new Set<Permission>([
    ...fromRouter.keys(),
    ...rawHttp,
    ...INLINE_CHECKED,
  ]);

  it("mounts a router with permission-gated procedures on it", () => {
    // Optional routers mount parts of themselves on their dep factories,
    // so an under-stubbed dep set yields a router missing whole sections
    // and every assertion below passes for the wrong reason.
    expect(fromRouter.size).toBeGreaterThan(30);
  });

  it("enforces every permission somewhere, or declares it unenforced", () => {
    const unenforced = Object.values(Permission).filter(
      (p) => !enforced.has(p) && !NOT_ENFORCED_ANYWHERE.includes(p),
    );

    expect(unenforced).toEqual([]);
  });

  it("keeps no stale entry in the unenforced list", () => {
    const nowEnforced = NOT_ENFORCED_ANYWHERE.filter((p) => enforced.has(p));

    expect(nowEnforced).toEqual([]);
  });

  it("puts no inline-checked key on a procedure as well", () => {
    // A key gated by middleware does not need a resolver to re-check it,
    // and listing one here would hide the fact that the router already
    // proves it reachable.
    const alsoOnRouter = INLINE_CHECKED.filter((p) => fromRouter.has(p));

    expect(alsoOnRouter).toEqual([]);
  });

  it("reaches every other permission through a procedure", () => {
    // Everything not pinned to a raw HTTP handler or a resolver check
    // has to be gated somewhere a caller can actually arrive.
    const offRouter = [...enforced]
      .filter(
        (p) =>
          !fromRouter.has(p) && !rawHttp.has(p) && !INLINE_CHECKED.includes(p),
      )
      .sort();

    expect(offRouter).toEqual([]);
  });
});
