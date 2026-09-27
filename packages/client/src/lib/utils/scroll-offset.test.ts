// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { offsetWithinScroller } from "./scroll-offset.js";

function setTop(el: HTMLElement, top: number): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
  } as DOMRect);
}

describe("offsetWithinScroller", () => {
  it("measures from the top of the scroller's content", () => {
    const scroller = document.createElement("div");
    const el = document.createElement("div");
    setTop(scroller, 50);
    setTop(el, 250);

    expect(offsetWithinScroller(el, scroller)).toBe(200);
  });

  it("gives the same offset however far the scroller is scrolled", () => {
    const scroller = document.createElement("div");
    const el = document.createElement("div");
    Object.defineProperty(scroller, "scrollTop", { value: 300 });
    setTop(scroller, 50);
    // Scrolled 300px, the element sits 300px higher on screen.
    setTop(el, -50);

    expect(offsetWithinScroller(el, scroller)).toBe(200);
  });
});
