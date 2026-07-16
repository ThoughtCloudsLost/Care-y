// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import SplitView from "./SplitView.svelte";

const pane = createRawSnippet(() => ({
  render: () => "<div>pane</div>",
}));

// jsdom has no layout: pin the container rect so the divider's clamp and
// percentage math see a 1200px-wide split view. With --split-detail-width
// unresolvable in jsdom, the right pane initializes to the 480px fallback:
// valuenow 40, valuemin 23 (280/1200), valuemax 77 (920/1200), step 24px.
beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 1200,
    height: 800,
    top: 0,
    left: 0,
    right: 1200,
    bottom: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderSplit(): { divider: HTMLElement; container: HTMLElement } {
  render(SplitView, { props: { left: pane, right: pane } });
  const divider = document.querySelector('[role="separator"]');
  const container = document.querySelector(".split-view-container");
  if (
    !(divider instanceof HTMLElement) ||
    !(container instanceof HTMLElement)
  ) {
    throw new Error("split view did not render");
  }
  return { divider, container };
}

describe("SplitView divider", () => {
  it("is in the tab order with the window-splitter ARIA contract", () => {
    const { divider } = renderSplit();

    expect(divider.getAttribute("tabindex")).toBe("0");
    expect(divider.getAttribute("aria-orientation")).toBe("vertical");
    expect(divider.getAttribute("aria-label")).not.toBeNull();
    expect(divider.getAttribute("aria-valuenow")).toBe("40");
    expect(divider.getAttribute("aria-valuemin")).toBe("23");
    expect(divider.getAttribute("aria-valuemax")).toBe("77");
  });

  it("grows the right pane by a 2 percent step on ArrowLeft", async () => {
    const { divider, container } = renderSplit();

    await fireEvent.keyDown(divider, { key: "ArrowLeft" });

    expect(container.style.getPropertyValue("--right-w")).toBe("504px");
    expect(divider.getAttribute("aria-valuenow")).toBe("42");
  });

  it("shrinks the right pane by a 2 percent step on ArrowRight", async () => {
    const { divider, container } = renderSplit();

    await fireEvent.keyDown(divider, { key: "ArrowRight" });

    expect(container.style.getPropertyValue("--right-w")).toBe("456px");
    expect(divider.getAttribute("aria-valuenow")).toBe("38");
  });

  it("jumps to the minimum pane width on Home", async () => {
    const { divider, container } = renderSplit();

    await fireEvent.keyDown(divider, { key: "Home" });

    expect(container.style.getPropertyValue("--right-w")).toBe("280px");
    expect(divider.getAttribute("aria-valuenow")).toBe("23");
  });

  it("jumps to the maximum pane width on End", async () => {
    const { divider, container } = renderSplit();

    await fireEvent.keyDown(divider, { key: "End" });

    expect(container.style.getPropertyValue("--right-w")).toBe("920px");
    expect(divider.getAttribute("aria-valuenow")).toBe("77");
  });

  it("clamps arrow resizing at the pane bounds", async () => {
    const { divider, container } = renderSplit();

    await fireEvent.keyDown(divider, { key: "End" });
    await fireEvent.keyDown(divider, { key: "ArrowLeft" });
    expect(container.style.getPropertyValue("--right-w")).toBe("920px");
    expect(divider.getAttribute("aria-valuenow")).toBe("77");

    await fireEvent.keyDown(divider, { key: "Home" });
    await fireEvent.keyDown(divider, { key: "ArrowRight" });
    expect(container.style.getPropertyValue("--right-w")).toBe("280px");
    expect(divider.getAttribute("aria-valuenow")).toBe("23");
  });

  it("ignores unrelated keys", async () => {
    const { divider, container } = renderSplit();

    await fireEvent.keyDown(divider, { key: "Enter" });

    expect(container.style.getPropertyValue("--right-w")).toBe("480px");
    expect(divider.getAttribute("aria-valuenow")).toBe("40");
  });
});
