// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import type { DashboardLaneId } from "@care-y/shared";
import {
  createLaneContinuity,
  firstVisibleTicketId,
  restoreHeaderFocus,
  restoreTicketFocus,
  scrollTicketToTop,
  type ArrangementChange,
  type LaneContinuity,
} from "./create-lane-continuity.svelte.js";

// ── Layout fakes ──
// jsdom lays nothing out: boxes and scroll positions come from here.

function setRect(el: Element, top: number, bottom = top + 80): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
    bottom,
  } as DOMRect);
}

/** A scroller whose scrollTop holds what the code writes to it. */
function makeScroller(scrollTop: number): HTMLElement {
  const scroller = document.createElement("main");
  let position = scrollTop;
  Object.defineProperty(scroller, "scrollTop", {
    configurable: true,
    get: () => position,
    set: (value: number) => {
      position = value;
    },
  });
  setRect(scroller, 0, 800);
  document.body.appendChild(scroller);
  return scroller;
}

/** A lane holding one card per ticket, each with its open button. */
function makeLane(
  scroller: HTMLElement,
  laneId: DashboardLaneId,
  tickets: readonly { id: string; top: number }[],
): HTMLElement {
  const lane = document.createElement("div");
  lane.id = `section-${laneId}`;
  for (const ticket of tickets) {
    const card = document.createElement("article");
    card.setAttribute("data-ticket-id", ticket.id);
    const open = document.createElement("button");
    open.type = "button";
    card.appendChild(open);
    lane.appendChild(card);
    setRect(card, ticket.top);
  }
  scroller.appendChild(lane);
  return lane;
}

function openButton(lane: HTMLElement, ticketId: string): HTMLButtonElement {
  const button = lane.querySelector<HTMLButtonElement>(
    `[data-ticket-id="${ticketId}"] button`,
  );
  if (button === null) throw new Error(`no card for ${ticketId}`);
  return button;
}

/**
 * Give a lane its header in one form: a toggle button (stacked) or a
 * heading (side by side), each holding the `<lane>-heading` label, as
 * the collapsible section renders them. Replaces the form already there.
 */
function setHeader(
  lane: HTMLElement,
  laneId: DashboardLaneId,
  form: "toggle" | "heading",
): HTMLElement {
  lane.querySelector("[data-header]")?.remove();
  const header = document.createElement(form === "toggle" ? "button" : "h2");
  header.setAttribute("data-header", "");
  const label = document.createElement("span");
  label.id = `${laneId}-heading`;
  header.appendChild(label);
  lane.prepend(header);
  return header;
}

function laneHeader(laneId: DashboardLaneId): HTMLElement | undefined {
  return (
    document
      .getElementById(`${laneId}-heading`)
      ?.closest<HTMLElement>("button, h2") ?? undefined
  );
}

const LANE_IDS: readonly DashboardLaneId[] = ["my-tickets", "unassigned"];

let lanesPerRow = $state(2);
let destroy: (() => void) | undefined;

function createContinuity(
  scroller: HTMLElement,
  onArrangementChange: (change: ArrangementChange) => void = vi.fn(),
): LaneContinuity {
  const box: { value?: LaneContinuity } = {};
  destroy = $effect.root(() => {
    box.value = createLaneContinuity({
      laneIds: LANE_IDS,
      lanesPerRow: () => lanesPerRow,
      laneElement: (id) =>
        document.getElementById(`section-${id}`) ?? undefined,
      scroller: () => scroller,
      laneHeader,
      onArrangementChange,
    });
  });
  flushSync();
  if (box.value === undefined) throw new Error("continuity not created");
  return box.value;
}

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    paddingTop: "0px",
  } as CSSStyleDeclaration);
});

afterEach(() => {
  destroy?.();
  destroy = undefined;
  lanesPerRow = 2;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("firstVisibleTicketId", () => {
  it("returns the first ticket showing in the scroller", () => {
    const scroller = makeScroller(300);
    const lane = makeLane(scroller, "my-tickets", [
      { id: "t1", top: -120 },
      { id: "t2", top: 40 },
      { id: "t3", top: 140 },
    ]);
    expect(firstVisibleTicketId(lane, scroller)).toBe("t2");
  });

  it("has no anchor while the scroller sits at its top", () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "my-tickets", [{ id: "t1", top: 40 }]);
    expect(firstVisibleTicketId(lane, scroller)).toBeNull();
  });
});

describe("scrollTicketToTop", () => {
  it("scrolls the ticket's top to the top of the scroller's view", () => {
    const scroller = makeScroller(300);
    const lane = makeLane(scroller, "my-tickets", [{ id: "t1", top: 75 }]);
    expect(scrollTicketToTop(lane, scroller, "t1")).toBe(true);
    expect(scroller.scrollTop).toBe(375);
  });
});

describe("restoreTicketFocus", () => {
  it("focuses the ticket's control when focus was lost", () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "my-tickets", [{ id: "t1", top: 0 }]);
    expect(restoreTicketFocus([lane], "t1")).toBe(true);
    expect(document.activeElement).toBe(openButton(lane, "t1"));
  });

  it("never takes focus from an input", () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "my-tickets", [{ id: "t1", top: 0 }]);
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    expect(restoreTicketFocus([lane], "t1")).toBe(false);
    expect(document.activeElement).toBe(input);
  });
});

