<!--
  Link generation sheet for Secure Link upgrade and regeneration.

  Six-step flow:
    1. Setup step: passphrase toggle, optional diceware words
    2. Generate: seed + derivations in the browser
    3. Argon2id wait (when passphrase enabled)
    4. Mutation: sends channelId, authHash, clientPublic, keyCheck (never seed)
    5. Link ready: copyable code block, optional SMS send
    6. Close: zero all key material

  The passphrase and the link are never visible in the same step.
-->
<script lang="ts">
  import {
    Block,
    Button,
    List,
    ListItem,
    Preloader,
    Toggle,
  } from "konsta/svelte";
  import { DialogButton } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import Register from "$lib/components/Register.svelte";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter, RelayError, RateLimitError } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import {
    generatePortalSeed,
    deriveChannelId,
    deriveChannelAuth,
    hashChannelAuth,
    PORTAL_KEY_CHECK,
    eciesEncrypt,
    encode,
    requireSodium,
    zeroAll,
  } from "@care-y/crypto";
  import { performChannelOprf } from "$lib/portal/portal-crypto.js";
  import { solveProofOfWork } from "$lib/auth/pow-solver.js";
  import { ErrorCode } from "@care-y/shared";
  import { EFF_WORDLIST } from "$lib/portal/eff-wordlist.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { createPortalReseed } from "$lib/composables/tickets/create-portal-reseed.svelte.js";
  import type { PortalReseedStartArgs } from "$lib/composables/tickets/create-portal-reseed.svelte.js";

  interface SecureLinkSheetProps {
    opened: boolean;
    ticketId: string;
    clientId: string;
    mode: "setup" | "regenerate";
    hasPhone: boolean;
    ondismiss: () => void;
    onsuccess: () => void;
    /** Channel policy: hide SMS delivery when SMS is disabled org-wide. */
    smsEnabled?: boolean;
  }

  let {
    opened,
    ticketId,
    clientId,
    mode,
    hasPhone,
    ondismiss,
    onsuccess,
    smsEnabled = true,
  }: SecureLinkSheetProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  // --- State ---

  type Step = "setup" | "generating" | "ready";

  let step = $state<Step>("setup");
  let passphraseEnabled = $state(false);
  let words = $state<string[]>([]);
  let generatedLink = $state("");
  let generating = $state(false);
  let smsSending = $state(false);

  // Reseed opt-in and composable
  let reseedEnabled = $state(false);
  let reseedStarted = $state(false);
  let capturedChannelId = $state("");
  let capturedClientPublic = $state("");
  let cancelConfirmOpen = $state(false);

  const bridge = getCryptoBridge();
  const reseed = createPortalReseed({ bridge });

  const reseedState = $derived(reseed.state);

  // Key material held only until zeroed in finally or on close.
  let heldSeed: Uint8Array | null = null;
  let heldAuth: Uint8Array | null = null;
  let heldPrivate: Uint8Array | null = null;

  // --- Diceware word generation ---

  /** Pick a random index from [0, EFF_WORDLIST.length) via rejection
   *  sampling over a 13-bit range (8192 > 7776). */
  function pickWordIndex(): number {
    const buf = new Uint16Array(1);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- rejection sampling loop: re-draws until value < wordlist length to avoid modulo bias
    while (true) {
      crypto.getRandomValues(buf);
      const val = (buf[0] ?? 0) & 0x1fff; // 13-bit mask
      if (val < EFF_WORDLIST.length) return val;
    }
  }

  function generateWords(): void {
    const picked: string[] = [];
    while (picked.length < 5) {
      const word = EFF_WORDLIST[pickWordIndex()];
      if (word !== undefined) picked.push(word);
    }
    words = picked;
  }

  function handlePassphraseToggle(): void {
    passphraseEnabled = !passphraseEnabled;
    if (passphraseEnabled && words.length === 0) {
      generateWords();
    }
  }

  function handleNewWords(): void {
    generateWords();
  }

  // --- Generate link ---

  /** Wire the channel evaluate callback to the clientPortal tRPC mutation. */
  async function channelEvaluate(
    chanId: string,
    blindedElementB64: string,
    chanAuth?: string,
    pow?: { challenge: string; solution: string },
  ): Promise<{ evaluated: string }> {
    const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
    return portalRouter.evaluateChannelOprf.mutate({
      channelId: chanId,
      blindedElement: blindedElementB64,
      ...(chanAuth !== undefined ? { auth: chanAuth } : {}),
      ...(pow != null
        ? { powChallenge: pow.challenge, powSolution: pow.solution }
        : {}),
    });
  }

  async function handleGenerate(): Promise<void> {
    if (generating) return;
    generating = true;
    step = "generating";

    try {
      requireSodium();
      const seed = generatePortalSeed();
      heldSeed = seed;

      const channelId = deriveChannelId(seed);
      const auth = deriveChannelAuth(seed);
      heldAuth = auth;

      const passphrase = passphraseEnabled ? words.join(" ") : undefined;

      // ADR-091: derive through OPRF round (no auth for mint path)
      const keypair = await performChannelOprf(seed, channelId, {
        passphrase,
        evaluate: channelEvaluate,
        onPowRequired: solveProofOfWork,
      });
      heldPrivate = keypair.clientPrivate;

      const checkPlaintext = new TextEncoder().encode(PORTAL_KEY_CHECK);
      const keyCheck = eciesEncrypt(checkPlaintext, keypair.clientPublic);
      const authHash = encode(hashChannelAuth(auth));

      const mutationInput = {
        ticketId,
        channelId,
        authHash,
        clientPublic: encode(keypair.clientPublic),
        hasPassphrase: passphraseEnabled,
        keyCheck: {
          ephemeralPoint: encode(keyCheck.ephemeralPoint),
          nonce: encode(keyCheck.nonce),
          ciphertext: encode(keyCheck.ciphertext),
        },
      };

      if (mode === "regenerate") {
        await ticketRouter.regenerateSecureLink.mutate(mutationInput);
      } else {
        await ticketRouter.upgradeToSecureLink.mutate(mutationInput);
      }

      capturedChannelId = channelId;
      capturedClientPublic = encode(keypair.clientPublic);

      generatedLink = `${location.origin}/portal/${channelId}#${encode(seed)}`;
      step = "ready";
      onsuccess();

      if (reseedEnabled) {
        reseedStarted = true;
        const args: PortalReseedStartArgs = {
          clientId,
          channelId: capturedChannelId,
          clientPublic: capturedClientPublic,
        };
        void reseed.start(args).catch((_err: unknown) => {
          // Intentional discard: the composable manages its own error
          // state. Surfacing the rejection here would duplicate the UI.
        });
      }
    } catch (err: unknown) {
      // Intentional discard: error may carry decrypted content or key
      // material from the crypto pipeline. Toast is the only safe signal.
      // Narrow exception: surface the channel-exists message when the
      // error code matches, without rendering the error object itself.
      step = "setup";
      const isChannelExists =
        err instanceof Error && err.message === ErrorCode.PORTAL_CHANNEL_EXISTS;
      toastStore.show(
        isChannelExists
          ? m.error_portal_channel_exists(withTerms())
          : m.error_generic(),
        3000,
      );
    } finally {
      generating = false;
    }
  }

  // --- SMS send ---

  async function handleSendSms(): Promise<void> {
    if (smsSending || !generatedLink) return;
    smsSending = true;

    try {
      const resp = await fetch("/relay/sms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          body: m.portal_link_sms_body({ link: generatedLink }),
        }),
      });

      if (resp.status === 429) {
        const retryAfter = resp.headers.get("Retry-After");
        const seconds = retryAfter !== null ? parseInt(retryAfter, 10) : 30;
        throw new RateLimitError(seconds);
      }
      if (!resp.ok) throw new RelayError("SMS_FAILED", resp.status);

      haptic();
      toastStore.show(m.ticket_toast_link_sent());
    } catch (err: unknown) {
      // The SMS body contains the portal link, so the error context is
      // not safe to log beyond the typed error fields.
      if (err instanceof RateLimitError) {
        toastStore.show(
          m.ticket_sms_rate_limited({
            seconds: String(err.retryAfterSeconds),
          }),
          5000,
        );
      } else if (err instanceof RelayError) {
        toastStore.show(m.ticket_sms_error_send(), 3000);
      } else {
        toastStore.show(m.error_generic(), 3000);
      }
    } finally {
      smsSending = false;
    }
  }

  // --- Copy link ---

  async function handleCopyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(generatedLink);
      haptic();
      toastStore.show(m.ticket_toast_link_copied());
    } catch (_err: unknown) {
      // Intentional discard: clipboard errors are opaque and harmless,
      // but the link value in scope contains the portal seed.
      toastStore.show(m.error_generic(), 3000);
    }
  }

  // --- Cleanup ---

  function zeroKeyMaterial(): void {
    zeroAll(heldSeed, heldAuth, heldPrivate);
    heldSeed = null;
    heldAuth = null;
    heldPrivate = null;
  }

  function resetState(): void {
    zeroKeyMaterial();
    step = "setup";
    passphraseEnabled = false;
    reseedEnabled = false;
    reseedStarted = false;
    capturedChannelId = "";
    capturedClientPublic = "";
    cancelConfirmOpen = false;
    words = [];
    generatedLink = "";
    generating = false;
    smsSending = false;
  }

  function handleDismiss(): void {
    if (reseedState.phase === "running") {
      cancelConfirmOpen = true;
      return;
    }
    resetState();
    ondismiss();
  }

  function confirmCancelAndDismiss(): void {
    reseed.cancel();
    cancelConfirmOpen = false;
    resetState();
    ondismiss();
  }

  function declineCancelDismiss(): void {
    cancelConfirmOpen = false;
  }

  function handleReseedRetry(): void {
    if (reseedState.phase === "running") return;
    reseedStarted = true;
    const args: PortalReseedStartArgs = {
      clientId,
      channelId: capturedChannelId,
      clientPublic: capturedClientPublic,
    };
    void reseed.start(args).catch((_err: unknown) => {
      // Intentional discard: composable manages error state.
    });
  }

  // Zero key material when the sheet closes for any reason.
  $effect(() => {
    if (!opened) {
      resetState();
    }
  });

  function labelToggleInput(node: HTMLElement, label: string): void {
    const input = node.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    if (input) input.setAttribute("aria-label", label);
  }
