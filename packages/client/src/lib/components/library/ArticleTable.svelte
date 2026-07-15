<!-- care-y-ignore no-hardcoded-user-strings -- InlineSkeleton width attributes are CSS values, not user-facing text -->
<script lang="ts">
  import { Checkbox } from "konsta/svelte";
  import { ThumbsUp, ThumbsDown, ArrowUp, ArrowDown } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import { SvelteMap } from "svelte/reactivity";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { KbSortField, SortDirection } from "@care-y/shared";

  interface ArticleRow {
    id: string;
    titleResult: DecryptResult;
    encryptedTitle?: unknown;
    categoryName: string | null;
    authorName: string | null;
    voteUpCount: number;
    voteTotalCount: number;
    updatedAt: Date;
  }

  interface ArticleTableProps {
    rows: ArticleRow[];
    sortField: KbSortField;
    sortDirection: SortDirection;
    onsortchange: (field: KbSortField, direction: SortDirection) => void;
    ontap: (articleId: string) => void;
    onfullopen?: (articleId: string) => void;
    multiSelectActive?: boolean;
    selectedIds?: ReadonlySet<string>;
    onselect?: (articleId: string) => void;
    onlongpress?: (articleId: string) => void;
    loading?: boolean;
    activeId?: string | null;
    searchTerm?: string | null;
    onloadmore?: () => void;
  }

  let {
    rows,
    sortField,
    sortDirection,
    onsortchange,
    ontap,
    onfullopen,
    multiSelectActive = false,
    selectedIds,
    onselect,
    onlongpress,
    loading = false,
    activeId = null,
    searchTerm = null,
    onloadmore,
  }: ArticleTableProps = $props();

  let sentinelEl = $state<HTMLElement | undefined>(undefined);

  $effect(() => {
    const el = sentinelEl;
    const cb = onloadmore;
    if (!el || !cb) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting === true) cb();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  });

  function handleHeaderClick(field: KbSortField): void {
    const nextDir =
      sortField === field
        ? sortDirection === "desc"
          ? "asc"
          : "desc"
        : "desc";
    onsortchange(field, nextDir);
  }

  let longPressTimers = new SvelteMap<string, ReturnType<typeof setTimeout>>();

  function handlePointerDown(articleId: string): void {
    if (!onlongpress) return;
    const timer = setTimeout(() => {
      onlongpress(articleId);
      longPressTimers.delete(articleId);
    }, 500);
    longPressTimers.set(articleId, timer);
  }

  function handlePointerUp(articleId: string): void {
    const timer = longPressTimers.get(articleId);
    if (timer !== undefined) {
      clearTimeout(timer);
      longPressTimers.delete(articleId);
    }
  }

  function handleRowClick(articleId: string): void {
    if (multiSelectActive) {
      onselect?.(articleId);
    } else {
      ontap(articleId);
    }
  }

  function handleRowDblClick(articleId: string): void {
    if (!multiSelectActive) {
      onfullopen?.(articleId);
    }
  }
</script>

