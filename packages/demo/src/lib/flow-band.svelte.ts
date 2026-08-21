/**
 * State for the outer page's data flow band.
 *
 * The band renders the demo's own traffic as a swimlane: five
 * architecture lanes stacked vertically, one vertical slice per visitor
 * interaction, time running rightward. The phone emits flow events over
 * the bridge; this store groups them and owns the band's open state,
 * height, and which card is expanded.
 *
 * Grouping and clamping are pure functions so they can be tested without
 * a component or an effect root.
 *
 * No persistence of any kind. The band starts closed on every load, and
 * a restart (fresh iframe, fresh bridge) clears the slices through
 * reset().
 */

import { SvelteSet } from "svelte/reactivity";
import type { DemoFlowEvent, FlowLane } from "./bridge.js";
import { plainMap } from "./non-reactive.js";

// -----------------------------------------------------------------------
// Lane order and sizing
// -----------------------------------------------------------------------

/**
 * Lanes in render order, top to bottom. Cloud at the top, the visitor's
 * screen at the bottom, so a request reads as travelling upward.
 */
export const FLOW_LANES: readonly FlowLane[] = [
  "db",
  "server",
  "trpc",
  "crypto",
  "ui",
] as const;

/** Height of one lane row in CSS px. */
export const LANE_ROW_HEIGHT = 46;

/** Height of the per-slice header strip above the lane rows. */
export const SLICE_HEADER_HEIGHT = 24;

/** Opening height: five lane rows plus the slice header strip. */
export const DEFAULT_BAND_HEIGHT =
  LANE_ROW_HEIGHT * FLOW_LANES.length + SLICE_HEADER_HEIGHT;

/** Floor: rows compress but every lane stays visible and clickable. */
export const MIN_BAND_HEIGHT = 180;

/** Ceiling: past this the band would own more of the page than the story. */
export const MAX_BAND_HEIGHT = 520;

/** Retained slices. Older interactions drop off the left edge. */
export const MAX_SLICES = 40;

/** Cap on events within a single slice. Oldest events drop off the front. */
export const MAX_EVENTS_PER_SLICE = 60;

/**
 * Number of newest slices that stay expanded when a new slice is appended.
 * Older slices are auto-collapsed so the DOM ceiling stays bounded. The
 * user can still re-expand any collapsed slice via its header button.
 */
export const EXPANDED_SLICE_WINDOW = 3;

/**
 * Cap on a rendered payload preview. The phone side decides what a
 * preview contains; truncating here bounds what any single event can put
 * on screen regardless of what arrives over the bridge.
 */
export const PREVIEW_MAX_CHARS = 120;

// -----------------------------------------------------------------------
// Pure helpers
// -----------------------------------------------------------------------

/** Clamp a requested band height to the resize range. */
export function clampBandHeight(height: number): number {
  if (!Number.isFinite(height)) return DEFAULT_BAND_HEIGHT;
  return Math.min(
    MAX_BAND_HEIGHT,
    Math.max(MIN_BAND_HEIGHT, Math.round(height)),
  );
}

/** Row position of a lane, 0-based from the top. */
export function laneIndex(lane: FlowLane): number {
  return FLOW_LANES.indexOf(lane);
}

/**
 * The CSS custom property holding a lane's accent color. Written as a
 * switch so every lane is covered at compile time and no variable index
 * reaches an object.
 *
 * The color is an accent only: cards always carry the lane icon and a
 * text label, so nothing depends on telling the five hues apart.
 */
export function laneColorVar(lane: FlowLane): string {
  switch (lane) {
    case "db":
      return "var(--lane-db)";
    case "server":
      return "var(--lane-server)";
    case "trpc":
      return "var(--lane-trpc)";
    case "crypto":
      return "var(--lane-crypto)";
    case "ui":
      return "var(--lane-ui)";
  }
}

/** Truncate a payload preview for display. Null stays null. */
export function truncatePreview(
  preview: string | null,
  max: number = PREVIEW_MAX_CHARS,
): string | null {
  if (preview === null) return null;
  if (preview.length <= max) return preview;
  return preview.slice(0, max) + "...";
}

