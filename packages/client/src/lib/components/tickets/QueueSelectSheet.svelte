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
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import { withTerms } from "$lib/terminology/with-terms.js";

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
      // A queue whose name will not decrypt still has to be selectable,
      // otherwise a case cannot be moved somewhere that plainly exists.
      const name =
        orgCache.decrypt(`queue:${q.id}`, q.encryptedName, {
          table: "queues",
          id: q.id,
        }) ?? m.ticket_system_queue_fallback(withTerms());
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
  ariaLabel={m.ticket_queue_sheet_title(withTerms())}
  title={m.ticket_queue_sheet_title(withTerms())}
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
    <QueryError
      error={queuesQuery.error}
      onretry={() => void queuesQuery.refetch()}
    />
  {:else}
    <List nested aria-label={m.ticket_queue_sheet_title(withTerms())}>
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
    </List>
    {#if decryptedQueues.length === 0}
      <EmptyState message={m.empty_no_results()} />
    {/if}
  {/if}
</ShellSheet>
