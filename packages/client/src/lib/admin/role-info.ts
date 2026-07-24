import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import { ROLE_ID_VALUES } from "@care-y/shared";

/** Admin hub route for each role. All three exist as real routes. */
export type RoleAdminPath = "/admin" | "/admin/manager" | "/admin/volunteer";

export interface RoleInfo {
  /** Localized, terminology-aware role display name. */
  readonly name: string;
  readonly path: RoleAdminPath;
}

/* Display-only mapping: the user's role identity for stamps and hub
   navigation. Access control never derives from this table; admin UI is
   gated on permissions from auth.me. Builders are functions so names
   re-resolve against the active locale and org terminology. */

function volunteerInfo(): RoleInfo {
  return { name: m.role_volunteer(withTerms()), path: "/admin/volunteer" };
}

function managerInfo(): RoleInfo {
  return { name: m.role_manager(withTerms()), path: "/admin/manager" };
}

function adminInfo(): RoleInfo {
  return { name: m.role_admin(), path: "/admin" };
}

/* ROLE_ID_VALUES is [VOLUNTEER, MANAGER, ADMIN]. The builders below
   are paired positionally via spread into Map entries. */
const [volId = "", mgrId = "", admId = ""] = ROLE_ID_VALUES;

const ROLE_INFO: ReadonlyMap<string, () => RoleInfo> = new Map([
  [volId, volunteerInfo],
  [mgrId, managerInfo],
  [admId, adminInfo],
]);

export function getRoleInfo(roleId: string): RoleInfo {
  const build = ROLE_INFO.get(roleId) ?? volunteerInfo;
  return build();
}
