<script lang="ts">
  import { Card, Chip, Checkbox } from "konsta/svelte";
  import { ThumbsUp, ThumbsDown } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";

  interface ArticleCardProps {
    articleId: string;
    titleResult: DecryptResult;
    excerptResult: DecryptResult;
    /** Encrypted title bytes for length estimation in placeholder */
    encryptedTitle?: unknown;
    /** Encrypted excerpt bytes for length estimation in placeholder */
    encryptedExcerpt?: unknown;
    categoryName: string | null;
    authorName: string | null;
    rating: number;
    voteUpCount: number;
    voteTotalCount: number;
    createdAt: Date;
    updatedAt: Date;
    viewMode: "list" | "grid";
    selected?: boolean;
    multiSelectActive?: boolean;
    loading?: boolean;
    ontap: (articleId: string) => void;
    onselect?: (articleId: string) => void;
    onlongpress?: (articleId: string) => void;
  }

  let {
    articleId,
    titleResult,
    excerptResult,
    encryptedTitle,
    encryptedExcerpt,
    categoryName,
    authorName,
    rating,
    voteUpCount,
    voteTotalCount,
    createdAt,
    updatedAt,
    viewMode,
    selected = false,
    multiSelectActive = false,
    loading = false,
    ontap,
    onselect,
    onlongpress,
  }: ArticleCardProps = $props();

  const isList = $derived(viewMode === "list");
  const relativeTime = $derived(formatRelativeTime(updatedAt));

  const voteLabel = $derived(
    voteTotalCount > 0
      ? m.library_vote_count({
          up: String(voteUpCount),
          total: String(voteTotalCount),
        })
      : null,
  );

  // Long press detection for entering multi-select.
  let longPressTimer: ReturnType<typeof setTimeout> | undefined;

  function handlePointerDown(): void {
    if (loading || !onlongpress) return;
    longPressTimer = setTimeout(() => {
      onlongpress(articleId);
      longPressTimer = undefined;
    }, 500);
  }

  function handlePointerUp(): void {
    if (longPressTimer !== undefined) {
      clearTimeout(longPressTimer);
      longPressTimer = undefined;
    }
  }

  function handleCardClick(): void {
    if (loading) return;
    if (multiSelectActive) {
      onselect?.(articleId);
    } else {
      ontap(articleId);
    }
  }
</script>

{#if loading}
  <div class="article-card-wrap skeleton-pulse">
    <Card raised contentWrap={false} class="article-card">
      <div
        class="card-inner"
        class:card-inner--list={isList}
        class:card-inner--grid={!isList}
        aria-hidden="true"
      >
        <div class="row-category">
          <InlineSkeleton width="6ch" />
        </div>
        <div class="row-title">
          <DecryptPlaceholder length={20} />
        </div>
        {#if isList}
          <div class="row-excerpt">
            <DecryptPlaceholder length={40} />
          </div>
        {/if}
        <div class="row-meta">
          <InlineSkeleton width="6ch" />
          <InlineSkeleton width="4ch" />
        </div>
      </div>
    </Card>
  </div>
{:else}
  <div class="article-card-wrap">
    <Card raised contentWrap={false} class="article-card">
      <div
        class="card-inner"
        class:card-inner--list={isList}
        class:card-inner--grid={!isList}
        role="button"
        tabindex="0"
        onclick={handleCardClick}
        onkeydown={onKeyActivate(handleCardClick)}
        onpointerdown={handlePointerDown}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerUp}
      >
        {#if multiSelectActive}
          <div
            class="checkbox-wrap"
            role="presentation"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onchange={() => onselect?.(articleId)}
              class="select-checkbox"
              colors={{
                bgCheckedIos: "bg-[var(--brand-accent)]",
                borderCheckedIos: "border-[var(--brand-accent)]",
                bgCheckedMaterial: "bg-[var(--brand-accent)]",
                borderCheckedMaterial: "border-[var(--brand-accent)]",
              }}
            />
          </div>
        {/if}

        <div class="row-category">
          {#if categoryName !== null}
            <Chip outline class="category-badge">{categoryName}</Chip>
          {:else}
            <InlineSkeleton width="6ch" />
          {/if}
        </div>

        <div class="row-title">
          <DecryptPlaceholder
            result={titleResult}
            ciphertext={encryptedTitle}
            length={20}
          >
            {#if titleResult.status === "ready"}
              <span class="title-text">{titleResult.value}</span>
            {/if}
          </DecryptPlaceholder>
        </div>

        {#if isList}
          <div class="row-excerpt">
            <DecryptPlaceholder
              result={excerptResult}
              ciphertext={encryptedExcerpt}
              length={40}
            >
              {#if excerptResult.status === "ready"}
                <span class="excerpt-text">{excerptResult.value}</span>
              {/if}
            </DecryptPlaceholder>
          </div>
        {/if}

        <div class="row-meta">
          <span class="meta-left">
            {#if authorName !== null}
              <span class="author"
                >{m.library_article_by({ author: authorName })}</span
              >
            {/if}
          </span>
          <span class="meta-right">
            {#if voteLabel}
              <span class="vote-info">
                {#if voteUpCount > 0}
                  <ThumbsUp size={12} aria-hidden="true" class="vote-icon" />
                {:else}
                  <ThumbsDown size={12} aria-hidden="true" class="vote-icon" />
                {/if}
                {voteLabel}
              </span>
            {/if}
            <span class="timestamp">{relativeTime}</span>
          </span>
        </div>
      </div>
    </Card>
  </div>
{/if}

<style>
  .article-card-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .article-card-wrap :global(.k-card) {
    margin: 0 !important;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--card-pad-y) var(--card-pad-x);
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
  }

  .card-inner:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
    border-radius: var(--card-radius);
  }

  /* ── Category badge ── */
  .row-category {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  :global(.category-badge) {
    height: 1.125rem !important;
    font-size: var(--text-xs) !important;
    padding-left: var(--space-md) !important;
    padding-right: var(--space-md) !important;
    flex-shrink: 0;
  }

  /* ── Title ── */
  .title-text {
    display: block;
    font-size: var(--text-md);
    font-weight: 600;
    line-height: 1.3;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Excerpt (list mode only) ── */
  .excerpt-text {
    font-size: var(--text-sm);
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }

  /* ── Meta row ── */
  .row-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    font-size: var(--text-xs);
    color: var(--muted);
    margin-top: auto;
  }

  .meta-left {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    min-width: 0;
    overflow: hidden;
  }

  .author {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta-right {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
  }

  .vote-info {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  :global(.vote-icon) {
    opacity: 0.6;
  }

  .timestamp {
    white-space: nowrap;
  }

  /* ── Multi-select checkbox ── */
  .checkbox-wrap {
    flex-shrink: 0;
  }

  :global(.select-checkbox) {
    transform: scale(0.8);
    transform-origin: center;
  }

  /* ═══ GRID MODE ═══ */
  .card-inner--grid {
    flex: 1;
    min-height: 8rem;
  }

  .card-inner--grid .title-text {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  /* ═══ LIST MODE ═══ */
  .card-inner--list {
    gap: var(--space-xs);
  }

  .card-inner--list .row-excerpt {
    margin-bottom: var(--space-xs);
  }
</style>
