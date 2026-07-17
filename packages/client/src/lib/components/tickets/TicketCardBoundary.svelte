<script lang="ts">
  import TicketCard from "./TicketCard.svelte";
  import type {
    DataCardProps,
    TicketLikeRecord,
  } from "$lib/tickets/ticket-card-props.js";
  import type { ViewMode } from "./ticket-types.js";

  interface Props {
    /** Raw ticket record; card props derive inside this boundary. */
    ticket: TicketLikeRecord;
    /** Page-built props mapper (stable identity across rows). */
    mapper: (ticket: TicketLikeRecord) => DataCardProps;
    viewMode: ViewMode;
    selected?: boolean;
    multiSelectActive?: boolean;
    searchTerm?: string | null;
    newRepliesFirst?: boolean;
  }

  let {
    ticket,
    mapper,
    viewMode,
    selected = false,
    multiSelectActive = false,
    searchTerm = null,
    newRepliesFirst = false,
  }: Props = $props();

  // The mapper's decrypt cache reads happen inside this row's own derived,
  // so a landed decrypt re-renders exactly this row, never the whole list.
  const cardProps = $derived(mapper(ticket));
</script>

<TicketCard
  {...cardProps}
  {viewMode}
  {selected}
  {multiSelectActive}
  {searchTerm}
  {newRepliesFirst}
/>
