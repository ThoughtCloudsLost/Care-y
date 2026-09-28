<script lang="ts">
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import TicketCardBoundary from "$lib/components/tickets/TicketCardBoundary.svelte";
  import TicketTable from "$lib/components/tickets/TicketTable.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import {
    estimateTicketCardHeight,
    LANE_GRID_CARD_MAX_WIDTH,
    resolveLaneGridColumns,
    TICKET_CARD_VIRTUALIZE_THRESHOLD,
  } from "$lib/tickets/ticket-list-utils.js";
  import { sortTickets } from "$lib/tickets/sort-tickets.js";
  import { makeSkeletonCardProps } from "$lib/tickets/skeleton-card-props.js";
  import { formatCount } from "$lib/tickets/format-count.js";
  import { DASHBOARD_LANE_CAP } from "$lib/tickets/dashboard-lanes.js";
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
    /**
     * Rows shown before "See all", in every view mode; a dashboard
     * lane's cap by default. Null shows every row and pages through
     * `onloadmore` as the end nears.
     */
    maxVisible?: number | null;
    /** Show skeleton cards instead of real ones. */
    loading?: boolean;
    /** Callback when "see all" is tapped. Route file handles navigation. */
    onseeall?: () => void;
    /** Total count from server (overrides tickets.length in the "see all" label). */
    totalCount?: number;
    /** True when totalCount is a floor ("N+"): its source stopped short. */
    countIsFloor?: boolean;
    /**
     * Element id prefix for table rows. Dashboard sections pass their own
     * so a ticket listed in two sections does not repeat an id.
     */
    idPrefix?: string;
    /**
     * The scroller the list sits in (the page). Long lists window against
     * it. Ignored while the list scrolls in its own body.
     */
    scrollContainer?: HTMLElement;
    /**
     * Set when the list scrolls in its own body: the id of the element
     * naming it. The body becomes a focusable, labelled scroll region,
     * and long lists window and page against it.
     */
    scrollRegionLabelledBy?: string;
    /**
     * Cards across in the grid view, 1 in the other views. Bind it to
     * round a cap to whole rows.
     */
    gridColumns?: number;
    /** The list's body: the element that scrolls when it scrolls itself. */
    bodyElement?: HTMLElement;
    /** Fetch the next page as the end nears. Used only with no cap. */
    onloadmore?: () => void;
    /** The last fetch's error, or null. Renders below the loaded rows. */
    error?: unknown;
    /** Retry the failed fetch. */
    onretry?: () => void;
  }

  let {
    tickets,
    mapper,
    ontap,
    viewMode,
    maxVisible = DASHBOARD_LANE_CAP,
    loading = false,
    onseeall,
    totalCount,
    countIsFloor = false,
    idPrefix,
    scrollContainer,
    scrollRegionLabelledBy,
    gridColumns = $bindable(1),
    bodyElement = $bindable(),
    onloadmore,
    error = null,
    onretry,
  }: TicketPreviewListProps = $props();

  const displayCount = $derived(totalCount ?? tickets.length);
  const visibleTickets = $derived(
    maxVisible === null ? [...tickets] : tickets.slice(0, maxVisible),
  );
  const hasMore = $derived(
    displayCount > visibleTickets.length ||
      (countIsFloor && totalCount !== undefined),
  );
  const hasError = $derived(error !== null && error !== undefined);
  // Paging belongs to an uncapped list; a capped one ends at "See all",
  // which an uncapped list never shows (it reaches every row itself).
  const pageOnScroll = $derived(maxVisible === null ? onloadmore : undefined);

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

  // Grid cards keep their own size: a widening lane gains columns, the
  // rest of the row stays empty. GRID_GAP_PX is --space-md, the gap the
  // grid rows use; container math cannot read the token.
  const GRID_GAP_PX = 6;
  const GRID_TRACK = `minmax(0, ${String(LANE_GRID_CARD_MAX_WIDTH)}px)`;

  const resolvedColumns = $derived(
    viewMode === "grid"
      ? resolveLaneGridColumns(containerWidth, GRID_GAP_PX)
      : 1,
  );

  // Reported out for a caller that rounds its cap to whole rows.
  $effect(() => {
    gridColumns = resolvedColumns;
  });

  const ownScroll = $derived(scrollRegionLabelledBy !== undefined);
  const scroller = $derived(ownScroll ? bodyElement : scrollContainer);

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
        unreadCountIsFloor: c.unreadCountIsFloor,
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
  // An uncapped list has no row count to mirror while loading.
  const SKELETON_COUNT = 5;
  const skeletonCount = $derived(maxVisible ?? SKELETON_COUNT);
