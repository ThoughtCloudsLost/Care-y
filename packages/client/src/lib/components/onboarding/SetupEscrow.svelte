<!--
  SetupEscrow: wizard step 6 (escrow key backup).

  Non-skippable. 3-step flow matching admin EscrowExport:
  1. Education (what is an escrow file, browser safety)
  2. Passphrase creation + export (via shared EscrowPassphraseForm)
  3. Storage guidance + SHA-256 hash display + continue

  All crypto runs client-side via the shared export utility.
  Key material is zeroed in the shared component's finally blocks.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Block, BlockTitle, Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import EscrowPassphraseForm from "$lib/components/shared/EscrowPassphraseForm.svelte";

  interface Props {
    oncomplete: () => void;
  }

  let { oncomplete }: Props = $props();

  type Step = 1 | 2 | 3;

  let step = $state<Step>(1);
  let sha256Hex = $state("");
  let httpsBlocked = $state(false);

  const orgKeyLoaded = $derived(isOrgKeyReady());
  const hashGroups = $derived(sha256Hex.match(/.{1,4}/g) ?? []);

  onMount(() => {
    if (import.meta.env.DEV) return;
    const isSecure = window.location.protocol === "https:";
    httpsBlocked = !isSecure;
  });

  function handleExport(data: { sha256Hex: string }): void {
    sha256Hex = data.sha256Hex;
    step = 3;
  }
</script>

<BlockTitle medium>{m.admin_escrow_step_education_heading()}</BlockTitle>

{#if httpsBlocked}
  <Block>
    <p class="step-error" role="alert">{m.onboarding_escrow_https_warning()}</p>
  </Block>
{:else if step === 1}
  <!-- Step 1: Education -->
  <Block>
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
  <!-- Step 2: Passphrase + export -->
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

  <Block>
    <p class="hash-label">{m.onboarding_escrow_hash_label()}</p>
    <div class="hash-grid" aria-label={sha256Hex}>
      {#each hashGroups as group, i (i)}
        <code class="hash-group">{group}</code>
      {/each}
    </div>
    <p class="hash-hint">{m.onboarding_escrow_hash_hint()}</p>
  </Block>

  <Block class="escrow-actions">
    <Button large onclick={oncomplete}>
      {m.onboarding_escrow_continue()}
    </Button>
    <Button
      large
      outline
      onclick={() => {
        sha256Hex = "";
        step = 2;
      }}
    >
      {m.onboarding_escrow_download_again()}
    </Button>
  </Block>
{/if}

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

  :global(.escrow-actions) {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
</style>
