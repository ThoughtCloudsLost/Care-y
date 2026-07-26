import { describe, it, expect, beforeEach, vi } from "vitest";
import { DemoRouter } from "./router.svelte.js";

// The router imports setDemoPage from "$app/state" (aliased to the stub).
// In the test environment, we mock it to verify URL pushes.
vi.mock("$app/state", () => {
  let lastUrl: URL | undefined;
  return {
    setDemoPage(url: URL): void {
      lastUrl = url;
    },
    _getLastUrl(): URL | undefined {
      return lastUrl;
    },
    _resetLastUrl(): void {
      lastUrl = undefined;
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

// Access mock internals for assertion
async function getLastUrl(): Promise<URL | undefined> {
  const mod = await vi.importMock<{
    _getLastUrl: () => URL | undefined;
  }>("$app/state");
  return mod._getLastUrl();
}

async function resetLastUrl(): Promise<void> {
  const mod = await vi.importMock<{
    _resetLastUrl: () => void;
  }>("$app/state");
  mod._resetLastUrl();
}

describe("DemoRouter", () => {
  let router: DemoRouter;

  beforeEach(async () => {
    router = new DemoRouter();
    await resetLastUrl();
  });

  describe("initial state", () => {
    it("starts with null feature and search closed", () => {
      expect(router.feature).toBeNull();
      expect(router.detail).toBeNull();
      expect(router.searchOpen).toBe(false);
      expect(router.activeTab).toBe("tickets");
    });
  });

  describe("navigate()", () => {
    it("sets feature to tickets and pushes list URL", async () => {
      router.navigate("tickets");
      expect(router.feature).toBe("tickets");
      expect(router.activeTab).toBe("tickets");
      expect(router.searchOpen).toBe(false);

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets");
    });

    it("sets feature to tickets with detail and pushes detail URL", async () => {
      router.navigate("tickets", "tk-0001");
      expect(router.feature).toBe("tickets");
      expect(router.detail).toBe("tk-0001");

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets/tk-0001");
    });

    it("sets feature to search and opens search", () => {
      router.navigate("search");
      expect(router.feature).toBe("search");
      expect(router.searchOpen).toBe(true);
    });

    it("closes search when navigating to a non-search feature", () => {
      router.navigate("search");
      router.navigate("tickets");
      expect(router.searchOpen).toBe(false);
      expect(router.feature).toBe("tickets");
    });
  });

  describe("handleTabChange()", () => {
    it("navigates to tickets when tickets tab tapped", async () => {
      router.handleTabChange("tickets");
      expect(router.feature).toBe("tickets");
      expect(router.activeTab).toBe("tickets");

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets");
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
    it("opens search and sets feature to search", () => {
      router.handleSearchToggle(true);
      expect(router.searchOpen).toBe(true);
      expect(router.feature).toBe("search");
    });

    it("closing search returns to previous tab feature", () => {
      router.navigate("tickets");
      router.handleSearchToggle(true);
      expect(router.feature).toBe("search");
      router.handleSearchToggle(false);
      expect(router.searchOpen).toBe(false);
      expect(router.feature).toBe("tickets");
    });

    it("closing search on inert tab sets feature to null", () => {
      router.activeTab = "home";
      router.handleSearchToggle(true);
      router.handleSearchToggle(false);
      expect(router.feature).toBeNull();
    });
  });

  describe("handleGoto()", () => {
    it("maps /tickets to tickets feature and pushes list URL", async () => {
      router.handleGoto("/tickets");
      expect(router.feature).toBe("tickets");
      expect(router.detail).toBeNull();

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets");
    });

    it("maps /tickets/tk-0001 to tickets with detail", async () => {
      router.handleGoto("/tickets/tk-0001");
      expect(router.feature).toBe("tickets");
      expect(router.detail).toBe("tk-0001");

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets/tk-0001");
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

    it("strips /Care-y base path prefix", async () => {
      router.handleGoto("/Care-y/tickets");
      expect(router.feature).toBe("tickets");

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets");
    });

    it("restores list URL when navigating back from detail via shellBack fallback", async () => {
      // Detail view calls shellBack("/tickets") which, with no history,
      // calls goto(resolve("/tickets")). The demo's goto handler calls
      // router.handleGoto with the resolved path.
      router.navigate("tickets", "tk-0001");
      expect(router.detail).toBe("tk-0001");

      // Simulate shellBack's fallback: goto(resolve("/tickets"))
      router.handleGoto("/tickets");
      expect(router.detail).toBeNull();
      expect(router.feature).toBe("tickets");

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets");
    });
  });

  describe("reset()", () => {
    it("returns to initial state and pushes list URL", async () => {
      router.navigate("search");
      router.reset();
      expect(router.feature).toBeNull();
      expect(router.detail).toBeNull();
      expect(router.searchOpen).toBe(false);
      expect(router.activeTab).toBe("tickets");

      const url = await getLastUrl();
      expect(url?.pathname).toBe("/tickets");
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
