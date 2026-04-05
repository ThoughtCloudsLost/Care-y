<script lang="ts">
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { Segmented, SegmentedButton } from "konsta/svelte";
  import { List, LayoutGrid } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getTicketDecryptCache,
    getOrgDecryptCache,
    getCurrentUserId,
    setPreviewLoader,
  } from "$lib/crypto/context.js";
  import { createPreviewLoader } from "$lib/tickets/preview-loader.svelte.js";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";
  import { sortTickets } from "$lib/tickets/sort-tickets.js";
  import { filterStore } from "$lib/stores/filters.svelte.js";
  import { viewModeStore } from "$lib/stores/view-mode.svelte.js";
  import type {
    TicketCardProps,
    TicketQuickAction,
  } from "$lib/components/tickets/ticket-types.js";
  import type { TicketStatus, TicketPriority } from "@care-y/shared";

  import { RouterNotAvailableError } from "$lib/errors.js";
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import QueryError from "$lib/components/QueryError.svelte";

  // Type guards: server returns string-typed fields; Zod validates on the
  // server side, so these always pass at runtime. Using guards instead of
  // `as` casts satisfies no-unsafe-type-assertion.
  const VALID_STATUSES = new Set<string>(["open", "closed"]);
  function asTicketStatus(s: string): TicketStatus {
    if (VALID_STATUSES.has(s)) return s as TicketStatus; // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion -- guarded by Set check
    return "open";
  }

  const VALID_PRIORITIES = new Set<string>(["low", "normal", "high", "urgent"]);
  function asTicketPriority(p: string): TicketPriority {
    if (VALID_PRIORITIES.has(p)) return p as TicketPriority; // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion -- guarded by Set check
    return "normal";
  }

  const ticketCache = getTicketDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  // Scroll container ref: Konsta Page (.k-page) is the scroll ancestor.
  // Queried from DOM on mount because it lives in AppShell, not this route.
  let scrollEl: HTMLElement | undefined = $state();

  onMount(() => {
    scrollEl = document.querySelector<HTMLElement>(".k-page") ?? undefined;
  });

  // Preview loader: batch-fetches encrypted follow-up data for card previews.
  // Created per-route and set in context so TicketCard children can call observe().
  const previewLoader = createPreviewLoader({
    queryFn: async (ids) =>
      ticketRouter.recentFollowUps.query({ ticketIds: ids, perTicket: 3 }),
  });
  setPreviewLoader(previewLoader);

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

  // Client-side sort (server returns keyset order).
  const sortedTickets = $derived(
    sortTickets(displayFiltered, filterStore.sort),
  );

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
  function toCardProps(t: TicketRecord): TicketCardProps {
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
      queueName: t.queueName,
      displayStatus: deriveDisplayStatus(
        asTicketStatus(t.status),
        t.onHold,
        t.followUpCount,
      ),
      priority: asTicketPriority(t.priority),
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
      onaction: handleAction,
    };
  }

  function handleTicketTap(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}`));
  }

  function handleAction(ticketId: string, action: TicketQuickAction): void {
    // Quick actions call existing tRPC mutations.
    // Full implementation wired when SwipeableCard lands.
    if (import.meta.env.DEV) {
      console.log(`[TicketList] action: ${action} on ${ticketId}`);
    }
  }

  function loadNextPage(): void {
    if (ticketsQuery.hasNextPage && !ticketsQuery.isFetchingNextPage) {
      void ticketsQuery.fetchNextPage();
    }
  }

  const gridColumns = $derived(viewModeStore.mode === "grid" ? 2 : 1);
</script>

<div class="ticket-page pb-20">
  <h1 class="sr-only">{m.tickets_title()}</h1>
  <div class="ticket-controls">
    <!-- FilterPillBar placeholder: wired when filter UI lands. -->
    <div class="filter-placeholder" aria-label={m.tickets_filter()}></div>
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

  {#if ticketsQuery.isLoading}
    <Skeleton lines={8} />
  {:else if ticketsQuery.isError}
    <QueryError error={ticketsQuery.error} />
  {:else}
    <div class="ticket-list" class:grid-view={viewModeStore.mode === "grid"}>
      <VirtualList
        items={sortedTickets}
        scrollContainer={scrollEl}
        estimateHeight={viewModeStore.mode === "grid" ? 240 : 180}
        columns={gridColumns}
        onloadmore={loadNextPage}
      >
        {#snippet children({ item }: { item: TicketRecord; index: number })}
          <TicketCard {...toCardProps(item)} />
        {/snippet}
      </VirtualList>
    </div>

    {#if sortedTickets.length === 0}
      <div class="empty-state" role="status">
        <p>{m.tickets_empty_filter()}</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .ticket-page {
    padding: 0.5rem 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ticket-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .filter-placeholder {
    flex: 1;
    min-width: 0;
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
    gap: 0.5rem;
  }

  .ticket-list.grid-view {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  /* Narrow viewport: single column grid fallback */
  @media (max-width: 359px) {
    .ticket-list.grid-view {
      grid-template-columns: 1fr;
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
    font-size: 0.875rem;
  }
</style>
