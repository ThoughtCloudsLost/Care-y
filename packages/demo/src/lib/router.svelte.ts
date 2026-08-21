/**
 * Bidirectional demo router.
 *
 * Tracks the canonical pathname the demo is showing. Two entry points
 * update the state:
 * (a) in-phone shell interactions (tab taps, goto interception, search toggle),
 * (b) outer page controls (FeatureList clicks, programmatic navigation).
 *
 * The router holds a canonical pathname (plus search string) as its
 * primary state. Feature, detail, activeTab, and activeArea are all
 * derived from the pathname via resolveNavContext and resolveFeature.
 *
 * RouteMount owns page-state (page.url, page.params, page.route.id) via
 * setDemoPage() because it has the manifest match with real params and
 * routeId. The router only calls setDemoPage for the login URL (reset)
 * since RouteMount is not mounted during login. It does drop shallow
 * state (page.state plus any split handoff) on a navigation that keeps
 * the pathname, which RouteMount never commits for.
 *
 * Uses Svelte 5 runes for reactivity. The singleton instance is created
 * once and shared across the demo surface and outer page.
 */

import { setDemoPage, clearDemoPageState } from "$app/state";
import {
  resolveNavContext,
  areaRoute,
  type NavContext,
} from "$lib/shell/nav-context.js";
import { endSplitHandoff } from "$lib/stores/split-handoff.svelte.js";
import { matchRoute, type RouteMatch } from "$demo/engine/route-manifest.js";
import type { TabId, AreaId } from "$lib/shell/types";
import type { DemoFeature, DemoDetail } from "./bridge.js";
import { fireBeforeNavigate, fireAfterNavigate } from "$app/navigation";
import { DEMO_ORIGIN } from "./demo-origin.js";
import { parseUrl } from "./non-reactive.js";
import { base } from "$app/paths";

// Re-exported type aliases for external barrel consumers.
export type { DemoFeature, DemoDetail } from "./bridge.js";

// -----------------------------------------------------------------------
// URL helpers
// -----------------------------------------------------------------------

/** Build a demo URL from a pathname and optional search string. */
function demoUrl(pathname: string, search = ""): URL {
  return new URL(pathname + search, DEMO_ORIGIN);
}

/** Build a demo URL for the login page. */
function loginUrl(): URL {
  return new URL(`${DEMO_ORIGIN}/login`);
}

// -----------------------------------------------------------------------
// Feature mapping: which nav targets map to built features
// -----------------------------------------------------------------------

const TAB_TO_FEATURE: ReadonlyMap<TabId, DemoFeature> = new Map([
  ["home", "home"],
  ["tickets", "tickets"],
  ["library", "library"],
]);

/**
 * Map a DemoFeature and optional detail back to a pathname.
 * Used by navigate() (outer-page entry point) to set the
 * canonical pathname from feature+detail.
 *
 * Feature "other" returns the current instance's pathname unchanged
 * because navigate(feature) is never the entry path for "other";
 * its goto comes through handleGoto, which sets the pathname directly.
 */
function featureToPathname(
  feature: DemoFeature,
  detail: DemoDetail,
  currentPathname = "/",
): string {
  switch (feature) {
    case "login":
      return "/login";
    case "home":
      return "/";
    case "tickets":
      return detail !== null ? `/tickets/${detail}` : "/tickets";
    case "library":
      return detail !== null ? `/library/${detail}` : "/library";
    case "admin":
      if (detail === "volunteer") return "/admin/volunteer";
      if (detail === "manager") return "/admin/manager";
      if (detail === "people") return "/admin/people";
      if (detail === "organization") return "/admin/organization";
      if (detail === "communications") return "/admin/communications";
      return "/admin";
    case "schedule":
      return "/more/schedule";
    case "settings":
      return "/more/settings";
    case "other":
      return currentPathname;
  }
}

/**
 * The feature a pathname belongs to, or null for inert/unknown paths.
 * Exported for the pulse handler's activation guard: a scripted tap
 * whose click target links to a different feature must downgrade to a
 * marker, or narrating one screen navigates the phone to another.
 */
export function featureForPathname(pathname: string): DemoFeature | null {
  return resolveFeature(pathname).feature;
}

/**
 * Resolve a pathname (from goto interception) to a feature, detail,
 * and the NavContext that was used for the resolution (so callers can
 * thread it through to syncShellProps without re-computing it).
 * Returns null feature for inert/unknown paths.
 */
