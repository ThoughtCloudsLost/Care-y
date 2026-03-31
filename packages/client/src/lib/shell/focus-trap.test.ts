// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { activateFocusTrap } from "./focus-trap";

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

  it("calls onEscape when Escape is pressed", () => {
    container = createContainer(2);
    const onEscape = vi.fn();

    activateFocusTrap({ container, onEscape });

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(event);

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("removes the keydown listener on cleanup", () => {
    container = createContainer(2);
    const onEscape = vi.fn();

    const cleanup = activateFocusTrap({ container, onEscape });
    cleanup();

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(event);

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("does not interfere with non-Tab, non-Escape keys", () => {
    container = createContainer(2);
    const onEscape = vi.fn();

    activateFocusTrap({ container, onEscape });

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const prevented = !container.dispatchEvent(event);

    expect(prevented).toBe(false);
    expect(onEscape).not.toHaveBeenCalled();
  });
});
