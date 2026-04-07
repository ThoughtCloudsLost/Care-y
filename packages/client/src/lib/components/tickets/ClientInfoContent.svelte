<!--
  Content for the client info bottom sheet.

  Displays client alias, communication tier, contact method, and recent
  ticket history. This is a CONTENT component: no Sheet shell imports.
  The route file wraps this in ShellSheet.

  Some fields (tier, contactMethod, recentTickets) depend on data not yet
  available in the data model. The component handles missing data gracefully.
-->
<script lang="ts">
  import { List, ListItem, Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface ClientInfoContentProps {
    clientAlias: string;
    clientTier: string | undefined;
    contactMethod: string | undefined;
    recentTickets: {
      id: string;
      title: string | undefined;
      status: string;
    }[];
  }

  let {
    clientAlias,
    clientTier,
    contactMethod,
    recentTickets,
  }: ClientInfoContentProps = $props();
</script>

<Block>
  <h3 class="client-alias-heading">{clientAlias}</h3>
  {#if clientTier}
    <p class="client-tier">{clientTier}</p>
  {/if}
</Block>
<List>
  {#if contactMethod}
    <ListItem title={m.ticket_contact_method()} after={contactMethod} />
  {/if}
  {#if recentTickets.length > 0}
    <ListItem title={m.ticket_recent_history()} groupTitle />
    {#each recentTickets as ticket (ticket.id)}
      <ListItem title={ticket.title ?? "..."} after={ticket.status} />
    {/each}
  {/if}
</List>

<style>
  .client-alias-heading {
    font-size: var(--text-lg);
    font-weight: 600;
    margin: 0;
  }

  .client-tier {
    color: var(--muted);
    font-size: var(--text-sm);
    margin: 0.25rem 0 0;
  }
</style>