</script>

<ShellSheet
  {opened}
  ondismiss={handleDismiss}
  title={step === "ready" ? m.ticket_tier_link_ready() : m.ticket_tier_setup()}
>
  {#if step === "setup" || step === "generating"}
    <Block class="!my-2">
      <p class="intro-text">{m.ticket_tier_secure_link_intro()}</p>
    </Block>

    <List class="!my-2">
      <ListItem title={m.ticket_tier_passphrase_toggle()}>
        {#snippet after()}
          <span use:labelToggleInput={m.ticket_tier_passphrase_toggle()}>
            <Toggle
              checked={passphraseEnabled}
              onChange={handlePassphraseToggle}
              disabled={step === "generating"}
            />
          </span>
        {/snippet}
      </ListItem>
      <ListItem
        title={m.ticket_tier_reseed_toggle()}
        subtitle={m.ticket_tier_reseed_explain()}
      >
        {#snippet after()}
          <span use:labelToggleInput={m.ticket_tier_reseed_toggle()}>
            <Toggle
              checked={reseedEnabled}
              onChange={() => {
                reseedEnabled = !reseedEnabled;
              }}
              disabled={step === "generating"}
            />
          </span>
        {/snippet}
      </ListItem>
    </List>

    {#if passphraseEnabled && words.length > 0}
      <Block class="!my-2">
        <Register kind="note">
          <p class="words-display" data-testid="secure-link-words">
            {words.join("  ")}
          </p>
          <div class="words-refresh">
            <Button
              small
              outline
              onclick={handleNewWords}
              disabled={step === "generating"}
            >
              {m.ticket_tier_new_words()}
            </Button>
          </div>
        </Register>
        <p class="passphrase-hint">
          {m.ticket_tier_passphrase_explain(withTerms())}
        </p>
      </Block>
    {/if}

    <Block class="!my-3">
      <Button large onclick={() => void handleGenerate()} disabled={generating}>
        {#if generating}
          <span
            class="inline-progress"
            role="progressbar"
            aria-label={m.ticket_tier_link_ready()}
          ></span>
        {/if}
        {m.ticket_tier_setup()}
      </Button>
    </Block>
  {:else if step === "ready"}
    <Block class="!my-3">
      <code class="link-block" data-testid="secure-link-url"
        >{generatedLink}</code
      >
    </Block>

    <Block class="!my-3 link-actions">
      <Button outline onclick={() => void handleCopyLink()}>
        {m.ticket_tier_copy_link()}
      </Button>
      {#if hasPhone && smsEnabled}
        <Button onclick={() => void handleSendSms()} disabled={smsSending}>
          {m.ticket_tier_send_sms()}
        </Button>
      {/if}
    </Block>

    {#if reseedStarted}
      <Block class="!my-3">
        <div
          class="reseed-region"
          role="region"
          aria-label={m.ticket_tier_reseed_toggle()}
        >
          {#if reseedState.phase === "running"}
            <div class="reseed-status" aria-live="polite">
              <Preloader />
              <span
                >{m.reseed_progress({
                  done: String(reseedState.itemsDone),
                  total: String(reseedState.itemsTotal),
                })}</span
              >
            </div>
            <Button small outline onclick={() => reseed.cancel()}>
              {m.reseed_cancel()}
            </Button>
          {:else if reseedState.phase === "done" && reseedState.itemsTotal === 0}
            <p class="reseed-partial" aria-live="polite">
              {m.reseed_none_eligible()}
            </p>
          {:else if reseedState.phase === "done" && reseedState.skippedCount === 0}
            <p class="reseed-done" aria-live="polite">{m.reseed_done()}</p>
          {:else if reseedState.phase === "done" && reseedState.skippedCount > 0}
            <p class="reseed-partial" aria-live="polite">
              {m.reseed_partial({ count: String(reseedState.skippedCount) })}
            </p>
            <Button small outline onclick={handleReseedRetry}>
              {m.reseed_retry()}
            </Button>
          {:else if reseedState.phase === "error"}
            <p class="reseed-error" aria-live="polite">{m.reseed_error()}</p>
            <Button small outline onclick={handleReseedRetry}>
              {m.reseed_retry()}
            </Button>
          {:else if reseedState.phase === "cancelled"}
            <p class="reseed-partial" aria-live="polite">
              {m.reseed_partial({ count: String(reseedState.skippedCount) })}
            </p>
          {/if}
        </div>
      </Block>
    {/if}

    <Block class="!my-3">
      <Register kind="careful">
        <p class="warning-text">{m.ticket_tier_link_warning()}</p>
      </Register>
    </Block>

    <Block class="!my-3">
      <Button large outline onclick={handleDismiss}>
        {m.ticket_tier_done()}
      </Button>
    </Block>
  {/if}
</ShellSheet>

<ShellDialog
  opened={cancelConfirmOpen}
  ondismiss={declineCancelDismiss}
  title={m.reseed_cancel()}
>
  {#snippet content()}
    <p>{m.reseed_cancel_confirm()}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={declineCancelDismiss}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={confirmCancelAndDismiss}>
      {m.reseed_cancel()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .intro-text {
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.4;
    margin: 0;
  }

  .words-display {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ink);
    margin: 0;
    line-height: 1.6;
    letter-spacing: 0.02em;
    word-spacing: 0.15em;
  }

  .words-refresh {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .passphrase-hint {
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.4;
    margin: 0.5rem 0 0;
  }

  .link-block {
    display: block;
    background: var(--paper-deep, var(--raised));
    border-radius: 8px;
    padding: 12px;
    font-size: var(--text-sm);
    word-break: break-all;
    color: var(--ink);
    user-select: all;
    -webkit-user-select: all;
  }

  :global(.link-actions) {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.link-actions .k-button) {
    flex: 1;
    min-width: 0;
  }

  .warning-text {
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.4;
  }

  .reseed-region {
    min-height: 3rem;
  }

  .reseed-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-sm);
    color: var(--ink);
    margin-bottom: 0.5rem;
  }

  .reseed-done {
    color: var(--care);
    font-size: var(--text-sm);
    margin: 0;
  }

  .reseed-partial {
    color: var(--muted);
    font-size: var(--text-sm);
    margin: 0 0 0.5rem;
  }

  .reseed-error {
    color: var(--danger);
    font-size: var(--text-sm);
    margin: 0 0 0.5rem;
  }

  .inline-progress {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  @media (prefers-reduced-motion: reduce) {
    .inline-progress {
      animation: none;
      opacity: 0.5;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
