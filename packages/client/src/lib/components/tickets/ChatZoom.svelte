<!--
  Pinch-to-zoom timeline view for the ticket detail chat.

  Wraps the Messages container and applies continuous CSS transform: scale()
  via raw pointer events. At zoomed-out scales, bubble text fades and
  timestamps become prominent. Tap a mini-bubble to zoom back and scroll
  to that message.

  Uses raw pointer events (not svelte-gestures) for full control over zoom
  center and scroll position management. See Design Decision in 06d plan.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import {
    MIN_SCALE,
    MAX_SCALE,
    TEXT_FADE_THRESHOLD,
    computeTextOpacity,
    computeTimestampOpacity,
  } from "./chat-zoom-utils.js";

  interface ChatZoomProps {
    /** The scrollable container element that holds the zoom content. */
    scrollContainerEl: HTMLDivElement | undefined;
    /** Total number of follow-ups in the conversation. */
    totalMessages: number;
    /** ISO date string of the earliest message in the conversation. */
    earliestDate: string | undefined;
    /** ISO date string of the most recent message. */
    latestDate: string | undefined;
    /** Two-way bindable: true when zoomed out (scale < 0.8). */
    zoomed?: boolean;
    children: Snippet;
  }

  let {
    scrollContainerEl,
    totalMessages,
    earliestDate,
    latestDate,
    zoomed = $bindable(false),
    children,
  }: ChatZoomProps = $props();

  let scale = $state(1.0);
  let isZooming = $state(false);
  let initialPinchDistance: number | null = null;
  let initialScale = 1.0;
  const pointers = new SvelteMap<number, PointerEvent>();

  const textOpacity = $derived(computeTextOpacity(scale));
  const timestampOpacity = $derived(computeTimestampOpacity(scale));

  const isZoomedOut = $derived(scale < 0.8);

  // Sync internal scale -> external zoomed prop.
  $effect(() => {
    zoomed = isZoomedOut;
  });

  // React to external zoomed changes (e.g. action sheet toggle).
  let prevZoomed = false;
  $effect(() => {
    if (zoomed && !prevZoomed) {
      scale = MIN_SCALE;
    } else if (!zoomed && prevZoomed) {
      scale = MAX_SCALE;
    }
    prevZoomed = zoomed;
  });

  // Accessible summary text: "N messages over M days, most recent X ago"
  const summaryText = $derived.by((): string => {
    if (
      totalMessages === 0 ||
      earliestDate === undefined ||
      latestDate === undefined
    ) {
      return "";
    }

    const earliest = new Date(earliestDate);
    const latest = new Date(latestDate);
    const diffMs = latest.getTime() - earliest.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const recency = formatRelativeTime(latest);

    return m.ticket_zoom_summary({
      count: String(totalMessages),
      days: String(diffDays),
      recency,
    });
  });

  function getPair(): [PointerEvent, PointerEvent] | undefined {
    const pts = [...pointers.values()];
    const p1 = pts[0];
    const p2 = pts[1];
    if (p1 === undefined || p2 === undefined) return undefined;
    return [p1, p2];
  }

  function pinchDistance(pair: [PointerEvent, PointerEvent]): number {
    return Math.hypot(
      pair[0].clientX - pair[1].clientX,
      pair[0].clientY - pair[1].clientY,
    );
  }

  function onPointerDown(e: PointerEvent): void {
    pointers.set(e.pointerId, e);
    if (pointers.size === 2) {
      isZooming = true;
      const pair = getPair();
      if (!pair) return;
      initialPinchDistance = pinchDistance(pair);
      initialScale = scale;
    }
  }

  function onPointerMove(e: PointerEvent): void {
    pointers.set(e.pointerId, e);
    if (!isZooming || pointers.size < 2 || initialPinchDistance === null)
      return;

    const pair = getPair();
    if (!pair) return;
    const currentDistance = pinchDistance(pair);

    scale = Math.max(
      MIN_SCALE,
      Math.min(
        MAX_SCALE,
        initialScale * (currentDistance / initialPinchDistance),
      ),
    );
  }

  // Track whether a pinch just ended so we can suppress the click that
  // browsers sometimes fire after a multi-pointer gesture.
  let suppressNextClick = false;

  function onPointerUp(e: PointerEvent): void {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) {
      if (isZooming) {
        suppressNextClick = true;
      }
      isZooming = false;
      initialPinchDistance = null;
    }
  }

  /**
   * Zoom-back core: zoom to 1.0 and scroll to the target follow-up.
   * Sets scale first, waits one frame for the container to resize, then
   * scrolls. This avoids cross-browser scrollIntoView issues on scaled
   * content (W3C CSSWG #9458).
   */
  function zoomBackTo(target: HTMLElement): void {
    const fuId = target.closest("[data-fu-id]")?.getAttribute("data-fu-id");
    if (fuId === null || fuId === undefined) return;

    scale = MAX_SCALE;

    requestAnimationFrame(() => {
      const el = document.getElementById(`fu-${fuId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /** Tap a mini-bubble when zoomed out to zoom back. */
  function onTapMini(e: MouseEvent): void {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    if (!isZoomedOut) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    zoomBackTo(target);
  }

  /** Keyboard equivalent: Enter/Space on a focused follow-up zooms back. */
  function onKeydownMini(e: KeyboardEvent): void {
    if (!isZoomedOut) return;
    if (e.key !== "Enter" && e.key !== " ") return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest("[data-fu-id]")) return;

    e.preventDefault();
    zoomBackTo(target);
  }
</script>

<div class="chat-zoom-wrapper">
  <!-- Zoom summary (visible when zoomed out, announced to screen readers) -->
  {#if isZoomedOut && summaryText}
    <div class="zoom-summary" aria-live="polite" role="status">
      {summaryText}
    </div>
  {/if}

  <!--
    Pointer events on this container track pinch gestures for zoom.
    Click/keydown handle zoom-back on mini-bubbles (keyboard alternative
    to tap). The action sheet "Zoom" option provides the primary accessible
    alternative. Suppressing a11y warning: this is a gesture-tracking
    surface, not a semantic interactive element.
  -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="chat-zoom-container"
    class:is-zooming={isZooming}
    style:transform="scale({scale})"
    style:transform-origin="top center"
    style:--text-opacity={textOpacity}
    style:--timestamp-opacity={timestampOpacity}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onclick={isZoomedOut ? onTapMini : undefined}
    onkeydown={isZoomedOut ? onKeydownMini : undefined}
  >
    {@render children()}
  </div>
</div>

<style>
  .chat-zoom-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .chat-zoom-container {
    transition: transform 0.2s linear;
    will-change: transform;
  }

  /* Only suppress browser pinch-zoom during active two-pointer gesture.
     Single-pointer scroll must still work. */
  .chat-zoom-container.is-zooming {
    touch-action: none;
  }

  /* Text opacity crossfade controlled by CSS custom properties set from JS */
  .chat-zoom-container :global(.bubble-text) {
    opacity: var(--text-opacity);
  }

  .chat-zoom-container :global(.bubble-time) {
    opacity: var(--timestamp-opacity);
  }

  @media (prefers-reduced-motion: reduce) {
    .chat-zoom-container {
      transition: none;
    }
  }

  .zoom-summary {
    text-align: center;
    font-size: 0.75rem;
    color: var(--muted, #666);
    padding: 0.375rem 1rem 0.25rem;
    background: var(--surface-1, #fff);
  }
</style>
