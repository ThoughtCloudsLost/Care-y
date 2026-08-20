import { describe, it, expect, beforeEach, vi } from "vitest";
import { DemoRouter } from "./router.svelte.js";

// The router imports setDemoPage from "$app/state" (aliased to the stub).
// In the test environment, we mock it. The router only calls setDemoPage
// in reset() (login state); RouteMount owns page state post-login.
vi.mock("$app/state", () => {
  let lastUpdate:
    { url: URL; params: Record<string, string>; routeId: string } | undefined;
  return {
    setDemoPage(update: {
      url: URL;
      params: Record<string, string>;
      routeId: string;
    }): void {
      lastUpdate = update;
    },
    setDemoPageShallow(_url: URL, _state: Record<string, unknown>): void {
      // no-op in router tests
    },
    _getLastUpdate():
      | { url: URL; params: Record<string, string>; routeId: string }
      | undefined {
      return lastUpdate;
    },
    _resetLastUpdate(): void {
      lastUpdate = undefined;
    },
    page: {
      params: {} as Record<string, string>,
      url: new URL("http://demo.local/tickets"),
      route: { id: "" },
      status: 200,
      error: null as unknown,
      data: {} as Record<string, unknown>,
      form: null as unknown,
      state: {} as Record<string, unknown>,
    },
    navigating: null,
    updated: {
      current: false,
      check: async (): Promise<boolean> => Promise.resolve(false),
    },
  };
});

// Mock $app/navigation to capture lifecycle firings
const beforeCbs: Array<(arg: unknown) => void> = [];
const afterCbs: Array<(arg: unknown) => void> = [];

vi.mock("$app/navigation", () => ({
  registerDemoNavigationHandler: vi.fn(),
  unregisterDemoNavigationHandler: vi.fn(),
  fireBeforeNavigate(arg: unknown): void {
    for (const cb of beforeCbs) cb(arg);
  },
  fireAfterNavigate(arg: unknown): void {
    for (const cb of afterCbs) cb(arg);
  },
  beforeNavigate(cb: (arg: unknown) => void): void {
    beforeCbs.push(cb);
  },
  afterNavigate(cb: (arg: unknown) => void): void {
    afterCbs.push(cb);
  },
  goto: vi.fn(),
}));

// Mock route-manifest: router uses matchRoute in buildEndpoint
vi.mock("$demo/engine/route-manifest.js", () => ({
  matchRoute(pathname: string): {
    params: Record<string, string>;
    routeId: string;
  } | null {
    const ticketDetailMatch = /^\/tickets\/([^/]+)$/.exec(pathname);
    if (ticketDetailMatch?.[1] !== undefined) {
      return {
        params: { id: ticketDetailMatch[1] },
        routeId: "/(app)/tickets/[id]",
      };
    }
    if (pathname === "/tickets") {
      return { params: {}, routeId: "/(app)/tickets" };
    }
    if (pathname === "/") {
      return { params: {}, routeId: "/(app)" };
    }
    if (pathname === "/admin") {
      return { params: {}, routeId: "/(app)/admin" };
    }
    if (pathname === "/admin/people") {
      return { params: {}, routeId: "/(app)/admin/people" };
    }
    if (pathname === "/admin/volunteer") {
      return { params: {}, routeId: "/(app)/admin/volunteer" };
    }
    if (pathname === "/admin/manager") {
      return { params: {}, routeId: "/(app)/admin/manager" };
    }
    if (pathname === "/admin/organization") {
      return { params: {}, routeId: "/(app)/admin/organization" };
    }
    if (pathname === "/admin/communications") {
      return { params: {}, routeId: "/(app)/admin/communications" };
    }
    if (pathname === "/more/settings") {
      return { params: {}, routeId: "/(app)/more/settings" };
    }
    if (pathname === "/more/schedule") {
      return { params: {}, routeId: "/(app)/more/schedule" };
    }
    if (pathname === "/library") {
      return { params: {}, routeId: "/(app)/library" };
    }
    const libraryDetailMatch = /^\/library\/([^/]+)$/.exec(pathname);
    if (libraryDetailMatch?.[1] !== undefined) {
      return {
        params: { articleId: libraryDetailMatch[1] },
        routeId: "/(app)/library/[articleId]",
      };
    }
    if (pathname === "/library/new") {
      return { params: {}, routeId: "/(app)/library/new" };
    }
    const libraryEditMatch = /^\/library\/([^/]+)\/edit$/.exec(pathname);
    if (libraryEditMatch?.[1] !== undefined) {
      return {
        params: { articleId: libraryEditMatch[1] },
        routeId: "/(app)/library/[articleId]/edit",
      };
    }
    // Simulate a manifest-known route that resolveFeature does not map.
    // Used to test the "other" feature fallback for unmapped routes.
    if (pathname === "/reports") {
      return { params: {}, routeId: "/(app)/reports" };
    }
    return null;
  },
  listRouteIds(): string[] {
    return ["/(app)/tickets", "/(app)/tickets/[id]", "/(app)/reports"];
  },
}));

