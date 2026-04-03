<script lang="ts">
  import { List, BlockTitle } from "konsta/svelte";
  import TicketPreviewItem from "./TicketPreviewItem.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
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
    /** Callback when "see all" is tapped. Route file handles navigation. */
    onseeall?: () => void;
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
    onseeall,
    ontickettap,
    onencryptedhelp,
  }: TicketPreviewListProps = $props();

  const visibleTickets = $derived(tickets.slice(0, maxVisible));
  const hasMore = $derived(tickets.length > maxVisible);
</script>

{#if !hideHeading}
  <BlockTitle>{heading}</BlockTitle>
{/if}
{#if tickets.length === 0}
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
      {m.dashboard_see_all({ count: tickets.length })}
    </button>
  {/if}
{/if}

<style>
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
</style>
