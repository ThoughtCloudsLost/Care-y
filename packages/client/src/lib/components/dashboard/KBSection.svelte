<script lang="ts">
  import { BookOpen, FileText, ThumbsUp } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  interface KBItem {
    id: string;
    encryptedTitle: unknown;
    updatedAt: Date | string;
    rating: number;
    decryptedTitle?: string;
  }

  interface KBSectionProps {
    kbItems: KBItem[];
    expanded: boolean;
    ontoggle: () => void;
    ontap?: (itemId: string) => void;
  }

  let { kbItems, expanded, ontoggle, ontap }: KBSectionProps = $props();
</script>

<CollapsibleSection
  heading={m.dashboard_kb_heading()}
  icon={BookOpen}
  iconColor="var(--brand-accent)"
  {expanded}
  {ontoggle}
>
  {#if kbItems.length > 0}
    <div class="kb-content">
      <div class="kb-summary">
        <span>{m.dashboard_kb_summary({ count: kbItems.length })}</span>
      </div>

      <div class="kb-surface">
        {#each kbItems as item (item.id)}
          <div
            class="kb-row touch-feedback"
            role="button"
            tabindex="0"
            onclick={() => ontap?.(item.id)}
            onkeydown={(e) => e.key === "Enter" && ontap?.(item.id)}
          >
            <span class="kb-icon-gutter" aria-hidden="true">
              <FileText size={13} />
            </span>
            <span class="kb-title">
              {item.decryptedTitle ?? m.dashboard_kb_encrypted_title()}
            </span>
            <span
              class="kb-rating"
              aria-label={m.dashboard_kb_rating({ count: item.rating })}
            >
              <ThumbsUp size={10} aria-hidden="true" />
              {item.rating}
            </span>
            <span class="kb-time">
              {formatRelativeTime(
                item.updatedAt instanceof Date
                  ? item.updatedAt
                  : new Date(item.updatedAt),
              )}
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
    padding: 0 0.75rem 0.25rem;
  }

  .kb-summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .kb-surface {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--surface-1);
    border-radius: var(--card-radius, 0.75rem);
    overflow: hidden;
  }

  .kb-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8125rem;
    color: var(--ink);
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid color-mix(in srgb, var(--ink) 6%, transparent);
    cursor: pointer;
  }

  .kb-row:last-child {
    border-bottom: none;
  }

  .kb-icon-gutter {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1rem;
    color: var(--muted);
    opacity: 0.55;
  }

  .kb-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }

  .kb-rating {
    display: inline-flex;
    align-items: center;
    gap: 0.1875rem;
    flex-shrink: 0;
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--brand-accent);
    opacity: 0.85;
    white-space: nowrap;
  }

  .kb-time {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 0.6875rem;
    color: var(--muted);
    opacity: 0.7;
  }

  .no-kb {
    padding: 0 1rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>
