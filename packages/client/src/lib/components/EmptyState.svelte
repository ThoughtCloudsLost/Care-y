<script lang="ts">
  import Skeleton from "./Skeleton.svelte";
  import * as m from "$lib/paraglide/messages.js";

  let { message }: { message?: string } = $props();
</script>

<div class="empty-state" aria-label={message ?? m.empty_no_data()}>
  <Skeleton lines={4} />
  <p class="empty-label">{message ?? m.empty_no_data()}</p>
</div>

<style>
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    opacity: 0.5;
  }

  .empty-label {
    margin-top: 1rem;
    color: var(--muted);
  }

  .empty-state :global(.skeleton-bar) {
    animation: none;
  }
</style>
