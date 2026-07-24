// @vitest-environment jsdom
/**
 * SwipeableCard component tests.
 *
 * Covers swipe gesture branching (thresholds, directional lock, peek,
 * long-press, click suppression, disabled state), and the module-level
 * peek-dismiss coordination between instances.
 *
 * jsdom has no real layout engine, so spatial assertions (CSS transforms,
 * transition strings) are verified through observable callback effects
 * and DOM state rather than computed styles.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { tick } from "svelte";
import SwipeableCard from "./SwipeableCard.svelte";
import type { TicketQuickAction } from "./ticket-types.js";

afterEach(cleanup);

// Minimal child snippet for the card content slot.
const childSnippet = createRawSnippet(() => ({
  render: () => `<span data-testid="card-child">Card content</span>`,
}));

// PointerEvent constructor is missing in jsdom. Use a bare object with the
// properties the handler reads, dispatched via fireEvent which accepts
// partial event init dictionaries.
function pointerDown(
  el: Element,
  overrides: Partial<PointerEvent> = {},
): Promise<boolean> {
  return fireEvent.pointerDown(el, {
    pointerId: 1,
    button: 0,
    clientX: 200,
    clientY: 200,
    ...overrides,
  });
}

function pointerMove(
  el: Element,
  overrides: Partial<PointerEvent> = {},
): Promise<boolean> {
  return fireEvent.pointerMove(el, {
    pointerId: 1,
    clientX: 200,
    clientY: 200,
    ...overrides,
  });
}

function pointerUp(
  el: Element,
  overrides: Partial<PointerEvent> = {},
): Promise<boolean> {
  return fireEvent.pointerUp(el, {
    pointerId: 1,
    clientX: 200,
    clientY: 200,
    ...overrides,
  });
}

function pointerCancel(
  el: Element,
  overrides: Partial<PointerEvent> = {},
): Promise<boolean> {
  return fireEvent.pointerCancel(el, {
    pointerId: 1,
    ...overrides,
  });
}

function card(container: HTMLElement): HTMLElement {
  const el = container.querySelector("[data-testid='ticket-card']");
  if (!el) throw new Error("ticket-card not found");
  return el as HTMLElement;
}

function slider(container: HTMLElement): HTMLElement {
  const el = container.querySelector(".card-slider");
  if (!el) throw new Error("card-slider not found");
  return el as HTMLElement;
}

describe("SwipeableCard", () => {
  const defaults = {
    ticketId: "t-001",
    onaction: vi.fn<(ticketId: string, action: TicketQuickAction) => void>(),
    onlongpress: vi.fn<(ticketId: string) => void>(),
    children: childSnippet,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom elements lack setPointerCapture/releasePointerCapture/hasPointerCapture.
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  });

  afterEach(() => {
    defaults.onaction.mockClear();
    defaults.onlongpress.mockClear();
    vi.useRealTimers();
  });

  // ── Rendering ──

  it("renders the child snippet inside the sliding card", () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const child = container.querySelector("[data-testid='card-child']");
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe("Card content");
  });

  it("wraps content in a group role with data-testid ticket-card", () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);
    expect(el.getAttribute("role")).toBe("group");
  });

  // ── Disabled state ──

  it("ignores pointer events when disabled", async () => {
    const { container } = render(SwipeableCard, {
      props: { ...defaults, disabled: true },
    });
    const el = card(container);

    await pointerDown(el);
    await pointerMove(el, { clientX: 300 });
    await pointerUp(el);

    expect(defaults.onaction).not.toHaveBeenCalled();
  });

  it("ignores non-primary button pointer events", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // button: 2 is secondary (right-click)
    await pointerDown(el, { button: 2 });
    await pointerMove(el, { clientX: 300 });
    await pointerUp(el);

    expect(defaults.onaction).not.toHaveBeenCalled();
  });

  // ── Directional lock: vertical ──

  it("locks vertical and ignores horizontal when initial move is vertical", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Move vertically past LOCK_DISTANCE (8px)
    await pointerMove(el, { clientX: 200, clientY: 215 });
    // Then try horizontal movement
    await pointerMove(el, { clientX: 300, clientY: 215 });
    await pointerUp(el, { clientX: 300, clientY: 215 });

    // No action should fire since the swipe was locked vertical
    expect(defaults.onaction).not.toHaveBeenCalled();
  });

  // ── Directional lock: horizontal ──

  it("locks horizontal and captures pointer when initial move is horizontal", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Move horizontally past LOCK_DISTANCE (8px)
    await pointerMove(el, { clientX: 215, clientY: 200 });

    expect(HTMLElement.prototype.setPointerCapture).toHaveBeenCalled();
  });

  // ── Below LOCK_DISTANCE: no lock yet ──

  it("does not lock direction for movements below LOCK_DISTANCE", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Movement of 5px is below LOCK_DISTANCE (8px)
    await pointerMove(el, { clientX: 205, clientY: 200 });
    // This should not trigger a capture
    await pointerUp(el, { clientX: 205, clientY: 200 });

    expect(defaults.onaction).not.toHaveBeenCalled();
  });

  // ── Swipe right past ACTION_THRESHOLD fires near action ──

  it("fires reply action on right swipe past ACTION_THRESHOLD", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 100, clientY: 200 });
    // Move right past LOCK_DISTANCE then past ACTION_THRESHOLD (80px)
    await pointerMove(el, { clientX: 115, clientY: 200 });
    await pointerMove(el, { clientX: 200, clientY: 200 });
    await pointerUp(el, { clientX: 200, clientY: 200 });

    // The confirm animation fires the action after CONFIRM_HOLD (400ms)
    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "reply");
  });

  // ── Swipe right past FAR_THRESHOLD fires far action ──

  it("fires call action on right swipe past FAR_THRESHOLD", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 100, clientY: 200 });
    // Move right past FAR_THRESHOLD (140px)
    await pointerMove(el, { clientX: 115, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "call");
  });

  // ── Swipe left past ACTION_THRESHOLD fires near-left action ──

  it("fires assign action on left swipe past ACTION_THRESHOLD", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 300, clientY: 200 });
    // Move left past LOCK_DISTANCE then past ACTION_THRESHOLD
    await pointerMove(el, { clientX: 285, clientY: 200 });
    await pointerMove(el, { clientX: 200, clientY: 200 });
    await pointerUp(el, { clientX: 200, clientY: 200 });

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "assign");
  });

  // ── Swipe left past FAR_THRESHOLD fires far-left action ──

  it("fires hold action on left swipe past FAR_THRESHOLD", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 300, clientY: 200 });
    // Move left past FAR_THRESHOLD (140px)
    await pointerMove(el, { clientX: 285, clientY: 200 });
    await pointerMove(el, { clientX: 140, clientY: 200 });
    await pointerUp(el, { clientX: 140, clientY: 200 });

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "hold");
  });

  // ── Dead zone: below PEEK_THRESHOLD ──

  it("springs back with no action when swipe is below PEEK_THRESHOLD", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Move just 30px right (below PEEK_THRESHOLD of 40px)
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 230, clientY: 200 });
    await pointerUp(el, { clientX: 230, clientY: 200 });

    await vi.advanceTimersByTimeAsync(500);
    expect(defaults.onaction).not.toHaveBeenCalled();
    // No peek buttons shown
    expect(container.querySelector(".peek-tray")).toBeNull();
  });

  // ── Peek mode: between PEEK_THRESHOLD and ACTION_THRESHOLD ──

  it("enters peek mode on right swipe between PEEK and ACTION thresholds", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Move 60px right (above PEEK 40px, below ACTION 80px)
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });
    await tick();

    // Peek tray should appear with two buttons
    const tray = container.querySelector(".peek-tray");
    expect(tray).not.toBeNull();
    const buttons = tray?.querySelectorAll(".peek-btn") ?? [];
    expect(buttons).toHaveLength(2);
  });

  it("enters peek mode on left swipe between PEEK and ACTION thresholds", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 300, clientY: 200 });
    // Move 60px left
    await pointerMove(el, { clientX: 285, clientY: 200 });
    await pointerMove(el, { clientX: 240, clientY: 200 });
    await pointerUp(el, { clientX: 240, clientY: 200 });
    await tick();

    const tray = container.querySelector(".peek-tray");
    expect(tray).not.toBeNull();
    // Left peek appears on the right side
    expect(tray?.classList.contains("peek-tray--right")).toBe(true);
  });

  // ── Peek button click fires the action ──

  it("fires near action when the first peek button is clicked", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter peek mode via right swipe
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });
    await tick();

    const buttons = container.querySelectorAll(".peek-btn");
    expect(buttons).toHaveLength(2);
    await fireEvent.click(buttons[0]!);

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "reply");
  });

  it("fires far action when the second peek button is clicked", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter peek mode via right swipe
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });
    await tick();

    const buttons = container.querySelectorAll(".peek-btn");
    expect(buttons).toHaveLength(2);
    await fireEvent.click(buttons[1]!);

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "call");
  });

  // ── Pointer cancel ──

  it("resets state on pointer cancel mid-swipe", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 300, clientY: 200 });
    await pointerCancel(el);

    await vi.advanceTimersByTimeAsync(500);
    expect(defaults.onaction).not.toHaveBeenCalled();
    expect(container.querySelector(".peek-tray")).toBeNull();
  });

  it("ignores pointer cancel from a different pointer ID", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Cancel from a different pointer should be ignored
    await pointerCancel(el, { pointerId: 999 });
    // The original pointer should still work
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 300, clientY: 200 });
    await pointerUp(el, { clientX: 300, clientY: 200 });

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "reply");
  });

  // ── Long-press ──

  it("fires onlongpress after PRESS_DURATION without horizontal movement", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Hold without moving past thresholds
    await vi.advanceTimersByTimeAsync(500);

    expect(defaults.onlongpress).toHaveBeenCalledWith("t-001");
  });

  it("cancels long-press when vertical movement exceeds PRESS_SPREAD", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Move vertically past LOCK_DISTANCE to lock vertical,
    // then past PRESS_SPREAD (8px)
    await pointerMove(el, { clientX: 200, clientY: 215 });
    await vi.advanceTimersByTimeAsync(500);

    expect(defaults.onlongpress).not.toHaveBeenCalled();
  });

  it("cancels long-press when horizontal swipe starts", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // Move horizontally past PRESS_SPREAD (8px) before timer fires
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await vi.advanceTimersByTimeAsync(500);

    expect(defaults.onlongpress).not.toHaveBeenCalled();
  });

  // ── Click suppression ──

  it("suppresses click after a horizontal swipe", async () => {
    const clickSpy = vi.fn();
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);
    el.addEventListener("click", clickSpy);

    // Do a swipe and release in dead zone
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 230, clientY: 200 });
    await pointerUp(el, { clientX: 230, clientY: 200 });

    // Click on the card-slider (not the peek tray)
    const sliderEl = slider(container);
    await fireEvent.click(sliderEl);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("suppresses click after long-press fires", async () => {
    const clickSpy = vi.fn();
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);
    el.addEventListener("click", clickSpy);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    await vi.advanceTimersByTimeAsync(500);
    await pointerUp(el, { clientX: 200, clientY: 200 });

    const sliderEl = slider(container);
    await fireEvent.click(sliderEl);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("does not suppress click on peek-tray buttons", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter peek mode via right swipe
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });
    await tick();

    // Click on a peek button should not be suppressed
    const buttons = container.querySelectorAll(".peek-btn");
    expect(buttons).toHaveLength(2);
    // The handleClickCapture function returns early for .peek-tray children
    await fireEvent.click(buttons[0]!);

    await vi.advanceTimersByTimeAsync(400);
    // The action should fire since the click was allowed
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "reply");
  });

  // ── Pointer move ignored for different pointerId ──

  it("ignores pointer move events from a different pointer", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200, pointerId: 1 });
    // Move from a different pointer
    await pointerMove(el, { clientX: 300, clientY: 200, pointerId: 2 });
    await pointerUp(el, { clientX: 200, clientY: 200, pointerId: 1 });

    await vi.advanceTimersByTimeAsync(500);
    expect(defaults.onaction).not.toHaveBeenCalled();
  });

  // ── Pointer up ignored for different pointerId ──

  it("ignores pointer up events from a different pointer", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 100, clientY: 200 });
    await pointerMove(el, { clientX: 115, clientY: 200 });
    await pointerMove(el, { clientX: 200, clientY: 200 });
    // Up from a different pointer should not finalize
    await pointerUp(el, { clientX: 200, clientY: 200, pointerId: 2 });

    // The first pointer is still active, no action fires
    await vi.advanceTimersByTimeAsync(500);
    expect(defaults.onaction).not.toHaveBeenCalled();
  });

  // ── Rubber-band clamp at MAX_TRANSLATE ──

  it("clamps translation at MAX_TRANSLATE (200px)", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    await pointerDown(el, { clientX: 100, clientY: 200 });
    await pointerMove(el, { clientX: 115, clientY: 200 });
    // Try to move 400px right (well past MAX_TRANSLATE)
    await pointerMove(el, { clientX: 500, clientY: 200 });

    const sliderEl = slider(container);
    const transform = sliderEl.style.transform;
    // Should be clamped to 200px, not 400px
    expect(transform).toBe("translateX(200px)");
  });

  // ── Disabled during handlePointerMove ──

  it("does not respond to pointer move when disabled", async () => {
    const { container } = render(SwipeableCard, {
      props: { ...defaults, disabled: true },
    });
    const el = card(container);

    // Even with valid pointer events, disabled card should not move
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 300, clientY: 200 });
    await pointerUp(el, { clientX: 300, clientY: 200 });

    const sliderEl = slider(container);
    expect(sliderEl.style.transform).toBe("translateX(0px)");
  });

  // ── Click suppression disabled state ──

  it("does not suppress clicks when disabled", async () => {
    const clickSpy = vi.fn();
    const { container } = render(SwipeableCard, {
      props: { ...defaults, disabled: true },
    });
    const el = card(container);
    el.addEventListener("click", clickSpy);

    const sliderEl = slider(container);
    await fireEvent.click(sliderEl);

    // When disabled, the handleClickCapture returns early, so clicks are not suppressed
    expect(clickSpy).toHaveBeenCalled();
  });

  // ── Peek dismiss on new pointerdown ──

  it("dismisses peek when a new pointerdown arrives on the same card", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter peek mode
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });
    await tick();

    expect(container.querySelector(".peek-tray")).not.toBeNull();

    // New pointerdown on the card should dismiss the peek
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await tick();

    expect(container.querySelector(".peek-tray")).toBeNull();
  });

  // ── Peek button lands on .peek-tray, bypasses pointer down capture ──

  it("does not start swipe when pointer lands on peek tray", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter peek mode
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });
    await tick();

    const peekBtn = container.querySelector(".peek-btn");
    expect(peekBtn).not.toBeNull();
    if (peekBtn) {
      // Pointer down on peek-tray should return early
      await fireEvent.pointerDown(peekBtn, {
        pointerId: 2,
        button: 0,
        clientX: 50,
        clientY: 200,
      });
      // The action should not start a new swipe
      await fireEvent.pointerMove(peekBtn, {
        pointerId: 2,
        clientX: 200,
        clientY: 200,
      });
      await fireEvent.pointerUp(peekBtn, {
        pointerId: 2,
        clientX: 200,
        clientY: 200,
      });
    }

    await vi.advanceTimersByTimeAsync(500);
    // No swipe action should have fired from the peek-tray interaction
    expect(defaults.onaction).not.toHaveBeenCalled();
  });

  // ── Swipe clears peek state ──

  it("clears peek state when a new swipe begins", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter peek mode
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await pointerMove(el, { clientX: 260, clientY: 200 });
    await pointerUp(el, { clientX: 260, clientY: 200 });
    await tick();

    expect(container.querySelector(".peek-tray")).not.toBeNull();

    // Start a new swipe, which should dismiss peek first
    await pointerDown(el, { clientX: 200, clientY: 200 });
    await pointerMove(el, { clientX: 215, clientY: 200 });
    await tick();

    // Peek tray removed once swiping starts
    expect(container.querySelector(".peek-tray")).toBeNull();
  });

  // ── onaction not provided ──

  it("does not throw when onaction is not provided", async () => {
    const { container } = render(SwipeableCard, {
      props: { ticketId: "t-002", children: childSnippet },
    });
    const el = card(container);

    await pointerDown(el, { clientX: 100, clientY: 200 });
    await pointerMove(el, { clientX: 115, clientY: 200 });
    await pointerMove(el, { clientX: 200, clientY: 200 });
    await pointerUp(el, { clientX: 200, clientY: 200 });

    // Should not throw; the optional call (onaction?.) just skips
    await vi.advanceTimersByTimeAsync(400);
  });

  // ── onlongpress not provided ──

  it("does not throw when onlongpress is not provided", async () => {
    const { container } = render(SwipeableCard, {
      props: { ticketId: "t-002", children: childSnippet },
    });
    const el = card(container);

    await pointerDown(el, { clientX: 200, clientY: 200 });
    // No throw expected when timer fires without onlongpress
    await vi.advanceTimersByTimeAsync(500);
  });

  // ── Left peek: near and far buttons ──

  it("fires assign via left peek near button", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter left peek mode
    await pointerDown(el, { clientX: 300, clientY: 200 });
    await pointerMove(el, { clientX: 285, clientY: 200 });
    await pointerMove(el, { clientX: 240, clientY: 200 });
    await pointerUp(el, { clientX: 240, clientY: 200 });
    await tick();

    const buttons = container.querySelectorAll(".peek-btn");
    expect(buttons).toHaveLength(2);
    // First button in left peek = LEFT_NEAR (assign)
    await fireEvent.click(buttons[0]!);

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "assign");
  });

  it("fires hold via left peek far button", async () => {
    const { container } = render(SwipeableCard, { props: defaults });
    const el = card(container);

    // Enter left peek mode
    await pointerDown(el, { clientX: 300, clientY: 200 });
    await pointerMove(el, { clientX: 285, clientY: 200 });
    await pointerMove(el, { clientX: 240, clientY: 200 });
    await pointerUp(el, { clientX: 240, clientY: 200 });
    await tick();

    const buttons = container.querySelectorAll(".peek-btn");
    // Second button in left peek = LEFT_FAR (hold)
    await fireEvent.click(buttons[1]!);

    await vi.advanceTimersByTimeAsync(400);
    expect(defaults.onaction).toHaveBeenCalledWith("t-001", "hold");
  });
});
