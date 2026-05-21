<script lang="ts">
  import { setContext } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { Navbar, Progressbar } from "konsta/svelte";
  import {
    TERMINOLOGY_DEFAULTS_EN,
    type TerminologyLabels,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { setTerminology } from "$lib/terminology/context.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";
  import PageShell from "$lib/shell/PageShell.svelte";
  import LanguagePicker from "$lib/components/inputs/LanguagePicker.svelte";
  import {
    getLocale,
    setLocale,
    getTextDirection,
    type Locale,
  } from "$lib/paraglide/runtime.js";

  let { children } = $props();

  let labels = $state<TerminologyLabels>(TERMINOLOGY_DEFAULTS_EN);

  setTerminology(() => labels);

  setContext("onboarding-update-terminology", (updated: TerminologyLabels) => {
    labels = updated;
  });

  interface StepProgress {
    current: number;
    total: number;
    label: string;
  }
  let stepProgress = $state<StepProgress | null>(null);

  setContext("onboarding-update-step", (progress: StepProgress | null) => {
    stepProgress = progress;
  });

  const isSetupRoute = $derived(page.url.pathname.includes("/setup"));
  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(isSetupRoute ? null : (brandingQuery.data ?? null));
  const navbarTitle = $derived(branding?.orgName ?? "CARE-Y");

  let uiLocale = $state(getLocale());

  function handleLocaleChange(newLocale: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Locale values validated by LanguagePicker
    const locale = newLocale as Locale;
    void setLocale(locale, { reload: false });
    document.documentElement.lang = locale;
    document.documentElement.dir = getTextDirection(locale);
    uiLocale = locale;
  }

  $effect(() => {
    if (!browser || branding === null) return;
    void applyKonstaPalette({
      primary: branding.primaryColor,
      accent: branding.accentColor ?? undefined,
    });
  });
</script>

<PageShell>
  {#snippet navbar()}
    <Navbar role="banner">
      {#snippet title()}
        <div class="navbar-title-group">
          <span class="navbar-brand">
            {#if branding?.iconUrl}
              <img
                src={branding.iconUrl}
                alt=""
                class="navbar-icon"
                width="24"
                height="24"
              />
            {/if}
            {navbarTitle}
          </span>
          <LanguagePicker value={uiLocale} onchange={handleLocaleChange} />
        </div>
      {/snippet}
      {#snippet subnavbar()}
        {#if stepProgress}
          <div
            class="step-indicator"
            role="group"
            aria-label={m.onboarding_stepper_label()}
          >
            <Progressbar progress={stepProgress.current / stepProgress.total} />
            <span class="step-text">
              {m.onboarding_stepper_progress({
                current: String(stepProgress.current),
                total: String(stepProgress.total),
              })}
              {#if stepProgress.label}
                <span class="step-label">{stepProgress.label}</span>
              {/if}
            </span>
          </div>
        {/if}
      {/snippet}
    </Navbar>
  {/snippet}

  <div class="onboarding-content">
    {#key uiLocale}
      {@render children()}
    {/key}
  </div>
</PageShell>

<style>
  .onboarding-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-lg) var(--page-pad-x) var(--space-2xl);
  }

  .onboarding-content > :global(*) {
    width: 100%;
    max-width: 32rem;
  }

  .onboarding-content :global(.k-block-title) {
    margin-top: var(--space-lg);
    margin-bottom: var(--space-xs);
  }

  .onboarding-content :global(.k-block-title:first-child) {
    margin-top: var(--space-sm);
  }

  .onboarding-content :global(.k-block) {
    margin-top: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .onboarding-content :global(.k-list) {
    margin-top: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  :global(.step-desc) {
    font-size: var(--text-base);
    color: var(--muted);
    margin: 0;
  }

  :global(.step-error) {
    font-size: var(--text-base);
    color: var(--k-color-red, #ef4444);
    margin: 0;
  }

  .navbar-title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .navbar-icon {
    border-radius: 4px;
  }

  .step-indicator {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    width: 100%;
    padding-inline: var(--page-pad-x);
  }

  .step-text {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 400;
    text-align: center;
  }

  .step-label {
    display: none;
  }

  .step-label::before {
    content: " \00b7  ";
  }

  @media (min-width: 640px) {
    .step-label {
      display: inline;
    }
  }
</style>
