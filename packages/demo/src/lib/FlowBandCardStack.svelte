<script lang="ts">
  /**
   * A run of repeated events drawn as the cards themselves, sitting on
   * top of each other. No summary card and no decorative edges: the pile
   * is the real cards, and the top of it reads exactly as that event
   * would read alone.
   *
   * They stay in one place and lean instead, which is what a stack of
   * paper on a desk actually looks like: nothing is squared up.
   *
   * Opening takes the lean out and slides them apart into a column each.
   * The cards are the same elements throughout, moved by a transform,
   * which is why the spread can animate at all: a fold that swapped one
   * set of cards for another would have nothing to tween between.
   *
   * The first card sits in normal flow and gives the pile its height.
   * The rest are laid over it, so DOM order puts the newest on top,
   * which is also the order they arrived in.
   */

  import { prefersReducedMotion } from "svelte/motion";
  import { Layers } from "@lucide/svelte";
  import FlowBandCard from "./FlowBandCard.svelte";
  import { CARD_COLUMN_WIDTH, CARD_COLUMN_GAP } from "./flow-band.svelte.js";
  import type { DemoFlowEvent } from "./bridge.js";

  interface Props {
    /** Run members in arrival order. The last one shows on top. */
    events: readonly DemoFlowEvent[];
    expanded: boolean;
    laneName: string;
    directionName: string;
    seamBadge: string;
    /** Localized hint shown on a card while the pile is closed. */
    spreadHint: string;
    /** Localized card tooltips once the pile is open and cards act normally. */
    expandHint: string;
    collapseHint: string;
    /** Localized label for the restack control. */
    restackLabel: string;
    /** Localized "N events" text, shown under the pile while it is closed. */
    countLabel: string;
    variant?: "lane" | "list";
    locale?: string;
    /** Whether a given member's detail panel is open. */
    isExpanded: (eventId: number) => boolean;
    /** Open or close one member's detail. Only reachable once spread. */
    onToggleCard: (eventId: number) => void;
    /** Spread the pile apart, or stack it back up. */
    onToggleStack: () => void;
  }

  let {
    events,
    expanded,
    laneName,
    directionName,
    seamBadge,
    spreadHint,
    expandHint,
    collapseHint,
    restackLabel,
    countLabel,
    variant = "lane",
    locale,
    isExpanded,
    onToggleCard,
    onToggleStack,
  }: Props = $props();

  const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;

  /**
   * Largest tilt any card takes, in degrees.
   *
   * A 152px card rotated 3deg reaches about 4px past each long edge, so
   * a pile does lean slightly into the lane rows above and below. That is
   * deliberate: lane rows are grid tracks rather than drawn boxes, and a
   * deck that stays perfectly inside its row does not read as a deck.
   */
  const MAX_TILT_DEG = 3;

  /**
   * Tilt for the card at `i`, as degrees.
   *
   * The card on top stays square so it stays readable; the ones under it
   * fan slightly, which is what makes the pile read as paper rather than
   * as one card with a border. Derived from the index rather than drawn
   * at random so a card does not jump to a new angle on every re-render.
   */
  function tiltOf(i: number, total: number): number {
    if (i === total - 1) return 0;
    // Cycles through five offsets so neighbours rarely share an angle.
    const step = ((i * 7) % 5) - 2;
    return (step / 2) * MAX_TILT_DEG;
  }

  /** Largest vertical nudge, in px. Enough to see, small enough to ignore. */
  const MAX_SHIFT_PX = 1.5;

  /**
   * Vertical nudge for the card at `i`, in px.
   *
   * A pile where every card is rotated but perfectly level still reads
   * as machined. A pixel or so of drift is what stops the edges forming
   * clean parallel lines. Stepped by 3 against the tilt's 7 so the two
   * cycles fall out of phase and no card repeats its neighbour's pose.
   */
  function shiftOf(i: number, total: number): number {
    if (i === total - 1) return 0;
    const step = ((i * 3) % 5) - 2;
    return (step / 2) * MAX_SHIFT_PX;
  }
</script>

<div
  class="stack"
  class:stack--open={expanded}
  class:stack--list={variant === "list"}
  class:stack--still={prefersReducedMotion.current}
  style:--pitch="{pitch}px"
  style:--card-w="{CARD_COLUMN_WIDTH}px"
>
  {#each events as event, i (event.id)}
    <div
      class="stack-layer"
      style:--i={i}
      style:--tilt="{tiltOf(i, events.length)}deg"
      style:--dy="{shiftOf(i, events.length)}px"
      style:z-index={i}
    >
      <!-- Closed, a card opens the pile. Open, it does what any card
           does: shows its own detail. Restacking moves to its own
           control so reading a card never folds the pile underneath. -->
      <FlowBandCard
        {event}
        {laneName}
        {directionName}
        {seamBadge}
        toggleHint={expanded
          ? isExpanded(event.id)
            ? collapseHint
            : expandHint
          : spreadHint}
        expanded={expanded && isExpanded(event.id)}
        {variant}
        {locale}
        onToggle={expanded ? onToggleCard : onToggleStack}
      />
    </div>
  {/each}

  {#if expanded}
    <button
      class="stack-restack"
      type="button"
      title={restackLabel}
      aria-label={restackLabel}
      onclick={onToggleStack}
    >
      <Layers size={11} />
    </button>
  {:else}
    <span class="stack-count">{countLabel}</span>
  {/if}
</div>

<style>
  .stack {
    position: relative;
    width: var(--card-w);
  }

  .stack--list {
    width: 100%;
  }

  /* Closed, the cards sit exactly on top of each other and lean a
     little. Open, the lean comes out and they slide into a column
     each, so one transform property carries the whole gesture. */
  .stack-layer {
    width: var(--card-w);
    transform: translateY(var(--dy)) rotate(var(--tilt));
    transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.3, 1);
  }

  .stack--list .stack-layer {
    width: 100%;
  }

  /* Every layer after the first is laid over the one in flow, so the
     pile has the height of a single card until it opens. */
  .stack-layer:not(:first-child) {
    position: absolute;
    top: 0;
    left: 0;
  }

  .stack--open .stack-layer {
    transform: translateX(calc(var(--i) * var(--pitch))) rotate(0deg);
  }

  /* The overlay is a vertical list, so an open pile there spreads down
     rather than across. */
  .stack--list.stack--open .stack-layer {
    position: relative;
    transform: none;
    margin-top: 0.375rem;
  }

  .stack--list.stack--open .stack-layer:first-child {
    margin-top: 0;
  }

  .stack-count {
    position: absolute;
    top: 100%;
    left: 0;
    width: var(--card-w);
    margin-top: 2px;
    font-size: 0.5625rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    color: var(--muted);
    text-align: center;
  }

  .stack--list .stack-count {
    position: static;
    display: block;
    width: auto;
    font-size: 0.625rem;
    text-align: left;
  }

  /* Sits under the first card, clear of every card's own hit area, so
     restacking cannot be triggered while reaching for a card. */
  .stack-restack {
    position: absolute;
    top: 100%;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 16px;
    margin-top: 2px;
    padding: 0;
    border: 1px solid var(--hair);
    border-radius: 5px;
    background: var(--raised);
    color: var(--muted);
    cursor: pointer;
  }

  .stack-restack:hover {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
    color: var(--ink);
  }

  .stack-restack:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 1px;
  }

  .stack--list .stack-restack {
    position: static;
    margin-top: 0.375rem;
  }

  .stack--still .stack-layer {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .stack-layer {
      transition: none;
    }
  }
</style>
