<script lang="ts">
  import { Card } from "konsta/svelte";
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
  count={queues.length}
  {expanded}
  {ontoggle}
>
  {#if queues.length > 0}
    <div
      class="queue-grid"
      style:grid-template-columns="repeat({Math.min(queues.length, 3)}, 1fr)"
    >
      {#each queues as queue (queue.id)}
        <Card
          raised
          component="button"
          aria-label="{queue.name}, {m.dashboard_queues_open_count({
            count: queue.openCount,
          })}"
          onclick={() => ontap(queue.id, queue.name)}
          class="queue-card card-elevated touch-feedback"
        >
          <div class="queue-inner">
            <span class="queue-name">{queue.name}</span>
            <span class="queue-count"
              >{m.dashboard_queues_open_count({ count: queue.openCount })}</span
            >
          </div>
        </Card>
      {/each}
    </div>
  {:else}
    <p class="no-queues">{m.dashboard_queues_no_queues()}</p>
  {/if}
</CollapsibleSection>

<style>
  .queue-grid {
    display: grid;
    gap: 0;
    padding: 0;
  }

  .queue-grid :global(.k-card) {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .queue-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    padding: 0.625rem 0.25rem;
    text-align: center;
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
    padding: 0 1rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>
