import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  goto,
  registerDemoNavigationHandler,
  unregisterDemoNavigationHandler,
  beforeNavigate,
  afterNavigate,
  fireBeforeNavigate,
  fireAfterNavigate,
  resetLifecycleCallbacks,
  pushState,
  replaceState,
  type DemoNavigationHandler,
} from "./app-navigation.js";

// Mock the app-state module to track page updates
let mockPageUrl = new URL("http://demo.local/tickets");
let mockPageState: Record<string, unknown> = {};
let shallowCalls: Array<{ url: URL; state: Record<string, unknown> }> = [];

// Commit control for nextPageCommit: null means auto-resolve (the
// common case for tests that only care that goto returns); an array
// collects resolvers for tests that assert goto waits for the commit.
let pendingCommits: Array<() => void> | null = null;

function releaseCommits(): void {
  const resolvers = pendingCommits ?? [];
  pendingCommits = [];
  for (const resolve of resolvers) resolve();
}

vi.mock("./app-state.svelte.js", () => ({
  nextPageCommit(): Promise<void> {
    if (pendingCommits === null) return Promise.resolve();
    return new Promise((resolve) => {
      pendingCommits?.push(resolve);
    });
  },
  page: {
    get url(): URL {
      return mockPageUrl;
    },
    get state(): Record<string, unknown> {
      return mockPageState;
    },
    params: {},
    route: { id: "" },
    status: 200,
    error: null,
    data: {},
    form: null,
  },
  setDemoPage(): void {
    // no-op in navigation tests
  },
  setDemoPageShallow(url: URL, state: Record<string, unknown>): void {
    shallowCalls.push({ url, state });
    mockPageUrl = url;
    mockPageState = state;
  },
}));

