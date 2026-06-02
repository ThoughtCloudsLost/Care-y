<script lang="ts">
  import {
    createInfiniteQuery,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { ticketsKeys, volunteerKeys } from "$lib/query/keys";
  import { createCountsQuery } from "$lib/tickets/queries.js";
  import { untrack } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import type {
    ViewToggleConfig,
    SortConfig,
    SavedFiltersConfig,
    FilterPillsConfig,
  } from "$lib/shell/types.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
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
  import { Link } from "konsta/svelte";
  import { UserPlus, Pause, X, TicketPlus } from "@lucide/svelte";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";
  import { filterStore } from "$lib/stores/filters.svelte.js";
  import { viewModeStore } from "$lib/stores/view-mode.svelte.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import type {
    TicketCardProps,
    TicketQuickAction,
  } from "$lib/components/tickets/ticket-types.js";
  import { requireRouter } from "$lib/errors.js";
  import { savedFilterStore } from "$lib/stores/saved-filters.svelte.js";
  import {
    savedFilterStateSchema,
    ticketPrioritySchema,
    type ReactionSummary,
    type SavedFilterColor,
  } from "@care-y/shared";
  import StatusDot from "$lib/components/StatusDot.svelte";
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import SwipeableCard from "$lib/components/tickets/SwipeableCard.svelte";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import type { CallAction } from "$lib/components/tickets/CallOptionsContent.svelte";
  import { createBulkActions } from "$lib/composables/ticket-list/create-bulk-actions.svelte.js";
  import { createFilterDispatch } from "$lib/composables/create-filter-dispatch.svelte.js";
  import {
    buildVolunteerMap,
    resolveVolunteerName as sharedResolveVolunteerName,
    type VolunteerRecord,
  } from "$lib/tickets/resolve-volunteer.js";
  import { resolveAsyncDecrypt } from "$lib/crypto/decrypt-result.js";
  import { createSearchOverlay } from "$lib/search/search-overlay.svelte.js";
  import { createDeepSearch } from "$lib/search/deep-search.svelte.js";
  import SearchNavigator from "$lib/components/search/SearchNavigator.svelte";
  import { fuzzySearch } from "$lib/search/fuzzy.js";
  import TicketListOverlays from "./TicketListOverlays.svelte";

  import { createMultiSelect } from "$lib/composables/ticket-list/create-multi-select.svelte.js";
  import { createHoldAction } from "$lib/composables/ticket-list/create-hold-action.svelte.js";
  import { createAssignFlow } from "$lib/composables/ticket-list/create-assign-flow.svelte.js";
  import { createReplyFlow } from "$lib/composables/ticket-list/create-reply-flow.svelte.js";
  import {
    filterByDisplayStatus,
    reactionsForTicket,
    matchTitles,
    mergeSearchMatches,
    applySearchOrder,
    buildDateRangeLabel,
    buildFilterSummary,
    buildAssigneeOptions,
    isSortField,
    isFilterStatus,
    SORT_FIELDS,
  } from "$lib/tickets/ticket-list-utils.js";

  // --- Context & services ---

  const ticketCache = getTicketDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const previewLoader = getPreviewLoader();
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });
  const tabbarOverride = getTabbarOverrideCtx();
  const navbarCtx = getNavbarOverrideCtx();

  function resolveVolunteerName(userId: string): string {
    if (userId === currentUserId) return m.dashboard_assigned_you();
    const volunteers = queryClient.getQueryData<readonly VolunteerRecord[]>(
      volunteerKeys.all,
    );
    const volunteerMap = buildVolunteerMap(volunteers);
    return sharedResolveVolunteerName(userId, volunteerMap, orgCache) ?? "...";
  }

  // --- Composables ---

  const multiSelect = createMultiSelect();
  const holdAction = createHoldAction({
    queryClient,
    getQueryKey: () => ticketsKeys.list(filterStore.serverParams),
    holdMutate: async (ticketId, onHold) =>
      ticketRouter.update.mutate({ ticketId, onHold }),
  });
  const assignFlow = createAssignFlow({
    queryClient,
    getQueryKey: () => ticketsKeys.list(filterStore.serverParams),
    assignMutate: async (ticketId, targetUserId) =>
      ticketRouter.assignTo.mutate({ ticketId, targetUserId }),
    resolveVolunteerName,
    getTickets: () => allTickets,
  });
  const replyFlow = createReplyFlow({
    queryClient,
    getTickets: () => allTickets,
    getPreviewFollowUps: (id) => previewLoader.get(id),
    eagerLoadPreviews: async (ids) => previewLoader.eagerLoad(ids),
  });

  // --- Overlay state (simple toggles that stay in the page) ---

  let callSheetOpen = $state(false);
  let newTicketOpen = $state(false);
  let bulkAssignSheetOpen = $state(false);
  let savedFilterModalOpen = $state(false);

  // --- Queries ---

  const ticketsQuery = createInfiniteQuery(() => ({
    queryKey: ticketsKeys.list(filterStore.serverParams),
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

  const allTickets = $derived(ticketsQuery.data?.pages.flat() ?? []);
  type TicketRecord = (typeof allTickets)[number];

  const countsQuery = createCountsQuery(ticketRouter);
  const newCount = $derived(countsQuery.data?.new ?? 0);
  const activeCount = $derived(countsQuery.data?.active ?? 0);
  const holdCount = $derived(countsQuery.data?.onHold ?? 0);

  const queuesQuery = createQuery(() => ({
    queryKey: ticketsKeys.myQueues(),
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  // --- Derived display list (Layer C extractions) ---

  const displayFiltered = $derived(
    filterByDisplayStatus(
      allTickets,
      filterStore.needsDisplayStatusPostFilter,
      filterStore.statuses.has("new"),
    ),
  );

  // --- Preview reactions ---

  const previewReactionsMap = new SvelteMap<string, ReactionSummary[]>();
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- tracks fetched IDs, not rendered state
  const fetchedReactionIds = new Set<string>();

  $effect(() => {
    const tickets = allTickets;
    if (tickets.length > 0) {
      void previewLoader.eagerLoad(tickets.map((t) => t.id));
    }
  });

  $effect(() => {
    const previews = previewLoader.rawPreviews;
    const noteIds: string[] = [];
    for (const followUps of previews.values()) {
      for (const fu of followUps) {
        if (fu.type === "internal_note" && !fetchedReactionIds.has(fu.id)) {
          noteIds.push(fu.id);
        }
      }
    }
    if (noteIds.length === 0) return;
    for (const id of noteIds) fetchedReactionIds.add(id);
    void ticketRouter.getReactions
      .query({ followUpIds: noteIds.slice(0, 100) })
      .then((result) => {
        for (const [id, summaries] of Object.entries(result)) {
          if (summaries.length > 0) previewReactionsMap.set(id, summaries);
        }
      })
      .catch(() => {
        /* best-effort */
      });
  });

  // --- Card props mapping ---

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
      titleResult: resolveAsyncDecrypt(
        ticketCache.decryptTitle(t.id, t.keyWrap, t.encryptedTitle),
        t.keyWrap !== null,
      ),
      clientAlias: t.clientAlias,
      assignedName,
      createdAt: new Date(t.createdAt),
      lastActivityAt:
        t.lastActivityAt !== null ? new Date(t.lastActivityAt) : null,
      followUpCount: t.followUpCount,
      unreadCount: 0,
      previewFollowUps: previewLoader.get(t.id),
      previewReactions: reactionsForTicket(
        previewLoader.get(t.id),
        previewReactionsMap,
      ),
      ontap: handleTicketTap,
      onselect: (id: string) => multiSelect.toggleSelection(id),
      onaction: handleAction,
      onencryptedhelp: showEncryptedHelp,
    };
  }

  const cardPropsMap = $derived.by(() => {
    const map = new SvelteMap<string, DataCardProps>();
    for (const t of displayFiltered) {
      map.set(t.id, toDataCardProps(t));
    }
    return map;
  });

  // --- Search ---

  const overlay = createSearchOverlay({
    matches: () => searchMatches,
    getElementId: (id) => `ticket-${id}`,
    scrollContainer: () => scrollEl,
  });

  const titleMatchIds = $derived(
    overlay.term == null
      ? []
      : matchTitles(
          [...cardPropsMap].map(([id, props]) => ({
            id,
            title:
              props.titleResult.status === "ready"
                ? props.titleResult.value
                : null,
            clientAlias: props.clientAlias,
          })),
          overlay.term,
          fuzzySearch,
        ),
  );

  const deepSearch = createDeepSearch({
    overlay,
    providerId: "tickets",
    hasNextPage: () => ticketsQuery.hasNextPage,
    isFetchingNextPage: () => ticketsQuery.isFetchingNextPage,
    fetchNextPage: async () => ticketsQuery.fetchNextPage(),
    isInitialLoading: () => ticketsQuery.isLoading,
    loadedCount: () => allTickets.length,
    matchCount: () => titleMatchIds.length,
  });

  const searchMatches = $derived(
    mergeSearchMatches(
      titleMatchIds,
      deepSearch.contentMatchIds,
      new Set(cardPropsMap.keys()),
    ),
  );

  let useMatchOrder = $state(true);

  $effect(() => {
    if (overlay.active) {
      useMatchOrder = true;
    }
  });

  const displayItems = $derived(
    applySearchOrder(
      displayFiltered,
      overlay.active,
      overlay.term,
      searchMatches,
      useMatchOrder,
    ),
  );

  $effect(() => {
    const q = page.url.searchParams.get("q");
    if (q != null && q !== "") {
      overlay.enter(q);
      deepSearch.scheduleFromNavigation();
    }
  });

  let prevViewMode = $state(viewModeStore.mode);
  $effect(() => {
    const mode = viewModeStore.mode;
    if (mode !== prevViewMode) {
      prevViewMode = mode;
      if (overlay.activeId != null) {
        overlay.requestScroll();
      }
    }
  });

  // --- Event handlers (thin delegation) ---

  function showEncryptedHelp(): void {
    toastStore.show(m.dashboard_encrypted_help(withTerms()), 5000);
  }

  function handleTicketTap(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}`));
  }

  function handleAction(ticketId: string, action: TicketQuickAction): void {
    switch (action) {
      case "hold":
        void holdAction.handleHold(ticketId, false);
        break;
      case "unhold":
        void holdAction.handleHold(ticketId, true);
        break;
      case "assign":
        assignFlow.open(ticketId);
        break;
      case "take":
        void handleTake(ticketId);
        break;
      case "reply":
        replyFlow.open(ticketId);
        break;
      case "call":
        callSheetOpen = true;
        break;
    }
  }

  async function handleTake(ticketId: string): Promise<void> {
    try {
      await ticketRouter.take.mutate({ ticketId });
      haptic();
      toastStore.show(m.ticket_toast_taken(withTerms()));
      void queryClient.invalidateQueries({
        queryKey: ticketsKeys.lists(),
      });
    } catch (err: unknown) {
      console.error("[tickets] take failed", err);
      toastStore.show(m.error_generic(), 3000);
    }
  }

  function handleCallAction(action: CallAction): void {
    callSheetOpen = false;
    if (action === "cancel") return;
    toastStore.show(m.feature_coming_soon());
  }

  function loadNextPage(): void {
    if (ticketsQuery.hasNextPage && !ticketsQuery.isFetchingNextPage) {
      void ticketsQuery.fetchNextPage();
    }
  }

  function handleBulkAssign(): void {
    if (multiSelect.selectedIds.size === 0) return;
    bulkAssignSheetOpen = true;
  }

  function handleCreateSavedFilter(meta: {
    encryptedName: string;
    color: SavedFilterColor;
    icon: string;
  }): void {
    dispatch.handleCreateSavedFilter(meta);
    toastStore.show(m.saved_filter_saved());
  }

  // --- Tabbar / navbar overrides ---

  $effect(() => {
    if (multiSelect.active) {
      tabbarOverride.current = {
        left: batchLeft,
        middle: batchMiddle,
        right: batchRight,
        ariaLabel: m.tickets_selected({
          count: multiSelect.selectedIds.size,
        }),
      };
    } else {
      tabbarOverride.current = undefined;
    }
  });

  $effect(() => {
    return () => {
      tabbarOverride.current = undefined;
    };
  });

  $effect(() => {
    navbarCtx.current = {
      right: navRight,
      subnavbar: ticketSubnavbar,
      subnavbarHidden: () => scrollDir.hidden && !overlay.active,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // --- URL filter application ---

  let lastAppliedSearch = "";

  $effect(() => {
    const searchStr = page.url.search;
    if (searchStr === "" || searchStr === lastAppliedSearch) return;

    const params = page.url.searchParams;
    const queueId = params.get("queue");
    const filter = params.get("filter");
    const action = params.get("action");

    if (queueId === null && filter === null && action === null) return;

    lastAppliedSearch = searchStr;

    untrack(() => {
      if (queueId !== null) {
        filterStore.clearAll();
        filterStore.toggleQueue(queueId);
      } else if (filter === "my-open") {
        filterStore.clearAll();
        filterStore.toggleStatus("new");
        filterStore.toggleStatus("active");
        if (currentUserId !== undefined) {
          filterStore.setAssignee(currentUserId);
        }
      } else if (filter === "unassigned") {
        filterStore.clearAll();
        filterStore.toggleStatus("new");
        filterStore.toggleStatus("active");
        filterStore.setAssignee(null);
      }

      if (action === "new-ticket") {
        newTicketOpen = true;
      }
    });

    void goto(resolve("/tickets"), { replaceState: true });
  });

  // --- Bulk actions ---

  const bulkActions = createBulkActions({
    selectedIds: multiSelect.selectedIds,
    exitMultiSelect: () => multiSelect.exit(),
    queryClient,
    assignTo: async (ticketId, targetUserId) =>
      ticketRouter.assignTo.mutate({ ticketId, targetUserId }),
    holdTicket: async (ticketId) =>
      ticketRouter.update.mutate({ ticketId, onHold: true }),
    resolveVolunteerName,
  });

  // --- Grid columns ---

  const gridColumns = $derived(viewModeStore.mode === "grid" ? 2 : 1);

  // --- Filter config ---

  const counts = $derived(countsQuery.data);
  const priorityCounts = $derived(counts?.byPriority);

  const statusOptions = $derived([
    {
      value: "new",
      label: `${m.tickets_filter_new()} (${String(counts?.new ?? 0)})`,
    },
    {
      value: "active",
      label: `${m.tickets_filter_active()} (${String(counts?.active ?? 0)})`,
    },
    {
      value: "hold",
      label: `${m.tickets_filter_hold()} (${String(counts?.onHold ?? 0)})`,
    },
    {
      value: "closed",
      label: `${m.tickets_filter_closed()} (${String(counts?.closed ?? 0)})`,
    },
  ]);

  const priorityOptions = $derived([
    {
      value: "low",
      label: `${m.tickets_filter_priority_low()} (${String(priorityCounts?.low ?? 0)})`,
    },
    {
      value: "normal",
      label: `${m.tickets_filter_priority_normal()} (${String(priorityCounts?.normal ?? 0)})`,
    },
    {
      value: "high",
      label: `${m.tickets_filter_priority_high()} (${String(priorityCounts?.high ?? 0)})`,
    },
    {
      value: "urgent",
      label: `${m.tickets_filter_priority_urgent()} (${String(priorityCounts?.urgent ?? 0)})`,
    },
  ]);

  const queueOptions = $derived(
    (queuesQuery.data ?? []).map((q) => ({
      value: q.id,
      label: `${orgCache.decrypt(`queue:${q.id}`, q.encryptedName) ?? "..."} (${q.openCount})`,
    })),
  );

  const assigneeOptions = $derived(
    buildAssigneeOptions(currentUserId, counts, {
      me: (count) => `${m.tickets_filter_me()} (${count})`,
      unassigned: (count) => `${m.tickets_unassigned()} (${count})`,
    }),
  );

  const ticketPills: PillDefinition[] = $derived([
    {
      id: "status",
      label: m.tickets_filter_status(),
      mode: "multi",
      options: statusOptions,
      selected: filterStore.statuses,
    },
    {
      id: "queue",
      label: m.tickets_filter_queue(withTerms()),
      mode: "multi",
      options: queueOptions,
      selected: filterStore.queueIds,
      loading: queuesQuery.isLoading,
    },
    {
      id: "priority",
      label: m.tickets_filter_priority(),
      mode: "multi",
      options: priorityOptions,
      selected: filterStore.priorities,
    },
    {
      id: "assignee",
      label: m.tickets_filter_assignee(),
      mode: "single",
      options: assigneeOptions,
      selected:
        filterStore.assigneeId === null
          ? "__unassigned__"
          : (filterStore.assigneeId ?? null),
    },
    {
      id: "date",
      label: m.tickets_filter_date_range(),
      mode: "date",
      options: [],
      selected: null,
    },
  ]);

  const dispatch = createFilterDispatch({
    fields: {
      status: {
        type: "multi-toggle",
        toggle: (v: string) => {
          if (isFilterStatus(v)) filterStore.toggleStatus(v);
        },
      },
      queue: {
        type: "multi-toggle",
        toggle: (v: string) => filterStore.toggleQueue(v),
      },
      priority: {
        type: "multi-toggle",
        toggle: (v: string) => {
          const parsed = ticketPrioritySchema.safeParse(v);
          if (parsed.success) filterStore.togglePriority(parsed.data);
        },
      },
      assignee: {
        type: "single-select",
        set: (v: string | null) =>
          filterStore.setAssignee(v === "__unassigned__" ? null : v),
      },
      date: {
        type: "date-range",
        set: (from: Date | null, to: Date | null) =>
          filterStore.setDateRange(from, to),
      },
    },
    sort: {
      validate: isSortField,
      set: (field: string, dir: "asc" | "desc") => {
        if (isSortField(field)) filterStore.setSort(field, dir);
      },
    },
    savedFilters: {
      store: savedFilterStore,
      captureState: () => filterStore.captureState(),
      applyState: (state: unknown) => {
        const result = savedFilterStateSchema.safeParse(state);
        if (result.success) filterStore.applyState(result.data);
      },
      stateSchema: savedFilterStateSchema,
      getCurrentUserId: () => currentUserId ?? null,
    },
    clearAll: () => filterStore.clearAll(),
    onchange: () => {
      if (overlay.active) useMatchOrder = false;
    },
  });

  const dateRangeActive = $derived(
    filterStore.dateFrom !== null || filterStore.dateTo !== null,
  );

  const dateFromStr = $derived(
    filterStore.dateFrom !== null
      ? filterStore.dateFrom.toISOString().slice(0, 10)
      : "",
  );
  const dateToStr = $derived(
    filterStore.dateTo !== null
      ? filterStore.dateTo.toISOString().slice(0, 10)
      : "",
  );

  const dateRangeLabel = $derived(
    buildDateRangeLabel(filterStore.dateFrom, filterStore.dateTo, {
      from: m.tickets_filter_date_from(),
      to: m.tickets_filter_date_to(),
      range: m.tickets_filter_date_range(),
    }),
  );

  const filterSummary = $derived(
    buildFilterSummary(
      filterStore.statuses,
      filterStore.priorities,
      filterStore.queueIds.size,
      filterStore.assigneeId,
      filterStore.dateFrom !== null || filterStore.dateTo !== null,
    ),
  );

  // --- SubNavbar configs ---

  const viewConfig: ViewToggleConfig = $derived({
    mode: viewModeStore.mode,
    onchange: (mode: "list" | "grid") => viewModeStore.set(mode),
    listLabel: m.tickets_view_list(),
    gridLabel: m.tickets_view_grid(),
  });

  const sortConfig: SortConfig = $derived({
    label: m.tickets_sort(),
    options: [
      { field: "date", label: m.tickets_sort_newest() },
      { field: "priority", label: m.tickets_sort_priority() },
      { field: "last_activity", label: m.tickets_sort_activity() },
      { field: "queue", label: m.tickets_sort_queue(withTerms()) },
    ],
    currentField: filterStore.sort.field,
    currentDirection: filterStore.sort.direction,
    onchange: dispatch.handleSortChange,
  });

  const savedFiltersConfig: SavedFiltersConfig = $derived({
    filters: savedFilterStore.filters,
    count: savedFilterStore.count,
    onapply: dispatch.handleSavedFilterApply,
    ondelete: dispatch.handleSavedFilterDelete,
    ontoggleshare: dispatch.handleSavedFilterToggleShare,
  });

  const filterPillsConfig: FilterPillsConfig = $derived({
    pills: ticketPills,
    activeCount: filterStore.activeCount,
    dateFrom: dateFromStr,
    dateTo: dateToStr,
    dateActive: dateRangeActive,
    dateLabel: dateRangeLabel,
    ontoggle: dispatch.handlePillToggle,
    onselect: dispatch.handlePillSelect,
    ondatechange: dispatch.handlePillDateChange,
    onclearall: dispatch.clearAll,
    oncreateshortcut: () => {
      savedFilterModalOpen = true;
    },
  });
</script>

{#snippet navRight()}
  <Link
    iconOnly
    onclick={() => {
      newTicketOpen = true;
    }}
    role="button"
    aria-label={m.nav_new_ticket(withTerms())}
  >
    <TicketPlus size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet batchLeft()}
  <Link
    iconOnly
    onclick={handleBulkAssign}
    aria-label={m.tickets_action_assign()}
  >
    <UserPlus size={24} aria-hidden="true" />
  </Link>
  <Link
    iconOnly
    onclick={() => void bulkActions.handleBulkHold()}
    aria-label={m.tickets_action_hold()}
  >
    <Pause size={24} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet batchMiddle()}
  <span class="font-semibold text-sm" role="status">
    {m.tickets_selected({ count: multiSelect.selectedIds.size })}
  </span>
{/snippet}

{#snippet batchRight()}
  <Link
    iconOnly
    aria-label={m.tickets_exit_multiselect()}
    onclick={() => multiSelect.exit()}
  >
    <X size={24} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet ticketStats()}
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
{/snippet}

{#snippet searchNavigatorRow()}
  <SearchNavigator
    term={overlay.term ?? ""}
    position={overlay.position}
    total={overlay.matchCount}
    onup={overlay.up}
    ondown={overlay.down}
    onexit={overlay.exit}
    ontermchange={overlay.setTerm}
    ondeepsearch={deepSearch.canTrigger ? deepSearch.trigger : undefined}
    deepSearchStatus={deepSearch.status}
    deepSearchSearched={deepSearch.searched}
    deepSearchTotal={deepSearch.total}
  />
{/snippet}

{#snippet ticketSubnavbar()}
  <SubNavbarFilterLayout
    title={m.tickets_title(withTerms())}
    view={viewConfig}
    stats={ticketStats}
    sort={sortConfig}
    selectLabel={m.tickets_select_mode()}
    onselect={() => multiSelect.toggle()}
    savedFilters={savedFiltersConfig}
    filterPills={filterPillsConfig}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    onsearch={!overlay.active ? () => overlay.enter("") : undefined}
    searchLabel={m.search_inline_trigger()}
  />
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
          titleResult={{ status: "loading" }}
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
        items={displayItems}
        scrollContainer={scrollEl}
        estimateHeight={viewModeStore.mode === "grid" ? 200 : 140}
        virtualizeThreshold={200}
        columns={gridColumns}
        getKey={(t: TicketRecord) => t.id}
        onloadmore={loadNextPage}
      >
        {#snippet children({ item }: { item: TicketRecord; index: number })}
          <div
            id="ticket-{item.id}"
            class="search-target"
            class:match-active={overlay.activeId === item.id}
            aria-current={overlay.activeId === item.id ? "true" : undefined}
          >
            <SwipeableCard
              ticketId={item.id}
              disabled={multiSelect.active}
              onaction={handleAction}
              onlongpress={(id: string) => multiSelect.handleLongPress(id)}
            >
              {@const dataProps = cardPropsMap.get(item.id)}
              {#if dataProps}
                <TicketCard
                  {...dataProps}
                  viewMode={viewModeStore.mode}
                  selected={multiSelect.selectedIds.has(item.id)}
                  multiSelectActive={multiSelect.active}
                  searchTerm={overlay.term}
                />
              {/if}
            </SwipeableCard>
          </div>
        {/snippet}
      </VirtualList>
    </div>

    {#if displayItems.length === 0}
      <div class="empty-state" role="status">
        <p>
          {overlay.active
            ? m.search_conversation_no_matches()
            : m.tickets_empty_filter(withTerms())}
        </p>
      </div>
    {/if}
  {/if}
</div>

<TicketListOverlays
  assignSheetOpen={assignFlow.sheetOpen}
  assignTargetTicketId={assignFlow.targetTicketId}
  assignCurrentAssigneeId={assignFlow.currentAssigneeId}
  onassigndismiss={() => assignFlow.dismiss()}
  onassign={(tid: string, uid: string | null) =>
    void assignFlow.handleAssign(tid, uid)}
  {bulkAssignSheetOpen}
  onbulkassigndismiss={() => {
    bulkAssignSheetOpen = false;
  }}
  onbulkassign={(tid: string, uid: string | null) => {
    bulkAssignSheetOpen = false;
    void bulkActions.handleBulkAssignTo(tid, uid);
  }}
  replySheetOpen={replyFlow.sheetOpen}
  replyTargetTicketId={replyFlow.targetTicketId}
  replyClientAlias={replyFlow.clientAlias}
  replyPreviewFollowUps={replyFlow.previewFollowUps}
  replyFollowUpCount={replyFlow.followUpCount}
  onreplydismiss={() => replyFlow.dismiss()}
  onreplysent={(tid: string) => replyFlow.handleReplySent(tid)}
  {callSheetOpen}
  oncalldismiss={() => {
    callSheetOpen = false;
  }}
  oncallaction={handleCallAction}
  {newTicketOpen}
  onnewticketdismiss={() => {
    newTicketOpen = false;
  }}
  {savedFilterModalOpen}
  {filterSummary}
  onsavedfilterdismiss={() => {
    savedFilterModalOpen = false;
  }}
  onsavedfiltersave={handleCreateSavedFilter}
/>

<style>
  .ticket-page {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
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

  .search-target {
    min-width: 0;
    overflow: hidden;
  }
</style>
