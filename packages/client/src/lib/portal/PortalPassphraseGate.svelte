<!--
  Passphrase gate for Secure Link portal.
  Single password-type input with visually-hidden label,
  paste allowed (WCAG 3.3.8). Key-check verification is
  purely client-side; the server never sees the passphrase.
-->
<script lang="ts">
  import { Block, BlockTitle, Button, List, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface PortalPassphraseGateProps {
    /** Called with the entered passphrase when the user submits. */
    onsubmit: (passphrase: string) => void;
    /** Whether derivation is in progress (Argon2id ~1-2s). */
    pending: boolean;
    /** Whether the last attempt failed key-check verification. */
    error: boolean;
  }

  let { onsubmit, pending, error }: PortalPassphraseGateProps = $props();

  let passphrase = $state("");

  const canSubmit = $derived(passphrase.trim().length > 0 && !pending);

  function handleSubmit(): void {
    if (!canSubmit) return;
    onsubmit(passphrase);
  }

  // Focus error text when an error appears
  $effect(() => {
    if (error) {
      const el = document.getElementById("passphrase-error");
      el?.focus();
    }
  });
</script>

<BlockTitle>{m.portal_passphrase_hint()}</BlockTitle>

<Block>
  <p class="gate-hint">{m.portal_passphrase_hint()}</p>

  <!-- Outside the List: a ul may only contain li children (axe "list" rule);
       the for/id association works from anywhere in the document. -->
  <label for="portal-passphrase" class="sr-only">
    {m.portal_passphrase_label()}
  </label>
  <List strong inset class="gate-list">
    <ListInput
      type="password"
      inputId="portal-passphrase"
      placeholder={m.portal_passphrase_label()}
      value={passphrase}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) passphrase = e.target.value;
      }}
      disabled={pending}
      data-testid="passphrase-input"
    />
  </List>

  {#if error}
    <p
      id="passphrase-error"
      class="gate-error"
      tabindex="-1"
      role="alert"
      data-testid="passphrase-error"
    >
      {m.portal_passphrase_wrong()}
    </p>
  {/if}

  <div class="gate-action">
    <Button
      large
      disabled={!canSubmit}
      onclick={handleSubmit}
      data-testid="passphrase-submit"
    >
      {#if pending}
        <span
          role="progressbar"
          aria-label={m.portal_unlocking()}
          class="gate-progress"
        ></span>
        {m.portal_unlocking()}
      {:else}
        {m.portal_send()}
      {/if}
    </Button>
  </div>
</Block>

<style>
  .gate-hint {
    font-size: var(--text-sm);
    color: var(--muted);
    margin-bottom: var(--space-md);
    line-height: 1.5;
  }

  :global(.gate-list) {
    margin: 0 !important;
  }

  .gate-error {
    font-size: var(--text-sm);
    color: var(--danger);
    margin-top: var(--space-sm);
    outline: none;
  }

  .gate-action {
    margin-top: var(--space-lg);
  }

  .gate-progress {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gate-progress {
      animation: none;
      opacity: 0.5;
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
