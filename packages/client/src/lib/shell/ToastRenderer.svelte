<!--
  Renders the global toast from toastStore.
  Place once in (app)/+layout.svelte. Reads from the singleton store.
-->
<script lang="ts">
  import ShellToast from "./ShellToast.svelte";
  import { toastStore } from "$lib/stores/toast.svelte.js";
</script>

<ShellToast opened={toastStore.current !== null} position="center">
  {#if toastStore.current !== null}
    <div class="toast-content" role="status" aria-live="polite">
      {toastStore.current.message}
    </div>
  {/if}
</ShellToast>

<style>
  .toast-content {
    font-size: 0.875rem;
    text-align: center;
    padding: 0.25rem 0;
  }
</style>
