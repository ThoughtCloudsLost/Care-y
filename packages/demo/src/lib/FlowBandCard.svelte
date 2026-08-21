<script lang="ts">
  /**
   * One flow event as a compact card. The lane color washes the whole
   * card surface at low alpha, matching the register/tinted-block pattern
   * from the Inkwell design language. No left-border accent.
   *
   * The meta row (lane icon, direction, classification icon, duration)
   * sits above the label so the card is legible without opening.
   */

  import { ArrowDown, ArrowUp, Clapperboard, RefreshCw } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import FlowBandLaneIcon from "./FlowBandLaneIcon.svelte";
  import FlowBandKindIcon from "./FlowBandKindIcon.svelte";
  import { laneColorVar } from "./flow-band.svelte.js";
  import type { DemoFlowEvent, FlowValueKind } from "./bridge.js";

  interface Props {
    event: DemoFlowEvent;
    /** Localized lane name. Shown in list mode, read out in lane mode. */
    laneName: string;
    /**
     * Localized direction name. The arrow is decorative, so this is what
     * a screen reader gets for request versus response.
     */
    directionName: string;
    /** Localized "scripted in this demo" badge text. */
    seamBadge: string;
    /** Localized hint for what clicking does next, shown as the tooltip. */
    toggleHint: string;
    expanded: boolean;
    /** "lane" sits in a swimlane row; "list" is the small-viewport card. */
    variant?: "lane" | "list";
    /** Read so message calls re-run when the page locale changes. */
    locale?: string;
    onToggle: (eventId: number) => void;
  }

  let {
    event,
    laneName,
    directionName,
    seamBadge,
    toggleHint,
    expanded,
    variant = "lane",
    locale,
    onToggle,
  }: Props = $props();

  function classificationLabel(kind: FlowValueKind): string {
    void locale;
    switch (kind) {
      case "ciphertext":
        return m.demo_flow_kind_ciphertext();
      case "plaintext":
        return m.demo_flow_kind_plaintext();
      case "key-material":
        return m.demo_flow_kind_key_material();
      case "identifier":
        return m.demo_flow_kind_identifier();
      case "metadata":
        return m.demo_flow_kind_metadata();
    }
  }

  function durationText(ms: number): string {
    void locale;
    return m.demo_flow_duration_ms({ ms: String(ms) });
  }

  const classification = $derived(event.detail?.classification ?? null);
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
  <span class="card-meta">
    <span class="card-meta-icon" aria-hidden="true">
      <FlowBandLaneIcon lane={event.lane} size={12} />
    </span>
    {#if variant === "list"}
      <span class="card-lane-word">{laneName}</span>
    {:else}
      <span class="card-sr">{laneName}</span>
    {/if}
    <span class="card-dir" aria-hidden="true">
      {#if event.direction === "up"}
        <ArrowUp size={11} />
      {:else if event.direction === "down"}
        <ArrowDown size={11} />
      {:else}
        <RefreshCw size={11} />
      {/if}
    </span>
    <span class="card-sr">{directionName}</span>
    {#if classification !== null}
      <span
        class="card-class"
        aria-hidden="true"
        title={classificationLabel(classification)}
      >
        <FlowBandKindIcon kind={classification} size={11} />
      </span>
      <span class="card-sr">{classificationLabel(classification)}</span>
    {/if}
    {#if event.durationMs !== null}
      <span class="card-dur">{durationText(event.durationMs)}</span>
    {/if}
    {#if event.seamKey !== null}
      <span class="card-seam" aria-hidden="true">
        <Clapperboard size={10} />
      </span>
      <span class="card-sr">{seamBadge}</span>
    {/if}
  </span>
  <span class="card-label">{event.label}</span>
</button>

<style>
  .flow-card {
    display: flex;
    flex-direction: column;
    gap: 1px;
    width: 100%;
    min-width: 0;
    padding: 3px 5px;
    border: 1px solid var(--hair);
    border-radius: 10px;
    background: color-mix(in srgb, var(--lane-color) 8%, var(--raised));
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;
  }

  :global(html.dark) .flow-card {
    background: color-mix(in srgb, var(--lane-color) 12%, var(--raised));
  }

  .flow-card:hover {
    background: color-mix(in srgb, var(--lane-color) 13%, var(--raised));
  }

  :global(html.dark) .flow-card:hover {
    background: color-mix(in srgb, var(--lane-color) 17%, var(--raised));
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
  }

  .flow-card--list {
    padding: 0.5rem 0.625rem;
    min-height: 44px;
    gap: 2px;
  }

  /* Meta row: icon + lane word (sr-only in lane mode) + direction +
     classification shape + duration. Fits in 12px line-height. */
  .card-meta {
    display: flex;
    align-items: center;
    gap: 3px;
    min-width: 0;
    line-height: 12px;
    font-size: 0.5625rem;
    color: var(--muted);
  }

  .card-meta-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    color: var(--lane-color);
  }

  .card-lane-word {
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Both markers are icons, so they need the same flex centring the lane
     icon gets. They inherit the meta row's --muted rather than taking the
     lane hue: the lane already has its own icon two slots to the left,
     and tinting these would read as a second lane signal. */
  .card-dir,
  .card-class {
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }

  .card-dur {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  .card-seam {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    margin-left: auto;
  }

  .card-label {
    font-size: 0.6875rem;
    line-height: 1.2;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .flow-card--list .card-meta {
    font-size: 0.625rem;
    line-height: 14px;
  }

  .flow-card--list .card-label {
    font-size: 0.8125rem;
    -webkit-line-clamp: 3;
    line-clamp: 3;
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
