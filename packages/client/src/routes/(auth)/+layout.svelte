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
    justify-content: center;
    min-height: 100dvh;
    padding: 1rem;
  }

  .auth-container :global(.k-block) {
    width: 100%;
    max-width: 24rem;
  }
</style>
