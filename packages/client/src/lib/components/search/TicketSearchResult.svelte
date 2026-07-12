<script lang="ts">
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import type { TicketSearchData } from "$lib/search/providers/tickets.js";

  let {
    result,
    ontap,
  }: { result: TicketSearchData; ontap: (id: string) => void } = $props();
</script>

<div class="search-card-wrapper">
  <TicketCard
    viewMode="grid"
    ticketId={result.ticketId}
    queueName={result.queueName}
    displayStatus={result.displayStatus}
    priority={result.priority}
    titleResult={result.titleResult}
    encryptedTitle={result.encryptedTitle}
    clientAlias={result.clientAlias}
    assignedName={result.assignedName}
    createdAt={result.createdAt}
    lastActivityAt={result.lastActivityAt}
    followUpCount={result.followUpCount}
    unreadCount={result.unreadCount}
    previewFollowUps={result.previewFollowUps}
    searchTerm={result.searchTerm}
    selected={false}
    multiSelectActive={false}
    {ontap}
  />
</div>

<style>
  .search-card-wrapper {
    width: 170px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }
</style>
