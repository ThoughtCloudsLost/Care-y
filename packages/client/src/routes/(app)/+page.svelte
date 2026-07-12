<script lang="ts">
  import { SvelteSet, SvelteMap } from "svelte/reactivity";
  import {
    createQuery,
    createInfiniteQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Notification, List, ListItem, BlockTitle } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { trpc } from "$lib/trpc/index.js";
  import { ticketsKeys, kbKeys, volunteerKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    Ticket as TicketIcon,
    TicketMinus,
    TicketPlus,
    FilePlus,
    LayersPlus,
    FolderPlus,
    UserPlus,
    Plus,
    CalendarDays,
    Activity,
    BookOpen,
    Layers,
    Rocket,
  } from "@lucide/svelte";
  import TicketPreviewList from "$lib/components/dashboard/TicketPreviewList.svelte";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import ShiftSection from "$lib/components/dashboard/ShiftSection.svelte";
  import GettingStartedCard from "$lib/components/dashboard/GettingStartedCard.svelte";
  import QueueCards from "$lib/components/dashboard/QueueCards.svelte";
  import ActivitySection from "$lib/components/dashboard/ActivitySection.svelte";
  import KBSection from "$lib/components/dashboard/KBSection.svelte";
  import TicketAlert from "$lib/components/icons/TicketAlert.svelte";
  import TicketPause from "$lib/components/icons/TicketPause.svelte";
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
  import { Permission } from "@care-y/shared";
  import type { ReactionSummary } from "@care-y/shared";
  import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import type { NavbarAction } from "$lib/shell/types";
  import { bucketTickets } from "$lib/components/dashboard/filters.js";
  import {
    createSectionScroll,
    type ScrollSection,
  } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import { dashboardViewModeStore } from "$lib/stores/view-mode.svelte.js";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
  import { createCardPropsMapper } from "$lib/tickets/ticket-card-props.js";
  import {
    createListReadState,
    fetchReadStateWindow,
    fetchSweepToExhaustion,
  } from "$lib/tickets/create-list-read-state.svelte.js";
  import { isCryptoKeyed } from "$lib/crypto/crypto-keyed.svelte.js";
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

  // Singletons from (app) layout context.
  const orgCache = getOrgDecryptCache();
  const ticketCache = getTicketDecryptCache();
  const previewLoader = getPreviewLoader();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const navbarCtx = getNavbarOverrideCtx();
  const queryClient = useQueryClient();
  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  // --- Create menu (navbar "+" popover) ---

  interface CreateOption {
    readonly id: string;
    readonly label: string;
    readonly icon: typeof TicketPlus;
  }

  const createOptions = $derived.by((): CreateOption[] => {
    const options: CreateOption[] = [
      {
        id: "ticket",
        label: m.create_new_ticket(withTerms()),
        icon: TicketPlus,
      },
    ];
    if (permissions.has(Permission.EDIT_KNOWLEDGE_BASE)) {
      options.push({
        id: "article",
        label: m.create_new_article(),
        icon: FilePlus,
      });
    }
    if (permissions.has(Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES)) {
      options.push({
        id: "category",
        label: m.create_new_category(),
        icon: FolderPlus,
      });
    }
    if (permissions.has(Permission.MANAGE_QUEUES)) {
      options.push({
        id: "queue",
        label: m.create_new_queue(withTerms()),
        icon: LayersPlus,
      });
    }
    if (permissions.has(Permission.MANAGE_USERS)) {
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
    const createAction: NavbarAction = {
      icon: Plus,
      label: m.nav_create_new(),
      onclick: handleCreateTap,
    };
    navbarCtx.current = {
      actions: [createAction],
      subnavbar: dashboardSubnavbar,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // All open tickets for the current user's accessible queues. A single-page
  // infinite query so the shared quick-action composables operate on the same
  // {pages} cache shape they use on the Tickets surface (their optimistic
  // updates map over pages); the dashboard never fetches a second page.
  const ticketsQuery = createInfiniteQuery(() => ({
    queryKey: ticketsKeys.list({ statuses: ["open"] }),
    queryFn: async () =>
      ticketRouter.list.query({ statuses: ["open"], limit: 100 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
  }));

  const allTickets = $derived(ticketsQuery.data?.pages.flat() ?? []);
  type Ticket = (typeof allTickets)[number];

  // --- Dashboard info queries ---

  const activityQuery = createQuery(() => ({
    queryKey: ticketsKeys.recentActivity(),
    queryFn: async () => ticketRouter.recentActivity.query({ limit: 5 }),
  }));

  const queuesQuery = createQuery(() => ({
    queryKey: ticketsKeys.myQueues(),
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  const shiftQuery = createQuery(() => ({
    queryKey: ticketsKeys.dashboardInfo(),
    queryFn: async () => ticketRouter.dashboardInfo.query(),
  }));

  const kbQuery = createQuery(() => ({
    queryKey: kbKeys.recentItems(),
    queryFn: async () => {
      if (!trpc.kb) return [];
      return trpc.kb.recentItems.query({ limit: 2 });
    },
  }));

  const countsQuery = createQuery(() => ({
    queryKey: ticketsKeys.counts(),
    queryFn: async () => ticketRouter.counts.query(),
  }));

  // --- Read state (per-ticket unread for the needs-attention arm + pills) ---

  const loadedTicketIds = $derived(allTickets.map((t) => t.id));

  // The sweep is created on the shared key so the read-state families stay
  // in lockstep with the Tickets surface (one invalidation clears both), but
  // it is DISABLED here: the dashboard reads only per-ticket unreadCount,
  // which the window query answers authoritatively for loaded rows. Global
  // truth (the caught-up stamp, the unread filter) lives on Tickets, not here.
  const readStateSweepQuery = createQuery(() => ({
    queryKey: ticketsKeys.readStateSweep(),
    queryFn: async () =>
      fetchSweepToExhaustion(async (cursor) =>
        ticketRouter.readStateSweep.query({ cursor }),
      ),
    enabled: false,
  }));

  const readStateQuery = createQuery(() => ({
    queryKey: ticketsKeys.readState(loadedTicketIds),
    queryFn: async () =>
      fetchReadStateWindow(loadedTicketIds, async (ids) =>
        ticketRouter.listReadState.query({ ticketIds: ids }),
      ),
    enabled: isCryptoKeyed() && loadedTicketIds.length > 0,
  }));

  const ticketById = $derived.by(() => {
    const map = new SvelteMap<string, Ticket>();
    for (const t of allTickets) map.set(t.id, t);
    return map;
  });

  const listReadState = createListReadState({
    windowQuery: readStateQuery,
    sweepQuery: readStateSweepQuery,
    getKeyWrap: (ticketId) => ticketById.get(ticketId)?.keyWrap ?? null,
    getUserId: () => currentUserId ?? "",
    ticketDecryptCache: ticketCache,
  });

  // --- Dashboard section filters (single-pass bucketing in filters.ts) ---
  const buckets = $derived(
    bucketTickets(allTickets, currentUserId, (id) =>
      listReadState.isUnread(id),
    ),
  );
  const needsAttention = $derived(buckets.needsAttention);
  const myOpen = $derived(buckets.myOpen);
  const unassigned = $derived(buckets.unassigned);
  const onHold = $derived(buckets.onHold);

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
    getQueryKey: () => ticketsKeys.list({ statuses: ["open"] }),
    holdMutate: async (ticketId, hold) =>
      ticketRouter.update.mutate({ ticketId, onHold: hold }),
  });

  const assignFlow = createAssignFlow({
    queryClient,
    getQueryKey: () => ticketsKeys.list({ statuses: ["open"] }),
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

  let callSheetOpen = $state(false);

  // --- Getting Started checklist (admin-only, TanStack deduplicates with GettingStartedCard) ---

  const checklistQuery = createQuery(() => ({
    queryKey: ["dashboard", "setupChecklist"],
    queryFn: async () => trpc.dashboard.getSetupChecklist.query(),
    staleTime: 60_000,
    enabled: permissions.has(Permission.MANAGE_ROLES),
  }));

  const showGettingStarted = $derived(
    checklistQuery.isSuccess &&
      !checklistQuery.data.dismissed &&
      checklistQuery.data.items.length > 0,
  );

  // --- Section scroll nav ---

  const showOnHold = $derived(
    ticketsQuery.isLoading || (countsQuery.data?.onHold ?? onHold.length) > 0,
  );

  const showNeedsAttention = $derived(
    ticketsQuery.isLoading || needsAttention.length > 0,
  );

  // Work-first order: the day's tickets lead, ambient/meta sections follow.
  const dashboardSections = $derived.by((): readonly ScrollSection[] => {
    const sections: ScrollSection[] = [];
    if (showGettingStarted) {
      sections.push({
        id: "getting-started",
        label: m.getting_started_heading,
        icon: Rocket,
      });
    }
    sections.push({
      id: "shift",
      label: m.dashboard_shift_heading,
      icon: CalendarDays,
    });
    if (showNeedsAttention) {
      sections.push({
        id: "needs-attention",
        label: m.dashboard_section_needs_attention,
        icon: TicketAlert,
      });
    }
    sections.push({
      id: "my-tickets",
      label: () => m.dashboard_section_my_tickets(withTerms()),
      icon: TicketIcon,
    });
    sections.push({
      id: "unassigned",
      label: m.dashboard_section_unassigned,
      icon: TicketMinus,
    });
    if (showOnHold) {
      sections.push({
        id: "on-hold",
        label: m.dashboard_section_on_hold,
        icon: TicketPause,
      });
    }
    sections.push(
      {
        id: "queues",
        label: () => m.dashboard_queues_heading(withTerms()),
        icon: Layers,
      },
      { id: "activity", label: m.dashboard_activity_heading, icon: Activity },
      {
        id: "kb",
        label: () => m.dashboard_kb_heading(withTerms()),
        icon: BookOpen,
      },
    );
    return sections;
  });

  const scroll = createSectionScroll(() => dashboardSections);

  // --- Meta-section derived props (unchanged; owned by their sections) ---

  const activityProps = $derived(
    (activityQuery.data ?? []).map((a) => ({
      ...a,
      queueName: orgCache.decrypt(`queue:${a.queueId}`, a.encryptedQueueName),
    })),
  );

  const kbProps = $derived(
    (kbQuery.data ?? []).map((item) => ({
      ...item,
      decryptedTitle:
        orgCache.decrypt(`kb:${item.id}`, item.encryptedTitle) ?? undefined,
    })),
  );

  const queueProps = $derived(
    (queuesQuery.data ?? []).map((q) => ({
      id: q.id,
      name: orgCache.decrypt(`queue:${q.id}`, q.encryptedName),
      openCount: Number(q.openCount),
      urgentCount: Number(q.urgentCount),
    })),
  );

  // --- Ticket card props (shared mapper, one contract with the Tickets page) ---

  // Reaction summaries are display-only in previews; the Tickets surface owns
  // their hydration. An empty map keeps the preview reaction slot inert here.
  const previewReactionsMap = new SvelteMap<string, ReactionSummary[]>();

  // The mapper hands its decrypt hooks widened `unknown` ciphertext; re-derive
  // the typed org-cache inputs from the loaded rows, keyed the same way the
  // mapper keys them, so the cache calls stay type-safe without a cast.
  const orgCipherByKey = $derived.by(() => {
    const map = new SvelteMap<string, SerializedBuffer | Uint8Array | null>();
    for (const t of allTickets) {
      map.set(`queue:${t.queueId}`, t.encryptedQueueName);
      if (t.assignedTo !== null) {
        map.set(`assignee:${t.assignedTo}`, t.assignedDisplayName);
      }
    }
    return map;
  });

  const cardMapper = $derived(
    createCardPropsMapper({
      orgDecrypt: (cacheKey) =>
        orgCache.decrypt(cacheKey, orgCipherByKey.get(cacheKey) ?? null),
      decryptTitle: (ticketId) => {
        const t = ticketById.get(ticketId);
        return t
          ? ticketCache.decryptTitle(t.id, t.keyWrap, t.encryptedTitle)
          : undefined;
      },
      currentUserId: currentUserId ?? "",
      unreadCount: (ticketId) => listReadState.unreadCount(ticketId),
      getPreview: (ticketId) => previewLoader.get(ticketId),
      previewReactionsMap,
      ontap: handleTicketTap,
      onaction: handleAction,
      onencryptedhelp: showEncryptedHelp,
    }),
  );

  const needsAttentionCards = $derived(needsAttention.map(cardMapper));
  const myOpenCards = $derived(myOpen.map(cardMapper));
  const unassignedCards = $derived(unassigned.map(cardMapper));
  const onHoldCards = $derived(onHold.map(cardMapper));

  // --- Collapsible section state (all expanded except unassigned/on-hold) ---
  const collapsedSections = new SvelteSet<string>(["unassigned", "on-hold"]);

  function toggleSection(id: string): void {
    if (collapsedSections.has(id)) {
      collapsedSections.delete(id);
    } else {
      collapsedSections.add(id);
    }
  }

  // Navigation handlers (route file owns navigation per code standards).
  function handleTicketTap(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}`));
  }

  function handleQueueTap(queueId: string): void {
    void goto(resolve(`/tickets?queue=${encodeURIComponent(queueId)}`));
  }

  function handleSeeAllMyOpen(): void {
    void goto(resolve("/tickets?filter=my-open"));
  }

  function handleSeeAllUnassigned(): void {
    void goto(resolve("/tickets?filter=unassigned"));
  }

  function handleSeeAllNeedsAttention(): void {
    void goto(resolve("/tickets?filter=needs-attention"));
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
    } catch (err: unknown) {
      console.error("[dashboard] take failed", err);
      toastStore.show(m.error_generic(), 3000);
    }
  }

  function handleCallAction(action: CallAction): void {
    callSheetOpen = false;
    if (action === "cancel") return;
    toastStore.show(m.feature_coming_soon());
  }

  // Login summary notification slot (6k provides content).
  let exposureNotificationVisible = $state(false);

  function dismissExposureNotification(): void {
    exposureNotificationVisible = false;
  }
</script>

{#snippet dashboardSubnavbar()}
  <!-- Mirrors the tickets-page subnavbar anatomy (SubNavbarFilterLayout):
       large page title + switcher header row, then the scroll row where
       tickets renders its filter row. -->
  <section class="overview-subnavbar" aria-label={m.nav_home()}>
    <div class="overview-page-header">
      <BlockTitle large class="overview-page-title">{m.nav_home()}</BlockTitle>
      <ViewSwitcher
        mode={dashboardViewModeStore.mode}
        onchange={(mode: ViewMode) => dashboardViewModeStore.set(mode)}
      />
    </div>
    <SectionScrollNav
      sections={dashboardSections}
      active={scroll.active}
      onscroll={(id: string) =>
        void scroll.expandAndScroll(id, () => collapsedSections.delete(id))}
      ariaLabel={m.nav_home()}
    />
  </section>
{/snippet}

<div class="dashboard">
  <h1 class="sr-only">{m.nav_home()}</h1>
  <Notification
    role="alert"
    opened={exposureNotificationVisible}
    title={m.dashboard_exposure_title()}
    subtitle={m.dashboard_exposure_subtitle()}
    onClose={dismissExposureNotification}
  />

  {#if showGettingStarted}
    <div id="section-getting-started" class="scroll-target" data-column="left">
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

  <div id="section-shift" class="scroll-target">
    <ShiftSection
      shift={shiftQuery.data?.shift ?? null}
      loading={shiftQuery.isLoading}
      myOpenCount={myOpen.length}
    />
  </div>

  {#if showNeedsAttention}
    <div id="section-needs-attention" class="scroll-target" data-column="right">
      <CollapsibleSection
        id="needs-attention"
        heading={m.dashboard_section_needs_attention()}
        count={ticketsQuery.isLoading ? undefined : needsAttention.length}
        loading={ticketsQuery.isLoading}
        icon={TicketAlert}
        iconColor="var(--brand-accent)"
        expanded={!collapsedSections.has("needs-attention")}
        ontoggle={() => toggleSection("needs-attention")}
      >
        <TicketPreviewList
          loading={ticketsQuery.isLoading}
          cards={needsAttentionCards}
          viewMode={dashboardViewModeStore.mode}
          onseeall={handleSeeAllNeedsAttention}
        />
      </CollapsibleSection>
    </div>
  {/if}

  <div id="section-my-tickets" class="scroll-target" data-column="right">
    <CollapsibleSection
      id="my-tickets"
      heading={m.dashboard_section_my_tickets(withTerms())}
      count={ticketsQuery.isLoading ? undefined : myOpen.length}
      loading={ticketsQuery.isLoading}
      icon={TicketIcon}
      iconColor="var(--brand-accent)"
      expanded={!collapsedSections.has("my-tickets")}
      ontoggle={() => toggleSection("my-tickets")}
    >
      <TicketPreviewList
        loading={ticketsQuery.isLoading}
        cards={myOpenCards}
        viewMode={dashboardViewModeStore.mode}
        onseeall={handleSeeAllMyOpen}
      />
    </CollapsibleSection>
  </div>

  <div id="section-unassigned" class="scroll-target" data-column="right">
    <CollapsibleSection
      id="unassigned"
      heading={m.dashboard_section_unassigned()}
      count={ticketsQuery.isLoading
        ? undefined
        : (countsQuery.data?.unassigned ?? unassigned.length)}
      loading={ticketsQuery.isLoading}
      icon={TicketMinus}
      iconColor="var(--brand-accent)"
      expanded={!collapsedSections.has("unassigned")}
      ontoggle={() => toggleSection("unassigned")}
    >
      <TicketPreviewList
        loading={ticketsQuery.isLoading}
        cards={unassignedCards}
        viewMode={dashboardViewModeStore.mode}
        totalCount={countsQuery.data?.unassigned}
        onseeall={handleSeeAllUnassigned}
      />
    </CollapsibleSection>
  </div>

  {#if showOnHold}
    <div id="section-on-hold" class="scroll-target" data-column="right">
      <CollapsibleSection
        id="on-hold"
        heading={m.dashboard_section_on_hold()}
        count={ticketsQuery.isLoading
          ? undefined
          : (countsQuery.data?.onHold ?? onHold.length)}
        loading={ticketsQuery.isLoading}
        icon={TicketPause}
        iconColor="var(--brand-accent)"
        expanded={!collapsedSections.has("on-hold")}
        ontoggle={() => toggleSection("on-hold")}
      >
        <TicketPreviewList
          loading={ticketsQuery.isLoading}
          cards={onHoldCards}
          viewMode={dashboardViewModeStore.mode}
          totalCount={countsQuery.data?.onHold}
        />
      </CollapsibleSection>
    </div>
  {/if}

  <div id="section-queues" class="scroll-target" data-column="left">
    <QueueCards
      queues={queueProps}
      loading={queuesQuery.isLoading}
      expanded={!collapsedSections.has("queues")}
      ontoggle={() => toggleSection("queues")}
      ontap={handleQueueTap}
    />
  </div>

  <div id="section-activity" class="scroll-target" data-column="left">
    <ActivitySection
      activity={activityProps}
      loading={activityQuery.isLoading}
      expanded={!collapsedSections.has("activity")}
      ontoggle={() => toggleSection("activity")}
      ontap={handleTicketTap}
    />
  </div>

  <div id="section-kb" class="scroll-target" data-column="left">
    <KBSection
      kbItems={kbProps}
      loading={kbQuery.isLoading}
      expanded={!collapsedSections.has("kb")}
      ontoggle={() => toggleSection("kb")}
      ontap={handleKBTap}
    />
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
  previewFollowUps={replyFlow.previewFollowUps}
  followUpCount={replyFlow.followUpCount}
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

  .dashboard {
    padding: 0.25rem 0 1rem;
  }

  .scroll-target {
    scroll-margin-top: 7rem;
  }

  @media (min-width: 1024px) {
    /* Provisional desktop treatment: the DOM keeps the mobile work-first
       order, so dense packing must backfill the left column (sparse flow
       would strand it below the ticket stack). The real desktop layout is
       a pending design discussion. */
    .dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-auto-flow: row dense;
      gap: var(--space-xl, 1.5rem);
      max-width: none;
      padding-inline: var(--page-pad-x);
    }

    .dashboard [data-column="left"] {
      grid-column: 1;
    }

    .dashboard [data-column="right"] {
      grid-column: 2;
    }

    .dashboard > :not([data-column]) {
      grid-column: 1 / -1;
    }
  }
</style>