describe("app-navigation stub", () => {
  const noopHandler: DemoNavigationHandler = () => {
    /* no-op placeholder for cleanup */
  };

  beforeEach(() => {
    // Clear any handler left from a previous test
    unregisterDemoNavigationHandler(noopHandler);
    resetLifecycleCallbacks();
    mockPageUrl = new URL("http://demo.local/tickets");
    mockPageState = {};
    shallowCalls = [];
    pendingCommits = null;
  });

  it("goto with a handler resolves only after the page commit", async () => {
    pendingCommits = [];
    const handler: DemoNavigationHandler = () => {
      /* navigation side effects irrelevant here */
    };
    registerDemoNavigationHandler(handler);

    let resolved = false;
    const promise = goto("/tickets").then(() => {
      resolved = true;
    });

    // Give the pre-handler microtask a chance; goto must still be
    // pending because no commit has landed.
    await Promise.resolve();
    await Promise.resolve();
    expect(resolved).toBe(false);

    releaseCommits();
    await promise;
    expect(resolved).toBe(true);

    unregisterDemoNavigationHandler(handler);
  });

  it("goto with a handler falls back to the timeout when no commit lands", async () => {
    vi.useFakeTimers();
    try {
      pendingCommits = [];
      const handler: DemoNavigationHandler = () => {
        /* same-route navigation: no commit will follow */
      };
      registerDemoNavigationHandler(handler);

      let resolved = false;
      const promise = goto("/tickets").then(() => {
        resolved = true;
      });
      await vi.advanceTimersByTimeAsync(999);
      expect(resolved).toBe(false);
      await vi.advanceTimersByTimeAsync(2);
      await promise;
      expect(resolved).toBe(true);

      unregisterDemoNavigationHandler(handler);
    } finally {
      vi.useRealTimers();
    }
  });

  it("goto resolves without error when no handler is registered", async () => {
    await expect(goto("/tickets")).resolves.toBeUndefined();
  });

  it("calls the registered handler on goto with the href", async () => {
    const handler = vi.fn<DemoNavigationHandler>();
    registerDemoNavigationHandler(handler);

    await goto("/tickets", { replaceState: true });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith("/tickets");

    unregisterDemoNavigationHandler(handler);
  });

  it("unregisterDemoNavigationHandler removes the handler", async () => {
    const handler = vi.fn<DemoNavigationHandler>();
    registerDemoNavigationHandler(handler);
    unregisterDemoNavigationHandler(handler);

    await goto("/somewhere");
    expect(handler).not.toHaveBeenCalled();
  });

  it("unregister only removes its own handler (not a later one)", async () => {
    const first = vi.fn<DemoNavigationHandler>();
    const second = vi.fn<DemoNavigationHandler>();

    registerDemoNavigationHandler(first);
    registerDemoNavigationHandler(second);

    // Unregistering first should not remove second (different reference)
    unregisterDemoNavigationHandler(first);
    await goto("/test");

    expect(second).toHaveBeenCalledOnce();

    unregisterDemoNavigationHandler(second);
  });

  it("replaces a previously registered handler", async () => {
    const first = vi.fn<DemoNavigationHandler>();
    const second = vi.fn<DemoNavigationHandler>();

    registerDemoNavigationHandler(first);
    registerDemoNavigationHandler(second);

    await goto("/test");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();

    unregisterDemoNavigationHandler(second);
  });

  describe("navigation lifecycle callbacks", () => {
    it("beforeNavigate stores and fires callbacks", () => {
      const cb = vi.fn();
      beforeNavigate(cb);

      const arg = {
        from: null,
        to: null,
        willUnload: false,
        type: "goto",
        complete: Promise.resolve(),
        cancel: () => {
          /* noop: test stub */
        },
      };
      fireBeforeNavigate(arg);

      expect(cb).toHaveBeenCalledOnce();
      expect(cb).toHaveBeenCalledWith(arg);
    });

    it("afterNavigate stores and fires callbacks", () => {
      const cb = vi.fn();
      afterNavigate(cb);

      const arg = {
        from: null,
        to: null,
        willUnload: false,
        type: "goto",
        complete: Promise.resolve(),
      };
      fireAfterNavigate(arg);

      expect(cb).toHaveBeenCalledOnce();
      expect(cb).toHaveBeenCalledWith(arg);
    });

    it("fires multiple registered callbacks", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      afterNavigate(cb1);
      afterNavigate(cb2);

      fireAfterNavigate({
        from: null,
        to: null,
        willUnload: false,
        type: "goto",
        complete: Promise.resolve(),
      });

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
    });

    it("resetLifecycleCallbacks clears all callbacks", () => {
      const cb = vi.fn();
      afterNavigate(cb);
      resetLifecycleCallbacks();

      fireAfterNavigate({
        from: null,
        to: null,
        willUnload: false,
        type: "goto",
        complete: Promise.resolve(),
      });

      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe("pushState", () => {
    it("updates page URL and state", () => {
      pushState("/admin/people?tab=queues", { detail: true });
      expect(shallowCalls).toHaveLength(1);
      expect(shallowCalls[0]?.url.pathname).toBe("/admin/people");
      expect(shallowCalls[0]?.url.searchParams.get("tab")).toBe("queues");
      expect(shallowCalls[0]?.state).toEqual({ detail: true });
    });

    it("resolves empty string to current page URL", () => {
      pushState("", { ticketId: "tk-0001" });
      expect(shallowCalls).toHaveLength(1);
      expect(shallowCalls[0]?.url.pathname).toBe("/tickets");
      expect(shallowCalls[0]?.state).toEqual({ ticketId: "tk-0001" });
    });

    it("resolves relative paths against current URL", () => {
      mockPageUrl = new URL("http://demo.local/admin/people");
      pushState("?tab=queues", {});
      expect(shallowCalls).toHaveLength(1);
      expect(shallowCalls[0]?.url.pathname).toBe("/admin/people");
      expect(shallowCalls[0]?.url.searchParams.get("tab")).toBe("queues");
    });

    it("is idempotent when href and state are unchanged", () => {
      pushState("/tickets", {});
      expect(shallowCalls).toHaveLength(0);
    });

    it("is idempotent when state object has same shape and values", () => {
      mockPageState = { ticketId: "tk-0001" };
      pushState("/tickets", { ticketId: "tk-0001" });
      expect(shallowCalls).toHaveLength(0);
    });

    it("fires when state differs even if URL is the same", () => {
      mockPageState = {};
      pushState("/tickets", { ticketId: "tk-0001" });
      expect(shallowCalls).toHaveLength(1);
    });

    it("fires when URL differs even if state is the same", () => {
      mockPageState = {};
      pushState("/tickets?q=test", {});
      expect(shallowCalls).toHaveLength(1);
    });
  });

  describe("replaceState", () => {
    it("updates page URL and state", () => {
      replaceState("?tab=queues", {});
      expect(shallowCalls).toHaveLength(1);
      expect(shallowCalls[0]?.url.searchParams.get("tab")).toBe("queues");
    });

    it("is idempotent when href and state are unchanged", () => {
      replaceState("/tickets", {});
      expect(shallowCalls).toHaveLength(0);
    });

    it("handles the admin/people ?user= pattern", () => {
      mockPageUrl = new URL("http://demo.local/admin/people?user=u123");
      // Simulate the page's $effect: delete ?user, replaceState
      const next = new URL(mockPageUrl);
      next.searchParams.delete("user");
      replaceState(next.pathname + next.search, {});
      expect(shallowCalls).toHaveLength(1);
      expect(shallowCalls[0]?.url.pathname).toBe("/admin/people");
      expect(shallowCalls[0]?.url.searchParams.has("user")).toBe(false);
    });

    it("is idempotent on second call with same result", () => {
      // First call updates
      replaceState("/admin/people", {});
      expect(shallowCalls).toHaveLength(1);
      // Second call with same URL is idempotent
      replaceState("/admin/people", {});
      expect(shallowCalls).toHaveLength(1);
    });
  });
});
