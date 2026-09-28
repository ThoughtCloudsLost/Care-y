/**
 * How the dashboard's ticket lanes are arranged right now, read back from
 * the layout rather than worked out again in script.
 *
 * The page's container queries are the only place the breakpoints live.
 * This reads the lane count they produced from the lanes grid's resolved
 * columns, and everything that behaves differently by arrangement
 * derives from that count:
 * - one lane per row is the stacked arrangement (collapsible sections,
 *   empty ones hidden);
 * - two or more per row keep every lane's slot and drop the collapse;
 * - four per row, with room to spare in a scroller the dashboard fills
 *   and lane bodies tall enough to work in, is board mode: the page stops
 *   scrolling and each lane scrolls itself.
 */

import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
import { offsetWithinScroller } from "$lib/utils/scroll-offset.js";

/**
 * Least height, in px, the dashboard needs from its scroller for board
 * mode. Below it the lanes would be too short to work in, so the page
 * scrolls and the lanes stay capped. It also keeps the Duo folded
 * landscape pose out of board mode. A starting value, to be tuned.
 */
export const BOARD_MIN_HEIGHT_PX = 560;

/**
 * Least height, in px, left for the lane bodies on the board once the
 * band and the lane headers and filter rows above the bodies take
 * theirs. A tall band (getting started, open filter rows) would
 * otherwise leave board lanes too short to scan, so below it the page
 * scrolls instead. A starting value, to be tuned.
 */
export const BOARD_MIN_LANE_BODY_PX = 320;

/** Lanes across one row of the board. */
const BOARD_LANES_PER_ROW = 4;

/**
 * Tracks in a grid's resolved `grid-template-columns`. For a grid
 * container the browser reports every track individually, in px and
 * without repeat() (CSS Grid Level 1, "Resolved Value of a Track
 * Listing"); line names in brackets are skipped. Anything else, such
 * as "none" off a grid, counts as one column.
 */
export function countGridTracks(template: string): number {
  const tracks = template
    .replace(/\[[^\]]*\]/g, " ")
    .split(/\s+/)
    .filter((token) => token !== "" && token !== "none");
  return Math.max(1, tracks.length);
}

export interface BoardEligibility {
  readonly lanesPerRow: number;
  /** Height the dashboard would fill in its scroller, in px. */
  readonly availableHeight: number;
  /**
   * Height left for the lane bodies within `availableHeight`, in px:
   * less the band and the lane chrome above the bodies.
   */
  readonly laneBodyHeight: number;
  /** The dashboard sits directly in its scroller, not nested deeper. */
  readonly contentRoot: boolean;
}

export function isBoardEligible(input: BoardEligibility): boolean {
  return (
    input.lanesPerRow === BOARD_LANES_PER_ROW &&
    input.availableHeight >= BOARD_MIN_HEIGHT_PX &&
    input.laneBodyHeight >= BOARD_MIN_LANE_BODY_PX &&
    input.contentRoot
  );
}

/**
 * The height the dashboard can take without its scroller scrolling:
 * the scroller's box less whatever sits above the dashboard (the chrome
 * padding, a banner) and the scroller's bottom padding.
 */
export function availableHeight(
  dashboard: HTMLElement,
  scroller: HTMLElement,
): number {
  const paddingBottom =
    parseFloat(getComputedStyle(scroller).paddingBottom) || 0;
  return (
    scroller.clientHeight -
    offsetWithinScroller(dashboard, scroller) -
    paddingBottom
  );
}

/**
 * How far below the dashboard's top edge the lane bodies start: the
 * dashboard's own padding, the band, and each lane's header and filter
 * row. The lanes share their rows, so any one body gives the edge for
 * all of them, and the edge is the same with or without the board.
 */
export function chromeAboveLaneBodies(
  dashboard: HTMLElement,
  laneBody: HTMLElement,
): number {
  return (
    laneBody.getBoundingClientRect().top - dashboard.getBoundingClientRect().top
  );
}

export interface DashboardArrangementDeps {
  /** The dashboard root. */
  readonly dashboard: () => HTMLElement | undefined;
  /** The context band above the lanes. */
  readonly band: () => HTMLElement | undefined;
  /** Any one lane's list body; undefined until one is laid out. */
  readonly laneBody: () => HTMLElement | undefined;
  /** The lanes grid the container queries lay out. */
  readonly lanes: () => HTMLElement | undefined;
  /** The page's scroll container, from the shell. */
  readonly scrollContainer: () => HTMLElement | undefined;
  /**
   * The lanes' view mode. It picks the breakpoints, so a change can move
   * the lane count without resizing anything.
   */
  readonly viewMode: () => ViewMode;
}

export interface DashboardArrangement {
  /** Lanes laid out across one row. 1 until the layout is read. */
  readonly lanesPerRow: number;
  /** One lane per row: today's mobile behaviour. */
  readonly stacked: boolean;
  /** The page does not scroll; each lane scrolls on its own. */
  readonly board: boolean;
  /** The dashboard's height in board mode, in px; undefined otherwise. */
  readonly boardHeight: number | undefined;
}

export function createDashboardArrangement(
  deps: DashboardArrangementDeps,
): DashboardArrangement {
  let lanesPerRow = $state(1);
  let fillHeight = $state(0);
  // Height left for the lane bodies; 0 until a body is laid out, which
  // keeps the board off until it can be measured.
  let laneBodyHeight = $state(0);
  let contentRoot = $state(false);

  // The lanes grid resizes whenever its breakpoints can change with it;
  // the view mode moves them without a resize, so it re-reads too.
  $effect(() => {
    const el = deps.lanes();
    deps.viewMode();
    if (el === undefined) return;
    const read = (): void => {
      lanesPerRow = countGridTracks(getComputedStyle(el).gridTemplateColumns);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  });

  // Re-measured when the scroller resizes, and when anything above the
  // lane bodies does: the dashboard (a banner in it, rows growing), the
  // band, or a lane body (a filter row opening squeezes it on the board,
  // where the dashboard's own height is fixed).
  $effect(() => {
    const scroller = deps.scrollContainer();
    const dashboard = deps.dashboard();
    const band = deps.band();
    const laneBody = deps.laneBody();
    if (scroller === undefined || dashboard === undefined) return;
    const measure = (): void => {
      contentRoot = dashboard.parentElement === scroller;
      fillHeight = availableHeight(dashboard, scroller);
      laneBodyHeight =
        laneBody === undefined
          ? 0
          : fillHeight - chromeAboveLaneBodies(dashboard, laneBody);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    ro.observe(dashboard);
    if (band !== undefined) ro.observe(band);
    if (laneBody !== undefined) ro.observe(laneBody);
    return () => ro.disconnect();
  });

  const board = $derived(
    isBoardEligible({
      lanesPerRow,
      availableHeight: fillHeight,
      laneBodyHeight,
      contentRoot,
    }),
  );

  return {
    get lanesPerRow(): number {
      return lanesPerRow;
    },
    get stacked(): boolean {
      return lanesPerRow === 1;
    },
    get board(): boolean {
      return board;
    },
    get boardHeight(): number | undefined {
      return board ? fillHeight : undefined;
    },
  };
}
