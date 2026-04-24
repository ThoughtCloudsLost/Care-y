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
  import { Messages, Message, Checkbox, Button } from "konsta/svelte";
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
    getCurrentPermissions,
  } from "$lib/crypto/context.js";
  import { Permission, type FollowUpListInput } from "@care-y/shared";

  type FollowUpType = NonNullable<FollowUpListInput["types"]>[number];
  type MediaFlag = NonNullable<FollowUpListInput["mediaFlags"]>[number];
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import {
    type DecryptResult,
    resolveAsyncDecrypt,
    matchDecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { createTicketDecryptScope } from "$lib/crypto/ticket-decrypt-scope.js";
  import { SvelteMap } from "svelte/reactivity";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { formatDateSeparator, needsDateSeparator } from "$lib/utils/time.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import PrivateNote from "$lib/components/tickets/PrivateNote.svelte";
  import FollowUpMedia from "$lib/components/tickets/FollowUpMedia.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import FollowUpTimeline from "$lib/components/tickets/FollowUpTimeline.svelte";
  import type {
    TimelineItem,
    ClusterRecord,
  } from "$lib/components/tickets/follow-up-timeline-types.js";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import GapIndicator from "$lib/components/GapIndicator.svelte";
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";

  import { computeGaps } from "$lib/tickets/gap-indicators.js";
  import { createScrollManager } from "$lib/tickets/scroll-manager.svelte.js";
  import { createChatPaginator } from "$lib/tickets/chat-paginator.svelte.js";
  import {
    getContextMenuActions,
    type ContextMenuEvent,
  } from "./context-menu-actions.js";

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  type FollowUpRecord = Awaited<
    ReturnType<typeof ticketRouter.listFollowUps.query>
  >[number];

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
    /** Whether select mode is active (route owns this state). */
    selectModeActive?: boolean;
    /** Set of selected follow-up IDs (route owns this state). */
    selectedIds?: ReadonlySet<string>;
    /** Toggle a follow-up's selection. */
    toggleSelected?: (id: string) => void;
    /** Active type filter values (empty = no filter). */
    filterTypes?: readonly string[];
    /** Active author filter values (empty = no filter). */
    filterAuthors?: readonly string[];
    /** Date range filter: start. */
    filterDateFrom?: Date | null;
    /** Date range filter: end. */
    filterDateTo?: Date | null;
    /** Called when empty filter state's "Clear filters" is tapped. */
    onclearfilters?: () => void;
    /** Two-way bindable: filtered follow-ups exposed to route for copy. */
    filteredFollowUps?: FollowUpRecord[];
    /** Two-way bindable: all searchable follow-ups (includes timeline items when active). */
    searchableFollowUps?: readonly {
      id: string;
      source: string;
      type: string;
      createdBy: string | null;
      createdAt: string;
      encryptedContent: unknown;
    }[];
    /** Two-way bindable: exposes the chat scroll container for scroll-direction tracking. */
    scrollContainerEl?: HTMLElement | undefined;
    /** Two-way bindable: true after scroll-to-unread initialization is complete. */
    scrollReady?: boolean;
    /** Active search term for match highlighting (null = no search overlay). */
    searchTerm?: string | null;
    /** ID of the currently navigated search match (gets glow animation). */
    searchActiveMatchId?: string | null;
    /** When true, FollowUpTimeline should scroll to the active match and expand its cluster. */
    searchScrollRequested?: boolean;
    /** Called after FollowUpTimeline processes a scroll request. */
    onsearchscrollcomplete?: () => void;
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
    selectModeActive = false,
    selectedIds,
    toggleSelected,
    filterTypes,
    filterAuthors,
    filterDateFrom = null,
    filterDateTo = null,
    onclearfilters,
    filteredFollowUps = $bindable(undefined),
    searchableFollowUps = $bindable(undefined),
    scrollContainerEl = $bindable(undefined),
    scrollReady = $bindable(false),
    searchTerm = null,
    searchActiveMatchId = null,
    searchScrollRequested = false,
    onsearchscrollcomplete,
  }: TicketDetailProps = $props();

  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const previewLoader = getPreviewLoader();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const canModerateContent = $derived(
    permissions.has(Permission.MODERATE_CONTENT),
  );

  // --- Data Loading ---

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

  // --- Conversation filter application (server-side) ---

  const hasActiveFilters = $derived(
    (filterTypes != null && filterTypes.length > 0) ||
      (filterAuthors != null && filterAuthors.length > 0) ||
      filterDateFrom !== null ||
      filterDateTo !== null,
  );

  // Translate client-side pseudo-types to server filter params.
  const serverFilterTypes = $derived.by((): FollowUpType[] => {
    const types: FollowUpType[] = [];
    for (const t of filterTypes ?? []) {
      if (t !== "__images__" && t !== "__recordings__" && t !== "__files__") {
        // filterTypes prop contains both FollowUpType values and media pseudo-types;
        // after excluding pseudo-types the remainder are valid FollowUpType values.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- pseudo-types excluded above
        types.push(t as FollowUpType);
      }
    }
    return types;
  });

  const serverMediaFlags = $derived.by((): MediaFlag[] => {
    const flags: MediaFlag[] = [];
    for (const t of filterTypes ?? []) {
      if (t === "__recordings__") flags.push("recording");
      else if (t === "__images__") flags.push("image");
      else if (t === "__files__") flags.push("file");
    }
    return flags;
  });

  const serverCreatedBy = $derived.by((): string[] => {
    const ids: string[] = [];
    for (const a of filterAuthors ?? []) {
      if (a !== "__client__") ids.push(a);
    }
    return ids;
  });

  const serverIncludeClient = $derived(
    (filterAuthors ?? []).includes("__client__"),
  );

  const FILTERED_PAGE_SIZE = 200;

  const filteredFollowUpsQuery = createQuery(() => ({
    queryKey: [
      "ticket",
      ticketId,
      "followUps",
      "filtered",
      serverFilterTypes,
      serverMediaFlags,
      serverCreatedBy,
      serverIncludeClient,
      filterDateFrom?.toISOString() ?? null,
      filterDateTo?.toISOString() ?? null,
    ],
    queryFn: async () =>
      ticketRouter.listFollowUps.query({
        ticketId,
        limit: FILTERED_PAGE_SIZE,
        direction: "older",
        types: serverFilterTypes.length > 0 ? serverFilterTypes : undefined,
        mediaFlags: serverMediaFlags.length > 0 ? serverMediaFlags : undefined,
        createdBy: serverCreatedBy.length > 0 ? serverCreatedBy : undefined,
        includeClientSource: serverIncludeClient || undefined,
        dateFrom: filterDateFrom?.toISOString(),
        dateTo: filterDateTo?.toISOString(),
      }),
    enabled: hasActiveFilters,
  }));

  const displayFollowUps = $derived(
    hasActiveFilters ? (filteredFollowUpsQuery.data ?? []) : followUps,
  );

  $effect(() => {
    filteredFollowUps = displayFollowUps;
  });

  // Expose the broadest available follow-up list for search matching.
  // Timeline view loads all follow-ups via the summary endpoint;
  // Messages view only has the paginated subset.
  $effect(() => {
    if (timelineActive && summaryQuery.data) {
      searchableFollowUps = summaryQuery.data;
    } else {
      searchableFollowUps = displayFollowUps;
    }
  });

  const hiddenGaps = $derived.by((): Map<string, number> => {
    if (!hasActiveFilters || displayFollowUps.length === 0)
      return new Map<string, number>();
    const first = displayFollowUps[0];
    if (first?.fullPosition === undefined) return new Map<string, number>();

    const entries = displayFollowUps
      .filter(
        (fu): fu is typeof fu & { fullPosition: number } =>
          fu.fullPosition !== undefined,
      )
      .map((fu) => ({
        key: fu.id,
        firstPosition: fu.fullPosition,
        lastPosition: fu.fullPosition,
      }));
    return computeGaps(entries, first.totalCount);
  });

  // --- Timeline summary query (fetched lazily when zoomed) ---

  // Summary query includes filter params so the server returns only matching items.
  const summaryQuery = createQuery(() => ({
    queryKey: [
      "ticket",
      ticketId,
      "followUpSummary",
      serverFilterTypes,
      serverMediaFlags,
      serverCreatedBy,
      serverIncludeClient,
      filterDateFrom?.toISOString() ?? null,
      filterDateTo?.toISOString() ?? null,
    ],
    queryFn: async () =>
      ticketRouter.listFollowUpSummary.query({
        ticketId,
        types: serverFilterTypes.length > 0 ? serverFilterTypes : undefined,
        mediaFlags: serverMediaFlags.length > 0 ? serverMediaFlags : undefined,
        createdBy: serverCreatedBy.length > 0 ? serverCreatedBy : undefined,
        includeClientSource: serverIncludeClient || undefined,
        dateFrom: filterDateFrom?.toISOString(),
        dateTo: filterDateTo?.toISOString(),
      }),
    enabled: timelineActive,
  }));

  function toTimelineItem(
    fu: NonNullable<typeof summaryQuery.data>[number],
  ): TimelineItem {
    return {
      id: fu.id,
      source: fu.source,
      type: fu.type,
      createdBy: fu.createdBy,
      createdAt: fu.createdAt,
      encryptedContent: fu.encryptedContent,
      hasRecording: fu.hasRecording,
      recordingDurationSeconds: fu.recordingDurationSeconds,
      hasImage: fu.hasImage,
      hasFile: fu.hasFile,
      fullPosition: fu.fullPosition,
      totalCount: fu.totalCount,
    };
  }

  // Build timeline items from the summary endpoint, falling back to
  // already-loaded paginator items while the summary query is in flight.
  const displayTimelineItems = $derived.by((): TimelineItem[] => {
    if (summaryQuery.data) {
      return summaryQuery.data.map(toTimelineItem);
    }
    return followUps.map((fu) => ({
      id: fu.id,
      source: fu.source,
      type: fu.type,
      createdBy: fu.createdBy,
      createdAt: fu.createdAt,
      encryptedContent: fu.encryptedContent,
      hasRecording: fu.hasRecording,
      recordingDurationSeconds: null,
      hasImage: fu.hasImage,
      hasFile: fu.hasFile,
    }));
  });

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
        type: summary?.type ?? "message",
        encryptedContent: null,
        createdBy: summary?.createdBy ?? null,
        createdAt: summary?.createdAt ?? "",
        isPrivate: false,
        hasRecording: summary?.hasRecording ?? false,
        hasImage: summary?.hasImage ?? false,
        hasFile: summary?.hasFile ?? false,
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
    // in FollowUpTimeline's template via followUpCache.decryptContent.
    const records: ClusterRecord[] = fullRecords.map((fu) => ({
      id: fu.id,
      source: fu.source,
      type: fu.type,
      encryptedContent: fu.encryptedContent,
      createdBy: fu.createdBy,
      createdAt: fu.createdAt,
      isPrivate: fu.isPrivate,
      hasRecording: fu.hasRecording,
      hasImage: fu.hasImage,
      hasFile: fu.hasFile,
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
    const actions = getContextMenuActions(
      fu,
      currentUserId,
      canModerateContent,
      {
        copy: m.common_copy(),
        editNote: m.ticket_edit_note(),
        deleteNote: m.ticket_delete_note(),
      },
    );
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
    if (!initialBatchReady) return;

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
          scrollReady = true;
        });
      });
    })();
  });

  // --- FollowUpTimeline data ---

  // --- Scroll container ---

  const scroll = createScrollManager();

  // Expose internal scroll container to the route page for scroll-direction tracking.
  $effect(() => {
    scrollContainerEl = scroll.scrollContainerEl;
  });

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

  // --- Batch rendering gate ---
  // Hold the skeleton view until the initial visible batch of messages has
  // stable heights (decrypted, errored, or denied). Prevents scroll drift
  // from per-message height transitions during decrypt.
  const VISIBLE_BATCH = 20;

  const initialBatchReady = $derived.by((): boolean => {
    if (decrypt == null || followUps.length === 0) return false;
    const startIdx = Math.max(0, followUps.length - VISIBLE_BATCH);
    for (let i = startIdx; i < followUps.length; i++) {
      const fu = followUps[i]; // eslint-disable-line security/detect-object-injection -- i is a loop counter bounded by followUps.length
      if (!fu?.encryptedContent) continue;
      const result = decrypt.followUp(fu.id, fu.encryptedContent);
      if (result.status === "loading") return false;
    }
    return true;
  });
