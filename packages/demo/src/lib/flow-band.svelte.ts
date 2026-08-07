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

import type { DemoFlowEvent, FlowLane } from "./bridge.js";

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
 */
export function ingestFlowEvent(
  slices: readonly FlowSlice[],
  event: DemoFlowEvent,
  maxSlices: number = MAX_SLICES,
  maxEventsPerSlice: number = MAX_EVENTS_PER_SLICE,
): FlowSlice[] {
  const idx = lastIndexForInteraction(slices, event.interactionId);

  if (idx >= 0) {
    return slices.map((slice, i) => {
      if (i !== idx) return slice;
      // Monotonic ids: if the last event's id >= this id, it is a duplicate.
      const lastEvent = slice.events.at(-1);
      if (lastEvent !== undefined && lastEvent.id >= event.id) return slice;
      const updated = [...slice.events, event];
      // Cap: drop oldest from the front when the slice overflows.
      const trimmed =
        updated.length > maxEventsPerSlice
          ? updated.slice(updated.length - maxEventsPerSlice)
          : updated;
      return { ...slice, events: trimmed };
    });
  }

  const appended: FlowSlice[] = [
    ...slices,
    {
      interactionId: event.interactionId,
      events: [event],
      collapsed: false,
    },
  ];
  if (appended.length <= maxSlices) return appended;
  return appended.slice(appended.length - maxSlices);
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
export const CARD_COLUMN_WIDTH = 132;

/** Gap between event columns inside a slice, in CSS px. */
export const CARD_COLUMN_GAP = 8;

/**
 * Point list for the connector drawn through a slice's cards, in event
 * order. The card grid has a fixed column pitch and an even row height,
 * so the centres are arithmetic and need no measurement.
 *
 * Returns an empty string for anything under two points, which is a
 * connector with nothing to connect.
 */
export function connectorPoints(
  events: readonly DemoFlowEvent[],
  rowHeight: number,
): string {
  const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;
  const points: string[] = [];
  events.forEach((event, i) => {
    const row = laneIndex(event.lane);
    if (row < 0) return;
    const x = i * pitch + CARD_COLUMN_WIDTH / 2;
    const y = row * rowHeight + rowHeight / 2;
    points.push(`${String(Math.round(x))},${String(Math.round(y))}`);
  });
  if (points.length < 2) return "";
  return points.join(" ");
}

/** Lanes a slice touched, in render order. Drives the slice's pulse spine. */
export function sliceLaneSpan(
  slice: FlowSlice,
): { first: number; last: number } | null {
  let first = FLOW_LANES.length;
  let last = -1;
  for (const event of slice.events) {
    const idx = laneIndex(event.lane);
    if (idx < 0) continue;
    if (idx < first) first = idx;
    if (idx > last) last = idx;
  }
  if (last < 0) return null;
  return { first, last };
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
  toggleOpen(): void;
  setOpen(open: boolean): void;
  setHeight(height: number): void;
  /** Feed one bridge event into the slices. */
  ingest(event: DemoFlowEvent): void;
  toggleSlice(interactionId: number): void;
  toggleExpanded(eventId: number): void;
  isExpanded(eventId: number): boolean;
  /** Drop every slice. Called when the phone restarts. */
  reset(): void;
}

export function createFlowBandStore(): FlowBandStore {
  let open = $state(false);
  let height = $state(DEFAULT_BAND_HEIGHT);
  let slices: readonly FlowSlice[] = $state([]);
  let expandedId: number | null = $state(null);

  const eventCount = $derived(
    slices.reduce((total, slice) => total + slice.events.length, 0),
  );

  const expandedEvent = $derived.by((): DemoFlowEvent | null => {
    if (expandedId === null) return null;
    for (const slice of slices) {
      const found = slice.events.find((e) => e.id === expandedId);
      if (found !== undefined) return found;
    }
    return null;
  });

  function reset(): void {
    slices = [];
    expandedId = null;
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
      return eventCount;
    },
    get expandedEvent(): DemoFlowEvent | null {
      return expandedEvent;
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
      slices = ingestFlowEvent(slices, event);
    },
    toggleSlice(interactionId: number): void {
      slices = toggleSliceCollapsed(slices, interactionId);
    },
    toggleExpanded(eventId: number): void {
      expandedId = expandedId === eventId ? null : eventId;
    },
    isExpanded(eventId: number): boolean {
      return expandedId === eventId;
    },
    reset,
  };
}
