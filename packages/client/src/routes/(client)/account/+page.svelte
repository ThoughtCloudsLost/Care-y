<!--
  Account portal page.

  This page is session-free on first load. It imports neither CryptoBridge
  nor any volunteer session composable, and it touches no browser storage.
  All key material lives in module-scope state, zeroed on quick exit,
  logout, idle timeout, and pagehide.

  Three states (in order):
    1. Login (default): AccountLoginForm
    2. Thread: PortalThread + PortalComposer reused unchanged
    3. Settings: AccountSettings in a sheet, opened from the drawer

  Quick exit and the drawer belong to the (client) layout. This page
  publishes its session-zeroing callback, safe URL, and drawer entries
  through the client shell context.

  4-branch data pattern: isLoading -> placeholders, isError -> fall
  back to login with generic message, empty -> empty-thread text,
  data -> thread.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { Block } from "konsta/svelte";
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
  import { requireRouter } from "$lib/errors.js";
  import {
    buildAccountRegistration,
    rewrapMessages,
  } from "$lib/portal/account-crypto.js";
  import { buildLoginCallbacks } from "$lib/auth/crypto-callbacks.js";
  import type { LoginPhaseId } from "$lib/components/onboarding/login-phase.js";
  import { getPortalBridgeFactory } from "$lib/portal/context.js";
  import type { PortalBridge } from "$lib/workers/portal-bridge.js";
  import type { DerivationPhase } from "$lib/workers/portal-protocol.js";
  import { evaluateWithPowRetry } from "$lib/auth/crypto-helpers.js";
  import { IdleTimer } from "$lib/auth/idle-timer.js";
  import PortalHint from "$lib/shell/PortalHint.svelte";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import PortalThread from "$lib/portal/PortalThread.svelte";
  import { portalMessageElementId } from "$lib/portal/portal-message-ids.js";
  import PortalComposer from "$lib/portal/PortalComposer.svelte";
  import { createSearchOverlay } from "$lib/search/search-overlay.svelte.js";
  import { createScrollManager } from "$lib/tickets/scroll-manager.svelte.js";
  import JumpToLatest from "$lib/components/tickets/JumpToLatest.svelte";
  import SearchNavigator from "$lib/components/search/SearchNavigator.svelte";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import AccountLoginForm from "$lib/portal/AccountLoginForm.svelte";
  import AccountSettings from "$lib/portal/AccountSettings.svelte";
  import PageLayout from "$lib/shell/PageLayout.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import { Settings as Cog, LogOut, IdCard, UserPen } from "@lucide/svelte";
  import ContactInfoCard from "$lib/portal/ContactInfoCard.svelte";
  import ContactCorrectionSheet from "$lib/portal/ContactCorrectionSheet.svelte";
  import {
    getClientShellCtx,
    DEFAULT_SAFE_URL,
    type ClientDrawerAction,
  } from "$lib/client-shell/context.js";
  import { createPortalFilters } from "$lib/composables/portal/create-portal-filters.svelte.js";
  import { uiLocaleStore } from "$lib/stores/ui-locale.svelte.js";

  const createPortalBridge = getPortalBridgeFactory();

  // ---------------------------------------------------------------------------
  // Account session handle (ADR-091: bridge-backed, key material in the worker)
  // ---------------------------------------------------------------------------

  /**
   * Live account session. The bridge owns key material in the worker.
   * The main thread holds only the public key (for optimistic self-copy
   * rendering) and bridge-backed async crypto methods.
   */
  interface AccountSessionHandle {
    readonly clientPublic: string;
    readonly bridge: PortalBridge;
    destroy(): void;
    decryptMessage(ep: string, n: string, ct: string): Promise<string>;
    decryptAttachmentKey(
      ep: string,
      n: string,
      ct: string,
    ): Promise<{ fileKey: string; filename: string }>;
    decryptAttachmentBlob(
      ct: ArrayBuffer,
      fk: string,
      tid: string,
      aid: string,
    ): Promise<ArrayBuffer>;
    encryptReply(
      text: string,
      orgPub: string,
      tid: string,
      fid: string,
      kg: string,
    ): Promise<{
      encryptedContent: string;
      wrappedTkTemp: string;
      selfCopy: { ephemeralPoint: string; nonce: string; ciphertext: string };
    }>;
  }

  // ---------------------------------------------------------------------------
  // Session state (module scope, zeroed on exit)
  // ---------------------------------------------------------------------------

  let session = $state<AccountSessionHandle | null>(null);
  // Held in page memory only for the life of the session (change-password
  // re-runs the salt lookup); never persisted or auto-filled.
  let loginUsername = $state<string | null>(null);
  let loginPending = $state(false);
  let loginError = $state(false);
  let loginPhase = $state<LoginPhaseId>("idle");
  let signedOutMessage = $state("");
  let changePasswordPending = $state(false);
  let changePasswordError = $state("");
  let hintShown = $state(false);
  let hintDismissed = $state(false);
  let sendError = $state("");
  let composerRef = $state<PortalComposer | null>(null);

  // Optimistic messages appended after send
  interface OptimisticMsg {
    readonly id: string;
    /** Groups any files sent with this message under the same bubble. */
    readonly followupId: string;
    readonly direction: string;
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
    readonly createdAt: string;
    readonly editedAt: string | null;
  }
  let optimisticMessages = $state<OptimisticMsg[]>([]);

  function destroySession(): void {
    session?.destroy();
    session = null;
    idleTimer?.stop();
  }

  function returnToLogin(message?: string): void {
    destroySession();
    loginUsername = null;
    optimisticMessages = [];
    if (message !== undefined && message !== "") {
      signedOutMessage = message;
    }
  }

  // ---------------------------------------------------------------------------
  // Idle timer (15 minutes, 5 minute warning)
  // ---------------------------------------------------------------------------

  let idleTimer: IdleTimer | null = null;

  function startIdleTimer(): void {
    idleTimer?.stop();
    idleTimer = new IdleTimer({
      timeoutMs: 15 * 60 * 1000,
      warningMs: 5 * 60 * 1000,
      onWarning: () => {
        announceToLiveRegion("polite", m.account_idle_warning());
      },
      onTimeout: () => {
        returnToLogin(m.account_signed_out());
      },
    });
    idleTimer.start();
  }

  // ---------------------------------------------------------------------------
  // Pagehide zeroing (lifecycle cleanup)
  // ---------------------------------------------------------------------------

  $effect(() => {
    if (!browser) return;
    function onPagehide(): void {
      destroySession();
    }
    window.addEventListener("pagehide", onPagehide);
    return () => window.removeEventListener("pagehide", onPagehide);
  });

  // ---------------------------------------------------------------------------
  // Safe URL
  // ---------------------------------------------------------------------------

  const safeUrl = $derived.by((): string => {
    return bootstrapQuery.data?.safeExitUrl ?? DEFAULT_SAFE_URL;
  });

  // ---------------------------------------------------------------------------
  // Derivation phase mapping: bridge events -> LoginPhaseId
  // ---------------------------------------------------------------------------

  function derivationPhaseToLoginPhase(phase: DerivationPhase): LoginPhaseId {
    switch (phase) {
      case "argon2id-start":
        return "argon2id";
      case "argon2id-done":
        return "oprf";
      case "oprf-start":
        return "oprf";
      case "oprf-done":
        return "derive";
      case "derive-start":
        return "derive";
      case "derive-done":
        return "done";
    }
  }

  // ---------------------------------------------------------------------------
  // Login handler (ADR-091: bridge-backed)
  // ---------------------------------------------------------------------------

  function handleLogin(username: string, password: string): void {
    if (loginPending) return;
    loginPending = true;
    loginError = false;
    signedOutMessage = "";
    loginPhase = "auth";

    void (async () => {
      const bridge = createPortalBridge();
      try {
        await bridge.waitReady();

        // Wire derivation progress events to the phase display
        bridge.onDerivationProgress((event) => {
          loginPhase = derivationPhaseToLoginPhase(event.phase);
        });

        // 1. Get salt + accountId from server (fake-salt defense for unknowns)
        const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
        const { salt: saltB64, accountId } =
          await portalRouter.getAccountSalt.query({ username });

        // 2. Post password to bridge (Argon2id + blind happen in the worker)
        const passwordBuf = new TextEncoder().encode(password).buffer;
        const { blindedElement } = await bridge.accountSessionStart(
          passwordBuf,
          saltB64,
        );

        // 3. OPRF evaluate via tRPC (main thread)
        const callbacks = buildLoginCallbacks(() => undefined);
        const evaluatedB64 = await evaluateWithPowRetry(
          "account",
          accountId,
          blindedElement,
          callbacks.onPowRequired,
        );

        // 4. Finalize in the worker
        const { clientPublic, authToken } =
          await bridge.accountSessionFinish(evaluatedB64);

        // 5. Login mutation (cookie arrives via Set-Cookie)
        await portalRouter.accountLogin.mutate({
          accountId,
          authToken,
        });

        // Build the session handle
        const handle: AccountSessionHandle = {
          clientPublic,
          bridge,
          destroy(): void {
            bridge.destroy();
          },
          decryptMessage: async (ep, n, ct) => bridge.decryptMessage(ep, n, ct),
          decryptAttachmentKey: async (ep, n, ct) =>
            bridge.decryptAttachmentKey(ep, n, ct),
          decryptAttachmentBlob: async (ct, fk, tid, aid) =>
            bridge.decryptAttachmentBlob(ct, fk, tid, aid),
          encryptReply: async (text, orgPub, tid, fid, kg) =>
            bridge.encryptReply(text, orgPub, tid, fid, kg),
        };

        session = handle;
        loginUsername = username;
        loginError = false;
        startIdleTimer();
      } catch {
        bridge.destroy();
        loginError = true;
      } finally {
        loginPending = false;
        loginPhase = "idle";
      }
    })();
  }

  // ---------------------------------------------------------------------------
  // Bootstrap + messages queries (cookie-authenticated)
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const bootstrapQuery = createQuery(() => ({
    queryKey: portalKeys.accountBootstrap(),
    queryFn: async () => {
      return requireRouter(
        trpc.clientPortal,
        "clientPortal",
      ).accountBootstrap.query();
    },
    enabled: session !== null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  }));

  const messagesQuery = createQuery(() => ({
    queryKey: portalKeys.accountMessages(),
    queryFn: async () => {
      return requireRouter(
        trpc.clientPortal,
        "clientPortal",
      ).accountMessages.query();
    },
    enabled: session !== null,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  }));

  // Org public key for reply encryption
  const orgKeyQuery = createQuery(() => ({
    queryKey: portalKeys.orgPublicKey(),
    queryFn: async (): Promise<Uint8Array | null> => {
      if (!trpc.branding) return null;
      const data = await trpc.branding.getPublicBranding.query();
      if (data.orgPublicKey === null) return null;
      const { decode: decodeKey } = await import("@care-y/crypto");
      return decodeKey(data.orgPublicKey);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  }));

  const orgPublicKey = $derived(orgKeyQuery.data ?? null);

  // Org-set name shown above messages from the organization, inherited from
  // the same public branding blob the portal reads.
  const brandingQuery = createPublicBrandingQuery();
  const supportLabel = $derived(brandingQuery.data?.supportLabel ?? "");

  // 4-branch: failed cookie session falls back to login
  $effect(() => {
    if (bootstrapQuery.isError && session !== null) {
      returnToLogin(m.account_login_failed());
    }
  });

  // Combined messages: server messages + optimistic appends
  const allMessages = $derived.by(() => {
    const serverMsgs = messagesQuery.data?.messages ?? [];
    return [...serverMsgs, ...optimisticMessages];
  });

  // Clear optimistic messages when server data refreshes
  $effect(() => {
    if (messagesQuery.data) {
      optimisticMessages = [];
    }
  });

  // ---------------------------------------------------------------------------
  // Reply mutation
  // ---------------------------------------------------------------------------

  const replyMutation = createMutation(() => ({
    mutationFn: async (input: {
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
      return requireRouter(
        trpc.clientPortal,
        "clientPortal",
      ).accountReply.mutate(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalKeys.accountMessages(),
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

  let lastSentText = "";

  function handleSend(
    text: string,
    kind?: "message" | "contact_correction",
  ): void {
    sendError = "";
    const ticketId = bootstrapQuery.data?.ticketId;
    if (!session || !orgPublicKey || ticketId == null || ticketId === "") {
      return;
    }
    lastSentText = text;

    const followUpId = newFollowupId();
    const keyGeneration = newKeyGeneration();

    void session
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
            direction: "from_client",
            ephemeralPoint: payload.selfCopy.ephemeralPoint,
            nonce: payload.selfCopy.nonce,
            ciphertext: payload.selfCopy.ciphertext,
            createdAt: new Date().toISOString(),
            editedAt: null,
          },
        ];

        replyMutation.mutate({
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

  // ---------------------------------------------------------------------------
  // Change password handler
  // ---------------------------------------------------------------------------

  async function handleChangePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (changePasswordPending || !session || loginUsername === null) return;
    changePasswordPending = true;
    changePasswordError = "";

    // Change-password runs the full derivation pipeline for the current
    // password (proof of knowledge) and the new password (re-keying).
    // Both use buildAccountRegistration's main-thread pipeline (mint
    // path, stays main-thread by design). The bridge is used only for
    // key-check verification and message re-decryption.
    const callbacks = buildLoginCallbacks(() => undefined);

    // Proof bridge: a temporary worker for the current-password proof
    const proofBridge = createPortalBridge();

    try {
      await proofBridge.waitReady();

      // 1. Prove knowledge of the current password via bridge
      const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
      const { salt: saltB64, accountId } =
        await portalRouter.getAccountSalt.query({ username: loginUsername });

      const passwordBuf = new TextEncoder().encode(currentPassword).buffer;
      const { blindedElement } = await proofBridge.accountSessionStart(
        passwordBuf,
        saltB64,
      );

      const evaluatedB64 = await evaluateWithPowRetry(
        "account",
        accountId,
        blindedElement,
        callbacks.onPowRequired,
      );

      const { authToken } =
        await proofBridge.accountSessionFinish(evaluatedB64);

      // Verify the key check with the derived keys
      const bootstrapData = bootstrapQuery.data;
      if (bootstrapData) {
        const kc = bootstrapData.keyCheck;
        const passed = await proofBridge.verifyKeyCheck(
          kc.ephemeralPoint,
          kc.nonce,
          kc.ciphertext,
        );
        if (!passed) {
          changePasswordError = m.account_login_failed();
          return;
        }
      }

      // 2. Build new registration material (fresh salt, same accountId)
      const { payload: newPayload, keypair: newKeypair } =
        await buildAccountRegistration(null, newPassword, accountId, callbacks);

      // 3. Re-encrypt existing messages to the new key. Decrypt each
      //    message through the current session's bridge, then re-encrypt
      //    to the new public key using rewrapMessages (main-thread, mint path).
      const decryptedMsgs = await collectDecryptedMessages();
      const rewrapped = rewrapMessages(decryptedMsgs, newKeypair.clientPublic);

      // 4. Submit change-password mutation
      await portalRouter.accountChangePassword.mutate({
        currentAuthToken: authToken,
        account: {
          salt: newPayload.salt,
          publicKey: newPayload.publicKey,
          authHash: newPayload.authHash,
          keyCheck: newPayload.keyCheck,
        },
        rewrappedMessages: rewrapped,
      });

      // Zero the old session, install a new bridge-backed session
      session.destroy();
      proofBridge.destroy();

      // Log back in with the new password to establish a new bridge session
      // with the new keys. This is the cleanest path: the new keypair lives
      // in the new bridge's worker memory, not on the main thread.
      const { requireSodium } = await import("@care-y/crypto");
      requireSodium().memzero(newKeypair.clientPrivate);

      // The new session is established by re-logging in (the cookie is
      // still valid from the change-password mutation). Build a new bridge.
      const newBridge = createPortalBridge();
      await newBridge.waitReady();

      const newPwBuf = new TextEncoder().encode(newPassword).buffer;
      const { blindedElement: newBlinded } =
        await newBridge.accountSessionStart(newPwBuf, newPayload.salt);
      const newEval = await evaluateWithPowRetry(
        "account",
        accountId,
        newBlinded,
        callbacks.onPowRequired,
      );
      const newFinish = await newBridge.accountSessionFinish(newEval);

      session = {
        clientPublic: newFinish.clientPublic,
        bridge: newBridge,
        destroy(): void {
          newBridge.destroy();
        },
        decryptMessage: async (ep, n, ct) =>
          newBridge.decryptMessage(ep, n, ct),
        decryptAttachmentKey: async (ep, n, ct) =>
          newBridge.decryptAttachmentKey(ep, n, ct),
        decryptAttachmentBlob: async (ct, fk, tid, aid) =>
          newBridge.decryptAttachmentBlob(ct, fk, tid, aid),
        encryptReply: async (text, orgPub, tid, fid, kg) =>
          newBridge.encryptReply(text, orgPub, tid, fid, kg),
      };

      // Invalidate and refetch messages
      void queryClient.invalidateQueries({
        queryKey: portalKeys.accountMessages(),
      });
      void queryClient.invalidateQueries({
        queryKey: portalKeys.accountBootstrap(),
      });

      announceToLiveRegion("polite", m.account_change_success());
    } catch {
      changePasswordError = m.account_login_failed();
    } finally {
      proofBridge.destroy();
      changePasswordPending = false;
    }
  }

  /**
   * Collect decrypted messages from the thread for re-encryption.
   * Decrypts each message through the current session's bridge.
   * Operates on ciphertext from the server, never re-fetches.
   */
  async function collectDecryptedMessages(): Promise<
    readonly { id: string; text: string }[]
  > {
    const msgs = messagesQuery.data?.messages ?? [];
    if (!session) return [];

    const result: { id: string; text: string }[] = [];
    for (const msg of msgs) {
      if (!("id" in msg) || typeof msg.id !== "string") continue;
      try {
        const text = await session.decryptMessage(
          msg.ephemeralPoint,
          msg.nonce,
          msg.ciphertext,
        );
        result.push({ id: msg.id, text });
      } catch {
        // Skip messages that fail to decrypt
      }
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Logout handler
  // ---------------------------------------------------------------------------

  function handleLogout(): void {
    const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
    void portalRouter.accountLogout.mutate().finally(() => {
      returnToLogin(m.account_signed_out());
    });
  }

  // ---------------------------------------------------------------------------
  // Web chat hint (session-once)
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
  // Client shell registration
  // ---------------------------------------------------------------------------

  // The layout owns quick exit and the drawer; this page owns the session.
  // Only the zeroing callback crosses the boundary, never key material.
  const shellContainer = getClientShellCtx();

  let settingsOpen = $state(false);
  let contactCardOpen = $state(false);
  let correctionSheetOpen = $state(false);

  /**
   * Fetch the sealed contact envelope from the account session endpoint.
   * Called on card open, never eagerly.
   */
  async function fetchSealedAccountContact(): Promise<string> {
    const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
    const result = await portalRouter.accountContactInfo.query();
    return result.sealed;
  }

  /**
   * Open a sealed contact envelope using the account session's bridge.
   * The envelope is ephemeralPoint(32) | nonce(24) | ciphertext(N) as
   * a single base64url string.
   */
  async function openAccountContactEnvelope(
    sealed: string,
  ): Promise<{ phone?: string; email?: string }> {
    if (!session) throw new Error("No session");
    const raw = decode(sealed);
    const ep = encode(raw.subarray(0, 32));
    const nonce = encode(raw.subarray(32, 56));
    const ct = encode(raw.subarray(56));
    const json = await session.decryptMessage(ep, nonce, ct);
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

  // Locale-reactive title (the read establishes a $derived dependency)
  const pageTitle = $derived.by((): string => {
    void uiLocaleStore.locale;
    return m.account_title();
  });

  const drawerActions = $derived.by((): readonly ClientDrawerAction[] => {
    // Reading the locale establishes a dependency so labels recompute on switch
    void uiLocaleStore.locale;
    if (!session) return [];
    return [
      {
        id: "contact-info",
        label: m.portal_contact_title(),
        icon: IdCard,
        onclick: () => {
          contactCardOpen = true;
        },
      },
      {
        id: "correct-contact",
        label: m.portal_correction_mode_button(),
        icon: UserPen,
        onclick: () => {
          correctionSheetOpen = true;
        },
      },
      {
        id: "settings",
        label: m.account_settings_title(),
        icon: Cog,
        onclick: () => (settingsOpen = true),
      },
      {
        id: "logout",
        label: m.account_logout(),
        icon: LogOut,
        destructive: true,
        onclick: handleLogout,
      },
    ];
  });

  // --- In-thread search ---
  // Same overlay, navigator, and subnavbar row as the secure-link thread, so
  // the two client surfaces put search in one place and one shape.

  /** One account holds one conversation, so one draft slot. */
  const ACCOUNT_DRAFT_KEY = "client-account";

  const scroll = createScrollManager();

  // PageLayout binds a plain state variable; the manager exposes its
  // container through a getter/setter pair, which bind: cannot target.
  let threadScrollEl = $state<HTMLDivElement | undefined>(undefined);
  $effect(() => {
    scroll.scrollContainerEl = threadScrollEl;
  });

  let searchActive = $state(false);
  let matchIds = $state<readonly string[]>([]);

  const overlay = createSearchOverlay({
    matches: () => matchIds,
    getElementId: portalMessageElementId,
    scrollContainer: () => scroll.scrollContainerEl,
  });

  // Near-bottom tracking is the only thing the manager is doing here. The
  // account thread has no cursor endpoint yet, so there is no older page to
  // pull in at the top.
  $effect(() => {
    const el = scroll.scrollContainerEl;
    if (el == null) return;
    const handleScroll = (): void => {
      scroll.onScroll([], undefined);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  });

  $effect(() => scroll.cleanup);

  function jumpToLatest(): void {
    const el = scroll.scrollContainerEl;
    if (el == null) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  function openSearch(): void {
    searchActive = true;
    overlay.enter("");
  }

  function closeSearch(): void {
    overlay.exit();
    searchActive = false;
  }

  // --- Attachments, recordings, and call entries ---

  const accountAttachments = $derived(bootstrapQuery.data?.attachments ?? []);
  const accountRecordings = $derived(bootstrapQuery.data?.recordings ?? []);
  const accountCallEntries = $derived(bootstrapQuery.data?.callEntries ?? []);

  // --- Filter composable (Type / Author / Date) ---
  // Same composable as the portal page so both surfaces show the same chips.

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
      ondestroy: destroySession,
      safeUrl,
      actions: drawerActions,
      // Chat shape only once signed in; the login screen scrolls normally.
      lockScroll: session !== null,
      ...(session !== null ? { subnavbar: threadSubnavbar } : {}),
    };
    return () => {
      shellContainer.current = undefined;
    };
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<!-- The shell owns the navbar, so the row reaches it through the context
     rather than being rendered here. Snippets stay outside the locale key
     block: the script's shell-context effect references threadSubnavbar,
     and a snippet declared inside a block is scoped to it. -->
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

{#snippet accountStats()}
  {#if allMessages.length > 0}
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
    title={m.account_title()}
    hideTitle
    stats={accountStats}
    filterPills={portalFilters.pills}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    onsearch={searchActive ? undefined : openSearch}
    searchLabel={m.portal_search_label()}
  />
{/snippet}

{#key uiLocaleStore.locale}
  {#if !session}
    <!-- State 1: Login -->
    <AccountLoginForm
      onsubmit={handleLogin}
      pending={loginPending}
      error={loginError}
      phase={loginPhase}
      {signedOutMessage}
    />
  {:else if bootstrapQuery.isLoading || messagesQuery.isLoading}
    <!-- Loading -->
    <Block>
      <div class="account-loading" role="status">
        <span
          class="account-spinner"
          role="progressbar"
          aria-label={m.account_unlocking()}
        ></span>
      </div>
    </Block>
  {:else if session}
    {@const activeSession = session}
    <!-- State 2: Thread scrolls, composer pins to the bottom -->
    <PageLayout lockScroll overlayBottomBar bind:scrollEl={threadScrollEl}>
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
          draftKey={ACCOUNT_DRAFT_KEY}
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
        attachments={accountAttachments}
        recordings={accountRecordings}
        callEntries={accountCallEntries}
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

    <!-- State 3: Settings, opened from the drawer -->
    <ShellSheet
      opened={settingsOpen}
      ondismiss={() => (settingsOpen = false)}
      title={m.account_settings_title()}
    >
      <AccountSettings
        onchangepassword={(current: string, newPw: string) =>
          void handleChangePassword(current, newPw)}
        pending={changePasswordPending}
        errorMessage={changePasswordError || undefined}
      />
    </ShellSheet>

    <ContactInfoCard
      open={contactCardOpen}
      onclose={() => {
        contactCardOpen = false;
      }}
      fetchSealed={fetchSealedAccountContact}
      openEnvelope={openAccountContactEnvelope}
      orgName={supportLabel}
    />

    <ContactCorrectionSheet
      opened={correctionSheetOpen}
      ondismiss={() => (correctionSheetOpen = false)}
      pending={replyMutation.isPending}
      onsubmit={handleCorrectionSubmit}
    />
  {/if}
{/key}

<style>
  .account-loading {
    display: flex;
    justify-content: center;
    padding: var(--space-xl);
  }

  .account-spinner {
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
    .account-spinner {
      animation: none;
      opacity: 0.5;
    }
  }
</style>
