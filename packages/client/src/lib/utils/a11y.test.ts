// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { onKeyActivate } from "./a11y.js";

describe("onKeyActivate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls handler on Enter key", () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);

    keyHandler(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(handler).toHaveBeenCalledOnce();
  });

  it("calls handler on Space key and calls preventDefault", () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = new KeyboardEvent("keydown", { key: " ", cancelable: true });
    const preventSpy = vi.spyOn(event, "preventDefault");

    keyHandler(event);

    expect(handler).toHaveBeenCalledOnce();
    expect(preventSpy).toHaveBeenCalledOnce();
  });

  it("does not call handler on Tab key", () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);

    keyHandler(new KeyboardEvent("keydown", { key: "Tab" }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call handler on Escape key", () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);

    keyHandler(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call handler on letter key", () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);

    keyHandler(new KeyboardEvent("keydown", { key: "a" }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call preventDefault on Enter key", () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      cancelable: true,
    });
    const preventSpy = vi.spyOn(event, "preventDefault");

    keyHandler(event);

    expect(preventSpy).not.toHaveBeenCalled();
  });
});
