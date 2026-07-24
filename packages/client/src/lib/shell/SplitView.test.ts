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

describe("SplitView pointer drag", () => {
  it("ignores non-primary mouse buttons", async () => {
    const { divider, container } = renderSplit();

    // Right-click (button 2) should not start dragging
    await fireEvent.pointerDown(divider, { button: 2, pointerId: 1 });
    await fireEvent.pointerMove(divider, {
      clientX: 800,
      pointerId: 1,
    });
    await fireEvent.pointerUp(divider, { pointerId: 1 });

    // Width unchanged from initial 480px
    expect(container.style.getPropertyValue("--right-w")).toBe("480px");
  });

  it("resizes the right pane when dragging with primary button", async () => {
    const { divider, container } = renderSplit();

    // jsdom does not implement setPointerCapture; stub it to prevent errors
    divider.setPointerCapture = vi.fn();

    await fireEvent.pointerDown(divider, {
      button: 0,
      pointerId: 1,
    });

    // Drag to clientX = 600, container.right = 1200, so rightWidth = 600
    await fireEvent.pointerMove(divider, {
      clientX: 600,
      pointerId: 1,
    });

    expect(container.style.getPropertyValue("--right-w")).toBe("600px");

    await fireEvent.pointerUp(divider, { pointerId: 1 });

    // After pointer up, further moves should not resize
    await fireEvent.pointerMove(divider, {
      clientX: 400,
      pointerId: 1,
    });

    expect(container.style.getPropertyValue("--right-w")).toBe("600px");
  });

  it("clamps drag to minimum pane width", async () => {
    const { divider, container } = renderSplit();

    divider.setPointerCapture = vi.fn();

    await fireEvent.pointerDown(divider, {
      button: 0,
      pointerId: 1,
    });

    // Drag far right (clientX near container.right), making right pane tiny
    await fireEvent.pointerMove(divider, {
      clientX: 1100,
      pointerId: 1,
    });

    // Right width should be clamped to MIN_PANE (280)
    expect(container.style.getPropertyValue("--right-w")).toBe("280px");

    await fireEvent.pointerUp(divider, { pointerId: 1 });
  });

  it("clamps drag to keep left pane at minimum width", async () => {
    const { divider, container } = renderSplit();

    divider.setPointerCapture = vi.fn();

    await fireEvent.pointerDown(divider, {
      button: 0,
      pointerId: 1,
    });

    // Drag far left (clientX near 0), making right pane almost full width
    await fireEvent.pointerMove(divider, {
      clientX: 50,
      pointerId: 1,
    });

    // Right width clamped so left pane stays at MIN_PANE (280):
    // max right = 1200 - 280 = 920
    expect(container.style.getPropertyValue("--right-w")).toBe("920px");

    await fireEvent.pointerUp(divider, { pointerId: 1 });
  });

  it("shows drag overlay during active drag", async () => {
    const { divider } = renderSplit();

    divider.setPointerCapture = vi.fn();

    expect(document.querySelector(".split-drag-overlay")).toBeNull();

    await fireEvent.pointerDown(divider, {
      button: 0,
      pointerId: 1,
    });

    expect(document.querySelector(".split-drag-overlay")).not.toBeNull();

    await fireEvent.pointerUp(divider, { pointerId: 1 });

    expect(document.querySelector(".split-drag-overlay")).toBeNull();
  });

  it("stops dragging on pointercancel", async () => {
    const { divider, container } = renderSplit();

    divider.setPointerCapture = vi.fn();

    await fireEvent.pointerDown(divider, {
      button: 0,
      pointerId: 1,
    });

    await fireEvent.pointerMove(divider, {
      clientX: 700,
      pointerId: 1,
    });

    expect(container.style.getPropertyValue("--right-w")).toBe("500px");

    // pointercancel should end the drag
    await fireEvent(
      divider,
      new PointerEvent("pointercancel", { pointerId: 1 }),
    );

    // Further moves should not resize
    await fireEvent.pointerMove(divider, {
      clientX: 400,
      pointerId: 1,
    });

    expect(container.style.getPropertyValue("--right-w")).toBe("500px");
  });

  it("ignores pointer move when not dragging", async () => {
    const { divider, container } = renderSplit();

    // Move without a preceding pointerdown
    await fireEvent.pointerMove(divider, {
      clientX: 600,
      pointerId: 1,
    });

    expect(container.style.getPropertyValue("--right-w")).toBe("480px");
  });
});

describe("SplitView rendering", () => {
  it("renders left and right pane content", () => {
    renderSplit();

    const leftPane = document.querySelector('[data-testid="split-left-pane"]');
    const rightPane = document.querySelector(
      '[data-testid="split-right-pane"]',
    );

    expect(leftPane).not.toBeNull();
    expect(rightPane).not.toBeNull();
    expect(leftPane!.textContent).toContain("pane");
    expect(rightPane!.textContent).toContain("pane");
  });

  it("applies has-subnavbar class when subnavbar prop is true", () => {
    render(SplitView, {
      props: { left: pane, right: pane, subnavbar: true },
    });

    const container = document.querySelector(".split-view-container");
    expect(container?.classList.contains("has-subnavbar")).toBe(true);
  });

  it("does not apply has-subnavbar class by default", () => {
    renderSplit();

    const container = document.querySelector(".split-view-container");
    expect(container?.classList.contains("has-subnavbar")).toBe(false);
  });
});
