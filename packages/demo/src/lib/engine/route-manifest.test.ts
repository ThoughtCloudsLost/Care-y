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
