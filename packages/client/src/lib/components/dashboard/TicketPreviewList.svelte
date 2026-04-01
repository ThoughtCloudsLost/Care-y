<script lang="ts">
  import { List, BlockTitle } from "konsta/svelte";
  import TicketPreviewItem from "./TicketPreviewItem.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface TicketPreviewItemProps {
    ticketId: string;
    title?: string;
    status: string;
    priority: string;
    onHold: boolean;
    assignedTo: string | null;
    createdAt: Date;
  }

  interface TicketPreviewListProps {
    /** Section heading (i18n label) */
    heading: string;
    /** Tickets to display */
    tickets: TicketPreviewItemProps[];
    /** Maximum items to show before "see all" link */
    maxVisible?: number;
    /** Filter param for "see all" navigation */
    filterParam?: string;
  }

  let {
    heading,
    tickets,
    maxVisible = 5,
    filterParam,
  }: TicketPreviewListProps = $props();

  const visibleTickets = $derived(tickets.slice(0, maxVisible));
  const hasMore = $derived(tickets.length > maxVisible);
  const seeAllHref = $derived(
    filterParam !== undefined
      ? `/tickets?filter=${encodeURIComponent(filterParam)}`
      : undefined,
  );
</script>

<BlockTitle>{heading}</BlockTitle>
{#if tickets.length === 0}
  <EmptyState message={m.dashboard_empty_section()} />
{:else}
  <List strongIos outlineIos>
    {#each visibleTickets as ticket (ticket.ticketId)}
      <TicketPreviewItem {...ticket} />
    {/each}
  </List>
  {#if hasMore && seeAllHref}
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Static route with query param, not a dynamic SvelteKit route -->
    <a href={seeAllHref} class="see-all-link">
      {m.dashboard_see_all({ count: tickets.length })}
    </a>
  {/if}
{/if}

<style>
  .see-all-link {
    display: block;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.8125rem;
    color: var(--brand-text);
    text-decoration: none;
  }

  .see-all-link:hover {
    text-decoration: underline;
  }
</style>