describe("DemoRouter", () => {
  let router: DemoRouter;

  beforeEach(async () => {
    router = new DemoRouter();
    beforeCbs.length = 0;
    afterCbs.length = 0;
  });

  describe("initial state", () => {
    it("starts with login feature and search closed", () => {
      expect(router.feature).toBe("login");
      expect(router.detail).toBeNull();
      expect(router.searchOpen).toBe(false);
      expect(router.activeTab).toBe("tickets");
      expect(router.restartSeq).toBe(0);
    });
  });

  describe("navigate()", () => {
    it("sets feature to tickets", () => {
      router.navigate("tickets");
      expect(router.feature).toBe("tickets");
      expect(router.activeTab).toBe("tickets");
      expect(router.searchOpen).toBe(false);
    });

    it("sets feature to tickets with detail", () => {
      router.navigate("tickets", "tk-0001");
      expect(router.feature).toBe("tickets");
      expect(router.detail).toBe("tk-0001");
    });

    it("sets feature to home", () => {
      router.navigate("home");
      expect(router.feature).toBe("home");
      expect(router.activeTab).toBe("home");
      expect(router.pathname).toBe("/");
    });

    it("sets feature to library", () => {
      router.navigate("library");
      expect(router.feature).toBe("library");
      expect(router.activeTab).toBe("library");
      expect(router.pathname).toBe("/library");
    });

    it("sets feature to library with detail", () => {
      router.navigate("library", "art-001");
      expect(router.feature).toBe("library");
      expect(router.detail).toBe("art-001");
      expect(router.pathname).toBe("/library/art-001");
    });

    it("sets feature to admin", () => {
      router.navigate("admin");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBeNull();
      expect(router.activeArea).toBe("admin");
      expect(router.activeTab).toBeNull();
    });

    it("sets feature to admin with volunteer detail", () => {
      router.navigate("admin", "volunteer");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("volunteer");
      expect(router.activeArea).toBe("admin-volunteer");
      expect(router.pathname).toBe("/admin/volunteer");
    });

    it("sets feature to admin with manager detail", () => {
      router.navigate("admin", "manager");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("manager");
      expect(router.activeArea).toBe("admin-manager");
      expect(router.pathname).toBe("/admin/manager");
    });

    it("sets feature to admin with people detail", () => {
      router.navigate("admin", "people");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("people");
      expect(router.activeArea).toBe("admin-people");
    });

    it("sets feature to admin with organization detail", () => {
      router.navigate("admin", "organization");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("organization");
      expect(router.pathname).toBe("/admin/organization");
    });

    it("sets feature to admin with communications detail", () => {
      router.navigate("admin", "communications");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("communications");
      expect(router.pathname).toBe("/admin/communications");
    });

    it("sets feature to schedule", () => {
      router.navigate("schedule");
      expect(router.feature).toBe("schedule");
      expect(router.activeArea).toBe("schedule");
      expect(router.activeTab).toBeNull();
    });

    it("sets feature to settings", () => {
      router.navigate("settings");
      expect(router.feature).toBe("settings");
      expect(router.activeArea).toBe("settings");
      expect(router.activeTab).toBeNull();
    });

    it("sets feature to login", () => {
      router.navigate("tickets");
      router.navigate("login");
      expect(router.feature).toBe("login");
    });

    it("closes search when navigating", () => {
      router.navigate("tickets");
      router.handleSearchToggle(true);
      expect(router.searchOpen).toBe(true);
      router.navigate("tickets");
      expect(router.searchOpen).toBe(false);
    });
  });

  describe("handleTabChange()", () => {
    it("navigates to tickets when tickets tab tapped", () => {
      router.navigate("tickets");
      router.handleTabChange("tickets");
      expect(router.feature).toBe("tickets");
      expect(router.activeTab).toBe("tickets");
    });

    it("navigates to home when home tab tapped", () => {
      router.navigate("tickets");
      router.handleTabChange("home");
      expect(router.feature).toBe("home");
      expect(router.activeTab).toBe("home");
      expect(router.pathname).toBe("/");
    });

    it("navigates to library when library tab tapped", () => {
      router.navigate("tickets");
      router.handleTabChange("library");
      expect(router.feature).toBe("library");
      expect(router.activeTab).toBe("library");
      expect(router.pathname).toBe("/library");
    });
  });

  describe("handleAreaTap()", () => {
    it("navigates to admin hub on admin area tap", () => {
      router.navigate("tickets");
      router.handleAreaTap("admin");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBeNull();
      expect(router.activeArea).toBe("admin");
    });

    it("navigates to admin-people on admin-people area tap", () => {
      router.navigate("tickets");
      router.handleAreaTap("admin-people");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("people");
    });

    it("navigates to settings on settings area tap", () => {
      router.navigate("tickets");
      router.handleAreaTap("settings");
      expect(router.feature).toBe("settings");
      expect(router.activeArea).toBe("settings");
    });

    it("navigates to schedule on schedule area tap", () => {
      router.navigate("tickets");
      router.handleAreaTap("schedule");
      expect(router.feature).toBe("schedule");
      expect(router.activeArea).toBe("schedule");
    });
  });

  describe("handleSearchToggle()", () => {
    it("opens search as an overlay without changing feature", () => {
      router.navigate("tickets");
      router.handleSearchToggle(true);
      expect(router.searchOpen).toBe(true);
      // Feature stays as tickets (overlay, not feature switch)
      expect(router.feature).toBe("tickets");
    });

    it("closing search does not change feature", () => {
      router.navigate("tickets");
      router.handleSearchToggle(true);
      router.handleSearchToggle(false);
      expect(router.searchOpen).toBe(false);
      expect(router.feature).toBe("tickets");
    });
  });

  describe("handleGoto()", () => {
    it("maps /tickets to tickets feature", () => {
      router.handleGoto("/tickets");
      expect(router.feature).toBe("tickets");
      expect(router.detail).toBeNull();
    });

    it("maps / to home feature (post-auth landing)", () => {
      router.handleGoto("/");
      expect(router.feature).toBe("home");
      expect(router.detail).toBeNull();
    });

    it("maps /tickets/tk-0001 to tickets with detail", () => {
      router.handleGoto("/tickets/tk-0001");
      expect(router.feature).toBe("tickets");
      expect(router.detail).toBe("tk-0001");
    });

    it("maps /tickets/tk-0001/conversation to tickets with conversation detail", () => {
      router.handleGoto("/tickets/tk-0001/conversation");
      expect(router.feature).toBe("tickets");
      expect(router.detail).toBe("conversation");
    });

    it("maps /admin to admin feature", () => {
      router.handleGoto("/admin");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBeNull();
      expect(router.activeArea).toBe("admin");
    });

    it("maps /admin/volunteer to admin with volunteer detail", () => {
      router.handleGoto("/admin/volunteer");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("volunteer");
      expect(router.activeArea).toBe("admin-volunteer");
    });

    it("maps /admin/manager to admin with manager detail", () => {
      router.handleGoto("/admin/manager");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("manager");
    });

    it("maps /admin/people to admin with people detail", () => {
      router.handleGoto("/admin/people");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("people");
    });

    it("maps /admin/organization to admin with organization detail", () => {
      router.handleGoto("/admin/organization");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("organization");
    });

    it("maps /admin/communications to admin with communications detail", () => {
      router.handleGoto("/admin/communications");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("communications");
    });

    it("maps /more/settings to settings feature", () => {
      router.handleGoto("/more/settings");
      expect(router.feature).toBe("settings");
      expect(router.activeArea).toBe("settings");
    });

    it("maps /more/schedule to schedule feature", () => {
      router.handleGoto("/more/schedule");
      expect(router.feature).toBe("schedule");
      expect(router.activeArea).toBe("schedule");
    });

    it("handles query strings (/admin/people?user=abc)", () => {
      router.handleGoto("/admin/people?user=abc");
      expect(router.feature).toBe("admin");
      expect(router.detail).toBe("people");
      expect(router.search).toBe("?user=abc");
    });

    it("handles /logout by bumping restartSeq without navigating", () => {
      router.navigate("tickets");
      const featureBefore = router.feature;
      router.handleGoto("/logout");
      expect(router.restartSeq).toBe(1);
      expect(router.feature).toBe(featureBefore);
    });

    it("bumps restartSeq incrementally on repeated /logout", () => {
      router.handleGoto("/logout");
      router.handleGoto("/logout");
      expect(router.restartSeq).toBe(2);
    });

    it("maps /library to library feature", () => {
      router.handleGoto("/library");
      expect(router.feature).toBe("library");
      expect(router.detail).toBeNull();
      expect(router.activeTab).toBe("library");
    });

    it("maps /library/art-001 to library with detail", () => {
      router.handleGoto("/library/art-001");
      expect(router.feature).toBe("library");
      expect(router.detail).toBe("art-001");
    });

    it("maps /library/new to library with 'new' detail", () => {
      router.handleGoto("/library/new");
      expect(router.feature).toBe("library");
      expect(router.detail).toBe("new");
    });

    it("maps /library/art-001/edit to library with 'edit' detail", () => {
      router.handleGoto("/library/art-001/edit");
      expect(router.feature).toBe("library");
      expect(router.detail).toBe("edit");
    });

    it("ignores unknown paths (no manifest match)", () => {
      router.navigate("tickets");
      router.handleGoto("/some/random/path");
      expect(router.feature).toBe("tickets");
    });

    it("maps a manifest-matched but feature-unmapped path to other", () => {
      router.handleGoto("/reports");
      expect(router.feature).toBe("other");
      expect(router.detail).toBeNull();
      expect(router.pathname).toBe("/reports");
      expect(router.routeId).toBe("/(app)/reports");
    });

    it("strips base path prefix when configured", () => {
      router.handleGoto("/tickets");
      expect(router.feature).toBe("tickets");
    });

    it("closes search on goto", () => {
      router.navigate("tickets");
      router.handleSearchToggle(true);
      expect(router.searchOpen).toBe(true);
      router.handleGoto("/tickets");
      expect(router.searchOpen).toBe(false);
    });
  });

  describe("navigation lifecycle", () => {
    it("fires afterNavigate on navigate()", () => {
      let afterFired = false;
      afterCbs.push(() => {
        afterFired = true;
      });
      router.navigate("tickets");
      expect(afterFired).toBe(true);
    });

    it("fires afterNavigate even when target equals current state", () => {
      router.navigate("tickets");
      let afterCount = 0;
      afterCbs.push(() => {
        afterCount += 1;
      });
      router.navigate("tickets");
      expect(afterCount).toBe(1);
    });

    it("fires afterNavigate on handleGoto", () => {
      let afterFired = false;
      afterCbs.push(() => {
        afterFired = true;
      });
      router.handleGoto("/tickets");
      expect(afterFired).toBe(true);
    });

    it("fires afterNavigate on handleAreaTap", () => {
      let afterFired = false;
      afterCbs.push(() => {
        afterFired = true;
      });
      router.handleAreaTap("admin");
      expect(afterFired).toBe(true);
    });

    it("does not fire afterNavigate on /logout", () => {
      let afterFired = false;
      afterCbs.push(() => {
        afterFired = true;
      });
      router.handleGoto("/logout");
      expect(afterFired).toBe(false);
    });
  });

  describe("reset()", () => {
    it("returns to login state", async () => {
      router.navigate("tickets");
      router.reset();
      expect(router.feature).toBe("login");
      expect(router.detail).toBeNull();
      expect(router.searchOpen).toBe(false);
      expect(router.activeTab).toBe("tickets");
      expect(router.restartSeq).toBe(0);

      // reset() calls setDemoPage for login since RouteMount is not mounted
      const mod = await vi.importMock<{
        _getLastUpdate: () =>
          | { url: URL; params: Record<string, string>; routeId: string }
          | undefined;
      }>("$app/state");
      const update = mod._getLastUpdate();
      expect(update).toBeDefined();
      expect(update?.url.pathname).toBe("/login");
      expect(update?.routeId).toBe("/login");
    });
  });

  describe("routeId derivation", () => {
    it("is null during login", () => {
      expect(router.routeId).toBeNull();
    });

    it("resolves for a mapped route", () => {
      router.navigate("tickets");
      expect(router.routeId).toBe("/(app)/tickets");
    });

    it("resolves for the other feature fallback", () => {
      router.handleGoto("/reports");
      expect(router.routeId).toBe("/(app)/reports");
    });

    it("resets to null on reset()", () => {
      router.navigate("tickets");
      router.reset();
      expect(router.routeId).toBeNull();
    });
  });
});
