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
  import FlowBandCardStack from "./FlowBandCardStack.svelte";
  import {
    FLOW_LANES,
    laneIndex,
    connectorPoints,
    groupSliceEvents,
    sliceEventsByLane,
    cellSpan,
    cellsColumnCount,
    CARD_COLUMN_WIDTH,
    CARD_COLUMN_GAP,
    type FlowSlice,
    type FlowCell,
  } from "./flow-band.svelte.js";
  import type { DemoFlowEvent, FlowLane } from "./bridge.js";

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
    /** Localized "N events" text for a stack's count, shown outside the card. */
    countLabel: (count: number) => string;
    /** Cell ids of runs the visitor has unfolded. */
    expandedRuns: ReadonlySet<number>;
    onToggleRun: (cellId: number) => void;
    /** Localized "scripted in this demo" badge text. */
    seamBadge: string;
    /** Localized card tooltips for the two expand states. */
    expandHint: string;
    collapseHint: string;
    /** Localized label for a stack's restack control. */
    restackLabel: string;
    laneName: (lane: FlowLane) => string;
    /** Localized direction name, read out in place of the arrow icon. */
    directionName: (direction: DemoFlowEvent["direction"]) => string;
    /** Passed through to FlowBandCard for locale-reactive message calls. */
    locale?: string;
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
    countLabel,
    expandedRuns,
    onToggleRun,
    seamBadge,
    expandHint,
    collapseHint,
    restackLabel,
    laneName,
    directionName,
    locale,
    isExpanded,
    onToggleSlice,
    onToggleCard,
  }: Props = $props();

  const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;

  // Columns, not events: a folded run holds one column and an open one
  // holds a column per card, so width and connector both count columns.
  const cells = $derived(groupSliceEvents(slice.events));

  const columnCount: number = $derived(cellsColumnCount(cells, expandedRuns));

  const bodyWidth: number = $derived(
    Math.max(CARD_COLUMN_WIDTH, columnCount * pitch - CARD_COLUMN_GAP),
  );

  const points: string = $derived(
    connectorPoints(cells, rowHeight, expandedRuns),
  );

  /** A cell with the grid columns it occupies, resolved once per change. */
  interface PlacedCell {
    readonly cell: FlowCell;
    readonly column: number;
    readonly span: number;
  }

  // Cells no longer map one to one onto columns, so a cell's start
  // column is the running total of the spans before it. Resolved into a
  // list rather than looked up per cell, which keeps the template free
  // of both the running total and a lookup structure.
  const placed: PlacedCell[] = $derived.by(() => {
    const out: PlacedCell[] = [];
    let column = 0;
    for (const cell of cells) {
      const span = cellSpan(cell, expandedRuns);
      out.push({ cell, column, span });
      column += span;
    }
    return out;
  });

  // A folded interaction shows one stack per lane it reached, so which
  // layers were involved survives the fold.
  const laneBuckets = $derived(sliceEventsByLane(slice));
</script>

<!-- Folded slices stay one column wide rather than a narrow stub, because
     the stacks inside them are real cards. The saving is in columns,
     which is where the cost was. A ten-event interaction folds to one. -->
<div
  class="slice"
  style:width="{slice.collapsed ? CARD_COLUMN_WIDTH : bodyWidth}px"
>
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
    <!-- Folded: one stack per lane the interaction reached, in the same
         rows the cards would occupy, so the shape of what happened is
         still readable without unfolding. Clicking any of them unfolds
         the whole interaction. -->
    <div
      class="slice-folded"
      style:height="{bodyHeight}px"
      style:grid-template-rows="repeat({FLOW_LANES.length}, {rowHeight}px)"
    >
      {#each laneBuckets as bucket (bucket.lane)}
        <div class="slice-cell" style:grid-row={laneIndex(bucket.lane) + 1}>
          <FlowBandCardStack
            events={bucket.events}
            expanded={false}
            laneName={laneName(bucket.lane)}
            directionName={directionName(
              bucket.events.at(-1)?.direction ?? "local",
            )}
            {seamBadge}
            spreadHint={toggleLabel}
            {expandHint}
            {collapseHint}
            {restackLabel}
            countLabel={countLabel(bucket.events.length)}
            {locale}
            {isExpanded}
            {onToggleCard}
            onToggleStack={() => onToggleSlice(slice.interactionId)}
          />
        </div>
      {/each}
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
        {#each placed as { cell, column, span } (cell.id)}
          {@const anchor = cell.anchor}
          <div
            class="slice-cell"
            style:grid-row={laneIndex(anchor.lane) + 1}
            style:grid-column="{column + 1} / span {span}"
          >
            {#if cell.isRun}
              {@const open = expandedRuns.has(cell.id)}
              <FlowBandCardStack
                events={cell.events}
                expanded={open}
                laneName={laneName(anchor.lane)}
                directionName={directionName(anchor.direction)}
                {seamBadge}
                spreadHint={expandHint}
                {expandHint}
                {collapseHint}
                {restackLabel}
                countLabel={countLabel(cell.events.length)}
                {locale}
                {isExpanded}
                {onToggleCard}
                onToggleStack={() => onToggleRun(cell.id)}
              />
            {:else}
              {@const expanded = isExpanded(cell.anchor.id)}
              <FlowBandCard
                event={cell.anchor}
                laneName={laneName(anchor.lane)}
                directionName={directionName(anchor.direction)}
                {seamBadge}
                toggleHint={expanded ? collapseHint : expandHint}
                {expanded}
                {locale}
                onToggle={onToggleCard}
              />
            {/if}
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

  /* Folded interactions keep the lane rows, so each lane's stack sits
     where that lane's cards would have been. */
  .slice-folded {
    position: relative;
    display: grid;
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
