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
  import { tick } from "svelte";
  import { page } from "$app/state";
  import { Link, Button } from "konsta/svelte";
  import {
    ChevronLeft,
    ArrowUp,
    ArrowDown,
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

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const cryptoBridge = getCryptoBridge();
  const queryClient = useQueryClient();

  type FollowUpList = Awaited<
    ReturnType<typeof ticketRouter.listFollowUps.query>
  >;

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
    queryKey: ["ticket", ticketId],
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
      queryKey: ["tickets", "list"],
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
    queryKey: ["ticket", ticketId, "readCursor"],
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
    queryKey: ["consultant"],
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
        chatScrollReady && scrollDir.hidden && !searchOverlayActive,
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
  let editingFollowUpId = $state<string | null>(null);
  let savingNote = $state(false);
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

  const typeFilterOptions = $derived([
    { value: "internal_note", label: m.ticket_filter_type_notes() },
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

  // --- Search overlay mode (ID-first design) ---
  //
  // Primary state: activeId (which match is highlighted).
  // Position ("3 of 28") is derived from activeId's index in matches.
  // This avoids index drift when the matches array recomputes
  // (view switches, new decryptions, filter changes).

  let searchOverlayTerm = $state<string | null>(null);
  let searchActiveId = $state<string | null>(null);
  let searchScrollRequested = $state(false);

  const searchOverlayActive = $derived(searchOverlayTerm !== null);

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

  const searchMatches = $derived.by((): string[] => {
    if (searchOverlayTerm == null || !displayFollowUpsForSearch) return [];
    const searchable: { id: string; plaintext: string }[] = [];
    for (const fu of displayFollowUpsForSearch) {
      const plaintext = followUpCache.get(fu.id);
      if (plaintext === undefined || plaintext === DECRYPT_ERROR_SENTINEL) {
        continue;
      }
      searchable.push({ id: fu.id, plaintext });
    }
    const haystack = searchable.map((e) => e.plaintext);
    const fuzzyMatches = fuzzySearch(haystack, searchOverlayTerm);
    const matchIndices = fuzzyMatches.map((fm) => fm.index);
    matchIndices.sort((a, b) => a - b);
    const ids: string[] = [];
    for (const idx of matchIndices) {
      const entry = searchable[idx]; // eslint-disable-line security/detect-object-injection -- idx from fuzzySearch, bounded by haystack.length
      if (entry != null) ids.push(entry.id);
    }
    return ids;
  });

  const searchOverlayPosition = $derived(
    searchActiveId != null ? searchMatches.indexOf(searchActiveId) : -1,
  );

  const searchActiveMatchId = $derived(searchActiveId);

  function enterSearchOverlay(term: string, targetId?: string): void {
    searchOverlayTerm = term;
    void tick().then(() => {
      if (
        targetId != null &&
        targetId !== "" &&
        searchMatches.includes(targetId)
      ) {
        searchActiveId = targetId;
      } else {
        searchActiveId = searchMatches[searchMatches.length - 1] ?? null;
      }
      searchScrollRequested = true;
      scrollToMatch();
    });
  }

  function exitSearchOverlay(): void {
    searchOverlayTerm = null;
    searchActiveId = null;
  }

  function navigateSearchUp(): void {
    if (searchMatches.length === 0) return;
    navigateWithoutScrollTracking(() => {
      const idx = searchOverlayPosition;
      const prevIdx = idx <= 0 ? searchMatches.length - 1 : idx - 1;
      searchActiveId = searchMatches.at(prevIdx) ?? null;
      searchScrollRequested = true;
      void tick().then(() => scrollToMatch());
    });
  }

  function navigateSearchDown(): void {
    if (searchMatches.length === 0) return;
    navigateWithoutScrollTracking(() => {
      const idx = searchOverlayPosition;
      const nextIdx = idx >= searchMatches.length - 1 ? 0 : idx + 1;
      searchActiveId = searchMatches.at(nextIdx) ?? null;
      searchScrollRequested = true;
      void tick().then(() => scrollToMatch());
    });
  }

  function scrollToMatch(): void {
    const id = searchActiveId;
    if (id == null) return;
    requestAnimationFrame(() => {
      const prefix = timelineActive ? "tl-fu" : "fu";
      const wrapper = document.getElementById(`${prefix}-${id}`);
      if (wrapper == null) return;
      const target = wrapper.firstElementChild ?? wrapper;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Track which search match is nearest the viewport center while scrolling.
  let scrollTrackingEnabled = $state(true);

  function updateMatchFromScroll(): void {
    if (!scrollTrackingEnabled || !searchOverlayActive) return;
    if (searchMatches.length === 0 || chatScrollEl == null) return;

    const containerRect = chatScrollEl.getBoundingClientRect();
    const viewportCenter = containerRect.top + containerRect.height / 2;
    let closestId: string | null = null;
    let closestDist = Infinity;
    const prefix = timelineActive ? "tl-fu" : "fu";

    for (const id of searchMatches) {
      const wrapper = document.getElementById(`${prefix}-${id}`);
      if (wrapper == null) continue;
      const el = wrapper.firstElementChild ?? wrapper;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestId = id;
      }
    }

    if (closestId != null && closestId !== searchActiveId) {
      searchActiveId = closestId;
    }
  }

  let scrollRafId: number | null = null;

  function handleSearchScroll(): void {
    if (!searchOverlayActive || !scrollTrackingEnabled) return;
    if (scrollRafId != null) return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = null;
      updateMatchFromScroll();
    });
  }

  $effect(() => {
    if (!searchOverlayActive || chatScrollEl == null) return;
    const el = chatScrollEl;
    el.addEventListener("scroll", handleSearchScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleSearchScroll);
      if (scrollRafId != null) {
        cancelAnimationFrame(scrollRafId);
        scrollRafId = null;
      }
    };
  });

  function navigateWithoutScrollTracking(fn: () => void): void {
    scrollTrackingEnabled = false;
    fn();
    setTimeout(() => {
      scrollTrackingEnabled = true;
    }, 600);
  }

  // Scroll to active match when switching views.
  // activeId stays stable; just need to scroll to its element in the new view.
  let prevTimelineActive = $state(false);
  $effect(() => {
    const switched = timelineActive !== prevTimelineActive;
    prevTimelineActive = timelineActive;
    if (switched && searchActiveId != null) {
      searchScrollRequested = true;
      if (!timelineActive) {
        void tick().then(() => scrollToMatch());
      }
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
          enterSearchOverlay(query);
        },
        onresulttap: (id: string, query: string) => {
          enterSearchOverlay(query, id);
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
        mutateWithToast(ticketRouter.close.mutate({ ticketId }));
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
        editingFollowUpId = data.followUpId;
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

    const followUpsKey = ["ticket", ticketId, "followUps", "initial"];

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
        queryKey: ["ticket", ticketId, "followUps"],
      });
    } catch {
      // Rollback: restore the cached list.
      queryClient.setQueryData<FollowUpList>(followUpsKey, previousData);
      toastStore.show(m.error_followup_not_deletable());
    }
  }

  // --- Note edit handlers ---

  async function handleNoteEdit(
    followUpId: string,
    newPlaintext: string,
  ): Promise<void> {
    // Stay in edit mode. Show saving indicator.
    savingNote = true;

    try {
      const encryptedContent = await cryptoBridge.encrypt(
        ticketId,
        newPlaintext,
      );
      await ticketRouter.updateInternalNote.mutate({
        followUpId,
        encryptedContent,
      });
      // Success: exit edit mode and refresh.
      editingFollowUpId = null;
      savingNote = false;
      void queryClient.invalidateQueries({
        queryKey: ["ticket", ticketId, "followUps"],
      });
    } catch {
      // Stay in edit mode with the user's text intact.
      savingNote = false;
      toastStore.show(m.error_followup_not_editable());
    }
  }

  function cancelNoteEdit(): void {
    editingFollowUpId = null;
    savingNote = false;
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
  <div
    class="search-navigator"
    role="toolbar"
    aria-label={m.search_conversation_nav_label()}
  >
    <Button
      tonal
      rounded
      small
      inline
      class="search-close-btn"
      aria-label={m.common_cancel()}
      onclick={exitSearchOverlay}
    >
      <X size={16} aria-hidden="true" />
    </Button>
    <span class="search-term" title={searchOverlayTerm ?? ""}>
      "{searchOverlayTerm}"
    </span>
    <span class="search-position">
      {m.search_conversation_position({
        current: String(
          searchOverlayPosition >= 0 ? searchOverlayPosition + 1 : 0,
        ),
        total: String(searchMatches.length),
      })}
    </span>
    <div class="search-nav-buttons">
      <Button
        tonal
        rounded
        small
        inline
        class="search-nav-btn"
        aria-label={m.search_conversation_previous()}
        onclick={navigateSearchUp}
      >
        <ArrowUp size={16} aria-hidden="true" />
      </Button>
      <Button
        tonal
        rounded
        small
        inline
        class="search-nav-btn"
        aria-label={m.search_conversation_next()}
        onclick={navigateSearchDown}
      >
        <ArrowDown size={16} aria-hidden="true" />
      </Button>
    </div>
  </div>
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
    searchNavigator={searchOverlayActive ? searchNavigatorRow : undefined}
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
    {editingFollowUpId}
    {savingNote}
    onnoteedit={(fid: string, text: string) => void handleNoteEdit(fid, text)}
    oncanceledit={cancelNoteEdit}
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
    searchTerm={searchOverlayTerm}
    {searchActiveMatchId}
    {searchScrollRequested}
    onsearchscrollcomplete={() => {
      searchScrollRequested = false;
    }}
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
        void queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        void queryClient.invalidateQueries({
          queryKey: ["tickets", "list"],
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

  /* Search navigator (subnavbar row 3) */

  .search-navigator {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.25rem;
    gap: 0.25rem;
    border-top: 1px solid
      color-mix(in srgb, var(--brand-primary) 15%, transparent);
  }

  .search-term {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .search-position {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink);
    white-space: nowrap;
    margin-left: auto;
    margin-right: auto;
  }

  .search-nav-buttons {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  :global(.search-nav-btn),
  :global(.search-close-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    background: color-mix(
      in srgb,
      var(--brand-accent) 15%,
      transparent
    ) !important;
  }

  :global(.search-nav-btn svg) {
    color: var(--ink) !important;
  }

  :global(.search-close-btn) {
    background: color-mix(in srgb, #e53e3e 15%, transparent) !important;
  }

  :global(.search-close-btn svg) {
    color: #e53e3e !important;
  }
</style>
