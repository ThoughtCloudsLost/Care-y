// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
import {
  availableHeight,
  BOARD_MIN_HEIGHT_PX,
  BOARD_MIN_LANE_BODY_PX,
  chromeAboveLaneBodies,
  countGridTracks,
  createDashboardArrangement,
  isBoardEligible,
  type DashboardArrangement,
} from "./create-dashboard-arrangement.svelte.js";

// ── Layout fakes ──
// jsdom lays nothing out: computed styles and boxes come from here.

const styles = new Map<Element, Partial<CSSStyleDeclaration>>();

const observers: { callback: () => void; targets: Element[] }[] = [];

vi.stubGlobal(
  "ResizeObserver",
  vi.fn(function (
    this: {
      observe: (el: Element) => void;
      disconnect: () => void;
      unobserve: () => void;
    },
    callback: () => void,
  ) {
    const entry = { callback, targets: [] as Element[] };
    observers.push(entry);
    this.observe = (el: Element): void => {
      entry.targets.push(el);
    };
    this.disconnect = (): void => {
      entry.targets.length = 0;
    };
    this.unobserve = vi.fn();
  }),
);

/** Fire every observer watching `el`, as a resize would. */
function resize(el: Element): void {
  for (const o of observers) {
    if (o.targets.includes(el)) o.callback();
  }
  flushSync();
}

function setBox(el: HTMLElement, top: number, clientHeight = 0): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
  } as DOMRect);
  Object.defineProperty(el, "clientHeight", {
    configurable: true,
    value: clientHeight,
  });
}

interface Layout {
  scroller: HTMLElement;
  dashboard: HTMLElement;
  band: HTMLElement;
  lanes: HTMLElement;
  /** A lane's list body; unset for a layout whose lanes are not laid out. */
  laneBody: HTMLElement | undefined;
}

/**
 * A scroller holding the dashboard, which holds the band and the lanes
 * grid, with one lane body in it.
 */
function buildLayout(): Layout {
  const scroller = document.createElement("main");
  const dashboard = document.createElement("div");
  const band = document.createElement("div");
  const lanes = document.createElement("div");
  const laneBody = document.createElement("div");
  lanes.appendChild(laneBody);
  dashboard.append(band, lanes);
  scroller.appendChild(dashboard);
  document.body.appendChild(scroller);
  // The chrome padding sits above the dashboard: 100px down the scroller.
  setBox(scroller, 0, 900);
  setBox(dashboard, 100);
  // The band and the lane headers take 300px: the bodies start at 400,
  // leaving them 800 - 300 = 500px on the board.
  setBox(laneBody, 400);
  styles.set(scroller, { paddingBottom: "0px" });
  styles.set(lanes, { gridTemplateColumns: "600px" });
  return { scroller, dashboard, band, lanes, laneBody };
}

const FOUR_ACROSS = "300px 300px 300px 300px";

let viewMode = $state<ViewMode>("cards");
let destroy: (() => void) | undefined;

function createArrangement(layout: Layout): DashboardArrangement {
  const box: { value?: DashboardArrangement } = {};
  destroy = $effect.root(() => {
    box.value = createDashboardArrangement({
      dashboard: () => layout.dashboard,
      band: () => layout.band,
      laneBody: () => layout.laneBody,
      lanes: () => layout.lanes,
      scrollContainer: () => layout.scroller,
      viewMode: () => viewMode,
    });
  });
  flushSync();
  if (box.value === undefined) throw new Error("arrangement not created");
  return box.value;
}

beforeEach(() => {
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (el: Element): CSSStyleDeclaration =>
      ({
        gridTemplateColumns: "none",
        paddingBottom: "0px",
        paddingTop: "0px",
        ...styles.get(el),
      }) as CSSStyleDeclaration,
  );
});

