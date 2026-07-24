<script lang="ts">
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import TicketCardBoundary from "$lib/components/tickets/TicketCardBoundary.svelte";
  import TicketTable from "$lib/components/tickets/TicketTable.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import { resolveGridColumns } from "$lib/tickets/ticket-list-utils.js";
  import { getCollator } from "$lib/utils/collator.js";
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
        displayStatus: c.displayStatus,
        priority: c.priority,
        clientAlias: c.clientAlias,
        titleResult: c.titleResult,
        encryptedTitle: t.encryptedTitle,
        queueName: c.queueName,
        assignedName: c.assignedName,
        assignedIsSelf: c.assignedIsSelf,
        lastActivityAt: c.lastActivityAt,
        createdAt: c.createdAt,
        followUpCount: c.followUpCount,
        unreadCount: c.unreadCount,
      };
    });

    const dir = tableSortDirection === "asc" ? 1 : -1;

    if (tableSortField === "status") {
      const statusRank = { new: 0, active: 1, hold: 2, closed: 3 } as const;
      mapped.sort(
        (a, b) =>
          (statusRank[a.displayStatus] - statusRank[b.displayStatus]) * dir,
      );
    } else if (tableSortField === "last_activity") {
      mapped.sort((a, b) => {
        const aTime = (a.lastActivityAt ?? a.createdAt).getTime();
        const bTime = (b.lastActivityAt ?? b.createdAt).getTime();
        return (aTime - bTime) * dir;
      });
    } else if (tableSortField === "priority") {
      const rank = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
      mapped.sort((a, b) => (rank[a.priority] - rank[b.priority]) * dir);
    } else if (tableSortField === "client") {
      mapped.sort(
        (a, b) => getCollator().compare(a.clientAlias, b.clientAlias) * dir,
      );
    } else if (tableSortField === "queue") {
      mapped.sort(
        (a, b) =>
          getCollator().compare(a.queueName ?? "", b.queueName ?? "") * dir,
      );
    } else if (tableSortField === "msgs") {
      mapped.sort((a, b) => (a.followUpCount - b.followUpCount) * dir);
    } else if (tableSortField === "title") {
      mapped.sort((a, b) => {
        const aVal =
          a.titleResult.status === "ready" ? a.titleResult.value : "";
        const bVal =
          b.titleResult.status === "ready" ? b.titleResult.value : "";
        return getCollator().compare(aVal, bVal) * dir;
      });
    } else if (tableSortField === "assignee") {
      mapped.sort((a, b) => {
        // Unassigned rows sort last in both directions: the direct
        // returns are deliberately not multiplied by dir.
        if (a.assignedName == null && b.assignedName == null) return 0;
        if (a.assignedName == null) return 1;
        if (b.assignedName == null) return -1;
        return getCollator().compare(a.assignedName, b.assignedName) * dir;
      });
    }

    return mapped;
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
