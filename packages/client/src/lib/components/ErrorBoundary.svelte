<script lang="ts">
  import type { Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";

  let {
    children,
    fallback,
  }: {
    children: Snippet;
    fallback?: Snippet<[{ error: unknown; reset: () => void }]>;
  } = $props();
</script>

<svelte:boundary onerror={(error) => console.error("[ErrorBoundary]", error)}>
  {@render children()}
  {#snippet failed(error: unknown, reset: () => void)}
    {#if fallback}
      {@render fallback({ error, reset })}
    {:else}
      <div role="alert" class="error-boundary-fallback">
        <p>{m.error_generic()}</p>
        <button onclick={reset} class="touch-feedback">
          {m.app_retry()}
        </button>
      </div>
    {/if}
  {/snippet}
</svelte:boundary>

<style>
  .error-boundary-fallback {
    padding: 1rem;
    text-align: center;
  }

  .error-boundary-fallback button {
    margin-top: 0.5rem;
  }
</style>