<div class="article-table-wrap">
  <table class="article-table" role="grid">
    <thead>
      <tr>
        {#if multiSelectActive}
          <th class="col-checkbox" scope="col">
            <span class="sr-only">{m.library_select_mode()}</span>
          </th>
        {/if}
        <th class="col-title" scope="col">{m.library_table_col_title()}</th>
        <th class="col-category hide-narrow" scope="col"
          >{m.library_table_col_category()}</th
        >
        <th class="col-author hide-medium" scope="col"
          >{m.library_table_col_author()}</th
        >
        <th class="col-votes hide-narrow" scope="col">
          <button
            type="button"
            class="sort-header"
            class:sort-active={sortField === "rating"}
            onclick={() => handleHeaderClick("rating")}
            aria-label="{m.library_table_col_votes()}, {sortField === 'rating'
              ? sortDirection === 'asc'
                ? 'ascending'
                : 'descending'
              : 'unsorted'}"
          >
            {m.library_table_col_votes()}
            {#if sortField === "rating"}
              {#if sortDirection === "asc"}
                <ArrowUp size={12} aria-hidden="true" />
              {:else}
                <ArrowDown size={12} aria-hidden="true" />
              {/if}
            {/if}
          </button>
        </th>
        <th class="col-updated" scope="col">
          <button
            type="button"
            class="sort-header"
            class:sort-active={sortField === "updated_at"}
            onclick={() => handleHeaderClick("updated_at")}
            aria-label="{m.library_table_col_updated()}, {sortField ===
            'updated_at'
              ? sortDirection === 'asc'
                ? 'ascending'
                : 'descending'
              : 'unsorted'}"
          >
            {m.library_table_col_updated()}
            {#if sortField === "updated_at"}
              {#if sortDirection === "asc"}
                <ArrowUp size={12} aria-hidden="true" />
              {:else}
                <ArrowDown size={12} aria-hidden="true" />
              {/if}
            {/if}
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#if loading}
        {#each [1, 2, 3, 4] as n (n)}
          <tr class="skeleton-pulse">
            {#if multiSelectActive}
              <td class="col-checkbox"></td>
            {/if}
            <td class="col-title"><InlineSkeleton width="16ch" /></td>
            <td class="col-category hide-narrow"
              ><InlineSkeleton width="8ch" /></td
            >
            <td class="col-author hide-medium"
              ><InlineSkeleton width="8ch" /></td
            >
            <td class="col-votes hide-narrow"><InlineSkeleton width="4ch" /></td
            >
            <td class="col-updated"><InlineSkeleton width="6ch" /></td>
          </tr>
        {/each}
      {:else}
        {#each rows as row (row.id)}
          {@const isActive = activeId === row.id}
          {@const isSelected = selectedIds?.has(row.id) ?? false}
          <tr
            id="article-{row.id}"
            class="table-row"
            class:row-active={isActive}
            class:row-selected={isSelected}
            tabindex="0"
            aria-current={isActive ? "true" : undefined}
            onclick={() => handleRowClick(row.id)}
            ondblclick={() => handleRowDblClick(row.id)}
            onkeydown={onKeyActivate(() => handleRowClick(row.id))}
            onpointerdown={() => handlePointerDown(row.id)}
            onpointerup={() => handlePointerUp(row.id)}
            onpointercancel={() => handlePointerUp(row.id)}
          >
            {#if multiSelectActive}
              <td class="col-checkbox">
                <div
                  role="presentation"
                  onclick={(e) => e.stopPropagation()}
                  onkeydown={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onchange={() => onselect?.(row.id)}
                    class="table-checkbox"
                    colors={{
                      bgCheckedIos: "bg-[var(--brand-accent)]",
                      borderCheckedIos: "border-[var(--brand-accent)]",
                      bgCheckedMaterial: "bg-[var(--brand-accent)]",
                      borderCheckedMaterial: "border-[var(--brand-accent)]",
                    }}
                  />
                </div>
              </td>
            {/if}
            <td class="col-title cell-title">
              <DecryptPlaceholder
                result={row.titleResult}
                ciphertext={row.encryptedTitle}
                length={20}
                {searchTerm}
              />
            </td>
            <td class="col-category hide-narrow cell-muted">
              {#if row.categoryName !== null}
                {row.categoryName}
              {:else}
                <InlineSkeleton width="6ch" />
              {/if}
            </td>
            <td class="col-author hide-medium cell-muted">
              {#if row.authorName !== null}
                {row.authorName}
              {/if}
            </td>
            <td class="col-votes hide-narrow cell-muted">
              {#if row.voteTotalCount > 0}
                <span class="vote-cell">
                  {#if row.voteUpCount > 0}
                    <ThumbsUp size={12} aria-hidden="true" class="vote-icon" />
                  {:else}
                    <ThumbsDown
                      size={12}
                      aria-hidden="true"
                      class="vote-icon"
                    />
                  {/if}
                  {row.voteUpCount}/{row.voteTotalCount}
                </span>
              {/if}
            </td>
            <td class="col-updated cell-muted">
              {formatRelativeTime(row.updatedAt)}
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {#if onloadmore}
    <div bind:this={sentinelEl} class="load-sentinel" aria-hidden="true"></div>
  {/if}
</div>

<style>
  .load-sentinel {
    height: 1px;
  }

  .article-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .article-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
  }

  /* ── Header ── */
  thead tr {
    border-bottom: 2px solid var(--hair-2);
  }

  th {
    text-align: left;
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    position: sticky;
    top: 0;
    background: var(--page-bg, var(--raised));
    z-index: 1;
  }

  /* ── Column widths ── */
  .col-checkbox {
    width: 2.5rem;
    text-align: center;
    padding: 0 var(--space-xs);
  }

  .col-title {
    width: 50%;
  }

  .col-category,
  .col-author {
    white-space: nowrap;
  }

  .col-votes {
    white-space: nowrap;
  }

  .col-updated {
    white-space: nowrap;
  }

  /* ── Rows ── */
  .table-row {
    border-bottom: 1px solid var(--hair);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  @media (prefers-reduced-motion: no-preference) {
    .table-row {
      transition: background 80ms ease;
    }
  }

  .table-row:hover {
    background: var(--raised-hover, var(--raised));
  }

  .table-row:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  .row-active {
    background: var(--brand-soft, var(--brand-primary-20));
  }

  .row-selected {
    background: var(--brand-soft, var(--brand-primary-20));
  }

  td {
    padding: var(--space-xs) var(--space-sm);
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cell-title {
    font-weight: 600;
    color: var(--ink);
  }

  .cell-muted {
    color: var(--muted);
    font-size: var(--text-xs);
  }

  /* ── Sort headers ── */
  .sort-header {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .sort-header:hover {
    color: var(--ink);
  }

  .sort-active {
    color: var(--brand-text);
  }

  /* ── Votes cell ── */
  .vote-cell {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-variant-numeric: tabular-nums;
  }

  :global(.vote-icon) {
    opacity: 0.6;
  }

  /* ── Multi-select checkbox ── */
  :global(.table-checkbox) {
    transform: scale(0.8);
    transform-origin: center;
  }

  /* ── Responsive column hiding ── */
  @media (max-width: 768px) {
    .hide-medium {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .hide-narrow {
      display: none;
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
