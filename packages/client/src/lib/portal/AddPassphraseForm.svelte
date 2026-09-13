<!--
  Add-a-password form for bare-link portal sessions.

  Passphrase + confirm fields with paste allowed (WCAG 3.3.8).
  Shows a diceware suggestion the client can copy. Submitting runs
  the full OPRF re-derivation and message re-seal pipeline, then
  calls the server to atomically swap the channel's key material.

  States: form (input), submitting (indeterminate progress), success.
-->
<script lang="ts">
  import { Block, Button, List, ListInput, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import { EFF_WORDLIST } from "$lib/portal/eff-wordlist.js";

  interface AddPassphraseFormProps {
    open: boolean;
    onclose: () => void;
    pending: boolean;
    error: string;
    success: boolean;
    onsubmit: (passphrase: string) => void;
  }

  let {
    open,
    onclose,
    pending,
    error,
    success,
    onsubmit,
  }: AddPassphraseFormProps = $props();

  let passphrase = $state("");
  let confirm = $state("");
  let suggestion = $state("");

  // Generate a 5-word diceware suggestion on first open
  $effect(() => {
    if (open && suggestion === "") {
      generateSuggestion();
    }
  });

  // Reset form state when the sheet closes
  $effect(() => {
    if (!open && !success) {
      passphrase = "";
      confirm = "";
    }
  });

  const mismatch = $derived(confirm.length > 0 && passphrase !== confirm);

  const canSubmit = $derived(
    passphrase.length > 0 && passphrase === confirm && !pending,
  );

  // --- Diceware suggestion ---

  function pickWordIndex(): number {
    const buf = new Uint16Array(1);
    // Rejection sampling over a 13-bit range (8192 > 7776)
    for (;;) {
      crypto.getRandomValues(buf);
      const val = (buf[0] ?? 0) & 0x1fff;
      if (val < EFF_WORDLIST.length) return val;
    }
  }

  function generateSuggestion(): void {
    const picked: string[] = [];
    while (picked.length < 5) {
      const word = EFF_WORDLIST[pickWordIndex()];
      if (word !== undefined) picked.push(word);
    }
    suggestion = picked.join(" ");
  }

  function handleSubmit(): void {
    if (!canSubmit || pending) return;
    onsubmit(passphrase);
  }
</script>

<ShellSheet
  opened={open}
  ondismiss={onclose}
  title={success
    ? m.portal_passphrase_success_title()
    : m.portal_passphrase_form_title()}
>
  {#if success}
    <Block>
      <p class="form-body" data-testid="passphrase-success-body">
        {m.portal_passphrase_success_body()}
      </p>
      <p
        class="form-body form-body-secondary"
        data-testid="passphrase-success-note"
      >
        {m.portal_passphrase_success_note()}
      </p>
      <div class="form-actions">
        <Button large onclick={onclose} data-testid="passphrase-success-close">
          {m.portal_passphrase_success_close()}
        </Button>
      </div>
    </Block>
  {:else}
    <Block>
      {#if suggestion !== ""}
        <p class="form-body" data-testid="passphrase-suggestion-label">
          {m.portal_passphrase_suggestion_label()}
        </p>
        <p class="suggestion-phrase" data-testid="passphrase-suggestion">
          {suggestion}
        </p>
        <button
          type="button"
          class="new-words-btn"
          onclick={generateSuggestion}
          data-testid="passphrase-new-words"
        >
          {m.portal_passphrase_new_words()}
        </button>
      {/if}

      <p class="form-body" data-testid="passphrase-paste-hint">
        {m.portal_passphrase_paste_hint()}
      </p>

      <List strongIos>
        <ListInput
          type="password"
          label={m.portal_passphrase_field_label()}
          placeholder={m.portal_passphrase_field_placeholder()}
          value={passphrase}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              passphrase = e.target.value;
            }
          }}
          data-testid="passphrase-input"
        />
        <ListInput
          type="password"
          label={m.portal_passphrase_confirm_label()}
          placeholder={m.portal_passphrase_confirm_placeholder()}
          value={confirm}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              confirm = e.target.value;
            }
          }}
          inputClass={mismatch ? "input-error" : ""}
          data-testid="passphrase-confirm"
        />
      </List>

      {#if mismatch}
        <p class="form-error" data-testid="passphrase-mismatch">
          {m.portal_passphrase_mismatch()}
        </p>
      {/if}

      {#if error !== ""}
        <p class="form-error" data-testid="passphrase-error">
          {error}
        </p>
      {/if}

      <div class="form-actions">
        {#if pending}
          <div
            role="progressbar"
            aria-label={m.portal_passphrase_submitting()}
            class="progress-container"
            data-testid="passphrase-progress"
          >
            <Preloader />
          </div>
        {/if}
        <Button
          large
          outline
          onclick={onclose}
          disabled={pending}
          data-testid="passphrase-cancel"
        >
          {m.portal_passphrase_cancel()}
        </Button>
        <Button
          large
          onclick={handleSubmit}
          disabled={!canSubmit}
          data-testid="passphrase-submit"
        >
          {m.portal_passphrase_add_button()}
        </Button>
      </div>
    </Block>
  {/if}
</ShellSheet>

<style>
  .form-body {
    font-size: var(--text-sm);
    color: var(--ink);
    line-height: 1.6;
    margin: 0 0 var(--space-sm) 0;
  }

  .form-body-secondary {
    color: var(--muted);
  }

  .suggestion-phrase {
    font-family: monospace;
    font-size: var(--text-base);
    color: var(--ink);
    background: var(--paper);
    padding: var(--space-sm) var(--space-md);
    border-radius: 6px;
    margin: var(--space-xs) 0 var(--space-xs) 0;
    user-select: all;
    word-break: break-word;
  }

  .new-words-btn {
    font-size: var(--text-xs);
    color: var(--primary);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    margin-bottom: var(--space-md);
  }

  .form-error {
    font-size: var(--text-sm);
    color: var(--danger);
    margin: var(--space-xs) 0;
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }

  .progress-container {
    display: flex;
    justify-content: center;
    padding: var(--space-sm) 0;
  }

  :global(.input-error) {
    border-color: var(--danger) !important;
  }
</style>
