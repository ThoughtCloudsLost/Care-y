<script lang="ts">
  import type { Component } from "svelte";
  import { SvelteSet, SvelteMap } from "svelte/reactivity";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import {
    Notification,
    List,
    ListItem,
    BlockTitle,
    Button,
    DialogButton,
  } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { trpc } from "$lib/trpc/index.js";
  import { ticketsKeys, kbKeys, volunteerKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    FilePlus,
    LayersPlus,
    FolderPlus,
    UserPlus,
    Plus,
  } from "@lucide/svelte";
  import TicketPlus from "$lib/components/icons/TicketPlus.svelte";
  import TicketPreviewList from "$lib/components/dashboard/TicketPreviewList.svelte";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import ShiftSection from "$lib/components/dashboard/ShiftSection.svelte";
  import GettingStartedCard from "$lib/components/dashboard/GettingStartedCard.svelte";
  import QueueCards from "$lib/components/dashboard/QueueCards.svelte";
  import ActivitySection from "$lib/components/dashboard/ActivitySection.svelte";
  import KBSection from "$lib/components/dashboard/KBSection.svelte";
  import MergeCandidatesSection from "$lib/components/dashboard/MergeCandidatesSection.svelte";
  import SectionFilterButton from "$lib/components/dashboard/SectionFilterButton.svelte";
  import FilterPillBar from "$lib/components/filters/FilterPillBar.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";
  import AssignSheet from "$lib/components/tickets/AssignSheet.svelte";
  import ReplySheet from "$lib/components/tickets/ReplySheet.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import CallOptionsContent from "$lib/components/tickets/CallOptionsContent.svelte";
  import type { CallAction } from "$lib/components/tickets/CallOptionsContent.svelte";
  import {
    getOrgDecryptCache,
    getTicketDecryptCache,
    getPreviewLoader,
    getCurrentUserId,
    getCurrentPermissions,
  } from "$lib/crypto/context.js";
  import type { DashboardLaneId, ReactionSummary } from "@care-y/shared";
  import { canCall, canUseInline } from "$lib/auth/procedure-gates.js";
  import { allowedQuickActions } from "$lib/tickets/quick-action-gates.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import {
    decryptQueueAppearance,
    type QueueAppearance,
  } from "$lib/utils/queue-appearance.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import {
    getNavbarOverrideCtx,
    getScrollContainer,
    getSectionRailCtx,
  } from "$lib/shell/context.js";
  import type { FilterPillsConfig, NavbarAction } from "$lib/shell/types";
  import { createSectionScroll } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import { buildDashboardSections } from "$lib/shell/section-registry.js";
  import { dashboardViewModeStore } from "$lib/stores/view-mode.svelte.js";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
  import { createCardPropsMapper } from "$lib/tickets/ticket-card-props.js";
  import {
    collectKeyWraps,
    createListReadState,
  } from "$lib/tickets/create-list-read-state.svelte.js";
  import {
    createFacetIndexQuery,
    createReadStateQueries,
    type TicketListRow,
  } from "$lib/tickets/queries.js";
  import {
    DASHBOARD_CONTEXT_REFRESH_MS,
    DASHBOARD_LANE_IDS,
    dashboardLaneCap,
    planApplyToAll,
    type ApplyToAllPlan,
    type ApplyToAllTarget,
  } from "$lib/tickets/dashboard-lanes.js";
  import {
    buildTicketFilterPills,
    ticketDatePillProps,
    ticketFilterFields,
  } from "$lib/tickets/ticket-filter-pills.js";
  import {
    createDashboardLane,
    type DashboardLane,
    type DashboardLaneDeps,
  } from "$lib/composables/dashboard/create-dashboard-lane.svelte.js";
  import {
    createSectionFilterToggle,
    type SectionFilterToggle,
  } from "$lib/composables/dashboard/create-section-filter-toggle.svelte.js";
  import { createDashboardArrangement } from "$lib/composables/dashboard/create-dashboard-arrangement.svelte.js";
  import {
    createLaneContinuity,
    type ArrangementChange,
  } from "$lib/composables/dashboard/create-lane-continuity.svelte.js";
  import {
    createFilterDispatch,
    filterBarHandlers,
  } from "$lib/composables/create-filter-dispatch.svelte.js";
  import { dashboardFilters } from "$lib/prefs/dashboard-filters.svelte.js";
  import { openTicketsForQueue } from "$lib/shell/navigation.js";
  import {
    activityActiveCount,
    activityFilterFields,
    activityQueryFilter,
    buildActivityFilterPills,
    buildKbFilterPills,
    buildMergeFilterPills,
    emptyActivityFilter,
    emptyKbFilter,
    emptyMergeFilter,
    filterMergeCandidates,
    kbActiveCount,
    kbFilterFields,
    kbQueryFilter,
    mergeActiveCount,
    mergeFilterFields,
  } from "$lib/components/dashboard/section-filters.js";
  import { createMergeScan } from "$lib/composables/create-merge-scan.svelte.js";
  import type { TicketQuickAction } from "$lib/components/tickets/ticket-types.js";
  import { createHoldAction } from "$lib/composables/ticket-list/create-hold-action.svelte.js";
  import { createAssignFlow } from "$lib/composables/ticket-list/create-assign-flow.svelte.js";
  import { createReplyFlow } from "$lib/composables/ticket-list/create-reply-flow.svelte.js";
  import {
    buildVolunteerMap,
    resolveVolunteerName as sharedResolveVolunteerName,
    type VolunteerRecord,
  } from "$lib/tickets/resolve-volunteer.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { focusJumpTarget } from "$lib/utils/a11y.js";

  // Singletons from (app) layout context.
  const orgCache = getOrgDecryptCache();
  const ticketCache = getTicketDecryptCache();
  const previewLoader = getPreviewLoader();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const quickActions = $derived(allowedQuickActions(permissions));
  const navbarCtx = getNavbarOverrideCtx();
  const sectionRailCtx = getSectionRailCtx();
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const queryClient = useQueryClient();
  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  // --- Create menu (navbar "+" popover) ---

  interface CreateOption {
    readonly id: string;
    readonly label: string;
    readonly icon: Component;
  }

  const createOptions = $derived.by((): CreateOption[] => {
    const options: CreateOption[] = [];
    if (canCall(permissions, "tickets.create")) {
      options.push({
        id: "ticket",
        label: m.create_new_ticket(withTerms()),
        icon: TicketPlus,
      });
    }
    if (canCall(permissions, "kb.createItem")) {
      options.push({
        id: "article",
        label: m.create_new_article(),
        icon: FilePlus,
      });
    }
    if (canCall(permissions, "kb.createCategory")) {
      options.push({
        id: "category",
        label: m.create_new_category(),
        icon: FolderPlus,
      });
    }
    if (canCall(permissions, "tickets.createQueue")) {
      options.push({
        id: "queue",
        label: m.create_new_queue(withTerms()),
        icon: LayersPlus,
      });
    }
    // Fronts the inline-checked onboarding.generateInvite procedure;
    // no manifest path exists, so the inline capability map is used.
    if (canUseInline(permissions, "generateInvite")) {
      options.push({
        id: "user",
        label: m.create_invite_user(),
        icon: UserPlus,
      });
    }
    return options;
  });

  let createPopoverOpen = $state(false);
  let createButtonEl = $state<HTMLElement | undefined>(undefined);

  function handleCreateTap(e: MouseEvent): void {
    const first = createOptions[0];
    if (createOptions.length === 1 && first) {
      handleCreateOption(first.id);
      return;
    }
    const target = e.currentTarget;
    createButtonEl = target instanceof HTMLElement ? target : undefined;
    createPopoverOpen = true;
  }

  function handleCreateOption(optionId: string): void {
    createPopoverOpen = false;
    switch (optionId) {
      case "ticket":
        void goto(resolve("/tickets?action=new-ticket"));
        break;
      case "article":
        void goto(resolve("/library/new"));
        break;
      case "category":
        void goto(resolve("/library?action=manage-categories"));
        break;
      case "queue":
        void goto(resolve("/admin/people?tab=queues&action=create"));
        break;
      case "user":
        void goto(resolve("/admin/people?tab=users&action=invite"));
        break;
      default:
        break;
    }
  }

  // Navbar right-action override: "+" button with create popover.
  $effect(() => {
    const actions: NavbarAction[] =
      createOptions.length > 0
        ? [{ icon: Plus, label: m.nav_create_new(), onclick: handleCreateTap }]
        : [];
    navbarCtx.current = {
      actions,
      subnavbar: dashboardSubnavbar,
    };
    sectionRailCtx.current = {
      sections: dashboardSections,
      active: scroll.active,
      scrollTo: jumpToSection,
    };
    return () => {
      navbarCtx.current = undefined;
      sectionRailCtx.current = undefined;
    };
  });

  // --- Arrangement ---

  // How many lanes share a row comes back from the layout (the container
  // queries below); everything that behaves by arrangement reads it here.
  let dashboardEl = $state<HTMLElement | undefined>(undefined);
  let bandEl = $state<HTMLElement | undefined>(undefined);
  let lanesEl = $state<HTMLElement | undefined>(undefined);

  // Each lane's list body, the lane's scroller in board mode.
  const laneBodies = new SvelteMap<DashboardLaneId, HTMLElement>();

  const arrangement = createDashboardArrangement({
    dashboard: () => dashboardEl,
    band: () => bandEl,
    // The lanes share their rows, so any one body shows where all start.
    laneBody: () => [...laneBodies.values()].at(0),
    lanes: () => lanesEl,
    scrollContainer: () => scrollEl,
    viewMode: () => dashboardViewModeStore.mode,
  });

  // Lanes whose cap is lifted so a restored place stays in view.
  const liftedCaps = new SvelteSet<DashboardLaneId>();
  // Cards across each lane's grid view, reported by its list.
  const laneGridColumns = new SvelteMap<DashboardLaneId, number>();

  // Rows a lane shows before "See all". None in board mode, where each
  // lane scrolls and pages on its own, or once its cap is lifted.
  function laneCap(laneId: DashboardLaneId): number | undefined {
    if (arrangement.board || liftedCaps.has(laneId)) return undefined;
    return dashboardLaneCap(laneGridColumns.get(laneId) ?? 1);
  }

  function setLaneBody(
    laneId: DashboardLaneId,
    el: HTMLElement | undefined,
  ): void {
    if (el === undefined) laneBodies.delete(laneId);
    else laneBodies.set(laneId, el);
  }

  // --- Ticket lanes ---

  // One facet index for every lane: each lane counts its tickets from it
  // with the same predicate that narrows its list.
  const facetIndexQuery = createFacetIndexQuery(ticketRouter, () => true);

  const laneDeps: Omit<DashboardLaneDeps, "cap"> = {
    currentUserId: () => currentUserId,
    ticketRouter,
    facetIndex: () => facetIndexQuery.data,
    // Declared below; the lanes read it only after setup.
    isUnread: (ticketId) => listReadState.isUnread(ticketId),
    queryClient,
    openTickets,
  };

  const lanes = DASHBOARD_LANE_IDS.map((laneId) =>
    createDashboardLane(laneId, { ...laneDeps, cap: () => laneCap(laneId) }),
  );

  // Keeps the primary lane's place and focus across arrangement changes.
  // Stacked, that lane opens and shows past its cap when its place would
  // otherwise be hidden.
  function prepareArrangement(change: ArrangementChange): void {
    liftedCaps.clear();
    const laneId = change.primary;
    if (!change.stacked || laneId === null) return;
    collapsedSections.delete(laneId);
    const lane = lanes.find((l) => l.id === laneId);
    const cap = laneCap(laneId);
    if (lane === undefined || change.anchor === null || cap === undefined) {
      return;
    }
    const anchor = change.anchor;
    if (lane.items.findIndex((t) => t.id === anchor) >= cap) {
      liftedCaps.add(laneId);
    }
  }

  // A lane's header as rendered now: its toggle while stacked, its
  // heading side by side. Both hold the lane's `<id>-heading` label.
  function laneHeader(laneId: DashboardLaneId): HTMLElement | undefined {
    return (
      document
        .getElementById(`${laneId}-heading`)
        ?.closest<HTMLElement>("button, h2") ?? undefined
    );
  }

  createLaneContinuity({
    laneIds: DASHBOARD_LANE_IDS,
    lanesPerRow: () => arrangement.lanesPerRow,
    laneElement: (laneId) =>
      document.getElementById(`section-${laneId}`) ?? undefined,
    scroller: (laneId) =>
      arrangement.board ? laneBodies.get(laneId) : scrollEl,
    laneHeader,
    onArrangementChange: prepareArrangement,
  });

  // Saved lane filters load once per session; the effect re-runs when
  // the shell wires the store after login.
  $effect(() => {
    dashboardFilters.ensureHydrated();
  });

  // Every row any lane has loaded, once each. Read state, the card
  // mapper, the quick actions and the merge scan all work from this.
  const ticketById = $derived.by(() => {
    const map = new SvelteMap<string, TicketListRow>();
    for (const lane of lanes) {
      for (const t of lane.rows) map.set(t.id, t);
    }
    return map;
  });

  const laneRows = $derived([...ticketById.values()]);

  // --- Dashboard info queries ---

  // The section filters live in the encrypted dashboard filters document.
  // Activity filters apply on the server, so the list and the last-hour
  // count agree.
  const activityFilter = $derived(dashboardFilters.value.activity);
  // Section filters come straight from the document, so they are in
  // place as soon as it has loaded.
  const sectionFiltersReady = (): boolean => dashboardFilters.hydrated;
  const activityToggle = createSectionFilterToggle(
    "activity-filters",
    () => activityActiveCount(dashboardFilters.value.activity),
    sectionFiltersReady,
  );
  const activityQueryInput = $derived(activityQueryFilter(activityFilter));

  const activityQuery = createQuery(() => ({
    queryKey: ticketsKeys.recentActivity(activityQueryInput),
    queryFn: async () =>
      ticketRouter.recentActivity.query({ limit: 5, ...activityQueryInput }),
    refetchInterval: DASHBOARD_CONTEXT_REFRESH_MS,
  }));

  const queuesQuery = createQuery(() => ({
    queryKey: ticketsKeys.myQueues(),
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  const shiftQuery = createQuery(() => ({
    queryKey: ticketsKeys.dashboardInfo(),
    queryFn: async () => ticketRouter.dashboardInfo.query(),
  }));

  // Declared here rather than with the other section flags below: the
  // query options thunk reads it during setup, so a later declaration
  // leaves it in the temporal dead zone and throws.
  const showKb = $derived(canCall(permissions, "kb.listItems"));

  // The most recently updated articles under the section's filters. The
  // server's total is the heading count.
  const KB_SECTION_LIMIT = 5;
  const kbFilter = $derived(dashboardFilters.value.kb);
  const kbToggle = createSectionFilterToggle(
    "kb-filters",
    () => kbActiveCount(dashboardFilters.value.kb),
    sectionFiltersReady,
  );
  const kbQueryInput = $derived({
    sortBy: "updated_at" as const,
    sortDirection: "desc" as const,
    limit: KB_SECTION_LIMIT,
    ...kbQueryFilter(kbFilter),
  });

  const kbQuery = createQuery(() => ({
    queryKey: kbKeys.dashboardItems(kbQueryInput),
    queryFn: async () => {
      if (!trpc.kb) return null;
      return trpc.kb.listItems.query(kbQueryInput);
    },
    enabled: showKb,
    refetchInterval: DASHBOARD_CONTEXT_REFRESH_MS,
  }));

  // Filter options, fetched only while the KB filter row shows. Keys and
  // queries match the library's, so the two share one cache entry.
  const kbCategoriesQuery = createQuery(() => ({
    queryKey: kbKeys.categories(),
    queryFn: async () => {
      if (!trpc.kb) return [];
      return trpc.kb.listCategories.query();
    },
    enabled: showKb && kbToggle.shown,
  }));

  const kbAuthorsQuery = createQuery(() => ({
    queryKey: kbKeys.authors(),
    queryFn: async () => {
      if (!trpc.kb) return [];
      return trpc.kb.listAuthors.query();
    },
    staleTime: 10 * 60 * 1000,
    enabled: showKb && kbToggle.shown,
  }));

  // --- Read state (per-ticket unread for the needs-attention rule + pills) ---

  // The sweep runs here as on the Tickets surface: needs attention and the
  // unread counts reach tickets no lane has loaded, and only the sweep
  // knows those.
  const loadedTicketIds = $derived([...ticketById.keys()]);
  const readState = createReadStateQueries(ticketRouter, () => loadedTicketIds);

  const keyWrapById = $derived(
    collectKeyWraps(readState.sweepQuery.data, laneRows),
  );

  const listReadState = createListReadState({
    windowQuery: readState.windowQuery,
    sweepQuery: readState.sweepQuery,
    getKeyWrap: (ticketId) => keyWrapById.get(ticketId) ?? null,
    getUserId: () => currentUserId ?? "",
    ticketDecryptCache: ticketCache,
  });

  // --- Quick-action composables (parity with the Tickets surface) ---

  function resolveVolunteerName(userId: string): string {
    if (userId === currentUserId) return m.dashboard_assigned_you();
    const volunteers = queryClient.getQueryData<readonly VolunteerRecord[]>(
      volunteerKeys.all,
    );
    const volunteerMap = buildVolunteerMap(volunteers);
    return sharedResolveVolunteerName(userId, volunteerMap, orgCache) ?? "...";
  }

  const holdAction = createHoldAction({
    queryClient,
    holdMutate: async (ticketId, hold) =>
      ticketRouter.update.mutate({ ticketId, onHold: hold }),
  });

  const assignFlow = createAssignFlow({
    queryClient,
    assignMutate: async (ticketId, targetUserId) =>
      ticketRouter.assignTo.mutate({ ticketId, targetUserId }),
    resolveVolunteerName,
    getTickets: () => laneRows,
  });

  const replyFlow = createReplyFlow({
    queryClient,
    getTickets: () =>
      laneRows.map((t) => ({
        ...t,
        clientAlias: orgCache.decrypt(
          `client-alias:${t.clientId}`,
          t.encryptedClientAlias,
          { table: "clients", id: t.clientId },
        ),
      })),
    getPreviewFollowUps: (id) => previewLoader.get(id),
    getLatestClientType: (id) => previewLoader.getLatestClientType(id),
    eagerLoadPreviews: async (ids) => previewLoader.eagerLoad(ids),
  });

  let callSheetOpen = $state(false);

  // --- Getting Started checklist (org-identity gate, TanStack deduplicates with GettingStartedCard) ---

  const checklistQuery = createQuery(() => ({
    queryKey: ["dashboard", "setupChecklist"],
    queryFn: async () => trpc.dashboard.getSetupChecklist.query(),
    staleTime: 60_000,
    enabled: canCall(permissions, "dashboard.getSetupChecklist"),
  }));

  const showGettingStarted = $derived(
    checklistQuery.isSuccess &&
      !checklistQuery.data.dismissed &&
      checklistQuery.data.items.length > 0,
  );

  // --- Merge candidate detection (low-priority after dashboard settles) ---

  const mergeScan = createMergeScan(() => ({
    dashboardReady: lanes.every((lane) => lane.settled),
    tickets: laneRows.map((t) => ({
      id: t.id,
      clientId: t.clientId,
      keyWrap: t.keyWrap ?? null,
      intakeWrap: t.intakeWrap ?? null,
    })),
    canViewClients: canCall(permissions, "clients.mergeScanData"),
  }));

  // The section shows while any candidate is undismissed, so a filter
  // that matches none of them can still be cleared.
  const showMergeCandidates = $derived(
    canCall(permissions, "clients.mergeScanData") &&
      mergeScan.undismissed.length > 0,
  );

  const mergeFilter = $derived(dashboardFilters.value.merge);
  const mergeToggle = createSectionFilterToggle(
    "merge-candidates-filters",
    () => mergeActiveCount(dashboardFilters.value.merge),
    sectionFiltersReady,
  );
  const mergeCandidates = $derived(
    filterMergeCandidates(mergeScan.undismissed, mergeFilter),
  );

  // --- Section scroll nav ---

  // Rows a lane holds: its count once the facet index lands, its loaded
  // rows until then.
  function laneHasTickets(lane: DashboardLane): boolean {
    return (lane.count ?? lane.items.length) > 0;
  }

  // A lane that can hide when empty stays while it has active filters:
  // its filter row is where they are cleared. Lanes hide only when
  // stacked; side by side, every lane keeps its slot.
  function laneStaysShown(lane: DashboardLane): boolean {
    return (
      !arrangement.stacked ||
      laneHasTickets(lane) ||
      lane.filters.activeCount > 0
    );
  }

  const showNeedsAttention = $derived(
    lanes.some(
      (lane) =>
        lane.id === "needs-attention" && (lane.loading || laneStaysShown(lane)),
    ),
  );

  const showOnHold = $derived(
    lanes.some((lane) => lane.id === "on-hold" && laneStaysShown(lane)),
  );

  // The band's row rule counts Shift, Queues, and Activity always and KB
  // when shown. Merge candidates spans the row below and is not a tile.
  const bandTileCount = $derived(3 + (showKb ? 1 : 0));

  // Open tickets assigned to the viewer, whatever the lane's filters.
  const myOpenCount = $derived(
    lanes.find((lane) => lane.id === "my-tickets")?.baseCount ?? 0,
  );

  // Page order: the context band (getting started, then its tiles with
  // Shift first) first, then the ticket lanes in work-priority order.
  // buildDashboardSections is the single derivation for section ids, labels,
  // icons, and conditional inclusion. Both this page and the hover-reveal
  // registry call it.
  const dashboardSections = $derived(
    buildDashboardSections({
      showGettingStarted,
      showKb,
      showMergeCandidates,
      showNeedsAttention,
      showOnHold,
    }),
  );

  // Each lane renders under its entry in the section list, which carries
  // the heading and icon and leaves out a lane hidden right now.
  const laneSections = $derived(
    lanes.flatMap((lane) => {
      const section = dashboardSections.find((s) => s.id === lane.id);
      return section === undefined ? [] : [{ lane, section }];
    }),
  );

  interface HeadingCounts {
    readonly count: number | undefined;
    readonly totalCount: number | undefined;
    readonly totalCountIsFloor: boolean;
  }

  // "Shown of total" while the lane shows fewer than it holds, the bare
  // total otherwise. Nothing until the facet index lands, as on the
  // tickets page.
  function headingCounts(lane: DashboardLane): HeadingCounts {
    if (lane.count === undefined) {
      return {
        count: undefined,
        totalCount: undefined,
        totalCountIsFloor: false,
      };
    }
    // "N of total" names rows a capped lane hides behind See all. An
    // uncapped lane pages through every row, so it shows the total alone.
    const capped = laneCap(lane.id) !== undefined;
    if ((capped && lane.shownCount < lane.count) || lane.countIsFloor) {
      return {
        count: lane.shownCount,
        totalCount: lane.count,
        totalCountIsFloor: lane.countIsFloor,
      };
    }
    return {
      count: lane.count,
      totalCount: undefined,
      totalCountIsFloor: false,
    };
  }

  const scroll = createSectionScroll(() => dashboardSections);

  // A jump made before the board engaged may have added room below the
  // content; on the board that room would let the page scroll.
  $effect(() => {
    if (arrangement.board) scroll.releaseScrollRoom();
  });

  // The rail's and the subnavbar's jump. On the board the page does not
  // scroll, so a jump focuses its target instead: a lane's heading, or a
  // band section, expanded first as a scrolled-to one is. Side by side,
  // lanes do not collapse, so only stacked ones expand first.
  function jumpToSection(id: string): void {
    const lane = lanes.find((l) => l.id === id);
    if (arrangement.board) {
      if (lane === undefined) {
        collapsedSections.delete(id);
        scroll.focus(id);
        return;
      }
      scroll.activate(id);
      const header = laneHeader(lane.id);
      if (header !== undefined) focusJumpTarget(header);
      return;
    }
    if (lane !== undefined && !arrangement.stacked) {
      scroll.scrollTo(id);
      return;
    }
    void scroll.expandAndScroll(id, () => collapsedSections.delete(id));
  }

  // --- Meta-section derived props (unchanged; owned by their sections) ---

  // Only ticket rows carry an alias; outside-queue rows name the queue alone
  // and org rows carry no ciphertext at all.
  const activityProps = $derived(
    (activityQuery.data?.entries ?? []).map((a) => {
      switch (a.kind) {
        case "ticket":
          return {
            ...a,
            clientAlias: orgCache.decrypt(
              `client-alias:${a.clientId}`,
              a.encryptedClientAlias,
              { table: "clients", id: a.clientId },
            ),
            queueName: orgCache.decrypt(
              `queue:${a.queueId}`,
              a.encryptedQueueName,
              { table: "queues", id: a.queueId },
            ),
          };
        case "ticket_outside_queues":
          return {
            ...a,
            queueName: orgCache.decrypt(
              `queue:${a.queueId}`,
              a.encryptedQueueName,
              { table: "queues", id: a.queueId },
            ),
          };
        case "org":
          return a;
      }
    }),
  );

  const kbProps = $derived(
    (kbQuery.data?.items ?? []).map((item) => ({
      ...item,
      decryptedTitle:
        orgCache.decrypt(`kb:${item.id}`, item.encryptedTitle, {
          table: "kb_items",
          id: item.id,
        }) ?? undefined,
    })),
  );

  const queueProps = $derived(
    (queuesQuery.data ?? []).map((q) => ({
      id: q.id,
      name: orgCache.decrypt(`queue:${q.id}`, q.encryptedName, {
        table: "queues",
        id: q.id,
      }),
      openCount: Number(q.openCount),
      urgentCount: Number(q.urgentCount),
      appearance: decryptQueueAppearance(orgCache, q),
    })),
  );

  const queueAppearanceById = $derived.by(() => {
    const map = new SvelteMap<string, QueueAppearance>();
    for (const q of queuesQuery.data ?? []) {
      map.set(q.id, decryptQueueAppearance(orgCache, q));
    }
    return map;
  });

  // --- Ticket card props (shared mapper, one contract with the Tickets page) ---

  // Reaction summaries are display-only in previews; the Tickets surface owns
  // their hydration. An empty map keeps the preview reaction slot inert here.
  const previewReactionsMap = new SvelteMap<string, ReactionSummary[]>();

  // The mapper hands its decrypt hooks widened `unknown` ciphertext; re-derive
  // the typed org-cache inputs from the loaded rows, keyed the same way the
  // mapper keys them, so the cache calls stay type-safe without a cast.
  const orgCipherByKey = $derived.by(() => {
    const map = new SvelteMap<string, string | null>();
    for (const t of laneRows) {
      map.set(`queue:${t.queueId}`, t.encryptedQueueName);
      map.set(`client-alias:${t.clientId}`, t.encryptedClientAlias);
      if (t.assignedTo !== null) {
        map.set(`assignee:${t.assignedTo}`, t.assignedDisplayName);
      }
    }
    return map;
  });

  const cardMapper = $derived(
    createCardPropsMapper({
      orgDecrypt: (cacheKey, _ciphertext, origin) =>
        orgCache.decrypt(
          cacheKey,
          orgCipherByKey.get(cacheKey) ?? null,
          origin,
        ),
      queueAppearance: (queueId) => queueAppearanceById.get(queueId),
      decryptTitle: (ticketId) => {
        const t = ticketById.get(ticketId);
        return t
          ? ticketCache.decryptTitle(
              t.id,
              t.keyWrap,
              t.encryptedTitle,
              t.intakeWrap,
            )
          : undefined;
      },
      currentUserId: currentUserId ?? "",
      unreadCount: (ticketId) => listReadState.unreadCount(ticketId),
      unreadCountIsFloor: (ticketId) =>
        listReadState.unreadCountIsFloor(ticketId),
      getPreview: (ticketId) => previewLoader.get(ticketId),
      previewReactionsMap,
      ontap: handleTicketTap,
      onaction: handleAction,
      allowedActions: quickActions,
      onencryptedhelp: showEncryptedHelp,
    }),
  );

  // --- Collapsible section state (all expanded except unassigned/on-hold) ---
  const collapsedSections = new SvelteSet<string>(["unassigned", "on-hold"]);

  /**
   * A section whose body is hidden. Side by side, lanes do not collapse,
   * so a lane id left in the set from the stacked layout does not count.
   */
  function sectionCollapsed(id: string, collapsible: boolean): boolean {
    return collapsible && collapsedSections.has(id);
  }

  function toggleSection(id: string): void {
    if (collapsedSections.has(id)) {
      collapsedSections.delete(id);
    } else {
      collapsedSections.add(id);
    }
  }

  // Navigation handlers (route file owns navigation per code standards).
  // A ticket opened from the dashboard opens expanded: the flag keeps a
  // desktop from folding it into the tickets page's split view, and a
  // phone shows the detail full page either way.
  function handleTicketTap(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}?full=1`));
  }

  function openTickets(): void {
    void goto(resolve("/tickets"));
  }

  // The queue travels as tickets-page filter state, never in the URL: the
  // same path the sidebar's queue shortcut takes.
  function handleQueueTap(queueId: string): void {
    openTicketsForQueue(queueId);
  }

  function showEncryptedHelp(): void {
    toastStore.show(m.dashboard_encrypted_help(withTerms()), 5000);
  }

  function handleKBTap(itemId: string): void {
    void goto(resolve(`/library/${itemId}`));
  }

  // --- Quick-action dispatch (thin delegation, mirrors the Tickets page) ---

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
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: ticketsKeys.facetIndex(),
      });
    } catch (err: unknown) {
      console.error("[dashboard] take failed", err);
      toastStore.show(getErrorMessage(err), 3000);
    }
  }

  function handleCallAction(action: CallAction): void {
    callSheetOpen = false;
    if (action === "cancel") return;
    toastStore.show(m.feature_coming_soon());
  }

  function resolveClientAlias(clientId: string): string | null {
    const ticket = laneRows.find((t) => t.clientId === clientId);
    if (!ticket) return null;
    return orgCache.decrypt(
      `client-alias:${clientId}`,
      ticket.encryptedClientAlias,
      { table: "clients", id: clientId },
    );
  }

  function handleMergeReview(clientIdA: string, clientIdB: string): void {
    void goto(
      resolve(
        `/admin/people?tab=clients&action=merge&clientA=${encodeURIComponent(clientIdA)}&clientB=${encodeURIComponent(clientIdB)}`,
      ),
    );
  }

  function handleMergeDismiss(clientIdA: string, clientIdB: string): void {
    mergeScan.dismiss(clientIdA, clientIdB);
  }

  function handleSharedLine(matchHash: string): void {
    mergeScan.markSharedLine(matchHash);
  }

  // --- Section filters ---

  // Queue options for the ticket and activity filter pills: the queue
  // list the tickets page's queue pill uses.
  const queueFilterOptions = $derived(
    queueProps.map((q) => ({ id: q.id, name: q.name })),
  );

  function laneFilterConfig(
    lane: DashboardLane,
    section: string,
  ): FilterPillsConfig {
    const dispatch = createFilterDispatch({
      fields: ticketFilterFields(lane.filters),
      clearAll: () => lane.filters.clearAll(),
    });
    return {
      pills: buildTicketFilterPills({
        filters: lane.filters,
        facets: lane.facets,
        facetsComplete: !lane.countIsFloor,
        unreadCountReady: listReadState.sweepSettled(),
        queues: queueFilterOptions,
        queuesLoading: queuesQuery.isLoading,
        currentUserId,
        hidden: lane.hiddenPills,
      }),
      activeCount: lane.filters.activeCount,
      filterLabel: m.dashboard_section_filter({ section }),
      ...ticketDatePillProps(lane.filters),
      ...filterBarHandlers(dispatch),
    };
  }

  const activityDispatch = createFilterDispatch({
    fields: activityFilterFields({
      get: () => dashboardFilters.value.activity,
      set: (filter) => dashboardFilters.setActivity(filter),
    }),
    clearAll: () => dashboardFilters.setActivity(emptyActivityFilter()),
  });

  const activityFilterConfig: FilterPillsConfig = $derived({
    pills: buildActivityFilterPills(
      activityFilter,
      queueFilterOptions,
      queuesQuery.isLoading,
    ),
    activeCount: activityActiveCount(activityFilter),
    filterLabel: m.dashboard_section_filter({
      section: m.dashboard_activity_heading(),
    }),
    ...filterBarHandlers(activityDispatch),
  });

  const kbDispatch = createFilterDispatch({
    fields: kbFilterFields({
      get: () => dashboardFilters.value.kb,
      set: (filter) => dashboardFilters.setKb(filter),
    }),
    clearAll: () => dashboardFilters.setKb(emptyKbFilter()),
  });

  const kbCategoryOptions = $derived(
    (kbCategoriesQuery.data ?? []).map((c) => ({
      id: c.id,
      name: orgCache.decrypt(`kb-cat:${c.id}`, c.encryptedName),
    })),
  );

  const kbAuthorOptions = $derived(
    (kbAuthorsQuery.data ?? []).map((a) => ({
      id: a.id,
      name: orgCache.decrypt(`volunteer:${a.id}`, a.encryptedDisplayName),
    })),
  );

  const kbFilterConfig: FilterPillsConfig = $derived({
    pills: buildKbFilterPills(
      kbFilter,
      kbCategoryOptions,
      kbCategoriesQuery.isLoading,
      kbAuthorOptions,
    ),
    activeCount: kbActiveCount(kbFilter),
    filterLabel: m.dashboard_section_filter({
      section: m.dashboard_kb_heading(withTerms()),
    }),
    ...filterBarHandlers(kbDispatch),
  });

  const mergeDispatch = createFilterDispatch({
    fields: mergeFilterFields({
      get: () => dashboardFilters.value.merge,
      set: (filter) => dashboardFilters.setMerge(filter),
    }),
    clearAll: () => dashboardFilters.setMerge(emptyMergeFilter()),
  });

  const mergeFilterConfig: FilterPillsConfig = $derived({
    pills: buildMergeFilterPills(mergeFilter),
    activeCount: mergeActiveCount(mergeFilter),
    filterLabel: m.dashboard_section_filter({
      section: m.mergeCandidates_heading(),
    }),
    ...filterBarHandlers(mergeDispatch),
  });

  // --- Apply to all ---

  // The lane whose "Apply to all" waits on the replace confirmation, and
  // how many lanes it would overwrite.
  let applyToAllSourceId = $state<DashboardLaneId | null>(null);
  let applyToAllOverwriting = $state(0);

  function applyToAllTargets(source: DashboardLane): ApplyToAllTarget[] {
    return lanes
      .filter((lane) => lane.id !== source.id)
      .map((lane) => ({
        id: lane.id,
        hiddenPills: lane.hiddenPills,
        current: lane.userFilters(),
      }));
  }

  function commitApplyToAll(plan: ApplyToAllPlan): void {
    for (const update of plan.updates) {
      const target = lanes.find((lane) => lane.id === update.id);
      target?.applyUserFilters(update.state);
    }
    toastStore.show(m.dashboard_apply_to_all_done());
  }

  function requestApplyToAll(source: DashboardLane): void {
    const plan = planApplyToAll(
      source.userFilters(),
      applyToAllTargets(source),
    );
    if (plan.overwriting > 0) {
      applyToAllOverwriting = plan.overwriting;
      applyToAllSourceId = source.id;
      return;
    }
    commitApplyToAll(plan);
  }

  function confirmApplyToAll(): void {
    const source = lanes.find((lane) => lane.id === applyToAllSourceId);
    applyToAllSourceId = null;
    if (source === undefined) return;
    commitApplyToAll(
      planApplyToAll(source.userFilters(), applyToAllTargets(source)),
    );
  }

  // Login summary notification slot (6k provides content).
  let exposureNotificationVisible = $state(false);

  function dismissExposureNotification(): void {
    exposureNotificationVisible = false;
  }
</script>

<!-- A collapsed section hides its filter row with its body, so the
     button reads as closed there; pressing it opens the section with its
     filters showing. -->
{#snippet sectionFilterButton(
  toggle: SectionFilterToggle,
  section: string,
  activeCount: number,
  sectionId: string,
  collapsible: boolean,
)}
  {@const collapsed = sectionCollapsed(sectionId, collapsible)}
  <SectionFilterButton
    {section}
    {activeCount}
    expanded={toggle.shown && !collapsed}
    controls={toggle.rowId}
    ontoggle={() => {
      if (collapsed) {
        toggleSection(sectionId);
        if (!toggle.shown) toggle.toggle();
        return;
      }
      toggle.toggle();
    }}
  />
{/snippet}

<!-- One filter row for every section. A ticket lane with active filters
     leads its row with "Apply to all". The row's config is built only
     while the row shows. -->
{#snippet sectionFilterRow(
  toggle: SectionFilterToggle,
  config: FilterPillsConfig,
  lane: DashboardLane | undefined,
)}
  {#if toggle.shown}
    {@const bar = config}
    {#snippet applyToAll()}
      {#if lane !== undefined}
        <Button
          clear
          small
          inline
          aria-label={m.dashboard_apply_to_all_label(withTerms())}
          onclick={() => requestApplyToAll(lane)}
        >
          {m.dashboard_apply_to_all()}
        </Button>
      {/if}
    {/snippet}
    <div id={toggle.rowId} class="section-filter-row">
      <FilterPillBar
        {...bar}
        leading={lane !== undefined && bar.activeCount > 0
          ? applyToAll
          : undefined}
      />
    </div>
  {/if}
{/snippet}

{#snippet dashboardSubnavbar()}
  <!-- Mirrors the tickets-page subnavbar anatomy (SubNavbarFilterLayout):
       large page title + switcher header row, then the scroll row where
       tickets renders its filter row. -->
  <section class="overview-subnavbar" aria-label={m.nav_home()}>
    <div class="overview-page-header">
      <BlockTitle large class="overview-page-title heading-compact"
        >{m.nav_home()}</BlockTitle
      >
      <ViewSwitcher
        mode={dashboardViewModeStore.mode}
        onchange={(mode: ViewMode) => dashboardViewModeStore.set(mode)}
      />
    </div>
    <SectionScrollNav
      sections={dashboardSections}
      active={scroll.active}
      onscroll={jumpToSection}
      ariaLabel={m.nav_home()}
    />
  </section>
{/snippet}

<!-- The dashboard is a size container: the band and the lanes lay out by
     its width, never the viewport's, so a split pane or a deck column
     gets the arrangement its own width allows. -->
<div
  bind:this={dashboardEl}
  class="dashboard"
  data-board={arrangement.board || undefined}
  style:height={arrangement.boardHeight === undefined
    ? undefined
    : `${String(arrangement.boardHeight)}px`}
>
  <h1 class="sr-only">{m.nav_home()}</h1>
  <Notification
    role="alert"
    opened={exposureNotificationVisible}
    title={m.dashboard_exposure_title()}
    subtitle={m.dashboard_exposure_subtitle()}
    onClose={dismissExposureNotification}
  />

  <!-- Context band: getting started full width, then the tiles (Shift
       first), then merge candidates across the full row below them. -->
  <div bind:this={bandEl} class="band">
    {#if showGettingStarted}
      <div id="section-getting-started" class="scroll-target">
        <GettingStartedCard
          expanded={!collapsedSections.has("getting-started")}
          ontoggle={() => toggleSection("getting-started")}
          onnavigate={(path: string) => {
            // eslint-disable-next-line svelte/no-navigation-without-resolve -- checklist hrefs are hardcoded valid routes
            void goto(path);
          }}
        />
      </div>
    {/if}

    <div class="band-tiles" data-tiles={bandTileCount}>
      <div id="section-shift" class="scroll-target">
        <ShiftSection
          shift={shiftQuery.data?.shift ?? null}
          loading={shiftQuery.isLoading}
          {myOpenCount}
          expanded={!collapsedSections.has("shift")}
          ontoggle={() => toggleSection("shift")}
        />
      </div>
      <div id="section-queues" class="scroll-target">
        <QueueCards
          queues={queueProps}
          loading={queuesQuery.isLoading}
          expanded={!collapsedSections.has("queues")}
          ontoggle={() => toggleSection("queues")}
          ontap={handleQueueTap}
        />
      </div>
      <div id="section-activity" class="scroll-target">
        <ActivitySection
          activity={activityProps}
          lastHourCount={activityQuery.data?.lastHourCount ?? 0}
          loading={activityQuery.isLoading}
          expanded={!collapsedSections.has("activity")}
          ontoggle={() => toggleSection("activity")}
          ontap={handleTicketTap}
        >
          {#snippet headerAction()}
            {@render sectionFilterButton(
              activityToggle,
              m.dashboard_activity_heading(),
              activityFilterConfig.activeCount,
              "activity",
              true,
            )}
          {/snippet}
          {#snippet filterRow()}
            {@render sectionFilterRow(
              activityToggle,
              activityFilterConfig,
              undefined,
            )}
          {/snippet}
        </ActivitySection>
      </div>

      {#if showKb}
        <div id="section-kb" class="scroll-target">
          <KBSection
            kbItems={kbProps}
            total={kbQuery.data?.total}
            loading={kbQuery.isLoading}
            expanded={!collapsedSections.has("kb")}
            ontoggle={() => toggleSection("kb")}
            ontap={handleKBTap}
          >
            {#snippet headerAction()}
              {@render sectionFilterButton(
                kbToggle,
                m.dashboard_kb_heading(withTerms()),
                kbFilterConfig.activeCount,
                "kb",
                true,
              )}
            {/snippet}
            {#snippet filterRow()}
              {@render sectionFilterRow(kbToggle, kbFilterConfig, undefined)}
            {/snippet}
          </KBSection>
        </div>
      {/if}

      {#if showMergeCandidates}
        <div id="section-merge-candidates" class="scroll-target band-wide">
          <MergeCandidatesSection
            candidates={mergeCandidates}
            expanded={!collapsedSections.has("merge-candidates")}
            ontoggle={() => toggleSection("merge-candidates")}
            resolveAlias={resolveClientAlias}
            ondismiss={handleMergeDismiss}
            onreview={handleMergeReview}
            truncated={mergeScan.truncated}
            onsharedline={handleSharedLine}
          >
            {#snippet headerAction()}
              {@render sectionFilterButton(
                mergeToggle,
                m.mergeCandidates_heading(),
                mergeFilterConfig.activeCount,
                "merge-candidates",
                true,
              )}
            {/snippet}
            {#snippet filterRow()}
              {@render sectionFilterRow(
                mergeToggle,
                mergeFilterConfig,
                undefined,
              )}
            {/snippet}
          </MergeCandidatesSection>
        </div>
      {/if}
    </div>
  </div>

  <!-- Ticket lanes in work-priority order, row-major. The DOM is the same
       in every arrangement: only attributes and props change, so focus
       and scroll survive a resize or a fold. -->
  <div
    bind:this={lanesEl}
    class="lanes"
    data-view-mode={dashboardViewModeStore.mode}
  >
    {#each laneSections as { lane, section } (lane.id)}
      {@const heading = headingCounts(lane)}
      <div
        id="section-{lane.id}"
        class="scroll-target lane"
        data-lane={lane.id}
      >
        <CollapsibleSection
          id={lane.id}
          heading={section.label()}
          count={heading.count}
          totalCount={heading.totalCount}
          totalCountIsFloor={heading.totalCountIsFloor}
          loading={lane.loading}
          icon={section.icon}
          iconColor="var(--brand-accent)"
          collapsible={arrangement.stacked}
          expanded={!collapsedSections.has(lane.id)}
          ontoggle={() => toggleSection(lane.id)}
        >
          {#snippet headerAction()}
            {@render sectionFilterButton(
              lane.filterToggle,
              section.label(),
              lane.filters.activeCount,
              lane.id,
              arrangement.stacked,
            )}
          {/snippet}
          {#snippet filterRow()}
            {@render sectionFilterRow(
              lane.filterToggle,
              laneFilterConfig(lane, section.label()),
              lane,
            )}
          {/snippet}
          <TicketPreviewList
            loading={lane.loading}
            tickets={lane.items}
            mapper={cardMapper}
            idPrefix="ticket-{lane.id}"
            ontap={handleTicketTap}
            viewMode={dashboardViewModeStore.mode}
            maxVisible={laneCap(lane.id) ?? null}
            totalCount={lane.count}
            countIsFloor={lane.countIsFloor}
            scrollContainer={scrollEl}
            scrollRegionLabelledBy={arrangement.board
              ? `${lane.id}-heading`
              : undefined}
            bind:gridColumns={
              () => laneGridColumns.get(lane.id) ?? 1,
              (columns: number) => laneGridColumns.set(lane.id, columns)
            }
            bind:bodyElement={
              () => laneBodies.get(lane.id),
              (el: HTMLElement | undefined) => setLaneBody(lane.id, el)
            }
            error={lane.error}
            onretry={() => lane.retry()}
            onloadmore={() => lane.loadMore()}
            onseeall={() => lane.seeAll()}
          />
        </CollapsibleSection>
      </div>
    {/each}
  </div>
</div>

<ShellPopover
  opened={createPopoverOpen}
  target={createButtonEl}
  placement="bottom"
  ariaLabel={m.nav_create_new()}
  ondismiss={() => (createPopoverOpen = false)}
>
  <List nested>
    {#each createOptions as option (option.id)}
      {@const Icon = option.icon}
      <ListItem
        title={option.label}
        onclick={() => handleCreateOption(option.id)}
      >
        {#snippet media()}
          <Icon size={20} aria-hidden="true" />
        {/snippet}
      </ListItem>
    {/each}
  </List>
</ShellPopover>

<AssignSheet
  opened={assignFlow.sheetOpen}
  ticketId={assignFlow.targetTicketId}
  currentAssigneeId={assignFlow.currentAssigneeId}
  ondismiss={() => assignFlow.dismiss()}
  onassign={(tid: string, uid: string | null) =>
    void assignFlow.handleAssign(tid, uid)}
/>

<ReplySheet
  opened={replyFlow.sheetOpen}
  ticketId={replyFlow.targetTicketId}
  clientAlias={replyFlow.clientAlias}
  hasPhone={replyFlow.hasPhone}
  clientPublic={replyFlow.clientPublic}
  previewFollowUps={replyFlow.previewFollowUps}
  followUpCount={replyFlow.followUpCount}
  latestClientType={replyFlow.latestClientType}
  ondismiss={() => replyFlow.dismiss()}
  onsent={(tid: string) => replyFlow.handleReplySent(tid)}
/>

<ShellActionSheet
  opened={callSheetOpen}
  ondismiss={() => {
    callSheetOpen = false;
  }}
  ariaLabel={m.ticket_call_options()}
>
  <CallOptionsContent hasVerifiedPhone={false} onaction={handleCallAction} />
</ShellActionSheet>

<ShellDialog
  opened={applyToAllSourceId !== null}
  ondismiss={() => (applyToAllSourceId = null)}
  title={m.dashboard_apply_to_all_confirm_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {applyToAllOverwriting === 1
        ? m.dashboard_apply_to_all_confirm_body_one()
        : m.dashboard_apply_to_all_confirm_body_other({
            count: applyToAllOverwriting,
          })}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (applyToAllSourceId = null)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmApplyToAll}
    >
      {m.dashboard_apply_to_all_confirm()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .overview-subnavbar {
    display: flex;
    flex-direction: column;
    padding-top: 0.25rem;
  }

  .overview-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: 0 var(--page-pad-x);
  }

  .overview-subnavbar :global(.overview-page-title) {
    margin: 0 !important;
    padding-left: 0 !important;
  }

  /* The dashboard owns the page inset. Its padding sits outside the
     container's content box, so the breakpoints below compare lane and
     tile widths alone: N x minimum + (N - 1) x the 24px gap. */
  .dashboard {
    container: dashboard / inline-size;
    box-sizing: border-box;
    width: 100%;
    /* The dashboard uses every pixel it is given (a wider window or a
       zoomed-out page adds lanes and grid columns), so it overrides the
       shell's reading-width cap on page roots. */
    max-width: none;
    margin-inline: auto;
    padding: 0.25rem var(--page-pad-x) 1rem;
  }

  .scroll-target {
    scroll-margin-top: 7rem;
  }

  .section-filter-row {
    padding: 0 var(--section-inset, var(--page-pad-x)) var(--space-md);
  }

  /* ── Stacked (one lane or tile per row) ──
     Today's mobile layout. The band and the lanes run to the dashboard's
     edges and each section keeps the page inset itself
     (--section-inset unset falls back to --page-pad-x). */
  .band,
  .lanes {
    margin-inline: calc(-1 * var(--page-pad-x));
  }

  /* Band tiles and lanes share the 24px gap the breakpoints are derived
     from. Container conditions cannot read var(), so the value is a
     literal here and in every derivation below. Rows are spaced by each
     section's own top padding. */
  .band-tiles,
  .lanes {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    column-gap: 24px;
    row-gap: 0;
  }

  /* Side by side, each lane spans four rows of the lanes grid (header,
     filter row, body, footer) and passes them down, so those parts line
     up across a row; a lane with no open filter row leaves that track
     empty. The lane queries below switch this on by setting the
     --lane-* properties. Stacked lanes stay plain blocks: a subgrid
     ignores the height the collapse animation sets. */
  .lane {
    grid-row: var(--lane-span, auto);
    display: var(--lane-display, block);
    grid-template-rows: var(--lane-rows, none);
    min-width: 0;
  }

  .lane > :global(.collapsible-section) {
    grid-row: 1 / -1;
    display: var(--lane-display, block);
    grid-template-rows: var(--lane-rows, none);
    min-width: 0;
  }

  .lane :global(.section-header) {
    grid-row: 1;
  }

  .lane :global(.section-filter-row) {
    grid-row: 2;
  }

  /* Body and footer ("See all") of the lane's list. */
  .lane :global(.section-content) {
    grid-row: 3 / span 2;
    display: var(--lane-display, block);
    grid-template-rows: var(--lane-rows, none);
    min-width: 0;
  }

  /* ── Board: all four lanes in one row, the page does not scroll ──
     The dashboard takes its scroller's height (set inline from the
     arrangement), the band keeps its own, and the lanes fill the rest.
     Each lane's body scrolls on its own. */
  .dashboard[data-board] {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dashboard[data-board] .band {
    flex: none;
  }

  /* A classic scrollbar that comes and goes with the page's overflow
     changes the dashboard's width, and with it the lanes' column count,
     which can move the overflow back. The dashboard's scroller keeps its
     gutter reserved instead. Overlay scrollbars take no space and the
     property does not affect them (MDN, scrollbar-gutter). Scoped to the
     dashboard: split views and non-scrolling pages would show the
     reserved gutter as an empty strip. */
  :global(.main-content):has(> .dashboard) {
    scrollbar-gutter: stable;
  }

  .dashboard[data-board] .lanes {
    flex: 1 1 0;
    min-height: 0;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
  }

  /* ── Band tiles: 1, 2 across, or 4 across ──
     The tiles are Shift (first), Queues, Activity, and the knowledge base
     when shown. Balanced rule: four tiles lay out 4 across or 2 x 2;
     three lay out 2 + 1 with the lone tile in the left half; never 3
     across. Minimum tile width 300px. A pinned-items tile joins these
     tiles as one more grid item; it needs no slot of its own. Merge
     candidates is not a tile. It spans the full row below them. */

  .band-wide {
    grid-column: 1 / -1;
  }

  /* 2 across: 2 x 300 + 1 x 24 = 624. */
  @container dashboard (min-width: 624px) {
    .band {
      margin-inline: 0;
      --section-inset: 0;
    }

    .band-tiles {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    /* Unfolded landscape (Duo): the two columns meet at the crease. A
       lone tile takes one half. */
    :global([data-pose="unfoldedLandscape"]) .band-tiles {
      column-gap: var(--grid-center-gap, 48px);
      grid-template-columns:
        calc(50vw - var(--page-pad-x) - var(--grid-center-gap, 48px) / 2)
        minmax(0, 1fr);
    }
  }

  /* 4 across, only with four tiles: 4 x 300 + 3 x 24 = 1272. */
  @container dashboard (min-width: 1272px) {
    .band-tiles[data-tiles="4"] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /* ── Lanes by view mode ──
     A lane needs 300px in list and cards, 520px in grid, 640px in table.
     Four lanes lay out 4 across, 2 x 2, or stacked; never 3 across. Side
     by side, the lanes grid owns the inset, sections drop theirs, and the
     lanes turn on their subgrid. In unfolded landscape a two-lane row
     meets the crease, as the band does. */

  /* List and cards, 2 across: 2 x 300 + 1 x 24 = 624. */
  @container dashboard (min-width: 624px) {
    .lanes[data-view-mode="list"],
    .lanes[data-view-mode="cards"] {
      margin-inline: 0;
      --section-inset: 0;
      --lane-span: span 4;
      --lane-display: grid;
      --lane-rows: subgrid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  /* The crease rule for list and cards covers the two-across range only;
     four across is already an even row. */
  @container dashboard (624px <= width < 1272px) {
    :global([data-pose="unfoldedLandscape"]) .lanes[data-view-mode="list"],
    :global([data-pose="unfoldedLandscape"]) .lanes[data-view-mode="cards"] {
      column-gap: var(--grid-center-gap, 48px);
      grid-template-columns:
        calc(50vw - var(--page-pad-x) - var(--grid-center-gap, 48px) / 2)
        minmax(0, 1fr);
    }
  }

  /* List and cards, 4 across: 4 x 300 + 3 x 24 = 1272. */
  @container dashboard (min-width: 1272px) {
    .lanes[data-view-mode="list"],
    .lanes[data-view-mode="cards"] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /* Grid, 2 across: 2 x 520 + 1 x 24 = 1064. */
  @container dashboard (min-width: 1064px) {
    .lanes[data-view-mode="grid"] {
      margin-inline: 0;
      --section-inset: 0;
      --lane-span: span 4;
      --lane-display: grid;
      --lane-rows: subgrid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    :global([data-pose="unfoldedLandscape"]) .lanes[data-view-mode="grid"] {
      column-gap: var(--grid-center-gap, 48px);
      grid-template-columns:
        calc(50vw - var(--page-pad-x) - var(--grid-center-gap, 48px) / 2)
        minmax(0, 1fr);
    }
  }

  /* Grid, 4 across: 4 x 520 + 3 x 24 = 2152. */
  @container dashboard (min-width: 2152px) {
    .lanes[data-view-mode="grid"] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /* Table, 2 across: 2 x 640 + 1 x 24 = 1304. */
  @container dashboard (min-width: 1304px) {
    .lanes[data-view-mode="table"] {
      margin-inline: 0;
      --section-inset: 0;
      --lane-span: span 4;
      --lane-display: grid;
      --lane-rows: subgrid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    :global([data-pose="unfoldedLandscape"]) .lanes[data-view-mode="table"] {
      column-gap: var(--grid-center-gap, 48px);
      grid-template-columns:
        calc(50vw - var(--page-pad-x) - var(--grid-center-gap, 48px) / 2)
        minmax(0, 1fr);
    }
  }

  /* Table, 4 across: 4 x 640 + 3 x 24 = 2632. */
  @container dashboard (min-width: 2632px) {
    .lanes[data-view-mode="table"] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
