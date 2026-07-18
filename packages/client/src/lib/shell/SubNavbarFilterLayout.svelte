<script lang="ts">
  import type { Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { BlockTitle, Button, List as KList, ListItem } from "konsta/svelte";
  import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Check,
    Search,
    SquareCheckBig,
  } from "@lucide/svelte";
  import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";
  import type {
    ViewToggleConfig,
    SortConfig,
    SavedFiltersConfig,
    FilterPillsConfig,
    ManageConfig,
  } from "$lib/shell/types.js";
  import { Settings } from "@lucide/svelte";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import FilterPillBar from "$lib/components/filters/FilterPillBar.svelte";
  import SavedFilterList from "$lib/components/filters/SavedFilterList.svelte";

  interface Props {
    title: string;
    /** Use smaller title text (for detail pages vs. list pages). */
    smallTitle?: boolean;
    /** Suppress the visible title while keeping the section aria-label
     *  (detail pages where the case header owns the visible title). */
    hideTitle?: boolean;
    view?: ViewToggleConfig;
    headerRight?: Snippet;
    stats?: Snippet;
    sort?: SortConfig;
    selectLabel: string;
    onselect: () => void;
    savedFilters?: SavedFiltersConfig;
    filterPills: FilterPillsConfig;
    manage?: ManageConfig;
    /** Optional row 3: search navigator (rendered below filter pills). */
    searchNavigator?: Snippet;
    /** Optional row 4: bulk actions bar (rendered below search navigator). */
    bulkActions?: Snippet;
    /** When provided, shows a search button in the filter pill row. */
    onsearch?: () => void;
    searchLabel?: string;
  }

  let {
    title,
    smallTitle = false,
    hideTitle = false,
    view,
    headerRight,
    stats,
    sort,
    selectLabel,
    onselect,
    savedFilters,
    filterPills,
    manage,
    searchNavigator,
    bulkActions,
    onsearch,
    searchLabel,
  }: Props = $props();

  // Sort popover state (internal to this component).
  let sortOpen = $state(false);
  let sortAnchorEl = $state<HTMLElement | undefined>();

  function toggleSort(): void {
    sortOpen = !sortOpen;
  }

  function handleSortTap(field: string): void {
    if (!sort) return;
    if (field === sort.currentField) {
      sort.onchange(field, sort.currentDirection === "asc" ? "desc" : "asc");
    } else {
      sort.onchange(field, "desc");
    }
    sortOpen = false;
  }
</script>

