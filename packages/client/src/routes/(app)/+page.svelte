<script lang="ts">
  import { getContext } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { createQuery } from "@tanstack/svelte-query";
  import { Notification } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { trpc } from "$lib/trpc/index.js";
  import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
  import type { TicketPreviewItemProps } from "$lib/components/dashboard/types.js";
  import StatCard from "$lib/components/dashboard/StatCard.svelte";
  import TicketPreviewList from "$lib/components/dashboard/TicketPreviewList.svelte";
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

  // Dashboard stat counts derived from the ticket list.
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

  // Decrypted titles keyed by ticket ID. SvelteMap is reactive without $state.
  const decryptedTitles = new SvelteMap<string, string>();

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
    return {
      ticketId: t.id,
      title: decryptedTitles.get(t.id),
      status: t.status,
      priority: t.priority,
      onHold: t.onHold,
      assignedTo: t.assignedTo,
      createdAt: new Date(t.createdAt),
    };
  }

  // Navigation handlers (route file owns navigation per code standards).
  function handleStatTap(filterParam: string): void {
    void goto(resolve(`/tickets?filter=${encodeURIComponent(filterParam)}`));
  }

  function handleTicketTap(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}`));
  }

  function handleSeeAllMyOpen(): void {
    void goto(resolve("/tickets?filter=my-open"));
  }

  function handleSeeAllUnassigned(): void {
    void goto(resolve("/tickets?filter=unassigned"));
  }

  // Login summary notification slot (6k provides content).
  let exposureNotificationVisible = $state(false);

  function dismissExposureNotification(): void {
    exposureNotificationVisible = false;
  }
</script>

<div class="dashboard">
  <Notification
    role="alert"
    opened={exposureNotificationVisible}
    title={m.dashboard_exposure_title()}
    subtitle={m.dashboard_exposure_subtitle()}
    onClose={dismissExposureNotification}
  />

  <QueryLoader query={ticketsQuery} skeletonLines={8}>
    {#snippet children(tickets)}
      <div class="stat-grid" data-total={tickets.length}>
        <StatCard
          label={m.dashboard_stat_my_open()}
          count={myOpen.length}
          filterParam="my-open"
          accentColor="var(--brand-text)"
          ontap={handleStatTap}
        />
        <StatCard
          label={m.dashboard_stat_unassigned()}
          count={unassigned.length}
          filterParam="unassigned"
          accentColor="#34c759"
          ontap={handleStatTap}
        />
        <StatCard
          label={m.dashboard_stat_on_hold()}
          count={onHold.length}
          filterParam="on-hold"
          accentColor="#ff9500"
          ontap={handleStatTap}
        />
      </div>

      <TicketPreviewList
        heading={m.dashboard_section_my_tickets()}
        tickets={myOpen.map(toPreviewProps)}
        ontickettap={handleTicketTap}
        onseeall={handleSeeAllMyOpen}
      />

      <TicketPreviewList
        heading={m.dashboard_section_unassigned()}
        tickets={unassigned.map(toPreviewProps)}
        ontickettap={handleTicketTap}
        onseeall={handleSeeAllUnassigned}
      />
    {/snippet}
  </QueryLoader>
</div>

<style>
  .dashboard {
    padding: 0.5rem 0;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 0 0.8rem;
    margin-bottom: 0.5rem;
  }
</style>
