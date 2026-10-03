<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getErrorMessage } from "./query-error-messages.js";

  let {
    error,
    onretry,
    message,
    action,
  }: {
    error: unknown;
    onretry?: () => void;
    /** Shown in place of the message mapped from the error code. */
    message?: string;
    /** Secondary action, such as a way back to the list. */
    action?: { label: string; onclick: () => void };
  } = $props();
</script>

<Block class="text-center py-8">
  <p class="query-error-message">{message ?? getErrorMessage(error)}</p>
  {#if onretry}
    <button class="touch-feedback query-error-retry" onclick={onretry}>
      {m.app_retry()}
    </button>
  {/if}
  {#if action}
    <button class="touch-feedback query-error-action" onclick={action.onclick}>
      {action.label}
    </button>
  {/if}
</Block>

<style>
  .query-error-message {
    color: var(--muted);
  }

  .query-error-retry,
  .query-error-action {
    margin-top: 1rem;
  }
</style>
