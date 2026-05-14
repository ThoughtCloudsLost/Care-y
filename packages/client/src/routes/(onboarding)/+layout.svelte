<script lang="ts">
  import { setContext } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { Page, Navbar } from "konsta/svelte";
  import {
    TERMINOLOGY_DEFAULTS_EN,
    type TerminologyLabels,
  } from "@care-y/shared";
  import { setTerminology } from "$lib/terminology/context.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";

  let { children } = $props();

  let labels = $state<TerminologyLabels>(TERMINOLOGY_DEFAULTS_EN);

  setTerminology(() => labels);

  setContext("onboarding-update-terminology", (updated: TerminologyLabels) => {
    labels = updated;
  });

  const isSetupRoute = $derived(page.url.pathname.includes("/setup"));
  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(isSetupRoute ? null : (brandingQuery.data ?? null));
  const navbarTitle = $derived(branding?.orgName ?? "CARE-Y");

  $effect(() => {
    if (!browser || branding === null) return;
    void applyKonstaPalette({
      primary: branding.primaryColor,
      accent: branding.accentColor ?? undefined,
    });
  });
</script>

<Page>
  <Navbar role="banner">
    {#snippet title()}
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
    {/snippet}
  </Navbar>
  <div class="onboarding-content">
    {@render children()}
  </div>
</Page>

<style>
  .onboarding-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    padding: var(--space-lg) var(--page-pad-x) var(--space-2xl);
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
    color: var(--error);
    margin: 0;
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
</style>
