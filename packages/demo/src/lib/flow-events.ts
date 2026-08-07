/**
 * Data-flow event bus for the outer page's swimlane band.
 *
 * Leaf module by design: it carries no runtime imports at all, because
 * both the initial phone chunk and the lazily loaded engine chunk tap
 * it. A single static edge from here into the engine graph would drag
 * PGlite onto the login path. The bridge import below is type-only and
 * therefore erased at build time.
 *
 * Ordering and identity never read the wall clock: ids come from a
 * module counter, and the idle-window grouping fallback takes its
 * timestamps from an injectable clock.
 */

import type {
  DemoFlowEvent,
  DemoFlowListener,
  DemoSeamKey,
  FlowDirection,
  FlowLane,
} from "./bridge.js";

// -----------------------------------------------------------------------
// Tuning
// -----------------------------------------------------------------------

/** Quiet gap after which an event starts a new interaction on its own. */
export const FLOW_INTERACTION_IDLE_MS = 1500;

/** Cap for payload previews handed to the band. */
export const FLOW_PREVIEW_MAX = 120;

// -----------------------------------------------------------------------
// Clock
// -----------------------------------------------------------------------

function defaultNow(): number {
  return performance.now();
}

let clock: () => number = defaultNow;

/** Replace the clock used for durations and interaction grouping. Tests only. */
export function setFlowClock(now: (() => number) | null): void {
  clock = now ?? defaultNow;
}

/** Current time from the injected clock. Taps use it for durations. */
export function flowNow(): number {
  return clock();
}

// -----------------------------------------------------------------------
// Bus state
// -----------------------------------------------------------------------

const listeners: DemoFlowListener[] = [];

let nextEventId = 1;
let currentInteractionId = 1;
let lastEventAt: number | null = null;

// -----------------------------------------------------------------------
// Interaction grouping
// -----------------------------------------------------------------------

/**
 * Start a new interaction group. Called on trusted visitor input, which
 * is the only signal that separates two bursts of work reliably.
 * Returns the new interaction id.
 */
export function beginFlowInteraction(): number {
  currentInteractionId += 1;
  lastEventAt = flowNow();
  return currentInteractionId;
}

/** The interaction id events currently land in. */
export function currentFlowInteractionId(): number {
  return currentInteractionId;
}

/**
 * Resolve the group an event emitted at `at` belongs to. A gap wider
 * than the idle window with no explicit begin in between opens a new
 * group, so background work (polling, retries) does not accumulate
 * into the visitor's last tap.
 */
function resolveInteractionId(at: number): number {
  if (lastEventAt !== null && at - lastEventAt > FLOW_INTERACTION_IDLE_MS) {
    currentInteractionId += 1;
  }
  lastEventAt = at;
  return currentInteractionId;
}

// -----------------------------------------------------------------------
// Preview helpers
// -----------------------------------------------------------------------

