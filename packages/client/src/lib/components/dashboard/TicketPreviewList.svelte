<script lang="ts">
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import TicketCardBoundary from "$lib/components/tickets/TicketCardBoundary.svelte";
  import TicketTable from "$lib/components/tickets/TicketTable.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import { resolveGridColumns } from "$lib/tickets/ticket-list-utils.js";
  import { sortTickets } from "$lib/tickets/sort-tickets.js";
  import { makeSkeletonCardProps } from "$lib/tickets/skeleton-card-props.js";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
  import type {
    DataCardProps,
    TicketLikeRecord,
  } from "$lib/tickets/ticket-card-props.js";
  import * as m from "$lib/paraglide/messages.js";

  interface TicketPreviewListProps {
    /** Raw ticket records; each row maps its own props via `mapper`. */
    tickets: readonly TicketLikeRecord[];
    /** Page-built card props mapper (stable identity across rows). */
    mapper: (ticket: TicketLikeRecord) => DataCardProps;
    /** Row tap handler for the table presentation. */
    ontap?: (ticketId: string) => void;
    /** Which of the three Inkwell presentations to render. */
    viewMode: ViewMode;
    /** Cap for list/cards; grid packs one extra row (see `cap`). */
    maxVisible?: number;
    /** Show skeleton cards instead of real ones. */
    loading?: boolean;
    /** Callback when "see all" is tapped. Route file handles navigation. */
    onseeall?: () => void;
    /** Total count from server (overrides tickets.length in the "see all" label). */
    totalCount?: number;
  }

  let {
    tickets,
    mapper,
    ontap,
    viewMode,
    maxVisible = 5,
    loading = false,
    onseeall,
    totalCount,
  }: TicketPreviewListProps = $props();

  // Grid packs an even two rows; list and cards keep the five-item preview.
  const cap = $derived(viewMode === "grid" ? 6 : maxVisible);
  const displayCount = $derived(totalCount ?? tickets.length);
  const visibleTickets = $derived(tickets.slice(0, cap));
  const hasMore = $derived(displayCount > cap);

  // Grid columns track the section container width, floored at two so a
  // narrow desktop column still reads as a grid (matches the tickets list).
  let containerEl = $state<HTMLElement | undefined>(undefined);
  let containerWidth = $state(0);

  $effect(() => {
    const el = containerEl;
    if (!el) return;
    containerWidth = el.clientWidth;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) containerWidth = entry.contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  const gridColumns = $derived(
    viewMode === "grid" ? resolveGridColumns(containerWidth) : 1,
  );

  let tableSortField = $state<string | null>(null);
  let tableSortDirection = $state<"asc" | "desc">("desc");

  function handleTableSort(field: string, direction: "asc" | "desc"): void {
    tableSortField = field;
    tableSortDirection = direction;
  }

  const tableRows = $derived.by(() => {
    const mapped = visibleTickets.map((t) => {
      const c = mapper(t);
      return {
        ticketId: c.ticketId,
        id: t.id,
        displayStatus: c.displayStatus,
        priority: c.priority,
        clientAlias: c.clientAlias,
        title: c.titleResult.status === "ready" ? c.titleResult.value : null,
        titleResult: c.titleResult,
        encryptedTitle: t.encryptedTitle,
        queueName: c.queueName,
        assignedName: c.assignedName,
        assigneeName: c.assignedName,
        assignedIsSelf: c.assignedIsSelf,
        lastActivityAt: c.lastActivityAt,
        createdAt: c.createdAt,
        followUpCount: c.followUpCount,
        unreadCount: c.unreadCount,
        queueSortOrder: t.queueSortOrder,
      };
    });

    if (tableSortField === null) return mapped;

    return sortTickets(mapped, {
      field: tableSortField,
      direction: tableSortDirection,
    });
  });

  function noop(): void {
    /* skeleton cards never navigate */
  }

  // Same skeleton prop blob the tickets page uses for its loading blocks.
  const SKELETON_CARD_PROPS = makeSkeletonCardProps();
</script>

{#if loading}
  {#if viewMode === "table"}
    <TicketTable
      rows={[]}
      loading={true}
      sortField={tableSortField}
      sortDirection={tableSortDirection}
      onsortchange={handleTableSort}
      ontap={noop}
    />
  {:else}
    <div
      class="preview-list"
      class:mode-rows={viewMode === "list"}
      class:mode-cards={viewMode === "cards"}
      class:mode-grid={viewMode === "grid"}
      style:--grid-cols={gridColumns}
    >
      {#each Array(cap) as _, i (i)}
        <TicketCard loading={true} {viewMode} {...SKELETON_CARD_PROPS} />
      {/each}
    </div>
  {/if}
{:else if tickets.length === 0}
  <EmptyState message={m.dashboard_empty_section()} />
{:else if viewMode === "table"}
  <div class="preview-list" style="padding: 0 var(--page-pad-x);">
    <TicketTable
      rows={tableRows}
      sortField={tableSortField}
      sortDirection={tableSortDirection}
      onsortchange={handleTableSort}
      ontap={ontap ?? noop}
    />
  </div>
  {#if hasMore && onseeall !== undefined}
    <button type="button" class="see-all-link" onclick={onseeall}>
      {m.dashboard_see_all({ count: displayCount })}
    </button>
  {/if}
{:else}
  <div
    bind:this={containerEl}
    class="preview-list"
    class:mode-rows={viewMode === "list"}
    class:mode-cards={viewMode === "cards"}
    class:mode-grid={viewMode === "grid"}
    style:--grid-cols={gridColumns}
  >
    {#each visibleTickets as ticket (ticket.id)}
      <TicketCardBoundary {ticket} {mapper} {viewMode} />
    {/each}
  </div>
  {#if hasMore && onseeall !== undefined}
    <button type="button" class="see-all-link" onclick={onseeall}>
      {m.dashboard_see_all({ count: displayCount })}
    </button>
  {/if}
{/if}

<style>
  /* Matches the tickets page's .ticket-page horizontal inset so the same
     TicketCard renders at identical padding on both surfaces. */
  .preview-list {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 0 var(--page-pad-x);
  }

  /* Ruled rows: a top hairline opens the list; each row carries its own
     bottom hairline (TicketCard's list mode), so the gap collapses. */
  .preview-list.mode-rows {
    gap: 0;
    border-top: 1px solid var(--hair);
  }

  .preview-list.mode-cards {
    gap: 12px;
  }

  .preview-list.mode-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 2), minmax(0, 1fr));
    gap: 12px;
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
    font-weight: 700;
    color: var(--brand-text);
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }
</style>
