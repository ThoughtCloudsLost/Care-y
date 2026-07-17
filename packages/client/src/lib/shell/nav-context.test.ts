import { describe, it, expect } from "vitest";
import { resolveNavContext, areaRoute } from "./nav-context";
import { AREA_IDS } from "./types";

describe("resolveNavContext", () => {
  const cases: [string, string | null, string | null][] = [
    ["/", "home", null],
    ["/tickets", "tickets", null],
    ["/tickets/abc-123", "tickets", null],
    ["/library", "library", null],
    ["/library/articles/1", "library", null],
    ["/admin", null, "admin"],
    ["/admin/people", null, "admin-people"],
    ["/admin/communications", null, "admin-communications"],
    ["/admin/organization", null, "admin-organization"],
    ["/admin/manager", null, "admin-manager"],
    ["/admin/volunteer", null, "admin-volunteer"],
    ["/more/settings", null, "settings"],
    ["/more/settings/profile", null, "settings"],
    ["/more/schedule", null, "schedule"],
    ["/more/schedule/week", null, "schedule"],
  ];

  it.each(cases)(
    "resolves %s to tab=%s area=%s",
    (path, expectedTab, expectedArea) => {
      const ctx = resolveNavContext(path);
      expect(ctx.tab).toBe(expectedTab);
      expect(ctx.area).toBe(expectedArea);
    },
  );

  it("returns both null for unknown paths (404 catch-all)", () => {
    const ctx = resolveNavContext("/nonexistent");
    expect(ctx.tab).toBeNull();
    expect(ctx.area).toBeNull();
  });

  it("satisfies the exclusivity invariant (at most one non-null)", () => {
    const paths = [
      "/",
      "/tickets",
      "/library",
      "/admin",
      "/admin/people",
      "/admin/communications",
      "/admin/organization",
      "/more/settings",
      "/more/schedule",
      "/nonexistent",
    ];
    for (const path of paths) {
      const ctx = resolveNavContext(path);
      const nonNullCount = [ctx.tab, ctx.area].filter((v) => v != null).length;
      expect(nonNullCount).toBeLessThanOrEqual(1);
    }
  });
});

describe("areaRoute", () => {
  it("returns a route for every area ID", () => {
    for (const id of AREA_IDS) {
      expect(areaRoute(id)).toMatch(/^\//);
    }
  });

  it("routes round-trip through resolveNavContext", () => {
    for (const id of AREA_IDS) {
      const route = areaRoute(id);
      const ctx = resolveNavContext(route);
      expect(ctx.area).toBe(id);
      expect(ctx.tab).toBeNull();
    }
  });
});
