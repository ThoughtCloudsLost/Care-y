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
  import { Link } from "konsta/svelte";
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
  import { withTerms } from "$lib/terminology/with-terms.js";
  import {
    getTabbarHiddenCtx,
    getNavbarOverrideCtx,
    getTabbarOverrideCtx,
  } from "$lib/shell/context.js";
  import { shellBack } from "$lib/shell/navigation.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import type { ViewToggleConfig } from "$lib/shell/types.js";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import TicketDetail from "$lib/components/tickets/TicketDetail.svelte";
  import PriorityBadge from "$lib/components/PriorityBadge.svelte";
  import type { ContextMenuEvent } from "$lib/components/tickets/context-menu-actions.js";
  import { createLightbox } from "$lib/composables/ticket-detail/create-lightbox.svelte.js";
  import { createContextMenu } from "$lib/composables/ticket-detail/create-context-menu.svelte.js";
  import { createSelectMode } from "$lib/composables/ticket-detail/create-select-mode.svelte.js";
  import { createReadCursor } from "$lib/composables/ticket-detail/create-read-cursor.svelte.js";
  import { createCloseResolution } from "$lib/composables/ticket-detail/create-close-resolution.svelte.js";
  import { createDetailFilters } from "$lib/composables/ticket-detail/create-detail-filters.svelte.js";
  import { copyToClipboard } from "$lib/composables/ticket-detail/clipboard-copy.js";
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
  import { requireRouter } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { createSendMessage } from "$lib/composables/ticket-detail/create-send-message.svelte.js";
  import { createSmsSend } from "$lib/composables/ticket-detail/create-sms-send.svelte.js";
  import { createCallDispatch } from "$lib/composables/ticket-detail/create-call-dispatch.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
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
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ExposureHint from "$lib/components/tickets/ExposureHint.svelte";
  import SmsComposeContent from "$lib/components/tickets/SmsComposeContent.svelte";
  import { tick } from "svelte";

  // ── Composable initialization ──

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
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

  // --- Read cursor (composable) ---

  const readCursorQuery = createQuery(() => ({
    queryKey: ticketKeys.readCursor(ticketId),
    queryFn: async () => ticketRouter.getReadCursor.query({ ticketId }),
    enabled: ticketId !== "",
  }));

  const readCursor = createReadCursor({
    getTicketId: () => ticketId,
    getTicketKeyWrap: () => ticket?.keyWrap ?? undefined,
    getCursorData: () => readCursorQuery.data ?? undefined,
    cryptoBridge,
    mutate: async (args) => ticketRouter.updateReadCursor.mutate(args),
  });

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
    if (selectMode.active) {
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
  // Lightbox + context menu managed by composables (initialized below after helpers).
  let deleteConfirmOpen = $state(false);
  let deleteTargetId = $state<string | null>(null);
  let editNoteSheetOpen = $state(false);
  let editNoteFollowUpId = $state<string | undefined>(undefined);
  let editNoteContent = $state<string | undefined>(undefined);
  let editNoteTypeId = $state<string | undefined>(undefined);
  let timelineActive = $state(false);
  let smsSheetOpen = $state(false);

  // --- Exposure hint state ---

  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- not reactive, used as mutable dedup tracker
  const shownExposureHints = new Set<string>();
  let exposureHintType = $state<"sms" | "call" | null>(null);
  let exposureHintOpen = $state(false);
  let pendingAction: (() => void) | null = null;

  function shouldShowHint(type: "sms" | "call"): boolean {
    if (shownExposureHints.has(type)) return false;
    shownExposureHints.add(type);
    return true;
  }

  function showExposureHint(type: "sms" | "call", callback: () => void): void {
    if (!shouldShowHint(type)) {
      callback();
      return;
    }
    exposureHintType = type;
    exposureHintOpen = true;
    pendingAction = callback;
    void tick().then(() => {
      document
        .querySelector<HTMLElement>('[data-testid="exposure-dismiss"]')
        ?.focus();
    });
  }

  function dismissExposureHint(): void {
    exposureHintOpen = false;
    if (pendingAction) {
      const action = pendingAction;
      pendingAction = null;
      action();
    }
  }

  // Filtered follow-ups (bound from TicketDetail for select mode copy).
  let filteredFollowUps = $state<FollowUpList | undefined>(undefined);

  // --- Shared context (used by composables and page wiring) ---

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

  // --- Conversation filters (composable) ---

  const detailFilters = createDetailFilters({
    getNoteTypes: () => noteTypesQuery?.data?.types,
    getParticipants: () => participantsQuery.data,
    getParticipantsLoading: () => participantsQuery.isLoading,
    orgCache,
    getClientAlias: () => clientAlias,
    getCurrentUserId: () => currentUserId,
    labels: {
      filterType: m.ticket_filter_type(),
      filterAuthor: m.ticket_filter_author(),
      filterDate: m.ticket_filter_date(),
      authorYou: (name: string) => m.ticket_author_you({ name }),
      typeRecordings: m.ticket_filter_type_recordings(),
      typeImages: m.ticket_filter_type_images(),
      typeFiles: m.ticket_filter_type_files(),
      typeMessages: m.ticket_filter_type_messages(),
      typeAssignment: m.ticket_filter_type_assignment(),
      typeStatus: m.ticket_filter_type_status(),
      typePriority: m.ticket_filter_type_priority(),
      typeHold: m.ticket_filter_type_hold(),
      typeMerge: m.ticket_filter_type_merge(),
      typeCalls: m.ticket_filter_type_calls(),
    },
  });

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

  // --- Select mode (composable) ---

  const selectMode = createSelectMode({
    getClientAlias: () => clientAlias,
    getVolunteerMap: () => volunteerMap,
    orgCache,
    followUpCache,
    getTicketKeyWrap: () => ticket?.keyWrap ?? null,
    toastStore,
    labels: {
      oneCopied: m.ticket_one_message_copied(),
      manyCopied: (count: string) => m.ticket_messages_copied({ count }),
      copyFailed: m.common_copy_failed(),
    },
  });

  // --- Send message (composable) ---

  const messenger = createSendMessage<FollowUpList[number]>({
    getTicketId: () => ticketId,
    getCurrentUserId: () => currentUserId ?? null,
    getDraftText: () => draftText,
    setDraftText: (v: string) => {
      draftText = v;
    },
    cryptoBridge,
    followUpCache,
    queryClient,
    buildPendingEntry: ({
      pendingId,
      ticketId: tid,
      mentionedPseudonyms,
      currentUserId: uid,
    }) =>
      ({
        id: pendingId,
        ticketId: tid,
        source: "volunteer",
        type: "message",
        isPrivate: false,
        mentionedPseudonyms,
        encryptedContent: { type: "Buffer" as const, data: [] },
        createdBy: uid,
        createdAt: new Date().toISOString(),
        hasRecording: false,
        hasImage: false,
        hasFile: false,
        noteTypeId: null,
        callSid: null,
        callStatus: null,
        callDurationSeconds: null,
        keyGeneration: null,
        keyWrap: null,
      }) satisfies FollowUpList[number],
    createFollowUpMutate: async (args) =>
      ticketRouter.createFollowUp.mutate(args),
  });

  // --- SMS send (composable) ---

  const sms = createSmsSend({
    getTicketId: () => ticketId,
    cryptoBridge,
    queryClient,
    createFollowUpMutate: async (args) =>
      ticketRouter.createFollowUp.mutate(args),
    onSuccess: () => {
      smsSheetOpen = false;
    },
  });
  const smsSending = $derived(sms.sending);

  // --- Call dispatch (composable) ---

  const callDispatch = createCallDispatch({
    getTicketId: () => ticketId,
    cryptoBridge,
    getEncryptedPhone: () => consultantQuery.data?.encryptedPhone,
  });
  const callInProgress = $derived(callDispatch.inProgress);

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

  const handleSend = messenger.handleSend;
  const sending = $derived(messenger.sending);

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

  // --- Close flow (composable) ---

  const closeFlow = createCloseResolution({
    getTicketId: () => ticketId,
    cryptoBridge,
    queryClient,
    getNoteTypes: () => noteTypesQuery?.data?.types,
    orgCache,
    toastStore,
    labels: { error: m.error_generic() },
    closeMutate: async (tid) => ticketRouter.close.mutate({ ticketId: tid }),
    createFollowUpMutate: async (args) =>
      ticketRouter.createFollowUp.mutate(args),
  });

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
        closeFlow.start();
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
    if (action === "cancel" || callInProgress) return;

    showExposureHint("call", () => {
      void callDispatch.executeCall();
    });
  }

  // --- SMS handlers ---

  function handleOpenSmsCompose(): void {
    showExposureHint("sms", () => {
      smsSheetOpen = true;
    });
  }

  const handleSmsSend = sms.handleSmsSend;

  // --- Context menu + lightbox (composables) ---

  const lightbox = createLightbox();

  const contextMenu = createContextMenu({
    oncopy: async (plaintext) =>
      copyToClipboard(plaintext, toastStore, {
        success: m.ticket_copied_to_clipboard(),
        failure: m.common_copy_failed(),
      }),
    onedit: openNoteEditSheet,
    ondelete: (followUpId: string) => {
      deleteTargetId = followUpId;
      deleteConfirmOpen = true;
    },
  });

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

  function handlePanelLightbox(imageUrl: string): void {
    closePanel();
    lightbox.show(imageUrl);
  }

  function openCallSheet(): void {
    callSheetOpen = true;
  }
  function closeCallSheet(): void {
    callSheetOpen = false;
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
        ? m.ticket_detail_one_volunteer_stat(withTerms())
        : m.ticket_detail_volunteers_stat(
            withTerms({ count: String(volCount) }),
          )}
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
    onselect={selectMode.active
      ? () => selectMode.exit()
      : () => selectMode.enter()}
    filterPills={detailFilters.pills}
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
    onlightbox={(url: string) => lightbox.show(url)}
    oncontextmenu={(e: ContextMenuEvent) => contextMenu.show(e)}
    onopenedit={openNoteEditSheet}
    bind:timelineActive
    readUpTo={readCursor.readUpTo}
    onreadprogress={(ts: string) => readCursor.handleProgress(ts)}
    selectModeActive={selectMode.active}
    selectedIds={new Set(selectMode.selectedIds)}
    toggleSelected={(id: string) => selectMode.toggle(id)}
    filterTypes={detailFilters.filterTypesArr}
    filterAuthors={detailFilters.filterAuthorsArr}
    filterDateFrom={detailFilters.filterDateFrom}
    filterDateTo={detailFilters.filterDateTo}
    onclearfilters={() => detailFilters.clearAll()}
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

