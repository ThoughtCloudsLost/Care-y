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
  FlowDetail,
  FlowDetailRow,
  FlowDirection,
  FlowLane,
  FlowValueKind,
} from "./bridge.js";

/**
 * Re-exported so a tap has one import for everything it needs to build a
 * detail. Type-only, so this adds no runtime edge and the leaf-module
 * rule above still holds.
 */
export type { FlowDetail, FlowDetailRow, FlowValueKind };

// -----------------------------------------------------------------------
// Tuning
// -----------------------------------------------------------------------

/** Quiet gap after which an event starts a new interaction on its own. */
export const FLOW_INTERACTION_IDLE_MS = 1500;

/** Cap for payload previews handed to the band. */
export const FLOW_PREVIEW_MAX = 120;

/**
 * Detail caps. A single wide INSERT has enough bound parameters to fill
 * the panel on its own, so the bounds are applied here, at the tap,
 * rather than at the renderer: an oversized detail never crosses the
 * bridge, which means nothing downstream has to defend against one.
 */
export const DETAIL_MAX_INPUT_ROWS = 12;
export const DETAIL_MAX_RESULT_ROWS = 8;
export const DETAIL_VALUE_MAX_CHARS = 64;
export const DETAIL_SOURCE_MAX_CHARS = 512;

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
// Recording mode
// -----------------------------------------------------------------------

/**
 * A captured flow event, stripped of ids and interaction grouping, which
 * are meaningless outside the interaction context that produced them.
 * Carries enough to replay through the normal emit path later.
 */
export interface RecordedFlowEvent {
  readonly lane: FlowLane;
  readonly direction: FlowDirection;
  readonly label: string;
  readonly seamKey: DemoSeamKey | null;
  readonly payloadPreview: string | null;
  readonly durationMs: number | null;
  readonly detail: FlowDetail | null;
}

let recording: RecordedFlowEvent[] | null = null;

/**
 * Start recording mode. While active, emitFlowEvent diverts events into
 * an internal buffer instead of delivering them to listeners. Id and
 * interaction grouping state still advances (callers that destructure
 * the return value keep working), but listener callbacks are skipped
 * and thunks are resolved eagerly so the recording captures labels.
 *
 * Only one recording can be active at a time; starting a second throws.
 */
export function startFlowRecording(): void {
  if (recording !== null) {
    throw new FlowRecordingError("A recording is already in progress");
  }
  recording = [];
}

/**
 * Stop recording mode and return the captured events. Returns an empty
 * array if no events were captured. Throws if no recording is active.
 */
export function stopFlowRecording(): RecordedFlowEvent[] {
  if (recording === null) {
    throw new FlowRecordingError("No recording is in progress");
  }
  const captured = recording;
  recording = null;
  return captured;
}

/** Whether recording mode is currently active. */
export function isFlowRecording(): boolean {
  return recording !== null;
}

class FlowRecordingError extends Error {
  override readonly name = "FlowRecordingError";
}

/**
 * Replay previously recorded events through the normal emit path.
 * Each event is emitted with the given seamKey and inherits the
 * current interaction grouping context so the band attributes it to
 * the active scene interaction.
 */
