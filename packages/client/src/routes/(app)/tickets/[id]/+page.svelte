<!--
  Ticket detail route: glue layer between TicketDetail content component
  and AppShell navigation chrome.

  Responsibilities:
  - Hides AppShell tabbar while active (ShellMessagebar provides compose bar)
  - Overrides AppShell Navbar with back/client-alias/call/more icons
  - Renders ShellMessagebar compose bar (fixed bottom)
  - Hosts all overlays via shell wrappers (ActionSheet, Sheet, Popup)
  - Manages draft text state shared between compose bar and content
  - Provides SvelteKit snapshot for draft preservation
-->
<script lang="ts">
  import type { Snapshot } from "./$types.js";
  import { page } from "$app/state";
  import { Link, Button } from "konsta/svelte";
  import {
    ChevronLeft,
    MessageSquareText,
    Timeline,
    BookUser,
    X,
    Copy,
    SquareCheckBig,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    getTabbarHiddenCtx,
    getNavbarOverrideCtx,
    getTabbarOverrideCtx,
  } from "$lib/shell/context.js";
  import { shellBack } from "$lib/shell/navigation.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import type {
    ViewToggleConfig,
    FilterPillsConfig,
  } from "$lib/shell/types.js";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import TicketDetail from "$lib/components/tickets/TicketDetail.svelte";
  import PriorityBadge from "$lib/components/PriorityBadge.svelte";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import type {
    ContextActionId,
    ContextMenuEvent,
  } from "$lib/components/tickets/context-menu-actions.js";
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import { DialogButton, ActionsGroup, ActionsButton } from "konsta/svelte";
  import TicketPanelContent from "$lib/components/tickets/TicketPanelContent.svelte";
  import AssignSheet from "$lib/components/tickets/AssignSheet.svelte";
  import ComposeActions from "$lib/components/tickets/ComposeActions.svelte";
  import type { TicketAction } from "$lib/tickets/types.js";
  import CallOptionsContent, {
    type CallAction,
  } from "$lib/components/tickets/CallOptionsContent.svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys, ticketsKeys, consultantKeys } from "$lib/query/keys";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getCryptoBridge,
    getOrgDecryptCache,
    getCurrentUserId,
    getFollowUpDecryptCache,
    getTicketDecryptCache,
  } from "$lib/crypto/context.js";
  import {
    createVolunteersQuery,
    createParticipantsQuery,
    createNoteTypesQuery,
  } from "$lib/tickets/queries.js";
  import {
    buildVolunteerMap,
    resolveVolunteerName as resolveVolName,
  } from "$lib/tickets/resolve-volunteer.js";
  import { SvelteSet } from "svelte/reactivity";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import {
    resolveAsyncDecrypt,
    matchDecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { serializedBufferToBase64 } from "$lib/utils/buffer-encoding.js";
  import {
    registerSearchProvider,
    setPromotedOverride,
  } from "$lib/search/registry.svelte.js";
  import { createConversationSearchProvider } from "$lib/search/providers/conversation.js";
  import { DECRYPT_ERROR_SENTINEL } from "$lib/crypto/async-decrypt-cache.js";
  import { fuzzySearch } from "$lib/search/fuzzy.js";
  import { createSearchOverlay } from "$lib/search/search-overlay.svelte.js";
  import SearchNavigator from "$lib/components/search/SearchNavigator.svelte";
  import CloseResolutionSheet from "$lib/components/tickets/CloseResolutionSheet.svelte";
  import InternalNoteSheet from "$lib/components/tickets/InternalNoteSheet.svelte";
  import { resolveNoteTypeIcon } from "$lib/utils/note-type-icons.js";

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const cryptoBridge = getCryptoBridge();
  const queryClient = useQueryClient();

  type FollowUpList = Awaited<
    ReturnType<typeof ticketRouter.listFollowUps.query>
  >["followUps"];

  const ticketId = $derived(page.params.id ?? "");
  const tabbarHidden = getTabbarHiddenCtx();
  const navbarCtx = getNavbarOverrideCtx();
  const tabbarOverride = getTabbarOverrideCtx();

  // Draft compose state (shared with ShellMessagebar + TicketDetail).
  let draftText = $state("");
  let cursorPosition = $state(0);

  function handleInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLTextAreaElement) {
      cursorPosition = target.selectionStart;
    }
  }

  // Ticket data for navbar display.
  const ticketQuery = createQuery(() => ({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  const ticket = $derived(ticketQuery.data);
  const clientAlias = $derived(ticket?.clientAlias ?? "...");
  const ticketDecryptCache = getTicketDecryptCache();

  const decryptedTitle = $derived.by((): string => {
    if (!ticket) return "...";
    const result = ticketDecryptCache.decryptTitle(
      ticket.id,
      ticket.keyWrap,
      ticket.encryptedTitle,
    );
    return typeof result === "string" ? result : "...";
  });

  // Look up followUpCount from the ticket list cache (available instantly,
  // no need to wait for the detail query).
  const cachedFollowUpCount = $derived.by((): number | undefined => {
    interface TicketRow {
      id: string;
      followUpCount: number;
    }
    const entries = queryClient.getQueriesData<{ pages: TicketRow[][] }>({
      queryKey: ticketsKeys.lists(),
    });
    for (const [, data] of entries) {
      if (!data?.pages) continue;
      for (const ticketPage of data.pages) {
        const match = ticketPage.find((t) => t.id === ticketId);
        if (match) return match.followUpCount;
      }
    }
    return undefined;
  });

  // --- Read cursor ---

  const readCursorQuery = createQuery(() => ({
    queryKey: ticketKeys.readCursor(ticketId),
    queryFn: async () => ticketRouter.getReadCursor.query({ ticketId }),
    enabled: ticketId !== "",
  }));

  // Decrypt the read cursor to get the readUpTo timestamp.
  // undefined = still loading, null = unread (dummy or decrypt failed).
  let readUpTo = $state<Date | null | undefined>(undefined);

  $effect(() => {
    const cursor = readCursorQuery.data;
    const t = ticket;
    if (!cursor || !t?.keyWrap) return;

    const ciphertext = serializedBufferToBase64(cursor.encryptedReadCursor);
    const kw = t.keyWrap;

    cryptoBridge
      .decrypt(ticketId, kw.ephemeralPoint, kw.nonce, kw.wrappedKey, ciphertext)
      .then((plaintext) => {
        try {
          const parsed: unknown = JSON.parse(plaintext);
          if (
            parsed !== null &&
            typeof parsed === "object" &&
            "readUpTo" in parsed
          ) {
            const ts = (parsed as Record<string, unknown>).readUpTo;
            if (typeof ts === "string") {
              readUpTo = new Date(ts);
              return;
            }
          }
        } catch {
          // JSON parse failed: treat as unread
        }
        readUpTo = null;
      })
      .catch(() => {
        // AEAD failure (random dummy bytes): all messages are unread.
        readUpTo = null;
      });
  });

  // Debounced read cursor update. Called by TicketDetail when the user
  // scrolls and new follow-ups become visible.
  let pendingReadTimestamp: string | null = null;
  let cursorUpdateTimer: ReturnType<typeof setTimeout> | null = null;

  function handleReadProgress(latestVisibleTimestamp: string): void {
    // Only advance the cursor forward, never backward.
    if (
      pendingReadTimestamp !== null &&
      latestVisibleTimestamp <= pendingReadTimestamp
    ) {
      return;
    }
    pendingReadTimestamp = latestVisibleTimestamp;

    if (cursorUpdateTimer) clearTimeout(cursorUpdateTimer);
    cursorUpdateTimer = setTimeout(() => {
      void flushReadCursor();
    }, 3000);
  }

  async function flushReadCursor(): Promise<void> {
    const ts = pendingReadTimestamp;
    if (ts === null) return;
    pendingReadTimestamp = null;

    try {
      const payload = JSON.stringify({ readUpTo: ts });
      const encrypted = await cryptoBridge.encrypt(ticketId, payload);
      await ticketRouter.updateReadCursor.mutate({
        ticketId,
        encryptedReadCursor: encrypted,
      });
      // Update local state so the divider adjusts.
      readUpTo = new Date(ts);
    } catch {
      // Failed to update cursor. Not critical; will retry on next scroll.
    }
  }

  // --- Action sheet data ---

  // Consultant phone registration (for call options).
  const consultantQuery = createQuery(() => ({
    queryKey: consultantKeys.all,
    queryFn: async () => trpc.consultant?.get.query() ?? null,
    staleTime: 5 * 60 * 1000,
  }));
  const hasVerifiedPhone = $derived(consultantQuery.data?.isVerified ?? false);

  // --- Shell overrides ---

  // Scroll container ref from TicketDetail (for scroll-direction tracking).
  let chatScrollEl = $state<HTMLElement | undefined>();
  let chatScrollReady = $state(false);

  const scrollDir = useScrollDirection({
    get scrollEl() {
      return chatScrollEl;
    },
    invert: true,
  });

  // Tabbar: hidden normally, replaced with select toolbar when select mode is active.
  $effect(() => {
    if (selectModeActive) {
      tabbarHidden.current = false;
      tabbarOverride.current = {
        left: selectLeft,
        middle: selectMiddle,
        right: selectRight,
        ariaLabel: m.ticket_select_mode(),
      };
    } else {
      tabbarOverride.current = undefined;
      tabbarHidden.current = true;
    }
    return () => {
      tabbarOverride.current = undefined;
      tabbarHidden.current = false;
    };
  });

  // Override AppShell Navbar with ticket-specific content + subnavbar.
  $effect(() => {
    navbarCtx.current = {
      left: navLeft,
      title: navTitle,
      right: navRight,
      subnavbar: ticketSubnavbar,
      subnavbarHidden: () =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- $state/$derived values read lazily inside callback
        chatScrollReady && scrollDir.hidden && !overlay.active,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // --- Overlay state ---

  let panelOpen = $state(false);
  let assignSheetOpen = $state(false);
  let callSheetOpen = $state(false);
  let composeActionsOpen = $state(false);
  let composeActionsAnchor = $state<HTMLElement | undefined>();
  let lightboxOpen = $state(false);
  let lightboxUrl = $state<string | null>(null);
  let contextMenuOpen = $state(false);
  let contextMenuData = $state<ContextMenuEvent | null>(null);
  let deleteConfirmOpen = $state(false);
  let deleteTargetId = $state<string | null>(null);
  let editNoteSheetOpen = $state(false);
  let editNoteFollowUpId = $state<string | undefined>(undefined);
  let editNoteContent = $state<string | undefined>(undefined);
  let editNoteTypeId = $state<string | undefined>(undefined);
  let timelineActive = $state(false);

  // Filtered follow-ups (bound from TicketDetail for select mode copy).
  let filteredFollowUps = $state<FollowUpList | undefined>(undefined);

  // --- Conversation filters ---

  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const followUpCache = getFollowUpDecryptCache();
  const volunteersQuery = createVolunteersQuery(ticketRouter);
  const volunteerMap = $derived(buildVolunteerMap(volunteersQuery.data));
  const noteTypesQuery = ticketRouter.noteTypes
    ? createNoteTypesQuery(ticketRouter.noteTypes)
    : undefined;
  const participantsQuery = createParticipantsQuery(
    ticketRouter,
    () => ticketId,
  );

  const MEDIA_IMAGES = "__images__";
  const MEDIA_RECORDINGS = "__recordings__";
  const MEDIA_FILES = "__files__";

  const filterTypes = new SvelteSet<string>();
  let filterDateFrom = $state<Date | null>(null);
  let filterDateTo = $state<Date | null>(null);
  const filterAuthors = new SvelteSet<string>();

  // Derived arrays from SvelteSets so the reactive graph tracks mutations.
  // Template-level spreads ([...filterTypes]) don't reliably establish
  // fine-grained tracking on SvelteSet contents in Svelte 5.
  const filterTypesArr = $derived([...filterTypes]);
  const filterAuthorsArr = $derived([...filterAuthors]);

  const filterActiveCount = $derived.by((): number => {
    let count = 0;
    if (filterTypes.size > 0) count++;
    if (filterAuthors.size > 0) count++;
    if (filterDateFrom !== null || filterDateTo !== null) count++;
    return count;
  });

  function toggleFilterType(value: string): void {
    if (filterTypes.has(value)) filterTypes.delete(value);
    else filterTypes.add(value);
  }

  function toggleFilterAuthor(value: string): void {
    if (filterAuthors.has(value)) filterAuthors.delete(value);
    else filterAuthors.add(value);
  }

  function handleFilterDateChange(from: Date | null, to: Date | null): void {
    filterDateFrom = from;
    filterDateTo = to;
  }

  function clearAllFilters(): void {
    filterTypes.clear();
    filterAuthors.clear();
    filterDateFrom = null;
    filterDateTo = null;
  }

  function handlePillToggle(pillId: string, value: string): void {
    if (pillId === "type") toggleFilterType(value);
    else if (pillId === "author") toggleFilterAuthor(value);
  }

  function handlePillSelect(pillId: string, _value: string | null): void {
    void pillId;
  }

  const noteTypeFilterEntries = $derived(
    (noteTypesQuery?.data?.types ?? []).map((nt) => ({
      value: `note_type:${nt.id}`,
      label: orgCache.decrypt(nt.id + ":name", nt.encryptedName) ?? "...",
    })),
  );

  const typeFilterOptions = $derived([
    ...noteTypeFilterEntries,
    { value: MEDIA_RECORDINGS, label: m.ticket_filter_type_recordings() },
    { value: MEDIA_IMAGES, label: m.ticket_filter_type_images() },
    { value: MEDIA_FILES, label: m.ticket_filter_type_files() },
    { value: "message", label: m.ticket_filter_type_messages() },
    { value: "assignment_change", label: m.ticket_filter_type_assignment() },
    { value: "status_change", label: m.ticket_filter_type_status() },
    { value: "priority_change", label: m.ticket_filter_type_priority() },
    { value: "hold_change", label: m.ticket_filter_type_hold() },
    { value: "merge_note", label: m.ticket_filter_type_merge() },
  ]);

  const authorFilterOptions = $derived.by(() => {
    const options: { value: string; label: string }[] = [
      { value: "__client__", label: clientAlias },
    ];
    for (const participant of participantsQuery.data ?? []) {
      const name = orgCache.decrypt(
        `volunteer:${participant.volunteerId}`,
        participant.encryptedDisplayName,
      );
      const label =
        participant.volunteerId === currentUserId
          ? m.ticket_author_you({ name: name ?? "..." })
          : (name ?? "...");
      options.push({ value: participant.volunteerId, label });
    }
    return options;
  });

  const dateFromStr = $derived(
    filterDateFrom ? filterDateFrom.toISOString().slice(0, 10) : "",
  );
  const dateToStr = $derived(
    filterDateTo ? filterDateTo.toISOString().slice(0, 10) : "",
  );
  const dateFilterActive = $derived(
    filterDateFrom !== null || filterDateTo !== null,
  );
  const dateFilterLabel = $derived.by((): string | undefined => {
    if (!dateFilterActive) return undefined;
    const from = filterDateFrom
      ? filterDateFrom.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "";
    const to = filterDateTo
      ? filterDateTo.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "";
    if (from && to) return `${from} - ${to}`;
    if (from) return `${from} -`;
    return `- ${to}`;
  });

  const conversationPills = $derived<PillDefinition[]>([
    {
      id: "type",
      label: m.ticket_filter_type(),
      mode: "multi",
      options: typeFilterOptions,
      selected: filterTypes as ReadonlySet<string>,
    },
    {
      id: "author",
      label: m.ticket_filter_author(),
      mode: "multi",
      options: authorFilterOptions,
      selected: filterAuthors as ReadonlySet<string>,
      loading: participantsQuery.isLoading,
    },
    {
      id: "date",
      label: m.ticket_filter_date(),
      mode: "date",
      options: [],
      selected: null,
    },
  ]);

  // --- SubNavbar config objects ---

  const detailViewConfig: ViewToggleConfig = $derived({
    mode: timelineActive ? ("grid" as const) : ("list" as const),
    onchange: (mode: "list" | "grid") => {
      timelineActive = mode === "grid";
    },
    listLabel: m.ticket_action_messages(),
    gridLabel: m.ticket_action_timeline(),
    listIcon: MessageSquareText,
    gridIcon: Timeline,
  });

  const detailFilterPills: FilterPillsConfig = $derived({
    pills: conversationPills,
    activeCount: filterActiveCount,
    dateFrom: dateFromStr,
    dateTo: dateToStr,
    dateActive: dateFilterActive,
    dateLabel: dateFilterLabel,
    ontoggle: handlePillToggle,
    onselect: handlePillSelect,
    ondatechange: handleFilterDateChange,
    onclearall: clearAllFilters,
  });

  // --- Select mode ---

  let selectModeActive = $state(false);
  const selectedIds = new SvelteSet<string>();

  function enterSelectMode(): void {
    selectModeActive = true;
    selectedIds.clear();
  }

  function exitSelectMode(): void {
    selectModeActive = false;
    selectedIds.clear();
  }

  function toggleSelected(id: string): void {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
  }

  async function handleCopySelected(
    orderedFollowUps: FollowUpList,
  ): Promise<void> {
    if (selectedIds.size === 0) return;

    const selected = orderedFollowUps.filter((fu) => selectedIds.has(fu.id));
    if (selected.length === 0) return;

    const lines: string[] = [];
    for (const fu of selected) {
      const time = formatRelativeTime(new Date(fu.createdAt));
      let author: string;
      if (fu.source === "system") {
        author = "[System]";
      } else if (fu.source === "client") {
        author = clientAlias;
      } else {
        const name = resolveVolName(fu.createdBy, volunteerMap, orgCache);
        author = name ?? "Volunteer";
        if (fu.type === "internal_note") {
          author = `${author} (internal note)`;
        }
      }

      let content = "";
      if (ticket?.keyWrap) {
        const raw = followUpCache.decryptContent(
          fu.id,
          ticket.keyWrap,
          fu.encryptedContent,
        );
        const result = resolveAsyncDecrypt(raw, true);
        content = matchDecryptResult(result, {
          loading: () => "[encrypted]",
          ready: (v) => v,
          denied: () => "[access denied]",
          error: () => "[decryption error]",
        });
      }

      lines.push(`[${time}] ${author}: ${content}`);
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      const count = selected.length;
      toastStore.show(
        count === 1
          ? m.ticket_one_message_copied()
          : m.ticket_messages_copied({ count: String(count) }),
      );
    } catch {
      toastStore.show(m.common_copy_failed());
    }
    exitSelectMode();
  }

  // --- Search overlay (composable + page-specific match computation) ---

  let searchableFollowUps = $state<
    | readonly {
        id: string;
        source: string;
        type: string;
        createdBy: string | null;
        createdAt: string;
        encryptedContent: unknown;
      }[]
    | undefined
  >(undefined);
  const displayFollowUpsForSearch = $derived(
    searchableFollowUps ?? filteredFollowUps,
  );

  const overlay = createSearchOverlay({
    matches: () => searchMatches,
    getElementId: (id) => `${timelineActive ? "tl-fu" : "fu"}-${id}`,
    scrollContainer: () => chatScrollEl,
    onscroll: (id) => {
      if (timelineActive) return;
      requestAnimationFrame(() => {
        const el = document.getElementById(`fu-${id}`);
        if (el == null) return;
        const target = el.firstElementChild ?? el;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
  });

  const searchMatches = $derived.by((): string[] => {
    if (overlay.term == null || !displayFollowUpsForSearch) return [];
    const searchable: { id: string; plaintext: string }[] = [];
    for (const fu of displayFollowUpsForSearch) {
      const plaintext = followUpCache.get(fu.id);
      if (plaintext === undefined || plaintext === DECRYPT_ERROR_SENTINEL) {
        continue;
      }
      searchable.push({ id: fu.id, plaintext });
    }
    const haystack = searchable.map((e) => e.plaintext);
    const fuzzyMatches = fuzzySearch(haystack, overlay.term);
    const matchIndices = fuzzyMatches.map((fm) => fm.index);
    matchIndices.sort((a, b) => a - b);
    const ids: string[] = [];
    for (const idx of matchIndices) {
      const entry = searchable[idx]; // eslint-disable-line security/detect-object-injection -- idx from fuzzySearch, bounded by haystack.length
      if (entry != null) ids.push(entry.id);
    }
    return ids;
  });

  // -- Deep search: load all conversation pages --

  let hasMoreMessages = $state(false);
  let loadOlderPage = $state<(() => Promise<void>) | undefined>(undefined);
  let deepPhase = $state<"idle" | "searching" | "done">("idle");
  let deepSearchTerm = $state<string | null>(null);

  async function triggerConversationDeepSearch(): Promise<void> {
    if (deepPhase !== "idle" || !loadOlderPage) return;
    const term = overlay.term ?? "";
    if (term.length < 2) return;

    deepSearchTerm = term;
    deepPhase = "searching";

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions -- $state updated reactively by TicketDetail child
    while (hasMoreMessages && loadOlderPage) {
      await loadOlderPage();
      if ((deepPhase as string) !== "searching") return;
    }

    deepPhase = "done";
  }

  $effect(() => {
    if (deepSearchTerm == null) return;
    if (!overlay.active || overlay.term !== deepSearchTerm) {
      deepPhase = "idle";
      deepSearchTerm = null;
    }
  });

  $effect(() => {
    if (
      overlay.active &&
      overlay.term != null &&
      overlay.term.length >= 2 &&
      searchMatches.length === 0 &&
      deepPhase === "idle" &&
      hasMoreMessages // eslint-disable-line @typescript-eslint/no-unnecessary-condition -- $state updated reactively by TicketDetail child
    ) {
      void triggerConversationDeepSearch();
    }
  });

  let prevTimelineActive = $state(false);
  $effect(() => {
    const switched = timelineActive !== prevTimelineActive;
    prevTimelineActive = timelineActive;
    if (switched && overlay.activeId != null) {
      overlay.requestScroll();
    }
  });

  // --- Conversation search provider registration ---

  $effect(() => {
    const fups = filteredFollowUps ?? [];
    const cache = followUpCache;

    const unregister = registerSearchProvider(
      createConversationSearchProvider({
        getFollowUps: () => fups,
        getDecryptedContent: (id: string) => cache.get(id),
        resolveAuthorName: (source: string, createdBy: string | null) => {
          if (source === "system") return undefined;
          if (source === "client") return clientAlias;
          return resolveVolName(createdBy, volunteerMap, orgCache);
        },
        getTotalFollowUpCount: () => ticket?.followUpCount ?? 0,
        getTicketId: () => ticketId,
        onviewall: (query: string) => {
          overlay.enter(query);
        },
        onresulttap: (id: string, query: string) => {
          overlay.enter(query, id);
        },
      }),
    );
    const clearPromoted = setPromotedOverride("conversation");

    return () => {
      unregister();
      clearPromoted();
    };
  });

  // --- Navigation ---

  function goBack(): void {
    shellBack("/tickets");
  }

  // --- Compose handlers ---

  function handleSend(): void {
    // Stub: encryption + submission wired separately.
    if (import.meta.env.DEV) {
      console.log("[TicketDetail] send reply:", draftText.slice(0, 50));
    }
  }

  function openComposeActions(anchor: HTMLElement): void {
    composeActionsAnchor = anchor;
    composeActionsOpen = true;
  }
  function closeComposeActions(): void {
    composeActionsOpen = false;
  }

  function handleMentionSelect(_userId: string, displayName: string): void {
    // Replace the @partial at cursor with @DisplayName followed by a space.
    const before = draftText.slice(0, cursorPosition);
    const after = draftText.slice(cursorPosition);
    const atIndex = before.lastIndexOf("@");
    if (atIndex === -1) return;
    const replacement = `@${displayName} `;
    draftText = before.slice(0, atIndex) + replacement + after;
    cursorPosition = atIndex + replacement.length;
  }

  // --- Action dispatchers ---

  // --- Close flow (sequential resolution sheets) ---

  let closeQueue = $state<string[]>([]);
  let closeQueueIndex = $state(0);
  let closeSheetOpen = $state(false);
  let closeSaving = $state(false);

  const closeQueueNoteTypeId = $derived(closeQueue.at(closeQueueIndex));
  const closeQueueNoteType = $derived(
    closeQueueNoteTypeId !== undefined && noteTypesQuery?.data
      ? noteTypesQuery.data.types.find((t) => t.id === closeQueueNoteTypeId)
      : undefined,
  );
  const closeQueueTypeName = $derived(
    closeQueueNoteType
      ? (orgCache.decrypt(
          closeQueueNoteType.id + ":name",
          closeQueueNoteType.encryptedName,
        ) ?? "")
      : "",
  );
  const closeQueueTypeIcon = $derived(
    closeQueueNoteType
      ? resolveNoteTypeIcon(
          orgCache.decrypt(
            closeQueueNoteType.id + ":icon",
            closeQueueNoteType.encryptedIcon,
          ),
        )
      : resolveNoteTypeIcon(null),
  );

  function handleCloseAction(): void {
    const types = noteTypesQuery?.data?.types ?? [];
    const requiresOnClose = types
      .filter((nt) => nt.requiresOnClose)
      .map((nt) => nt.id);

    if (requiresOnClose.length === 0) {
      mutateWithToast(ticketRouter.close.mutate({ ticketId }));
      return;
    }

    closeQueue = requiresOnClose;
    closeQueueIndex = 0;
    closeSheetOpen = true;
  }

  function advanceCloseQueue(): void {
    closeQueueIndex++;
    if (closeQueueIndex >= closeQueue.length) {
      closeSheetOpen = false;
      mutateWithToast(ticketRouter.close.mutate({ ticketId }));
    }
  }

  async function handleCloseSheetSubmit(text: string): Promise<void> {
    if (closeQueueNoteTypeId === undefined) return;
    closeSaving = true;
    try {
      const encryptedContent = await cryptoBridge.encrypt(ticketId, text);
      await ticketRouter.createFollowUp.mutate({
        ticketId,
        type: "internal_note",
        source: "volunteer",
        isPrivate: true,
        encryptedContent,
        noteTypeId: closeQueueNoteTypeId,
      });
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
      advanceCloseQueue();
    } catch {
      toastStore.show(m.error_generic(), 3000);
    } finally {
      closeSaving = false;
    }
  }

  function handleCloseSheetSkip(): void {
    advanceCloseQueue();
  }

  /** Fire a mutation and show a generic error toast on failure. */
  function mutateWithToast<T>(promise: Promise<T>): void {
    void promise.catch(() => {
      toastStore.show(m.error_generic(), 3000);
    });
  }

  function handlePanelAction(action: TicketAction): void {
    switch (action) {
      case "call":
        // Close the panel, then open the call options picker.
        closePanel();
        openCallSheet();
        break;
      case "take":
        mutateWithToast(ticketRouter.take.mutate({ ticketId }));
        break;
      case "release":
        mutateWithToast(ticketRouter.release.mutate({ ticketId }));
        break;
      case "assign":
        closePanel();
        assignSheetOpen = true;
        break;
      case "hold":
        mutateWithToast(ticketRouter.update.mutate({ ticketId, onHold: true }));
        break;
      case "unhold":
        mutateWithToast(
          ticketRouter.update.mutate({ ticketId, onHold: false }),
        );
        break;
      case "close":
        handleCloseAction();
        break;
      case "reopen":
        mutateWithToast(
          ticketRouter.reopen.mutate({
            ticketId,
            newKeyGeneration: crypto.randomUUID(),
          }),
        );
        break;
      case "watch":
        mutateWithToast(ticketRouter.watchTicket.mutate({ ticketId }));
        break;
      case "unwatch":
        mutateWithToast(ticketRouter.unwatchTicket.mutate({ ticketId }));
        break;
      case "cancel":
        break;
    }
  }

  function handleCallAction(action: CallAction): void {
    closeCallSheet();
    switch (action) {
      case "browser-call":
        // Stub: BrowserCallService.startCall() wired by telephony integration.
        if (import.meta.env.DEV) console.log("[TicketDetail] browser-call");
        break;
      case "phone-call":
        // Stub: consultant phone callback wired by telephony integration.
        if (import.meta.env.DEV) console.log("[TicketDetail] phone-call");
        break;
      case "cancel":
        break;
    }
  }

  // --- Context menu handlers ---

  function openContextMenu(event: ContextMenuEvent): void {
    contextMenuData = event;
    contextMenuOpen = true;
  }

  function closeContextMenu(): void {
    contextMenuOpen = false;
    contextMenuData = null;
  }

  function handleContextAction(actionId: ContextActionId): void {
    const data = contextMenuData;
    closeContextMenu();
    if (data === null) return;

    switch (actionId) {
      case "copy": {
        void handleCopy(data.plaintext);
        break;
      }
      case "edit": {
        openNoteEditSheet(
          data.followUpId,
          data.plaintext ?? "",
          data.noteTypeId ?? null,
        );
        break;
      }
      case "delete": {
        deleteTargetId = data.followUpId;
        deleteConfirmOpen = true;
        break;
      }
    }
  }

  async function handleCopy(plaintext: string | undefined): Promise<void> {
    if (plaintext === undefined || plaintext === "") return;
    try {
      await navigator.clipboard.writeText(plaintext);
      toastStore.show(m.ticket_copied_to_clipboard());
    } catch {
      toastStore.show(m.common_copy_failed());
    }
  }

  // --- Delete handlers (optimistic) ---

  function closeDeleteConfirm(): void {
    deleteConfirmOpen = false;
    deleteTargetId = null;
  }

  async function confirmDelete(): Promise<void> {
    const targetId = deleteTargetId;
    closeDeleteConfirm();
    if (targetId === null) return;

    const followUpsKey = ticketKeys.followUpsInitial(ticketId);

    // Snapshot for rollback.
    const previousData = queryClient.getQueryData<FollowUpList>(followUpsKey);

    // Optimistically remove the note from the cache.
    queryClient.setQueryData<FollowUpList>(followUpsKey, (old) =>
      old?.filter((fu) => fu.id !== targetId),
    );

    try {
      await ticketRouter.deleteInternalNote.mutate({
        followUpId: targetId,
      });
      // Refetch to get authoritative server state. Prefix match invalidates
      // both the initial key and any paginated page keys.
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
    } catch {
      // Rollback: restore the cached list.
      queryClient.setQueryData<FollowUpList>(followUpsKey, previousData);
      toastStore.show(m.error_followup_not_deletable());
    }
  }

  function openNoteEditSheet(
    followUpId: string,
    content: string,
    noteTypeId: string | null,
  ): void {
    editNoteFollowUpId = followUpId;
    editNoteContent = content;
    editNoteTypeId = noteTypeId ?? undefined;
    editNoteSheetOpen = true;
  }

  function dismissNoteEditSheet(): void {
    editNoteSheetOpen = false;
    editNoteFollowUpId = undefined;
    editNoteContent = undefined;
    editNoteTypeId = undefined;
  }

  // --- Overlay helpers ---

  function openPanel(): void {
    panelOpen = true;
  }
  function closePanel(): void {
    panelOpen = false;
  }

  /** Close panel, then scroll the conversation to the tapped note. */
  function handleNoteTap(noteId: string): void {
    closePanel();
    // Wait for panel dismiss animation, then scroll to the note.
    requestAnimationFrame(() => {
      const el = document.getElementById(`fu-${noteId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /** Close panel, then open the lightbox with the tapped image. */
  function handlePanelLightbox(imageUrl: string): void {
    closePanel();
    openLightbox(imageUrl);
  }

  function openCallSheet(): void {
    callSheetOpen = true;
  }
  function closeCallSheet(): void {
    callSheetOpen = false;
  }

  function openLightbox(imageUrl: string): void {
    lightboxUrl = imageUrl;
    lightboxOpen = true;
  }
  function closeLightbox(): void {
    lightboxOpen = false;
    lightboxUrl = null;
  }

  // --- SvelteKit Snapshot (draft preservation) ---

  interface TicketDetailSnapshot {
    draftText: string;
  }

  export const snapshot: Snapshot<TicketDetailSnapshot> = {
    capture: () => ({
      draftText,
    }),
    restore: (value) => {
      draftText = value.draftText;
    },
  };
</script>

{#snippet navLeft()}
  <Link iconOnly onclick={goBack} role="button" aria-label={m.common_back()}>
    <ChevronLeft size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet navTitle()}
  <Link
    role="button"
    onclick={openPanel}
    aria-label={m.ticket_client_info_button({ alias: clientAlias })}
    class="client-alias-btn"
    colors={{
      navbarTextIos: "text-current",
      navbarTextMaterial: "text-current",
    }}
  >
    {clientAlias}
  </Link>
{/snippet}

{#snippet navRight()}
  <Link
    iconOnly
    onclick={openPanel}
    role="button"
    aria-label={m.ticket_more_actions()}
  >
    <BookUser size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet detailStats()}
  <span>
    {(ticket?.followUpCount ?? 0) === 1
      ? m.ticket_detail_one_message_stat()
      : m.ticket_detail_messages_stat({
          count: String(ticket?.followUpCount ?? 0),
        })}
  </span>
  {@const volCount = participantsQuery.data?.length ?? 0}
  {#if volCount > 0}
    <span>
      {volCount === 1
        ? m.ticket_detail_one_volunteer_stat()
        : m.ticket_detail_volunteers_stat({ count: String(volCount) })}
    </span>
  {/if}
  {#if ticket?.priority}
    <PriorityBadge priority={ticket.priority} />
  {/if}
{/snippet}

{#snippet searchNavigatorRow()}
  <SearchNavigator
    term={overlay.term ?? ""}
    position={overlay.position}
    total={overlay.matchCount}
    onup={overlay.up}
    ondown={overlay.down}
    onexit={overlay.exit}
    ontermchange={overlay.setTerm}
    ondeepsearch={hasMoreMessages && deepPhase === "idle"
      ? () => void triggerConversationDeepSearch()
      : undefined}
    deepSearchStatus={deepPhase}
    deepSearchSearched={displayFollowUpsForSearch?.length ?? 0}
    deepSearchTotal={displayFollowUpsForSearch?.length ?? 0}
  />
{/snippet}

{#snippet ticketSubnavbar()}
  <SubNavbarFilterLayout
    title={decryptedTitle}
    smallTitle
    view={detailViewConfig}
    stats={detailStats}
    selectLabel={m.ticket_select_mode()}
    onselect={selectModeActive ? exitSelectMode : enterSelectMode}
    filterPills={detailFilterPills}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    onsearch={!overlay.active ? () => overlay.enter("") : undefined}
    searchLabel={m.search_inline_trigger()}
  />
{/snippet}

<div class="ticket-detail-page">
  <TicketDetail
    {ticketId}
    knownFollowUpCount={cachedFollowUpCount}
    bind:draftText
    {cursorPosition}
    onmentionselect={handleMentionSelect}
    onlightbox={openLightbox}
    oncontextmenu={openContextMenu}
    onopenedit={openNoteEditSheet}
    bind:timelineActive
    {readUpTo}
    onreadprogress={handleReadProgress}
    {selectModeActive}
    selectedIds={new Set(selectedIds)}
    {toggleSelected}
    filterTypes={filterTypesArr}
    filterAuthors={filterAuthorsArr}
    {filterDateFrom}
    {filterDateTo}
    onclearfilters={clearAllFilters}
    bind:filteredFollowUps
    bind:searchableFollowUps
    bind:scrollContainerEl={chatScrollEl}
    bind:scrollReady={chatScrollReady}
    searchTerm={overlay.term}
    searchActiveMatchId={overlay.activeId}
    searchScrollRequested={overlay.scrollRequested}
    onsearchscrollcomplete={overlay.markScrollComplete}
    bind:hasMoreMessages
    bind:loadOlderPage
  />
</div>

{#if !selectModeActive}
  <ShellMessagebar
    bind:value={draftText}
    onsend={handleSend}
    onplus={openComposeActions}
    oninput={handleInput}
    sendDisabled={!draftText.trim()}
  />
{/if}

{#snippet selectLeft()}
  <Link
    iconOnly
    onclick={() => {
      if (filteredFollowUps) {
        for (const fu of filteredFollowUps) {
          selectedIds.add(fu.id);
        }
      }
    }}
    aria-label={m.ticket_select_all()}
  >
    <SquareCheckBig size={24} aria-hidden="true" />
  </Link>
  <Link
    iconOnly
    onclick={() => {
      if (selectedIds.size > 0 && filteredFollowUps) {
        void handleCopySelected(filteredFollowUps);
      }
    }}
    aria-label={m.common_copy()}
    class={selectedIds.size === 0 ? "opacity-30 pointer-events-none" : ""}
    aria-disabled={selectedIds.size === 0}
  >
    <Copy size={24} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet selectMiddle()}
  <span class="font-semibold text-sm" role="status">
    {selectedIds.size <= 1
      ? m.ticket_copy_one_message()
      : m.ticket_copy_messages({ count: String(selectedIds.size) })}
  </span>
{/snippet}

{#snippet selectRight()}
  <Link iconOnly aria-label={m.ticket_select_cancel()} onclick={exitSelectMode}>
    <X size={24} aria-hidden="true" />
  </Link>
{/snippet}

<!-- Overlays (route file owns all shell wrappers) -->
<ShellPopup opened={panelOpen} ondismiss={closePanel} title={clientAlias}>
  <TicketPanelContent
    {ticketId}
    onaction={handlePanelAction}
    onnotetap={handleNoteTap}
    onlightbox={handlePanelLightbox}
  />
</ShellPopup>

<AssignSheet
  opened={assignSheetOpen}
  {ticketId}
  currentAssigneeId={ticket?.assignedTo ?? null}
  ondismiss={() => {
    assignSheetOpen = false;
  }}
  onassign={(tid: string, targetUserId: string | null) => {
    assignSheetOpen = false;
    void ticketRouter.assignTo
      .mutate({ ticketId: tid, targetUserId })
      .then(() => {
        haptic();
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.detail(ticketId),
        });
        void queryClient.invalidateQueries({
          queryKey: ticketsKeys.lists(),
        });
      })
      .catch(() => {
        toastStore.show(m.error_generic(), 3000);
      });
  }}
/>

<ShellActionSheet opened={callSheetOpen} ondismiss={closeCallSheet}>
  <CallOptionsContent {hasVerifiedPhone} onaction={handleCallAction} />
</ShellActionSheet>

<ComposeActions
  opened={composeActionsOpen}
  ondismiss={closeComposeActions}
  target={composeActionsAnchor}
  {ticketId}
  onpresetselect={(body: string) => {
    draftText = body;
  }}
/>

<ShellPopup opened={lightboxOpen} ondismiss={closeLightbox}>
  {#if lightboxUrl}
    <div class="lightbox-content">
      <img
        src={lightboxUrl}
        alt={m.ticket_mms_lightbox_label()}
        class="lightbox-img"
      />
    </div>
  {/if}
</ShellPopup>

<!-- Context menu (long-press on message bubble) -->
<ShellActionSheet opened={contextMenuOpen} ondismiss={closeContextMenu}>
  {#if contextMenuData !== null}
    <ActionsGroup>
      {#each contextMenuData.actions as action (action.id)}
        <ActionsButton
          onclick={() => handleContextAction(action.id)}
          bold={action.destructive === true}
          colors={action.destructive === true
            ? { textIos: "text-red-500", textMaterial: "text-red-500" }
            : undefined}
        >
          {action.label}
        </ActionsButton>
      {/each}
    </ActionsGroup>
    <ActionsGroup>
      <ActionsButton onclick={closeContextMenu} bold>
        {m.common_cancel()}
      </ActionsButton>
    </ActionsGroup>
  {/if}
</ShellActionSheet>

<!-- Edit note sheet -->
<InternalNoteSheet
  opened={editNoteSheetOpen}
  ondismiss={dismissNoteEditSheet}
  {ticketId}
  editFollowUpId={editNoteFollowUpId}
  editInitialContent={editNoteContent}
  editInitialNoteTypeId={editNoteTypeId}
  ondelete={(followUpId: string) => {
    dismissNoteEditSheet();
    deleteTargetId = followUpId;
    deleteConfirmOpen = true;
  }}
/>

<!-- Delete note confirmation dialog -->
<ShellDialog
  opened={deleteConfirmOpen}
  ondismiss={closeDeleteConfirm}
  title={m.ticket_delete_note_confirm_title()}
>
  {#snippet content()}
    <p>{m.ticket_delete_note_confirm_body()}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={closeDeleteConfirm}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton onclick={confirmDelete} class="text-red-500 font-semibold">
      {m.common_delete()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<CloseResolutionSheet
  opened={closeSheetOpen}
  noteTypeId={closeQueueNoteTypeId ?? ""}
  noteTypeName={closeQueueTypeName}
  NoteTypeIcon={closeQueueTypeIcon}
  current={closeQueueIndex + 1}
  total={closeQueue.length}
  saving={closeSaving}
  onsubmit={(text: string) => void handleCloseSheetSubmit(text)}
  onskip={handleCloseSheetSkip}
/>

<style>
  .ticket-detail-page {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .lightbox-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    min-height: 200px;
  }

  .lightbox-img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 0.5rem;
  }
</style>
