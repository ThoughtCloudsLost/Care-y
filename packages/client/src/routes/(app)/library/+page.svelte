<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { BlockTitle, Button, List as KList, ListItem } from "konsta/svelte";
  import { ArrowUpDown } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import {
    getScrollContainer,
    getNavbarOverrideCtx,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import CategoryCard from "$lib/components/library/CategoryCard.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import { haptic } from "$lib/utils/haptic.js";

  const orgCache = getOrgDecryptCache();
  const navbarCtx = getNavbarOverrideCtx();
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });

  if (!trpc.kb) throw new RouterNotAvailableError("kb");
  const kbRouter = trpc.kb;

  const categoriesQuery = createQuery(() => ({
    queryKey: ["kb", "categories"],
    queryFn: async () => kbRouter.listCategories.query(),
  }));

  // Decrypt category names and descriptions via org key cache.
  const categories = $derived(
    (categoriesQuery.data ?? []).map((c) => ({
      id: c.id,
      name: orgCache.decrypt(`kb-cat:${c.id}`, c.encryptedName),
      description: c.encryptedDescription
        ? orgCache.decrypt(`kb-cat-desc:${c.id}`, c.encryptedDescription)
        : null,
      sortOrder: c.sortOrder,
      updatedAt: new Date(c.updatedAt),
    })),
  );

  // Sort state: default (server sortOrder), A-Z, recently updated.
  // "Most articles" deferred until server returns category counts.
  type SortField = "default" | "alpha" | "recent";
  let currentSort = $state<SortField>("default");

  interface SortOption {
    readonly field: SortField;
    readonly label: string;
  }

  const sortOptions: SortOption[] = [
    { field: "default", label: m.library_sort_default() },
    { field: "alpha", label: m.library_sort_alpha() },
    { field: "recent", label: m.library_sort_recent() },
  ];

  const sortedCategories = $derived.by(() => {
    const items = [...categories];
    switch (currentSort) {
      case "alpha":
        return items.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      case "recent":
        return items.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
        );
      case "default":
        return items.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  });

  // Stats row: show up to 3 decrypted category names, then "& N more".
  const statsDisplay = $derived.by(() => {
    const named = categories.filter(
      (c): c is typeof c & { name: string } => c.name !== null,
    );
    if (named.length === 0) return null;
    const display = named.slice(0, 3).map((c) => c.name);
    const remaining = named.length - 3;
    return { names: display, remaining: remaining > 0 ? remaining : 0 };
  });

  // Sort dropdown state.
  let sortOpen = $state(false);
  let sortAnchorEl = $state<HTMLElement | undefined>(undefined);

  function toggleSort(): void {
    sortOpen = !sortOpen;
  }

  function handleSortTap(field: SortField): void {
    currentSort = field;
    sortOpen = false;
  }

  // Subnavbar override: same pattern as tickets page.
  // The hidden getter is a closure over scrollDir.hidden so AppShell
  // reads the latest value reactively without the override changing.
  $effect(() => {
    navbarCtx.current = {
      subnavbar: librarySubnavbar,
      subnavbarHidden: () => scrollDir.hidden,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  function handleCategoryTap(categoryId: string): void {
    haptic();
    void goto(resolve(`/library/${categoryId}`));
  }

  // No-op for skeleton cards (loading state has no interaction).
  function skeletonNoop(): void {
    /* skeleton card, no interaction */
  }
</script>

{#snippet librarySubnavbar()}
  <div class="library-header-content">
    <div class="page-header">
      <BlockTitle large class="page-title">{m.library_title()}</BlockTitle>
      <div class="view-controls">
        <span bind:this={sortAnchorEl} class="sort-anchor">
          <Button
            tonal
            rounded
            small
            inline
            class="sort-btn"
            aria-label={m.library_sort()}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            onclick={toggleSort}
          >
            <ArrowUpDown size={16} aria-hidden="true" />
          </Button>
        </span>
      </div>
    </div>
    {#if !categoriesQuery.isLoading && statsDisplay}
      <div class="stats-row">
        <div class="stats-counts">
          {#each statsDisplay.names as catName, i (i)}
            {#if i > 0}
              <span class="stats-sep" aria-hidden="true"></span>
            {/if}
            <span class="stat-item">{catName}</span>
          {/each}
          {#if statsDisplay.remaining > 0}
            <span class="stats-sep" aria-hidden="true"></span>
            <span class="stat-item stat-more">
              {m.library_more_categories({
                count: String(statsDisplay.remaining),
              })}
            </span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/snippet}

<div class="library-page pb-20">
  {#if categoriesQuery.isLoading}
    <div class="category-grid">
      {#each [1, 2, 3, 4] as n (n)}
        <CategoryCard
          loading={true}
          name={null}
          description={null}
          ontap={skeletonNoop}
        />
      {/each}
    </div>
  {:else if categoriesQuery.isError}
    <QueryError error={categoriesQuery.error} />
  {:else if sortedCategories.length === 0}
    <div class="empty-state" role="status">
      <p>{m.library_no_categories()}</p>
    </div>
  {:else}
    <div class="category-grid">
      {#each sortedCategories as cat (cat.id)}
        <CategoryCard
          name={cat.name}
          description={cat.description}
          ontap={() => handleCategoryTap(cat.id)}
        />
      {/each}
    </div>
  {/if}
</div>

<ShellPopover
  opened={sortOpen}
  target={sortAnchorEl}
  placement="bottom"
  ondismiss={() => {
    sortOpen = false;
  }}
>
  <KList nested role="listbox" aria-label={m.library_sort()}>
    {#each sortOptions as opt (opt.field)}
      {@const isSelected = currentSort === opt.field}
      <ListItem
        title={opt.label}
        role="option"
        aria-selected={isSelected}
        onclick={() => handleSortTap(opt.field)}
      />
    {/each}
  </KList>
</ShellPopover>

<style>
  .library-header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  .library-page {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
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

  :global(.sort-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .stats-row {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .stats-counts {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    font-size: var(--text-sm);
    color: var(--muted);
    flex-wrap: wrap;
  }

  .stat-item {
    white-space: nowrap;
  }

  .stat-more {
    opacity: 0.7;
  }

  .stats-sep {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--muted);
    opacity: 0.4;
    flex-shrink: 0;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--space-lg);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
    font-size: var(--text-base);
  }
</style>