export function replayRecordedEvents(
  events: readonly RecordedFlowEvent[],
  seamKey: DemoSeamKey,
): void {
  for (const event of events) {
    emitFlowEvent({
      lane: event.lane,
      direction: event.direction,
      label: event.label,
      seamKey,
      payloadPreview: event.payloadPreview,
      durationMs: event.durationMs,
      detail: event.detail,
    });
  }
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

/**
 * Round a measured duration to something readable.
 *
 * Durations come from performance.now() deltas, so they arrive with the
 * clock's full precision (12.399999999552965). None of that is real
 * signal at this resolution, and a card is 152px wide.
 *
 * Under 10ms keeps one decimal, because sub-millisecond work is common
 * on the db and crypto lanes and rounding it to a flat 0 would report a
 * query as instant. At 10ms and above the decimal stops carrying
 * anything and whole milliseconds read better in a tabular column.
 *
 * A whole result stringifies without a trailing zero on its own, so 5.02
 * renders as "5 ms" rather than "5.0 ms".
 */
export function roundFlowDuration(
  ms: number | null | undefined,
): number | null {
  if (ms === undefined || ms === null || !Number.isFinite(ms)) return null;
  return ms >= 10 ? Math.round(ms) : Math.round(ms * 10) / 10;
}

// -----------------------------------------------------------------------
// Detail construction
// -----------------------------------------------------------------------

/** One row before capping. Taps build these; buildFlowDetail bounds them. */
export interface FlowDetailRowInput {
  readonly name: string;
  readonly value: string;
  readonly kind: FlowValueKind;
  readonly bytes?: number;
}

function capRows(
  rows: readonly FlowDetailRowInput[],
  max: number,
): FlowDetailRow[] {
  const kept: FlowDetailRow[] = rows.slice(0, max).map((row) => ({
    name: row.name,
    value:
      row.value.length <= DETAIL_VALUE_MAX_CHARS
        ? row.value
        : `${row.value.slice(0, DETAIL_VALUE_MAX_CHARS - 3)}...`,
    kind: row.kind,
    ...(row.bytes === undefined ? {} : { bytes: row.bytes }),
  }));
  const dropped = rows.length - kept.length;
  if (dropped > 0) {
    // Say what was dropped rather than truncating silently: a panel that
    // shows 12 of 40 parameters while looking complete is worse than one
    // that admits the cut.
    kept.push({
      name: "...",
      value: `+${String(dropped)} more`,
      kind: "metadata",
    });
  }
  return kept;
}

/**
 * Build a bounded FlowDetail. Every tap goes through here so the caps
 * cannot be forgotten at one call site.
 *
 * The classification is the dominant kind across the input rows, in
 * severity order: any ciphertext makes the event a ciphertext event,
 * then key material, then plaintext. That ordering is what puts the
 * strongest claim on the card face.
 */
export function buildFlowDetail(spec: {
  readonly source?: string | null;
  readonly input?: readonly FlowDetailRowInput[];
  readonly result?: readonly FlowDetailRowInput[];
  readonly classification?: FlowValueKind | null;
}): FlowDetail {
  const input = capRows(spec.input ?? [], DETAIL_MAX_INPUT_ROWS);
  const result = capRows(spec.result ?? [], DETAIL_MAX_RESULT_ROWS);
  const source = spec.source ?? null;
  return {
    source:
      source === null || source.length <= DETAIL_SOURCE_MAX_CHARS
        ? source
        : `${source.slice(0, DETAIL_SOURCE_MAX_CHARS - 3)}...`,
    input,
    result,
    classification: spec.classification ?? dominantKind(input),
  };
}

/** Strongest claim present in a row set, or null when there is none. */
function dominantKind(rows: readonly FlowDetailRow[]): FlowValueKind | null {
  const order: readonly FlowValueKind[] = [
    "ciphertext",
    "key-material",
    "plaintext",
    "identifier",
    "metadata",
  ];
  for (const kind of order) {
    if (rows.some((row) => row.kind === kind)) return kind;
  }
  return null;
}

/** Render a byte count as a value string. Length only, never content. */
export function describeFlowBytes(byteLength: number): string {
  return `${String(byteLength)} bytes`;
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
  /**
   * Structured payload, or a thunk resolved only when a listener exists.
   * Thunks matter more here than for payloadPreview: building a detail
   * walks every bound parameter, which is real work to skip when nobody
   * has the band open.
   */
  readonly detail?: FlowDetail | null | (() => FlowDetail);
  readonly durationMs?: number | null;
  /** Pair key shared by both halves of a span. See DemoFlowEvent.spanId. */
  readonly spanId?: number | null;
  /** Repeat key, so a run of the same operation folds. See DemoFlowEvent.groupKey. */
  readonly groupKey?: string | null;
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

/** Resolve a detail-or-thunk field. */
function resolveDetail(
  field: FlowDetail | null | (() => FlowDetail) | undefined,
): FlowDetail | null {
  if (field === undefined || field === null) return null;
  return typeof field === "function" ? field() : field;
}

/**
 * The id the next emitted event will receive. Span callers read this
 * before emitting their request half so both halves can carry the same
 * spanId, which makes the pair symmetric: neither half has to be looked
 * up through the other.
 */
export function peekNextFlowEventId(): number {
  return nextEventId;
}

/**
 * Build and dispatch a flow event to subscribers. When no listener is
 * attached the id/grouping bookkeeping still advances so late subscribers
 * see a consistent id sequence, but the event object itself is not
 * allocated and thunks are not resolved.
 *
 * When recording mode is active, events are captured into the recording
 * buffer with thunks resolved, but listeners are not called. Id and
 * grouping state still advance.
 */
export function emitFlowEvent(input: FlowEventInput): DemoFlowEvent {
  const at = input.at ?? flowNow();
  const grouped = resolveInteractionId(at);
  const id = nextEventId;
  nextEventId += 1;

  // Recording mode: capture the event and skip listener delivery.
  // Thunks are resolved so the recording stores concrete labels.
  if (recording !== null) {
    const rawPreview = input.payloadPreview;
    const resolvedPreview =
      rawPreview === undefined || rawPreview === null
        ? null
        : typeof rawPreview === "function"
          ? truncateFlowPreview(rawPreview())
          : truncateFlowPreview(rawPreview);

    const resolvedLabel = resolveField(input.label);
    const resolvedDetail = resolveDetail(input.detail);
    recording.push({
      lane: input.lane,
      direction: input.direction,
      label: resolvedLabel,
      seamKey: input.seamKey ?? null,
      payloadPreview: resolvedPreview,
      durationMs: roundFlowDuration(input.durationMs),
      detail: resolvedDetail,
    });

    return {
      id,
      interactionId: input.interactionId ?? grouped,
      lane: input.lane,
      direction: input.direction,
      label: resolvedLabel,
      seamKey: input.seamKey ?? null,
      payloadPreview: resolvedPreview,
      durationMs: roundFlowDuration(input.durationMs),
      detail: resolvedDetail,
      spanId: input.spanId ?? null,
      groupKey: input.groupKey ?? null,
      at,
    };
  }

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
      durationMs: roundFlowDuration(input.durationMs),
      detail: null,
      spanId: input.spanId ?? null,
      groupKey: input.groupKey ?? null,
      at,
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
    durationMs: roundFlowDuration(input.durationMs),
    detail: resolveDetail(input.detail),
    spanId: input.spanId ?? null,
    groupKey: input.groupKey ?? null,
    at,
  };

  for (const listener of listeners) {
    listener(event);
  }
  return event;
}

// -----------------------------------------------------------------------
// Spans
// -----------------------------------------------------------------------

export interface FlowSpanSpec<T = unknown> {
  readonly lane: FlowLane;
  readonly label: string | (() => string);
  readonly seamKey?: DemoSeamKey | null;
  readonly payloadPreview?: string | null | (() => string);
  /** Repeat key, carried by both halves so each side folds with its own kind. */
  readonly groupKey?: string | null;
  /** Structured detail for the request half. */
  readonly detail?: FlowDetail | null | (() => FlowDetail);
  /**
   * Structured detail for the response half, built from the settled
   * result. Called once, after run() resolves, and only when someone is
   * listening. Not called on rejection: the failure path reports the
   * error instead through failureDetail.
   */
  readonly resultDetail?: (value: T) => FlowDetail;
  /** Structured detail for the response half when run() rejects. */
  readonly failureDetail?: (err: unknown) => FlowDetail;
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
  spec: FlowSpanSpec<T>,
  run: () => Promise<T>,
): Promise<T> {
  if (listeners.length === 0 && recording === null) {
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
  // Read before emitting so both halves carry the same pair key and the
  // request half's spanId equals its own id.
  const spanId = peekNextFlowEventId();
  const { interactionId } = emitFlowEvent({
    lane: spec.lane,
    direction: spec.direction ?? "up",
    label: spec.label,
    seamKey: spec.seamKey ?? null,
    payloadPreview: spec.payloadPreview ?? null,
    detail: spec.detail,
    groupKey: spec.groupKey ?? null,
    spanId,
    at: started,
  });
  try {
    const result = await run();
    const resultDetail = spec.resultDetail;
    emitFlowEvent({
      lane: spec.lane,
      direction: spec.returnDirection ?? "down",
      label: spec.label,
      seamKey: spec.seamKey ?? null,
      durationMs: flowNow() - started,
      detail:
        resultDetail === undefined
          ? null
          : (): FlowDetail => resultDetail(result),
      groupKey: spec.groupKey ?? null,
      spanId,
      interactionId,
    });
    return result;
  } catch (err: unknown) {
    const failureDetail = spec.failureDetail;
    emitFlowEvent({
      lane: spec.lane,
      direction: spec.returnDirection ?? "down",
      label: `${resolveField(spec.label)} failed`,
      seamKey: spec.seamKey ?? null,
      payloadPreview: describeFlowError(err),
      durationMs: flowNow() - started,
      detail:
        failureDetail === undefined
          ? null
          : (): FlowDetail => failureDetail(err),
      groupKey: spec.groupKey ?? null,
      spanId,
      interactionId,
    });
    throw err;
  }
}

export interface FlowLocalSpec<T = unknown> {
  readonly lane: FlowLane;
  readonly label: string | (() => string);
  readonly seamKey?: DemoSeamKey | null;
  readonly payloadPreview?: string | null | (() => string);
  /** Repeat key, so a run of the same operation folds into a stack. */
  readonly groupKey?: string | null;
  /** Structured detail for taps whose payload does not depend on the result. */
  readonly detail?: FlowDetail | null | (() => FlowDetail);
  /**
   * Structured detail built from the settled result. A local span emits
   * exactly one event, after run() resolves, so this returns the WHOLE
   * detail (input rows included) rather than only the result half: the
   * tap's closure already holds its arguments, so building both sides in
   * one place is simpler than merging two partial details here. Takes
   * precedence over `detail` when both are supplied.
   */
  readonly resultDetail?: (value: T) => FlowDetail;
  /** Structured detail for the failure event when run() rejects. */
  readonly failureDetail?: (err: unknown) => FlowDetail;
}

/**
 * Emit ONE event once an async call settles, timed across the call and
 * grouped with whatever interaction was current when it started.
 * Rejections emit a failure event and rethrow.
 *
 * Timing and allocation are skipped when no listener is attached.
 */
export async function traceFlowLocal<T>(
  spec: FlowLocalSpec<T>,
  run: () => Promise<T>,
): Promise<T> {
  if (listeners.length === 0 && recording === null) {
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
    const resultDetail = spec.resultDetail;
    emitFlowEvent({
      lane: spec.lane,
      direction: "local",
      label: spec.label,
      seamKey: spec.seamKey ?? null,
      payloadPreview: spec.payloadPreview ?? null,
      detail:
        resultDetail === undefined
          ? spec.detail
          : (): FlowDetail => resultDetail(result),
      groupKey: spec.groupKey ?? null,
      durationMs: flowNow() - started,
      interactionId,
    });
    return result;
  } catch (err: unknown) {
    const failureDetail = spec.failureDetail;
    emitFlowEvent({
      lane: spec.lane,
      direction: "local",
      label: `${resolveField(spec.label)} failed`,
      seamKey: spec.seamKey ?? null,
      payloadPreview: describeFlowError(err),
      detail:
        failureDetail === undefined
          ? null
          : (): FlowDetail => failureDetail(err),
      groupKey: spec.groupKey ?? null,
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
 * Clear the bus: ids, grouping state, listeners, recording, and the
 * clock. The demo's own restart is an iframe reload, so this exists
 * for tests.
 */
export function resetFlowEvents(): void {
  listeners.length = 0;
  nextEventId = 1;
  currentInteractionId = 1;
  lastEventAt = null;
  recording = null;
  clock = defaultNow;
}
