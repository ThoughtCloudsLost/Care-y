<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import EscrowPassphraseForm from "$lib/components/shared/EscrowPassphraseForm.svelte";

  type Step = 1 | 2 | 3;

  const orgKeyManager = getOrgKeyManager();

  let opened = $state(false);
  let step = $state<Step>(1);
  let sha256Hex = $state("");

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);
  const hashGroups = $derived(sha256Hex.match(/.{1,4}/g) ?? []);

  export function open(): void {
    opened = true;
  }

  function dismiss(): void {
    opened = false;
    reset();
  }

  function reset(): void {
    step = 1;
    sha256Hex = "";
  }

  function handleExport(data: { sha256Hex: string }): void {
    sha256Hex = data.sha256Hex;
    step = 3;
  }
</script>

<ShellPopup {opened} ondismiss={dismiss} title={m.admin_escrow_title()}>
  {#if step === 1}
    <!-- Step 1: Education -->
    <Block>
      <p class="section-heading">{m.admin_escrow_step_education_heading()}</p>
      <p class="body-text">{m.admin_escrow_step_education_body()}</p>
      <p class="body-text">
        {m.admin_escrow_step_education_scope(withTerms())}
      </p>
      <p class="body-text emphasis">
        {m.admin_escrow_step_education_analogy()}
      </p>
    </Block>

    <Block>
      <div class="callout warning">
        <p class="callout-heading">{m.admin_escrow_browser_safety_heading()}</p>
        <ul class="callout-list">
          <li>{m.admin_escrow_browser_safety_extensions()}</li>
          <li>{m.admin_escrow_browser_safety_tabs()}</li>
          <li>{m.admin_escrow_browser_safety_screen()}</li>
          <li>{m.admin_escrow_browser_safety_public()}</li>
        </ul>
      </div>
    </Block>

    {#if !orgKeyLoaded}
      <Block>
        <p class="org-key-warning" role="alert">
          {m.admin_escrow_no_org_key()}
        </p>
      </Block>
    {/if}

    <Block>
      <SoftButton full onclick={() => (step = 2)} disabled={!orgKeyLoaded}>
        {m.admin_escrow_continue()}
      </SoftButton>
    </Block>
  {:else if step === 2}
    <!-- Step 2: Passphrase creation + export -->
    <EscrowPassphraseForm onexport={handleExport} />
  {:else}
    <!-- Step 3: Storage guidance + hash -->
    <Block>
      <p class="section-heading">{m.admin_escrow_step_storage_heading()}</p>
    </Block>

    <Block>
      <div class="callout success">
        <ul class="callout-list">
          <li>{m.admin_escrow_storage_usb()}</li>
          <li>{m.admin_escrow_storage_locked()}</li>
          <li>{m.admin_escrow_storage_separate()}</li>
          <li>{m.admin_escrow_storage_copy()}</li>
          <li>{m.admin_escrow_storage_test()}</li>
        </ul>
      </div>
    </Block>

    {#if sha256Hex}
      <Block>
        <p class="hash-label">{m.onboarding_escrow_hash_label()}</p>
        <div class="hash-grid" aria-label={sha256Hex}>
          {#each hashGroups as group, i (i)}
            <code class="hash-group">{group}</code>
          {/each}
        </div>
        <p class="hash-hint">{m.onboarding_escrow_hash_hint()}</p>
      </Block>
    {/if}

    <Block>
      <SoftButton full onclick={dismiss}>
        {m.admin_escrow_done()}
      </SoftButton>
    </Block>
  {/if}
</ShellPopup>

<style>
  .section-heading {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }

  .body-text {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
  }

  .body-text:last-child {
    margin-bottom: 0;
  }

  .body-text.emphasis {
    font-style: italic;
  }

  .callout {
    border-radius: 8px;
    padding: var(--space-md);
  }

  .callout.warning {
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
  }

  .callout.success {
    background: color-mix(in srgb, var(--color-green-500) 10%, transparent);
  }

  .callout-heading {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }

  .callout-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .callout-list li {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.4;
    padding-left: 1.25rem;
    position: relative;
  }

  .callout-list li::before {
    content: "\2022";
    position: absolute;
    left: 0.25rem;
    color: var(--muted);
  }

  .org-key-warning {
    font-size: 0.8125rem;
    color: var(--color-amber-500);
    font-weight: 500;
  }

  .hash-label {
    font-size: var(--text-base);
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .hash-grid {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: start;
    gap: var(--space-sm) var(--space-lg);
    user-select: all;
  }

  .hash-group {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: var(--text-base);
    letter-spacing: 0.05em;
    color: var(--ink);
  }

  .hash-hint {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin: var(--space-lg) 0 0;
  }
</style>
