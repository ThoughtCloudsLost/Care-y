<script lang="ts">
  import {
    createInfiniteQuery,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { createCountsQuery } from "$lib/tickets/queries.js";
  import { untrack } from "svelte";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
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
  import type {
    TicketCardProps,
    TicketQuickAction,
  } from "$lib/components/tickets/ticket-types.js";

  import { RouterNotAvailableError } from "$lib/errors.js";
  import type { SortField, FilterStatus } from "$lib/stores/filters.svelte.js";
  import { savedFilterStore } from "$lib/stores/saved-filters.svelte.js";
  import {
    savedFilterStateSchema,
    ticketPrioritySchema,
    type SavedFilterRecord,
    type SavedFilterColor,
  } from "@care-y/shared";
  import StatusDot from "$lib/components/StatusDot.svelte";
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import SwipeableCard from "$lib/components/tickets/SwipeableCard.svelte";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import CreateSavedFilter from "$lib/components/filters/CreateSavedFilter.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import AssignSheet from "$lib/components/tickets/AssignSheet.svelte";
  import ReplySheet from "$lib/components/tickets/ReplySheet.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import CallOptionsContent, {
    type CallAction,
  } from "$lib/components/tickets/CallOptionsContent.svelte";
  import { haptic } from "$lib/utils/haptic.js";
  import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
  import { resolveAsyncDecrypt } from "$lib/crypto/decrypt-result.js";

  const ticketCache = getTicketDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const queryClient = useQueryClient();

  /** Resolve a volunteer's display name from the query cache, falling back to "You" for self. */
  function resolveVolunteerName(userId: string): string {
    if (userId === currentUserId) return m.dashboard_assigned_you();
    interface VolunteerRecord {
      id: string;
      encryptedDisplayName: SerializedBuffer | Uint8Array | null;
    }
    const volunteers = queryClient.getQueryData<readonly VolunteerRecord[]>([
      "volunteers",
    ]);
    const vol = volunteers?.find((v) => v.id === userId);
    if (vol) {
      const name = orgCache.decrypt(
        `volunteer:${vol.id}`,
        vol.encryptedDisplayName,
      );
      if (name !== null) return name;
    }
    return m.dashboard_assigned_you();
  }

  // Per-ticket pending guards to prevent double-tap races.
  const pendingHoldIds = new SvelteSet<string>();

  // AssignSheet overlay state.
  let assignSheetOpen = $state(false);
  let assignTargetTicketId = $state("");
  let assignCurrentAssigneeId = $state<string | null>(null);

  // ReplySheet overlay state.
  let replySheetOpen = $state(false);
  let replyTargetTicketId = $state("");
  let replyClientAlias = $state("");
  let replyPreviewFollowUps = $state<RawFollowUpPreview[] | undefined>(
    undefined,
  );
  let replyFollowUpCount = $state(0);

  // Call action sheet state.
  let callSheetOpen = $state(false);

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
    switch (action) {
      case "hold":
        void handleHold(ticketId, true);
        break;
      case "unhold":
        void handleHold(ticketId, false);
        break;
      case "assign":
        openAssignSheet(ticketId);
        break;
      case "reply":
        openReplySheet(ticketId);
        break;
      case "call":
        callSheetOpen = true;
        break;
    }
  }

  async function handleHold(ticketId: string, onHold: boolean): Promise<void> {
    if (pendingHoldIds.has(ticketId)) return;
    pendingHoldIds.add(ticketId);

    const listKey = ["tickets", "list", filterStore.serverParams];

    // Snapshot for rollback.
    const previous = queryClient.getQueryData<{
      pages: TicketRecord[][];
      pageParams: unknown[];
    }>(listKey);

    // Optimistic update: flip onHold in cache.
    queryClient.setQueryData<typeof previous>(listKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((pg) =>
          pg.map((t) => (t.id === ticketId ? { ...t, onHold } : t)),
        ),
      };
    });

    try {
      await ticketRouter.update.mutate({ ticketId, onHold });
      haptic();
      toastStore.show(onHold ? m.ticket_toast_held() : m.ticket_toast_unheld());
      void queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
    } catch {
      // Rollback.
      queryClient.setQueryData(listKey, previous);
      toastStore.show(m.error_generic(), 3000);
    } finally {
      pendingHoldIds.delete(ticketId);
    }
  }

  function openAssignSheet(ticketId: string): void {
    // Look up current assignee from the list data.
    const ticket = allTickets.find((t) => t.id === ticketId);
    assignTargetTicketId = ticketId;
    assignCurrentAssigneeId = ticket?.assignedTo ?? null;
    assignSheetOpen = true;
  }

  async function handleAssign(
    ticketId: string,
    targetUserId: string | null,
  ): Promise<void> {
    const listKey = ["tickets", "list", filterStore.serverParams];

    // Snapshot for rollback.
    const previous = queryClient.getQueryData<{
      pages: TicketRecord[][];
      pageParams: unknown[];
    }>(listKey);

    // Optimistic update: set assignedTo in cache.
    queryClient.setQueryData<typeof previous>(listKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((pg) =>
          pg.map((t) =>
            t.id === ticketId ? { ...t, assignedTo: targetUserId } : t,
          ),
        ),
      };
    });

    try {
      await ticketRouter.assignTo.mutate({ ticketId, targetUserId });
      haptic();
      if (targetUserId === null) {
        toastStore.show(m.ticket_toast_unassigned());
      } else {
        toastStore.show(
          m.ticket_toast_assigned({ name: resolveVolunteerName(targetUserId) }),
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
    } catch {
      queryClient.setQueryData(listKey, previous);
      toastStore.show(m.error_generic(), 3000);
    }
  }

  function openReplySheet(ticketId: string): void {
    const ticket = allTickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    replyTargetTicketId = ticketId;
    replyClientAlias = ticket.clientAlias;
    replyPreviewFollowUps = previewLoader.get(ticketId);
    replyFollowUpCount = ticket.followUpCount;
    replySheetOpen = true;
  }

  function handleReplySent(ticketId: string): void {
    replySheetOpen = false;
    void queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
    void previewLoader.eagerLoad([ticketId]);
  }

  function handleCallAction(action: CallAction): void {
    callSheetOpen = false;
    if (action === "cancel") return;
    // Call actions are stubs (deferred to telephony session). No haptic.
    toastStore.show(m.feature_coming_soon());
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
  // tab bar is replaced with action snippets. When inactive, the
  // normal tab bar is restored.
  $effect(() => {
    if (multiSelectActive) {
      tabbarOverride.current = {
        left: batchLeft,
        middle: batchMiddle,
        right: batchRight,
        ariaLabel: m.tickets_selected({ count: selectedIds.size }),
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
      right: navRight,
      subnavbar: ticketSubnavbar,
      subnavbarHidden: () => scrollDir.hidden,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // Bulk assign: open AssignSheet with no pre-selected assignee.
  let bulkAssignSheetOpen = $state(false);

  function handleBulkAssign(): void {
    if (selectedIds.size === 0) return;
    assignCurrentAssigneeId = null;
    assignTargetTicketId = ""; // Not used for bulk, but required by AssignSheet.
    bulkAssignSheetOpen = true;
  }

  async function handleBulkAssignTo(
    _ticketId: string,
    targetUserId: string | null,
  ): Promise<void> {
    bulkAssignSheetOpen = false;
    if (targetUserId === null) return; // Unassign in bulk is a no-op.

    const ids = [...selectedIds];
    let succeeded = 0;

    for (const tid of ids) {
      try {
        await ticketRouter.assignTo.mutate({ ticketId: tid, targetUserId });
        succeeded++;
      } catch {
        const name = resolveVolunteerName(targetUserId);
        toastStore.show(
          m.ticket_toast_bulk_assigned({ count: String(succeeded), name }) +
            ` (${String(ids.length - succeeded)} failed)`,
          3000,
        );
        exitMultiSelect();
        return;
      }
    }

    haptic();
    toastStore.show(
      m.ticket_toast_bulk_assigned({
        count: String(succeeded),
        name: resolveVolunteerName(targetUserId),
      }),
    );
    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
  }

  async function handleBulkHold(): Promise<void> {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    let succeeded = 0;

    for (const tid of ids) {
      try {
        await ticketRouter.update.mutate({ ticketId: tid, onHold: true });
        succeeded++;
      } catch {
        toastStore.show(
          m.ticket_toast_bulk_held({ count: String(succeeded) }) +
            ` (${String(ids.length - succeeded)} failed)`,
          3000,
        );
        exitMultiSelect();
        return;
      }
    }

    haptic();
    toastStore.show(m.ticket_toast_bulk_held({ count: String(succeeded) }));
    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
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

  // Queue list for the filter pill bar (was inside old FilterPillBar).
  const queuesQuery = createQuery(() => ({
    queryKey: ["tickets", "myQueues"],
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  // --- Filter pill definitions (wiring ticket stores to generic FilterPillBar) ---

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
    (queuesQuery.data ?? []).map(
      (q: {
        id: string;
        encrypted_name: SerializedBuffer | Uint8Array | null;
        openCount: string;
      }) => ({
        value: q.id,
        label: `${orgCache.decrypt(`queue:${q.id}`, q.encrypted_name) ?? "..."} (${q.openCount})`,
      }),
    ),
  );

  const assigneeOptions = $derived.by(() => {
    const opts: { value: string; label: string }[] = [];
    if (currentUserId !== undefined) {
      opts.push({
        value: currentUserId,
        label: `${m.tickets_filter_me()} (${String(counts?.mine ?? 0)})`,
      });
    }
    opts.push({
      value: "__unassigned__",
      label: `${m.tickets_unassigned()} (${String(counts?.unassigned ?? 0)})`,
    });
    return opts;
  });

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
      label: m.tickets_filter_queue(),
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

  const validStatuses: ReadonlySet<FilterStatus> = new Set<FilterStatus>([
    "new",
    "active",
    "hold",
    "closed",
  ]);

  function isFilterStatus(v: string): v is FilterStatus {
    return (validStatuses as ReadonlySet<string>).has(v);
  }

  function handlePillToggle(pillId: string, value: string): void {
    switch (pillId) {
      case "status":
        if (isFilterStatus(value)) filterStore.toggleStatus(value);
        break;
      case "queue":
        filterStore.toggleQueue(value);
        break;
      case "priority": {
        const parsed = ticketPrioritySchema.safeParse(value);
        if (parsed.success) filterStore.togglePriority(parsed.data);
        break;
      }
    }
  }

  function handlePillSelect(pillId: string, value: string | null): void {
    if (pillId === "assignee") {
      filterStore.setAssignee(value === "__unassigned__" ? null : value);
    }
  }

  function handlePillDateChange(from: Date | null, to: Date | null): void {
    filterStore.setDateRange(from, to);
  }

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

  const dateRangeLabel = $derived.by(() => {
    const from = filterStore.dateFrom;
    const to = filterStore.dateTo;
    if (from !== null && to !== null)
      return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
    if (from !== null)
      return `${m.tickets_filter_date_from()} ${from.toLocaleDateString()}`;
    if (to !== null)
      return `${m.tickets_filter_date_to()} ${to.toLocaleDateString()}`;
    return m.tickets_filter_date_range();
  });

  // --- Saved filter wiring ---

  function handleSavedFilterApply(record: SavedFilterRecord): void {
    const parsed: unknown = JSON.parse(record.state);
    const result = savedFilterStateSchema.safeParse(parsed);
    if (result.success) {
      filterStore.applyState(result.data);
    }
  }

  function handleSavedFilterDelete(id: string): void {
    savedFilterStore.remove(id);
  }

  function handleSavedFilterToggleShare(id: string): void {
    savedFilterStore.toggleShare(id);
  }

  const filterSummary = $derived.by(() => {
    const parts: string[] = [];
    if (filterStore.statuses.size > 0)
      parts.push([...filterStore.statuses].join(", "));
    if (filterStore.priorities.size > 0)
      parts.push([...filterStore.priorities].join(", "));
    if (filterStore.queueIds.size > 0) {
      const count = filterStore.queueIds.size;
      parts.push(`${String(count)} queue${count > 1 ? "s" : ""}`);
    }
    if (filterStore.assigneeId !== null) parts.push("assigned");
    if (filterStore.dateFrom !== null || filterStore.dateTo !== null)
      parts.push("date range");
    return parts.length > 0 ? parts.join(", ") : "No filters";
  });

  function handleCreateSavedFilter(meta: {
    encryptedName: string;
    color: SavedFilterColor;
    icon: string;
  }): void {
    const record: SavedFilterRecord = {
      id: crypto.randomUUID(),
      encryptedName: meta.encryptedName,
      color: meta.color,
      icon: meta.icon,
      state: JSON.stringify(filterStore.captureState()),
      shared: false,
      ownerId: currentUserId ?? "",
      createdAt: new Date().toISOString(),
    };
    savedFilterStore.add(record);
    toastStore.show(m.saved_filter_saved());
  }

  // Saved filter modal state.
  let savedFilterModalOpen = $state(false);

  // --- SubNavbar config objects ---
  const viewConfig: ViewToggleConfig = $derived({
    mode: viewModeStore.mode,
    onchange: (mode: "list" | "grid") => viewModeStore.set(mode),
    listLabel: m.tickets_view_list(),
    gridLabel: m.tickets_view_grid(),
  });

  const SORT_FIELDS: readonly SortField[] = [
    "date",
    "priority",
    "last_activity",
    "queue",
  ];

  function isSortField(value: string): value is SortField {
    return (SORT_FIELDS as readonly string[]).includes(value);
  }

  function handleSortChange(field: string, dir: "asc" | "desc"): void {
    if (isSortField(field)) filterStore.setSort(field, dir);
  }

  const sortConfig: SortConfig = $derived({
    label: m.tickets_sort(),
    options: [
      { field: "date", label: m.tickets_sort_newest() },
      { field: "priority", label: m.tickets_sort_priority() },
      { field: "last_activity", label: m.tickets_sort_activity() },
      { field: "queue", label: m.tickets_sort_queue() },
    ],
    currentField: filterStore.sort.field,
    currentDirection: filterStore.sort.direction,
    onchange: handleSortChange,
  });

  const savedFiltersConfig: SavedFiltersConfig = $derived({
    filters: savedFilterStore.filters,
    count: savedFilterStore.count,
    onapply: handleSavedFilterApply,
    ondelete: handleSavedFilterDelete,
    ontoggleshare: handleSavedFilterToggleShare,
  });

  const filterPillsConfig: FilterPillsConfig = $derived({
    pills: ticketPills,
    activeCount: filterStore.activeCount,
    dateFrom: dateFromStr,
    dateTo: dateToStr,
    dateActive: dateRangeActive,
    dateLabel: dateRangeLabel,
    ontoggle: handlePillToggle,
    onselect: handlePillSelect,
    ondatechange: handlePillDateChange,
    onclearall: () => filterStore.clearAll(),
    oncreateshortcut: () => {
      savedFilterModalOpen = true;
    },
  });
</script>

{#snippet navRight()}
  <Link
    iconOnly
    onclick={() => void goto(resolve("/tickets/new"))}
    role="button"
    aria-label={m.nav_new_ticket()}
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
    onclick={() => void handleBulkHold()}
    aria-label={m.tickets_action_hold()}
  >
    <Pause size={24} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet batchMiddle()}
  <span class="font-semibold text-sm" role="status">
    {m.tickets_selected({ count: selectedIds.size })}
  </span>
{/snippet}

{#snippet batchRight()}
  <Link
    iconOnly
    aria-label={m.tickets_exit_multiselect()}
    onclick={exitMultiSelect}
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

{#snippet ticketSubnavbar()}
  <SubNavbarFilterLayout
    title={m.tickets_title()}
    view={viewConfig}
    stats={ticketStats}
    sort={sortConfig}
    selectLabel={m.tickets_select_mode()}
    onselect={toggleMultiSelect}
    savedFilters={savedFiltersConfig}
    filterPills={filterPillsConfig}
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
        items={displayFiltered}
        scrollContainer={scrollEl}
        estimateHeight={viewModeStore.mode === "grid" ? 200 : 140}
        virtualizeThreshold={200}
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
  {filterSummary}
  ondismiss={() => {
    savedFilterModalOpen = false;
  }}
  onsave={handleCreateSavedFilter}
/>

<AssignSheet
  opened={assignSheetOpen}
  ticketId={assignTargetTicketId}
  currentAssigneeId={assignCurrentAssigneeId}
  ondismiss={() => {
    assignSheetOpen = false;
  }}
  onassign={(tid: string, uid: string | null) => void handleAssign(tid, uid)}
/>

<AssignSheet
  opened={bulkAssignSheetOpen}
  ticketId=""
  currentAssigneeId={null}
  ondismiss={() => {
    bulkAssignSheetOpen = false;
  }}
  onassign={(tid: string, uid: string | null) =>
    void handleBulkAssignTo(tid, uid)}
/>

<ReplySheet
  opened={replySheetOpen}
  ticketId={replyTargetTicketId}
  clientAlias={replyClientAlias}
  previewFollowUps={replyPreviewFollowUps}
  followUpCount={replyFollowUpCount}
  ondismiss={() => {
    replySheetOpen = false;
  }}
  onsent={handleReplySent}
/>

<ShellActionSheet
  opened={callSheetOpen}
  ondismiss={() => {
    callSheetOpen = false;
  }}
>
  <CallOptionsContent hasVerifiedPhone={false} onaction={handleCallAction} />
</ShellActionSheet>

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
</style>
