<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { createQuery } from "@tanstack/svelte-query";
  import { Notification, List, ListItem } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { trpc } from "$lib/trpc/index.js";
  import { ticketsKeys, kbKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import type { TicketPreviewItemProps } from "$lib/components/dashboard/types.js";
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
  import {
    getOrgDecryptCache,
    getTicketDecryptCache,
    getCurrentUserId,
    getCurrentPermissions,
  } from "$lib/crypto/context.js";
  import { Permission } from "@care-y/shared";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import type { NavbarAction } from "$lib/shell/types";
  import { resolveAsyncDecrypt } from "$lib/crypto/decrypt-result.js";
  import { bucketTickets } from "$lib/components/dashboard/filters.js";
  import {
    createSectionScroll,
    type ScrollSection,
  } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";

  // Singletons from (app) layout context.
  const orgCache = getOrgDecryptCache();
  const ticketCache = getTicketDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const navbarCtx = getNavbarOverrideCtx();

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

  // All open tickets for the current user's accessible queues.
  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  const ticketsQuery = createQuery(() => ({
    queryKey: ticketsKeys.list({ statuses: ["open"] }),
    queryFn: async () =>
      ticketRouter.list.query({ statuses: ["open"], limit: 100 }),
  }));

  type Ticket = NonNullable<typeof ticketsQuery.data>[number];

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

  // --- Dashboard section filters (single-pass bucketing in filters.ts) ---
  const allTickets = $derived(ticketsQuery.data ?? []);
  const buckets = $derived(bucketTickets(allTickets, currentUserId));
  const needsAttention = $derived(buckets.needsAttention);
  const myOpen = $derived(buckets.myOpen);
  const unassigned = $derived(buckets.unassigned);
  const onHold = $derived(buckets.onHold);

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

  const dashboardSections = $derived.by((): readonly ScrollSection[] => {
    const sections: ScrollSection[] = [];
    if (showGettingStarted) {
      sections.push({
        id: "getting-started",
        label: m.getting_started_heading,
        icon: Rocket,
      });
    }
    sections.push(
      { id: "shift", label: m.dashboard_shift_heading, icon: CalendarDays },
      { id: "activity", label: m.dashboard_activity_heading, icon: Activity },
      {
        id: "kb",
        label: () => m.dashboard_kb_heading(withTerms()),
        icon: BookOpen,
      },
      {
        id: "queues",
        label: () => m.dashboard_queues_heading(withTerms()),
        icon: Layers,
      },
    );
    if (ticketsQuery.isLoading || needsAttention.length > 0) {
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
    return sections;
  });

  const scroll = createSectionScroll(() => dashboardSections);

  // --- Pre-computed derived props (avoid inline .map() in template) ---

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
    })),
  );

  const needsAttentionProps = $derived(needsAttention.map(toPreviewProps));
  const myOpenProps = $derived(myOpen.map(toPreviewProps));
  const unassignedProps = $derived(unassigned.map(toPreviewProps));
  const onHoldProps = $derived(onHold.map(toPreviewProps));

  // --- Collapsible section state (all expanded except unassigned/on-hold) ---
  const collapsedSections = new SvelteSet<string>(["unassigned", "on-hold"]);

  function toggleSection(id: string): void {
    if (collapsedSections.has(id)) {
      collapsedSections.delete(id);
    } else {
      collapsedSections.add(id);
    }
  }

  // Ticket title decryption is handled by ticketCache (TicketDecryptCache).
  // It uses a SvelteMap internally, so reads are reactive. Decryption is
  // triggered lazily in toPreviewProps when each ticket is first rendered.

  // Assignee display name decryption is handled by orgCache (OrgDecryptCache).
  // Display names are sealed-box encrypted with the org public key.

  function toPreviewProps(t: Ticket): Omit<TicketPreviewItemProps, "ontap"> {
    // Assignee: show "You" for current user, org-key-decrypt name for
    // others, null for unassigned (falls back to i18n "Unassigned").
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
      titleResult: resolveAsyncDecrypt(
        ticketCache.decryptTitle(t.id, t.keyWrap, t.encryptedTitle),
        t.keyWrap !== null,
      ),
      status: t.status,
      priority: t.priority,
      onHold: t.onHold,
      assignedTo: t.assignedTo,
      createdAt: new Date(t.createdAt),
      clientAlias: t.clientAlias,
      queueName: orgCache.decrypt(`queue:${t.queueId}`, t.encryptedQueueName),
      lastActivityAt:
        t.lastActivityAt !== null ? new Date(t.lastActivityAt) : null,
      followUpCount: t.followUpCount,
      assignedName,
    };
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

  function showEncryptedHelp(): void {
    toastStore.show(m.dashboard_encrypted_help(withTerms()), 5000);
  }

  function handleKBTap(itemId: string): void {
    void goto(resolve(`/library/${itemId}`));
  }

  // Login summary notification slot (6k provides content).
  let exposureNotificationVisible = $state(false);

  function dismissExposureNotification(): void {
    exposureNotificationVisible = false;
  }
</script>

{#snippet dashboardSubnavbar()}
  <SectionScrollNav
    sections={dashboardSections}
    active={scroll.active}
    onscroll={(id: string) =>
      void scroll.expandAndScroll(id, () => collapsedSections.delete(id))}
    ariaLabel={m.nav_home()}
  />
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
      />
    </div>
  {/if}

  <div id="section-shift" class="scroll-target" data-column="left">
    <ShiftSection
      shift={shiftQuery.data?.shift ?? null}
      loading={shiftQuery.isLoading}
      expanded={!collapsedSections.has("shift")}
      ontoggle={() => toggleSection("shift")}
    />
  </div>

  <div id="section-activity" class="scroll-target" data-column="right">
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

  <div id="section-queues" class="scroll-target" data-column="left">
    <QueueCards
      queues={queueProps}
      loading={queuesQuery.isLoading}
      expanded={!collapsedSections.has("queues")}
      ontoggle={() => toggleSection("queues")}
      ontap={handleQueueTap}
    />
  </div>

  {#if ticketsQuery.isLoading || needsAttention.length > 0}
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
          heading={m.dashboard_section_needs_attention()}
          hideHeading
          loading={ticketsQuery.isLoading}
          tickets={needsAttentionProps}
          ontickettap={handleTicketTap}
          onencryptedhelp={showEncryptedHelp}
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
        heading={m.dashboard_section_my_tickets(withTerms())}
        hideHeading
        loading={ticketsQuery.isLoading}
        tickets={myOpenProps}
        ontickettap={handleTicketTap}
        onseeall={handleSeeAllMyOpen}
        onencryptedhelp={showEncryptedHelp}
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
        heading={m.dashboard_section_unassigned()}
        hideHeading
        loading={ticketsQuery.isLoading}
        tickets={unassignedProps}
        totalCount={countsQuery.data?.unassigned}
        ontickettap={handleTicketTap}
        onseeall={handleSeeAllUnassigned}
        onencryptedhelp={showEncryptedHelp}
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
          heading={m.dashboard_section_on_hold()}
          hideHeading
          loading={ticketsQuery.isLoading}
          tickets={onHoldProps}
          totalCount={countsQuery.data?.onHold}
          ontickettap={handleTicketTap}
          onencryptedhelp={showEncryptedHelp}
        />
      </CollapsibleSection>
    </div>
  {/if}
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

<style>
  .dashboard {
    padding: 0.25rem 0 1rem;
  }

  .scroll-target {
    scroll-margin-top: 7rem;
  }

  @media (min-width: 1024px) {
    .dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr;
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
