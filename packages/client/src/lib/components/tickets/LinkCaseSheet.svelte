<!--
  Sheet for searching and linking a case to the current ticket.
  Uses tickets.list to search by metadata (title hash is not available
  cross-ticket, so this lists all accessible tickets and lets the user
  scroll/search by status mark and date). Follows the AssignSheet pattern:
  ShellSheet with a search input and a selectable list.
-->
<script lang="ts">
  import { List, ListItem, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { ticketsKeys, ticketKeys } from "$lib/query/keys";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";

  interface LinkCaseSheetProps {
    opened: boolean;
    ticketId: string;
    /** IDs of tickets already linked (excluded from the list). */
    excludeIds?: readonly string[];
    ondismiss: () => void;
  }

  let {
    opened,
    ticketId,
    excludeIds = [],
    ondismiss,
  }: LinkCaseSheetProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  // --- Ticket list query (all accessible tickets) ---

  const listQuery = createQuery(() => ({
    queryKey: [...ticketsKeys.lists(), "link-picker"],
    queryFn: async () => ticketRouter.list.query({ limit: 100 }),
    enabled: opened,
  }));

  type TicketListItem = NonNullable<typeof listQuery.data>[number];

  // Filter out the current ticket and already-linked tickets.
  const excludeSet = $derived(new Set([ticketId, ...excludeIds]));
  const candidates = $derived(
    (listQuery.data ?? []).filter((t: TicketListItem) => !excludeSet.has(t.id)),
  );

  // Decrypt alias for display.
  function decryptAlias(t: TicketListItem): string {
    return (
      orgCache.decrypt(`client-alias:${t.clientId}`, t.encryptedClientAlias, {
        table: "clients",
        id: t.clientId,
      }) ?? "..."
    );
  }

  // --- Add dependency mutation ---

  const addMutation = createMutation(() => ({
    mutationFn: async (dependsOnTicketId: string) =>
      ticketRouter.addDependency.mutate({ ticketId, dependsOnTicketId }),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.dependencies(ticketId),
      });
      const msg = m.ticket_link_case_added(withTerms());
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      ondismiss();
    },
    onError: () => {
      toastStore.show(m.ticket_link_case_add_error(withTerms()));
    },
  }));
</script>

<ShellSheet
  {opened}
  {ondismiss}
  title={m.ticket_link_case_sheet_title(withTerms())}
  ariaLabel={m.ticket_link_case_sheet_title(withTerms())}
>
  {#if listQuery.isLoading}
    <List>
      {#each { length: 3 } as _, i (i)}
        <ListItem>
          {#snippet title()}
            <InlineSkeleton width="14ch" />
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {:else if candidates.length === 0}
    <div class="empty-state">
      <p>{m.ticket_linked_cases_empty(withTerms())}</p>
    </div>
  {:else}
    <List>
      {#each candidates as t (t.id)}
        <ListItem
          link
          linkComponent="button"
          onclick={() => {
            if (!addMutation.isPending) addMutation.mutate(t.id);
          }}
          class="touch-feedback"
        >
          {#snippet media()}
            <StatusMark
              status={deriveDisplayStatus(t.status, t.onHold, t.followUpCount)}
            />
          {/snippet}
          {#snippet title()}
            <span class="candidate-alias">{decryptAlias(t)}</span>
          {/snippet}
          {#snippet after()}
            <span class="candidate-meta">
              {#if addMutation.isPending}
                <Preloader class="w-4 h-4" />
              {:else}
                {formatRelativeTime(new Date(t.createdAt))}
              {/if}
            </span>
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {/if}
</ShellSheet>

<style>
  .empty-state {
    padding: var(--space-lg);
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
  }

  .empty-state p {
    margin: 0;
  }

  .candidate-alias {
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .candidate-meta {
    color: var(--muted);
    font-size: var(--text-xs);
    white-space: nowrap;
  }
</style>
