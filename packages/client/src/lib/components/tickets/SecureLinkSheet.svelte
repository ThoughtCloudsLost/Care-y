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
  import { Block, Button, List, ListItem, Toggle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import Register from "$lib/components/Register.svelte";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import {
    generatePortalSeed,
    deriveChannelId,
    deriveChannelAuth,
    hashChannelAuth,
    derivePortalKeypair,
    PORTAL_KEY_CHECK,
    eciesEncrypt,
    encode,
    requireSodium,
    zeroAll,
  } from "@care-y/crypto";
  import { ErrorCode } from "@care-y/shared";
  import { EFF_WORDLIST } from "$lib/portal/eff-wordlist.js";

  interface SecureLinkSheetProps {
    opened: boolean;
    ticketId: string;
    mode: "setup" | "regenerate";
    hasPhone: boolean;
    ondismiss: () => void;
    onsuccess: () => void;
  }

  let {
    opened,
    ticketId,
    mode,
    hasPhone,
    ondismiss,
    onsuccess,
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
      const keypair = derivePortalKeypair(seed, passphrase);
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

      generatedLink = `${location.origin}/portal/${channelId}#${encode(seed)}`;
      step = "ready";
      onsuccess();
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

      if (!resp.ok) throw new Error("SMS send failed");

      haptic();
      toastStore.show(m.ticket_toast_link_sent());
    } catch (_err: unknown) {
      // Intentional discard: the SMS body contains the portal link,
      // so the error context is not safe to log.
      toastStore.show(m.error_generic(), 3000);
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
    words = [];
    generatedLink = "";
    generating = false;
    smsSending = false;
  }

  function handleDismiss(): void {
    resetState();
    ondismiss();
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
    </List>

    {#if passphraseEnabled && words.length > 0}
      <Block class="!my-2">
        <Register kind="note">
          <p class="words-display">{words.join("  ")}</p>
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
      <code class="link-block">{generatedLink}</code>
    </Block>

    <Block class="!my-3 link-actions">
      <Button outline onclick={() => void handleCopyLink()}>
        {m.ticket_tier_copy_link()}
      </Button>
      {#if hasPhone}
        <Button onclick={() => void handleSendSms()} disabled={smsSending}>
          {m.ticket_tier_send_sms()}
        </Button>
      {/if}
    </Block>

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
