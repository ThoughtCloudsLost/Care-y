<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { Notification } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { trpc } from "$lib/trpc/index.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import type { TicketPreviewItemProps } from "$lib/components/dashboard/types.js";
  import { Ticket as TicketIcon, TicketMinus } from "@lucide/svelte";
  import TicketPreviewList from "$lib/components/dashboard/TicketPreviewList.svelte";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import ShiftSection from "$lib/components/dashboard/ShiftSection.svelte";
  import QueueCards from "$lib/components/dashboard/QueueCards.svelte";
  import ActivitySection from "$lib/components/dashboard/ActivitySection.svelte";
  import KBSection from "$lib/components/dashboard/KBSection.svelte";
  import TicketAlert from "$lib/components/icons/TicketAlert.svelte";
  import TicketPause from "$lib/components/icons/TicketPause.svelte";
  import {
    getOrgDecryptCache,
    getTicketDecryptCache,
    getCurrentUserId,
  } from "$lib/crypto/context.js";
  import { bucketTickets } from "$lib/components/dashboard/filters.js";
  import * as m from "$lib/paraglide/messages.js";

  // Singletons from (app) layout context.
  const orgCache = getOrgDecryptCache();
  const ticketCache = getTicketDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  // All open tickets for the current user's accessible queues.
  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const ticketsQuery = createQuery(() => ({
    queryKey: ["tickets", "list", { statuses: ["open"] }],
    queryFn: async () =>
      ticketRouter.list.query({ statuses: ["open"], limit: 100 }),
  }));

  type Ticket = NonNullable<typeof ticketsQuery.data>[number];

  // --- Dashboard info queries ---

  const activityQuery = createQuery(() => ({
    queryKey: ["tickets", "recentActivity"],
    queryFn: async () => ticketRouter.recentActivity.query({ limit: 5 }),
  }));

  const queuesQuery = createQuery(() => ({
    queryKey: ["tickets", "myQueues"],
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  const shiftQuery = createQuery(() => ({
    queryKey: ["tickets", "dashboardInfo"],
    queryFn: async () => ticketRouter.dashboardInfo.query(),
  }));

  const kbQuery = createQuery(() => ({
    queryKey: ["kb", "recentItems"],
    queryFn: async () => {
      if (!trpc.kb) return [];
      return trpc.kb.recentItems.query({ limit: 2 });
    },
  }));

  const countsQuery = createQuery(() => ({
    queryKey: ["tickets", "counts"],
    queryFn: async () => ticketRouter.counts.query(),
  }));

  // --- Dashboard section filters (single-pass bucketing in filters.ts) ---
  const allTickets = $derived(ticketsQuery.data ?? []);
  const buckets = $derived(bucketTickets(allTickets, currentUserId));
  const needsAttention = $derived(buckets.needsAttention);
  const myOpen = $derived(buckets.myOpen);
  const unassigned = $derived(buckets.unassigned);
  const onHold = $derived(buckets.onHold);

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
      name: orgCache.decrypt(`queue:${q.id}`, q.encrypted_name),
      openCount: Number(q.openCount),
    })),
  );

  const needsAttentionProps = $derived(needsAttention.map(toPreviewProps));
  const myOpenProps = $derived(myOpen.map(toPreviewProps));
  const unassignedProps = $derived(unassigned.map(toPreviewProps));
  const onHoldProps = $derived(onHold.map(toPreviewProps));

  // --- Collapsible section state (all expanded by default) ---
  let shiftExpanded = $state(true);
  let needsAttentionExpanded = $state(true);
  let queuesExpanded = $state(true);
  let activityExpanded = $state(true);
  let kbExpanded = $state(true);
  let myTicketsExpanded = $state(true);
  let unassignedExpanded = $state(false);
  let onHoldExpanded = $state(false);

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
      title: ticketCache.decryptTitle(t.id, t.keyWrap, t.encryptedTitle),
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
    toastStore.show(m.dashboard_encrypted_help(), 5000);
  }

  function handleActivityTap(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}`));
  }

  function handleKBTap(itemId: string): void {
    void goto(resolve(`/kb/${itemId}`));
  }

  // Login summary notification slot (6k provides content).
  let exposureNotificationVisible = $state(false);

  function dismissExposureNotification(): void {
    exposureNotificationVisible = false;
  }
</script>

<div class="dashboard">
  <h1 class="sr-only">{m.nav_home()}</h1>
  <Notification
    role="alert"
    opened={exposureNotificationVisible}
    title={m.dashboard_exposure_title()}
    subtitle={m.dashboard_exposure_subtitle()}
    onClose={dismissExposureNotification}
  />

  <ShiftSection
    shift={shiftQuery.data?.shift ?? null}
    loading={shiftQuery.isLoading}
    expanded={shiftExpanded}
    ontoggle={() => (shiftExpanded = !shiftExpanded)}
  />

  <ActivitySection
    activity={activityProps}
    loading={activityQuery.isLoading}
    expanded={activityExpanded}
    ontoggle={() => (activityExpanded = !activityExpanded)}
    ontap={handleActivityTap}
  />

  <KBSection
    kbItems={kbProps}
    loading={kbQuery.isLoading}
    expanded={kbExpanded}
    ontoggle={() => (kbExpanded = !kbExpanded)}
    ontap={handleKBTap}
  />

  <QueueCards
    queues={queueProps}
    loading={queuesQuery.isLoading}
    expanded={queuesExpanded}
    ontoggle={() => (queuesExpanded = !queuesExpanded)}
    ontap={handleQueueTap}
  />

  <div class="ticket-sections" data-total={allTickets.length}>
    {#if ticketsQuery.isLoading || needsAttention.length > 0}
      <CollapsibleSection
        heading={m.dashboard_section_needs_attention()}
        count={ticketsQuery.isLoading ? undefined : needsAttention.length}
        loading={ticketsQuery.isLoading}
        icon={TicketAlert}
        iconColor="var(--brand-accent)"
        expanded={needsAttentionExpanded}
        ontoggle={() => (needsAttentionExpanded = !needsAttentionExpanded)}
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
    {/if}

    <CollapsibleSection
      heading={m.dashboard_section_my_tickets()}
      count={ticketsQuery.isLoading ? undefined : myOpen.length}
      loading={ticketsQuery.isLoading}
      icon={TicketIcon}
      iconColor="var(--brand-accent)"
      expanded={myTicketsExpanded}
      ontoggle={() => (myTicketsExpanded = !myTicketsExpanded)}
    >
      <TicketPreviewList
        heading={m.dashboard_section_my_tickets()}
        hideHeading
        loading={ticketsQuery.isLoading}
        tickets={myOpenProps}
        ontickettap={handleTicketTap}
        onseeall={handleSeeAllMyOpen}
        onencryptedhelp={showEncryptedHelp}
      />
    </CollapsibleSection>

    <CollapsibleSection
      heading={m.dashboard_section_unassigned()}
      count={ticketsQuery.isLoading
        ? undefined
        : (countsQuery.data?.unassigned ?? unassigned.length)}
      loading={ticketsQuery.isLoading}
      icon={TicketMinus}
      iconColor="var(--brand-accent)"
      expanded={unassignedExpanded}
      ontoggle={() => (unassignedExpanded = !unassignedExpanded)}
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

    {#if ticketsQuery.isLoading || (countsQuery.data?.onHold ?? onHold.length) > 0}
      <CollapsibleSection
        heading={m.dashboard_section_on_hold()}
        count={ticketsQuery.isLoading
          ? undefined
          : (countsQuery.data?.onHold ?? onHold.length)}
        loading={ticketsQuery.isLoading}
        icon={TicketPause}
        iconColor="var(--brand-accent)"
        expanded={onHoldExpanded}
        ontoggle={() => (onHoldExpanded = !onHoldExpanded)}
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
    {/if}
  </div>
</div>

<style>
  .dashboard {
    padding: 0.25rem 0 1rem;
  }
</style>
