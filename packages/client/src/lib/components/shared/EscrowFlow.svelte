<!--
  EscrowFlow: shared 3-step escrow export flow.

  Used by both EscrowExport (admin popup) and SetupEscrow (onboarding inline).
  The 3 steps are: education/safety, passphrase creation, storage guidance.
  Boolean props control onboarding-specific features (page dots, HTTPS check,
  download-again dialog, back navigation).
-->
<script lang="ts">
  import { Block, DialogButton } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import EscrowPassphraseForm from "$lib/components/shared/EscrowPassphraseForm.svelte";
  import Register from "$lib/components/Register.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  interface Props {
    oncomplete?: () => void;
    completeLabel?: string;
    showPageDots?: boolean;
    showHttpsCheck?: boolean;
    showDownloadAgain?: boolean;
    showBackButton?: boolean;
    externalNav?: boolean;
    scrollContainer?: string;
  }

  let {
    oncomplete,
    completeLabel = m.admin_escrow_done(),
    showPageDots = false,
    showHttpsCheck = false,
    showDownloadAgain = false,
    showBackButton = false,
    externalNav = false,
    scrollContainer,
  }: Props = $props();

  const TOTAL_STEPS = 3;

  const orgKeyManager = getOrgKeyManager();

  let step = $state(0);
  let sha256Hex = $state("");
  let httpsBlocked = $state(false);
  let downloadAgainDialogOpen = $state(false);

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);
  const hashGroups = $derived(sha256Hex.match(/.{1,4}/g) ?? []);

  $effect(() => {
    if (!showHttpsCheck) return;
    if (import.meta.env.DEV) return;
    httpsBlocked = window.location.protocol !== "https:";
  });

  function scrollToTop(): void {
    if (scrollContainer === undefined || scrollContainer === "") return;
    const el = document.querySelector(scrollContainer);
    if (el) el.scrollTop = 0;
  }

  function nextStep(): void {
    if (step < TOTAL_STEPS - 1) {
      step++;
      scrollToTop();
    }
  }

  function prevStep(): void {
    if (step > 0) {
      step--;
      scrollToTop();
    }
  }

  function handleExport(data: { sha256Hex: string }): void {
    sha256Hex = data.sha256Hex;
    step = 2;
    scrollToTop();
  }

  function confirmDownloadAgain(): void {
    downloadAgainDialogOpen = false;
    sha256Hex = "";
    step = 1;
    scrollToTop();
  }

  export function reset(): void {
    step = 0;
    sha256Hex = "";
    httpsBlocked = false;
    downloadAgainDialogOpen = false;
  }

  export function getStep(): number {
    return step;
  }

  export function isOrgKeyLoaded(): boolean {
    return orgKeyLoaded;
  }

  export function goNext(): void {
    nextStep();
  }

  export function goPrev(): void {
    prevStep();
  }

  export function openDownloadAgainDialog(): void {
    downloadAgainDialogOpen = true;
  }
</script>

{#if showHttpsCheck && httpsBlocked}
  <Block>
    <Register kind="careful" role="alert">
      {m.onboarding_escrow_https_warning()}
    </Register>
  </Block>
{:else}
  {#if showPageDots}
    <div class="page-dots" aria-hidden="true">
      {#each Array(TOTAL_STEPS) as _, i (i)}
        <span class="page-dot" class:page-dot--active={i === step}></span>
      {/each}
    </div>
  {/if}

  {#if step === 0}
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
      <Register kind="careful">
        <p class="callout-heading">{m.admin_escrow_browser_safety_heading()}</p>
        <ul class="callout-list">
          <li>{m.admin_escrow_browser_safety_extensions()}</li>
          <li>{m.admin_escrow_browser_safety_tabs()}</li>
          <li>{m.admin_escrow_browser_safety_screen()}</li>
          <li>{m.admin_escrow_browser_safety_public()}</li>
        </ul>
      </Register>
    </Block>

    {#if !orgKeyLoaded}
      <Block>
        <Register kind="careful" role="alert">
          {m.admin_escrow_no_org_key()}
        </Register>
      </Block>
    {/if}

    {#if !externalNav}
      <Block>
        <SoftButton full onclick={nextStep} disabled={!orgKeyLoaded}>
          {m.common_next()}
        </SoftButton>
      </Block>
    {/if}
  {:else if step === 1}
    <!-- Step 2: Passphrase creation + export -->
    {#key step}
      <EscrowPassphraseForm onexport={handleExport} />
    {/key}

    {#if showBackButton && !externalNav}
      <Block>
        <div class="escrow-nav">
          <SoftButton full onclick={prevStep}>
            {m.common_back()}
          </SoftButton>
        </div>
      </Block>
    {/if}
  {:else}
    <!-- Step 3: Storage guidance + hash -->
    <Block>
      <p class="section-heading">{m.admin_escrow_step_storage_heading()}</p>
    </Block>

    <Block>
      <Register kind="note">
        <ul class="callout-list">
          <li>{m.admin_escrow_storage_usb()}</li>
          <li>{m.admin_escrow_storage_locked()}</li>
          <li>{m.admin_escrow_storage_separate()}</li>
          <li>{m.admin_escrow_storage_copy()}</li>
          <li>{m.admin_escrow_storage_test()}</li>
        </ul>
      </Register>
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

    {#if !externalNav}
      <Block>
        <div class="escrow-nav">
          {#if showDownloadAgain}
            <SoftButton full onclick={() => (downloadAgainDialogOpen = true)}>
              {m.onboarding_escrow_download_again()}
            </SoftButton>
          {/if}
          <SoftButton full onclick={oncomplete}>
            {completeLabel}
          </SoftButton>
        </div>
      </Block>
    {/if}
  {/if}
{/if}

{#if showDownloadAgain}
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
{/if}

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

  .escrow-nav :global(.k-button:only-child),
  .escrow-nav :global(.soft-btn:only-child) {
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

  /* Callout surfaces are Register (Careful / Note); only the list
     formatting inside the register body stays scoped. */
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
    font-family: var(--theme-font-mono);
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
