<script lang="ts">
  import { getContext } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { createQuery } from "@tanstack/svelte-query";
  import { Notification, Toast } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { trpc } from "$lib/trpc/index.js";
  import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
  import type { TicketPreviewItemProps } from "$lib/components/dashboard/types.js";
  import TicketPreviewList from "$lib/components/dashboard/TicketPreviewList.svelte";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import ShiftSection from "$lib/components/dashboard/ShiftSection.svelte";
  import QueueCards from "$lib/components/dashboard/QueueCards.svelte";
  import ActivitySection from "$lib/components/dashboard/ActivitySection.svelte";
  import KBSection from "$lib/components/dashboard/KBSection.svelte";
  import QueryLoader from "$lib/components/QueryLoader.svelte";
  import { serializedBufferToBase64 } from "$lib/utils/buffer-encoding.js";
  import * as m from "$lib/paraglide/messages.js";

  // CryptoBridge provided by (app) layout via setContext.
  const bridge = getContext<CryptoBridge>("cryptoBridge");

  // Current user identity from auth.me.
  const meQuery = createQuery(() => ({
    queryKey: ["auth", "me"],
    queryFn: async () => trpc.auth.me.query(),
    staleTime: Infinity,
  }));

  const currentUserId = $derived(meQuery.data?.user.id);

  // All open tickets for the current user's accessible queues.
  if (!trpc.tickets) throw new Error("tickets router unavailable");
  const ticketRouter = trpc.tickets;

  const ticketsQuery = createQuery(() => ({
    queryKey: ["tickets", "list", { status: "open" }],
    queryFn: async () =>
      ticketRouter.list.query({ status: "open", limit: 100 }),
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

  // --- "Needs Attention" filter ---
  // Urgent/high priority tickets that are unassigned, OR assigned to
  // the current user with unread follow-ups. This surfaces items that
  // need someone to act right now.
  const needsAttention = $derived(
    (ticketsQuery.data ?? []).filter((t) => {
      if (t.status !== "open" || t.onHold) return false;
      const isHighPriority = t.priority === "urgent" || t.priority === "high";
      // Unassigned urgent/high tickets need someone to claim them.
      if (isHighPriority && t.assignedTo === null) return true;
      // Your tickets with follow-ups need a response.
      if (
        t.assignedTo === currentUserId &&
        t.followUpCount > 0 &&
        isHighPriority
      )
        return true;
      return false;
    }),
  );

  // Remaining dashboard sections.
  const myOpen = $derived(
    (ticketsQuery.data ?? []).filter(
      (t) => t.assignedTo === currentUserId && t.status === "open" && !t.onHold,
    ),
  );

  const unassigned = $derived(
    (ticketsQuery.data ?? []).filter(
      (t) => t.assignedTo === null && t.status === "open",
    ),
  );

  const onHold = $derived((ticketsQuery.data ?? []).filter((t) => t.onHold));

  // --- Collapsible section state (all expanded by default) ---
  let shiftExpanded = $state(true);
  let needsAttentionExpanded = $state(true);
  let queuesExpanded = $state(true);
  let activityExpanded = $state(true);
  let kbExpanded = $state(true);
  let myTicketsExpanded = $state(true);
  let unassignedExpanded = $state(false);
  let onHoldExpanded = $state(false);

  // Decrypted titles keyed by ticket ID. SvelteMap is reactive without $state.
  const decryptedTitles = new SvelteMap<string, string>();

  // Decrypted assignee names keyed by user ID (org-key tier, main thread).
  // TODO: wire org-key decryption for assignee display names
  const decryptedAssignees = new SvelteMap<string, string>();

  // Decrypt ticket titles as data arrives.
  $effect(() => {
    const tickets = ticketsQuery.data;
    if (!tickets) return;

    for (const t of tickets) {
      if (decryptedTitles.has(t.id)) continue;
      if (!t.keyWrap) continue;

      const ciphertext = serializedBufferToBase64(t.encryptedTitle);

      void bridge
        .decrypt(
          t.id,
          t.keyWrap.ephemeralPoint,
          t.keyWrap.nonce,
          t.keyWrap.wrappedKey,
          ciphertext,
        )
        .then((plaintext) => {
          decryptedTitles.set(t.id, plaintext);
        })
        .catch(() => {
          // Decryption failure: title stays as undefined (shows placeholder).
        });
    }
  });

  function toPreviewProps(t: Ticket): Omit<TicketPreviewItemProps, "ontap"> {
    // Assignee: show "You" for current user, decrypted name for others,
    // null for unassigned. Display name is org-key encrypted; decryption
    // will be wired when the org-key decrypt pipeline is available on
    // main thread. For now, show "You" or null (falls back to i18n
    // "Unassigned" in the component).
    let assignedName: string | null = null;
    if (t.assignedTo === currentUserId) {
      assignedName = m.dashboard_assigned_you();
    } else if (t.assignedTo !== null) {
      // TODO: decrypt t.assignedDisplayName with org key
      assignedName = decryptedAssignees.get(t.assignedTo) ?? null;
    }

    return {
      ticketId: t.id,
      title: decryptedTitles.get(t.id),
      status: t.status,
      priority: t.priority,
      onHold: t.onHold,
      assignedTo: t.assignedTo,
      createdAt: new Date(t.createdAt),
      clientAlias: t.clientAlias,
      queueName: t.queueName,
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

  function handleQueueTap(queueId: string, queueName: string): void {
    void goto(resolve(`/tickets?queue=${encodeURIComponent(queueName)}`));
  }

  function handleSeeAllMyOpen(): void {
    void goto(resolve("/tickets?filter=my-open"));
  }

  function handleSeeAllUnassigned(): void {
    void goto(resolve("/tickets?filter=unassigned"));
  }

  // Encrypted ticket help toast (page-level, shared across all list items).
  let helpToastOpen = $state(false);
  let helpToastTimer: ReturnType<typeof setTimeout> | undefined;

  function showEncryptedHelp(): void {
    helpToastOpen = true;
    clearTimeout(helpToastTimer);
    helpToastTimer = setTimeout(() => {
      helpToastOpen = false;
    }, 5000);
  }

  function dismissHelpToast(): void {
    helpToastOpen = false;
    clearTimeout(helpToastTimer);
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
    expanded={shiftExpanded}
    ontoggle={() => (shiftExpanded = !shiftExpanded)}
  />

  <QueryLoader query={ticketsQuery} skeletonLines={8}>
    {#snippet children(tickets)}
      <div class="ticket-sections" data-total={tickets.length}>
        {#if needsAttention.length > 0}
          <CollapsibleSection
            heading={m.dashboard_section_needs_attention()}
            count={needsAttention.length}
            expanded={needsAttentionExpanded}
            ontoggle={() => (needsAttentionExpanded = !needsAttentionExpanded)}
          >
            <TicketPreviewList
              heading={m.dashboard_section_needs_attention()}
              hideHeading
              tickets={needsAttention.map(toPreviewProps)}
              ontickettap={handleTicketTap}
              onencryptedhelp={showEncryptedHelp}
            />
          </CollapsibleSection>
        {/if}

        <QueueCards
          queues={(queuesQuery.data ?? []).map((q) => ({
            id: q.id,
            name: q.name,
            openCount: Number(q.openCount),
          }))}
          expanded={queuesExpanded}
          ontoggle={() => (queuesExpanded = !queuesExpanded)}
          ontap={handleQueueTap}
        />

        <ActivitySection
          activity={activityQuery.data ?? []}
          expanded={activityExpanded}
          ontoggle={() => (activityExpanded = !activityExpanded)}
        />

        <KBSection
          kbItems={(kbQuery.data ?? []).map((item) => ({
            ...item,
            decryptedTitle: undefined,
          }))}
          expanded={kbExpanded}
          ontoggle={() => (kbExpanded = !kbExpanded)}
        />

        <CollapsibleSection
          heading={m.dashboard_section_my_tickets()}
          count={myOpen.length}
          expanded={myTicketsExpanded}
          ontoggle={() => (myTicketsExpanded = !myTicketsExpanded)}
        >
          <TicketPreviewList
            heading={m.dashboard_section_my_tickets()}
            hideHeading
            tickets={myOpen.map(toPreviewProps)}
            ontickettap={handleTicketTap}
            onseeall={handleSeeAllMyOpen}
            onencryptedhelp={showEncryptedHelp}
          />
        </CollapsibleSection>

        <CollapsibleSection
          heading={m.dashboard_section_unassigned()}
          count={unassigned.length}
          expanded={unassignedExpanded}
          ontoggle={() => (unassignedExpanded = !unassignedExpanded)}
        >
          <TicketPreviewList
            heading={m.dashboard_section_unassigned()}
            hideHeading
            tickets={unassigned.map(toPreviewProps)}
            ontickettap={handleTicketTap}
            onseeall={handleSeeAllUnassigned}
            onencryptedhelp={showEncryptedHelp}
          />
        </CollapsibleSection>

        {#if onHold.length > 0}
          <CollapsibleSection
            heading={m.dashboard_section_on_hold()}
            count={onHold.length}
            expanded={onHoldExpanded}
            ontoggle={() => (onHoldExpanded = !onHoldExpanded)}
          >
            <TicketPreviewList
              heading={m.dashboard_section_on_hold()}
              hideHeading
              tickets={onHold.map(toPreviewProps)}
              ontickettap={handleTicketTap}
              onencryptedhelp={showEncryptedHelp}
            />
          </CollapsibleSection>
        {/if}
      </div>
    {/snippet}
  </QueryLoader>
</div>

{#snippet helpDismissButton()}
  <button type="button" class="toast-dismiss" onclick={dismissHelpToast}
    >{m.dashboard_dismiss()}</button
  >
{/snippet}

<Toast opened={helpToastOpen} position="center" button={helpDismissButton}>
  <div class="encrypted-help-toast">
    {m.dashboard_encrypted_help()}
  </div>
</Toast>

<style>
  .dashboard {
    padding: 0.25rem 0 1rem;
  }

  .encrypted-help-toast {
    font-size: 0.8125rem;
    line-height: 1.4;
    text-align: center;
    padding: 0.25rem 0;
  }

  .toast-dismiss {
    background: none;
    border: none;
    color: var(--brand-text);
    font-weight: 600;
    font-size: 0.8125rem;
    font-family: inherit;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    -webkit-tap-highlight-color: transparent;
  }
</style>
