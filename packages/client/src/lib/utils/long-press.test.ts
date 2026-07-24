// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { longPress } from "./long-press.js";

type LongPressOptions = Parameters<typeof longPress>[1];

function attach(
  el: HTMLElement,
  onLongPress: () => void,
  options?: LongPressOptions,
): () => void {
  const cleanup = longPress(onLongPress, options)(el);
  return typeof cleanup === "function" ? cleanup : () => undefined;
}

function press(target: EventTarget, type: string): void {
  target.dispatchEvent(new Event(type, { bubbles: true }));
}

describe("longPress", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires once after the default 500ms hold", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const fired = vi.fn();
    attach(el, fired);

    press(el, "pointerdown");
    vi.advanceTimersByTime(499);
    expect(fired).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fired).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(fired).toHaveBeenCalledTimes(1);
  });

  it("cancels when the pointer lifts before the delay", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const fired = vi.fn();
    attach(el, fired);

    press(el, "pointerdown");
    vi.advanceTimersByTime(300);
    press(el, "pointerup");
    vi.advanceTimersByTime(1000);
    expect(fired).not.toHaveBeenCalled();
  });

  it("cancels when the pointer moves before the delay", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const fired = vi.fn();
    attach(el, fired);

    press(el, "pointerdown");
    vi.advanceTimersByTime(300);
    press(el, "pointermove");
    vi.advanceTimersByTime(1000);
    expect(fired).not.toHaveBeenCalled();
  });

  it("cancels on pointercancel before the delay", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const fired = vi.fn();
    attach(el, fired);

    press(el, "pointerdown");
    press(el, "pointercancel");
    vi.advanceTimersByTime(1000);
    expect(fired).not.toHaveBeenCalled();
  });

  it("honors a custom delay", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const fired = vi.fn();
    attach(el, fired, { delayMs: 800 });

    press(el, "pointerdown");
    vi.advanceTimersByTime(500);
    expect(fired).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fired).toHaveBeenCalledTimes(1);
  });

  it("skips presses starting on a button when ignoreInteractiveTargets is set", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const button = document.createElement("button");
    el.appendChild(button);
    const fired = vi.fn();
    attach(el, fired, { ignoreInteractiveTargets: true });

    press(button, "pointerdown");
    vi.advanceTimersByTime(1000);
    expect(fired).not.toHaveBeenCalled();

    press(el, "pointerdown");
    vi.advanceTimersByTime(500);
    expect(fired).toHaveBeenCalledTimes(1);
  });

  it("never fires after cleanup, even mid-press", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const fired = vi.fn();
    const cleanup = attach(el, fired);

    press(el, "pointerdown");
    vi.advanceTimersByTime(300);
    cleanup();
    vi.advanceTimersByTime(1000);
    press(el, "pointerdown");
    vi.advanceTimersByTime(1000);
    expect(fired).not.toHaveBeenCalled();
  });
});