<section class="subnavbar-filter-content" aria-label={title}>
  <div class="page-header">
    {#if hideTitle}
      <span class="page-title-spacer" aria-hidden="true"></span>
    {:else if smallTitle}
      <span class="page-title-small">{title}</span>
    {:else}
      <BlockTitle large class="page-title heading-compact">{title}</BlockTitle>
    {/if}
    {#if view}
      <ViewSwitcher
        mode={view.mode}
        onchange={view.onchange}
        label={view.label}
      />
    {:else if headerRight}
      {@render headerRight()}
    {/if}
  </div>
  {#if stats ?? sort}
    <div class="stats-row">
      <div class="stats-counts">
        {#if stats}
          {@render stats()}
        {/if}
      </div>
      <div class="view-controls">
        {#if sort}
          <span bind:this={sortAnchorEl} class="sort-anchor">
            <Button
              tonal
              rounded
              small
              inline
              class="sort-btn"
              aria-label={sort.label}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              onclick={toggleSort}
            >
              <ArrowUpDown size={16} aria-hidden="true" />
              {#if sort.toggle?.active}
                <span class="sort-dot" aria-hidden="true"></span>
              {/if}
            </Button>
          </span>
        {/if}
        <Button
          tonal
          rounded
          small
          inline
          class="select-btn"
          aria-label={selectLabel}
          onclick={onselect}
        >
          <SquareCheckBig size={16} aria-hidden="true" />
        </Button>
        {#if manage}
          {@const ManageIcon = manage.icon ?? Settings}
          <Button
            tonal
            rounded
            small
            inline
            class="manage-btn"
            aria-label={manage.label}
            onclick={manage.onclick}
          >
            <ManageIcon size={16} aria-hidden="true" />
          </Button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="view-controls standalone-controls">
      <Button
        tonal
        rounded
        small
        inline
        class="select-btn"
        aria-label={selectLabel}
        onclick={onselect}
      >
        <SquareCheckBig size={16} aria-hidden="true" />
      </Button>
    </div>
  {/if}
  {#if savedFilters}
    <SavedFilterList
      filters={savedFilters.filters}
      count={savedFilters.count}
      onapply={savedFilters.onapply}
      ondelete={savedFilters.ondelete}
      ontoggleshare={savedFilters.ontoggleshare}
    />
  {/if}
  <div class="filter-row">
    {#if onsearch}
      <Button
        tonal
        rounded
        small
        inline
        class="filter-search-btn"
        aria-label={searchLabel ?? m.search_inline_trigger()}
        onclick={onsearch}
      >
        <Search size={16} aria-hidden="true" />
      </Button>
    {/if}
    <FilterPillBar
      pills={filterPills.pills}
      activeCount={filterPills.activeCount}
      filterLabel={filterPills.filterLabel}
      dateFrom={filterPills.dateFrom}
      dateTo={filterPills.dateTo}
      dateActive={filterPills.dateActive}
      dateLabel={filterPills.dateLabel}
      ontoggle={filterPills.ontoggle}
      onselect={filterPills.onselect}
      ondatechange={filterPills.ondatechange}
      onclearall={filterPills.onclearall}
      oncreateshortcut={filterPills.oncreateshortcut}
    />
  </div>
  {#if searchNavigator}
    {@render searchNavigator()}
  {/if}
  {#if bulkActions}
    {@render bulkActions()}
  {/if}
</section>

{#if sort}
  <ShellPopover
    opened={sortOpen}
    target={sortAnchorEl}
    placement="bottom"
    ariaLabel={sort.label}
    ondismiss={() => {
      sortOpen = false;
    }}
  >
    <KList nested aria-label={sort.label}>
      {#each sort.options as opt (opt.field)}
        {@const isSelected = sort.currentField === opt.field}
        <ListItem
          title={opt.label}
          aria-current={isSelected ? "true" : undefined}
          onclick={() => handleSortTap(opt.field)}
        >
          {#snippet after()}
            {#if isSelected}
              {#if sort.currentDirection === "asc"}
                <ArrowUp size={14} class="sort-dir-icon" />
              {:else}
                <ArrowDown size={14} class="sort-dir-icon" />
              {/if}
            {/if}
          {/snippet}
        </ListItem>
      {/each}
      {#if sort.toggle}
        {@const toggle = sort.toggle}
        <ListItem
          title={toggle.label}
          aria-pressed={toggle.active}
          class="sort-toggle-item"
          onclick={() => {
            toggle.ontoggle();
            sortOpen = false;
          }}
        >
          {#snippet after()}
            <span
              class="toggle-dot"
              class:toggle-dot-active={toggle.active}
              aria-hidden="true"
            ></span>
          {/snippet}
        </ListItem>
      {/if}
    </KList>
  </ShellPopover>
{/if}

<style>
  .subnavbar-filter-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
  }

  :global(.page-title) {
    margin: 0 !important;
    padding-left: 0 !important;
  }

  .page-title-small {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    min-width: 0;
    flex: 1;
  }

  /* Keeps the view toggle pinned right when the visible title is hidden. */
  .page-title-spacer {
    flex: 1;
  }

  .stats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .stats-counts {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    font-size: var(--text-sm);
    color: var(--ink);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    min-width: 0;
  }

  .stats-counts::-webkit-scrollbar {
    display: none;
  }

  .view-controls {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .standalone-controls {
    justify-content: flex-end;
  }

  .sort-anchor {
    display: inline-flex;
    flex-shrink: 0;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
  }

  :global(.sort-btn),
  :global(.select-btn),
  :global(.manage-btn),
  :global(.filter-search-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    position: relative;
    overflow: visible !important;
  }

  :global(.sort-btn svg),
  :global(.select-btn svg),
  :global(.manage-btn svg) {
    color: var(--ink) !important;
  }

  :global(.filter-search-btn) {
    flex-shrink: 0;
    background: color-mix(
      in srgb,
      var(--brand-accent) 15%,
      transparent
    ) !important;
  }

  :global(.filter-search-btn svg) {
    color: var(--brand-accent) !important;
  }

  /* Material: standard icon button sizing (36dp) */
  :global(.k-material .sort-btn),
  :global(.k-material .select-btn),
  :global(.k-material .manage-btn),
  :global(.k-material .filter-search-btn) {
    width: 2.25rem !important;
    height: 2.25rem !important;
  }

  :global(.sort-dir-icon) {
    color: var(--brand-text);
    flex-shrink: 0;
  }

  /* The presentation toggle sits apart from the field options: same list
     anatomy, one hairline drawing the boundary. */
  :global(.sort-toggle-item) {
    border-top: 1px solid var(--hair);
  }

  .sort-dot {
    position: absolute;
    top: -1px;
    right: -1px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--unread);
    pointer-events: none;
  }

  .toggle-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid var(--hair-2);
    background: transparent;
    flex-shrink: 0;
  }

  .toggle-dot-active {
    border-color: var(--unread);
    background: var(--unread);
  }
</style>
