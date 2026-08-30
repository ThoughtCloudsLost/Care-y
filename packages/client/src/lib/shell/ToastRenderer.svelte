<!--
  Renders the global toast from toastStore.
  Place once in (app)/+layout.svelte. Reads from the singleton store.
-->
<script lang="ts">
  import ShellToast from "./ShellToast.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
</script>

{#snippet dismissButton()}
  <button
    type="button"
    class="toast-dismiss"
    onclick={() => toastStore.dismiss()}>{m.dashboard_dismiss()}</button
  >
{/snippet}

<div
  data-testid="shell-toasts"
  class:toasts-closed={toastStore.current === null}
>
  <ShellToast
    opened={toastStore.current !== null}
    position="center"
    button={dismissButton}
  >
    {#if toastStore.current !== null}
      <div class="toast-content" role="status" aria-live="polite">
        {toastStore.current.message}
      </div>
    {/if}
  </ShellToast>
</div>

<style>
  /* Konsta's closed Toast keeps its fixed wrapper in the DOM without
     pointer-events-none (unlike its dialogs), so it silently swallows
     taps over the bottom bar and leaves a focusable dismiss button in
     the accessibility tree. Neutralize both whenever nothing is shown;
     the exit animation is traded for a correct hit target. */
  .toasts-closed :global(.k-toast) {
    pointer-events: none;
    visibility: hidden;
  }

  .toast-content {
    font-size: 0.875rem;
    text-align: center;
    padding: 0.25rem 0;
  }

  .toast-dismiss {
    background: none;
    border: none;
    color: var(--brand-text);
    font-weight: 600;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    -webkit-tap-highlight-color: transparent;
  }
</style>