function resolveFeature(pathname: string): {
  feature: DemoFeature | null;
  detail: DemoDetail;
  ctx: NavContext;
} {
  const ctx = resolveNavContext(pathname);

  // "/" maps to home (post-auth landing)
  if (pathname === "/" || pathname === "") {
    return { feature: "home", detail: null, ctx };
  }

  if (ctx.tab === "home") {
    return { feature: "home", detail: null, ctx };
  }

  if (ctx.tab === "tickets") {
    // "/tickets" -> tickets list, "/tickets/tk-0001" -> detail
    const segments = pathname.replace(/^\/tickets\/?/, "").split("/");
    const rawId = segments[0];
    const ticketId = rawId !== undefined && rawId !== "" ? rawId : null;
    if (ticketId !== null) {
      // "/tickets/tk-0001/conversation" -> detail = "conversation"
      const rawSub = segments[1];
      const sub = rawSub !== undefined && rawSub !== "" ? rawSub : null;
      return { feature: "tickets", detail: sub ?? ticketId, ctx };
    }
    return { feature: "tickets", detail: null, ctx };
  }

  // Area-based features
  if (ctx.area !== null) {
    // Admin areas
    if (ctx.area === "admin") return { feature: "admin", detail: null, ctx };
    if (ctx.area === "admin-volunteer")
      return { feature: "admin", detail: "volunteer", ctx };
    if (ctx.area === "admin-manager")
      return { feature: "admin", detail: "manager", ctx };
    if (ctx.area === "admin-people")
      return { feature: "admin", detail: "people", ctx };
    if (ctx.area === "admin-communications")
      return { feature: "admin", detail: "communications", ctx };
    if (ctx.area === "admin-organization")
      return { feature: "admin", detail: "organization", ctx };

    // More menu areas: settings is the only remaining area member
    if (ctx.area === "schedule")
      return { feature: "schedule", detail: null, ctx };
    return { feature: "settings", detail: null, ctx };
  }

  if (ctx.tab === "library") {
    // "/library" -> list, "/library/<articleId>" -> detail
    // Sub-pages: "/library/new", "/library/<articleId>/edit"
    const segments = pathname.replace(/^\/library\/?/, "").split("/");
    const rawId = segments[0];
    const articleId = rawId !== undefined && rawId !== "" ? rawId : null;
    if (articleId !== null) {
      const rawSub = segments[1];
      const sub = rawSub !== undefined && rawSub !== "" ? rawSub : null;
      return { feature: "library", detail: sub ?? articleId, ctx };
    }
    return { feature: "library", detail: null, ctx };
  }

  return { feature: null, detail: null, ctx };
}

// -----------------------------------------------------------------------
// Navigation lifecycle helpers
// -----------------------------------------------------------------------

function buildEndpoint(
  url: URL,
  preMatch?: RouteMatch | null,
): {
  url: URL;
  params: Record<string, string>;
  route: { id: string | null };
} {
  const match = preMatch !== undefined ? preMatch : matchRoute(url.pathname);
  return {
    url,
    params: match !== null ? match.params : {},
    route: { id: match !== null ? match.routeId : url.pathname },
  };
}

// -----------------------------------------------------------------------
// Router class
// -----------------------------------------------------------------------

export class DemoRouter {
  // Canonical pathname (the primary state)
  pathname: string = $state("/login");
  search: string = $state("");

  // Reactive state
  feature: DemoFeature = $state("login");
  detail: DemoDetail = $state(null);
  searchOpen: boolean = $state(false);

  /**
   * The manifest route ID for the current pathname. Null during login
   * (which has no manifest entry) and when the pathname has no match.
   */
  routeId: string | null = $state(null);

  // Shell prop mirrors (reactive for AppShell binding)
  activeTab: TabId | null = $state("tickets");
  activeArea: AreaId | null = $state(null);

  // Restart sequence (bumped by /logout handling)
  restartSeq: number = $state(0);

  /** Compute the current URL from the canonical pathname + search. */
  private currentUrl(): URL {
    if (this.feature === "login") return loginUrl();
    return demoUrl(this.pathname, this.search);
  }

  /**
   * Sync derived shell props from a resolved NavContext. When both
   * tab and area are null (feature "other" on a route outside the
   * nav tree), the shell props are nulled so no tab or area highlights.
   */
  private syncShellProps(ctx: NavContext): void {
    if (ctx.tab !== null) {
      this.activeTab = ctx.tab;
      this.activeArea = null;
    } else if (ctx.area !== null) {
      this.activeTab = null;
      this.activeArea = ctx.area;
    } else {
      this.activeTab = null;
      this.activeArea = null;
    }
  }

  /**
   * Drop shallow routing state when a navigation keeps the pathname.
   *
   * RouteMount clears page.state on every commit, but it only commits
   * when the matched pathname changes. The desktop split view lives at
   * /tickets with its open row in page.state, so going from the open
   * row to the bare list keeps the pathname and would otherwise carry
   * the row across: the pane stays open, the bridge keeps reporting a
   * detail, and the story's convergence check corrects itself right
   * back to the detail section.
   *
   * Call before assigning the new pathname. A pathname change is left
   * alone so the client's own desktop redirect (/tickets/[id] ->
   * /tickets, then pushState) still lands its row.
   */
  private resetShallowState(nextPathname: string): void {
    if (nextPathname !== this.pathname) return;
    clearDemoPageState();
    endSplitHandoff("tickets");
    endSplitHandoff("library");
  }

