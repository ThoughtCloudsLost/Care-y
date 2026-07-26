import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  goto,
  registerDemoNavigationHandler,
  unregisterDemoNavigationHandler,
  type DemoNavigationHandler,
} from "./app-navigation.js";

describe("app-navigation stub", () => {
  const noopHandler: DemoNavigationHandler = () => {
    /* no-op placeholder for cleanup */
  };

  beforeEach(() => {
    // Clear any handler left from a previous test
    unregisterDemoNavigationHandler(noopHandler);
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
});