// -----------------------------------------------------------------------
// Slices
// -----------------------------------------------------------------------

/** One visitor interaction: the events it produced, in arrival order. */
export interface FlowSlice {
  readonly interactionId: number;
  readonly events: readonly DemoFlowEvent[];
  readonly collapsed: boolean;
}

/** Index of the most recent slice for an interaction, or -1. */
function lastIndexForInteraction(
  slices: readonly FlowSlice[],
  interactionId: number,
): number {
  for (let i = slices.length - 1; i >= 0; i--) {
    if (slices.at(i)?.interactionId === interactionId) return i;
  }
  return -1;
}

/**
 * Append an event to the slice for its interaction, starting a new slice
 * when none exists, and drop the oldest slices past maxSlices.
 *
 * Returns a new array; the input is never mutated. Re-ingesting an event
 * id already held by the slice is a no-op, so a double subscription
 * cannot double the cards.
 *
 * Dedup uses the fact that event ids are monotonically increasing
 * (flow-events.ts:157): comparing against the last event id suffices
 * instead of a linear scan. Events per slice are capped at
 * MAX_EVENTS_PER_SLICE; oldest events drop off the front on overflow.
 *
 * Only the touched slice path is shallow-copied; untouched slices share
 * identity with the input array.
 */
export function ingestFlowEvent(
  slices: readonly FlowSlice[],
  event: DemoFlowEvent,
  maxSlices: number = MAX_SLICES,
  maxEventsPerSlice: number = MAX_EVENTS_PER_SLICE,
): FlowSlice[] {
  const idx = lastIndexForInteraction(slices, event.interactionId);

  if (idx >= 0) {
    const target = slices.at(idx);
    if (target === undefined) return slices.slice();

    // Monotonic ids: if the last event's id >= this id, it is a duplicate.
    const lastEvent = target.events.at(-1);
    if (lastEvent !== undefined && lastEvent.id >= event.id) {
      return slices.slice();
    }
    const updated = [...target.events, event];
    // Cap: drop oldest from the front when the slice overflows.
    const trimmed =
      updated.length > maxEventsPerSlice
        ? updated.slice(updated.length - maxEventsPerSlice)
        : updated;
    return slices.map((s, i) =>
      i === idx ? { ...target, events: trimmed } : s,
    );
  }

  const appended: FlowSlice[] = [
    ...slices,
    {
      interactionId: event.interactionId,
      events: [event],
      collapsed: false,
    },
  ];
  const trimmed =
    appended.length <= maxSlices
      ? appended
      : appended.slice(appended.length - maxSlices);

  // Auto-collapse slices outside the expanded window so the DOM ceiling
  // stays bounded. Slices the user manually re-expanded will be
  // re-collapsed here on the next new-slice ingest, which is acceptable:
  // the user sees the newest work, and can re-expand any slice again.
  const windowStart = trimmed.length - EXPANDED_SLICE_WINDOW;
  return trimmed.map((s, i) =>
    i < windowStart && !s.collapsed ? { ...s, collapsed: true } : s,
  );
}

/** Flip the collapsed flag of one slice, leaving the rest untouched. */
export function toggleSliceCollapsed(
  slices: readonly FlowSlice[],
  interactionId: number,
): FlowSlice[] {
  return slices.map((slice) =>
    slice.interactionId === interactionId
      ? { ...slice, collapsed: !slice.collapsed }
      : slice,
  );
}

/** Width of one event column inside a slice, in CSS px. */
export const CARD_COLUMN_WIDTH = 152;

/** Gap between event columns inside a slice, in CSS px. */
export const CARD_COLUMN_GAP = 8;

// -----------------------------------------------------------------------
// Runs and cells
// -----------------------------------------------------------------------

/**
 * Shortest run that folds. Two is left alone deliberately: a request and
 * its response are two events, and hiding a pair behind a stack would
 * cost the reader the one thing the band exists to show.
 */
export const MIN_RUN_LENGTH = 3;

/**
 * One column of a slice: either a single event, or a run of repeats
 * drawn as a stack.
 *
 * A run needs the same lane, the same direction, and the same non-null
 * groupKey. The key is what makes the fold honest: it is set at the tap
 * by whoever knows the events are interchangeable, so a burst of title
 * decrypts folds while three different queries never do.
 */
