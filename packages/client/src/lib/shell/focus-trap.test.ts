// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { activateFocusTrap, addEscapeHandler } from "./focus-trap";

function createContainer(focusableCount: number): HTMLDivElement {
  const container = document.createElement("div");
  for (let i = 0; i < focusableCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Button ${i}`;
    container.appendChild(btn);
  }
  document.body.appendChild(container);
  return container;
}

describe("activateFocusTrap", () => {
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    container?.remove();
  });

  it("focuses the first focusable element on activation", () => {
    container = createContainer(3);
    const buttons = container.querySelectorAll("button");

    activateFocusTrap({ container, onEscape: vi.fn() });

    expect(document.activeElement).toBe(buttons[0]);
  });

  it("focuses the container when no focusable elements exist", () => {
    container = document.createElement("div");
    container.tabIndex = -1;
    document.body.appendChild(container);

    activateFocusTrap({ container, onEscape: vi.fn() });

    expect(document.activeElement).toBe(container);
  });

  it("wraps Tab from last element to first", () => {
    container = createContainer(3);
    const buttons = container.querySelectorAll("button");

    activateFocusTrap({ container, onEscape: vi.fn() });

    // Focus the last button
    buttons[2]!.focus();
    expect(document.activeElement).toBe(buttons[2]);

    // Press Tab on the last element
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    const prevented = !buttons[2]!.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("wraps Shift+Tab from first element to last", () => {
    container = createContainer(3);
    const buttons = container.querySelectorAll("button");

    activateFocusTrap({ container, onEscape: vi.fn() });

    // First button should already be focused
    expect(document.activeElement).toBe(buttons[0]);

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    const prevented = !buttons[0]!.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(buttons[2]);
  });

  it("removes the Tab listener on cleanup", () => {
    container = createContainer(2);
    const buttons = container.querySelectorAll("button");

    const cleanup = activateFocusTrap({ container, onEscape: vi.fn() });

    // Focus last button then cleanup
    buttons[1]!.focus();
    cleanup();

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    const prevented = !buttons[1]!.dispatchEvent(event);

    // Tab should not be prevented after cleanup
    expect(prevented).toBe(false);
  });

  it("does not interfere with non-Tab keys", () => {
    container = createContainer(2);

    activateFocusTrap({ container, onEscape: vi.fn() });

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const prevented = !container.dispatchEvent(event);

    expect(prevented).toBe(false);
  });
});

describe("addEscapeHandler", () => {
  it("calls onEscape when Escape is pressed on document", () => {
    const onEscape = vi.fn();

    addEscapeHandler(onEscape);

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("removes the listener on cleanup", () => {
    const onEscape = vi.fn();

    const cleanup = addEscapeHandler(onEscape);
    cleanup();

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("does not fire for non-Escape keys", () => {
    const onEscape = vi.fn();

    addEscapeHandler(onEscape);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    expect(onEscape).not.toHaveBeenCalled();
  });
});
