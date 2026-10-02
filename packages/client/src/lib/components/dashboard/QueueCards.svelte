<!-- care-y-ignore no-hardcoded-user-strings -- every user string is an m.*() call; the validator's line scanner misreads prettier's compact inline-span formatting of the urgent segment as template text (the AST validator confirms clean) -->
<script lang="ts">
  import { Layers } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import type { QueueAppearance } from "$lib/utils/queue-appearance.js";

  /**
   * The available balance of the fund the queue draws on, or unavailable
   * when the provider's raised total could not be read.
   */
  type QueueFundBalance =
    | {
        kind: "amount";
        /** Formatted in the fund's currency. */
        amount: string;
        belowZero: boolean;
      }
    | { kind: "unavailable" };

  interface QueueInfo {
    id: string;
    name: string | null;
    openCount: number;
    urgentCount: number;
    appearance?: QueueAppearance;
    fundBalance?: QueueFundBalance;
  }

  interface QueueCardsProps {
    queues: QueueInfo[];
    loading?: boolean;
    expanded: boolean;
    ontoggle: () => void;
    ontap: (queueId: string) => void;
  }

  let {
    queues,
    loading = false,
    expanded,
    ontoggle,
    ontap,
  }: QueueCardsProps = $props();

  function urgentLabel(count: number): string {
    return count === 1
      ? m.dashboard_queue_urgent_one({ count })
      : m.dashboard_queue_urgent_other({ count });
  }

  // The aria string spells the counts out in words (never color alone), so
  // the urgent signal never rests on hue for assistive tech.
  function tileAriaLabel(queue: QueueInfo): string {
    const name = queue.name ?? "...";
    const open = m.dashboard_queues_open_count({ count: queue.openCount });
    const base =
      queue.urgentCount > 0
        ? `${name}, ${open}, ${urgentLabel(queue.urgentCount)}`
        : `${name}, ${open}`;
    return queue.fundBalance === undefined
      ? base
      : `${base}, ${balanceLabel(queue.fundBalance)}`;
  }

  // A balance below zero reads as a fact in words, never as an alarm. A
  // raised total that could not be read is said in words, never as zero.
  function balanceLabel(balance: QueueFundBalance): string {
    if (balance.kind === "unavailable") {
      return m.fund_balance_raised_unavailable();
    }
    return balance.belowZero
      ? m.fund_available_below_zero({ amount: balance.amount })
      : m.fund_available_amount({ amount: balance.amount });
  }

  function balanceBelowZero(balance: QueueFundBalance): boolean {
    return balance.kind === "amount" && balance.belowZero;
  }
</script>

<CollapsibleSection
  heading={m.dashboard_queues_heading(withTerms())}
  icon={Layers}
  iconColor="var(--brand-accent)"
  {loading}
  {expanded}
  {ontoggle}
>
  {#if loading}
    <div class="queue-grid skeleton-pulse">
      {#each [1, 2, 3] as n (n)}
        <div class="queue-tile queue-tile-placeholder">
          <DecryptPlaceholder length={8} />
          <span class="queue-count"><InlineSkeleton width="5ch" /></span>
        </div>
      {/each}
    </div>
  {:else if queues.length > 0}
    <div class="queue-grid">
      {#each queues as queue (queue.id)}
        <button
          type="button"
          class="queue-tile"
          aria-label={tileAriaLabel(queue)}
          onclick={() => ontap(queue.id)}
        >
          {#if queue.appearance}
            <QueueGlyph appearance={queue.appearance} size={18} />
          {/if}
          <span class="queue-name">{queue.name ?? "..."}</span>
          <span class="queue-meta num">
            {m.dashboard_queues_open_count({
              count: queue.openCount,
            })}{#if queue.urgentCount > 0}<span class="queue-urgent"
                >{urgentLabel(queue.urgentCount)}</span
              >{/if}
          </span>
          {#if queue.fundBalance}
            {@const balance = queue.fundBalance}
            <span
              class="queue-balance num"
              class:queue-balance-below={balanceBelowZero(balance)}
              class:queue-balance-unavailable={balance.kind === "unavailable"}
            >
              {balanceLabel(balance)}
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {:else}
    <p class="no-queues">{m.dashboard_queues_no_queues(withTerms())}</p>
  {/if}
</CollapsibleSection>

<style>
  /* Columns follow the grid's own width, wherever the section sits: at
     most three tiles across, each at least 92px (three still fit the
     narrowest phone). auto-fit drops the unused tracks, so one or two
     queues share the full width. */
  .queue-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(max(92px, calc((100% - 2 * var(--space-lg)) / 3)), 1fr)
    );
    gap: var(--space-lg);
    padding: 0.25rem var(--section-inset, var(--page-pad-x)) var(--space-lg);
  }

  /* Inkwell tile: hairline-bordered card, no shadow. */
  .queue-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: 0.875rem 0.25rem;
    text-align: center;
    background: var(--raised);
    border: 1px solid var(--hair-2);
    border-radius: 12px;
    box-shadow: none;
    cursor: pointer;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .queue-tile:active {
    opacity: 0.7;
  }

  .queue-name {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .queue-meta {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .num {
    font-variant-numeric: tabular-nums;
  }

  /* Urgency carries the word plus the reserved urgent hue, never hue alone.
     The dot separator is decorative (the aria-label spells out the count),
     so it lives in CSS rather than as template text. */
  .queue-urgent {
    color: var(--urgent);
  }

  .queue-urgent::before {
    content: "·";
    margin: 0 0.35em;
    color: var(--muted);
  }

  .queue-balance {
    font-size: var(--text-xs);
    color: var(--ink-2);
  }

  /* Below zero is distinct but neutral: muted italic, never a red alarm.
     The words carry the meaning, so hue is not the only signal. A raised
     total the provider could not supply takes the same treatment. */
  .queue-balance-below,
  .queue-balance-unavailable {
    color: var(--muted);
    font-style: italic;
  }

  .queue-tile-placeholder {
    cursor: default;
    pointer-events: none;
  }

  .no-queues {
    padding: 0 var(--section-inset, var(--page-pad-x)) var(--space-lg);
    font-size: var(--text-base);
    color: var(--muted);
  }
</style>