{#if !selectMode.active}
  <ShellMessagebar
    bind:value={draftText}
    onsend={handleSend}
    onplus={openComposeActions}
    oninput={handleInput}
    sendDisabled={!draftText.trim() || sending}
  />
{/if}

{#snippet selectLeft()}
  <Link
    iconOnly
    onclick={() => {
      if (filteredFollowUps) {
        for (const fu of filteredFollowUps) {
          selectMode.selectedIds.add(fu.id);
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
      if (selectMode.selectedIds.size > 0 && filteredFollowUps) {
        void selectMode.copySelected(filteredFollowUps);
      }
    }}
    aria-label={m.common_copy()}
    class={selectMode.selectedIds.size === 0
      ? "opacity-30 pointer-events-none"
      : ""}
    aria-disabled={selectMode.selectedIds.size === 0}
  >
    <Copy size={24} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet selectMiddle()}
  <span class="font-semibold text-sm" role="status">
    {selectMode.selectedIds.size <= 1
      ? m.ticket_copy_one_message()
      : m.ticket_copy_messages({ count: String(selectMode.selectedIds.size) })}
  </span>
{/snippet}

{#snippet selectRight()}
  <Link
    iconOnly
    aria-label={m.ticket_select_cancel()}
    onclick={() => selectMode.exit()}
  >
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
  ontextclient={handleOpenSmsCompose}
/>

<ShellSheet
  opened={smsSheetOpen}
  ondismiss={() => (smsSheetOpen = false)}
  ariaLabel={m.ticket_sms_title(withTerms())}
>
  <SmsComposeContent
    onsend={handleSmsSend}
    oncancel={() => (smsSheetOpen = false)}
    sending={smsSending}
    error={null}
  />
</ShellSheet>

{#if exposureHintType}
  <ExposureHint
    type={exposureHintType}
    opened={exposureHintOpen}
    ondismiss={dismissExposureHint}
  />
{/if}

<ShellPopup opened={lightbox.open} ondismiss={() => lightbox.dismiss()}>
  {#if lightbox.url}
    <div class="lightbox-content">
      <img
        src={lightbox.url}
        alt={m.ticket_mms_lightbox_label()}
        class="lightbox-img"
      />
    </div>
  {/if}
</ShellPopup>

<!-- Context menu (long-press on message bubble) -->
<ShellActionSheet
  opened={contextMenu.open}
  ondismiss={() => contextMenu.dismiss()}
>
  {#if contextMenu.data !== null}
    <ActionsGroup>
      {#each contextMenu.data.actions as action (action.id)}
        <ActionsButton
          onclick={() => contextMenu.dispatch(action.id)}
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
      <ActionsButton onclick={() => contextMenu.dismiss()} bold>
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
  opened={closeFlow.sheetOpen}
  noteTypeId={closeFlow.noteTypeId ?? ""}
  noteTypeName={closeFlow.noteTypeName}
  NoteTypeIcon={resolveNoteTypeIcon(closeFlow.noteTypeIconName)}
  current={closeFlow.current}
  total={closeFlow.total}
  saving={closeFlow.saving}
  onsubmit={(text: string) => void closeFlow.submit(text)}
  onskip={() => closeFlow.skip()}
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
