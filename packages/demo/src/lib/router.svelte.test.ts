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
    return null;
  },
  listRouteIds(): string[] {
    return ["/(app)/tickets", "/(app)/tickets/[id]"];
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

    it("does not navigate for inert tabs (home)", () => {
      router.navigate("tickets");
      router.handleTabChange("home");
      // Feature stays as tickets since home is inert
      expect(router.feature).toBe("tickets");
    });

    it("does not navigate for inert tabs (library)", () => {
      router.navigate("tickets");
      router.handleTabChange("library");
      expect(router.feature).toBe("tickets");
    });
  });

  describe("handleAreaTap()", () => {
    it("is a no-op for all areas", () => {
      router.navigate("tickets");
      router.handleAreaTap("admin");
      expect(router.feature).toBe("tickets");
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

    it("maps / to tickets feature (post-auth landing)", () => {
      router.handleGoto("/");
      expect(router.feature).toBe("tickets");
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

    it("ignores inert paths like /library", () => {
      router.navigate("tickets");
      router.handleGoto("/library");
      expect(router.feature).toBe("tickets");
    });

    it("ignores unknown paths", () => {
      router.navigate("tickets");
      router.handleGoto("/some/random/path");
      expect(router.feature).toBe("tickets");
    });

    it("ignores admin area paths", () => {
      router.navigate("tickets");
      router.handleGoto("/admin/people");
      expect(router.feature).toBe("tickets");
    });

    it("strips /Care-y base path prefix", () => {
      router.handleGoto("/Care-y/tickets");
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
  });

  describe("reset()", () => {
    it("returns to login state", async () => {
      router.navigate("tickets");
      router.reset();
      expect(router.feature).toBe("login");
      expect(router.detail).toBeNull();
      expect(router.searchOpen).toBe(false);
      expect(router.activeTab).toBe("tickets");

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

  describe("state getter", () => {
    it("returns a snapshot of current state", () => {
      router.navigate("tickets", "tk-0001");
      const snapshot = router.state;
      expect(snapshot).toEqual({
        feature: "tickets",
        detail: "tk-0001",
        searchOpen: false,
      });
    });
  });
});
