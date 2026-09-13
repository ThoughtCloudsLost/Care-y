// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { pushOverlay, _resetOverlayStack } from "./overlay-stack";

afterEach(() => {
  _resetOverlayStack();
});

function dispatchEscape(): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event;
}

describe("overlay-stack", () => {
  it("calls only the topmost dismiss on Escape", () => {
    const first = vi.fn();
    const second = vi.fn();
    pushOverlay(first);
    pushOverlay(second);

    const event = dispatchEscape();

    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("fires the next handle after the top is removed", () => {
    const first = vi.fn();
    const second = vi.fn();
    pushOverlay(first);
    const removeSecond = pushOverlay(second);

    removeSecond();
    dispatchEscape();

    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
  });

  it("handles out-of-order removal", () => {
    const a = vi.fn();
    const b = vi.fn();
    const c = vi.fn();
    const removeA = pushOverlay(a);
    pushOverlay(b);
    pushOverlay(c);

    // Remove the bottom overlay first
    removeA();
    dispatchEscape();

    // Topmost (c) should fire
    expect(c).toHaveBeenCalledOnce();
    expect(b).not.toHaveBeenCalled();
    expect(a).not.toHaveBeenCalled();
  });

  it("removal is idempotent", () => {
    const dismiss = vi.fn();
    const remove = pushOverlay(dismiss);

    remove();
    remove();

    dispatchEscape();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it("detaches the listener when the stack empties", () => {
    const dismiss = vi.fn();
    const remove = pushOverlay(dismiss);
    remove();

    // With no overlays, Escape should not be caught
    const event = dispatchEscape();
    expect(event.defaultPrevented).toBe(false);
    expect(dismiss).not.toHaveBeenCalled();
  });

  it("does nothing after _resetOverlayStack", () => {
    const dismiss = vi.fn();
    pushOverlay(dismiss);
    _resetOverlayStack();

    const event = dispatchEscape();
    expect(event.defaultPrevented).toBe(false);
    expect(dismiss).not.toHaveBeenCalled();
  });

  it("ignores an Escape that is already defaultPrevented", () => {
    const dismiss = vi.fn();
    pushOverlay(dismiss);

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    event.preventDefault();
    window.dispatchEvent(event);

    expect(dismiss).not.toHaveBeenCalled();
  });

  it("ignores non-Escape keys", () => {
    const dismiss = vi.fn();
    pushOverlay(dismiss);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(dismiss).not.toHaveBeenCalled();
  });
});