</script>

{#snippet chatPlaceholder()}
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
{/snippet}

{#if ticketQuery.isLoading}
  <div
    class="chat-container"
    role="log"
    aria-label={m.shell_loading()}
    use:scroll.scrollToBottom
  >
    {@render chatPlaceholder()}
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
      {@render chatPlaceholder()}
    {:else if !initialBatchReady}
      {@render chatPlaceholder()}
    {:else if followUps.length === 0}
      <div class="empty-chat" role="status">
        <p>{m.empty_no_data()}</p>
      </div>
    {:else if hasActiveFilters && filteredFollowUpsQuery.isLoading}
      {@render chatPlaceholder()}
    {:else if hasActiveFilters && displayFollowUps.length === 0}
      <div class="empty-chat" role="status">
        <p>{m.ticket_no_filter_results()}</p>
        <Button tonal small onclick={() => onclearfilters?.()}>
          {m.ticket_clear_filters()}
        </Button>
      </div>
    {:else}
      {#if loadingOlder}
        <div class="loading-older" role="status" aria-live="polite">
          <span>{m.ticket_loading_older()}</span>
        </div>
      {/if}

      <FollowUpTimeline
        scrollContainerEl={scroll.scrollContainerEl}
        items={displayTimelineItems}
        decryptedContent={timelineDecryptedContent}
        {expandedClusters}
        onexpandcluster={handleExpandCluster}
        bind:timelineActive
        {searchActiveMatchId}
        {searchScrollRequested}
        {onsearchscrollcomplete}
      >
        {#snippet renderExpanded({
          record: rec,
          onzoom,
        }: {
          record: ClusterRecord;
          onzoom: () => void;
        })}
          {@const recResult =
            decrypt != null && rec.encryptedContent !== null
              ? decrypt.followUp(rec.id, rec.encryptedContent)
              : resolveAsyncDecrypt(undefined, false)}
          {@const kind = followUpKind(rec)}
          <div
            id="tl-fu-{rec.id}"
            class="cluster-bubble-tap"
            class:match-active-row={searchActiveMatchId === rec.id}
            role="button"
            tabindex={0}
            onclick={onzoom}
            onkeydown={onKeyActivate(onzoom)}
          >
            {#if kind === "system"}
              <SystemEvent result={recResult} timestamp={rec.createdAt} />
            {:else if kind === "note"}
              <PrivateNote
                result={recResult}
                authorName={resolveVolunteerName(rec.createdBy)}
                timestamp={rec.createdAt}
                isOwn={rec.createdBy === currentUserId}
                {searchTerm}
              />
            {:else}
              <Message
                type={rec.source === "client" ? "received" : "sent"}
                name={rec.source === "client" ? clientAlias : undefined}
              >
                {#snippet text()}
                  <span class="bubble-text">
                    <DecryptPlaceholder
                      result={recResult}
                      ciphertext={rec.encryptedContent}
                      length={30}
                      block
                      {searchTerm}
                    />
                  </span>
                  {#if rec.hasRecording || rec.hasImage || rec.hasFile}
                    <FollowUpMedia
                      followupId={rec.id}
                      {ticketId}
                      keyWrap={ticket.keyWrap}
                      hasRecording={rec.hasRecording}
                      hasImage={rec.hasImage}
                      hasFile={rec.hasFile}
                      onlightbox={(url: string) => onlightbox?.(url)}
                    />
                  {/if}
                {/snippet}
                {#snippet footer()}
                  <time class="bubble-time" datetime={rec.createdAt}>
                    {formatRelativeTime(new Date(rec.createdAt))}
                  </time>
                {/snippet}
              </Message>
            {/if}
          </div>
        {/snippet}
        <Messages>
          <VirtualList
            items={displayFollowUps}
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
                i > 0 ? displayFollowUps[i - 1]?.createdAt : undefined}
              {@const isSelected = selectedIds?.has(fu.id) ?? false}
              {@const checkboxSide =
                messageType(fu) === "sent" ? "right" : "left"}
              {@const gapBefore = hiddenGaps.get(fu.id) ?? 0}

              <GapIndicator count={gapBefore} />

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
                class:match-active={searchActiveMatchId === fu.id}
                class:fu-select-mode={selectModeActive}
                class:fu-select-left={selectModeActive &&
                  checkboxSide === "left"}
                class:fu-select-right={selectModeActive &&
                  checkboxSide === "right"}
                tabindex={kind === "system" && !selectModeActive
                  ? undefined
                  : 0}
                role={selectModeActive
                  ? "option"
                  : kind === "system"
                    ? undefined
                    : "article"}
                aria-label={kind === "system"
                  ? undefined
                  : bubbleAriaLabel(fu, contentResult)}
                aria-selected={selectModeActive ? isSelected : undefined}
                onkeydown={selectModeActive
                  ? (e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleSelected?.(fu.id);
                      }
                    }
                  : kind === "system"
                    ? undefined
                    : handleBubbleKeydown(fu)}
                onclick={selectModeActive
                  ? () => toggleSelected?.(fu.id)
                  : undefined}
              >
                {#if selectModeActive}
                  <div class="select-checkbox select-checkbox-{checkboxSide}">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelected?.(fu.id)}
                    />
                  </div>
                {/if}
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
                    {searchTerm}
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
                          {searchTerm}
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
          <GapIndicator count={hiddenGaps.get("__after__") ?? 0} />
        </Messages>
      </FollowUpTimeline>
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
    margin-top: calc(-1 * (var(--navbar-h, 0px) + var(--subnavbar-h, 0px)));
    padding-top: calc(var(--navbar-h, 0px) + var(--subnavbar-h, 0px));
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

  /* In select mode, switch to flex row for checkbox placement. */
  .fu-select-mode {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .fu-select-left {
    flex-direction: row;
  }

  .fu-select-right {
    flex-direction: row-reverse;
  }

  .select-checkbox {
    flex-shrink: 0;
    padding-top: 0.5rem;
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
    scroll-margin-top: calc(var(--navbar-h, 0px) + var(--subnavbar-h, 0px));
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
