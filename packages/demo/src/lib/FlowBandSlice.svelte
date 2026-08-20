<script lang="ts">
  /**
   * One visitor interaction as a vertical slice of the swimlane. Cards
   * step rightward in event order and up or down by lane, so a request
   * climbing from the screen to the database reads as a staircase and
   * the response reads as the way back down.
   *
   * The connector runs through the card centres. Column pitch and row
   * height are both fixed by the band, so the centres are arithmetic
   * and nothing has to be measured.
   */

  import { ChevronDown, ChevronRight } from "@lucide/svelte";
  import FlowBandCard from "./FlowBandCard.svelte";
  import {
    FLOW_LANES,
    laneIndex,
    connectorPoints,
    sliceLaneSpan,
    CARD_COLUMN_WIDTH,
    CARD_COLUMN_GAP,
    type FlowSlice,
  } from "./flow-band.svelte.js";
  import type { FlowLane } from "./bridge.js";

  interface Props {
    slice: FlowSlice;
    /** Height of one lane row in CSS px. */
    rowHeight: number;
    /** Height of the lane area below the slice header, in CSS px. */
    bodyHeight: number;
    /** Localized slice name, e.g. "Interaction 3". */
    label: string;
    /** Localized expand or collapse action name for the header button. */
    toggleLabel: string;
    /** Localized step count, used as the collapsed column's name. */
    stepsLabel: string;
    /** Localized "scripted in this demo" badge text. */
    seamBadge: string;
    /** Localized card tooltips for the two expand states. */
    expandHint: string;
    collapseHint: string;
    laneName: (lane: FlowLane) => string;
    isExpanded: (eventId: number) => boolean;
    onToggleSlice: (interactionId: number) => void;
    onToggleCard: (eventId: number) => void;
  }

  let {
    slice,
    rowHeight,
    bodyHeight,
    label,
    toggleLabel,
    stepsLabel,
    seamBadge,
    expandHint,
    collapseHint,
    laneName,
    isExpanded,
    onToggleSlice,
    onToggleCard,
  }: Props = $props();

  const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;

  const bodyWidth: number = $derived(
    Math.max(CARD_COLUMN_WIDTH, slice.events.length * pitch - CARD_COLUMN_GAP),
  );

  const points: string = $derived(connectorPoints(slice.events, rowHeight));

  // Lane span of a collapsed slice, drawn as a short vertical mark so a
  // folded interaction still shows how far up the stack it reached.
  const span = $derived(sliceLaneSpan(slice));
</script>

<div class="slice" style:width="{slice.collapsed ? 48 : bodyWidth}px">
  <button
    class="slice-head"
    type="button"
    aria-expanded={!slice.collapsed}
    title={toggleLabel}
    onclick={() => onToggleSlice(slice.interactionId)}
  >
    {#if slice.collapsed}
      <ChevronRight size={12} />
    {:else}
      <ChevronDown size={12} />
    {/if}
    <span class="slice-head-label">{label}</span>
  </button>

  {#if slice.collapsed}
    <div class="slice-collapsed" style:height="{bodyHeight}px">
      {#if span !== null}
        <span
          class="slice-span"
          aria-hidden="true"
          style:top="{span.first * rowHeight + rowHeight / 2}px"
          style:height="{(span.last - span.first) * rowHeight}px"
        ></span>
      {/if}
      <span class="slice-count" aria-hidden="true">{slice.events.length}</span>
      <span class="slice-sr">{stepsLabel}</span>
    </div>
  {:else}
    <div class="slice-body" style:height="{bodyHeight}px">
      <!-- Re-keyed on the event count so a newly arrived event replays
           the pulse. Attribute changes alone would not restart it. -->
      {#key slice.events.length}
        {#if points !== ""}
          <svg
            class="slice-connector"
            width={bodyWidth}
            height={bodyHeight}
            viewBox="0 0 {bodyWidth} {bodyHeight}"
            aria-hidden="true"
          >
            <polyline class="connector-base" {points} />
            <polyline class="connector-pulse" {points} />
          </svg>
        {/if}
      {/key}

      <div
        class="slice-grid"
        style:grid-template-rows="repeat({FLOW_LANES.length}, {rowHeight}px)"
        style:grid-auto-columns="{CARD_COLUMN_WIDTH}px"
        style:column-gap="{CARD_COLUMN_GAP}px"
      >
        {#each slice.events as event, i (event.id)}
          {@const expanded = isExpanded(event.id)}
          <div
            class="slice-cell"
            style:grid-row={laneIndex(event.lane) + 1}
            style:grid-column={i + 1}
          >
            <FlowBandCard
              {event}
              laneName={laneName(event.lane)}
              {seamBadge}
              toggleHint={expanded ? collapseHint : expandHint}
              {expanded}
              onToggle={onToggleCard}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .slice {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    border-left: 1px solid color-mix(in srgb, var(--ink) 6%, transparent);
    padding-left: 0.5rem;
  }

  .slice-head {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    height: 24px;
    padding: 0 0.25rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
  }

  .slice-head:hover {
    background: color-mix(in srgb, var(--ink) 4%, transparent);
    color: var(--ink);
  }

  .slice-head:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .slice-head-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .slice-body {
    position: relative;
  }

  .slice-collapsed {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slice-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  .slice-span {
    position: absolute;
    left: 50%;
    width: 2px;
    min-height: 2px;
    margin-left: -1px;
    border-radius: 1px;
    background: color-mix(in srgb, var(--ink) 16%, transparent);
  }

  .slice-count {
    position: relative;
    padding: 0 0.25rem;
    border-radius: 4px;
    background: color-mix(in srgb, var(--paper) 90%, transparent);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .slice-connector {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .connector-base {
    fill: none;
    stroke: color-mix(in srgb, var(--ink) 16%, transparent);
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  /* Travelling dash: the request climbing the lanes and the response
     coming back down. Runs twice, then the base line carries the shape. */
  .connector-pulse {
    fill: none;
    stroke: color-mix(in srgb, var(--demo-accent) 55%, transparent);
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-dasharray: 28 2000;
    animation: connector-travel 1.6s linear 2;
    animation-fill-mode: forwards;
  }

  @keyframes connector-travel {
    from {
      stroke-dashoffset: 2028;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  /* Reduced motion: the pulse becomes a static highlight over the
     whole connector rather than a dash travelling along it. */
  @media (prefers-reduced-motion: reduce) {
    .connector-pulse {
      animation: none;
      stroke-dasharray: none;
      stroke-opacity: 0.5;
    }
  }

  .slice-grid {
    position: relative;
    display: grid;
    grid-auto-flow: column;
    height: 100%;
    align-items: center;
  }

  .slice-cell {
    display: flex;
    align-items: center;
    min-width: 0;
  }
</style>
