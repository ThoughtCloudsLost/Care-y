<script lang="ts">
  import { Block, BlockTitle, Button, DialogButton } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import EscrowPassphraseForm from "$lib/components/shared/EscrowPassphraseForm.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  interface Props {
    oncomplete: () => void;
  }

  let { oncomplete }: Props = $props();

  const TOTAL_PAGES = 3;
  let subPage = $state(0);
  let sha256Hex = $state("");
  let httpsBlocked = $state(false);

  const orgKeyLoaded = $derived(isOrgKeyReady());
  const hashGroups = $derived(sha256Hex.match(/.{1,4}/g) ?? []);

  $effect(() => {
    if (import.meta.env.DEV) return;
    const isSecure = window.location.protocol === "https:";
    httpsBlocked = !isSecure;
  });

  function scrollContentToTop(): void {
    const container = document.querySelector(".onboarding-content");
    if (container) container.scrollTop = 0;
  }

  function nextPage(): void {
    if (subPage < TOTAL_PAGES - 1) {
      subPage++;
      scrollContentToTop();
    }
  }

  function prevPage(): void {
    if (subPage > 0) {
      subPage--;
      scrollContentToTop();
    }
  }

  function handleExport(data: { sha256Hex: string }): void {
    sha256Hex = data.sha256Hex;
    subPage = 2;
    scrollContentToTop();
  }

  let downloadAgainDialogOpen = $state(false);

  function confirmDownloadAgain(): void {
    downloadAgainDialogOpen = false;
    sha256Hex = "";
    subPage = 1;
    scrollContentToTop();
  }
</script>

<BlockTitle medium>{m.admin_escrow_step_education_heading()}</BlockTitle>

{#if httpsBlocked}
  <Block>
    <p class="step-error" role="alert">{m.onboarding_escrow_https_warning()}</p>
  </Block>
{:else}
  <div class="page-dots" aria-hidden="true">
    {#each Array(TOTAL_PAGES) as _, i (i)}
      <span class="page-dot" class:page-dot--active={i === subPage}></span>
    {/each}
  </div>

  {#if subPage === 0}
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
      <div class="escrow-nav">
        <Button large onclick={nextPage} disabled={!orgKeyLoaded}>
          {m.common_next()}
        </Button>
      </div>
    </Block>
  {:else if subPage === 1}
    {#key subPage}
      <EscrowPassphraseForm onexport={handleExport} />
    {/key}

    <Block>
      <div class="escrow-nav">
        <Button large outline onclick={prevPage}>
          {m.common_back()}
        </Button>
      </div>
    </Block>
  {:else}
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

    <Block>
      <div class="escrow-nav">
        <Button large outline onclick={() => (downloadAgainDialogOpen = true)}>
          {m.onboarding_escrow_download_again()}
        </Button>
        <Button large onclick={oncomplete}>
          {m.onboarding_escrow_continue()}
        </Button>
      </div>
    </Block>
  {/if}
{/if}

<ShellDialog
  opened={downloadAgainDialogOpen}
  ondismiss={() => (downloadAgainDialogOpen = false)}
  title={m.onboarding_escrow_download_again_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.onboarding_escrow_download_again_body()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton onclick={() => (downloadAgainDialogOpen = false)}>
      {m.common_cancel()}
    </DialogButton>
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton strong onclick={confirmDownloadAgain}>
      {m.onboarding_escrow_download_again_confirm()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .page-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 12px 0;
  }

  .page-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--muted) 30%, transparent);
    transition: background 150ms ease;
  }

  .page-dot--active {
    background: var(--brand-primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .page-dot {
      transition: none;
    }
  }

  .escrow-nav {
    display: flex;
    justify-content: space-between;
    gap: var(--space-md);
  }

  .escrow-nav :global(.k-button:only-child) {
    margin-left: auto;
  }

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
