<script lang="ts">
  import { Page, Block } from "konsta/svelte";
  import { TERMINOLOGY_DEFAULTS_EN } from "@care-y/shared";
  import { setTerminology } from "$lib/terminology/context.js";

  let { children } = $props();

  setTerminology(() => TERMINOLOGY_DEFAULTS_EN);
</script>

<Page>
  <div class="auth-container">
    <Block>
      {@render children()}
    </Block>
  </div>
</Page>

<style>
  .auth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100dvh;
    overflow-y: auto;
    padding: 1rem;
  }

  .auth-container :global(.k-block) {
    width: 100%;
    max-width: 24rem;
    /* Auto margins center the block when it fits and keep its top
       reachable when it overflows; justify-content: center would clip
       the top on short viewports (the root layout locks .k-page, so
       this container owns the only scroll auth pages get). */
    margin-top: auto;
    margin-bottom: auto;
  }
</style>
