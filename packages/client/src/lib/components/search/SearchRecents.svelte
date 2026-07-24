<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { Clock, X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { searchRecents } from "$lib/search/recents.svelte.js";

  interface SearchRecentsProps {
    onselect: (query: string) => void;
  }

  let { onselect }: SearchRecentsProps = $props();
</script>

{#if searchRecents.items.length > 0}
  <!-- Secline anatomy: eyebrow, then the ruled line does the layout
       work, then the clear action in brand text. -->
  <div class="recents-secline">
    <span class="secline-eb">{m.search_recents_heading()}</span>
    <span class="secline-rule" aria-hidden="true"></span>
    <button
      type="button"
      class="clear-link"
      onclick={() => searchRecents.clear()}
    >
      {m.search_recents_clear()}
    </button>
  </div>
  <List>
    {#each searchRecents.items as query (query)}
      <ListItem link title={query} onclick={() => onselect(query)}>
        {#snippet media()}
          <Clock size={16} class="recent-icon" aria-hidden="true" />
        {/snippet}
        {#snippet after()}
          <button
            type="button"
            class="remove-btn"
            aria-label={m.search_remove_recent()}
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              searchRecents.remove(query);
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

<style>
  .recents-secline {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl) var(--page-pad-x) var(--space-sm);
  }

  .clear-link {
    font-size: var(--text-sm);
    color: var(--brand-text, var(--brand-primary));
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs) var(--space-sm);
    white-space: nowrap;
  }

  :global(.recent-icon) {
    color: var(--brand-accent, currentColor);
  }

  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    border-radius: 50%;
  }
</style>