export interface FlowCell {
  /**
   * Stable identity: the first event's id, which does not move as a run
   * grows. Used as the keyed-each key and as the expansion key.
   */
  readonly id: number;
  /** Every event in this column, in arrival order. One when not a run. */
  readonly events: readonly DemoFlowEvent[];
  /** The card on top: the only event, or the newest of a run. */
  readonly anchor: DemoFlowEvent;
  /** True when this column folds several repeats into a pile. */
  readonly isRun: boolean;
}

class FlowCellError extends Error {
  override readonly name = "FlowCellError";
}

/**
 * Build a cell. Anchor and id are resolved here rather than by accessor
 * functions so the template can reach both by plain property access: a
 * discriminated union would need narrowing inside an {#if}, which the
 * type-aware lint rules cannot follow through a Svelte template.
 */
function makeCell(events: readonly DemoFlowEvent[], isRun: boolean): FlowCell {
  const first = events.at(0);
  const last = events.at(-1);
  if (first === undefined || last === undefined) {
    throw new FlowCellError("A cell cannot be empty");
  }
  return { id: first.id, events, anchor: last, isRun };
}

/**
 * Whether two events belong to the same run.
 *
 * Every lane needs the same direction, so a burst of requests never
 * folds together with the responses that answer it.
 *
 * The crypto lane then folds on adjacency alone. Elsewhere a run of
 * three could be three genuinely different things, so a tap has to opt
 * in with a group key; in the crypto lane a burst is always the same
 * work repeated over different rows, and the reader learns nothing from
 * the twelfth unwrap that the first eleven did not already tell them.
 */
function sameRun(a: DemoFlowEvent, b: DemoFlowEvent): boolean {
  if (a.lane !== b.lane || a.direction !== b.direction) return false;
  if (a.lane === "crypto") return true;
  return a.groupKey !== null && a.groupKey === b.groupKey;
}

/**
 * Fold a slice's events into columns, collapsing runs of repeats.
 *
 * Runs shorter than MIN_RUN_LENGTH stay as individual cells, so a fold
 * only ever replaces something the reader would have had to scroll past
 * anyway.
 *
 * A run stays one cell whether the visitor has opened it or not. Opening
 * widens the cell and slides its cards apart rather than replacing them
 * with separate cells, which is what lets the spread animate: the same
 * elements move instead of one set unmounting and another appearing.
 */
export function groupSliceEvents(events: readonly DemoFlowEvent[]): FlowCell[] {
  const cells: FlowCell[] = [];
  let run: DemoFlowEvent[] = [];

  function flush(): void {
    const first = run.at(0);
    if (first === undefined) return;
    if (run.length >= MIN_RUN_LENGTH) {
      cells.push(makeCell(run, true));
    } else {
      for (const event of run) {
        cells.push(makeCell([event], false));
      }
    }
    run = [];
  }

  for (const event of events) {
    const previous = run.at(-1);
    if (previous !== undefined && !sameRun(previous, event)) {
      flush();
    }
    run.push(event);
  }
  flush();
  return cells;
}

/**
 * Columns a cell occupies. One, unless it is a run the visitor has
 * opened, in which case its cards have slid apart into a column each.
 */
export function cellSpan(
  cell: FlowCell,
  expandedRuns?: ReadonlySet<number>,
): number {
  if (!cell.isRun) return 1;
  return expandedRuns?.has(cell.id) === true ? cell.events.length : 1;
}

/**
 * Point list for the connector drawn through a slice's columns, in
 * order. The grid has a fixed column pitch and an even row height, so
 * the centres are arithmetic and need no measurement.
 *
 * A run contributes one point wherever its stack sits, folded or open,
 * so the line stays attached to the pile rather than threading through
 * every member of it.
 *
 * Returns an empty string for anything under two points, which is a
 * connector with nothing to connect.
 */
