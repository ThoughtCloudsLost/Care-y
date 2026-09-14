<!--
  Queue picker sheet, used from both the ticket detail panel and the
  bulk action bar. Fetches the org's queue list, decrypts names and
  appearance through the shared OrgDecryptCache, and fires a callback
  with the chosen queue id.
-->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { List, ListItem } from "konsta/svelte";
  import { Check } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { queueKeys } from "$lib/query/keys.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    decryptQueueAppearance,
    type QueueAppearance,
  } from "$lib/utils/queue-appearance.js";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface QueueSelectSheetProps {
    opened: boolean;
    currentQueueId?: string | undefined;
    ondismiss: () => void;
    onselect: (queueId: string) => void;
  }

  let { opened, currentQueueId, ondismiss, onselect }: QueueSelectSheetProps =
    $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const orgCache = getOrgDecryptCache();

  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  interface DecryptedQueue {
    id: string;
    name: string;
    appearance: QueueAppearance;
  }

  const decryptedQueues = $derived.by((): DecryptedQueue[] => {
    const data = queuesQuery.data;
    if (!data) return [];

    const results: DecryptedQueue[] = [];
    for (const q of data) {
      const name = orgCache.decrypt(`queue:${q.id}`, q.encryptedName);
      if (name === null) continue;
      const appearance = decryptQueueAppearance(orgCache, q);
      results.push({ id: q.id, name, appearance });
    }
    return results;
  });

  function handleSelect(queueId: string): void {
    onselect(queueId);
    ondismiss();
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.ticket_queue_sheet_title()}
  title={m.ticket_queue_sheet_title()}
>
  {#if queuesQuery.isLoading}
    <List nested>
      {#each [1, 2, 3] as n (n)}
        <ListItem>
          <InlineSkeleton width="8ch" />
        </ListItem>
      {/each}
    </List>
  {:else if queuesQuery.isError}
    <div class="queue-error" role="alert">
      <p>{m.error_generic()}</p>
      <button class="retry-btn" onclick={() => void queuesQuery.refetch()}>
        {m.app_retry()}
      </button>
    </div>
  {:else}
    <List nested aria-label={m.ticket_queue_sheet_title()}>
      {#each decryptedQueues as queue (queue.id)}
        <ListItem
          title={queue.name}
          aria-current={queue.id === currentQueueId ? "true" : undefined}
          onclick={() => handleSelect(queue.id)}
        >
          {#snippet media()}
            <QueueGlyph appearance={queue.appearance} />
          {/snippet}
          {#snippet after()}
            {#if queue.id === currentQueueId}
              <Check size={16} class="text-primary" aria-hidden="true" />
            {/if}
          {/snippet}
        </ListItem>
      {/each}
      {#if decryptedQueues.length === 0}
        <ListItem title={m.empty_no_results()} />
      {/if}
    </List>
  {/if}
</ShellSheet>

<style>
  .queue-error {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--muted);
  }

  .retry-btn {
    margin-top: 0.5rem;
    color: var(--brand-text);
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-sm);
    text-decoration: underline;
  }
</style>
