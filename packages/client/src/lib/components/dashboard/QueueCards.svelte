<!-- care-y-ignore no-hardcoded-user-strings -- every user string is an m.*() call; the validator's line scanner misreads prettier's compact inline-span formatting of the urgent segment as template text (the AST validator confirms clean) -->
<script lang="ts">
  import { Layers } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  interface QueueInfo {
    id: string;
    name: string | null;
    openCount: number;
    urgentCount: number;
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
    return queue.urgentCount > 0
      ? `${name}, ${open}, ${urgentLabel(queue.urgentCount)}`
      : `${name}, ${open}`;
  }
</script>

<CollapsibleSection
  heading={m.dashboard_queues_heading(withTerms())}
  icon={Layers}
  iconColor="var(--brand-text)"
  {loading}
  {expanded}
  {ontoggle}
>
  {#if loading}
    <div
      class="queue-grid skeleton-pulse"
      style:grid-template-columns="repeat(3, 1fr)"
    >
      {#each [1, 2, 3] as n (n)}
        <div class="queue-tile queue-tile-placeholder">
          <DecryptPlaceholder length={8} />
          <span class="queue-count"><InlineSkeleton width="5ch" /></span>
        </div>
      {/each}
    </div>
  {:else if queues.length > 0}
    <div
      class="queue-grid"
      style:grid-template-columns="repeat({Math.min(queues.length, 3)}, 1fr)"
    >
      {#each queues as queue (queue.id)}
        <button
          type="button"
          class="queue-tile"
          aria-label={tileAriaLabel(queue)}
          onclick={() => ontap(queue.id)}
        >
          <span class="queue-name">{queue.name ?? "..."}</span>
          <span class="queue-meta num">
            {m.dashboard_queues_open_count({
              count: queue.openCount,
            })}{#if queue.urgentCount > 0}<span class="queue-urgent"
                >{urgentLabel(queue.urgentCount)}</span
              >{/if}
          </span>
        </button>
      {/each}
    </div>
  {:else}
    <p class="no-queues">{m.dashboard_queues_no_queues(withTerms())}</p>
  {/if}
</CollapsibleSection>

<style>
  .queue-grid {
    display: grid;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) var(--space-lg);
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

  .queue-tile-placeholder {
    cursor: default;
    pointer-events: none;
  }

  .no-queues {
    padding: 0 var(--page-pad-x) var(--space-lg);
    font-size: var(--text-base);
    color: var(--muted);
  }
</style>
