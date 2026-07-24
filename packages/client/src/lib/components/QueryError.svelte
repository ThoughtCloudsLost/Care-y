<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getErrorMessage } from "./query-error-messages.js";

  let { error, onretry }: { error: unknown; onretry?: () => void } = $props();
</script>

<Block class="text-center py-8">
  <p class="query-error-message">{getErrorMessage(error)}</p>
  {#if onretry}
    <button class="touch-feedback query-error-retry" onclick={onretry}>
      {m.app_retry()}
    </button>
  {/if}
</Block>

<style>
  .query-error-message {
    color: var(--muted);
  }

  .query-error-retry {
    margin-top: 1rem;
  }
</style>
