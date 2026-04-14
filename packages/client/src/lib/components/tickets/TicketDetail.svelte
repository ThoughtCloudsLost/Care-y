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
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import {
    buildVolunteerMap,
    resolveVolunteerName as resolveVolName,
  } from "$lib/tickets/resolve-volunteer.js";
  import {
    getFollowUpDecryptCache,
    getTicketDecryptCache,
    getOrgDecryptCache,
    getOrgKeyManager,
    getPreviewLoader,
    getCurrentUserId,
    getCurrentUserRoleId,
  } from "$lib/crypto/context.js";
  import { RoleId } from "@care-y/shared";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import {
    type DecryptResult,
    resolveAsyncDecrypt,
    matchDecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { createTicketDecryptScope } from "$lib/crypto/ticket-decrypt-scope.js";
  import { SvelteMap } from "svelte/reactivity";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { formatDateSeparator, needsDateSeparator } from "$lib/utils/time.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import PrivateNote from "$lib/components/tickets/PrivateNote.svelte";
  import FollowUpMedia from "$lib/components/tickets/FollowUpMedia.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import ChatZoom from "$lib/components/tickets/ChatZoom.svelte";
  import type {
    TimelineItem,
    ClusterRecord,
  } from "$lib/components/tickets/chat-zoom-types.js";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";

  import { createScrollManager } from "$lib/tickets/scroll-manager.svelte.js";
  import { createChatPaginator } from "$lib/tickets/chat-paginator.svelte.js";
  import {
    getContextMenuActions,
    type ContextMenuEvent,
  } from "./context-menu-actions.js";

  interface TicketDetailProps {
    ticketId: string;
    /** Known follow-up count from the ticket list cache (available immediately). */
    knownFollowUpCount?: number;
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
    /** Two-way bindable: whether the timeline TOC view is active. */
    timelineActive?: boolean;
    /** Decrypted read cursor: undefined = still loading, null = all unread, Date = read up to. */
    readUpTo?: Date | null | undefined;
    /** Called when the latest visible follow-up timestamp changes (for read cursor updates). */
    onreadprogress?: (latestVisibleTimestamp: string) => void;
  }

  let {
    ticketId,
    knownFollowUpCount,
    draftText = $bindable(""),
    cursorPosition = 0,
    onmentionselect,
    onlightbox,
    oncontextmenu,
    onnoteedit,
    editingFollowUpId = null,
    savingNote = false,
    oncanceledit,
    timelineActive = $bindable(false),
    readUpTo,
    onreadprogress,
  }: TicketDetailProps = $props();

  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const previewLoader = getPreviewLoader();
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

  // Volunteer list (cached, shared with MentionAutocomplete).
  const volunteersQuery = createVolunteersQuery(ticketRouter);

  // Ticket data shortcuts.
  const ticket = $derived(ticketQuery.data);
  const clientAlias = $derived(ticket?.clientAlias ?? "...");

  // Reactive userId -> decrypted display name lookup for note authors.
  const volunteerMap = $derived(buildVolunteerMap(volunteersQuery.data));
  function resolveVolunteerName(userId: string | null): string | undefined {
    return resolveVolName(userId, volunteerMap, orgCache);
  }

  // Pre-bound decrypt scope for the current ticket.
  const decrypt = $derived(
    ticket != null
      ? createTicketDecryptScope({
          ticketCache,
          followUpCache,
          orgCache,
          orgKeyManager,
          ticketId: ticket.id,
          keyWrap: ticket.keyWrap,
        })
      : null,
  );

  // --- Pagination ---

  type FollowUpRecord = Awaited<
    ReturnType<typeof ticketRouter.listFollowUps.query>
  >[number];

  const paginator = createChatPaginator({
    pageSize: PAGE_SIZE,
    queryClient,
    getTicketId: () => ticketId,
    fetchPage: async (cursor) =>
      ticketRouter.listFollowUps.query({
        ticketId,
        limit: PAGE_SIZE,
        cursor,
        direction: "older",
      }),
    getScrollContainer: () => scroll.scrollContainerEl,
  });

  // Seed paginator from the initial query once it resolves.
  $effect(() => {
    const data = initialFollowUpsQuery.data;
    if (data) paginator.seed(data);
  });

  // Local aliases for readability in template and downstream $derived.
  const followUps = $derived(paginator.items);
  const hasMoreOlder = $derived(paginator.hasMore);
  const loadingOlder = $derived(paginator.loadingOlder);

  // --- Timeline summary query (fetched lazily when zoomed) ---

  const summaryQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "followUpSummary"],
    queryFn: async () => ticketRouter.listFollowUpSummary.query({ ticketId }),
    enabled: timelineActive,
  }));

  // Build timeline items from the summary endpoint response.
  const timelineItems = $derived.by((): TimelineItem[] =>
    (summaryQuery.data ?? []).map((fu) => ({
      id: fu.id,
      source: fu.source,
      type: fu.type,
      createdAt: fu.createdAt,
      encryptedContent: fu.encryptedContent,
      hasRecording: fu.hasRecording,
      recordingDurationSeconds: fu.recordingDurationSeconds,
      hasImage: fu.hasImage,
      hasFile: fu.hasFile,
    })),
  );

  // Decrypt system event and note content for timeline display.
  // Patches incrementally: skips items already resolved, only processes new ones.
  //
  // Uses a plain Set (not SvelteSet) to track resolved IDs so that writes
  // to timelineDecryptedContent don't re-trigger this effect. The only
  // re-run triggers are followUpCache's internal SvelteMap updates (when a
  // Worker completes decryption) and summaryQuery.data changes.
  const timelineDecryptedContent = new SvelteMap<string, string | undefined>();
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- intentionally non-reactive to avoid feedback loop in the $effect below
  const resolvedIds = new Set<string>();

  // Clear when switching tickets.
  $effect(() => {
    // Read ticketId to track it as a dependency.
    void ticketId;
    timelineDecryptedContent.clear();
    resolvedIds.clear();
  });

  $effect(() => {
    if (!ticket) return;
    for (const item of summaryQuery.data ?? []) {
      if (item.encryptedContent === null) continue;
      if (resolvedIds.has(item.id)) continue;
      const content = followUpCache.decryptContent(
        item.id,
        ticket.keyWrap,
        item.encryptedContent,
      );
      if (content !== undefined) {
        resolvedIds.add(item.id);
        timelineDecryptedContent.set(
          item.id,
          isDecryptError(content) ? undefined : content,
        );
      }
    }
  });

  // --- Expandable timeline clusters ---

  const expandedClusters = new SvelteMap<string, ClusterRecord[]>();

  async function handleExpandCluster(followUpIds: string[]): Promise<void> {
    const key = followUpIds.join(",");
    if (expandedClusters.has(key) || !ticket) return;

    // Expand immediately with placeholder rows.
    const placeholders: ClusterRecord[] = followUpIds.map((id) => {
      const summary = (summaryQuery.data ?? []).find((s) => s.id === id);
      return {
        id,
        source: summary?.source ?? "volunteer",
        encryptedContent: null,
        createdAt: summary?.createdAt ?? "",
      };
    });
    expandedClusters.set(key, placeholders);

    // Fetch full follow-ups by IDs.
    const fullRecords = await queryClient.fetchQuery({
      queryKey: ["ticket", ticketId, "followUpsByIds", key],
      queryFn: async () =>
        ticketRouter.listFollowUpsByIds.query({ ticketId, followUpIds }),
    });

    // Replace placeholders with real records. Decryption happens reactively
    // in ChatZoom's template via followUpCache.decryptContent.
    const records: ClusterRecord[] = fullRecords.map((fu) => ({
      id: fu.id,
      source: fu.source,
      encryptedContent: fu.encryptedContent,
      createdAt: fu.createdAt,
    }));
    expandedClusters.set(key, records);
  }

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

  function messageType(fu: FollowUp): "sent" | "received" {
    return fu.source === "client" ? "received" : "sent";
  }

  function bubbleAriaLabel(fu: FollowUp, fuResult: DecryptResult): string {
    const time = formatRelativeTime(new Date(fu.createdAt));
    const preview = matchDecryptResult(fuResult, {
      loading: () => "",
      ready: (v) => v.slice(0, 80),
      denied: () => m.decrypt_placeholder_denied(),
      error: () => m.error_decryption_failed(),
    });
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

  // Clear pending timers on unmount to avoid firing into a dead component.
  $effect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      scroll.cleanup();
    };
  });

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
    if (actions.length === 0 || !decrypt) return;

    const result = decrypt.followUp(fu.id, fu.encryptedContent);
    const plaintext = result.status === "ready" ? result.value : undefined;

    oncontextmenu?.({ followUpId: fu.id, actions, plaintext });
  }

  // --- Unread divider ---

  // Read state is tracked via an encrypted read cursor (one timestamp
  // per volunteer per ticket). Messages with createdAt <= readUpTo are
  // read; messages after are unread. readUpTo is passed as a prop from
  // the route file, which handles decryption and cursor updates.

  const firstUnreadId = $derived.by(() => {
    if (readUpTo === undefined || readUpTo === null) {
      // Still loading or no read cursor: no meaningful unread boundary.
      return null;
    }
    const cutoff = readUpTo.getTime();
    const firstUnread = followUps.find(
      (fu) => new Date(fu.createdAt).getTime() > cutoff,
    );
    return firstUnread?.id ?? null;
  });

  // --- Load all unread messages ---

  // After the initial page loads, check if there are unread messages
  // beyond the loaded range. If so, keep fetching older pages until
  // the read boundary is within the loaded range.
  // Scroll initialization state machine. Fires once per mount:
  //   waiting -> loading (fetch unread pages) -> scrolling -> done
  type ScrollInitPhase = "waiting" | "loading" | "scrolling" | "done";
  let scrollInitPhase = $state<ScrollInitPhase>("waiting");

  $effect(() => {
    if (scrollInitPhase !== "waiting") return;
    if (timelineActive) return;
    if (readUpTo === undefined) return;
    if (!initialFollowUpsQuery.data) return;
    if (followUps.length === 0 || !scroll.scrollContainerEl) return;

    scrollInitPhase = "loading";

    void (async () => {
      if (readUpTo !== null && hasMoreOlder) {
        const oldest = followUps[0];
        if (oldest) {
          const cutoffMs = readUpTo.getTime();
          if (Date.parse(oldest.createdAt) > cutoffMs) {
            await paginator.loadUntilReadBoundary(cutoffMs);
          }
        }
      }

      scrollInitPhase = "scrolling";
      await tick();
      const scrollEl = scroll.scrollContainerEl;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scroll.markScrolledInitially();
          if (firstUnreadId !== null) {
            const divider = document.getElementById("unread-divider");
            divider?.scrollIntoView({ behavior: "auto", block: "start" });
          } else if (scrollEl) {
            scrollEl.scrollTop = scrollEl.scrollHeight;
          }
          scrollInitPhase = "done";
        });
      });
    })();
  });

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

  const scroll = createScrollManager();

  // Auto-scroll when new follow-ups arrive via SSE and user was near bottom.
  const followUpCount = $derived(followUps.length);

  $effect(() => {
    scroll.autoScrollOnNew(followUpCount, timelineActive);
  });

  // --- Loading placeholder shape ---
  // Use cached preview data (from the ticket list) to match the real
  // conversation shape. Falls back to a generic pattern if no preview exists.

  interface PlaceholderBubble {
    kind: "message" | "system";
    type: "sent" | "received";
    length: number;
  }

  // Cycling pattern for placeholder bubbles.
  const placeholderPattern: PlaceholderBubble[] = [
    { kind: "message", type: "received", length: 45 },
    { kind: "message", type: "sent", length: 18 },
    { kind: "message", type: "received", length: 60 },
    { kind: "system", type: "received", length: 15 },
    { kind: "message", type: "sent", length: 30 },
    { kind: "message", type: "received", length: 20 },
  ];

  // Preview data from the ticket list (server returns newest-first, reverse for chat order).
  const previewData = $derived(previewLoader.get(ticketId));
  const orderedPreviews = $derived(
    previewData !== undefined && previewData.length > 0
      ? [...previewData].reverse()
      : [],
  );

  // Total message slots: prop (instant from list cache) > ticket query > fallback.
  // Previews replace the bottom N slots (not added on top).
  const totalSlots = $derived(
    Math.min(knownFollowUpCount ?? ticket?.followUpCount ?? 6, PAGE_SIZE),
  );
  const fillerCount = $derived(
    Math.max(0, totalSlots - orderedPreviews.length),
  );

  const placeholderBubbles = $derived.by((): PlaceholderBubble[] => {
    const result: PlaceholderBubble[] = [];
    for (let i = 0; i < fillerCount; i++) {
      const bubble = placeholderPattern[i % placeholderPattern.length];
      if (bubble) result.push(bubble);
    }
    return result;
  });
