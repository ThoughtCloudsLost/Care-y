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
 * longest-match semantics: "/more/settings/foo" hits "settings",
 * not a hypothetical "/more" entry.
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

/** Hub route for each area (the page the area pill navigates to). */
export const AREA_ROUTES: Record<AreaId, string> = {
  admin: "/admin",
  settings: "/more/settings",
  schedule: "/more/schedule",
};
