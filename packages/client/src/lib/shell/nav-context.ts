import type { TabId, AreaId } from "./types";

export interface NavContext {
  /** The active tab, or null when the path is outside all tabs. */
  readonly tab: TabId | null;
  /** The active area, or null when the path is inside a tab. */
  readonly area: AreaId | null;
}

type NavTarget = TabId | AreaId;

const NAV_PREFIXES: readonly [string, NavTarget][] = [
  ["/tickets", "tickets"],
  ["/library", "library"],
  ["/admin/people", "admin-people"],
  ["/admin/communications", "admin-communications"],
  ["/admin/organization", "admin-organization"],
  ["/admin/manager", "admin-manager"],
  ["/admin/volunteer", "admin-volunteer"],
  ["/admin", "admin"],
  ["/more/settings", "settings"],
  ["/more/schedule", "schedule"],
];

const TAB_SET: ReadonlySet<string> = new Set(["home", "tickets", "library"]);

function isTab(id: string): id is TabId {
  return TAB_SET.has(id);
}

/**
 * Resolve a pathname to a NavContext. Exactly one of tab/area is
 * non-null on known pages; both are null on the 404 catch-all.
 *
 * The root path "/" maps to the "home" tab. Prefix matches use
 * longest-match-first ordering: "/admin/people" hits "admin-people"
 * before the generic "/admin" catch-all.
 */
export function resolveNavContext(pathname: string): NavContext {
  for (const [prefix, target] of NAV_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return isTab(target)
        ? { tab: target, area: null }
        : { tab: null, area: target };
    }
  }
  if (pathname === "/") {
    return { tab: "home", area: null };
  }
  return { tab: null, area: null };
}

/** Hub route for each area (the page the area button navigates to). */
const AREA_ROUTE_MAP = new Map<AreaId, `/${string}`>([
  ["admin", "/admin"],
  ["admin-people", "/admin/people"],
  ["admin-communications", "/admin/communications"],
  ["admin-organization", "/admin/organization"],
  ["admin-manager", "/admin/manager"],
  ["admin-volunteer", "/admin/volunteer"],
  ["settings", "/more/settings"],
  ["schedule", "/more/schedule"],
]);

export function areaRoute(id: AreaId): `/${string}` {
  // Map is exhaustive over AreaId; non-null assertion is safe.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- exhaustive map
  return AREA_ROUTE_MAP.get(id)!;
}
