<!--
  Secure Link portal page.

  This page is session-free. It imports neither CryptoBridge nor any
  session composable, and it touches no browser storage.
  All key material lives in composable-scope state, zeroed on quick exit
  and pagehide. The fragment never reaches any server (RFC 3986).

  Five orchestration states (in order):
    1. No/bad fragment: static explanation, no server call
    2. Bootstrap: TanStack Query with dead-link state on generic error
    3. Passphrase gate: when hasPassphrase, derive with Argon2id
    4. Thread: decrypted messages via Konsta Messages/Message
    5. Composer: ShellMessagebar via PortalComposer

  Quick exit and the drawer belong to the (client) layout. This page
  publishes its session-zeroing callback, safe URL, and drawer entries
  through the client shell context.
-->
<script lang="ts">
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { afterNavigate, goto, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Block, BlockTitle, Card } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { SvelteSet } from "svelte/reactivity";
  import { trpc } from "$lib/trpc/index.js";
  import { portalKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { decode, encode } from "@care-y/crypto";
  import { newFollowupId, newKeyGeneration } from "@care-y/shared";
  import { encryptReply } from "$lib/portal/portal-crypto.js";
  import PortalHint from "$lib/components/portal/PortalHint.svelte";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import PageLayout from "$lib/shell/PageLayout.svelte";
  import { KeyRound } from "@lucide/svelte";
  import {
    getClientShellCtx,
    DEFAULT_SAFE_URL,
    type ClientDrawerAction,
  } from "$lib/client-shell/context.js";
  import PortalPassphraseGate from "$lib/portal/PortalPassphraseGate.svelte";
  import PortalThread from "$lib/portal/PortalThread.svelte";
  import { portalMessageElementId } from "$lib/portal/portal-message-ids.js";
  import { createSearchOverlay } from "$lib/search/search-overlay.svelte.js";
  import SearchNavigator from "$lib/components/search/SearchNavigator.svelte";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import PortalComposer from "$lib/portal/PortalComposer.svelte";
  import { createChatPaginator } from "$lib/tickets/chat-paginator.svelte.js";
  import { createScrollManager } from "$lib/tickets/scroll-manager.svelte.js";
  import AccountCreateForm from "$lib/portal/AccountCreateForm.svelte";
  import { X } from "@lucide/svelte";
  import JumpToLatest from "$lib/components/tickets/JumpToLatest.svelte";
  import { createPortalFragment } from "$lib/composables/portal/create-portal-fragment.svelte.js";
  import { createPortalSessionState } from "$lib/composables/portal/create-portal-session.svelte.js";
  // care-y-ignore-next-line route-no-db-import -- client composable, no database access; validator heuristic misreads the module
  import { createPortalUpgrade } from "$lib/composables/portal/create-portal-upgrade.svelte.js";

  // Route param; the fragment-derived channel id is the crypto authority,
  // this one only keys the queries.
  const routeChannelId = $derived(page.params.channelId ?? "");

  // ---------------------------------------------------------------------------
  // Fragment parsing (state 1)
  // ---------------------------------------------------------------------------

  const fragment = createPortalFragment(
    browser,
    () => location.hash,
    () => routeChannelId,
  );

  // Wire afterNavigate to mark router readiness (replaceState throws
  // before router init; afterNavigate fires post-init on mount).
  afterNavigate(() => {
    fragment.markRouterReady();
  });

  // Strip the fragment from the address bar once both router and parse are ready.
  // strippablePath is a readiness gate; the template literal satisfies
  // SvelteKit's typed resolve() overload.
  $effect(() => {
    if (fragment.strippablePath === null) return;
    fragment.markStripped();
    replaceState(resolve(`/portal/${routeChannelId}`), {});
  });

  // ---------------------------------------------------------------------------
  // Session state (composable scope, zeroed on exit)
  // ---------------------------------------------------------------------------

  const portalSession = createPortalSessionState();

  let hintShown = $state(false);
  let hintDismissed = $state(false);

  // Anchored to what the procedure returns rather than mirrored by hand,
  // so a change to the wire shape is a compile error here.
  type ClientPortalRouter = NonNullable<typeof trpc.clientPortal>;
  type PortalMessageWire = Awaited<
    ReturnType<ClientPortalRouter["portalMessagePage"]["query"]>
  >["messages"][number];

  // Optimistic messages appended after send
  let optimisticMessages = $state<PortalMessageWire[]>([]);
  let sendError = $state("");
  let lastSentText = "";
  let composerRef = $state<PortalComposer | null>(null);

  // Safe URL: org-configured exit target from bootstrap, else the default
  const safeUrl = $derived.by((): string => {
    return bootstrapQuery.data?.safeExitUrl ?? DEFAULT_SAFE_URL;
  });

  // ---------------------------------------------------------------------------
  // Bootstrap query (state 2)
  // ---------------------------------------------------------------------------

  const bootstrapQuery = createQuery(() => ({
    queryKey: portalKeys.bootstrap(routeChannelId),
    queryFn: async () => {
      if (!trpc.clientPortal || !fragment.fragmentData) {
        throw new Error("Portal not available");
      }
      return trpc.clientPortal.portalBootstrap.query({
        channelId: fragment.fragmentData.channelId,
        auth: encode(fragment.fragmentData.auth),
      });
    },
    enabled: fragment.hasValidFragment,
    retry: false,
    staleTime: 5 * 60 * 1000,
  }));

  // Org public key query (for reply encryption)
  const orgKeyQuery = createQuery(() => ({
    queryKey: portalKeys.orgPublicKey(),
    queryFn: async (): Promise<Uint8Array | null> => {
      if (!trpc.branding) return null;
      const data = await trpc.branding.getPublicBranding.query();
      if (data.orgPublicKey === null) return null;
      return decode(data.orgPublicKey);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  }));

  const orgPublicKey = $derived(orgKeyQuery.data ?? null);

  // Org-set name shown above messages from the organization. Rides the
  // public branding blob so it is available before any account exists.
  const brandingQuery = createPublicBrandingQuery();
  const supportLabel = $derived(brandingQuery.data?.supportLabel ?? "");

  // Polling query for new messages (5-minute interval + focus refetch)
  const queryClient = useQueryClient();

  const PAGE_SIZE = 50;

  /** One page of the thread, newest-first from the server, oldest-first out. */
  async function fetchMessagePage(
    cursor?: string,
  ): Promise<{ messages: PortalMessageWire[]; totalCount: number }> {
    if (!trpc.clientPortal || !fragment.fragmentData) {
      throw new Error("Portal not available");
    }
    return trpc.clientPortal.portalMessagePage.query({
      channelId: fragment.fragmentData.channelId,
      auth: encode(fragment.fragmentData.auth),
      limit: PAGE_SIZE,
      direction: "older",
      ...(cursor === undefined ? {} : { cursor }),
    });
  }

  const messagesQuery = createQuery(() => ({
    queryKey: portalKeys.messages(routeChannelId),
    queryFn: async () => fetchMessagePage(),
    enabled: portalSession.keyCheckPassed,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  }));

  const scroll = createScrollManager();

  // PageLayout binds a plain state variable; the manager exposes its
  // container through a getter/setter pair, which bind: cannot target.
  let threadScrollEl = $state<HTMLDivElement | undefined>(undefined);
  $effect(() => {
    scroll.scrollContainerEl = threadScrollEl;
  });

  // The same paginator the volunteer thread runs on. It reads its cache key
  // and its end-of-history total from here rather than assuming a ticket.
  const paginator = createChatPaginator<PortalMessageWire>({
    pageSize: PAGE_SIZE,
    queryClient,
    getPageQueryKey: (cursor: string) =>
      portalKeys.messagePage(routeChannelId, cursor),
    fetchPage: async (cursor: string) =>
      (await fetchMessagePage(cursor)).messages,
    getScrollContainer: () => scroll.scrollContainerEl,
    getTotalCount: () => messagesQuery.data?.totalCount,
  });

  // Reaching the top pulls the previous page in. The paginator anchors
  // scroll position across the prepend, so the message being read stays
  // where it is instead of jumping.
  const LOAD_OLDER_PX = 200;

  $effect(() => {
    const el = scroll.scrollContainerEl;
    if (el == null) return;

    const handleScroll = (): void => {
      scroll.onScroll([], undefined);
      if (
        el.scrollTop < LOAD_OLDER_PX &&
        paginator.hasMore &&
        !paginator.loadingOlder
      ) {
        void paginator.loadOlderPage();
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  });

  $effect(() => scroll.cleanup);

  // Follow the conversation only when the reader is already at the bottom.
  $effect(() => {
    scroll.autoScrollOnNew(allMessages.length, false);
  });

  // --- In-thread search ---
  // The same overlay and navigator four org surfaces use, scoped to the one
  // thread a client has. Matches come from PortalThread, which is where the
  // decrypted text lives.

  let searchActive = $state(false);
  let matchIds = $state<readonly string[]>([]);

  const overlay = createSearchOverlay({
    matches: () => matchIds,
    getElementId: portalMessageElementId,
    scrollContainer: () => scroll.scrollContainerEl,
  });

  function openSearch(): void {
    searchActive = true;
    overlay.enter("");
  }

  function closeSearch(): void {
    overlay.exit();
    searchActive = false;
  }

  function jumpToLatest(): void {
    const el = scroll.scrollContainerEl;
    if (el == null) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  // Open on the newest message. The thread used to render every message at
  // once and start at the oldest; now that it opens on a page, starting at
  // the top would show the middle of a conversation with no way to tell.
  let didInitialScroll = false;

  $effect(() => {
    if (didInitialScroll || paginator.items.length === 0) return;
    const el = scroll.scrollContainerEl;
    if (el == null) return;
    didInitialScroll = true;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      scroll.markScrolledInitially();
    });
  });

  $effect(() => {
    const data = messagesQuery.data;
    if (!data) return;
    paginator.seed(data.messages);
    paginator.syncInitialPage(data.messages);
  });

  // Combined messages: paged server messages + optimistic appends
  const allMessages = $derived.by(() => [
    ...paginator.items,
    ...optimisticMessages,
  ]);

  // Dead-link detection: bootstrap error means revoked/unknown/bad auth
  const isDeadLink = $derived(bootstrapQuery.isError);

  // Bootstrap succeeded but needs passphrase
  const needsPassphrase = $derived(
    bootstrapQuery.data?.hasPassphrase === true &&
      !portalSession.keyCheckPassed,
  );

  // No-passphrase immediate derive
  $effect(() => {
    if (
      !browser ||
      !bootstrapQuery.data ||
      bootstrapQuery.data.hasPassphrase ||
      portalSession.keyCheckPassed ||
      !fragment.fragmentData
    ) {
      return;
    }

    portalSession.tryNoPassphraseDerive(
      fragment.fragmentData,
      bootstrapQuery.data.keyCheck,
    );
  });

  // ---------------------------------------------------------------------------
  // Passphrase gate (state 3)
  // ---------------------------------------------------------------------------

  function handlePassphraseSubmit(passphrase: string): void {
    const data = bootstrapQuery.data;
    const frag = fragment.fragmentData;
    if (!data || !frag) return;
    portalSession.submitPassphrase(passphrase, frag, data.keyCheck);
  }

  // ---------------------------------------------------------------------------
  // Reply mutation (state 5)
  // ---------------------------------------------------------------------------

  const replyMutation = createMutation(() => ({
    mutationFn: async (input: {
      channelId: string;
      auth: string;
      ticketId: string;
      followUpId: string;
      keyGeneration: string;
      encryptedContent: string;
      wrappedTkTemp: string;
      selfCopy: {
        ephemeralPoint: string;
        nonce: string;
        ciphertext: string;
      };
      kind?: "message" | "contact_correction";
    }) => {
      if (!trpc.clientPortal) throw new Error("Portal not available");
      return trpc.clientPortal.portalReply.mutate(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalKeys.messages(routeChannelId),
      });
      announceToLiveRegion("polite", m.portal_send());
    },
    onError: (_err, variables) => {
      optimisticMessages = optimisticMessages.filter(
        (msg) => msg.id !== variables.followUpId,
      );
      composerRef?.restoreDraft(lastSentText);
      sendError = m.portal_send_failed();
      announceToLiveRegion("polite", m.portal_send_failed());
    },
  }));

  function handleSend(
    text: string,
    kind?: "message" | "contact_correction",
  ): void {
    sendError = "";
    const sess = portalSession.session;
    const ticketId = bootstrapQuery.data?.ticketId;
    if (!sess || !orgPublicKey || ticketId == null || ticketId === "") {
      return;
    }
    lastSentText = text;

    const followUpId = newFollowupId();
    const keyGeneration = newKeyGeneration();

    const payload = encryptReply(
      text,
      orgPublicKey,
      sess.keypair.clientPublic,
      { ticketId, followUpId, keyGeneration },
    );

    optimisticMessages = [
      ...optimisticMessages,
      {
        id: followUpId,
        // The optimistic bubble stands in for a row the server has not
        // written yet, and the thread groups files by follow-up, so it
        // carries the same id the reply was minted with.
        followupId: followUpId,
        direction: "from_client",
        ephemeralPoint: payload.selfCopy.ephemeralPoint,
        nonce: payload.selfCopy.nonce,
        ciphertext: payload.selfCopy.ciphertext,
        createdAt: new Date().toISOString(),
        editedAt: null,
      },
    ];

    replyMutation.mutate({
      channelId: sess.channelId,
      auth: encode(sess.auth),
      ticketId,
      followUpId,
      keyGeneration,
      encryptedContent: payload.encryptedContent,
      wrappedTkTemp: payload.wrappedTkTemp,
      selfCopy: payload.selfCopy,
      kind: kind ?? undefined,
    });
  }

  // Clear optimistic messages when server data refreshes
  $effect(() => {
    if (messagesQuery.data) {
      optimisticMessages = [];
    }
  });

  // ---------------------------------------------------------------------------
  // Web chat hint (state 5, session-once)
  // ---------------------------------------------------------------------------

  function handleFirstFocus(): void {
    if (!hintDismissed) {
      hintShown = true;
    }
  }

  function dismissHint(): void {
    hintShown = false;
    hintDismissed = true;
  }

  // ---------------------------------------------------------------------------
  // Upgrade card (shows when bootstrap.accountOffer is true)
  // ---------------------------------------------------------------------------

  const upgrade = createPortalUpgrade();

  const showAccountOffer = $derived(
    bootstrapQuery.data?.accountOffer === true && !upgrade.success,
  );

  function handleUpgradeSubmit(username: string, password: string): void {
    const sess = portalSession.session;
    const frag = fragment.fragmentData;
    if (!sess || !frag) return;
    if (!trpc.clientPortal) return;

    upgrade.submit(
      username,
      password,
      sess,
      frag.channelId,
      frag.auth,
      messagesQuery.data?.messages ?? [],
      trpc.clientPortal,
      queryClient,
      portalKeys.messages(routeChannelId),
      m.account_stale_thread(),
      m.account_login_failed(),
    );
  }

  // ---------------------------------------------------------------------------
  // Client shell registration
  // ---------------------------------------------------------------------------

  // The layout owns quick exit and the drawer; this page owns the session.
  // Only the zeroing callback crosses the boundary, never key material.
  const shellContainer = getClientShellCtx();

  // True once the thread is showing. Chat shape only: the other states are
  // ordinary content that should scroll normally.
  const threadShowing = $derived(
    !upgrade.success &&
      portalSession.keyCheckPassed &&
      portalSession.session !== null,
  );

  // The in-thread card can be dismissed; the drawer entry cannot, which is
  // the point. Both drive the same upgrade composable.
  const drawerActions = $derived.by((): readonly ClientDrawerAction[] => {
    if (!showAccountOffer) return [];
    return [
      {
        id: "upgrade",
        label: m.account_upgrade_card_title(),
        icon: KeyRound,
        onclick: () => upgrade.expand(),
      },
    ];
  });

  // --- Attachments ---

  const portalAttachments = $derived(bootstrapQuery.data?.attachments ?? []);

  /** Channel auth encoded for request headers. */
  const channelAuthHeader = $derived.by((): string | undefined => {
    const frag = fragment.fragmentData;
    if (frag === null) return undefined;
    return encode(frag.auth);
  });

  // --- Filter pills (images / files) ---

  type AttachmentFilter = "images" | "files" | null;
  let activeFilter = $state<AttachmentFilter>(null);

  /** followupIds that carry at least one image attachment. */
  const imageFollowupIds = $derived.by((): ReadonlySet<string> => {
    const ids = new SvelteSet<string>();
    for (const att of portalAttachments) {
      if (att.contentType?.startsWith("image/") === true) {
        ids.add(att.followupId);
      }
    }
    return ids;
  });

  /** followupIds that carry at least one non-image attachment. */
  const fileFollowupIds = $derived.by((): ReadonlySet<string> => {
    const ids = new SvelteSet<string>();
    for (const att of portalAttachments) {
      if (att.contentType !== null && !att.contentType.startsWith("image/")) {
        ids.add(att.followupId);
      }
    }
    return ids;
  });

  /** Messages filtered by the active pill. Null filter shows all. */
  const filteredMessages = $derived.by(() => {
    if (activeFilter === null) return allMessages;
    const targetIds =
      activeFilter === "images" ? imageFollowupIds : fileFollowupIds;
    return allMessages.filter((msg) => targetIds.has(msg.followupId));
  });

  function handleFilterToggle(pillId: string): void {
    // The layout hands back the id of a pill this page defined, so anything
    // else is a wiring mistake rather than a filter nobody selected.
    const next: AttachmentFilter =
      pillId === "images" || pillId === "files" ? pillId : null;
    activeFilter = activeFilter === next ? null : next;
  }

  const filterPillDefs = $derived.by(() => {
    // Only show pills when there are attachments to filter
    if (portalAttachments.length === 0) return [];

    const pills: {
      id: string;
      label: string;
      mode: "multi" | "single" | "date";
      options: { value: string; label: string }[];
      selected: ReadonlySet<string> | string | null;
    }[] = [];

    if (imageFollowupIds.size > 0) {
      pills.push({
        id: "images",
        label: m.portal_filter_images(),
        mode: "single",
        options: [{ value: "images", label: m.portal_filter_images() }],
        selected: activeFilter === "images" ? "images" : null,
      });
    }

    if (fileFollowupIds.size > 0) {
      pills.push({
        id: "files",
        label: m.portal_filter_files(),
        mode: "single",
        options: [{ value: "files", label: m.portal_filter_files() }],
        selected: activeFilter === "files" ? "files" : null,
      });
    }

    return pills;
  });

  const filterActiveCount = $derived(activeFilter !== null ? 1 : 0);

  function clearFilters(): void {
    activeFilter = null;
  }

  const noop = (): void => undefined;

  $effect(() => {
    shellContainer.current = {
      ondestroy: () => portalSession.destroySession(),
      safeUrl,
      actions: drawerActions,
      lockScroll: threadShowing,
      ...(threadShowing ? { subnavbar: threadSubnavbar } : {}),
    };
    return () => {
      shellContainer.current = undefined;
    };
  });
</script>

<svelte:head>
  <title>{m.portal_title()}</title>
</svelte:head>

<!-- The shell owns the navbar, so the row lands there through the context
     rather than being rendered by this page. Same components, same slot,
     and the same position the org app puts them in. -->
{#snippet searchNavigatorRow()}
  <SearchNavigator
    term={overlay.term ?? ""}
    position={overlay.position}
    total={overlay.matchCount}
    onup={overlay.up}
    ondown={overlay.down}
    onexit={closeSearch}
    ontermchange={overlay.setTerm}
  />
{/snippet}

{#snippet threadSubnavbar()}
  <SubNavbarFilterLayout
    title={m.portal_title()}
    hideTitle
    filterPills={{
      pills: filterPillDefs,
      activeCount: filterActiveCount,
      ontoggle: handleFilterToggle,
      onselect: handleFilterToggle,
      ondatechange: noop,
      onclearall: clearFilters,
    }}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    onsearch={searchActive ? undefined : openSearch}
    searchLabel={m.portal_search_label()}
  />
{/snippet}

{#if !fragment.fragmentResolved}
  <!-- Sodium initializing with a fragment present; show the loading state -->
  <Block>
    <div class="portal-loading" role="status">
      <span
        class="portal-spinner"
        role="progressbar"
        aria-label={m.portal_unlocking()}
      ></span>
    </div>
  </Block>
{:else if !fragment.hasValidFragment}
  <!-- State 1: No/bad fragment -->
  <BlockTitle>{m.portal_incomplete_link()}</BlockTitle>
  <Block>
    <p class="portal-body-text">{m.portal_incomplete_link()}</p>
  </Block>
{:else if bootstrapQuery.isLoading}
  <!-- Loading bootstrap -->
  <Block>
    <div class="portal-loading" role="status">
      <span
        class="portal-spinner"
        role="progressbar"
        aria-label={m.portal_unlocking()}
      ></span>
    </div>
  </Block>
{:else if isDeadLink}
  <!-- State 2 error: Dead link -->
  <BlockTitle>{m.portal_dead_link()}</BlockTitle>
  <Block>
    <p class="portal-body-text">{m.portal_dead_link()}</p>
  </Block>
{:else if needsPassphrase}
  <!-- State 3: Passphrase gate -->
  <PortalPassphraseGate
    onsubmit={handlePassphraseSubmit}
    pending={portalSession.passphraseDerivePending}
    error={portalSession.passphraseError}
  />
{:else if upgrade.success}
  <!-- Upgrade success state -->
  <Block>
    <BlockTitle>{m.account_upgrade_success_title()}</BlockTitle>
    <p class="portal-body-text">{m.account_upgrade_success_body()}</p>
    <p class="portal-body-text upgrade-username">
      {m.account_login_username()}: {upgrade.username}
    </p>
    <button
      type="button"
      class="upgrade-go-link"
      data-testid="upgrade-go-to-login"
      onclick={() => void goto(resolve("/account"))}
    >
      {m.account_login_submit()}
    </button>
  </Block>
{:else if portalSession.keyCheckPassed && portalSession.session}
  <!-- State 4 + 5: Thread scrolls, composer pins to the bottom -->
  <PageLayout lockScroll bind:scrollEl={threadScrollEl}>
    {#snippet bottomBar()}
      <JumpToLatest
        visible={!scroll.isNearBottom && allMessages.length > 0}
        onclick={jumpToLatest}
      />
      <PortalComposer
        bind:this={composerRef}
        onsend={handleSend}
        pending={replyMutation.isPending}
        onfirstfocus={handleFirstFocus}
        errorMessage={sendError || undefined}
        draftKey={routeChannelId}
      />
    {/snippet}

    <!-- Upgrade offer card (above thread when offered, dismissible).
         Dismissing it does not remove the offer: the drawer keeps a
         permanent entry to the same flow. -->
    {#if showAccountOffer && !upgrade.dismissed}
      {#if !upgrade.expanded}
        <Card data-testid="upgrade-card" class="upgrade-card">
          <div class="upgrade-card-header">
            <p class="upgrade-card-title">{m.account_upgrade_card_title()}</p>
            <button
              type="button"
              class="upgrade-card-dismiss"
              aria-label={m.account_upgrade_card_dismiss()}
              onclick={() => upgrade.dismiss()}
              data-testid="upgrade-card-dismiss"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <p class="upgrade-card-body">{m.account_upgrade_card_body()}</p>
          <button
            type="button"
            class="upgrade-card-action"
            onclick={() => upgrade.expand()}
            data-testid="upgrade-card-setup"
          >
            {m.account_upgrade_setup()}
          </button>
        </Card>
      {:else}
        <AccountCreateForm
          onsubmit={handleUpgradeSubmit}
          pending={upgrade.pending}
          errorMessage={upgrade.error || undefined}
          showLinkNote={true}
          submitLabel={m.account_upgrade_setup()}
        />
      {/if}
    {/if}

    <PortalThread
      messages={filteredMessages}
      clientPrivate={portalSession.session.keypair.clientPrivate}
      loading={messagesQuery.isLoading}
      attachments={portalAttachments}
      channelId={fragment.fragmentData?.channelId}
      channelAuth={channelAuthHeader}
      ticketId={bootstrapQuery.data?.ticketId ?? undefined}
      {supportLabel}
      searchTerm={overlay.term ?? undefined}
      activeMatchId={overlay.activeId ?? undefined}
      onmatches={(ids: readonly string[]) => {
        matchIds = ids;
      }}
    />
  </PageLayout>

  <PortalHint
    opened={hintShown}
    ondismiss={dismissHint}
    message={m.portal_web_chat_hint()}
    dismissLabel={m.portal_hint_dismiss()}
    dismissTestid="web-chat-hint-dismiss"
  />
{/if}

<style>
  .portal-body-text {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.6;
  }

  .portal-loading {
    display: flex;
    justify-content: center;
    padding: var(--space-xl);
  }

  .portal-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid var(--muted);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .portal-spinner {
      animation: none;
      opacity: 0.5;
    }
  }

  .upgrade-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .upgrade-card-title {
    font-weight: 600;
    font-size: var(--text-base);
    color: var(--ink);
    margin: 0;
  }

  .upgrade-card-dismiss {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }

  .upgrade-card-body {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin: var(--space-xs) 0 0;
  }

  .upgrade-card-action {
    display: inline-block;
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--brand-fill);
    color: var(--brand-on);
    border: none;
    border-radius: 8px;
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }

  .upgrade-card-action:active {
    opacity: 0.7;
  }

  .upgrade-username {
    font-weight: 600;
    color: var(--ink);
  }

  .upgrade-go-link {
    display: inline-block;
    margin-top: var(--space-md);
    color: var(--brand-text);
    font-weight: 600;
    font-family: inherit;
    font-size: inherit;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;
  }

  .upgrade-go-link:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }
</style>
