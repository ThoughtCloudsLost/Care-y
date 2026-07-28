/**
 * Glob-derived route manifest for the demo engine.
 *
 * Uses import.meta.glob to discover all +page.svelte and +layout.svelte
 * files under the client's (app) routes. Derives URL patterns, layout
 * chains, and route IDs generically from the filesystem paths, with no
 * per-route hand-writing.
 *
 * Bracket segments ([param]) become named params.
 * [...rest] segments match any remaining path.
 * (group) segments are stripped from URL patterns but kept in route IDs.
 * The root (app)/+layout.svelte is excluded (the demo mounts AppShell
 * separately; only nested layouts are chained).
 */

import type { Component } from "svelte";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

type Loader = () => Promise<{ default: Component }>;

interface RouteEntry {
  readonly pattern: URLPattern;
  readonly routeId: string;
  readonly page: Loader;
  readonly layouts: readonly Loader[];
  /** Number of static segments (for ranking). */
  readonly staticSegments: number;
  /** Whether this route uses a rest param. */
  readonly hasRest: boolean;
}

export interface RouteMatch {
  readonly params: Record<string, string>;
  readonly routeId: string;
  readonly page: Loader;
  readonly layouts: readonly Loader[];
}

// -----------------------------------------------------------------------
// Glob imports (lazy, not eager)
// -----------------------------------------------------------------------

// The (app) group directory's parentheses are extglob syntax to the
// glob matcher and must be escaped to match literally.
const pageModules = import.meta.glob<{ default: Component }>(
  "../../../../client/src/routes/\\(app\\)/**/+page.svelte",
);

const layoutModules = import.meta.glob<{ default: Component }>(
  "../../../../client/src/routes/\\(app\\)/**/+layout.svelte",
);

// -----------------------------------------------------------------------
// Path helpers
// -----------------------------------------------------------------------

/** Prefix to strip from glob keys to get the (app)-relative path. */
const ROUTES_PREFIX = "../../../../client/src/routes";

/**
 * Strip the routes prefix from a glob key, yielding a path like
 * "/(app)/tickets/[id]/+page.svelte".
 */
function toRoutePath(globKey: string): string {
  return globKey.slice(ROUTES_PREFIX.length);
}

/**
 * Convert a route-relative directory path to a URL pattern string.
 * Strips (group) segments, converts [param] to :param, [...rest] to *.
 */
function dirToUrlPattern(dir: string): string {
  const segments = dir.split("/").filter((s) => s.length > 0);
  const urlParts: string[] = [];

  for (const seg of segments) {
    // Strip (group) segments from the URL
    if (seg.startsWith("(") && seg.endsWith(")")) continue;

    // [...rest] becomes a wildcard
    if (seg.startsWith("[...") && seg.endsWith("]")) {
      urlParts.push("*");
      continue;
    }

    // [param] becomes :param
    if (seg.startsWith("[") && seg.endsWith("]")) {
      urlParts.push(`:${seg.slice(1, -1)}`);
      continue;
    }

    urlParts.push(seg);
  }

  const path = "/" + urlParts.join("/");
  return path === "/" ? "/" : path;
}

/**
 * Count static (non-param, non-rest) segments for ranking.
 */
function countStaticSegments(dir: string): number {
  return dir
    .split("/")
    .filter((s) => s.length > 0)
    .filter(
      (s) =>
        !s.startsWith("(") &&
        !s.startsWith("[") &&
        !s.endsWith(")") &&
        !s.endsWith("]"),
    ).length;
}

/**
 * Check if a directory path contains a rest param.
 */
function hasRestParam(dir: string): boolean {
  return dir.split("/").some((s) => s.startsWith("[..."));
}

// -----------------------------------------------------------------------
// Build the manifest
// -----------------------------------------------------------------------

/** The root (app) layout is excluded; the demo mounts AppShell separately. */
const ROOT_LAYOUT_ROUTE_PATH = "/(app)/+layout.svelte";

function buildManifest(): readonly RouteEntry[] {
  // Index layouts by their directory path within (app)
  const layoutByDir = new Map<string, Loader>();

  for (const [globKey, loader] of Object.entries(layoutModules)) {
    const routePath = toRoutePath(globKey);
    // Skip the root (app) layout
    if (routePath === ROOT_LAYOUT_ROUTE_PATH) continue;

    // Directory is everything before /+layout.svelte
    const dir = routePath.replace(/\/\+layout\.svelte$/, "");
    layoutByDir.set(dir, loader);
  }

  const entries: RouteEntry[] = [];

  for (const [globKey, pageLoader] of Object.entries(pageModules)) {
    const routePath = toRoutePath(globKey);
    // The route ID is the SvelteKit-style path without the filename
    const routeId = routePath.replace(/\/\+page\.svelte$/, "");

    // Directory for this page (everything before /+page.svelte)
    const pageDir = routePath.replace(/\/\+page\.svelte$/, "");

    // Build the URL pattern from the directory
    const urlPattern = dirToUrlPattern(pageDir);

    // Build the layout chain: walk up from the page directory to (app),
    // collecting any +layout.svelte at each level. Outermost first.
    const layouts: Loader[] = [];
    const dirParts = pageDir.split("/").filter((s) => s.length > 0);

    // Walk from root (after the empty prefix) down to the page dir,
    // building progressively deeper paths
    for (let depth = 1; depth <= dirParts.length; depth++) {
      const ancestorDir = "/" + dirParts.slice(0, depth).join("/");
      // Skip the root (app) layout
      if (ancestorDir === "/(app)") continue;
      const layoutLoader = layoutByDir.get(ancestorDir);
      if (layoutLoader !== undefined) {
        layouts.push(layoutLoader);
      }
    }

    entries.push({
      pattern: new URLPattern({ pathname: urlPattern }),
      routeId,
      page: pageLoader,
      layouts,
      staticSegments: countStaticSegments(pageDir),
      hasRest: hasRestParam(pageDir),
    });
  }

  // Sort: most specific first.
  // More static segments = more specific.
  // Non-rest beats rest.
  // Among equal specificity, longer routeId first (deeper nesting).
  entries.sort((a, b) => {
    // Rest params are least specific
    if (a.hasRest !== b.hasRest) return a.hasRest ? 1 : -1;
    // More static segments = more specific
    if (a.staticSegments !== b.staticSegments)
      return b.staticSegments - a.staticSegments;
    // Tie-break: deeper route is more specific
    return b.routeId.length - a.routeId.length;
  });

  return entries;
}

const manifest: readonly RouteEntry[] = buildManifest();

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/**
 * Match a pathname to a route entry.
 * Returns the matched params, routeId, page loader, and layout chain,
 * or null if no route matches.
 */
export function matchRoute(pathname: string): RouteMatch | null {
  for (const entry of manifest) {
    const result = entry.pattern.exec({ pathname });
    if (result !== null) {
      const groups = result.pathname.groups;
      const paramMap = new Map<string, string>();
      for (const [key, value] of Object.entries(groups)) {
        if (value !== undefined && key !== "0") {
          paramMap.set(key, value);
        }
      }
      return {
        params: Object.fromEntries(paramMap),
        routeId: entry.routeId,
        page: entry.page,
        layouts: entry.layouts,
      };
    }
  }
  return null;
}

/**
 * List all known route IDs (for debugging / test assertions).
 */
export function listRouteIds(): readonly string[] {
  return manifest.map((e) => e.routeId);
}
