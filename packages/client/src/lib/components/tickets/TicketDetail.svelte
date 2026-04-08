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
  import { tick } from "svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { Messages, Message } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getFollowUpDecryptCache,
    getTicketDecryptCache,
    getCurrentUserId,
    getCurrentUserRoleId,
  } from "$lib/crypto/context.js";
  import { RoleId } from "@care-y/shared";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
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
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import ChatZoom from "$lib/components/tickets/ChatZoom.svelte";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";

  import {
    getContextMenuActions,
    type ContextMenuEvent,
  } from "./context-menu-actions.js";

  interface TicketDetailProps {
    ticketId: string;
    /** Compose draft text (two-way bindable). */
    draftText?: string;
    /** Current cursor position in the compose textarea. */
    cursorPosition?: number;
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
    /** Two-way bindable: whether the chat is zoomed out. */
    chatZoomed?: boolean;
  }

  let {
    ticketId,
    draftText = $bindable(""),
    cursorPosition = 0,
    onmentionselect,
    onlightbox,
    oncontextmenu,
    onnoteedit,
    editingFollowUpId = null,
    savingNote = false,
    oncanceledit,
    chatZoomed = $bindable(false),
  }: TicketDetailProps = $props();

  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const currentUserRoleIdGetter = getCurrentUserRoleId();
  const currentUserRoleId = $derived(currentUserRoleIdGetter());
  const isAdmin = $derived(currentUserRoleId === RoleId.ADMIN);

  // --- Data Loading ---

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const queryClient = useQueryClient();

  const PAGE_SIZE = 50;

  const ticketQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId],
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  // Initial query: most recent PAGE_SIZE follow-ups (direction='older', no cursor).
  const initialFollowUpsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "followUps", "initial"],
    queryFn: async () =>
      ticketRouter.listFollowUps.query({
        ticketId,
        limit: PAGE_SIZE,
        direction: "older",
      }),
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
  const clientAlias = $derived(ticket?.clientAlias ?? "...");
  const recordings = $derived(recordingsQuery.data ?? []);
  const attachments = $derived(attachmentsQuery.data ?? []);

  // --- Pagination state ---

  type FollowUpRecord = Awaited<
    ReturnType<typeof ticketRouter.listFollowUps.query>
  >[number];

  // Older pages prepended as they load. Each page is already in
  // chronological order (server reverses DESC results).
  let olderPages = $state<FollowUpRecord[][]>([]);
  let hasMoreOlder = $state(true);
  let loadingOlder = $state(false);

  // Seed olderPages from the initial query once it resolves.
  $effect(() => {
    const data = initialFollowUpsQuery.data;
    if (!data) return;
    // Only seed once (when olderPages is empty and initial data arrives).
    if (olderPages.length === 0 && data.length > 0) {
      olderPages = [data];
      if (data.length < PAGE_SIZE) hasMoreOlder = false;
    }
  });

  // Flatten all pages into a single chronological array (oldest first).
  const followUps = $derived(olderPages.flat());

  async function loadOlderPage(): Promise<void> {
    if (loadingOlder || !hasMoreOlder || followUps.length === 0) return;
    loadingOlder = true;

    const oldestId = followUps[0]?.id;
    if (oldestId === undefined) {
      loadingOlder = false;
      return;
    }

    try {
      const older = await queryClient.fetchQuery({
        queryKey: ["ticket", ticketId, "followUps", "page", oldestId],
        queryFn: async () =>
          ticketRouter.listFollowUps.query({
            ticketId,
            limit: PAGE_SIZE,
            cursor: oldestId,
            direction: "older",
          }),
      });

      if (older.length < PAGE_SIZE) hasMoreOlder = false;
      if (older.length > 0) {
        // Preserve scroll position: measure before prepend, restore after.
        const el = scrollContainerEl;
        const prevScrollHeight = el?.scrollHeight ?? 0;
        const prevScrollTop = el?.scrollTop ?? 0;

        olderPages = [older, ...olderPages];

        requestAnimationFrame(() => {
          if (!el) return;
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
        });
      }
    } finally {
      loadingOlder = false;
    }
  }

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

  /** Keyboard equivalent for long-press context menu (Shift+F10). */
  function handleBubbleKeydown(fu: FollowUp): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      if (e.key === "F10" && e.shiftKey) {
        e.preventDefault();
        openContextMenu(fu);
      }
    };
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

  // --- Unread divider ---

  // The oblivious read pattern (5a) means we track read state client-side.
  // A follow-up is "read" if the client has previously marked it via
  // the encrypted read state. Track locally via a Set populated from
  // the initial query's read markers.
  let readFollowUpIds: SvelteSet<string> = new SvelteSet<string>();

  // Seed read state from initial data. Follow-ups with a non-null
  // encrypted_read_state that differs from the initial dummy are "read."
  // Since we can't distinguish dummy from real without decryption, we
  // treat all follow-ups from before the initial load as read, and only
  // the ones arriving after initial load as potentially unread.
  // For now, use a simpler heuristic: mark all follow-ups loaded in the
  // initial page as read (the user has seen them before or is seeing them now).
  $effect(() => {
    const data = initialFollowUpsQuery.data;
    if (!data) return;
    const ids = new SvelteSet<string>();
    for (const fu of data) {
      ids.add(fu.id);
    }
    readFollowUpIds = ids;
  });

  const firstUnreadId = $derived(
    followUps.find((fu) => !readFollowUpIds.has(fu.id))?.id ?? null,
  );

  // --- ChatZoom data ---

  const earliestDate = $derived(
    followUps.length > 0 ? followUps[0]?.createdAt : undefined,
  );
  const latestDate = $derived(
    followUps.length > 0
      ? followUps[followUps.length - 1]?.createdAt
      : undefined,
  );

  // --- Scroll container ---

  let scrollContainerEl: HTMLDivElement | undefined = $state();

  // Track whether user is near bottom (within 100px) for auto-scroll decisions.
  let isNearBottom = $state(true);

  function onScroll(): void {
    if (!scrollContainerEl) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerEl;
    isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
  }

  // Track whether initial scroll has happened. Only auto-scroll once
  // on first data load, not on every reactive update.
  let hasScrolledInitially = false;

  $effect(() => {
    if (followUps.length > 0 && scrollContainerEl && !hasScrolledInitially) {
      hasScrolledInitially = true;
      const el = scrollContainerEl;

      requestAnimationFrame(() => {
        if (firstUnreadId !== null) {
          // Scroll to the unread divider so the user sees where they left off.
          const divider = document.getElementById(`unread-divider`);
          divider?.scrollIntoView({ behavior: "auto", block: "start" });
        } else {
          // All read: scroll to bottom.
          el.scrollTop = el.scrollHeight;
        }
      });
    }
  });

  // Auto-scroll when new follow-ups arrive via SSE and user was near bottom.
  const followUpCount = $derived(followUps.length);

  $effect(() => {
    // Reading followUpCount registers the dependency.
    if (followUpCount === 0) return;

    if (isNearBottom && hasScrolledInitially) {
      void tick().then(() => {
        scrollContainerEl?.scrollTo({
          top: scrollContainerEl.scrollHeight,
          behavior: "smooth",
        });
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
    onscroll={onScroll}
    role="log"
    aria-label={m.ticket_conversation_with({ alias: clientAlias })}
  >
    {#if initialFollowUpsQuery.isLoading}
      <Skeleton lines={6} />
    {:else if followUps.length === 0}
      <div class="empty-chat" role="status">
        <p>{m.empty_no_data()}</p>
      </div>
    {:else}
      {#if loadingOlder}
        <div class="loading-older" role="status" aria-live="polite">
          <span>{m.ticket_loading_older()}</span>
        </div>
      {/if}

      <ChatZoom
        {scrollContainerEl}
        totalMessages={followUps.length}
        {earliestDate}
        {latestDate}
        bind:zoomed={chatZoomed}
      >
        <Messages>
          <VirtualList
            items={followUps}
            scrollContainer={scrollContainerEl}
            estimateHeight={80}
            columns={1}
            getKey={(fu: FollowUpRecord) => fu.id}
            onloadprevious={hasMoreOlder ? loadOlderPage : undefined}
          >
            {#snippet children({
              item,
              index: i,
            }: {
              item: FollowUpRecord;
              index: number;
            })}
              {@const fu = item}
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

              {#if fu.id === firstUnreadId}
                <div
                  id="unread-divider"
                  class="unread-divider"
                  role="separator"
                  aria-label={m.ticket_new_messages()}
                >
                  <span class="unread-divider-label"
                    >{m.ticket_new_messages()}</span
                  >
                </div>
              {/if}

              <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
              <div
                id="fu-{fu.id}"
                data-fu-id={fu.id}
                tabindex={kind === "system" ? undefined : 0}
                role={kind === "system" ? undefined : "article"}
                aria-label={kind === "system"
                  ? undefined
                  : bubbleAriaLabel(fu, content)}
                onkeydown={kind === "system"
                  ? undefined
                  : handleBubbleKeydown(fu)}
              >
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
                  {@const fuAttachments =
                    attachmentsByFollowUp.get(fu.id) ?? []}
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
                            filename={att.encryptedFilename !== null
                              ? "..."
                              : "file"}
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
              </div>
            {/snippet}
          </VirtualList>
        </Messages>
      </ChatZoom>
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

  /* --- Loading older messages --- */

  .loading-older {
    display: flex;
    justify-content: center;
    padding: 0.75rem 1rem;
    color: var(--muted);
    font-size: 0.75rem;
  }

  /* --- Unread divider --- */

  .unread-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
  }

  .unread-divider::before,
  .unread-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--brand-primary, #e53e3e);
    opacity: 0.6;
  }

  .unread-divider-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--brand-primary, #e53e3e);
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
