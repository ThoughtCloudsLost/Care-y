/**
 * Glob-derived route manifest for the demo engine.
 *
 * Uses import.meta.glob to discover all +page.svelte and +layout.svelte
 * files under the client's (app) and (client) routes. Derives URL
 * patterns, layout chains, and route IDs generically from the filesystem
 * paths, with no per-route hand-writing.
 *
 * Bracket segments ([param]) become named params.
 * [...rest] segments match any remaining path.
 * (group) segments are stripped from URL patterns but kept in route IDs.
 *
 * The two groups differ in one way, and only one. The root
 * (app)/+layout.svelte is excluded because the demo mounts AppShell
 * itself; the root (client)/+layout.svelte is chained like any other
 * layout, because it IS the client shell and the demo has no substitute
 * for it. Keeping it here rather than reimplementing it means a product
 * change to the client shell reaches the demo on the next build.
 */

import type { Component } from "svelte";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

type Loader = () => Promise<{ default: Component }>;

/** Abstraction over URLPattern and the regex fallback. */
interface PatternMatcher {
  exec(pathname: string): Record<string, string> | null;
}

interface RouteEntry {
  readonly matcher: PatternMatcher;
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

// The group directories' parentheses are extglob syntax to the glob
// matcher and must be escaped to match literally. Patterns must stay
// literal: import.meta.glob is resolved at build time and cannot read
// a computed string.
//
// (auth) and (onboarding) are deliberately absent. Login is hand-mounted
// by LoginMount so it can prefill credentials, and onboarding is not part
// of the story.
const pageModules = import.meta.glob<{ default: Component }>([
  "../../../../client/src/routes/\\(app\\)/**/+page.svelte",
  "../../../../client/src/routes/\\(client\\)/**/+page.svelte",
]);

const layoutModules = import.meta.glob<{ default: Component }>([
  "../../../../client/src/routes/\\(app\\)/**/+layout.svelte",
  "../../../../client/src/routes/\\(client\\)/**/+layout.svelte",
]);

// -----------------------------------------------------------------------
// Path helpers
// -----------------------------------------------------------------------

/** Prefix to strip from glob keys to get the routes-relative path. */
const ROUTES_PREFIX = "../../../../client/src/routes";

/**
 * The route group a route ID belongs to ("app", "client"), or null when
 * the ID has no leading (group) segment.
 *
 * Read the group from the ID rather than matching pathnames: the ID comes
 * from the filesystem, so a route added to a group is classified without
 * touching this file or its callers.
 */
export function routeGroupOf(routeId: string): string | null {
  const first = routeId.split("/").find((s) => s.length > 0);
  if (first === undefined) return null;
  return first.startsWith("(") && first.endsWith(")")
    ? first.slice(1, -1)
    : null;
}

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
export function dirToUrlPattern(dir: string): string {
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
// Pattern matching: URLPattern primary, regex fallback
// -----------------------------------------------------------------------

const HAS_URL_PATTERN = typeof URLPattern !== "undefined";

/**
 * Compile a URL pattern string (e.g. "/tickets/:id") into a
 * PatternMatcher. Uses URLPattern when available, otherwise compiles
 * a regex from the same pattern string.
 *
 * The patterns produced by dirToUrlPattern are simple: static segments,
 * ":param" named segments, and a trailing "*" catch-all. This subset
 * is straightforward to translate to regex.
 */
export function compilePattern(urlPattern: string): PatternMatcher {
  if (HAS_URL_PATTERN) {
    const up = new URLPattern({ pathname: urlPattern });
    return {
      exec(pathname: string): Record<string, string> | null {
        const result = up.exec({ pathname });
        if (result === null) return null;
        const groups = result.pathname.groups;
        // Map instead of computed property writes: group names come
        // from route file paths, and Map.set carries no
        // prototype-pollution surface.
        const params = new Map<string, string>();
        for (const [key, value] of Object.entries(groups)) {
          if (value !== undefined && key !== "0") {
            params.set(key, value);
          }
        }
        return Object.fromEntries(params);
      },
    };
  }

  return compileSegmentMatcher(urlPattern);
}

/**
 * Build a segment-comparison PatternMatcher from a URL pattern string.
 * Handles three segment types:
 *   - static literal (e.g. "tickets")
 *   - ":name" named param (matches one path segment)
 *   - "*" trailing catch-all (matches remaining path; the matched value
 *     is not included in the returned params, matching URLPattern's
 *     filtered key "0")
 *
 * Segment comparison instead of a compiled regex: the pattern alphabet
 * is closed (three shapes), and plain string equality needs neither
 * escaping nor a dynamically built RegExp.
 *
 * Exported for testing.
 */
export function compileSegmentMatcher(urlPattern: string): PatternMatcher {
  const patternSegs = urlPattern.split("/").filter((s) => s.length > 0);

  return {
    exec(pathname: string): Record<string, string> | null {
      const pathSegs = pathname.split("/").filter((s) => s.length > 0);
      // Map instead of computed property writes; see compilePattern.
      const params = new Map<string, string>();

      for (let i = 0; i < patternSegs.length; i++) {
        const seg = patternSegs.at(i);
        if (seg === undefined) return null;
        if (seg === "*") {
          // Catch-all must consume at least one remaining segment.
          return pathSegs.length > i ? Object.fromEntries(params) : null;
        }
        const actual = pathSegs.at(i);
        if (actual === undefined) return null;
        if (seg.startsWith(":")) {
          params.set(seg.slice(1), actual);
        } else if (seg !== actual) {
          return null;
        }
      }

      // No catch-all: the path must not have extra segments. Trailing
      // slashes are already normalized away by the filter above.
      return pathSegs.length === patternSegs.length
        ? Object.fromEntries(params)
        : null;
    },
  };
}

// -----------------------------------------------------------------------
// Build the manifest
// -----------------------------------------------------------------------

/**
 * The root (app) layout is excluded; the demo mounts AppShell separately.
 * Scoped to (app) on purpose: (client)/+layout.svelte is the client shell
 * and must stay in the chain.
 */
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
      // Skip the root (app) layout. Not "/(client)": that layout is the
      // client shell and belongs in the chain.
      if (ancestorDir === "/(app)") continue;
      const layoutLoader = layoutByDir.get(ancestorDir);
      if (layoutLoader !== undefined) {
        layouts.push(layoutLoader);
      }
    }

    entries.push({
      matcher: compilePattern(urlPattern),
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
    const params = entry.matcher.exec(pathname);
    if (params !== null) {
      return {
        params,
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