</script>

{#if ticketQuery.isLoading}
  <div
    class="chat-container"
    role="log"
    aria-label={m.shell_loading()}
    use:scroll.scrollToBottom
  >
    <Messages>
      {#each placeholderBubbles as bubble, i (i)}
        {#if bubble.kind === "system"}
          <div class="fu-wrapper filler-pulse">
            <div class="system-event-placeholder">
              <DecryptPlaceholder length={bubble.length} />
            </div>
          </div>
        {:else}
          <div class="fu-wrapper filler-pulse">
            <Message type={bubble.type}>
              {#snippet text()}
                <span class="bubble-text">
                  <DecryptPlaceholder length={bubble.length} block />
                </span>
              {/snippet}
              {#snippet footer()}
                <span class="bubble-time">
                  <InlineSkeleton width="4ch" />
                </span>
              {/snippet}
            </Message>
          </div>
        {/if}
      {/each}

      <!-- Preview messages that arrived before the ticket query resolved -->
      {#each orderedPreviews as fu (fu.id)}
        {@const previewResult = resolveAsyncDecrypt(
          followUpCache.decryptContent(fu.id, fu.keyWrap, fu.encryptedContent),
          fu.keyWrap !== null,
        )}
        <div class="fu-wrapper">
          <FollowUpBubble followUp={fu} result={previewResult} {clientAlias} />
        </div>
      {/each}
    </Messages>
  </div>
{:else if ticketQuery.isError}
  <div class="detail-error">
    <QueryError error={ticketQuery.error} />
  </div>
{:else if ticket}
  <div
    class="chat-container"
    bind:this={scroll.scrollContainerEl}
    use:scroll.scrollToBottom
    onscroll={() => scroll.onScroll(followUps, onreadprogress)}
    role="log"
    aria-label={m.ticket_conversation_with({ alias: clientAlias })}
  >
    {#if initialFollowUpsQuery.isLoading}
      <Messages>
        <!-- Filler placeholders to fill the viewport above preview data -->
        {#each placeholderBubbles as bubble, i (i)}
          {#if bubble.kind === "system"}
            <div class="fu-wrapper filler-pulse">
              <div class="system-event-placeholder">
                <DecryptPlaceholder length={bubble.length} />
              </div>
            </div>
          {:else}
            <div class="fu-wrapper filler-pulse">
              <Message type={bubble.type}>
                {#snippet text()}
                  <span class="bubble-text">
                    <DecryptPlaceholder length={bubble.length} block />
                  </span>
                {/snippet}
                {#snippet footer()}
                  <span class="bubble-time">
                    <InlineSkeleton width="4ch" />
                  </span>
                {/snippet}
              </Message>
            </div>
          {/if}
        {/each}

        <!-- Real preview messages from the ticket list (already decrypting) -->
        {#each orderedPreviews as fu (fu.id)}
          {@const previewResult = resolveAsyncDecrypt(
            followUpCache.decryptContent(
              fu.id,
              fu.keyWrap,
              fu.encryptedContent,
            ),
            fu.keyWrap !== null,
          )}
          <div class="fu-wrapper">
            <FollowUpBubble
              followUp={fu}
              result={previewResult}
              {clientAlias}
            />
          </div>
        {/each}
      </Messages>
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
        scrollContainerEl={scroll.scrollContainerEl}
        totalMessages={followUps.length}
        {earliestDate}
        {latestDate}
        items={timelineItems}
        decryptedContent={timelineDecryptedContent}
        {expandedClusters}
        onexpandcluster={handleExpandCluster}
        {followUpCache}
        keyWrap={ticket.keyWrap}
        bind:timelineActive
      >
        <Messages>
          <VirtualList
            items={followUps}
            scrollContainer={scroll.scrollContainerEl}
            estimateHeight={80}
            columns={1}
            getKey={(fu: FollowUpRecord) => fu.id}
            onloadprevious={hasMoreOlder
              ? async () => paginator.loadOlderPage()
              : undefined}
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
              {@const contentResult =
                decrypt != null
                  ? decrypt.followUp(fu.id, fu.encryptedContent)
                  : resolveAsyncDecrypt(undefined, false)}
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
                class="fu-wrapper"
                tabindex={kind === "system" ? undefined : 0}
                role={kind === "system" ? undefined : "article"}
                aria-label={kind === "system"
                  ? undefined
                  : bubbleAriaLabel(fu, contentResult)}
                onkeydown={kind === "system"
                  ? undefined
                  : handleBubbleKeydown(fu)}
              >
                {#if kind === "system"}
                  <SystemEvent
                    result={contentResult}
                    timestamp={fu.createdAt}
                  />
                {:else if kind === "note"}
                  <PrivateNote
                    result={contentResult}
                    authorName={resolveVolunteerName(fu.createdBy)}
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
                  <Message
                    type={messageType(fu)}
                    name={fu.source === "client" ? clientAlias : undefined}
                    aria-label={bubbleAriaLabel(fu, contentResult)}
                  >
                    {#snippet text()}
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <span
                        class="bubble-text"
                        onpointerdown={startLongPress(fu)}
                        onpointerup={cancelLongPress}
                        onpointercancel={cancelLongPress}
                      >
                        <DecryptPlaceholder
                          result={contentResult}
                          ciphertext={fu.encryptedContent}
                          length={30}
                          block
                        />
                      </span>

                      {#if fu.hasRecording || fu.hasImage || fu.hasFile}
                        <FollowUpMedia
                          followupId={fu.id}
                          {ticketId}
                          keyWrap={ticket.keyWrap}
                          hasRecording={fu.hasRecording}
                          hasImage={fu.hasImage}
                          hasFile={fu.hasFile}
                          onlightbox={(url: string) => onlightbox?.(url)}
                        />
                      {/if}
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
  .detail-error {
    padding: 1rem var(--page-pad-x);
  }

  .chat-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-anchor: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
  }

  /* Override Konsta Messages' built-in mb-12/mb-16 with the measured
     messagebar height so the last message clears the fixed compose bar.
     Uses the ResizeObserver-measured value from ShellMessagebar. */
  :global(.k-messages) {
    margin-bottom: var(
      --messagebar-height,
      calc(3.5rem + env(safe-area-inset-bottom, 0px))
    ) !important;
  }

  /* display:contents lets the Message flex alignment (self-end for sent)
     work through the wrapper without breaking the Messages flex column. */
  .fu-wrapper {
    display: contents;
  }

  /* VirtualList wraps each item in a .virtual-row div which breaks
     the Messages flex-col context. Make each row a flex-col so
     Message's self-end (sent alignment) works within each row. */
  :global(.virtual-row:not(.virtual-row-grid)) {
    display: flex;
    flex-direction: column;
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
    display: block;
    user-select: text;
    -webkit-user-select: text;
    word-break: break-word;
    touch-action: pan-y;
  }

  .bubble-time {
    font-size: 0.625rem;
    color: var(--muted);
  }

  .system-event-placeholder {
    display: flex;
    justify-content: center;
    padding: 0.5rem 1rem;
  }

  /* Filler bubbles (shape guesses) pulse to distinguish from real decrypt-pending content.
     .fu-wrapper is display:contents, so target the Konsta Message root via :global. */
  .filler-pulse > :global(.k-message),
  .filler-pulse > .system-event-placeholder {
    animation: filler-pulse 2.5s ease-in-out infinite;
  }

  @keyframes filler-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.65;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .filler-pulse > :global(.k-message),
    .filler-pulse > .system-event-placeholder {
      animation: none;
      opacity: 0.7;
    }
  }
</style>
