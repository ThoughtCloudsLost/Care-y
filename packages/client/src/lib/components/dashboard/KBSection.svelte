<script lang="ts">
  import { BookOpen } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  interface KBItem {
    id: string;
    encryptedTitle: unknown;
    updatedAt: Date | string;
    decryptedTitle?: string;
  }

  interface KBSectionProps {
    kbItems: KBItem[];
    expanded: boolean;
    ontoggle: () => void;
  }

  let { kbItems, expanded, ontoggle }: KBSectionProps = $props();
</script>

<CollapsibleSection
  heading={m.dashboard_kb_heading()}
  count={kbItems.length}
  {expanded}
  {ontoggle}
>
  {#if kbItems.length > 0}
    <div class="kb-content">
      <div class="kb-summary">
        <BookOpen size={14} aria-hidden="true" class="kb-icon" />
        <span>{m.dashboard_kb_summary({ count: kbItems.length })}</span>
      </div>

      <div class="kb-list">
        {#each kbItems as item (item.id)}
          <div class="kb-row">
            <span class="kb-title">
              {item.decryptedTitle ?? m.dashboard_kb_encrypted_title()}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <p class="no-kb">{m.dashboard_kb_no_articles()}</p>
  {/if}
</CollapsibleSection>

<style>
  .kb-content {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0 1rem 0.5rem;
  }

  .kb-summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .kb-content :global(.kb-icon) {
    flex-shrink: 0;
    color: var(--muted);
  }

  .kb-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .kb-row {
    font-size: 0.8125rem;
    color: var(--ink);
    opacity: 0.8;
    padding: 0.125rem 0;
  }

  .no-kb {
    padding: 0 1rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>