  /** Fire the navigation lifecycle callbacks (before + after). */
  private fireLifecycle(
    fromUrl: URL,
    toUrl: URL,
    toMatch?: RouteMatch | null,
  ): void {
    const from = buildEndpoint(fromUrl);
    const to = buildEndpoint(toUrl, toMatch);
    const resolved = Promise.resolve();
    fireBeforeNavigate({
      from,
      to,
      willUnload: false,
      type: "goto",
      complete: resolved,
      cancel: () => {
        /* noop: demo navigation is non-cancellable */
      },
    });
    fireAfterNavigate({
      from,
      to,
      willUnload: false,
      type: "goto",
      complete: resolved,
    });
  }

  /** Navigate to a built feature (outer page entry point). */
  navigate(feature: DemoFeature, detail?: DemoDetail): void {
    const fromUrl = this.currentUrl();
    const resolvedDetail = detail ?? null;
    const pathname = featureToPathname(feature, resolvedDetail, this.pathname);
    const match = feature === "login" ? null : matchRoute(pathname);

    this.resetShallowState(pathname);
    this.pathname = pathname;
    this.search = "";
    this.searchOpen = false;
    this.feature = feature;
    this.detail = resolvedDetail;
    this.routeId = match?.routeId ?? null;
    this.syncShellProps(resolveNavContext(pathname));

    const toUrl = this.currentUrl();
    this.fireLifecycle(fromUrl, toUrl, match);
  }

  /** Handler wired to AppShell's ontabchange prop. */
  handleTabChange(tabId: TabId): void {
    const feature = TAB_TO_FEATURE.get(tabId) ?? null;
    if (feature === null) return;

    const fromUrl = this.currentUrl();
    const pathname = featureToPathname(feature, null);
    const match = matchRoute(pathname);
    this.resetShallowState(pathname);
    this.pathname = pathname;
    this.search = "";
    this.activeTab = tabId;
    this.activeArea = null;
    this.searchOpen = false;
    this.feature = feature;
    this.detail = null;
    this.routeId = match?.routeId ?? null;

    this.fireLifecycle(fromUrl, this.currentUrl(), match);
  }

  /** Handler wired to AppShell's onareatap prop. */
  handleAreaTap(areaId: AreaId): void {
    const route = areaRoute(areaId);
    this.handleGoto(route);
  }

  /** Handler wired to AppShell's onsearchtoggle prop. */
  handleSearchToggle(open: boolean): void {
    // searchOpen is now a pure overlay flag. The underlying
    // feature keeps rendering. No feature assignment needed.
    this.searchOpen = open;
  }

  /**
   * Handler for goto interception (registered with
   * registerDemoNavigationHandler). Parses the href and updates
   * router state. Unknown/inert paths are silently ignored.
   * "/logout" bumps restartSeq without navigating.
   */
  handleGoto(href: string): void {
    // Strip any base path prefix (in case resolve() was called).
    // Plain URL: the result is read once and discarded; SvelteURL's
    // reactive wrappers would be wasted allocation.
    const stripped =
      base && href.toLowerCase().startsWith(base.toLowerCase())
        ? href.slice(base.length)
        : href;
    const raw = href.startsWith("http")
      ? parseUrl(href)
      : parseUrl(stripped, DEMO_ORIGIN);

    const pathname = raw.pathname;
    const search = raw.search;

    // /logout is special: bump restart counter, do not navigate
    if (pathname === "/logout") {
      this.restartSeq += 1;
      return;
    }

    const resolved = resolveFeature(pathname);
    let feature = resolved.feature;
    let detail = resolved.detail;
    const match = matchRoute(pathname);

    // When resolveFeature returns null (no built feature for this path)
    // but matchRoute succeeds, the phone can still mount the route via
    // RouteMount. Navigate with feature "other" so the outer page
    // shows the coming-soon placeholder. Truly unknown pathnames (no
    // manifest match either) stay ignored as before.
    if (feature === null) {
      if (match === null) return;
      feature = "other";
      detail = null;
    }

    const fromUrl = this.currentUrl();
    this.resetShallowState(pathname);
    this.pathname = pathname;
    this.search = search;
    this.feature = feature;
    this.detail = detail;
    this.searchOpen = false;
    this.routeId = match?.routeId ?? null;
    // Thread the NavContext computed by resolveFeature so
    // syncShellProps does not re-call resolveNavContext.
    this.syncShellProps(resolved.ctx);

    this.fireLifecycle(fromUrl, this.currentUrl(), match);
  }

  /** Reset to initial state (login). */
  reset(): void {
    this.feature = "login";
    this.detail = null;
    this.searchOpen = false;
    this.pathname = "/login";
    this.search = "";
    this.activeTab = "tickets";
    this.activeArea = null;
    this.routeId = null;
    this.restartSeq = 0;

    // Login is outside RouteMount, so the router drives page state here.
    setDemoPage({
      url: loginUrl(),
      params: {},
      routeId: "/login",
    });
  }
}

/**
 * Create a new DemoRouter instance. Call once per demo mount.
 */
export function createDemoRouter(): DemoRouter {
  return new DemoRouter();
}
