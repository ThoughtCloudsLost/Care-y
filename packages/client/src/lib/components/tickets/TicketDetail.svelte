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
  import { Messages, Message } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getFollowUpDecryptCache,
    getTicketDecryptCache,
    getOrgDecryptCache,
    getCurrentUserId,
    getCurrentUserRoleId,
  } from "$lib/crypto/context.js";
  import { RoleId } from "@care-y/shared";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { SvelteMap } from "svelte/reactivity";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { formatDateSeparator, needsDateSeparator } from "$lib/utils/time.js";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import PrivateNote from "$lib/components/tickets/PrivateNote.svelte";
  import VoicemailPlayer from "$lib/components/tickets/VoicemailPlayer.svelte";
  import MmsImage from "$lib/components/tickets/MmsImage.svelte";
  import AttachmentChip from "$lib/components/tickets/AttachmentChip.svelte";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";

  import {
    getContextMenuActions,
    type ContextActionId,
    type ContextAction,
    type ContextMenuEvent,
  } from "./context-menu-actions.js";

  export type { ContextActionId, ContextAction, ContextMenuEvent };

  interface TicketDetailProps {
    ticketId: string;
    /** Compose draft text (two-way bindable). */
    draftText?: string;
    /** Current cursor position in the compose textarea. */
    cursorPosition?: number;
    onback: () => void;
    oncall: () => void;
    onactions: () => void;
    onclientinfo: () => void;
    onpresetselect: (body: string) => void;
    /** Called when a volunteer is selected from @mention autocomplete. */
    onmentionselect?: (userId: string, displayName: string) => void;
    /** Called when an MMS image is tapped. Route file opens lightbox. */
    onlightbox?: (imageUrl: string) => void;
    /** Called when a long-press context menu should open. */
    oncontextmenu?: (event: ContextMenuEvent) => void;
    /** Called when a note edit is saved (plaintext). Route encrypts + submits. */
    onnoteedit?: (followUpId: string, newPlaintext: string) => void;
    /** The follow-up ID currently in edit mode (set by route after context menu). */
    editingFollowUpId?: string | null;
    /** Whether a note edit mutation is in flight. */
    savingNote?: boolean;
    /** Called when editing is cancelled (route clears editingFollowUpId). */
    oncanceledit?: () => void;
  }

  let {
    ticketId,
    draftText = $bindable(""),
    cursorPosition = 0,
    onback,
    oncall,
    onactions,
    onclientinfo,
    onpresetselect,
    onmentionselect,
    onlightbox,
    oncontextmenu,
    onnoteedit,
    editingFollowUpId = null,
    savingNote = false,
    oncanceledit,
  }: TicketDetailProps = $props();

  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const currentUserRoleIdGetter = getCurrentUserRoleId();
  const currentUserRoleId = $derived(currentUserRoleIdGetter());
  const isAdmin = $derived(currentUserRoleId === RoleId.ADMIN);

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

  const recordingsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "recordings"],
    queryFn: async () => ticketRouter.listRecordings.query({ ticketId }),
  }));

  const attachmentsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "attachments"],
    queryFn: async () => ticketRouter.listAttachments.query({ ticketId }),
  }));

  // Ticket data shortcuts.
  const ticket = $derived(ticketQuery.data);
  const followUps = $derived(followUpsQuery.data ?? []);
  const clientAlias = $derived(ticket?.clientAlias ?? "...");
  const recordings = $derived(recordingsQuery.data ?? []);
  const attachments = $derived(attachmentsQuery.data ?? []);

  // Build followUpId -> media lookup maps for rendering media inside bubbles.
  const recordingsByFollowUp = $derived.by(() => {
    const map = new SvelteMap<string, typeof recordings>();
    for (const rec of recordings) {
      if (rec.followupId === null) continue;
      const list = map.get(rec.followupId) ?? [];
      list.push(rec);
      map.set(rec.followupId, list);
    }
    return map;
  });

  const attachmentsByFollowUp = $derived.by(() => {
    const map = new SvelteMap<string, typeof attachments>();
    for (const att of attachments) {
      if (att.followupId === null) continue;
      const list = map.get(att.followupId) ?? [];
      list.push(att);
      map.set(att.followupId, list);
    }
    return map;
  });

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

  // --- Follow-up rendering helpers ---

  type FollowUp = (typeof followUps)[number];

  function followUpKind(fu: FollowUp): "message" | "system" | "note" {
    if (fu.source === "system") return "system";
    if (fu.type === "internal_note") return "note";
    return "message";
  }

  function messageType(fu: FollowUp): "sent" | "received" {
    return fu.source === "client" ? "received" : "sent";
  }

  function bubbleAriaLabel(fu: FollowUp, content: string | undefined): string {
    const time = formatRelativeTime(new Date(fu.createdAt));
    const preview = isDecryptError(content)
      ? m.error_decryption_failed()
      : (content?.slice(0, 80) ?? "");
    const base =
      fu.source === "client"
        ? m.ticket_message_received_from({ name: clientAlias, time })
        : m.ticket_message_sent_by({ name: "Volunteer", time });
    return preview ? `${base}: ${preview}` : base;
  }

  // --- Long-press handler ---

  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  function startLongPress(fu: FollowUp): (e: PointerEvent) => void {
    return () => {
      longPressTimer = setTimeout(() => {
        openContextMenu(fu);
        longPressTimer = null;
      }, 500);
    };
  }

  function cancelLongPress(): void {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function openContextMenu(fu: FollowUp): void {
    const actions = getContextMenuActions(fu, currentUserId, isAdmin, {
      copy: m.common_copy(),
      editNote: m.ticket_edit_note(),
      deleteNote: m.ticket_delete_note(),
    });
    if (actions.length === 0 || !ticket) return;

    const content = followUpCache.decryptContent(
      fu.id,
      ticket.keyWrap,
      fu.encryptedContent,
    );
    const plaintext = isDecryptError(content) ? undefined : content;

    oncontextmenu?.({ followUpId: fu.id, actions, plaintext });
  }

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
        {#each followUps as fu, i (fu.id)}
          {@const kind = followUpKind(fu)}
          {@const content = followUpCache.decryptContent(
            fu.id,
            ticket.keyWrap,
            fu.encryptedContent,
          )}
          {@const prevTimestamp =
            i > 0 ? followUps[i - 1]?.createdAt : undefined}

          {#if needsDateSeparator(fu.createdAt, prevTimestamp)}
            <div class="date-separator" role="separator">
              <span class="date-separator-label"
                >{formatDateSeparator(fu.createdAt)}</span
              >
            </div>
          {/if}

          {#if kind === "system"}
            <SystemEvent {content} timestamp={fu.createdAt} />
          {:else if kind === "note"}
            <PrivateNote
              {content}
              authorName={undefined}
              timestamp={fu.createdAt}
              isOwn={fu.createdBy === currentUserId}
              editing={editingFollowUpId === fu.id}
              saving={editingFollowUpId === fu.id && savingNote}
              onedit={(newText: string) => onnoteedit?.(fu.id, newText)}
              {oncanceledit}
              onpointerdown={startLongPress(fu)}
              onpointerup={cancelLongPress}
              onpointercancel={cancelLongPress}
            />
          {:else}
            {@const fuRecordings = recordingsByFollowUp.get(fu.id) ?? []}
            {@const fuAttachments = attachmentsByFollowUp.get(fu.id) ?? []}
            <Message
              type={messageType(fu)}
              name={fu.source === "client" ? clientAlias : undefined}
              aria-label={bubbleAriaLabel(fu, content)}
            >
              {#snippet text()}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span
                  class="bubble-text"
                  onpointerdown={startLongPress(fu)}
                  onpointerup={cancelLongPress}
                  onpointercancel={cancelLongPress}
                >
                  {#if isDecryptError(content)}
                    <span class="decrypt-error"
                      >{m.error_decryption_failed()}</span
                    >
                  {:else if content === undefined}
                    <span class="shimmer shimmer-bubble" aria-busy="true"
                    ></span>
                  {:else if content}
                    {content}
                  {/if}
                </span>

                {#each fuRecordings as rec (rec.id)}
                  <VoicemailPlayer
                    recordingId={rec.id}
                    {ticketId}
                    keyWrap={ticket.keyWrap}
                    durationSeconds={rec.durationSeconds}
                  />
                {/each}

                {#each fuAttachments as att (att.id)}
                  {#if att.contentType?.startsWith("image/")}
                    <MmsImage
                      attachmentId={att.id}
                      {ticketId}
                      keyWrap={ticket.keyWrap}
                      alt={m.ticket_mms_image()}
                      onopen={(url: string) => onlightbox?.(url)}
                    />
                  {:else}
                    <AttachmentChip
                      attachmentId={att.id}
                      {ticketId}
                      keyWrap={ticket.keyWrap}
                      filename={att.encryptedFilename !== null ? "..." : "file"}
                      sizeBytes={att.sizeBytes}
                    />
                  {/if}
                {/each}
              {/snippet}
              {#snippet footer()}
                <time class="bubble-time" datetime={fu.createdAt}>
                  {formatRelativeTime(new Date(fu.createdAt))}
                </time>
              {/snippet}
            </Message>
          {/if}
        {/each}
      </Messages>
    {/if}
  </div>

  <div class="mention-anchor">
    <MentionAutocomplete
      {draftText}
      {cursorPosition}
      onselect={(userId: string, displayName: string) =>
        onmentionselect?.(userId, displayName)}
    />
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

  .mention-anchor {
    position: fixed;
    bottom: 3.5rem;
    left: 0;
    right: 0;
    z-index: 25;
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

  /* --- Date separators --- */

  .date-separator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem 0.25rem;
  }

  .date-separator::before,
  .date-separator::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--muted);
    opacity: 0.3;
  }

  .date-separator-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--muted);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  /* --- Bubble content --- */

  .bubble-text {
    user-select: text;
    -webkit-user-select: text;
    word-break: break-word;
    touch-action: pan-y;
  }

  .bubble-time {
    font-size: 0.625rem;
    color: var(--muted);
  }

  .decrypt-error {
    color: var(--muted);
    font-style: italic;
  }

  .shimmer-bubble {
    display: inline-block;
    width: 8rem;
    height: 0.875rem;
    border-radius: 0.25rem;
    background: linear-gradient(
      90deg,
      var(--surface-2) 25%,
      var(--surface-1) 50%,
      var(--surface-2) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shimmer-bubble {
      animation: none;
      background: var(--surface-2);
    }
  }
</style>
