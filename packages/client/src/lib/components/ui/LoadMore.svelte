<!--
  Generic "Load more" button for paginated lists.
  Renders nothing when hasMore is false.
  Shows a centered outline button with Preloader spinner during loading.
-->
<script lang="ts">
  import { Button, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    hasMore: boolean;
    loading: boolean;
    onloadmore: () => void;
  }

  let { hasMore, loading, onloadmore }: Props = $props();
</script>

{#if hasMore}
  <div class="load-more-container">
    <Button
      small
      outline
      disabled={loading}
      onclick={onloadmore}
      class="load-more-btn"
    >
      {#if loading}
        <Preloader class="load-more-spinner" />
      {:else}
        {m.ticket_panel_load_more()}
      {/if}
    </Button>
  </div>
{/if}

<style>
  .load-more-container {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
  }

  :global(.load-more-btn) {
    min-width: 7rem;
  }

  :global(.load-more-spinner) {
    width: 1rem !important;
    height: 1rem !important;
  }
</style>
