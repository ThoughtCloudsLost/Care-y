<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  let { error, onretry }: { error: unknown; onretry?: () => void } = $props();

  const errorCodeMap: Record<string, () => string> = {
    RATE_LIMIT_COOLDOWN: () => m.error_rate_limit_cooldown(),
    RATE_LIMIT_HOURLY: () => m.error_rate_limit_hourly(),
    NO_ACTIVE_CODE: () => m.error_no_active_code(),
    TOO_MANY_ATTEMPTS: () => m.error_too_many_attempts(),
  };

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message in errorCodeMap) {
      const messageFn = errorCodeMap[err.message];
      if (messageFn) return messageFn();
    }
    return m.error_generic();
  }
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
