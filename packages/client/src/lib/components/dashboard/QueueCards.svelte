<script lang="ts">
  import { Layers } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  interface QueueInfo {
    id: string;
    name: string | null;
    openCount: number;
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
</script>

<CollapsibleSection
  heading={m.dashboard_queues_heading()}
  icon={Layers}
  iconColor="var(--brand-accent)"
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
          aria-label="{queue.name ?? '...'}, {m.dashboard_queues_open_count({
            count: queue.openCount,
          })}"
          onclick={() => ontap(queue.id)}
        >
          <span class="queue-name">{queue.name ?? "..."}</span>
          <span class="queue-count"
            >{m.dashboard_queues_open_count({ count: queue.openCount })}</span
          >
        </button>
      {/each}
    </div>
  {:else}
    <p class="no-queues">{m.dashboard_queues_no_queues()}</p>
  {/if}
</CollapsibleSection>

<style>
  .queue-grid {
    display: grid;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) var(--space-lg);
  }

  .queue-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: 0.875rem 0.25rem;
    text-align: center;
    background: var(--surface-1);
    border-radius: var(--card-radius);
    border: none;
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

  .queue-count {
    font-size: var(--text-xs);
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
