<script lang="ts">
  import { setContext } from "svelte";
  import { Page, Navbar } from "konsta/svelte";
  import {
    TERMINOLOGY_DEFAULTS_EN,
    type TerminologyLabels,
  } from "@care-y/shared";
  import { setTerminology } from "$lib/terminology/context.js";

  let { children } = $props();

  let labels = $state<TerminologyLabels>(TERMINOLOGY_DEFAULTS_EN);

  setTerminology(() => labels);

  setContext("onboarding-update-terminology", (updated: TerminologyLabels) => {
    labels = updated;
  });
</script>

<Page>
  <Navbar title="CARE-Y" role="banner" />
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
</style>
