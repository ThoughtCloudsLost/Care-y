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
  type DemoNavigationHandler,
} from "./app-navigation.js";

describe("app-navigation stub", () => {
  const noopHandler: DemoNavigationHandler = () => {
    /* no-op placeholder for cleanup */
  };

  beforeEach(() => {
    // Clear any handler left from a previous test
    unregisterDemoNavigationHandler(noopHandler);
    resetLifecycleCallbacks();
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
});
