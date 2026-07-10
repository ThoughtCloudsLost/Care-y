<script lang="ts">
  import {
    createInfiniteQuery,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { ticketsKeys, ticketKeys, volunteerKeys } from "$lib/query/keys";
  import { createCountsQuery } from "$lib/tickets/queries.js";
  import { untrack } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import type {
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
  import type { NavbarAction } from "$lib/shell/types";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { Link } from "konsta/svelte";
  import { UserPlus, Pause, X, TicketPlus } from "@lucide/svelte";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";
  import { filterStore } from "$lib/stores/filters.svelte.js";
  import { viewModeStore } from "$lib/stores/view-mode.svelte.js";
  import { newRepliesFirstStore } from "$lib/stores/new-replies-first.svelte.js";
  import {
    createListReadState,
    fetchReadStateWindow,
    fetchSweepToExhaustion,
  } from "$lib/tickets/create-list-read-state.svelte.js";
  import { sortNewRepliesFirst } from "$lib/tickets/new-replies-sort.js";
  import { isCryptoKeyed } from "$lib/crypto/crypto-keyed.svelte.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import type {
    TicketCardProps,
    TicketQuickAction,
    ViewMode,
  } from "$lib/components/tickets/ticket-types.js";
  import { requireRouter } from "$lib/errors.js";
  import { savedFilterStore } from "$lib/stores/saved-filters.svelte.js";
  import {
    savedFilterStateSchema,
    ticketPrioritySchema,
    type ReactionSummary,
    type SavedFilterColor,
  } from "@care-y/shared";
  import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import SwipeableCard from "$lib/components/tickets/SwipeableCard.svelte";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";
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
  import { getTicketsLayoutCtx } from "./tickets-layout-ctx.js";

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
    resolveEmptyKind,
    showCaughtUpLine,
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
  const ticketsLayout = getTicketsLayoutCtx();

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

  // --- Read state (unread pills, sort, filter, global truth) ---

  const loadedTicketIds = $derived(allTickets.map((t) => t.id));

  // "New replies first" is a persisted presentation toggle; the unread
  // FILTER is page state. Neither is a filterStore server param: the
  // server cannot sort or filter by read state by design.
  let unreadFilterOn = $state(false);
  const wantsPinned = $derived(newRepliesFirstStore.enabled || unreadFilterOn);

  const readStateSweepQuery = createQuery(() => ({
    queryKey: ticketsKeys.readStateSweep(),
    queryFn: async () =>
      fetchSweepToExhaustion(async (cursor) =>
        ticketRouter.readStateSweep.query({ cursor }),
      ),
    enabled: isCryptoKeyed(),
  }));

  // The window query covers every DISPLAYED row: the loaded window plus
  // pinned unread rows, so pinned rows get real per-ticket counts from
  // the 20-deep timestamp window rather than a made-up number. Pinned
  // ids land here through the sync effect below the composable (they
  // derive from the composable, which needs this query to exist first).
  // eslint-disable-next-line svelte/prefer-writable-derived -- two-phase init: the pinned id list derives from the composable, which can only be constructed after the window query this state feeds; a writable $derived would read the composable before it exists
  let pinnedWindowIds = $state<string[]>([]);
  const readStateIds = $derived([...loadedTicketIds, ...pinnedWindowIds]);

  const readStateQuery = createQuery(() => ({
    queryKey: ticketsKeys.readState(readStateIds),
    queryFn: async () =>
      fetchReadStateWindow(readStateIds, async (ids) =>
        ticketRouter.listReadState.query({ ticketIds: ids }),
      ),
    enabled: isCryptoKeyed() && readStateIds.length > 0,
  }));

  // Cursor decrypts need each row's own key wrap: list rows carry one,
  // fetched pinned rows carry one, and sweep entries carry one for
  // tickets that have no row yet (so pinned ids never decrypt wrapless).
  const keyWrapById = $derived.by(() => {
    const map = new SvelteMap<string, TicketRecord["keyWrap"]>();
    for (const entry of readStateSweepQuery.data ?? []) {
      if (entry.keyWrap !== null) map.set(entry.ticketId, entry.keyWrap);
    }
    for (const t of pinnedRecords) map.set(t.id, t.keyWrap);
    for (const t of allTickets) map.set(t.id, t.keyWrap);
    return map;
  });

  const listReadState = createListReadState({
    windowQuery: readStateQuery,
    sweepQuery: readStateSweepQuery,
    getKeyWrap: (ticketId) => keyWrapById.get(ticketId) ?? null,
    getUserId: () => currentUserId ?? "",
    ticketDecryptCache: ticketCache,
  });

  // Unread-but-unloaded tickets (the sweep's global set minus the loaded
  // window). Only materialized once the sweep settles, so the id list is
  // stable rather than churning per cursor decrypt.
  const unloadedUnreadIds = $derived.by(() => {
    if (!wantsPinned || !listReadState.sweepSettled()) return [];
    const loaded = new Set(loadedTicketIds);
    return listReadState.unreadIds().filter((id) => !loaded.has(id));
  });

  $effect(() => {
    pinnedWindowIds = unloadedUnreadIds;
  });

  // Pinned rows are fetched through the existing single-ticket endpoint
  // (same record shape as list rows) in small batches, and seeded into
  // the detail cache so opening one costs nothing extra.
  const PINNED_FETCH_CHUNK = 10;

  async function fetchTicketsByIds(
    ids: readonly string[],
  ): Promise<TicketRecord[]> {
    const fetched: TicketRecord[] = [];
    for (let i = 0; i < ids.length; i += PINNED_FETCH_CHUNK) {
      const chunk = ids.slice(i, i + PINNED_FETCH_CHUNK);
      const results = await Promise.all(
        chunk.map(async (ticketId) => {
          try {
            const t = await ticketRouter.get.query({ ticketId });
            queryClient.setQueryData(ticketKeys.detail(ticketId), t);
            return t;
          } catch (err: unknown) {
            // Recovery path: a row that cannot load is dropped from the
            // pinned block; the ticket stays reachable via normal paging.
            console.error(
              "[tickets] pinned unread fetch failed",
              ticketId,
              err,
            );
            return null;
          }
        }),
      );
      for (const t of results) {
        if (t !== null) fetched.push(t);
      }
    }
    return fetched;
  }

  const pinnedQuery = createQuery(() => ({
    queryKey: ticketsKeys.unreadPinned(unloadedUnreadIds),
    queryFn: async () => fetchTicketsByIds(unloadedUnreadIds),
    enabled: unloadedUnreadIds.length > 0,
  }));

  const pinnedRecords = $derived.by(() => {
    if (unloadedUnreadIds.length === 0) return [];
    const loaded = new Set(loadedTicketIds);
    return (pinnedQuery.data ?? []).filter((t) => !loaded.has(t.id));
  });

  const pinnedLoading = $derived(
    unloadedUnreadIds.length > 0 && pinnedQuery.isLoading,
  );

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
    const assignedIsSelf =
      t.assignedTo !== null && t.assignedTo === currentUserId;
    let assignedName: string | null = null;
    if (assignedIsSelf) {
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
      assignedIsSelf,
      createdAt: new Date(t.createdAt),
      lastActivityAt:
        t.lastActivityAt !== null ? new Date(t.lastActivityAt) : null,
      followUpCount: t.followUpCount,
      unreadCount: listReadState.unreadCount(t.id),
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
    for (const t of pinnedRecords) {
      if (!map.has(t.id)) map.set(t.id, toDataCardProps(t));
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

  // --- Unread sort and filter (applied after the search/multiselect
  //     derivations, immediately before the virtualizer) ---

  function activityMs(t: TicketRecord): number {
    return Date.parse(t.lastActivityAt ?? t.createdAt);
  }

  const listItems = $derived.by(() => {
    // The unread FILTER decides membership: exactly the global unread
    // set (loaded rows filtered, unloaded rows fetched and merged),
    // ordered newest activity first.
    if (unreadFilterOn) {
      const members = [
        ...pinnedRecords,
        ...displayItems.filter((t) => listReadState.isUnread(t.id)),
      ];
      return members.sort((a, b) => activityMs(b) - activityMs(a));
    }
    // The sort partitions the loaded window (stable, server order kept
    // within blocks) and pins fetched unread-but-unloaded rows above it.
    if (newRepliesFirstStore.enabled) {
      return [
        ...pinnedRecords,
        ...sortNewRepliesFirst(displayItems, (t) =>
          listReadState.isUnread(t.id),
        ),
      ];
    }
    return displayItems;
  });

  // --- Empty states and the caught-up stamp (global truth from the sweep) ---

  const globalCaughtUp = $derived(
    listReadState.sweepSettled() && listReadState.unreadTotal() === 0,
  );

  const emptyKind = $derived(
    resolveEmptyKind({
      searchActive: overlay.active,
      unreadFilterOn,
      globalCaughtUp,
      ticketCount: allTickets.length,
      activeFilterCount: filterStore.activeCount,
    }),
  );

  const caughtUpLineVisible = $derived(
    showCaughtUpLine({
      sortOn: newRepliesFirstStore.enabled,
      globalCaughtUp,
      searchActive: overlay.active,
      listCount: listItems.length,
    }),
  );

  // Seal initial from the org name; a nameless org gets the heading alone.
  // First grapheme, not code unit: a name can open with a composed character.
  const orgInitial = $derived.by(() => {
    const name = getBrandingTitle().trim();
    if (name === "") return undefined;
    return new Intl.Segmenter(undefined, { granularity: "grapheme" })
      .segment(name)
      .containing(0)
      ?.segment.toUpperCase();
  });

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
    ticketsLayout.openTicket(ticketId);
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
    const newTicketAction: NavbarAction = {
      icon: TicketPlus,
      label: m.nav_new_ticket(withTerms()),
      onclick: () => {
        newTicketOpen = true;
      },
    };
    navbarCtx.current = {
      actions: [newTicketAction],
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
    const savedFilterId = params.get("savedFilter");

    if (
      queueId === null &&
      filter === null &&
      action === null &&
      savedFilterId === null
    )
      return;

    lastAppliedSearch = searchStr;

    untrack(() => {
      if (savedFilterId !== null) {
        const record = savedFilterStore.filters.find(
          (f) => f.id === savedFilterId,
        );
        if (record != null) dispatch.handleSavedFilterApply(record);
      } else if (queueId !== null) {
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

  // --- Grid columns (dynamic based on container width) ---

  const GRID_CARD_MIN_WIDTH = 320;
  let containerWidth = $state(0);

  $effect(() => {
    const el = scrollEl;
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
    viewModeStore.mode === "grid"
      ? Math.max(1, Math.floor(containerWidth / GRID_CARD_MIN_WIDTH))
      : 1,
  );

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

  // Virtualizer estimate per Inkwell presentation: compact ruled rows,
  // preview-bearing cards, multi-column grid cells.
  const estimateHeight = $derived(
    viewModeStore.mode === "list"
      ? 72
      : viewModeStore.mode === "cards"
        ? 210
        : 200,
  );

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
    sortToggle: {
      label: m.tickets_sort_new_replies_first(),
      active: newRepliesFirstStore.enabled,
      ontoggle: () => {
        newRepliesFirstStore.toggle();
      },
    },
    unreadFilter: {
      label: m.tickets_filter_unread(),
      active: unreadFilterOn,
      ontoggle: () => {
        unreadFilterOn = !unreadFilterOn;
      },
    },
  });
</script>

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
  <span class="count-item">
    <b>{newCount}</b>
    {m.tickets_status_new()}
  </span>
  <span class="count-item">
    <b>{activeCount}</b>
    {m.tickets_status_active()}
  </span>
  <span class="count-item">
    <b>{holdCount}</b>
    {m.tickets_status_on_hold()}
  </span>
  {#if listReadState.sweepSettled()}
    {@const unreadTotal = listReadState.unreadTotal()}
    <span class="count-item" data-testid="count-new-replies">
      <b>{unreadTotal}</b>
      {unreadTotal === 1
        ? m.tickets_count_new_replies_one()
        : m.tickets_count_new_replies_other()}
    </span>
  {/if}
{/snippet}

{#snippet switcherHeader()}
  <ViewSwitcher
    mode={viewModeStore.mode}
    onchange={(mode: ViewMode) => viewModeStore.set(mode)}
  />
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
    headerRight={switcherHeader}
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
    <div
      class="ticket-list"
      class:mode-rows={viewModeStore.mode === "list"}
      class:mode-cards={viewModeStore.mode === "cards"}
      class:ticket-grid={viewModeStore.mode === "grid"}
    >
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
    {#if caughtUpLineVisible}
      <!-- Earned-state stamp on the dateline anatomy: the volunteer has
           read every reply, globally, so the sort has nothing to raise. -->
      <div class="caught-up-line" role="status" data-testid="caught-up-line">
        <span class="caught-up-stamp">{m.tickets_unread_zero_stamp()}</span>
        <span class="caught-up-label">{m.tickets_unread_zero_title()}</span>
      </div>
    {/if}
    <div
      class="ticket-list"
      data-ticket-list
      class:mode-rows={viewModeStore.mode === "list"}
      class:mode-cards={viewModeStore.mode === "cards"}
    >
      {#if pinnedLoading}
        <!-- Skeleton rows for unread-but-unloaded tickets being fetched
             into the pinned block. -->
        {#each unloadedUnreadIds as id (id)}
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
      {/if}
      {#key viewModeStore.mode}
        <VirtualList
          items={listItems}
          scrollContainer={scrollEl}
          {estimateHeight}
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
              class:ticket-card-selected={ticketsLayout.selectedTicketId() ===
                item.id}
              aria-current={overlay.activeId === item.id ||
              ticketsLayout.selectedTicketId() === item.id
                ? "true"
                : undefined}
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
      {/key}
    </div>

    {#if listItems.length === 0 && !pinnedLoading}
      {#if emptyKind === "search"}
        <EmptyState title={m.search_conversation_no_matches()} />
      {:else if emptyKind === "caught-up"}
        <EmptyState
          stamp={m.tickets_unread_zero_stamp()}
          title={m.tickets_unread_zero_title()}
          subtitle={m.tickets_unread_zero_body(withTerms())}
        />
      {:else if emptyKind === "truly-empty"}
        <EmptyState
          seal={orgInitial}
          title={m.tickets_empty_title()}
          subtitle={m.tickets_empty_body(withTerms())}
        />
      {:else}
        <EmptyState title={m.tickets_empty_filter(withTerms())} />
      {/if}
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

  /* Counts line: bold ink numbers, ink-2 words (the mock's .counts). */
  .count-item {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    font-size: var(--text-base);
    color: var(--ink-2);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .count-item b {
    font-weight: 700;
    color: var(--ink);
  }

  .ticket-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
  }

  /* Ruled rows: hairline-separated lines opened by a top rule; the
     rows carry their own bottom hairlines. */
  .ticket-list.mode-rows {
    gap: 0;
    border-top: 1px solid var(--hair);
  }

  .ticket-list.mode-cards {
    gap: 12px;
  }

  .ticket-list.ticket-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  /* Caught-up line: the dateline anatomy carrying the earned-state
     stamp. Quiet ink, hairline-flanked; the list below stays intact. */
  .caught-up-line {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 0;
  }

  .caught-up-line::before,
  .caught-up-line::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--hair);
  }

  .caught-up-stamp {
    display: inline-block;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 4px 10px;
    border: 1px solid currentColor;
    border-radius: 3px;
    color: var(--ink);
    transform: rotate(-1deg);
  }

  .caught-up-label {
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .search-target {
    min-width: 0;
    overflow: hidden;
  }
</style>
