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
  import { encode, requireSodium } from "@care-y/crypto";
  import { newFollowupId, newKeyGeneration } from "@care-y/shared";
  import { requireRouter } from "$lib/errors.js";
  import {
    encryptReply,
    decodeEciesTriple,
    verifyKeyCheck,
    decryptPortalMessage,
  } from "$lib/portal/portal-crypto.js";
  import {
    accountLogin as doAccountLogin,
    buildAccountRegistration,
    deriveAuthProof,
    rewrapMessages,
    type AccountSession,
    type AccountAuthProof,
  } from "$lib/portal/account-crypto.js";
  import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";
  import { buildLoginCallbacks } from "$lib/auth/crypto-callbacks.js";
  import type { LoginPhaseId } from "$lib/components/onboarding/login-phase.js";
  import { IdleTimer } from "$lib/auth/idle-timer.js";
  import PortalHint from "$lib/components/portal/PortalHint.svelte";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import PortalThread from "$lib/portal/PortalThread.svelte";
  import PortalComposer from "$lib/portal/PortalComposer.svelte";
  import AccountLoginForm from "$lib/portal/AccountLoginForm.svelte";
  import AccountSettings from "$lib/portal/AccountSettings.svelte";
  import PageLayout from "$lib/shell/PageLayout.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import { Settings as Cog, LogOut } from "@lucide/svelte";
  import {
    getClientShellCtx,
    DEFAULT_SAFE_URL,
    type ClientDrawerAction,
  } from "$lib/client-shell/context.js";

  // ---------------------------------------------------------------------------
  // Session state (module scope, zeroed on exit)
  // ---------------------------------------------------------------------------

  let session = $state<AccountSession | null>(null);
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
        announceToLiveRegion("assertive", m.account_signed_out());
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
  // Crypto phase callbacks (reused across login, create, change-password)
  // ---------------------------------------------------------------------------

  // Login reports phases so the form can label the Argon2id and OPRF wait.
  // Change-password runs the same pipeline behind its own pending flag and
  // has no phase display, so it passes a no-op setter.
  function makeCryptoCallbacks(
    setPhase: (phase: LoginPhaseId) => void = () => undefined,
  ): LoginCryptoCallbacks {
    return buildLoginCallbacks(setPhase);
  }

  // ---------------------------------------------------------------------------
  // Login handler
  // ---------------------------------------------------------------------------

  function handleLogin(username: string, password: string): void {
    if (loginPending) return;
    loginPending = true;
    loginError = false;
    signedOutMessage = "";
    loginPhase = "auth";

    const callbacks = makeCryptoCallbacks((p: LoginPhaseId) => {
      loginPhase = p;
    });

    void doAccountLogin(username, password, callbacks)
      .then((newSession: AccountSession) => {
        session = newSession;
        loginUsername = username;
        loginError = false;
        startIdleTimer();
      })
      .catch(() => {
        loginError = true;
      })
      .finally(() => {
        loginPending = false;
        loginPhase = "idle";
      });
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
      const { decode } = await import("@care-y/crypto");
      return decode(data.orgPublicKey);
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

    const payload = encryptReply(
      text,
      orgPublicKey,
      session.keypair.clientPublic,
      { ticketId, followUpId, keyGeneration },
    );

    optimisticMessages = [
      ...optimisticMessages,
      {
        id: followUpId,
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

    const callbacks = makeCryptoCallbacks();
    let proof: AccountAuthProof | null = null;

    try {
      // 1. Prove knowledge of the current password: same pipeline as
      //    login, minus the login mutation
      proof = await deriveAuthProof(loginUsername, currentPassword, callbacks);

      // Verify the key check with the current keys before touching anything
      const bootstrapData = bootstrapQuery.data;
      if (bootstrapData) {
        const keyCheck = decodeEciesTriple(bootstrapData.keyCheck);
        if (!verifyKeyCheck(proof.keypair, keyCheck)) {
          changePasswordError = m.account_login_failed();
          return;
        }
      }

      // 2. Build new registration material (fresh salt, same accountId)
      const { payload: newPayload, keypair: newKeypair } =
        await buildAccountRegistration(
          null,
          newPassword,
          proof.accountId,
          callbacks,
        );

      // 3. Re-encrypt existing messages to the new key
      const decryptedMsgs = collectDecryptedMessages();
      const rewrapped = rewrapMessages(decryptedMsgs, newKeypair.clientPublic);

      // 4. Submit change-password mutation
      const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
      await portalRouter.accountChangePassword.mutate({
        currentAuthToken: encode(proof.authToken),
        account: {
          salt: newPayload.salt,
          publicKey: newPayload.publicKey,
          authHash: newPayload.authHash,
          keyCheck: newPayload.keyCheck,
        },
        rewrappedMessages: rewrapped,
      });

      // Zero the old session keypair, install the new one
      session.destroy();
      let destroyed = false;
      session = {
        keypair: newKeypair,
        destroy(): void {
          if (destroyed) return;
          destroyed = true;
          requireSodium().memzero(newKeypair.clientPrivate);
        },
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
      proof?.destroy();
      changePasswordPending = false;
    }
  }

  /**
   * Collect decrypted messages from the thread for re-encryption.
   * Reads from messagesQuery.data and the PortalThread's decryption cache.
   * This operates on already-decrypted plaintexts, never re-fetches.
   */
  function collectDecryptedMessages(): readonly { id: string; text: string }[] {
    const msgs = messagesQuery.data?.messages ?? [];
    if (!session) return [];

    const result: { id: string; text: string }[] = [];
    for (const msg of msgs) {
      if (!("id" in msg) || typeof msg.id !== "string") continue;
      try {
        const triple = decodeEciesTriple(msg);
        const text = decryptPortalMessage(
          triple,
          session.keypair.clientPrivate,
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

  const drawerActions = $derived.by((): readonly ClientDrawerAction[] => {
    if (!session) return [];
    return [
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

  $effect(() => {
    shellContainer.current = {
      ondestroy: destroySession,
      safeUrl,
      actions: drawerActions,
      // Chat shape only once signed in; the login screen scrolls normally.
      lockScroll: session !== null,
    };
    return () => {
      shellContainer.current = undefined;
    };
  });
</script>

<svelte:head>
  <title>{m.account_title()}</title>
</svelte:head>

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
  <!-- State 2: Thread scrolls, composer pins to the bottom -->
  <PageLayout lockScroll>
    {#snippet bottomBar()}
      <PortalComposer
        bind:this={composerRef}
        onsend={handleSend}
        pending={replyMutation.isPending}
        onfirstfocus={handleFirstFocus}
        errorMessage={sendError || undefined}
      />
    {/snippet}

    <PortalThread
      messages={allMessages}
      clientPrivate={session.keypair.clientPrivate}
      loading={messagesQuery.isLoading}
      {supportLabel}
    />
  </PageLayout>

  <PortalHint
    opened={hintShown}
    ondismiss={dismissHint}
    message={m.portal_web_chat_hint()}
    dismissLabel={m.portal_hint_dismiss()}
    dismissTestid="web-chat-hint-dismiss"
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
{/if}

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
