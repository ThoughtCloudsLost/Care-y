<!--
  Portal compose bar. Uses ShellMessagebar (the sole sanctioned
  Messagebar wrapper). Inline mode, single mode (no + button,
  no compose mode switch). Character counter in the footer snippet,
  appearing past 4,500 chars. Send disabled while pending.

  Shell import: ShellMessagebar is navigation-tier, consumed here
  following the TicketCompose.svelte precedent.
-->
<script lang="ts">
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface PortalComposerProps {
    /** Called with the message text when send is activated. */
    onsend: (text: string) => void;
    /** Whether a send mutation is in flight. */
    pending: boolean;
    /** Called on first focus (for the WebChatHint). */
    onfirstfocus?: () => void;
  }

  let { onsend, pending, onfirstfocus }: PortalComposerProps = $props();

  let text = $state("");
  let hasFocused = $state(false);

  const CHAR_LIMIT = 5_000;
  const COUNTER_THRESHOLD = 4_500;

  const charCount = $derived(text.length);
  const overLimit = $derived(charCount > CHAR_LIMIT);
  const showCounter = $derived(charCount >= COUNTER_THRESHOLD);
  const canSend = $derived(text.trim().length > 0 && !overLimit && !pending);

  function handleSend(): void {
    if (!canSend) return;
    const msg = text.trim();
    text = "";
    onsend(msg);
  }

  function handlePlus(_anchor: HTMLElement): void {
    // No compose actions on the portal; the + button is hidden via CSS
  }

  function handleInput(_e: Event): void {
    if (!hasFocused && onfirstfocus) {
      hasFocused = true;
      onfirstfocus();
    }
  }
</script>

<div class="portal-composer" data-testid="portal-composer">
  <ShellMessagebar
    bind:value={text}
    mode="reply"
    onsend={handleSend}
    onplus={handlePlus}
    oninput={handleInput}
    sendDisabled={!canSend}
    inline
  >
    {#snippet footer()}
      {#if overLimit}
        <p class="char-over" aria-live="polite" data-testid="char-over">
          {m.portal_composer_placeholder()}
        </p>
      {:else if showCounter}
        <p class="char-counter" data-testid="char-counter">
          {charCount} / {CHAR_LIMIT}
        </p>
      {/if}
    {/snippet}
  </ShellMessagebar>
</div>

<style>
  .portal-composer {
    border-top: 1px solid var(--hair, rgba(0, 0, 0, 0.1));
  }

  /* Hide the + button (no compose actions on portal) */
  :global(
    .portal-composer .k-messagebar .k-toolbar > :nth-child(2) > :first-child
  ) {
    display: none;
  }

  .char-counter {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    text-align: right;
    padding: 2px 16px 4px;
    margin: 0;
  }

  .char-over {
    font-size: var(--text-xs, 0.75rem);
    color: var(--danger);
    text-align: right;
    padding: 2px 16px 4px;
    margin: 0;
  }
</style>
