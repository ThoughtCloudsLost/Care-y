<!--
  Linked cases section for the ticket panel. Queries listDependencies,
  shows linked ticket short IDs and creation dates, and offers remove
  actions gated on LINK_CASES. Follows the PanelNotesSection pattern:
  self-contained query, context caches, BlockTitle + List.
-->
<script lang="ts">
  import { BlockTitle, List, ListItem } from "konsta/svelte";
  import { Link2, X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import { Permission } from "@care-y/shared";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";

  interface LinkedCasesSectionProps {
    ticketId: string;
    /** Called when the user taps "Link a case" to open the link sheet. */
    onlink?: () => void;
  }

  let { ticketId, onlink }: LinkedCasesSectionProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const permissionsGetter = getCurrentPermissions();
  const canLink = $derived(permissionsGetter().has(Permission.LINK_CASES));

  // --- Dependencies query ---

  const depsQuery = createQuery(() => ({
    queryKey: ticketKeys.dependencies(ticketId),
    queryFn: async () => ticketRouter.listDependencies.query({ ticketId }),
  }));

  interface DepRecord {
    readonly ticketId: string;
    readonly dependsOnTicketId: string;
    readonly createdAt: string;
  }

  const deps = $derived((depsQuery.data ?? []) as readonly DepRecord[]);

  // --- Remove mutation ---

  const removeMutation = createMutation(() => ({
    mutationFn: async (input: { dependsOnTicketId: string }) =>
      ticketRouter.removeDependency.mutate({
        ticketId,
        dependsOnTicketId: input.dependsOnTicketId,
      }),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.dependencies(ticketId),
      });
      const msg = m.ticket_link_case_removed(withTerms());
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
    },
    onError: () => {
      toastStore.show(m.ticket_link_case_remove_error(withTerms()));
    },
  }));
</script>

<BlockTitle class="!mt-6 !-mb-2">
  <span class="linked-header">
    <Link2 class="w-4 h-4" aria-hidden="true" />
    {m.ticket_linked_cases_title(withTerms())}
  </span>
</BlockTitle>

{#if depsQuery.isLoading}
  <List nested>
    <ListItem>
      {#snippet title()}
        <InlineSkeleton width="14ch" />
      {/snippet}
    </ListItem>
  </List>
{:else if deps.length === 0}
  <div class="linked-empty">
    <p>{m.ticket_linked_cases_empty(withTerms())}</p>
  </div>
{:else}
  <List nested>
    {#each deps as dep (dep.dependsOnTicketId)}
      <ListItem>
        {#snippet media()}
          <StatusMark status="active" />
        {/snippet}
        {#snippet title()}
          <span class="linked-title">
            {dep.dependsOnTicketId.slice(0, 8)}
          </span>
        {/snippet}
        {#snippet after()}
          <span class="linked-after">
            <span class="linked-date">
              {formatRelativeTime(new Date(dep.createdAt))}
            </span>
            {#if canLink}
              <button
                type="button"
                class="linked-remove touch-feedback"
                aria-label={m.common_remove()}
                onclick={() =>
                  removeMutation.mutate({
                    dependsOnTicketId: dep.dependsOnTicketId,
                  })}
                disabled={removeMutation.isPending}
              >
                <X size={16} aria-hidden="true" />
              </button>
            {/if}
          </span>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

{#if canLink}
  <div class="linked-add-row">
    <button
      type="button"
      class="linked-add-btn touch-feedback"
      onclick={() => onlink?.()}
    >
      <Link2 size={14} aria-hidden="true" />
      {m.ticket_link_case_sheet_title(withTerms())}
    </button>
  </div>
{/if}

<style>
  .linked-header {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .linked-empty {
    padding: 0.5rem var(--space-md);
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
  }

  .linked-empty p {
    margin: 0;
  }

  .linked-title {
    font-size: var(--text-sm);
    color: var(--ink);
    font-family: var(--font-mono, monospace);
  }

  .linked-after {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .linked-date {
    color: var(--muted);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .linked-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 44px;
    padding: 0;
    background: none;
    border: none;
    color: var(--danger);
    cursor: pointer;
    border-radius: 0.25rem;
  }

  .linked-remove:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .linked-add-row {
    padding: 0 var(--space-md) var(--space-sm);
  }

  .linked-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--brand-text);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    min-height: 44px;
    border-radius: 0.25rem;
  }
</style>
