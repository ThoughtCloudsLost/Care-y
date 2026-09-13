<!--
  Secure Link portal page.

  This page is session-free. It imports neither CryptoBridge nor any
  session composable, and it touches no browser storage.
  All key material lives in module-scope state, zeroed on quick exit
  and pagehide. The fragment never reaches any server (RFC 3986).

  Six orchestration states (in order):
    1. No/bad fragment: static explanation, no server call
    2. Bootstrap: TanStack Query with dead-link state on generic error
    3. Passphrase gate: when hasPassphrase, derive with Argon2id
    4. Thread: decrypted messages via Konsta Messages/Message
    5. Composer: ShellMessagebar via PortalComposer
    6. Quick exit: always visible, every state
-->
<script lang="ts">
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { resolve } from "$app/paths";
  import { Block, BlockTitle, Card } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { portalKeys } from "$lib/query/keys.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { derivePortalKeypair, decode, encode } from "@care-y/crypto";
  import { newFollowupId, newKeyGeneration } from "@care-y/shared";
  import {
    parseFragment,
    verifyKeyCheck,
    encryptReply,
    createPortalSession,
    decodeEciesTriple,
    decryptPortalMessage,
    type PortalSession,
  } from "$lib/portal/portal-crypto.js";
  import {
    buildAccountRegistration,
    rewrapMessages,
  } from "$lib/portal/account-crypto.js";
  import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";
  import { buildLoginCallbacks } from "$lib/auth/crypto-callbacks.js";
  import QuickExit from "$lib/components/portal/QuickExit.svelte";
  import WebChatHint from "$lib/components/portal/WebChatHint.svelte";
  import PortalPassphraseGate from "$lib/portal/PortalPassphraseGate.svelte";
  import PortalThread from "$lib/portal/PortalThread.svelte";
  import PortalComposer from "$lib/portal/PortalComposer.svelte";
  import AccountCreateForm from "$lib/portal/AccountCreateForm.svelte";
  import { X } from "@lucide/svelte";

  // Default safe URL when the org has not configured one
  const DEFAULT_SAFE_URL = "https://weather.gov";

  // Route param; the fragment-derived channel id is the crypto authority,
  // this one only keys the queries.
  const routeChannelId = $derived(page.params.channelId ?? "");

  // ---------------------------------------------------------------------------
  // Fragment parsing (state 1)
  // ---------------------------------------------------------------------------

  const fragmentData = $derived(browser ? parseFragment(location.hash) : null);
  const hasValidFragment = $derived(fragmentData !== null);

  // ---------------------------------------------------------------------------
  // Session state (module scope, zeroed on exit)
  // ---------------------------------------------------------------------------

  let session = $state<PortalSession | null>(null);
  let passphraseError = $state(false);
  let passphraseDerivePending = $state(false);
  let keyCheckPassed = $state(false);
  let hintShown = $state(false);
  let hintDismissed = $state(false);

  // Optimistic messages appended after send
  interface OptimisticMsg {
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
  }

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
      if (!trpc.clientPortal || !fragmentData) {
        throw new Error("Portal not available");
      }
      return trpc.clientPortal.portalBootstrap.query({
        channelId: fragmentData.channelId,
        auth: encode(fragmentData.auth),
      });
    },
    enabled: hasValidFragment,
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

  // Polling query for new messages (5-minute interval + focus refetch)
  const queryClient = useQueryClient();

  const messagesQuery = createQuery(() => ({
    queryKey: portalKeys.messages(routeChannelId),
    queryFn: async () => {
      if (!trpc.clientPortal || !fragmentData) {
        throw new Error("Portal not available");
      }
      return trpc.clientPortal.portalMessages.query({
        channelId: fragmentData.channelId,
        auth: encode(fragmentData.auth),
      });
    },
    enabled: keyCheckPassed,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  }));

  // Combined messages: server messages + optimistic appends
  const allMessages = $derived.by(() => {
    const serverMsgs = messagesQuery.data?.messages ?? [];
    return [...serverMsgs, ...optimisticMessages];
  });

  // Dead-link detection: bootstrap error means revoked/unknown/bad auth
  const isDeadLink = $derived(bootstrapQuery.isError);

  // Bootstrap succeeded but needs passphrase
  const needsPassphrase = $derived(
    bootstrapQuery.data?.hasPassphrase === true && !keyCheckPassed,
  );

  // No-passphrase immediate derive
  $effect(() => {
    if (
      !browser ||
      !bootstrapQuery.data ||
      bootstrapQuery.data.hasPassphrase ||
      keyCheckPassed ||
      !fragmentData
    ) {
      return;
    }

    // No passphrase: derive immediately and verify key check
    try {
      const keypair = derivePortalKeypair(fragmentData.seed);
      const keyCheck = decodeEciesTriple(bootstrapQuery.data.keyCheck);
      if (verifyKeyCheck(keypair, keyCheck)) {
        session = createPortalSession(
          fragmentData.channelId,
          fragmentData.auth,
          keypair,
          fragmentData.seed,
        );
        keyCheckPassed = true;
      }
    } catch {
      // Corrupt fragment or derivation failure; treat as dead link
    }
  });

  // ---------------------------------------------------------------------------
  // Passphrase gate (state 3)
  // ---------------------------------------------------------------------------

  function handlePassphraseSubmit(passphrase: string): void {
    const data = bootstrapQuery.data;
    const frag = fragmentData;
    if (!data || !frag) return;
    passphraseDerivePending = true;
    passphraseError = false;

    // Run Argon2id asynchronously (setTimeout to let the UI update first)
    setTimeout(() => {
      try {
        const keypair = derivePortalKeypair(frag.seed, passphrase);
        const keyCheck = decodeEciesTriple(data.keyCheck);
        if (verifyKeyCheck(keypair, keyCheck)) {
          session = createPortalSession(
            frag.channelId,
            frag.auth,
            keypair,
            frag.seed,
          );
          keyCheckPassed = true;
          passphraseError = false;
        } else {
          passphraseError = true;
        }
      } catch {
        passphraseError = true;
      } finally {
        passphraseDerivePending = false;
      }
    }, 0);
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
    }) => {
      if (!trpc.clientPortal) throw new Error("Portal not available");
      return trpc.clientPortal.portalReply.mutate(input);
    },
    onSuccess: () => {
      // Refetch messages after successful send
      void queryClient.invalidateQueries({
        queryKey: portalKeys.messages(routeChannelId),
      });
      announceToLiveRegion("polite", m.portal_send());
    },
  }));

  function handleSend(text: string): void {
    const ticketId = bootstrapQuery.data?.ticketId;
    if (!session || !orgPublicKey || ticketId == null || ticketId === "") {
      return;
    }

    const followUpId = newFollowupId();
    const keyGeneration = newKeyGeneration();

    const payload = encryptReply(
      text,
      orgPublicKey,
      session.keypair.clientPublic,
      {
        ticketId,
        followUpId,
        keyGeneration,
      },
    );

    // Optimistic append: add self-copy for immediate display
    optimisticMessages = [
      ...optimisticMessages,
      {
        direction: "from_client",
        ephemeralPoint: payload.selfCopy.ephemeralPoint,
        nonce: payload.selfCopy.nonce,
        ciphertext: payload.selfCopy.ciphertext,
        createdAt: new Date().toISOString(),
        editedAt: null,
      },
    ];

    replyMutation.mutate({
      channelId: session.channelId,
      auth: encode(session.auth),
      ticketId,
      followUpId,
      keyGeneration,
      encryptedContent: payload.encryptedContent,
      wrappedTkTemp: payload.wrappedTkTemp,
      selfCopy: payload.selfCopy,
    });
  }

  // Clear optimistic messages when server data refreshes
  $effect(() => {
    if (messagesQuery.data) {
      optimisticMessages = [];
    }
  });

  // ---------------------------------------------------------------------------
  // WebChatHint (state 5, session-once)
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

  let upgradeCardDismissed = $state(false);
  let upgradeCardExpanded = $state(false);
  let upgradePending = $state(false);
  let upgradeError = $state("");
  let upgradeSuccess = $state(false);
  let upgradeUsername = $state("");

  const showAccountOffer = $derived(
    bootstrapQuery.data?.accountOffer === true && !upgradeSuccess,
  );

  function dismissUpgradeCard(): void {
    upgradeCardDismissed = true;
  }

  function expandUpgradeCard(): void {
    upgradeCardExpanded = true;
  }

  function makeCryptoCallbacks(): LoginCryptoCallbacks {
    // Single indeterminate progressbar; phases are not surfaced separately.
    return buildLoginCallbacks(() => undefined);
  }

  function handleUpgradeSubmit(username: string, password: string): void {
    if (upgradePending || !session || !fragmentData) return;
    upgradePending = true;
    upgradeError = "";

    const callbacks = makeCryptoCallbacks();

    void (async () => {
      try {
        const { payload, keypair: newKeypair } = await buildAccountRegistration(
          username,
          password,
          null,
          callbacks,
        );

        // Re-encrypt already-decrypted thread messages to the new key
        const decryptedMsgs = collectDecryptedMessagesForUpgrade();
        const rewrapped = rewrapMessages(
          decryptedMsgs,
          newKeypair.clientPublic,
        );

        // Submit the upgrade mutation
        if (!trpc.clientPortal) return;
        await trpc.clientPortal.accountUpgrade.mutate({
          channelId: fragmentData.channelId,
          auth: encode(fragmentData.auth),
          account: payload,
          rewrappedMessages: rewrapped,
        });

        // Clean up new keypair (upgrade page shows success, not a session)
        const { requireSodium } = await import("@care-y/crypto");
        requireSodium().memzero(newKeypair.clientPrivate);

        // Destroy the old session (channel is revoked server-side)
        destroySession();

        upgradeUsername = username;
        upgradeSuccess = true;
      } catch (err: unknown) {
        // Check for CONFLICT (stale thread)
        if (
          typeof err === "object" &&
          err !== null &&
          "data" in err &&
          typeof (err as Record<string, unknown>).data === "object"
        ) {
          upgradeError = m.account_stale_thread();
          // Refetch messages so the client can try again
          void queryClient.invalidateQueries({
            queryKey: portalKeys.messages(routeChannelId),
          });
        } else {
          upgradeError = m.account_login_failed();
        }
      } finally {
        upgradePending = false;
      }
    })();
  }

  function collectDecryptedMessagesForUpgrade(): readonly {
    id: string;
    text: string;
  }[] {
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
</script>

<svelte:head>
  <title>{m.portal_title()}</title>
</svelte:head>

<!-- State 6: Quick exit (always visible, every state) -->
<QuickExit ondestroy={destroySession} {safeUrl} />

{#if !hasValidFragment}
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
    pending={passphraseDerivePending}
    error={passphraseError}
  />
{:else if upgradeSuccess}
  <!-- Upgrade success state -->
  <Block>
    <BlockTitle>{m.account_upgrade_success_title()}</BlockTitle>
    <p class="portal-body-text">{m.account_upgrade_success_body()}</p>
    <p class="portal-body-text upgrade-username">
      {m.account_login_username()}: {upgradeUsername}
    </p>
    <a
      href={resolve("/account")}
      class="upgrade-go-link"
      data-testid="upgrade-go-to-login"
    >
      {m.account_login_submit()}
    </a>
  </Block>
{:else if keyCheckPassed && session}
  <!-- Upgrade offer card (above thread when offered, dismissible) -->
  {#if showAccountOffer && !upgradeCardDismissed}
    {#if !upgradeCardExpanded}
      <Card data-testid="upgrade-card" class="upgrade-card">
        <div class="upgrade-card-header">
          <p class="upgrade-card-title">{m.account_upgrade_card_title()}</p>
          <button
            type="button"
            class="upgrade-card-dismiss"
            aria-label={m.account_upgrade_card_dismiss()}
            onclick={dismissUpgradeCard}
            data-testid="upgrade-card-dismiss"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <p class="upgrade-card-body">{m.account_upgrade_card_body()}</p>
        <button
          type="button"
          class="upgrade-card-action"
          onclick={expandUpgradeCard}
          data-testid="upgrade-card-setup"
        >
          {m.account_upgrade_setup()}
        </button>
      </Card>
    {:else}
      <AccountCreateForm
        onsubmit={handleUpgradeSubmit}
        pending={upgradePending}
        errorMessage={upgradeError || undefined}
        showLinkNote={true}
        submitLabel={m.account_upgrade_setup()}
      />
    {/if}
  {/if}

  <!-- State 4 + 5: Thread + Composer -->
  <PortalThread
    messages={allMessages}
    clientPrivate={session.keypair.clientPrivate}
    loading={messagesQuery.isLoading}
  />

  <PortalComposer
    onsend={handleSend}
    pending={replyMutation.isPending}
    onfirstfocus={handleFirstFocus}
  />

  <WebChatHint opened={hintShown} ondismiss={dismissHint} />
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
    text-decoration: none;
  }
</style>
