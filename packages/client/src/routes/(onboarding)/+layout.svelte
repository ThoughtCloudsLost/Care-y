<script lang="ts">
  import { Page, Navbar } from "konsta/svelte";

  let { children } = $props();
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
    padding: var(--space-2xl) var(--page-pad-x);
  }

  .onboarding-content :global(.k-block-title) {
    margin-top: var(--space-2xl);
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
