<script lang="ts">
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { createCountsQuery } from "$lib/tickets/queries.js";
  import { untrack } from "svelte";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    BlockTitle,
    Button,
    Segmented,
    SegmentedButton,
    List as KList,
    ListItem,
  } from "konsta/svelte";
  import {
    List,
    LayoutGrid,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    SquareCheckBig,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getTicketDecryptCache,
    getOrgDecryptCache,
    getCurrentUserId,
    getPreviewLoader,
  } from "$lib/crypto/context.js";
  import {
    getScrollContainer,
    getTabbarOverrideCtx,
    getNavbarOverrideCtx,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { UserPlus, Pause, X } from "@lucide/svelte";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";
  import { filterStore } from "$lib/stores/filters.svelte.js";
  import { viewModeStore } from "$lib/stores/view-mode.svelte.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import type {
    TicketCardProps,
    TicketQuickAction,
  } from "$lib/components/tickets/ticket-types.js";

  import { RouterNotAvailableError } from "$lib/errors.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import type { SortField } from "$lib/stores/filters.svelte.js";
  import StatusDot from "$lib/components/StatusDot.svelte";
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import SwipeableCard from "$lib/components/tickets/SwipeableCard.svelte";
  import FilterPillBar from "$lib/components/tickets/FilterPillBar.svelte";
  import SavedFilterList from "$lib/components/tickets/SavedFilterList.svelte";
  import CreateSavedFilter from "$lib/components/tickets/CreateSavedFilter.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import QueryError from "$lib/components/QueryError.svelte";

  const ticketCache = getTicketDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  // --- URL filter application (dashboard → tickets navigation) ---
  // When arriving with ?queue=X or ?filter=my-open|unassigned, apply
  // to filterStore once, then strip the params so manual filter
  // changes aren't clobbered if the effect re-runs.
  let lastAppliedSearch = "";

  $effect(() => {
    const searchStr = page.url.search;

    if (searchStr === "" || searchStr === lastAppliedSearch) return;

    const params = page.url.searchParams;
    const queueId = params.get("queue");
    const filter = params.get("filter");

    if (queueId === null && filter === null) return;

    lastAppliedSearch = searchStr;

    untrack(() => {
      filterStore.clearAll();

      if (queueId !== null) {
        filterStore.toggleQueue(queueId);
      } else if (filter === "my-open") {
        filterStore.toggleStatus("new");
        filterStore.toggleStatus("active");
        if (currentUserId !== undefined) {
          filterStore.setAssignee(currentUserId);
        }
      } else if (filter === "unassigned") {
        filterStore.toggleStatus("new");
        filterStore.toggleStatus("active");
        filterStore.setAssignee(null);
      }
    });

    void goto(resolve("/tickets"), { replaceState: true });
  });

  // Scroll container from AppShell context.
  // Returns undefined until mount, then the resolved element.
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());

  // Scroll-direction tracker: hides header on scroll-down, reveals on scroll-up.
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });

  // Tabbar override container: set actions to replace the tab bar
  // with multi-select controls, clear to restore normal tabs.
  const tabbarOverride = getTabbarOverrideCtx();

  // Navbar override container: renders the ticket header as a
  // subnavbar region in AppShell (outside the scroll container).
  const navbarCtx = getNavbarOverrideCtx();

  // Preview loader: session-level cache created in CryptoProvider.
  const previewLoader = getPreviewLoader();

  // Main ticket list with infinite scroll (keyset pagination).
  const ticketsQuery = createInfiniteQuery(() => ({
    queryKey: ["tickets", "list", filterStore.serverParams],
    queryFn: async ({ pageParam }) =>
      ticketRouter.list.query({
        ...filterStore.serverParams,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length >= filterStore.serverParams.limit
        ? lastPage[lastPage.length - 1]?.id
        : undefined,
  }));

  // Flatten all pages into a single array.
  const allTickets = $derived(ticketsQuery.data?.pages.flat() ?? []);

  // Infer the ticket record type from the query return.
  type TicketRecord = (typeof allTickets)[number];

  // Client-side display-status post-filter. When the user selects only
  // "New" or only "Active" (not both), the server can't distinguish them
  // (both are status "open"). We post-filter by followUpCount.
  const displayFiltered = $derived.by(() => {
    if (!filterStore.needsDisplayStatusPostFilter) return allTickets;

    const wantNew = filterStore.statuses.has("new");
    // wantNew xor wantActive is guaranteed when needsDisplayStatusPostFilter is true

    return allTickets.filter((t) => {
      if (t.status !== "open") return true; // closed/other pass through
      if (t.onHold) return true; // on-hold tickets pass through
      // New = 0 follow-ups, Active = 1+ follow-ups
      return wantNew ? t.followUpCount === 0 : t.followUpCount > 0;
    });
  });

  // Server handles sort via ORDER BY. displayFiltered is the final list
  // (post-filter for display status, but sort order preserved from server).

  // Eager-load previews for the first page when tickets arrive.
  // eagerLoad() skips IDs already in the loaded Set, so repeated calls
  // after pagination are cheap (only new IDs trigger fetches).
  $effect(() => {
    const tickets = allTickets;
    if (tickets.length > 0) {
      void previewLoader.eagerLoad(tickets.map((t) => t.id));
    }
  });

  // Map server record to TicketCard props (triggers lazy decryption).
  // Data-derived card props: only recompute when ticket data, decryption
  // caches, or preview content changes. Excludes volatile per-interaction
  // state (selected, multiSelectActive, viewMode) to avoid rebuilding the
  // entire Map on every selection toggle.
  type DataCardProps = Omit<
    TicketCardProps,
    "viewMode" | "selected" | "multiSelectActive"
  >;

  function toDataCardProps(t: TicketRecord): DataCardProps {
    let assignedName: string | null = null;
    if (t.assignedTo === currentUserId) {
      assignedName = m.dashboard_assigned_you();
    } else if (t.assignedTo !== null) {
      assignedName =
        orgCache.decrypt(`assignee:${t.assignedTo}`, t.assignedDisplayName) ??
        null;
    }

    return {
      ticketId: t.id,
      queueName: orgCache.decrypt(`queue:${t.queueId}`, t.encryptedQueueName),
      displayStatus: deriveDisplayStatus(t.status, t.onHold, t.followUpCount),
      priority: t.priority,
      title: ticketCache.decryptTitle(t.id, t.keyWrap, t.encryptedTitle),
      clientAlias: t.clientAlias,
      assignedName,
      createdAt: new Date(t.createdAt),
      lastActivityAt:
        t.lastActivityAt !== null ? new Date(t.lastActivityAt) : null,
      followUpCount: t.followUpCount,
      unreadCount: 0,
      previewFollowUps: previewLoader.get(t.id),
      ontap: handleTicketTap,
      onselect: toggleSelection,
      onaction: handleAction,
      onencryptedhelp: showEncryptedHelp,
    };
  }

  // Pre-compute data-derived card props for the visible ticket list.
  // Volatile props (viewMode, selected, multiSelectActive) are added at
  // render time so selection toggles don't rebuild the entire Map.
  const cardPropsMap = $derived.by(() => {
    const map = new SvelteMap<string, DataCardProps>();
    for (const t of displayFiltered) {
      map.set(t.id, toDataCardProps(t));
    }
    return map;
  });

  function showEncryptedHelp(): void {
    toastStore.show(m.dashboard_encrypted_help(), 5000);
  }

  function handleTicketTap(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}`));
  }

  function handleAction(ticketId: string, action: TicketQuickAction): void {
    // Quick actions call existing tRPC mutations.
    if (import.meta.env.DEV) {
      console.log(`[TicketList] action: ${action} on ${ticketId}`);
    }
  }

  // Multi-select state.
  let multiSelectActive = $state(false);
  let selectedIds = new SvelteSet<string>();

  function toggleMultiSelect(): void {
    if (multiSelectActive) {
      exitMultiSelect();
    } else {
      multiSelectActive = true;
    }
  }

  function toggleSelection(ticketId: string): void {
    if (selectedIds.has(ticketId)) {
      selectedIds.delete(ticketId);
    } else {
      selectedIds.add(ticketId);
    }
  }

  function exitMultiSelect(): void {
    multiSelectActive = false;
    selectedIds.clear();
  }

  // Sync multi-select state to the tabbar override. When active, the
  // tab bar is replaced with Assign/Hold actions + dismiss button.
  // When inactive, the normal tab bar is restored.
  $effect(() => {
    if (multiSelectActive) {
      tabbarOverride.current = {
        label: m.tickets_selected({ count: selectedIds.size }),
        ariaLabel: m.tickets_selected({ count: selectedIds.size }),
        actions: [
          {
            id: "assign",
            label: m.tickets_action_assign(),
            icon: UserPlus,
            onclick: handleBulkAssign,
          },
          {
            id: "hold",
            label: m.tickets_action_hold(),
            icon: Pause,
            onclick: handleBulkHold,
          },
        ],
        dismiss: {
          icon: X,
          ariaLabel: m.tickets_exit_multiselect(),
          onclick: exitMultiSelect,
        },
      };
    } else {
      tabbarOverride.current = undefined;
    }
  });

  // Clean up override on route unmount (navigating away from tickets).
  $effect(() => {
    return () => {
      tabbarOverride.current = undefined;
    };
  });

  // Set the subnavbar override once on mount. The hidden getter is a
  // closure over scrollDir.hidden, so AppShell reads the latest value
  // reactively without the override object needing to change.
  $effect(() => {
    navbarCtx.current = {
      subnavbar: ticketSubnavbar,
      subnavbarHidden: () => scrollDir.hidden,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  function handleBulkAssign(): void {
    const count = selectedIds.size;
    if (count === 0) return;
    if (import.meta.env.DEV) {
      console.log(`[TicketList] bulk assign: ${[...selectedIds].join(", ")}`);
    }
    // Bulk assign will call existing tRPC mutations per selected ticket.
    toastStore.show(m.tickets_action_assign() + ` (${String(count)})`);
    selectedIds.clear();
  }

  function handleBulkHold(): void {
    const count = selectedIds.size;
    if (count === 0) return;
    if (import.meta.env.DEV) {
      console.log(`[TicketList] bulk hold: ${[...selectedIds].join(", ")}`);
    }
    // Bulk hold will call existing tRPC mutations per selected ticket.
    toastStore.show(m.tickets_action_hold() + ` (${String(count)})`);
    selectedIds.clear();
  }

  function handleLongPress(ticketId: string): void {
    if (!multiSelectActive) {
      multiSelectActive = true;
    }
    toggleSelection(ticketId);
  }

  function loadNextPage(): void {
    if (ticketsQuery.hasNextPage && !ticketsQuery.isFetchingNextPage) {
      void ticketsQuery.fetchNextPage();
    }
  }

  const gridColumns = $derived(viewModeStore.mode === "grid" ? 2 : 1);

  // Accurate ticket counts from dedicated server endpoint (not limited by pagination).
  const countsQuery = createCountsQuery(ticketRouter);

  const newCount = $derived(countsQuery.data?.new ?? 0);
  const activeCount = $derived(countsQuery.data?.active ?? 0);
  const holdCount = $derived(countsQuery.data?.onHold ?? 0);

  // Saved filter modal state.
  let savedFilterModalOpen = $state(false);

  // Sort dropdown state.
  let sortOpen = $state(false);
  let sortAnchorEl = $state<HTMLElement | undefined>(undefined);

  interface SortOption {
    readonly field: SortField;
    readonly label: string;
  }

  const sortOptions: SortOption[] = [
    { field: "date", label: m.tickets_sort_newest() },
    { field: "priority", label: m.tickets_sort_priority() },
    { field: "last_activity", label: m.tickets_sort_activity() },
    { field: "queue", label: m.tickets_sort_queue() },
  ];

  function toggleSort(): void {
    sortOpen = !sortOpen;
  }

  function handleSortTap(field: SortField): void {
    if (filterStore.sort.field === field) {
      // Toggle direction on re-tap.
      filterStore.setSort(
        field,
        filterStore.sort.direction === "asc" ? "desc" : "asc",
      );
    } else {
      // New field: default to desc (newest/highest first).
      filterStore.setSort(field, "desc");
    }
  }
</script>

{#snippet ticketSubnavbar()}
  <div class="ticket-header-content">
    <div class="page-header">
      <BlockTitle large class="page-title">{m.tickets_title()}</BlockTitle>
      <Segmented strong class="view-toggle">
        <SegmentedButton
          active={viewModeStore.mode === "list"}
          aria-pressed={viewModeStore.mode === "list"}
          aria-label={m.tickets_view_list()}
          onclick={() => viewModeStore.set("list")}
          ><List size={16} aria-hidden="true" /></SegmentedButton
        >
        <SegmentedButton
          active={viewModeStore.mode === "grid"}
          aria-pressed={viewModeStore.mode === "grid"}
          aria-label={m.tickets_view_grid()}
          onclick={() => viewModeStore.set("grid")}
          ><LayoutGrid size={16} aria-hidden="true" /></SegmentedButton
        >
      </Segmented>
    </div>
    <div class="stats-row">
      <div class="stats-counts">
        <span class="stat-item">
          <StatusDot status="new" />
          {newCount}
          {m.tickets_status_new()}
        </span>
        <span class="stat-item">
          <StatusDot status="active" />
          {activeCount}
          {m.tickets_status_active()}
        </span>
        <span class="stat-item">
          <StatusDot status="hold" />
          {holdCount}
          {m.tickets_status_on_hold()}
        </span>
      </div>
      <div class="view-controls">
        <span bind:this={sortAnchorEl} class="sort-anchor">
          <Button
            tonal
            rounded
            small
            inline
            class="sort-btn"
            aria-label={m.tickets_sort()}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            onclick={toggleSort}
          >
            <ArrowUpDown size={16} aria-hidden="true" />
          </Button>
        </span>
        <Button
          tonal
          rounded
          small
          inline
          class="select-btn"
          aria-label={m.tickets_select_mode()}
          onclick={toggleMultiSelect}
        >
          <SquareCheckBig size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
    <SavedFilterList />
    <div class="ticket-controls">
      <FilterPillBar
        {currentUserId}
        oncreateshortcut={() => {
          savedFilterModalOpen = true;
        }}
      />
    </div>
  </div>
{/snippet}

<div class="ticket-page pb-20">
  {#if ticketsQuery.isLoading}
    <div class="ticket-list" class:ticket-grid={viewModeStore.mode === "grid"}>
      {#each [1, 2, 3, 4] as n (n)}
        <TicketCard
          loading={true}
          viewMode={viewModeStore.mode}
          ticketId=""
          queueName={null}
          displayStatus="active"
          priority="normal"
          title={undefined}
          clientAlias=""
          assignedName={null}
          createdAt={new Date()}
          lastActivityAt={null}
          followUpCount={0}
          unreadCount={0}
          previewFollowUps={undefined}
          ontap={() => {
            /* loading skeleton, no-op */
          }}
        />
      {/each}
    </div>
  {:else if ticketsQuery.isError}
    <QueryError error={ticketsQuery.error} />
  {:else}
    <div class="ticket-list" data-ticket-list>
      <VirtualList
        items={displayFiltered}
        scrollContainer={scrollEl}
        estimateHeight={viewModeStore.mode === "grid" ? 200 : 140}
        columns={gridColumns}
        getKey={(t: TicketRecord) => t.id}
        onloadmore={loadNextPage}
      >
        {#snippet children({ item }: { item: TicketRecord; index: number })}
          <SwipeableCard
            ticketId={item.id}
            disabled={multiSelectActive}
            onaction={handleAction}
            onlongpress={handleLongPress}
          >
            {@const dataProps = cardPropsMap.get(item.id)}
            {#if dataProps}
              <TicketCard
                {...dataProps}
                viewMode={viewModeStore.mode}
                selected={selectedIds.has(item.id)}
                {multiSelectActive}
              />
            {/if}
          </SwipeableCard>
        {/snippet}
      </VirtualList>
    </div>

    {#if displayFiltered.length === 0}
      <div class="empty-state" role="status">
        <p>{m.tickets_empty_filter()}</p>
      </div>
    {/if}
  {/if}
</div>

<CreateSavedFilter
  opened={savedFilterModalOpen}
  ondismiss={() => {
    savedFilterModalOpen = false;
  }}
/>

<ShellPopover
  opened={sortOpen}
  target={sortAnchorEl}
  placement="bottom"
  ondismiss={() => {
    sortOpen = false;
  }}
>
  <KList nested role="listbox" aria-label={m.tickets_sort()}>
    {#each sortOptions as opt (opt.field)}
      {@const isSelected = filterStore.sort.field === opt.field}
      <ListItem
        title={opt.label}
        role="option"
        aria-selected={isSelected}
        onclick={() => handleSortTap(opt.field)}
      >
        {#snippet after()}
          {#if isSelected}
            {#if filterStore.sort.direction === "asc"}
              <ArrowUp size={14} class="sort-dir-icon" />
            {:else}
              <ArrowDown size={14} class="sort-dir-icon" />
            {/if}
          {/if}
        {/snippet}
      </ListItem>
    {/each}
  </KList>
</ShellPopover>

<style>
  .ticket-header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  .ticket-page {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
  }

  :global(.page-title) {
    margin: 0 !important;
    padding-left: 0 !important;
  }

  .stats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .stats-counts {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .view-controls {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .sort-anchor {
    display: inline-flex;
    flex-shrink: 0;
  }

  :global(.sort-btn),
  :global(.select-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  :global(.sort-dir-icon) {
    color: var(--brand-text);
    flex-shrink: 0;
  }

  .ticket-controls {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
  }

  :global(.view-toggle) {
    flex-shrink: 0;
    width: auto !important;
    height: 1.75rem !important;
  }

  :global(.view-toggle .k-segmented-button) {
    height: 1.75rem !important;
    min-height: unset !important;
  }

  .ticket-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
  }

  .ticket-list.ticket-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
    font-size: var(--text-base);
  }
</style>