export function connectorPoints(
  cells: readonly FlowCell[],
  rowHeight: number,
  expandedRuns?: ReadonlySet<number>,
): string {
  const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;
  const points: string[] = [];
  let column = 0;
  for (const cell of cells) {
    const row = laneIndex(cell.anchor.lane);
    if (row >= 0) {
      const x = column * pitch + CARD_COLUMN_WIDTH / 2;
      const y = row * rowHeight + rowHeight / 2;
      points.push(`${String(Math.round(x))},${String(Math.round(y))}`);
    }
    column += cellSpan(cell, expandedRuns);
  }
  if (points.length < 2) return "";
  return points.join(" ");
}

/** Total columns a cell list occupies, for the slice's width. */
export function cellsColumnCount(
  cells: readonly FlowCell[],
  expandedRuns?: ReadonlySet<number>,
): number {
  return cells.reduce((total, cell) => total + cellSpan(cell, expandedRuns), 0);
}

/**
 * Events of a collapsed slice bucketed by lane, in render order.
 *
 * A folded interaction shows one stack per lane it reached, so the
 * shape of what happened survives the fold: which layers were involved
 * stays readable without unfolding.
 */
export function sliceEventsByLane(
  slice: FlowSlice,
): { lane: FlowLane; events: DemoFlowEvent[] }[] {
  const buckets: { lane: FlowLane; events: DemoFlowEvent[] }[] = [];
  for (const lane of FLOW_LANES) {
    const events = slice.events.filter((event) => event.lane === lane);
    if (events.length > 0) buckets.push({ lane, events });
  }
  return buckets;
}

// -----------------------------------------------------------------------
// Expanded event context
// -----------------------------------------------------------------------

/** The expanded card's position and span partner, for the detail panel. */
export interface ExpandedEventContext {
  readonly event: DemoFlowEvent;
  /** 1-based position within its slice. */
  readonly stepIndex: number;
  /** Total events in the slice. */
  readonly stepCount: number;
  /** Milliseconds since the first event in this slice. */
  readonly offsetMs: number;
  /** Other half of a request/response span, or null. */
  readonly partner: DemoFlowEvent | null;
}

/**
 * Find the step index (1-based), step count, and time offset for an
 * event inside its owning slice. Pure, for testing without an effect root.
 */
export function eventSlicePosition(
  slices: readonly FlowSlice[],
  event: DemoFlowEvent,
): { stepIndex: number; stepCount: number; offsetMs: number } | null {
  for (const slice of slices) {
    if (slice.interactionId !== event.interactionId) continue;
    const idx = slice.events.findIndex((e) => e.id === event.id);
    if (idx < 0) continue;
    const firstAt = slice.events[0]?.at ?? event.at;
    return {
      stepIndex: idx + 1,
      stepCount: slice.events.length,
      offsetMs: Math.round(event.at - firstAt),
    };
  }
  return null;
}

/**
 * Find the span partner for an event: the other event in the same slice
 * sharing `spanId` but with a different `id`. Returns null when the event
 * has no spanId or the partner is missing (e.g. the response has not
 * arrived yet).
 */
export function findSpanPartner(
  spanIndex: ReadonlyMap<number, readonly DemoFlowEvent[]>,
  event: DemoFlowEvent,
): DemoFlowEvent | null {
  if (event.spanId === null) return null;
  const group = spanIndex.get(event.spanId);
  if (group === undefined) return null;
  return group.find((e) => e.id !== event.id) ?? null;
}

// -----------------------------------------------------------------------
// Reactive store
// -----------------------------------------------------------------------

export interface FlowBandStore {
  /** True while the band (or, on small viewports, the overlay) is shown. */
  readonly open: boolean;
  /** Height of the lane area in CSS px. */
  readonly height: number;
  /** Slices oldest to newest. */
  readonly slices: readonly FlowSlice[];
  /** Total retained events, for the header count. */
  readonly eventCount: number;
  /** The event whose detail is expanded, or null. */
  readonly expandedEvent: DemoFlowEvent | null;
  /** Context for the expanded event's detail panel, or null. */
  readonly expandedContext: ExpandedEventContext | null;
  /** Cell ids of runs the visitor has unfolded. */
  readonly expandedRuns: ReadonlySet<number>;
  toggleOpen(): void;
  setOpen(open: boolean): void;
  setHeight(height: number): void;
  /** Feed one bridge event into the slices. */
  ingest(event: DemoFlowEvent): void;
  toggleSlice(interactionId: number): void;
  toggleExpanded(eventId: number): void;
  isExpanded(eventId: number): boolean;
  /** Unfold or refold a stack. Keyed by the run's first event id. */
  toggleRun(cellId: number): void;
  /** Drop every slice. Called when the phone restarts. */
  reset(): void;
}

