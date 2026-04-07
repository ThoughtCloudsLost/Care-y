<!--
  Ticket detail chat view: the workhorse screen where volunteers spend most
  of their time.

  This is a CONTENT component: no shell imports (Navbar, Sheet, Popup, etc.).
  The route file ([id]/+page.svelte) is the glue layer that wraps this in
  AppShell, renders ShellMessagebar, and hosts overlays.

  Data loading: TanStack Query for ticket + follow-ups.
  Decryption: FollowUpDecryptCache (PII-tier Worker) for content,
              OrgDecryptCache (org-key tier, main thread) for display names.
-->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { Messages } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getFollowUpDecryptCache,
    getTicketDecryptCache,
    getOrgDecryptCache,
    getCurrentUserId,
  } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import QueryError from "$lib/components/QueryError.svelte";

  interface TicketDetailProps {
    ticketId: string;
    /** Compose draft text (two-way bindable). */
    draftText?: string;
    onback: () => void;
    oncall: () => void;
    onactions: () => void;
    onclientinfo: () => void;
    onpresetselect: (body: string) => void;
  }

  let {
    ticketId,
    draftText = $bindable(""),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- bubbles and notes trigger these
    onback,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- bubbles and notes trigger these
    oncall,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- bubbles and notes trigger these
    onactions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- bubbles and notes trigger these
    onclientinfo,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- preset reply selection fills compose
    onpresetselect,
  }: TicketDetailProps = $props();

  const ticketCache = getTicketDecryptCache();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- decrypts follow-up content in chat
  const followUpCache = getFollowUpDecryptCache();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- decrypts volunteer display names
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- authorship checks on internal notes
  const currentUserId = $derived(currentUserIdGetter());

  // --- Data Loading ---

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const ticketQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId],
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  const followUpsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "followUps"],
    queryFn: async () =>
      ticketRouter.listFollowUps.query({ ticketId, limit: 50 }),
  }));

  // Ticket data shortcuts.
  const ticket = $derived(ticketQuery.data);
  const followUps = $derived(followUpsQuery.data ?? []);
  const clientAlias = $derived(ticket?.clientAlias ?? "...");

  // Decrypt ticket title (warm the cache for display elsewhere).
  $effect(() => {
    if (ticket) {
      ticketCache.decryptTitle(
        ticket.id,
        ticket.keyWrap,
        ticket.encryptedTitle,
      );
    }
  });

  // --- Scroll container ---

  let scrollContainerEl: HTMLDivElement | undefined = $state();

  // Track whether initial scroll has happened. Only auto-scroll once
  // on first data load, not on every reactive update.
  let hasScrolledInitially = false;

  $effect(() => {
    if (followUps.length > 0 && scrollContainerEl && !hasScrolledInitially) {
      hasScrolledInitially = true;
      const el = scrollContainerEl;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  });
</script>

{#if ticketQuery.isLoading}
  <div class="detail-loading">
    <Skeleton lines={12} />
  </div>
{:else if ticketQuery.isError}
  <div class="detail-error">
    <QueryError error={ticketQuery.error} />
  </div>
{:else if ticket}
  <div
    class="chat-container"
    bind:this={scrollContainerEl}
    role="log"
    aria-label={m.ticket_conversation_with({ alias: clientAlias })}
  >
    {#if followUpsQuery.isLoading}
      <Skeleton lines={6} />
    {:else if followUps.length === 0}
      <div class="empty-chat" role="status">
        <p>{m.empty_no_data()}</p>
      </div>
    {:else}
      <Messages>
        <!-- Follow-up bubbles, system events, and notes render here. -->
        <!-- Pagination sentinel and unread divider added separately. -->
      </Messages>
    {/if}
  </div>
{/if}

<style>
  .detail-loading,
  .detail-error {
    padding: 1rem var(--page-pad-x);
  }

  .chat-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    /* Leave space for the fixed ShellMessagebar at the bottom */
    padding-bottom: 4.5rem;
  }

  .empty-chat {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    font-size: var(--text-base);
    padding: 2rem;
  }
</style>