/** Collapse whitespace and clamp a preview string to the band's budget. */
export function truncateFlowPreview(
  value: string,
  max: number = FLOW_PREVIEW_MAX,
): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 3)}...`;
}

/** Short, non-leaking description of a thrown value for the response event. */
export function describeFlowError(err: unknown): string {
  return err instanceof Error ? err.name : "UnknownError";
}

// -----------------------------------------------------------------------
// Emit
// -----------------------------------------------------------------------

export interface FlowEventInput {
  readonly lane: FlowLane;
  readonly direction: FlowDirection;
  /** Plain string or a thunk that is resolved only when a listener exists. */
  readonly label: string | (() => string);
  readonly seamKey?: DemoSeamKey | null;
  /** Plain string, null, or a thunk resolved only when a listener exists. */
  readonly payloadPreview?: string | null | (() => string);
  readonly durationMs?: number | null;
  /**
   * Pin the event to an existing group. Response halves pass the id
   * captured when their request was emitted, so a slow call cannot
   * split its own pair across the idle window.
   */
  readonly interactionId?: number;
  /** Emission time, for callers that already read the clock. */
  readonly at?: number;
}

/** Resolve a string-or-thunk field. */
function resolveField(field: string | (() => string)): string {
  return typeof field === "function" ? field() : field;
}

/**
 * Build and dispatch a flow event to subscribers. When no listener is
 * attached the id/grouping bookkeeping still advances so late subscribers
 * see a consistent id sequence, but the event object itself is not
 * allocated and thunks are not resolved.
 */
export function emitFlowEvent(input: FlowEventInput): DemoFlowEvent {
  const at = input.at ?? flowNow();
  const grouped = resolveInteractionId(at);
  const id = nextEventId;
  nextEventId += 1;

  // No listeners: skip event construction entirely. Id and grouping
  // state have already advanced. subscribeFlowEvents does not replay,
  // so the missing event object is invisible to future subscribers.
  if (listeners.length === 0) {
    // Return a minimal sentinel so callers that destructure the
    // return value (e.g. traceFlowSpan reading interactionId) still work.
    return {
      id,
      interactionId: input.interactionId ?? grouped,
      lane: input.lane,
      direction: input.direction,
      label: typeof input.label === "function" ? "" : input.label,
      seamKey: input.seamKey ?? null,
      payloadPreview: null,
      durationMs: input.durationMs ?? null,
    };
  }

  const rawPreview = input.payloadPreview;
  const resolvedPreview =
    rawPreview === undefined || rawPreview === null
      ? null
      : typeof rawPreview === "function"
        ? truncateFlowPreview(rawPreview())
        : truncateFlowPreview(rawPreview);

  const event: DemoFlowEvent = {
    id,
    interactionId: input.interactionId ?? grouped,
    lane: input.lane,
    direction: input.direction,
    label: resolveField(input.label),
    seamKey: input.seamKey ?? null,
    payloadPreview: resolvedPreview,
    durationMs: input.durationMs ?? null,
  };

  for (const listener of listeners) {
    listener(event);
  }
  return event;
}

// -----------------------------------------------------------------------
// Spans
// -----------------------------------------------------------------------

export interface FlowSpanSpec {
  readonly lane: FlowLane;
  readonly label: string | (() => string);
  readonly seamKey?: DemoSeamKey | null;
  readonly payloadPreview?: string | null | (() => string);
  /** Direction of the request half. Defaults to "up". */
  readonly direction?: FlowDirection;
  /** Direction of the response half. Defaults to "down". */
  readonly returnDirection?: FlowDirection;
}

/**
 * Emit a request/response pair around an async call. Both halves share
 * the interaction id captured before the call runs; the response half
 * carries the elapsed time and, on rejection, a failure marker. The
 * rejection is rethrown untouched.
 *
 * When no listeners are attached, the two performance.now() calls and
 * the event-object allocations are skipped; only the id/grouping state
 * advances, which is cheap.
 */
export async function traceFlowSpan<T>(
  spec: FlowSpanSpec,
  run: () => Promise<T>,
): Promise<T> {
  if (listeners.length === 0) {
    // Advance ids/grouping but skip timing and allocation.
    const { interactionId } = emitFlowEvent({
      lane: spec.lane,
      direction: spec.direction ?? "up",
      label: spec.label,
      seamKey: spec.seamKey ?? null,
    });
    try {
      const result = await run();
      emitFlowEvent({
        lane: spec.lane,
        direction: spec.returnDirection ?? "down",
        label: spec.label,
        interactionId,
      });
      return result;
    } catch (err: unknown) {
      emitFlowEvent({
        lane: spec.lane,
        direction: spec.returnDirection ?? "down",
        label: `${resolveField(spec.label)} failed`,
        interactionId,
      });
      throw err;
    }
  }

  const started = flowNow();
  const { interactionId } = emitFlowEvent({
    lane: spec.lane,
    direction: spec.direction ?? "up",
    label: spec.label,
    seamKey: spec.seamKey ?? null,
    payloadPreview: spec.payloadPreview ?? null,
    at: started,
  });
  try {
    const result = await run();
    emitFlowEvent({
      lane: spec.lane,
      direction: spec.returnDirection ?? "down",
      label: spec.label,
      seamKey: spec.seamKey ?? null,
      durationMs: flowNow() - started,
      interactionId,
    });
    return result;
  } catch (err: unknown) {
    emitFlowEvent({
      lane: spec.lane,
      direction: spec.returnDirection ?? "down",
      label: `${resolveField(spec.label)} failed`,
      seamKey: spec.seamKey ?? null,
      payloadPreview: describeFlowError(err),
      durationMs: flowNow() - started,
      interactionId,
    });
    throw err;
  }
}

export interface FlowLocalSpec {
  readonly lane: FlowLane;
  readonly label: string | (() => string);
  readonly seamKey?: DemoSeamKey | null;
  readonly payloadPreview?: string | null | (() => string);
}

/**
 * Emit ONE event once an async call settles, timed across the call and
 * grouped with whatever interaction was current when it started.
 * Rejections emit a failure event and rethrow.
 *
 * Timing and allocation are skipped when no listener is attached.
 */
export async function traceFlowLocal<T>(
  spec: FlowLocalSpec,
  run: () => Promise<T>,
): Promise<T> {
  if (listeners.length === 0) {
    const interactionId = currentFlowInteractionId();
    try {
      const result = await run();
      emitFlowEvent({
        lane: spec.lane,
        direction: "local",
        label: spec.label,
        interactionId,
      });
      return result;
    } catch (err: unknown) {
      emitFlowEvent({
        lane: spec.lane,
        direction: "local",
        label: `${resolveField(spec.label)} failed`,
        interactionId,
      });
      throw err;
    }
  }

  const started = flowNow();
  const interactionId = currentFlowInteractionId();
  try {
    const result = await run();
    emitFlowEvent({
      lane: spec.lane,
      direction: "local",
      label: spec.label,
      seamKey: spec.seamKey ?? null,
      payloadPreview: spec.payloadPreview ?? null,
      durationMs: flowNow() - started,
      interactionId,
    });
    return result;
  } catch (err: unknown) {
    emitFlowEvent({
      lane: spec.lane,
      direction: "local",
      label: `${resolveField(spec.label)} failed`,
      seamKey: spec.seamKey ?? null,
      payloadPreview: describeFlowError(err),
      durationMs: flowNow() - started,
      interactionId,
    });
    throw err;
  }
}

// -----------------------------------------------------------------------
// Subscription and inspection
// -----------------------------------------------------------------------

/** Subscribe to NEW events. No replay. Returns an unsubscribe function. */
export function subscribeFlowEvents(listener: DemoFlowListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) {
      listeners.splice(idx, 1);
    }
  };
}

/**
 * Clear the bus: ids, grouping state, listeners, and the clock. The
 * demo's own restart is an iframe reload, so this exists for tests.
 */
export function resetFlowEvents(): void {
  listeners.length = 0;
  nextEventId = 1;
  currentInteractionId = 1;
  lastEventAt = null;
  clock = defaultNow;
}
