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
 * since RouteMount is not mounted during login.
 *
 * Uses Svelte 5 runes for reactivity. The singleton instance is created
 * once and shared across the demo surface and outer page.
 */

import { SvelteURL } from "svelte/reactivity";
import { setDemoPage } from "$app/state";
import { resolveNavContext, areaRoute } from "$lib/shell/nav-context.js";
import { matchRoute } from "$demo/engine/route-manifest.js";
import type { TabId, AreaId } from "$lib/shell/types";
import type { DemoFeature, DemoDetail } from "./bridge.js";
import { fireBeforeNavigate, fireAfterNavigate } from "$app/navigation";

// Re-exported type aliases for external barrel consumers.
export type { DemoFeature, DemoDetail } from "./bridge.js";

export interface DemoRouterState {
  readonly feature: DemoFeature;
  readonly detail: DemoDetail;
  readonly searchOpen: boolean;
}

// -----------------------------------------------------------------------
// URL helpers
// -----------------------------------------------------------------------

const DEMO_ORIGIN = "http://demo.local";

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

/** Inert tabs: visible in the shell but taps do nothing. */
const INERT_TABS: ReadonlySet<TabId> = new Set([]);

/**
 * Map a DemoFeature and optional detail back to a pathname.
 * Used by navigate() (outer-page entry point) to set the
 * canonical pathname from feature+detail.
 */
function featureToPathname(feature: DemoFeature, detail: DemoDetail): string {
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
  }
}

/**
 * Resolve a pathname (from goto interception) to a feature + detail.
 * Returns null feature for inert/unknown paths.
 */
function resolveFeature(pathname: string): {
  feature: DemoFeature | null;
  detail: DemoDetail;
} {
  // "/" maps to home (post-auth landing)
  if (pathname === "/" || pathname === "") {
    return { feature: "home", detail: null };
  }

  const ctx = resolveNavContext(pathname);

  if (ctx.tab === "home") {
    return { feature: "home", detail: null };
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
      return { feature: "tickets", detail: sub ?? ticketId };
    }
    return { feature: "tickets", detail: null };
  }

  // Area-based features
  if (ctx.area !== null) {
    // Admin areas
    if (ctx.area === "admin") return { feature: "admin", detail: null };
    if (ctx.area === "admin-volunteer")
      return { feature: "admin", detail: "volunteer" };
    if (ctx.area === "admin-manager")
      return { feature: "admin", detail: "manager" };
    if (ctx.area === "admin-people")
      return { feature: "admin", detail: "people" };
    if (ctx.area === "admin-communications")
      return { feature: "admin", detail: "communications" };
    if (ctx.area === "admin-organization")
      return { feature: "admin", detail: "organization" };

    // More menu areas: settings is the only remaining area member
    if (ctx.area === "schedule") return { feature: "schedule", detail: null };
    return { feature: "settings", detail: null };
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
      return { feature: "library", detail: sub ?? articleId };
    }
    return { feature: "library", detail: null };
  }

  return { feature: null, detail: null };
}

// -----------------------------------------------------------------------
// Navigation lifecycle helpers
// -----------------------------------------------------------------------

function buildEndpoint(url: URL): {
  url: URL;
  params: Record<string, string>;
  route: { id: string | null };
} {
  const match = matchRoute(url.pathname);
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

  // Shell prop mirrors (reactive for AppShell binding)
  activeTab: TabId | null = $state("tickets");
  activeArea: AreaId | null = $state(null);

  // Restart sequence (bumped by /logout handling)
  restartSeq: number = $state(0);

  // Track last URL for lifecycle callbacks
  private lastUrl: URL = loginUrl();

  /** Compute the current URL from the canonical pathname + search. */
  private currentUrl(): URL {
    if (this.feature === "login") return loginUrl();
    return demoUrl(this.pathname, this.search);
  }

  /** Sync derived shell props from a resolved NavContext. */
  private syncShellProps(pathname: string): void {
    const ctx = resolveNavContext(pathname);
    if (ctx.tab !== null) {
      this.activeTab = ctx.tab;
      this.activeArea = null;
    } else if (ctx.area !== null) {
      this.activeTab = null;
      this.activeArea = ctx.area;
    }
  }

  /** Fire the navigation lifecycle callbacks (before + after). */
  private fireLifecycle(fromUrl: URL, toUrl: URL): void {
    const from = buildEndpoint(fromUrl);
    const to = buildEndpoint(toUrl);
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
    this.lastUrl = toUrl;
  }

  /** Navigate to a built feature (outer page entry point). */
  navigate(feature: DemoFeature, detail?: DemoDetail): void {
    const fromUrl = this.currentUrl();
    const resolvedDetail = detail ?? null;
    const pathname = featureToPathname(feature, resolvedDetail);

    this.pathname = pathname;
    this.search = "";
    this.searchOpen = false;
    this.feature = feature;
    this.detail = resolvedDetail;
    this.syncShellProps(pathname);

    this.fireLifecycle(fromUrl, this.currentUrl());
  }

  /** Handler wired to AppShell's ontabchange prop. */
  handleTabChange(tabId: TabId): void {
    if (INERT_TABS.has(tabId)) {
      // Inert: update shell visual but don't navigate to a feature
      return;
    }

    const feature = TAB_TO_FEATURE.get(tabId) ?? null;
    if (feature === null) return;

    const fromUrl = this.currentUrl();
    const pathname = featureToPathname(feature, null);
    this.pathname = pathname;
    this.search = "";
    this.activeTab = tabId;
    this.activeArea = null;
    this.searchOpen = false;
    this.feature = feature;
    this.detail = null;

    this.fireLifecycle(fromUrl, this.currentUrl());
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
    // Strip any base path prefix (in case resolve() was called)
    const raw = href.startsWith("http")
      ? new SvelteURL(href)
      : new SvelteURL(href.replace(/^\/Care-y/i, ""), DEMO_ORIGIN);

    const pathname = raw.pathname;
    const search = raw.search;

    // /logout is special: bump restart counter, do not navigate
    if (pathname === "/logout") {
      this.restartSeq += 1;
      return;
    }

    const { feature, detail } = resolveFeature(pathname);
    if (feature === null) {
      // Inert path: do nothing
      return;
    }

    const fromUrl = this.currentUrl();
    this.pathname = pathname;
    this.search = search;
    this.feature = feature;
    this.detail = detail;
    this.searchOpen = false;
    this.syncShellProps(pathname);

    this.fireLifecycle(fromUrl, this.currentUrl());
  }

  /** Snapshot of the current state (for external reads). */
  get state(): {
    readonly feature: DemoFeature;
    readonly detail: DemoDetail;
    readonly searchOpen: boolean;
  } {
    return {
      feature: this.feature,
      detail: this.detail,
      searchOpen: this.searchOpen,
    };
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
