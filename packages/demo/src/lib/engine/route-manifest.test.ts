/**
 * Unit tests for route-manifest.ts.
 *
 * These verify the URL pattern matching, param extraction, and
 * layout chain derivation work correctly for the three core routes
 * plus an unknown path.
 */

import { describe, it, expect } from "vitest";
import {
  matchRoute,
  listRouteIds,
  routeGroupOf,
  compileSegmentMatcher,
  dirToUrlPattern,
} from "./route-manifest.js";

describe("route-manifest", () => {
  it("lists known route IDs from the glob", () => {
    const ids = listRouteIds();
    expect(ids.length).toBeGreaterThan(0);
    // The three core routes must be present
    expect(ids).toContain("/(app)/tickets");
    expect(ids).toContain("/(app)/tickets/[id]");
    expect(ids).toContain("/(app)/library");
  });

  describe("matchRoute", () => {
    it("matches /tickets to the tickets list page", () => {
      const match = matchRoute("/tickets");
      expect(match).not.toBeNull();
      expect(match?.routeId).toBe("/(app)/tickets");
      expect(match?.params).toEqual({});
      // tickets has a +layout.svelte in its directory
      expect(match?.layouts.length).toBeGreaterThanOrEqual(1);
    });

    it("matches /tickets/<id> and extracts the param generically", () => {
      const match = matchRoute("/tickets/abc-123");
      expect(match).not.toBeNull();
      expect(match?.routeId).toBe("/(app)/tickets/[id]");
      expect(match?.params).toEqual({ id: "abc-123" });
    });

    it("matches /library to the library list page", () => {
      const match = matchRoute("/library");
      expect(match).not.toBeNull();
      expect(match?.routeId).toBe("/(app)/library");
      expect(match?.params).toEqual({});
      // library has its own +layout.svelte
      expect(match?.layouts.length).toBeGreaterThanOrEqual(1);
    });

    it("falls back to the catch-all route for unknown paths", () => {
      // The client has an (app)/[...path] route, and the demo models it
      // as an unnarrated route (see UNNARRATED_ROUTES), so an unknown
      // path mounts the product's own not-found page rather than
      // resolving to nothing. Rest routes sort last, so this only wins
      // when no concrete route matches.
      const match = matchRoute("/nonexistent/route");
      expect(match?.routeId).toBe("/(app)/[...path]");
    });

    it("prefers static segments over param segments", () => {
      // /tickets should match the list page, not the [id] page
      const match = matchRoute("/tickets");
      expect(match?.routeId).toBe("/(app)/tickets");
    });

    it("extracts articleId param for /library/[articleId]", () => {
      const match = matchRoute("/library/art-456");
      expect(match).not.toBeNull();
      expect(match?.routeId).toBe("/(app)/library/[articleId]");
      expect(match?.params).toEqual({ articleId: "art-456" });
    });
  });
});

describe("route-manifest client group", () => {
  it("discovers client-group routes from the glob", () => {
    const ids = listRouteIds();
    expect(ids).toContain("/(client)/intake");
    expect(ids).toContain("/(client)/portal/[channelId]");
    expect(ids).toContain("/(client)/account");
  });

  it("matches /intake to the client intake page, not the app catch-all", () => {
    // The (app) catch-all compiles to "/*" and would swallow every
    // client path if specificity ordering did not sort rest routes last.
    const match = matchRoute("/intake");
    expect(match?.routeId).toBe("/(client)/intake");
  });

  it("prefers the static privacy page over the [slug] form route", () => {
    const match = matchRoute("/intake/privacy");
    expect(match?.routeId).toBe("/(client)/intake/privacy");
  });

  it("extracts slug for a named intake form", () => {
    const match = matchRoute("/intake/housing-2026");
    expect(match?.routeId).toBe("/(client)/intake/[slug]");
    expect(match?.params).toEqual({ slug: "housing-2026" });
  });

  it("extracts channelId for the secure link portal", () => {
    const match = matchRoute("/portal/ch-abc123");
    expect(match?.routeId).toBe("/(client)/portal/[channelId]");
    expect(match?.params).toEqual({ channelId: "ch-abc123" });
  });

  it("chains the client root layout, which is the client shell", () => {
    // /account has no layout of its own, so the only layout it can carry
    // is (client)/+layout.svelte. Exactly one proves the root is chained.
    // The demo keeps no copy of the client shell; it mounts the product's.
    const match = matchRoute("/account");
    expect(match?.layouts).toHaveLength(1);
  });

  it("still excludes the app root layout, which AppShell replaces", () => {
    // /admin has no layout of its own either. Zero proves (app)/+layout
    // stays out of the chain, so the two groups are treated differently
    // in exactly one way.
    const match = matchRoute("/admin");
    expect(match?.layouts).toHaveLength(0);
  });
});

describe("routeGroupOf", () => {
  it("reads the group from a route ID", () => {
    expect(routeGroupOf("/(app)/tickets/[id]")).toBe("app");
    expect(routeGroupOf("/(client)/intake")).toBe("client");
  });

  it("returns null when the ID has no leading group segment", () => {
    expect(routeGroupOf("/login")).toBeNull();
    expect(routeGroupOf("/")).toBeNull();
    expect(routeGroupOf("")).toBeNull();
  });

  it("classifies every manifest route into a known group", () => {
    // A route landing outside both groups means a glob was widened
    // without teaching the router which shell the route belongs in.
    const groups = [...new Set(listRouteIds().map((id) => routeGroupOf(id)))];
    groups.sort((a, b) => String(a).localeCompare(String(b)));
    expect(groups).toEqual(["app", "client"]);
  });
});

describe("compileSegmentMatcher", () => {
  it("matches a static-only path", () => {
    const m = compileSegmentMatcher("/tickets");
    expect(m.exec("/tickets")).toEqual({});
    expect(m.exec("/tickets/")).toEqual({});
    expect(m.exec("/other")).toBeNull();
  });

  it("extracts a named param", () => {
    const m = compileSegmentMatcher("/tickets/:id");
    const result = m.exec("/tickets/abc-123");
    expect(result).toEqual({ id: "abc-123" });
    expect(m.exec("/tickets")).toBeNull();
  });

  it("extracts multiple params", () => {
    const m = compileSegmentMatcher("/org/:orgId/users/:userId");
    const result = m.exec("/org/org-1/users/u-2");
    expect(result).toEqual({ orgId: "org-1", userId: "u-2" });
  });

  it("matches a catch-all wildcard", () => {
    const m = compileSegmentMatcher("/*");
    // Catch-all params are excluded from the returned map
    // (matching URLPattern behavior where key "0" is filtered).
    expect(m.exec("/anything/here")).toEqual({});
    expect(m.exec("/a")).toEqual({});
    // Single slash should not match (requires at least one segment)
    expect(m.exec("/")).toBeNull();
  });

  it("does not match a non-matching path", () => {
    const m = compileSegmentMatcher("/settings");
    expect(m.exec("/settings/profile")).toBeNull();
  });

  it("handles the root path", () => {
    const m = compileSegmentMatcher("/");
    expect(m.exec("/")).toEqual({});
  });
});

describe("dirToUrlPattern", () => {
  it("strips group segments", () => {
    expect(dirToUrlPattern("/(app)/tickets")).toBe("/tickets");
  });

  it("converts param brackets to colon params", () => {
    expect(dirToUrlPattern("/(app)/tickets/[id]")).toBe("/tickets/:id");
  });

  it("converts rest params to wildcard", () => {
    expect(dirToUrlPattern("/(app)/[...path]")).toBe("/*");
  });
});
