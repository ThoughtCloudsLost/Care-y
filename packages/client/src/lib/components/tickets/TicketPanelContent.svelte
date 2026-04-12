<!--
  Unified ticket panel content: ticket description, metadata, actions,
  media gallery, notes, and recent ticket history in a single view.

  Replaces the former ClientInfoContent + TicketActionsContent overlays.
  This is a CONTENT component: no Popup/Sheet shell imports.
  The route file wraps this in ShellPopup.

  Self-contained: reads ticket, attachments, recordings, and follow-ups
  from TanStack Query cache (same keys as TicketDetail, deduplicated).
  Decrypts notes and volunteer names via Svelte context caches.

  Layout follows the iOS Contacts card pattern: prominent call button,
  metadata list, state toggles, then content sections.
-->
<script lang="ts">
  import {
    Block,
    BlockTitle,
    Button,
    List,
    ListItem,
    Toggle,
  } from "konsta/svelte";
  import { Phone } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import StatusDot from "$lib/components/StatusDot.svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import type { DisplayStatus } from "$lib/tickets/display-status.js";
  import { createQuery } from "@tanstack/svelte-query";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getCurrentUserId,
    getTicketDecryptCache,
  } from "$lib/crypto/context.js";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import PanelNotesSection from "./PanelNotesSection.svelte";
  import PanelMediaSection from "./PanelMediaSection.svelte";

  export type TicketAction =
    | "call"
    | "take"
    | "release"
    | "assign"
    | "hold"
    | "unhold"
    | "close"
    | "reopen"
    | "watch"
    | "unwatch"
    | "cancel";

  interface TicketPanelContentProps {
    ticketId: string;
    onaction: (action: TicketAction) => void;
    /** Emitted when a note is tapped. Route closes panel and scrolls to it. */
    onnotetap?: (noteId: string) => void;
    /** Emitted when an image thumbnail is tapped. Route opens lightbox. */
    onlightbox?: (imageUrl: string) => void;
  }

  let { ticketId, onaction, onnotetap, onlightbox }: TicketPanelContentProps =
    $props();

  // --- Context + caches ---

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const ticketCache = getTicketDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  // --- TanStack queries (same keys as TicketDetail, deduplicated) ---

  const ticketQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId],
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  const watchingQuery = createQuery(() => ({
    queryKey: ["isWatching", ticketId],
    queryFn: async () => ticketRouter.isWatching.query({ ticketId }),
    enabled: ticketId !== "",
  }));

  // --- Derived ticket state ---

  const ticket = $derived(ticketQuery.data);
  const keyWrap = $derived(ticket?.keyWrap ?? null);
  const ticketStatus = $derived(ticket?.status ?? "open");
  const isOnHold = $derived(ticket?.onHold ?? false);
  const isAssignedToMe = $derived(
    currentUserId !== undefined && ticket?.assignedTo === currentUserId,
  );
  const isWatching = $derived(watchingQuery.data ?? false);

  const displayStatus = $derived<DisplayStatus>(
    isOnHold ? "hold" : ticketStatus === "closed" ? "closed" : "active",
  );

  const statusLabel = $derived(
    isOnHold
      ? m.ticket_action_hold()
      : ticketStatus === "closed"
        ? m.ticket_action_close()
        : m.ticket_action_open(),
  );

  // Decrypt ticket title via shared cache.
  const decryptedTitle = $derived.by(() => {
    if (ticket == null) return undefined;
    const raw = ticketCache.decryptTitle(
      ticket.id,
      ticket.keyWrap,
      ticket.encryptedTitle,
    );
    if (raw === undefined || isDecryptError(raw)) return undefined;
    return raw;
  });
</script>

<div class="panel-content">
  <!-- Ticket title / description -->
  {#if ticketQuery.isLoading}
    <Block class="!my-0 !mt-2">
      <p class="ticket-title">
        <DecryptPlaceholder length={20} />
      </p>
    </Block>
  {:else if decryptedTitle}
    <Block class="!my-0 !mt-2">
      <p class="ticket-title">{decryptedTitle}</p>
    </Block>
  {/if}

  <!-- Call button -->
  <Block class="!my-3">
    <Button large onclick={() => onaction("call")}>
      <Phone size={18} aria-hidden="true" class="call-icon" />
      {m.ticket_panel_call()}
    </Button>
  </Block>

  <!-- Ticket metadata -->
  <List strong inset class="!my-3">
    <ListItem title={m.ticket_panel_status()}>
      {#snippet after()}
        {#if ticketQuery.isLoading}
          <InlineSkeleton width="6ch" />
        {:else}
          <span class="status-after">
            <StatusDot status={displayStatus} />
            <span class="status-label">{statusLabel}</span>
          </span>
        {/if}
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_panel_opened()}>
      {#snippet after()}
        {#if ticketQuery.isLoading}
          <InlineSkeleton width="4ch" />
        {:else if ticket?.createdAt}
          {formatRelativeTime(new Date(ticket.createdAt))}
        {/if}
      {/snippet}
    </ListItem>
  </List>

  <PanelNotesSection {ticketId} {keyWrap} {onnotetap} />

  <!-- Ticket actions -->
  <List strong inset class="!my-3">
    <ListItem title={m.ticket_action_take()}>
      {#snippet after()}
        <Toggle
          checked={isAssignedToMe}
          onChange={() => onaction(isAssignedToMe ? "release" : "take")}
        />
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_action_hold()}>
      {#snippet after()}
        <Toggle
          checked={isOnHold}
          onChange={() => onaction(isOnHold ? "unhold" : "hold")}
        />
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_action_watch()}>
      {#snippet after()}
        <Toggle
          checked={isWatching}
          onChange={() => onaction(isWatching ? "unwatch" : "watch")}
        />
      {/snippet}
    </ListItem>
  </List>

  <List strong inset class="!my-3">
    <ListItem
      link
      chevron
      title={m.ticket_action_assign()}
      onclick={() => onaction("assign")}
    />
    <ListItem
      link
      title={ticketStatus === "open"
        ? m.ticket_action_close()
        : m.ticket_action_reopen()}
      onclick={() => onaction(ticketStatus === "open" ? "close" : "reopen")}
    >
      {#snippet after()}
        <span class="destructive-text">
          {ticketStatus === "open"
            ? m.ticket_action_close()
            : m.ticket_action_reopen()}
        </span>
      {/snippet}
    </ListItem>
  </List>

  <PanelMediaSection {ticketId} {keyWrap} {onlightbox} />

  <!-- Recent tickets -->
  <BlockTitle class="!mt-6 !-mb-2">{m.ticket_recent_history()}</BlockTitle>
  <Block strong inset class="!my-3 !mb-8">
    <p class="empty-text">{m.ticket_panel_recent_coming_soon()}</p>
  </Block>
</div>

<style>
  .panel-content {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .ticket-title {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    margin: 0;
  }

  :global(.call-icon) {
    margin-right: 0.5rem;
  }

  /* Metadata helpers */
  .status-after {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .status-label {
    font-size: var(--text-sm);
    text-transform: capitalize;
  }

  .destructive-text {
    color: #ef4444;
    font-size: var(--text-sm);
  }

  .empty-text {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    padding: 0.5rem 0;
  }
</style>
