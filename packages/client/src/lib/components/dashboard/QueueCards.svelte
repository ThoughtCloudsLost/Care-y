<script lang="ts">
  import { Layers } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  interface QueueInfo {
    id: string;
    name: string;
    openCount: number;
  }

  interface QueueCardsProps {
    queues: QueueInfo[];
    expanded: boolean;
    ontoggle: () => void;
    ontap: (queueId: string, queueName: string) => void;
  }

  let { queues, expanded, ontoggle, ontap }: QueueCardsProps = $props();
</script>

<CollapsibleSection
  heading={m.dashboard_queues_heading()}
  icon={Layers}
  iconColor="var(--brand-accent)"
  {expanded}
  {ontoggle}
>
  {#if queues.length > 0}
    <div
      class="queue-grid"
      style:grid-template-columns="repeat({Math.min(queues.length, 3)}, 1fr)"
    >
      {#each queues as queue (queue.id)}
        <button
          type="button"
          class="queue-tile"
          aria-label="{queue.name}, {m.dashboard_queues_open_count({
            count: queue.openCount,
          })}"
          onclick={() => ontap(queue.id, queue.name)}
        >
          <span class="queue-name">{queue.name}</span>
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
    gap: 0.5rem;
    padding: 0.25rem 0.75rem 0.5rem;
  }

  .queue-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    padding: 0.875rem 0.25rem;
    text-align: center;
    background: var(--surface-1);
    border-radius: var(--card-radius, 0.75rem);
    border: none;
    cursor: pointer;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .queue-tile:active {
    opacity: 0.7;
  }

  .queue-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .queue-count {
    font-size: 0.6875rem;
    color: var(--muted);
  }

  .no-queues {
    padding: 0 0.75rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>
