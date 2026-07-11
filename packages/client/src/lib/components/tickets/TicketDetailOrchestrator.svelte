<!--
  Ticket detail orchestrator: data layer between TicketDetail content
  component and shell navigation chrome.

  Extracted from the [id]/+page.svelte route to enable reuse in both
  the full-page mobile view and the desktop split-view right pane.

  The ticketId is received as a prop. Shell context getters resolve
  to either AppShell's real contexts (mobile) or inert shadow
  containers (split view), depending on the component tree ancestor.
-->
<script lang="ts">
  import { getDraft, setDraft } from "$lib/tickets/draft-store.svelte.js";
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
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import type { ViewToggleConfig } from "$lib/shell/types.js";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import TicketDetail from "$lib/components/tickets/TicketDetail.svelte";
  import CaseHeader from "$lib/components/tickets/CaseHeader.svelte";
  import type { ContextMenuEvent } from "$lib/components/tickets/context-menu-actions.js";
  import { createLightbox } from "$lib/composables/ticket-detail/create-lightbox.svelte.js";
  import { createContextMenu } from "$lib/composables/ticket-detail/create-context-menu.svelte.js";
  import { createSelectMode } from "$lib/composables/ticket-detail/create-select-mode.svelte.js";
  import { createReadCursor } from "$lib/composables/ticket-detail/create-read-cursor.svelte.js";
  import { createCloseResolution } from "$lib/composables/ticket-detail/create-close-resolution.svelte.js";
  import { createDetailFilters } from "$lib/composables/ticket-detail/create-detail-filters.svelte.js";
  import { createExposureHint } from "$lib/composables/ticket-detail/create-exposure-hint.svelte.js";
  import { createDeepSearch } from "$lib/composables/ticket-detail/create-deep-search.svelte.js";
  import { createPanelActions } from "$lib/composables/ticket-detail/create-panel-actions.svelte.js";
  import {
    createDeleteConfirm,
    createNoteEdit,
  } from "$lib/composables/ticket-detail/create-overlay-state.svelte.js";
  import { copyToClipboard } from "$lib/composables/ticket-detail/clipboard-copy.js";
  import {
    insertMentionAtCursor,
    searchFollowUps,
    lookupCachedFollowUpCount,
  } from "$lib/tickets/ticket-detail-utils.js";
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import type { TicketAction } from "$lib/tickets/types.js";
  import type { CallAction } from "$lib/components/tickets/CallOptionsContent.svelte";
  import TicketDetailOverlays from "$lib/components/tickets/TicketDetailOverlays.svelte";
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

  let {
    ticketId,
    onback,
  }: {
    ticketId: string;
    onback: () => void;
  } = $props();

  // ── Composable initialization ──

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const cryptoBridge = getCryptoBridge();
  const queryClient = useQueryClient();

  type FollowUpList = Awaited<
    ReturnType<typeof ticketRouter.listFollowUps.query>
  >["followUps"];

  const tabbarHidden = getTabbarHiddenCtx();
  const navbarCtx = getNavbarOverrideCtx();
  const tabbarOverride = getTabbarOverrideCtx();

  // Draft compose state (shared with ShellMessagebar + TicketDetail).
  // In-memory SvelteMap keyed by ticketId survives SPA navigations.
  // No disk persistence (sessionStorage) to avoid plaintext PII on disk.
  // Writable $derived: re-evaluates from store when ticketId changes,
  // user writes from textarea bind override until next ticketId change.
  let draftText = $derived(getDraft(ticketId));
  let cursorPosition = $state(0);

  // Sync edits back to the store.
  $effect(() => {
    setDraft(ticketId, draftText);
  });

  // Warn before page refresh/tab close when a draft exists.
  $effect(() => {
    if (!draftText.trim()) return;
    function onBeforeUnload(e: BeforeUnloadEvent): void {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  });

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

  const cachedFollowUpCount = $derived(
    lookupCachedFollowUpCount(
      queryClient.getQueriesData({ queryKey: ticketsKeys.lists() }),
      ticketId,
    ),
  );

  // --- Read cursor (composable) ---

  const readCursorQuery = createQuery(() => ({
    queryKey: ticketKeys.readCursor(ticketId),
    queryFn: async () => ticketRouter.getReadCursor.query({ ticketId }),
    enabled: ticketId !== "",
  }));

  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  const readCursor = createReadCursor({
    getTicketId: () => ticketId,
    getUserId: () => currentUserId ?? "",
    getTicketKeyWrap: () => ticket?.keyWrap ?? undefined,
    getCursorData: () => readCursorQuery.data ?? undefined,
    cryptoBridge,
    mutate: async (args) => {
      const result = await ticketRouter.updateReadCursor.mutate(args);
      // The tickets list derives unread pills from this cursor; refresh
      // both read-state families so window and sweep settle together.
      void queryClient.invalidateQueries({
        queryKey: ticketsKeys.readStates(),
      });
      void queryClient.invalidateQueries({
        queryKey: ticketsKeys.readStateSweep(),
      });
      return result;
    },
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
  let timelineActive = $state(false);
  let smsSheetOpen = $state(false);

  // --- Exposure hint (composable) ---

  const exposureHint = createExposureHint();

  // Filtered follow-ups (bound from TicketDetail for select mode copy).
  let filteredFollowUps = $state<FollowUpList | undefined>(undefined);

  // --- Shared context (used by composables and page wiring) ---

  const orgCache = getOrgDecryptCache();
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
    getTicketId: () => ticketId,
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
    return searchFollowUps(
      displayFollowUpsForSearch,
      followUpCache,
      overlay.term,
      DECRYPT_ERROR_SENTINEL,
      fuzzySearch,
    );
  });

  // -- Deep search (composable) --

  let hasMoreMessages = $state(false);
  let loadOlderPage = $state<(() => Promise<void>) | undefined>(undefined);

  const deepSearch = createDeepSearch({
    getOverlayTerm: () => overlay.term,
    getHasMoreMessages: () => hasMoreMessages,
    getLoadOlderPage: () => loadOlderPage,
  });

  $effect(() => {
    if (deepSearch.term == null) return;
    if (!overlay.active || overlay.term !== deepSearch.term) {
      deepSearch.reset();
    }
  });

  $effect(() => {
    if (
      overlay.active &&
      overlay.term != null &&
      overlay.term.length >= 2 &&
      searchMatches.length === 0 &&
      deepSearch.phase === "idle" &&
      hasMoreMessages // eslint-disable-line @typescript-eslint/no-unnecessary-condition -- $state updated reactively by TicketDetail child
    ) {
      void deepSearch.trigger();
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
    const result = insertMentionAtCursor(
      draftText,
      cursorPosition,
      displayName,
    );
    if (result === null) return;
    draftText = result.text;
    cursorPosition = result.cursor;
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

  const panelActions = createPanelActions({
    getTicketId: () => ticketId,
    toastStore,
    takeMutate: async (tid) => ticketRouter.take.mutate({ ticketId: tid }),
    releaseMutate: async (tid) =>
      ticketRouter.release.mutate({ ticketId: tid }),
    updateMutate: async (args) => ticketRouter.update.mutate(args),
    reopenMutate: async (args) => ticketRouter.reopen.mutate(args),
    watchMutate: async (tid) =>
      ticketRouter.watchTicket.mutate({ ticketId: tid }),
    unwatchMutate: async (tid) =>
      ticketRouter.unwatchTicket.mutate({ ticketId: tid }),
    onclose: () => closeFlow.start(),
    oncall: () => {
      closePanel();
      openCallSheet();
    },
    onassign: () => {
      closePanel();
      assignSheetOpen = true;
    },
  });

  function handleCallAction(action: CallAction): void {
    closeCallSheet();
    if (action === "cancel" || callInProgress) return;

    exposureHint.show("call", () => {
      void callDispatch.executeCall();
    });
  }

  // --- SMS handlers ---

  function handleOpenSmsCompose(): void {
    exposureHint.show("sms", () => {
      smsSheetOpen = true;
    });
  }

  const handleSmsSend = sms.handleSmsSend;

  // --- Delete confirm + note edit (composables) ---

  const deleteConfirm = createDeleteConfirm({
    getTicketId: () => ticketId,
    queryClient,
    toastStore,
    deleteNoteMutate: async (followUpId) =>
      ticketRouter.deleteInternalNote.mutate({ followUpId }),
    labels: { deleteError: m.error_followup_not_deletable() },
  });

  const noteEdit = createNoteEdit();

  // --- Context menu + lightbox (composables) ---

  const lightbox = createLightbox();

  const contextMenu = createContextMenu({
    oncopy: async (plaintext) =>
      copyToClipboard(plaintext, toastStore, {
        success: m.ticket_copied_to_clipboard(),
        failure: m.common_copy_failed(),
      }),
    onedit: (followUpId, content, noteTypeId) =>
      noteEdit.open(followUpId, content, noteTypeId),
    ondelete: (followUpId) => deleteConfirm.openConfirm(followUpId),
  });

  // --- Overlay helpers ---

  function openPanel(): void {
    panelOpen = true;
  }
  function closePanel(): void {
    panelOpen = false;
  }

  function handleNoteTap(noteId: string): void {
    closePanel();
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
</script>

{#snippet navLeft()}
  <Link iconOnly onclick={onback} role="button" aria-label={m.common_back()}>
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
    ondeepsearch={hasMoreMessages && deepSearch.phase === "idle"
      ? () => void deepSearch.trigger()
      : undefined}
    deepSearchStatus={deepSearch.phase}
    deepSearchSearched={displayFollowUpsForSearch?.length ?? 0}
    deepSearchTotal={displayFollowUpsForSearch?.length ?? 0}
  />
{/snippet}

{#snippet ticketSubnavbar()}
  <SubNavbarFilterLayout
    title={decryptedTitle}
    smallTitle
    hideTitle
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
  <CaseHeader {ticketId} />
  <TicketDetail
    {ticketId}
    knownFollowUpCount={cachedFollowUpCount}
    bind:draftText
    {cursorPosition}
    onmentionselect={handleMentionSelect}
    onlightbox={(url: string) => lightbox.show(url)}
    oncontextmenu={(e: ContextMenuEvent) => contextMenu.show(e)}
    onopenedit={(
      followUpId: string,
      content: string,
      noteTypeId: string | null,
    ) => noteEdit.open(followUpId, content, noteTypeId)}
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

<TicketDetailOverlays
  {ticketId}
  {clientAlias}
  {panelOpen}
  {assignSheetOpen}
  {callSheetOpen}
  {composeActionsOpen}
  {composeActionsAnchor}
  {smsSheetOpen}
  {hasVerifiedPhone}
  {smsSending}
  currentAssigneeId={ticket?.assignedTo ?? null}
  {deleteConfirm}
  {noteEdit}
  {exposureHint}
  {lightbox}
  {contextMenu}
  {closeFlow}
  onpaneldismiss={closePanel}
  onpanelaction={(action: TicketAction) => panelActions.dispatch(action)}
  onnotetap={handleNoteTap}
  onpanellightbox={handlePanelLightbox}
  onassigndismiss={() => {
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
  oncallaction={handleCallAction}
  oncalldismiss={closeCallSheet}
  oncomposedismiss={closeComposeActions}
  ontextclient={handleOpenSmsCompose}
  onsmsdismiss={() => {
    smsSheetOpen = false;
  }}
  onsmssend={handleSmsSend}
  ondraftset={(body: string) => {
    draftText = body;
  }}
/>

<style>
  .ticket-detail-page {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
