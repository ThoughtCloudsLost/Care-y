<script lang="ts">
  import { List, ListItem, BlockTitle } from "konsta/svelte";
  import { Clock, X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { searchRecents } from "$lib/search/recents.svelte.js";

  interface SearchRecentsProps {
    onselect: (query: string) => void;
  }

  let { onselect }: SearchRecentsProps = $props();
</script>

{#if searchRecents.items.length > 0}
  <div class="recents-header">
    <BlockTitle>{m.search_recents_heading()}</BlockTitle>
    <button
      type="button"
      class="clear-link"
      onclick={() => searchRecents.clear()}
    >
      {m.search_recents_clear()}
    </button>
  </div>
  <List strongIos outlineIos>
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
{:else}
  <div class="search-hint">
    <p>{m.search_hint()}</p>
  </div>
{/if}

<style>
  .recents-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: var(--space-md);
  }

  .clear-link {
    font-size: var(--text-sm);
    color: var(--brand-primary);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs) var(--space-sm);
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

  .search-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl) var(--space-md);
  }

  .search-hint p {
    color: var(--muted);
    font-size: var(--text-sm);
    text-align: center;
  }
</style>
