<script lang="ts">
  /**
   * One flow event as a compact card. Carries its lane's icon and color
   * accent so the lane stays readable wherever the card is shown: in a
   * swimlane row, in the small-viewport list, or in the detail strip
   * where row geometry is gone.
   *
   * Text uses the page's normal colors. The lane color is an edge strip
   * and an icon tint, never the label.
   */

  import { Clapperboard } from "@lucide/svelte";
  import FlowBandLaneIcon from "./FlowBandLaneIcon.svelte";
  import { laneColorVar } from "./flow-band.svelte.js";
  import type { DemoFlowEvent } from "./bridge.js";

  interface Props {
    event: DemoFlowEvent;
    /** Localized lane name. Shown in list mode, read out in lane mode. */
    laneName: string;
    /** Localized "scripted in this demo" badge text. */
    seamBadge: string;
    /** Localized hint for what clicking does next, shown as the tooltip. */
    toggleHint: string;
    expanded: boolean;
    /** "lane" sits in a swimlane row; "list" is the small-viewport card. */
    variant?: "lane" | "list";
    onToggle: (eventId: number) => void;
  }

  let {
    event,
    laneName,
    seamBadge,
    toggleHint,
    expanded,
    variant = "lane",
    onToggle,
  }: Props = $props();
</script>

<button
  class="flow-card"
  class:flow-card--seam={event.seamKey !== null}
  class:flow-card--open={expanded}
  class:flow-card--list={variant === "list"}
  style:--lane-color={laneColorVar(event.lane)}
  type="button"
  title={toggleHint}
  aria-expanded={expanded}
  onclick={() => onToggle(event.id)}
>
  <span class="card-icon" aria-hidden="true">
    <FlowBandLaneIcon lane={event.lane} size={14} />
  </span>
  <span class="card-text">
    {#if variant === "list"}
      <span class="card-lane">{laneName}</span>
    {:else}
      <span class="card-sr">{laneName}</span>
    {/if}
    <span class="card-label">{event.label}</span>
  </span>
  {#if event.seamKey !== null}
    <span class="card-seam">
      <Clapperboard size={10} />
      <span class="card-sr">{seamBadge}</span>
    </span>
  {/if}
</button>

<style>
  .flow-card {
    display: flex;
    align-items: flex-start;
    gap: 0.375rem;
    width: 100%;
    min-width: 0;
    padding: 0.25rem 0.375rem;
    border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
    border-left: 3px solid var(--lane-color);
    border-radius: 8px;
    background: var(--raised);
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;
  }

  .flow-card:hover {
    background: color-mix(in srgb, var(--ink) 4%, transparent);
  }

  .flow-card:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 1px;
  }

  .flow-card--open {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--demo-accent) 35%, transparent);
  }

  /* Scripted seams read as scripted through shape, not color: a dashed
     outline plus the badge glyph, both independent of the lane hue. */
  .flow-card--seam {
    border-style: dashed;
    border-left-style: solid;
  }

  .flow-card--list {
    align-items: center;
    padding: 0.5rem 0.625rem;
    min-height: 44px;
  }

  .card-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding-top: 1px;
    color: var(--lane-color);
  }

  .card-text {
    display: flex;
    flex-direction: column;
    gap: 0.0625rem;
    min-width: 0;
    flex: 1 1 auto;
  }

  .card-lane {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .card-label {
    font-size: 0.6875rem;
    line-height: 1.25;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .flow-card--list .card-label {
    font-size: 0.8125rem;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .card-seam {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    color: var(--muted);
  }

  .card-sr {
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

  @media (prefers-reduced-motion: reduce) {
    .flow-card {
      transition: none;
    }
  }
</style>