</script>

<!-- The body holds every state of the list; "See all" sits after it, so
     a list that scrolls in its body keeps the link in view, and a lane
     can line the links up across a row.
     A body that scrolls on its own takes tabindex 0 as a named region: a
     keyboard user must be able to focus it to scroll it (WCAG 2.1.1; axe
     rule scrollable-region-focusable, Deque University). The compiler's
     check reads the region role as static. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  bind:this={bodyElement}
  class="preview-body"
  class:own-scroll={ownScroll}
  role={ownScroll ? "region" : undefined}
  tabindex={ownScroll ? 0 : undefined}
  aria-labelledby={scrollRegionLabelledBy}
>
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
        style:--grid-cols={resolvedColumns}
        style:--lane-grid-card-max="{LANE_GRID_CARD_MAX_WIDTH}px"
      >
        {#each Array(skeletonCount) as _, i (i)}
          <TicketCard loading={true} {viewMode} {...SKELETON_CARD_PROPS} />
        {/each}
      </div>
    {/if}
  {:else}
    {#if tickets.length === 0}
      {#if !hasError}
        <EmptyState message={m.dashboard_empty_section()} />
      {/if}
    {:else if viewMode === "table"}
      <div class="preview-list">
        <TicketTable
          rows={tableRows}
          {idPrefix}
          scrollContainer={scroller}
          sortField={tableSortField}
          sortDirection={tableSortDirection}
          onsortchange={handleTableSort}
          ontap={ontap ?? noop}
          onloadmore={pageOnScroll}
        />
      </div>
    {:else}
      <!-- Grid columns come from VirtualList rows, as on the tickets page;
           the container itself stays a column of rows. -->
      <div
        bind:this={containerEl}
        class="preview-list"
        class:mode-rows={viewMode === "list"}
        class:mode-cards={viewMode === "cards"}
      >
        {#key viewMode}
          <VirtualList
            items={visibleTickets}
            scrollContainer={scroller}
            estimateHeight={estimateTicketCardHeight(viewMode)}
            virtualizeThreshold={TICKET_CARD_VIRTUALIZE_THRESHOLD}
            columns={resolvedColumns}
            columnTrack={viewMode === "grid" ? GRID_TRACK : undefined}
            getKey={(t: TicketLikeRecord) => t.id}
            onloadmore={pageOnScroll}
          >
            {#snippet children({
              item,
            }: {
              item: TicketLikeRecord;
              index: number;
            })}
              <TicketCardBoundary ticket={item} {mapper} {viewMode} />
            {/snippet}
          </VirtualList>
        {/key}
      </div>
    {/if}
    {#if hasError}
      <QueryError {error} {onretry} />
    {/if}
  {/if}
</div>
{#if !loading && maxVisible !== null && hasMore && onseeall !== undefined}
  <button type="button" class="see-all-link" onclick={onseeall}>
    {m.dashboard_see_all({ count: formatCount(displayCount, countIsFloor) })}
  </button>
{/if}

<style>
  .preview-body {
    min-width: 0;
  }

  /* The body scrolls on its own: the page around it does not. */
  .preview-body.own-scroll {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .preview-body.own-scroll:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  /* Matches the tickets page's .ticket-page horizontal inset so the same
     TicketCard renders at identical padding on both surfaces, unless the
     container owns the inset (--section-inset). The gap between rows
     matches the tickets page's list too. */
  .preview-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
    padding: 0 var(--section-inset, var(--page-pad-x));
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

  /* Skeleton-only; the live grid is VirtualList-column-driven. */
  .preview-list.mode-grid {
    display: grid;
    grid-template-columns: repeat(
      var(--grid-cols, 2),
      minmax(0, var(--lane-grid-card-max))
    );
    gap: var(--space-md);
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
