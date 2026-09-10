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
  import { Block, BlockTitle } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { portalKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { decode, encode } from "@care-y/crypto";
  import {
    newFollowupId,
    newKeyGeneration,
    serializeContactCorrection,
    type ContactCorrectionPayload,
  } from "@care-y/shared";
  import { solveProofOfWork } from "$lib/auth/pow-solver.js";
  import { requireRouter } from "$lib/errors.js";
  import type { ChannelEvaluateCallback } from "$lib/composables/portal/create-portal-session.svelte.js";
  import PortalHint from "$lib/shell/PortalHint.svelte";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import PageLayout from "$lib/shell/PageLayout.svelte";
  import { KeyRound, UserPen, ShieldCheck, IdCard } from "@lucide/svelte";
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
  import ContactCorrectionSheet from "$lib/portal/ContactCorrectionSheet.svelte";
  import ContactInfoCard from "$lib/portal/ContactInfoCard.svelte";
  // care-y-ignore-next-line route-no-db-import -- UI component, no database access; validator heuristic false positive
  import UpgradeChooser from "$lib/portal/UpgradeChooser.svelte";
  import AddPassphraseForm from "$lib/portal/AddPassphraseForm.svelte";
  import AccountCreateForm from "$lib/portal/AccountCreateForm.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import { buildAddPassphrasePayload } from "$lib/portal/add-passphrase-crypto.js";
  import { createChatPaginator } from "$lib/tickets/chat-paginator.svelte.js";
  import { createScrollManager } from "$lib/tickets/scroll-manager.svelte.js";

  import LinkErrorState from "$lib/portal/LinkErrorState.svelte";
  import { readRateLimitError } from "$lib/portal/rate-limit-error.js";
  import JumpToLatest from "$lib/components/tickets/JumpToLatest.svelte";
  import { createPortalFragment } from "$lib/composables/portal/create-portal-fragment.svelte.js";
  import { createPortalSessionState } from "$lib/composables/portal/create-portal-session.svelte.js";
  import { getPortalBridgeFactory } from "$lib/portal/context.js";
  // care-y-ignore-next-line route-no-db-import -- client composable, no database access; validator heuristic misreads the module
  import { createPortalUpgrade } from "$lib/composables/portal/create-portal-upgrade.svelte.js";
  import { createPortalFilters } from "$lib/composables/portal/create-portal-filters.svelte.js";
  import { uiLocaleStore } from "$lib/stores/ui-locale.svelte.js";
  import { useThreadChrome } from "$lib/shell/use-thread-chrome.svelte.js";

  /** Shape-probe for a PORTAL_CHANNEL_DISABLED tRPC error. */
  function isPortalChannelDisabledError(err: unknown): boolean {
    if (typeof err !== "object" || err === null) return false;
    // tRPC client errors carry the app error code in message (via
    // the server's errorFormatter). Check both message and data.code.
    if ("message" in err && err.message === "PORTAL_CHANNEL_DISABLED") {
      return true;
    }
    if (
      "data" in err &&
      typeof err.data === "object" &&
      err.data !== null &&
      "code" in err.data &&
      err.data.code === "PORTAL_CHANNEL_DISABLED"
    ) {
      return true;
    }
    return false;
  }

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

  const portalSession = createPortalSessionState(getPortalBridgeFactory());

  /** Channel OPRF evaluate wired to the clientPortal tRPC mutation. */
  const channelEvaluate: ChannelEvaluateCallback = async (
    chanId: string,
    blindedB64: string,
    chanAuth?: string,
  ): Promise<{ evaluated: string }> => {
    const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
    return portalRouter.evaluateChannelOprf.mutate({
      channelId: chanId,
      blindedElement: blindedB64,
      ...(chanAuth !== undefined ? { auth: chanAuth } : {}),
    });
  };

  /**
   * Evaluate with PoW retry for the passphrase-derive OPRF round.
   * Same pattern as evaluateChannelWithPowRetry in the session composable.
   */
  async function evaluatePassphraseWithPowRetry(
    channelId: string,
    blindedElementB64: string,
    auth: string | undefined,
    evaluate: ChannelEvaluateCallback,
    onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
  ): Promise<string> {
    try {
      const result = await evaluate(channelId, blindedElementB64, auth);
      return result.evaluated;
    } catch (err: unknown) {
      if (
        typeof err !== "object" ||
        err === null ||
        !("data" in err) ||
        typeof err.data !== "object" ||
        err.data === null ||
        !("code" in err.data) ||
        err.data.code !== "POW_REQUIRED" ||
        !("challenge" in err.data) ||
        typeof err.data.challenge !== "string" ||
        !("difficulty" in err.data) ||
        typeof err.data.difficulty !== "number"
      ) {
        throw err;
      }
      await onPowRequired(err.data.challenge, err.data.difficulty);
      const result = await evaluate(channelId, blindedElementB64, auth);
      return result.evaluated;
    }
  }

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
  let correctionSheetOpen = $state(false);

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

  const threadChrome = useThreadChrome({
    get scrollEl() {
      return scroll.scrollContainerEl;
    },
    get ready() {
      return threadScrollReady;
    },
    get pinned() {
      return searchActive;
    },
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
  let threadScrollReady = $state(false);

  $effect(() => {
    if (didInitialScroll || paginator.items.length === 0) return;
    const el = scroll.scrollContainerEl;
    if (el == null) return;
    didInitialScroll = true;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      scroll.markScrolledInitially();
      threadScrollReady = true;
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

  // Rate limits get their own states: "Expired link" for a transient 429
  // could make a client discard a working link.
  const bootstrapRateLimit = $derived(
    bootstrapQuery.isError ? readRateLimitError(bootstrapQuery.error) : null,
  );

  // Dead-link detection: any other bootstrap error means revoked/unknown/bad auth
  const isDeadLink = $derived(
    bootstrapQuery.isError && bootstrapRateLimit === null,
  );

  const messagesRateLimit = $derived(
    messagesQuery.isError ? readRateLimitError(messagesQuery.error) : null,
  );

  // What the thread shows in place of the empty state when the query failed
  const messagesLoadError = $derived.by(
    (): "rate_limited" | "generic" | null => {
      if (!messagesQuery.isError) return null;
      return messagesRateLimit !== null ? "rate_limited" : "generic";
    },
  );

  // Auto-retry on the server's hint. Without a hint, 60s is a guess that
  // errs short: a failed retry just re-arms this timer with a fresh hint.
  const RETRY_FALLBACK_SECONDS = 60;

  $effect(() => {
    if (bootstrapRateLimit === null) return;
    const seconds =
      bootstrapRateLimit.retryAfterSeconds ?? RETRY_FALLBACK_SECONDS;
    const timer = setTimeout(() => {
      void bootstrapQuery.refetch();
    }, seconds * 1000);
    return () => clearTimeout(timer);
  });

  // Rate-limited message fetches retry on the hint too; other errors are
  // covered by the 5-minute refetch interval and the focus refetch.
  $effect(() => {
    if (messagesRateLimit === null) return;
    const seconds =
      messagesRateLimit.retryAfterSeconds ?? RETRY_FALLBACK_SECONDS;
    const timer = setTimeout(() => {
      void messagesQuery.refetch();
    }, seconds * 1000);
    return () => clearTimeout(timer);
  });

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

    void portalSession.tryNoPassphraseDerive(
      fragment.fragmentData,
      bootstrapQuery.data.keyCheck,
      channelEvaluate,
      solveProofOfWork,
    );
  });

  // ---------------------------------------------------------------------------
  // Passphrase gate (state 3)
  // ---------------------------------------------------------------------------

  function handlePassphraseSubmit(passphrase: string): void {
    const data = bootstrapQuery.data;
    const frag = fragment.fragmentData;
    if (!data || !frag) return;
    void portalSession.submitPassphrase(
      passphrase,
      frag,
      data.keyCheck,
      channelEvaluate,
      solveProofOfWork,
    );
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
      // Bootstrap is deliberately NOT invalidated here. Its message set
      // goes stale, but only the add-password re-seal depends on that
      // being current, and it refetches for itself. Invalidating on every
      // send would double portal reads against the read limiter for
      // clients on constrained connections.
      announceToLiveRegion("polite", m.portal_send());
    },
    onError: (err, variables) => {
      optimisticMessages = optimisticMessages.filter(
        (msg) => msg.id !== variables.followUpId,
      );
      composerRef?.restoreDraft(lastSentText);
      if (isPortalChannelDisabledError(err)) {
        sendError = m.portal_messaging_disabled();
      } else if (readRateLimitError(err) !== null) {
        sendError = m.portal_send_rate_limited();
      } else {
        sendError = m.portal_send_failed();
      }
      announceToLiveRegion("polite", sendError);
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

    void sess
      .encryptReply(
        text,
        encode(orgPublicKey),
        ticketId,
        followUpId,
        keyGeneration,
      )
      .then((payload) => {
        optimisticMessages = [
          ...optimisticMessages,
          {
            id: followUpId,
            // The optimistic bubble stands in for a row the server has not
            // written yet, and the thread groups files by follow-up, so it
            // carries the same id the reply was minted with.
            followupId: followUpId,
            // Matches what the server will write for this reply, so the
            // optimistic bubble renders the same as the row that replaces it.
            type: "message",
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
      })
      .catch(() => {
        composerRef?.restoreDraft(lastSentText);
        sendError = m.portal_send_failed();
        announceToLiveRegion("polite", m.portal_send_failed());
      });
  }

  function handleCorrectionSubmit(payload: ContactCorrectionPayload): void {
    handleSend(serializeContactCorrection(payload), "contact_correction");
    correctionSheetOpen = false;
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

  // Show on thread entry (when the session is ready and thread renders),
  // once per SPA session. The previous implementation only triggered on
  // first composer input, which meant the hint never appeared if the user
  // did not type. The spec calls for thread-entry appearance.
  $effect(() => {
    if (!threadShowing || hintDismissed) return;
    hintShown = true;
  });

  function dismissHint(): void {
    hintShown = false;
    hintDismissed = true;
  }

  // ---------------------------------------------------------------------------
  // Upgrade (drawer-driven; the in-chat card was removed with account_offer)
  // ---------------------------------------------------------------------------

  const upgrade = createPortalUpgrade();

  const upgradeOptions = $derived(bootstrapQuery.data?.upgradeOptions ?? []);

  // ---------------------------------------------------------------------------
  // Contact info + upgrade chooser sheets (drawer-driven)
  // ---------------------------------------------------------------------------

  let contactCardOpen = $state(false);
  let upgradeChooserOpen = $state(false);
  let passphraseFormOpen = $state(false);
  let passphrasePending = $state(false);
  let passphraseError = $state("");
  let passphraseSuccess = $state(false);

  /**
   * Fetch the sealed contact envelope from the server. Called on card open.
   * The query fires only when the card opens, never eagerly.
   */
  async function fetchSealedContact(): Promise<string> {
    if (!trpc.clientPortal || !fragment.fragmentData) {
      throw new Error("Portal not available");
    }
    const result = await trpc.clientPortal.contactInfo.query({
      channelId: fragment.fragmentData.channelId,
      auth: encode(fragment.fragmentData.auth),
    });
    return result.sealed;
  }

  /**
   * Open a sealed contact envelope using the session's channel private key.
   * The envelope is ephemeralPoint(32) | nonce(24) | ciphertext(N) as a
   * single base64url string. Split it, re-encode each part, and decrypt
   * through the session bridge.
   */
  async function openContactEnvelope(
    sealed: string,
  ): Promise<{ phone?: string; email?: string }> {
    const sess = portalSession.session;
    if (!sess) throw new Error("No session");
    const raw = decode(sealed);
    // Split: ephemeralPoint = bytes 0..31, nonce = 32..55, ciphertext = 56+
    const ep = encode(raw.subarray(0, 32));
    const nonce = encode(raw.subarray(32, 56));
    const ct = encode(raw.subarray(56));
    const json = await sess.decryptMessage(ep, nonce, ct);
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    const result: { phone?: string; email?: string } = {};
    if ("phone" in parsed && typeof parsed.phone === "string") {
      result.phone = parsed.phone;
    }
    if ("email" in parsed && typeof parsed.email === "string") {
      result.email = parsed.email;
    }
    return result;
  }

  /**
   * Handle upgrade chooser selection. "account" opens the AccountCreateForm
   * sheet via the createPortalUpgrade flow; "passphrase" opens the
   * AddPassphraseForm sheet.
   */
  function handleUpgradeChoice(path: "passphrase" | "account"): void {
    upgradeChooserOpen = false;
    if (path === "account") {
      upgrade.expand();
    }
    if (path === "passphrase") {
      passphraseFormOpen = true;
    }
  }

  /**
   * Handle account-creation form submission: build the registration
   * payload, re-encrypt the thread to the new account key, and submit.
   * On success the session is destroyed (the channel is revoked
   * server-side) and the success state replaces the thread.
   */
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
      m.account_username_taken(),
    );
  }

  /**
   * Handle passphrase form submission: derive the new keypair in the
   * Worker (seed stays Worker-held), re-seal messages on the main thread,
   * and call addPassphrase on the server. On success, refresh bootstrap
   * so upgradeOptions recomputes.
   *
   * The two-phase Worker ops (channelPassphraseDerive, evaluate,
   * channelPassphraseFinish) mirror the session-start path in
   * create-portal-session.svelte.ts. The Worker derives the keypair and
   * zeroes the private key internally; only the public key crosses back.
   */
  function handlePassphraseFormSubmit(passphrase: string): void {
    if (passphrasePending) return;
    passphrasePending = true;
    passphraseError = "";

    void (async () => {
      try {
        const frag = fragment.fragmentData;
        const sess = portalSession.session;
        if (!frag || !sess || !trpc.clientPortal) {
          throw new Error("Portal session not available");
        }

        // Worker blinds seed+passphrase, returns blindedElement
        const deriveResult = await sess.channelPassphraseDerive(passphrase);

        // Evaluate via tRPC (main thread), with PoW retry
        const evaluated = await evaluatePassphraseWithPowRetry(
          deriveResult.channelId,
          deriveResult.blindedElement,
          deriveResult.auth,
          channelEvaluate,
          solveProofOfWork,
        );

        // Worker finalizes OPRF, returns only the new public key
        const finishResult = await sess.channelPassphraseFinish(evaluated);

        // Main-thread steps: seal key check and re-seal messages.
        // Refetch rather than reading the cached bootstrap: the server
        // compares the re-sealed count against portal_messages inside
        // the transaction, and the cached snapshot (5 min staleTime) can
        // predate the client's own last message. Submitting it fails the
        // guard and reports "new messages arrived" when none did.
        const refreshed = await bootstrapQuery.refetch();
        const portalMessages = refreshed.data?.messages;
        // A failed refetch keeps the previous data, so checking for
        // undefined alone would fall back to the stale snapshot this
        // refetch exists to avoid.
        if (refreshed.isError || portalMessages === undefined) {
          throw new Error("Portal bootstrap unavailable");
        }

        const payload = await buildAddPassphrasePayload(
          finishResult.clientPublic,
          portalMessages,
          sess,
        );

        await trpc.clientPortal.addPassphrase.mutate({
          channelId: frag.channelId,
          auth: encode(frag.auth),
          clientPublic: payload.clientPublic,
          keyCheck: payload.keyCheck,
          // Zod-derived input types are mutable; the payload is readonly,
          // so this copies rather than casting the readonly away.
          resealedMessages: [...payload.resealedMessages],
        });

        passphraseSuccess = true;

        // Refresh bootstrap so upgradeOptions recomputes and the drawer
        // no longer shows the add-passphrase entry.
        void queryClient.invalidateQueries({
          queryKey: portalKeys.bootstrap(routeChannelId),
        });
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "message" in err) {
          const message = typeof err.message === "string" ? err.message : "";
          if (message === "PORTAL_PASSPHRASE_ALREADY_SET") {
            passphraseError = m.portal_passphrase_error_already_set();
          } else if (message === "PORTAL_PASSPHRASE_COUNT_MISMATCH") {
            passphraseError = m.portal_passphrase_error_stale();
            void queryClient.invalidateQueries({
              queryKey: portalKeys.bootstrap(routeChannelId),
            });
          } else {
            passphraseError = m.portal_passphrase_error_generic();
          }
        } else {
          passphraseError = m.portal_passphrase_error_generic();
        }
      } finally {
        passphrasePending = false;
      }
    })();
  }

  // ---------------------------------------------------------------------------
  // Locale-reactive title (the read establishes a $derived dependency)
  // ---------------------------------------------------------------------------

  const pageTitle = $derived.by((): string => {
    void uiLocaleStore.locale;
    return m.portal_title();
  });

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

  // The drawer entries are tier-driven:
  //   bare link: upgrade chooser (both paths) + correction
  //   passphrase link: contact card + direct account upgrade + correction
  //   account: handled by the account page, not here
  // Contact correction lives here rather than under the composer: nothing
  // renders below the reply bar on a thread page, so the drawer is the
  // entry point and the indicator's cancel button is the way back out.
  const drawerActions = $derived.by((): readonly ClientDrawerAction[] => {
    // Reading the locale establishes a dependency so labels recompute on switch
    void uiLocaleStore.locale;
    const actions: ClientDrawerAction[] = [];

    const hasBothUpgrades =
      upgradeOptions.includes("passphrase") &&
      upgradeOptions.includes("account");
    const hasAccountOnly =
      !upgradeOptions.includes("passphrase") &&
      upgradeOptions.includes("account");

    // Bare link: chooser with both paths
    if (hasBothUpgrades) {
      actions.push({
        id: "upgrade",
        label: m.portal_upgrade_title(),
        icon: ShieldCheck,
        onclick: () => {
          upgradeChooserOpen = true;
        },
      });
    }

    // Passphrase link: contact card + direct account upgrade
    if (hasAccountOnly) {
      actions.push({
        id: "contact-info",
        label: m.portal_contact_title(),
        icon: IdCard,
        onclick: () => {
          contactCardOpen = true;
        },
      });
      actions.push({
        id: "upgrade",
        label: m.portal_upgrade_create_account(),
        icon: KeyRound,
        onclick: () => upgrade.expand(),
      });
    }

    if (threadShowing) {
      actions.push({
        id: "correct-contact",
        label: m.portal_correction_mode_button(),
        icon: UserPen,
        onclick: () => {
          correctionSheetOpen = true;
        },
      });
    }
    return actions;
  });

  // --- Attachments, recordings, and call entries ---

  const portalAttachments = $derived(bootstrapQuery.data?.attachments ?? []);
  const portalRecordings = $derived(bootstrapQuery.data?.recordings ?? []);
  const portalCallEntries = $derived(bootstrapQuery.data?.callEntries ?? []);

  /** Channel auth encoded for request headers. */
  const channelAuthHeader = $derived.by((): string | undefined => {
    const frag = fragment.fragmentData;
    if (frag === null) return undefined;
    return encode(frag.auth);
  });

  // --- Filter composable (Type / Author / Date) ---

  // A getter rather than a plain object: this script scope survives the
  // locale {#key} teardown below, so labels captured once would keep the
  // first locale forever. The locale read inside makes the composable's
  // deriveds recompute on switch.
  const portalFilters = createPortalFilters({
    get labels() {
      void uiLocaleStore.locale;
      return {
        filterType: m.ticket_filter_type(),
        filterAuthor: m.ticket_filter_author(),
        filterDate: m.ticket_filter_date(),
        typeMessages: m.ticket_filter_type_messages(),
        typeImages: m.ticket_filter_type_images(),
        typeFiles: m.ticket_filter_type_files(),
        authorYou: m.portal_you(),
        authorSupport: m.portal_support_team(),
      };
    },
  });

  $effect(() => {
    shellContainer.current = {
      ondestroy: () => portalSession.destroySession(),
      safeUrl,
      actions: drawerActions,
      lockScroll: threadShowing,
      ...(threadShowing
        ? {
            subnavbar: threadSubnavbar,
            subnavbarHidden: () => threadChrome.subnavbarHidden,
          }
        : {}),
    };
    return () => {
      shellContainer.current = undefined;
    };
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<!-- The shell owns the navbar, so the row lands there through the context
     rather than being rendered by this page. Same components, same slot,
     and the same position the org app puts them in. Both snippets stay
     outside the locale key block: the script's shell-context effect
     references threadSubnavbar, and a snippet declared inside a block is
     scoped to it. Locale re-render still reaches them because the shell
     keys the navbar that renders the subnavbar. -->
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

{#snippet portalStats()}
  <!-- A failed fetch with nothing loaded must not read as "0 messages" -->
  {#if messagesLoadError === null || allMessages.length > 0}
    <span>
      {allMessages.length === 1
        ? m.ticket_detail_one_message_stat()
        : m.ticket_detail_messages_stat({
            count: String(allMessages.length),
          })}
    </span>
  {/if}
{/snippet}

{#snippet threadSubnavbar()}
  <SubNavbarFilterLayout
    title={m.portal_title()}
    hideTitle
    stats={portalStats}
    filterPills={portalFilters.pills}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    onsearch={searchActive ? undefined : openSearch}
    searchLabel={m.portal_search_label()}
  />
{/snippet}

{#key uiLocaleStore.locale}
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
    <LinkErrorState
      title={m.portal_incomplete_link_title()}
      body={m.portal_incomplete_link()}
    />
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
  {:else if bootstrapRateLimit !== null}
    <!-- State 2 rate limit: transient, the link still works. Auto-retries
         on the server hint (effect above); never worded as expiry. -->
    <LinkErrorState
      title={m.portal_rate_limited_title()}
      body={m.portal_rate_limited_body()}
      testId="portal-rate-limited"
    />
  {:else if isDeadLink}
    <!-- State 2 error: Dead link -->
    <LinkErrorState
      title={m.portal_dead_link_title()}
      body={m.portal_dead_link()}
    />
  {:else if needsPassphrase}
    <!-- State 3: Passphrase gate -->
    <PortalPassphraseGate
      onsubmit={handlePassphraseSubmit}
      pending={portalSession.passphraseDerivePending}
      error={portalSession.passphraseError}
    />
  {:else if upgrade.success}
    <!-- Upgrade success state, centred to match sibling portal steps -->
    <div class="upgrade-success-wrapper">
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
    </div>
  {:else if portalSession.keyCheckPassed && portalSession.session}
    {@const activeSession = portalSession.session}
    <!-- State 4 + 5: Thread scrolls, composer pins to the bottom -->
    <PageLayout
      lockScroll
      overlayBottomBar
      underChrome
      bind:scrollEl={threadScrollEl}
    >
      {#snippet bottomBar()}
        <JumpToLatest
          visible={!scroll.isNearBottom && allMessages.length > 0}
          onclick={jumpToLatest}
        />
        <PortalComposer
          bind:this={composerRef}
          onsend={handleSend}
          pending={replyMutation.isPending}
          errorMessage={sendError || undefined}
          draftKey={routeChannelId}
          messagingDisabled={bootstrapQuery.data?.portalMessagingEnabled ===
            false}
        />
      {/snippet}

      <PortalThread
        messages={allMessages}
        decryptMessage={async (ep: string, n: string, ct: string) =>
          activeSession.decryptMessage(ep, n, ct)}
        decryptAttachmentKey={async (ep: string, n: string, ct: string) =>
          activeSession.decryptAttachmentKey(ep, n, ct)}
        decryptAttachmentBlob={async (
          ct: ArrayBuffer,
          fk: string,
          tid: string,
          aid: string,
        ) => activeSession.decryptAttachmentBlob(ct, fk, tid, aid)}
        loading={messagesQuery.isLoading}
        loadError={messagesLoadError}
        attachments={portalAttachments}
        recordings={portalRecordings}
        callEntries={portalCallEntries}
        channelId={fragment.fragmentData?.channelId}
        channelAuth={channelAuthHeader}
        ticketId={bootstrapQuery.data?.ticketId ?? undefined}
        {supportLabel}
        searchTerm={overlay.term ?? undefined}
        activeMatchId={overlay.activeId ?? undefined}
        onmatches={(ids: readonly string[]) => {
          matchIds = ids;
        }}
        filterTypes={portalFilters.filterTypesArr}
        filterAuthors={portalFilters.filterAuthorsArr}
        filterDateFrom={portalFilters.filterDateFrom}
        filterDateTo={portalFilters.filterDateTo}
        onclearfilters={() => portalFilters.clearAll()}
      />
    </PageLayout>

    <PortalHint
      opened={hintShown}
      ondismiss={dismissHint}
      message={m.portal_web_chat_hint()}
    />

    <ContactCorrectionSheet
      opened={correctionSheetOpen}
      ondismiss={() => (correctionSheetOpen = false)}
      pending={replyMutation.isPending}
      onsubmit={handleCorrectionSubmit}
    />

    <ContactInfoCard
      open={contactCardOpen}
      onclose={() => {
        contactCardOpen = false;
      }}
      fetchSealed={fetchSealedContact}
      openEnvelope={openContactEnvelope}
      orgName={supportLabel}
    />

    <UpgradeChooser
      open={upgradeChooserOpen}
      onclose={() => {
        upgradeChooserOpen = false;
      }}
      options={upgradeOptions}
      onchoose={handleUpgradeChoice}
      accountUrl={resolve("/account")}
    />

    <AddPassphraseForm
      open={passphraseFormOpen}
      onclose={() => {
        if (!passphrasePending) {
          passphraseFormOpen = false;
          if (passphraseSuccess) {
            passphraseSuccess = false;
            passphraseError = "";
          }
        }
      }}
      pending={passphrasePending}
      error={passphraseError}
      success={passphraseSuccess}
      onsubmit={handlePassphraseFormSubmit}
    />

    <ShellSheet
      opened={upgrade.expanded}
      ondismiss={() => {
        if (!upgrade.pending) upgrade.collapse();
      }}
      title={m.portal_upgrade_create_account()}
    >
      <AccountCreateForm
        onsubmit={handleUpgradeSubmit}
        pending={upgrade.pending}
        errorMessage={upgrade.error || undefined}
        showLinkNote={true}
        submitLabel={m.account_upgrade_setup()}
      />
    </ShellSheet>
  {/if}
{/key}

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

  .upgrade-success-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: var(--space-lg);
    text-align: center;
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
