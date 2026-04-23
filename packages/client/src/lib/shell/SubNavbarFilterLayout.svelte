<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    BlockTitle,
    Button,
    Segmented,
    SegmentedButton,
    List as KList,
    ListItem,
  } from "konsta/svelte";
  import {
    List,
    LayoutGrid,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    SquareCheckBig,
  } from "@lucide/svelte";
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
    view?: ViewToggleConfig;
    headerRight?: Snippet;
    stats: Snippet;
    sort: SortConfig;
    selectLabel: string;
    onselect: () => void;
    savedFilters: SavedFiltersConfig;
    filterPills: FilterPillsConfig;
    manage?: ManageConfig;
  }

  let {
    title,
    view,
    headerRight,
    stats,
    sort,
    selectLabel,
    onselect,
    savedFilters,
    filterPills,
    manage,
  }: Props = $props();

  // Sort popover state (internal to this component).
  let sortOpen = $state(false);
  let sortAnchorEl = $state<HTMLElement | undefined>();

  function toggleSort(): void {
    sortOpen = !sortOpen;
  }

  function handleSortTap(field: string): void {
    if (field === sort.currentField) {
      sort.onchange(field, sort.currentDirection === "asc" ? "desc" : "asc");
    } else {
      sort.onchange(field, "desc");
    }
    sortOpen = false;
  }
</script>

<div class="subnavbar-filter-content">
  <div class="page-header">
    <BlockTitle large class="page-title">{title}</BlockTitle>
    {#if view}
      <Segmented strong class="view-toggle">
        <SegmentedButton
          active={view.mode === "list"}
          aria-pressed={view.mode === "list"}
          aria-label={view.listLabel}
          onclick={() => view.onchange("list")}
        >
          <List size={16} aria-hidden="true" />
        </SegmentedButton>
        <SegmentedButton
          active={view.mode === "grid"}
          aria-pressed={view.mode === "grid"}
          aria-label={view.gridLabel}
          onclick={() => view.onchange("grid")}
        >
          <LayoutGrid size={16} aria-hidden="true" />
        </SegmentedButton>
      </Segmented>
    {:else if headerRight}
      {@render headerRight()}
    {/if}
  </div>
  <div class="stats-row">
    <div class="stats-counts">
      {@render stats()}
    </div>
    <div class="view-controls">
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
        </Button>
      </span>
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
  <SavedFilterList
    filters={savedFilters.filters}
    count={savedFilters.count}
    onapply={savedFilters.onapply}
    ondelete={savedFilters.ondelete}
    ontoggleshare={savedFilters.ontoggleshare}
  />
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

<ShellPopover
  opened={sortOpen}
  target={sortAnchorEl}
  placement="bottom"
  ondismiss={() => {
    sortOpen = false;
  }}
>
  <KList nested role="listbox" aria-label={sort.label}>
    {#each sort.options as opt (opt.field)}
      {@const isSelected = sort.currentField === opt.field}
      <ListItem
        title={opt.label}
        role="option"
        aria-selected={isSelected}
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
  </KList>
</ShellPopover>

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

  .stats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .stats-counts {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .view-controls {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .sort-anchor {
    display: inline-flex;
    flex-shrink: 0;
  }

  :global(.sort-btn),
  :global(.select-btn),
  :global(.manage-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* Material: standard icon button sizing (36dp) */
  :global(.k-material .sort-btn),
  :global(.k-material .select-btn),
  :global(.k-material .manage-btn) {
    width: 2.25rem !important;
    height: 2.25rem !important;
  }

  :global(.manage-btn) {
    color: var(--brand-accent) !important;
  }

  :global(.sort-dir-icon) {
    color: var(--brand-text);
    flex-shrink: 0;
  }

  :global(.view-toggle) {
    flex-shrink: 0;
    width: auto !important;
    height: 1.75rem !important;
  }

  :global(.view-toggle .k-segmented-button) {
    height: 1.75rem !important;
    min-height: unset !important;
  }
</style>
