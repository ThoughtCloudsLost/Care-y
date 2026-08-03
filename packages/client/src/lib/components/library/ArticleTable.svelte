<!-- care-y-ignore no-hardcoded-user-strings -- InlineSkeleton width attributes are CSS values, not user-facing text -->
<script lang="ts">
  import { Checkbox } from "konsta/svelte";
  import { CHECKBOX_BRAND_COLORS } from "$lib/components/shared/konsta-classes.js";
  import { ThumbsUp, ThumbsDown } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { loadMoreObserver } from "$lib/utils/load-more-observer.svelte.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import SortHeader from "$lib/components/shared/SortHeader.svelte";
  import { SvelteMap } from "svelte/reactivity";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { KbSortField, SortDirection } from "@care-y/shared";

  interface ArticleRow {
    id: string;
    titleResult: DecryptResult;
    encryptedTitle?: string;
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

  interface ColumnHeader {
    readonly field: KbSortField | null;
    readonly className: string;
    readonly label: () => string;
  }

  const columnHeaders: readonly ColumnHeader[] = [
    {
      field: null,
      className: "col-title",
      label: () => m.library_table_col_title(),
    },
    {
      field: null,
      className: "col-category hide-narrow",
      label: () => m.library_table_col_category(),
    },
    {
      field: null,
      className: "col-author hide-medium",
      label: () => m.library_table_col_author(),
    },
    {
      field: "rating",
      className: "col-votes hide-narrow",
      label: () => m.library_table_col_votes(),
    },
    {
      field: "updated_at",
      className: "col-updated",
      label: () => m.library_table_col_updated(),
    },
  ];

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

<div class="data-table-wrap">
  <table class="data-table">
    <thead>
      <tr>
        {#if multiSelectActive}
          <th class="col-checkbox" scope="col">
            <span class="sr-only">{m.library_select_mode()}</span>
          </th>
        {/if}
        {#each columnHeaders as header (header.className)}
          {@const sortable = header.field}
          {#if sortable === null}
            <th class={header.className} scope="col">{header.label()}</th>
          {:else}
            <SortHeader
              class={header.className}
              label={header.label()}
              active={sortField === sortable}
              direction={sortDirection}
              onsort={() => handleHeaderClick(sortable)}
            />
          {/if}
        {/each}
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
            class:row-current={isActive}
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
                    colors={CHECKBOX_BRAND_COLORS}
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
    <div
      {@attach loadMoreObserver(onloadmore)}
      class="load-sentinel"
      aria-hidden="true"
    ></div>
  {/if}
</div>

<style>
  /* Table anatomy (wrap, header, rows, sort buttons, sentinel) lives in
     shared.css as the .data-table classes; only the article columns and
     cells are styled here. */

  /* ── Column widths ── */
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

  .cell-title {
    font-weight: 600;
    color: var(--ink);
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
</style>