afterEach(() => {
  destroy?.();
  destroy = undefined;
  viewMode = "cards";
  styles.clear();
  observers.length = 0;
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("countGridTracks", () => {
  it("counts the resolved tracks", () => {
    expect(countGridTracks("612px")).toBe(1);
    expect(countGridTracks("612px 612px")).toBe(2);
    expect(countGridTracks("300.5px 300.5px 300.5px 300.5px")).toBe(4);
  });

  it("skips line names", () => {
    expect(countGridTracks("[start] 612px [mid] 612px [end]")).toBe(2);
  });

  it("reads a box that is not a grid as one column", () => {
    expect(countGridTracks("none")).toBe(1);
    expect(countGridTracks("")).toBe(1);
  });
});

describe("isBoardEligible", () => {
  const eligible = {
    lanesPerRow: 4,
    availableHeight: BOARD_MIN_HEIGHT_PX,
    laneBodyHeight: BOARD_MIN_LANE_BODY_PX,
    contentRoot: true,
  };

  it("holds with four lanes across, room to spare, and the dashboard at the root", () => {
    expect(isBoardEligible(eligible)).toBe(true);
  });

  it("needs all four lanes in one row", () => {
    expect(isBoardEligible({ ...eligible, lanesPerRow: 2 })).toBe(false);
    expect(isBoardEligible({ ...eligible, lanesPerRow: 1 })).toBe(false);
  });

  it("needs the minimum height", () => {
    expect(
      isBoardEligible({
        ...eligible,
        availableHeight: BOARD_MIN_HEIGHT_PX - 1,
      }),
    ).toBe(false);
  });

  it("needs the minimum height left for the lane bodies", () => {
    expect(
      isBoardEligible({
        ...eligible,
        laneBodyHeight: BOARD_MIN_LANE_BODY_PX - 1,
      }),
    ).toBe(false);
  });

  it("needs the dashboard to be its scroller's content root", () => {
    expect(isBoardEligible({ ...eligible, contentRoot: false })).toBe(false);
  });
});

describe("chromeAboveLaneBodies", () => {
  it("is how far below the dashboard's top the lane bodies start", () => {
    const { dashboard, laneBody } = buildLayout();
    if (laneBody === undefined) throw new Error("no lane body");
    expect(chromeAboveLaneBodies(dashboard, laneBody)).toBe(300);
  });
});

describe("availableHeight", () => {
  it("is the scroller's height less what sits above the dashboard and the bottom padding", () => {
    const { scroller, dashboard } = buildLayout();
    styles.set(scroller, { paddingBottom: "20px" });
    expect(availableHeight(dashboard, scroller)).toBe(900 - 100 - 20);
  });
});

describe("createDashboardArrangement", () => {
  it("reads the lane count from the lanes grid's resolved columns", () => {
    const layout = buildLayout();
    const arrangement = createArrangement(layout);
    expect(arrangement.lanesPerRow).toBe(1);
    expect(arrangement.stacked).toBe(true);

    styles.set(layout.lanes, { gridTemplateColumns: "600px 600px" });
    resize(layout.lanes);
    expect(arrangement.lanesPerRow).toBe(2);
    expect(arrangement.stacked).toBe(false);
  });

  it("re-reads when the view mode changes, which moves the breakpoints without a resize", () => {
    const layout = buildLayout();
    styles.set(layout.lanes, { gridTemplateColumns: "600px 600px" });
    const arrangement = createArrangement(layout);
    expect(arrangement.lanesPerRow).toBe(2);

    // Table lanes need more width: the same box now holds one.
    styles.set(layout.lanes, { gridTemplateColumns: "1224px" });
    viewMode = "table";
    flushSync();
    expect(arrangement.lanesPerRow).toBe(1);
  });

  it("enters board mode at four across with room, taking the scroller's height", () => {
    const layout = buildLayout();
    styles.set(layout.lanes, {
      gridTemplateColumns: "300px 300px 300px 300px",
    });
    const arrangement = createArrangement(layout);
    expect(arrangement.board).toBe(true);
    expect(arrangement.boardHeight).toBe(800);
  });

  it("leaves board mode when the scroller gets too short", () => {
    const layout = buildLayout();
    styles.set(layout.lanes, {
      gridTemplateColumns: "300px 300px 300px 300px",
    });
    const arrangement = createArrangement(layout);
    expect(arrangement.board).toBe(true);

    setBox(layout.scroller, 0, 100 + BOARD_MIN_HEIGHT_PX - 1);
    resize(layout.scroller);
    expect(arrangement.board).toBe(false);
    expect(arrangement.boardHeight).toBeUndefined();
  });

  it("stays out of board mode while the dashboard is nested below its scroller's root", () => {
    const layout = buildLayout();
    const wrapper = document.createElement("div");
    layout.scroller.replaceChild(wrapper, layout.dashboard);
    wrapper.appendChild(layout.dashboard);
    styles.set(layout.lanes, {
      gridTemplateColumns: "300px 300px 300px 300px",
    });
    const arrangement = createArrangement(layout);
    expect(arrangement.lanesPerRow).toBe(4);
    expect(arrangement.board).toBe(false);
  });

  // The board is 800px tall in these layouts; a body starting this far
  // below the dashboard's top is left one px short of the minimum.
  const SQUEEZED_BODY_TOP = 100 + (800 - BOARD_MIN_LANE_BODY_PX) + 1;

  it("leaves board mode when the band grows and leaves the lane bodies too short", () => {
    const layout = buildLayout();
    styles.set(layout.lanes, { gridTemplateColumns: FOUR_ACROSS });
    const arrangement = createArrangement(layout);
    expect(arrangement.board).toBe(true);

    if (layout.laneBody === undefined) throw new Error("no lane body");
    setBox(layout.laneBody, SQUEEZED_BODY_TOP);
    resize(layout.band);
    expect(arrangement.board).toBe(false);
    expect(arrangement.boardHeight).toBeUndefined();
  });

  it("re-measures when the dashboard resizes, not only its scroller", () => {
    const layout = buildLayout();
    styles.set(layout.lanes, { gridTemplateColumns: FOUR_ACROSS });
    const arrangement = createArrangement(layout);
    if (layout.laneBody === undefined) throw new Error("no lane body");

    setBox(layout.laneBody, SQUEEZED_BODY_TOP);
    resize(layout.dashboard);
    expect(arrangement.board).toBe(false);

    setBox(layout.laneBody, 400);
    resize(layout.dashboard);
    expect(arrangement.board).toBe(true);
    expect(arrangement.boardHeight).toBe(800);
  });

  it("re-measures when a lane body resizes, as a filter row opening on the board squeezes it", () => {
    const layout = buildLayout();
    styles.set(layout.lanes, { gridTemplateColumns: FOUR_ACROSS });
    const arrangement = createArrangement(layout);
    if (layout.laneBody === undefined) throw new Error("no lane body");

    setBox(layout.laneBody, SQUEEZED_BODY_TOP);
    resize(layout.laneBody);
    expect(arrangement.board).toBe(false);
  });

  it("stays out of board mode until a lane body is laid out", () => {
    const layout = buildLayout();
    layout.laneBody = undefined;
    styles.set(layout.lanes, { gridTemplateColumns: FOUR_ACROSS });
    const arrangement = createArrangement(layout);
    expect(arrangement.lanesPerRow).toBe(4);
    expect(arrangement.board).toBe(false);
  });

  it("stays out of board mode at two across however tall the scroller", () => {
    const layout = buildLayout();
    styles.set(layout.lanes, { gridTemplateColumns: "600px 600px" });
    setBox(layout.scroller, 0, 4000);
    const arrangement = createArrangement(layout);
    expect(arrangement.board).toBe(false);
  });
});
