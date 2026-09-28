// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { onKeyActivate, labelToggleInput, focusJumpTarget } from "./a11y.js";

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

describe("labelToggleInput", () => {
  it("sets aria-label on a nested checkbox input", () => {
    const wrapper = document.createElement("span");
    const input = document.createElement("input");
    input.type = "checkbox";
    wrapper.appendChild(input);

    labelToggleInput(wrapper, "Enable notifications");

    expect(input.getAttribute("aria-label")).toBe("Enable notifications");
  });

  it("does nothing when no checkbox input exists inside the node", () => {
    const wrapper = document.createElement("span");
    const span = document.createElement("span");
    wrapper.appendChild(span);

    // Should not throw
    labelToggleInput(wrapper, "Some label");
    expect(span.hasAttribute("aria-label")).toBe(false);
  });
});

describe("focusJumpTarget", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("makes a heading focusable from script only, then focuses it", () => {
    const heading = document.createElement("h2");
    document.body.appendChild(heading);

    focusJumpTarget(heading);

    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(heading);
  });

  it("focuses a button without taking it out of the tab order", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    focusJumpTarget(button);

    expect(button.hasAttribute("tabindex")).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it("keeps a tabindex the element already has", () => {
    const region = document.createElement("div");
    region.setAttribute("tabindex", "0");
    document.body.appendChild(region);

    focusJumpTarget(region);

    expect(region.getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(region);
  });
});