describe("restoreHeaderFocus", () => {
  it("focuses a heading from script only when focus was lost", () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "my-tickets", []);
    const heading = setHeader(lane, "my-tickets", "heading");
    expect(restoreHeaderFocus(heading)).toBe(true);
    expect(document.activeElement).toBe(heading);
    expect(heading.getAttribute("tabindex")).toBe("-1");
  });

  it("never takes focus from an input", () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "my-tickets", []);
    const heading = setHeader(lane, "my-tickets", "heading");
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    expect(restoreHeaderFocus(heading)).toBe(false);
    expect(document.activeElement).toBe(input);
  });
});

describe("createLaneContinuity", () => {
  it("restores the primary lane's anchor, not another lane's", async () => {
    const scroller = makeScroller(300);
    makeLane(scroller, "my-tickets", [
      { id: "a1", top: -100 },
      { id: "a2", top: 30 },
    ]);
    const unassigned = makeLane(scroller, "unassigned", [
      { id: "b1", top: -100 },
      { id: "b2", top: 60 },
    ]);
    const onArrangementChange = vi.fn();
    const continuity = createContinuity(scroller, onArrangementChange);

    // A press in Unassigned makes it the lane in use.
    openButton(unassigned, "b2").dispatchEvent(
      new Event("pointerdown", { bubbles: true }),
    );
    continuity.record();
    expect(continuity.primary).toBe("unassigned");
    expect(continuity.anchor("my-tickets")).toBe("a2");
    expect(continuity.anchor("unassigned")).toBe("b2");

    lanesPerRow = 1;
    flushSync();

    await vi.waitFor(() => {
      expect(scroller.scrollTop).toBe(360);
    });
    expect(onArrangementChange).toHaveBeenCalledWith({
      primary: "unassigned",
      anchor: "b2",
      stacked: true,
    });
  });

  it("leaves the scroll alone while no lane has been used", async () => {
    const scroller = makeScroller(300);
    makeLane(scroller, "my-tickets", [{ id: "a1", top: 30 }]);
    const onArrangementChange = vi.fn();
    const continuity = createContinuity(scroller, onArrangementChange);
    continuity.record();

    lanesPerRow = 4;
    flushSync();

    await vi.waitFor(() => {
      expect(onArrangementChange).toHaveBeenCalledWith({
        primary: null,
        anchor: null,
        stacked: false,
      });
    });
    expect(scroller.scrollTop).toBe(300);
  });

  it("returns focus to the same ticket when its row re-rendered", async () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "my-tickets", [{ id: "t1", top: 0 }]);
    createContinuity(scroller);

    openButton(lane, "t1").focus();
    // The arrangement change re-renders the row: the focused node goes.
    lane.replaceChildren();
    const card = document.createElement("article");
    card.setAttribute("data-ticket-id", "t1");
    const fresh = document.createElement("button");
    card.appendChild(fresh);
    lane.appendChild(card);
    expect(document.activeElement).toBe(document.body);

    lanesPerRow = 1;
    flushSync();

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(fresh);
    });
  });

  it("never takes focus from an input on an arrangement change", async () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "my-tickets", [{ id: "t1", top: 0 }]);
    const onArrangementChange = vi.fn();
    createContinuity(scroller, onArrangementChange);

    openButton(lane, "t1").focus();
    const input = document.createElement("input");
    lane.appendChild(input);
    input.focus();

    lanesPerRow = 1;
    flushSync();

    await vi.waitFor(() => {
      expect(onArrangementChange).toHaveBeenCalled();
    });
    expect(document.activeElement).toBe(input);
  });

  it("moves focus from a lane's toggle to its heading when the lanes go side by side", async () => {
    lanesPerRow = 1;
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "unassigned", [{ id: "t1", top: 0 }]);
    const toggle = setHeader(lane, "unassigned", "toggle");
    createContinuity(scroller);

    toggle.focus();
    // Side by side, the section renders a heading in the toggle's place.
    const heading = setHeader(lane, "unassigned", "heading");
    expect(document.activeElement).toBe(document.body);

    lanesPerRow = 2;
    flushSync();

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(heading);
    });
    expect(heading.getAttribute("tabindex")).toBe("-1");
  });

  it("moves focus from a lane's heading back to its toggle when the lanes stack", async () => {
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "unassigned", [{ id: "t1", top: 0 }]);
    const heading = setHeader(lane, "unassigned", "heading");
    createContinuity(scroller);

    heading.setAttribute("tabindex", "-1");
    heading.focus();
    const toggle = setHeader(lane, "unassigned", "toggle");
    expect(document.activeElement).toBe(document.body);

    lanesPerRow = 1;
    flushSync();

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(toggle);
    });
    // The toggle stays a plain button in the tab order.
    expect(toggle.hasAttribute("tabindex")).toBe(false);
  });

  it("leaves focus in an input focused after the header was swapped", async () => {
    lanesPerRow = 1;
    const scroller = makeScroller(0);
    const lane = makeLane(scroller, "unassigned", [{ id: "t1", top: 0 }]);
    const toggle = setHeader(lane, "unassigned", "toggle");
    const onArrangementChange = vi.fn();
    createContinuity(scroller, onArrangementChange);

    toggle.focus();
    setHeader(lane, "unassigned", "heading");
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    lanesPerRow = 2;
    flushSync();

    await vi.waitFor(() => {
      expect(onArrangementChange).toHaveBeenCalled();
    });
    expect(document.activeElement).toBe(input);
  });
});
