import { describe, it, expect } from "vitest";
import { resolveNavContext, AREA_ROUTES } from "./nav-context";

describe("resolveNavContext", () => {
  const cases: [string, string | null, string | null][] = [
    ["/", "home", null],
    ["/tickets", "tickets", null],
    ["/tickets/abc-123", "tickets", null],
    ["/library", "library", null],
    ["/library/articles/1", "library", null],
    ["/admin", null, "admin"],
    ["/admin/people", null, "admin"],
    ["/admin/organization", null, "admin"],
    ["/admin/manager", null, "admin"],
    ["/admin/volunteer", null, "admin"],
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

describe("AREA_ROUTES", () => {
  it("has an entry for every area", () => {
    expect(Object.keys(AREA_ROUTES).sort()).toEqual([
      "admin",
      "schedule",
      "settings",
    ]);
  });

  it("routes round-trip through resolveNavContext", () => {
    for (const [areaId, route] of Object.entries(AREA_ROUTES)) {
      const ctx = resolveNavContext(route);
      expect(ctx.area).toBe(areaId);
      expect(ctx.tab).toBeNull();
    }
  });
});