export function createFlowBandStore(): FlowBandStore {
  let open = $state(false);
  let height = $state(DEFAULT_BAND_HEIGHT);
  let slices: readonly FlowSlice[] = $state([]);
  let expandedId: number | null = $state(null);
  // SvelteSet rather than a plain Set: the template reads this to decide
  // whether a stack is folded, so mutations have to be tracked.
  const expandedRuns = new SvelteSet<number>();

  // Running count avoids reducing over all slices per read.
  let runningEventCount = $state(0);

  // O(1) lookup for the expanded event, avoids linear scan over all events.
  const eventById = plainMap<number, DemoFlowEvent>();
  // Span pairs keyed by spanId, used to find request/response partners.
  const spanById = plainMap<number, DemoFlowEvent[]>();

  const expandedEvent = $derived.by((): DemoFlowEvent | null => {
    if (expandedId === null) return null;
    return eventById.get(expandedId) ?? null;
  });

  const expandedContext = $derived.by((): ExpandedEventContext | null => {
    const event = expandedEvent;
    if (event === null) return null;
    const pos = eventSlicePosition(slices, event);
    if (pos === null) return null;
    return {
      event,
      stepIndex: pos.stepIndex,
      stepCount: pos.stepCount,
      offsetMs: pos.offsetMs,
      partner: findSpanPartner(spanById, event),
    };
  });

  function rebuildIndex(current: readonly FlowSlice[]): void {
    eventById.clear();
    spanById.clear();
    for (const slice of current) {
      for (const event of slice.events) {
        eventById.set(event.id, event);
        if (event.spanId !== null) {
          let group = spanById.get(event.spanId);
          if (group === undefined) {
            group = [];
            spanById.set(event.spanId, group);
          }
          group.push(event);
        }
      }
    }
  }

  function reset(): void {
    slices = [];
    expandedId = null;
    runningEventCount = 0;
    eventById.clear();
    spanById.clear();
    expandedRuns.clear();
  }

  return {
    get open(): boolean {
      return open;
    },
    get height(): number {
      return height;
    },
    get slices(): readonly FlowSlice[] {
      return slices;
    },
    get eventCount(): number {
      return runningEventCount;
    },
    get expandedEvent(): DemoFlowEvent | null {
      return expandedEvent;
    },
    get expandedContext(): ExpandedEventContext | null {
      return expandedContext;
    },
    toggleOpen(): void {
      open = !open;
    },
    setOpen(next: boolean): void {
      open = next;
    },
    setHeight(next: number): void {
      height = clampBandHeight(next);
    },
    ingest(event: DemoFlowEvent): void {
      const prev = slices;
      const next = ingestFlowEvent(prev, event);
      slices = next;
      // Recount: the diff is the new total minus the old total.
      // ingestFlowEvent can add one event or trim the oldest slice.
      let count = 0;
      for (const s of next) {
        count += s.events.length;
      }
      runningEventCount = count;
      // Keep the index in sync. A full rebuild is simpler than tracking
      // which events were added or trimmed, and the map is bounded by
      // MAX_SLICES * MAX_EVENTS_PER_SLICE.
      rebuildIndex(next);
    },
    toggleSlice(interactionId: number): void {
      slices = toggleSliceCollapsed(slices, interactionId);
    },
    toggleExpanded(eventId: number): void {
      expandedId = expandedId === eventId ? null : eventId;
    },
    get expandedRuns(): ReadonlySet<number> {
      return expandedRuns;
    },
    toggleRun(id: number): void {
      if (expandedRuns.has(id)) {
        expandedRuns.delete(id);
      } else {
        expandedRuns.add(id);
      }
    },
    isExpanded(eventId: number): boolean {
      return expandedId === eventId;
    },
    reset,
  };
}
