/**
 * Bidirectional demo router.
 *
 * Tracks which demo feature is active. Two entry points update the state:
 * (a) in-phone shell interactions (tab taps, goto interception, search toggle),
 * (b) outer page controls (FeatureList clicks, programmatic navigation).
 *
 * The router is the URL owner: it computes /tickets and /tickets/<id>
 * URLs and pushes them into the $app/state stub via setDemoPage() so
 * the real route components see correct page.params and page.url values.
 *
 * Uses Svelte 5 runes for reactivity. The singleton instance is created
 * once and shared across the demo surface and outer page.
 */

import { SvelteURL } from "svelte/reactivity";
import { setDemoPage } from "$app/state";
import { resolveNavContext } from "$lib/shell/nav-context.js";
import type { TabId, AreaId } from "$lib/shell/types";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** Features that have a built demo scene. */
export type DemoFeature = "tickets" | "search";

/** Sub-state within a feature (e.g. ticket detail, conversation view). */
export type DemoDetail = string | null;

export interface DemoRouterState {
  readonly feature: DemoFeature | null;
  readonly detail: DemoDetail;
  readonly searchOpen: boolean;
}

/** Callback signature for goto-interception registration. */
export type NavigationHandler = (href: string) => void;

// -----------------------------------------------------------------------
// URL helpers
// -----------------------------------------------------------------------

const DEMO_ORIGIN = "http://demo.local";

/** Build a demo URL for the tickets list. */
function ticketsListUrl(): URL {
  return new URL(`${DEMO_ORIGIN}/tickets`);
}

/** Build a demo URL for a ticket detail page. */
function ticketsDetailUrl(ticketId: string): URL {
  return new URL(`${DEMO_ORIGIN}/tickets/${ticketId}`);
}

// -----------------------------------------------------------------------
// Feature mapping: which nav targets map to built features
// -----------------------------------------------------------------------

const TAB_TO_FEATURE: ReadonlyMap<TabId, DemoFeature> = new Map([
  ["tickets", "tickets"],
]);

/** Inert tabs: visible in the shell but taps do nothing. */
const INERT_TABS: ReadonlySet<TabId> = new Set(["home", "library"]);

/**
 * Resolve a pathname (from goto interception) to a feature + detail.
 * Returns null feature for inert/unknown paths.
 */
function resolveFeature(pathname: string): {
  feature: DemoFeature | null;
  detail: DemoDetail;
} {
  const ctx = resolveNavContext(pathname);

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

  // All areas and other tabs are inert in the demo
  if (ctx.tab !== null || ctx.area !== null) {
    return { feature: null, detail: null };
  }

  return { feature: null, detail: null };
}

// -----------------------------------------------------------------------
// Router class
// -----------------------------------------------------------------------

export class DemoRouter {
  // Reactive state
  feature: DemoFeature | null = $state(null);
  detail: DemoDetail = $state(null);
  searchOpen: boolean = $state(false);

  // Shell prop mirrors (reactive for AppShell binding)
  activeTab: TabId | null = $state("tickets");
  activeArea: AreaId | null = $state(null);

  /** Push the current feature/detail state into the $app/state stub. */
  private syncPage(): void {
    if (this.feature === "tickets") {
      if (this.detail !== null) {
        setDemoPage(ticketsDetailUrl(this.detail));
      } else {
        setDemoPage(ticketsListUrl());
      }
    }
  }

  /** Navigate to a built feature (outer page entry point). */
  navigate(feature: DemoFeature, detail?: DemoDetail): void {
    this.searchOpen = false;
    this.feature = feature;
    this.detail = detail ?? null;

    // Sync shell props
    if (feature === "tickets") {
      this.activeTab = "tickets";
      this.activeArea = null;
    } else {
      // Search doesn't change the active tab; it opens the overlay
      this.searchOpen = true;
    }

    this.syncPage();
  }

  /** Handler wired to AppShell's ontabchange prop. */
  handleTabChange(tabId: TabId): void {
    if (INERT_TABS.has(tabId)) {
      // Inert: update shell visual but don't navigate to a feature
      return;
    }

    const feature = TAB_TO_FEATURE.get(tabId) ?? null;
    this.activeTab = tabId;
    this.activeArea = null;
    this.searchOpen = false;
    this.feature = feature;
    this.detail = null;

    this.syncPage();
  }

  /** Handler wired to AppShell's onareatap prop. No-op for all areas in demo. */
  handleAreaTap(_areaId: AreaId): void {
    // All areas are inert in the demo
  }

  /** Handler wired to AppShell's onsearchtoggle prop. */
  handleSearchToggle(open: boolean): void {
    this.searchOpen = open;
    if (open) {
      this.feature = "search";
      this.detail = null;
    } else if (this.feature === "search") {
      // Closing search returns to previous tab's feature
      const tabFeature =
        this.activeTab !== null
          ? (TAB_TO_FEATURE.get(this.activeTab) ?? null)
          : null;
      this.feature = tabFeature;
      this.detail = null;
    }
  }

  /**
   * Handler for goto interception (registered with
   * registerDemoNavigationHandler). Parses the href and updates
   * router state. Unknown/inert paths are silently ignored.
   */
  handleGoto(href: string): void {
    // Strip any base path prefix (in case resolve() was called)
    const url = href.startsWith("http")
      ? new SvelteURL(href).pathname
      : href.replace(/^\/Care-y/i, "");

    const { feature, detail } = resolveFeature(url);
    if (feature === null) {
      // Inert path: do nothing
      return;
    }

    this.feature = feature;
    this.detail = detail;
    this.searchOpen = false;

    // Sync shell tab state
    if (feature === "tickets") {
      this.activeTab = "tickets";
      this.activeArea = null;
    }

    this.syncPage();
  }

  /** Snapshot of the current state (for external reads). */
  get state(): DemoRouterState {
    return {
      feature: this.feature,
      detail: this.detail,
      searchOpen: this.searchOpen,
    };
  }

  /** Reset to initial state. */
  reset(): void {
    this.feature = null;
    this.detail = null;
    this.searchOpen = false;
    this.activeTab = "tickets";
    this.activeArea = null;

    // Reset the stub page state to the tickets list
    setDemoPage(ticketsListUrl());
  }
}

/**
 * Create a new DemoRouter instance. Call once per demo mount.
 */
export function createDemoRouter(): DemoRouter {
  return new DemoRouter();
}
