<script lang="ts">
  import { List, ListItem, BlockTitle } from "konsta/svelte";
  import TicketPreviewItem from "./TicketPreviewItem.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { TicketPreviewItemProps } from "./types.js";

  interface TicketPreviewListProps {
    /** Section heading (i18n label) */
    heading: string;
    /** Tickets to display (ontap provided separately via ontickettap) */
    tickets: Omit<TicketPreviewItemProps, "ontap">[];
    /** Maximum items to show before "see all" button */
    maxVisible?: number;
    /** Hide the heading (when wrapped in CollapsibleSection which renders its own) */
    hideHeading?: boolean;
    /** Show skeleton placeholder rows instead of real tickets */
    loading?: boolean;
    /** Callback when "see all" is tapped. Route file handles navigation. */
    onseeall?: () => void;
    /** Total count from server (overrides tickets.length in "see all" label). */
    totalCount?: number;
    /** Callback when a ticket item is tapped. Route file handles navigation. */
    ontickettap: (ticketId: string) => void;
    /** Callback when encrypted help icon is tapped. Page owns the toast. */
    onencryptedhelp?: () => void;
  }

  let {
    heading,
    tickets,
    maxVisible = 5,
    hideHeading = false,
    loading = false,
    onseeall,
    totalCount,
    ontickettap,
    onencryptedhelp,
  }: TicketPreviewListProps = $props();

  const displayCount = $derived(totalCount ?? tickets.length);
  const visibleTickets = $derived(tickets.slice(0, maxVisible));
  const hasMore = $derived(displayCount > maxVisible);
</script>

{#if !hideHeading}
  <BlockTitle>{heading}</BlockTitle>
{/if}
{#if loading}
  <List strongIos outlineIos class="skeleton-pulse">
    {#each Array(maxVisible) as _, i (i)}
      <ListItem>
        {#snippet inner()}
          <div class="placeholder-item">
            <div class="placeholder-row-top">
              <InlineSkeleton width="8ch" />
            </div>
            <div class="placeholder-row-title">
              <DecryptPlaceholder length={25} />
            </div>
            <div class="placeholder-row-bottom">
              <DecryptPlaceholder length={8} />
              <InlineSkeleton width="6ch" />
            </div>
          </div>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{:else if tickets.length === 0}
  <EmptyState message={m.dashboard_empty_section()} />
{:else}
  <List strongIos outlineIos>
    {#each visibleTickets as ticket (ticket.ticketId)}
      <TicketPreviewItem
        {...ticket}
        ontap={ontickettap}
        onhelp={onencryptedhelp}
      />
    {/each}
  </List>
  {#if hasMore && onseeall !== undefined}
    <button type="button" class="see-all-link" onclick={onseeall}>
      {m.dashboard_see_all({ count: displayCount })}
    </button>
  {/if}
{/if}

<style>
  .placeholder-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    width: 100%;
    padding: 0.25rem 0;
  }

  .placeholder-row-top {
    display: flex;
    align-items: center;
  }

  .placeholder-row-title {
    display: flex;
    align-items: center;
  }

  .placeholder-row-bottom {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    font-size: var(--text-sm);
  }

  .see-all-link {
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.8125rem;
    color: var(--brand-text);
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  :global(.skeleton-pulse) {
    animation: skeleton-pulse 2.5s ease-in-out infinite;
  }
  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.65;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.skeleton-pulse) {
      animation: none;
      opacity: 0.7;
    }
  }
</style>
