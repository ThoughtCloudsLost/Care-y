/**
 * Unit tests for route-manifest.ts.
 *
 * These verify the URL pattern matching, param extraction, and
 * layout chain derivation work correctly for the three core routes
 * plus an unknown path.
 */

import { describe, it, expect } from "vitest";
import { matchRoute, listRouteIds } from "./route-manifest.js";

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
