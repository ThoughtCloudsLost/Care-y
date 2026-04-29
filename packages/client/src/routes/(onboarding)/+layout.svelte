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
    padding: 1rem;
  }
</style>
