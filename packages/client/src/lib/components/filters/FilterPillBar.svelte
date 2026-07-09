<script lang="ts">
  import {
    Button,
    Link,
    Icon,
    List,
    ListItem,
    ListInput,
    Checkbox,
  } from "konsta/svelte";
  import { Bookmark, Check } from "@lucide/svelte";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import FilterPill from "./FilterPill.svelte";
  import type { PillDefinition, FilterToggleConfig } from "./filter-types.js";

  interface Props {
    pills: PillDefinition[];
    activeCount: number;
    /** Client-side sort toggle rendered as the FIRST pill (no popover). */
    sortToggle?: FilterToggleConfig;
    /** Client-side membership filter rendered as the SECOND pill (no popover). */
    unreadFilter?: FilterToggleConfig;
    /** Date "from" value as YYYY-MM-DD string (for date pill) */
    dateFrom?: string;
    /** Date "to" value as YYYY-MM-DD string (for date pill) */
    dateTo?: string;
    /** Whether any date filter is active (controls date pill display label) */
    dateActive?: boolean;
    /** Display label for date pill when active (e.g., "Mar 1 - Mar 15") */
    dateLabel?: string;
    /** Called when a multi-select pill option is toggled */
    ontoggle: (pillId: string, value: string) => void;
    /** Called when a single-select pill option is picked */
    onselect: (pillId: string, value: string | null) => void;
    /** Called when date inputs change */
    ondatechange: (from: Date | null, to: Date | null) => void;
    /** Clear all filters */
    onclearall: () => void;
    /** Called when the create-shortcut button is tapped */
    oncreateshortcut?: () => void;
    // i18n label overrides (defaults to ticket-style labels from messages)
    filterLabel?: string;
    allLabel?: string;
    clearLabel?: string;
    createShortcutLabel?: string;
    dateFromLabel?: string;
    dateToLabel?: string;
    dateClearLabel?: string;
  }

  let {
    pills,
    activeCount,
    sortToggle,
    unreadFilter,
    dateFrom = "",
    dateTo = "",
    dateActive = false,
    dateLabel,
    ontoggle,
    onselect,
    ondatechange,
    onclearall,
    oncreateshortcut,
    filterLabel,
    allLabel,
    clearLabel,
    createShortcutLabel,
    dateFromLabel,
    dateToLabel,
    dateClearLabel,
  }: Props = $props();

  // Resolve i18n labels with fallback to ticket-style defaults.
  const resolvedFilterLabel = $derived(
    filterLabel ?? m.tickets_filter(withTerms()),
  );
  const resolvedAllLabel = $derived(allLabel ?? m.tickets_filter_all());
  const resolvedClearLabel = $derived(clearLabel ?? m.tickets_clear_filters());
  const resolvedCreateShortcutLabel = $derived(
    createShortcutLabel ?? m.tickets_create_shortcut(),
  );
  const resolvedDateFromLabel = $derived(
    dateFromLabel ?? m.tickets_filter_date_from(),
  );
  const resolvedDateToLabel = $derived(
    dateToLabel ?? m.tickets_filter_date_to(),
  );
  const resolvedDateClearLabel = $derived(
    dateClearLabel ?? m.tickets_filter_date_clear(),
  );

  // --- Shared Popover state ---

  let activePillId = $state<string | null>(null);
  let popoverTarget = $state<HTMLElement | undefined>(undefined);

  function openPill(id: string, anchor: HTMLElement): void {
    if (activePillId === id) {
      activePillId = null;
      return;
    }
    popoverTarget = anchor;
    activePillId = id;
  }

  function closePopover(): void {
    activePillId = null;
  }

  /** Named opener factory to avoid unsafe-argument lint in Svelte template bindings. */
  function makeOpener(id: string): (anchor: HTMLElement) => void {
    return (anchor: HTMLElement) => openPill(id, anchor);
  }

  // Resolve the active pill definition.
  const activePill = $derived(
    activePillId !== null
      ? (pills.find((p) => p.id === activePillId) ?? null)
      : null,
  );

  const activeOptions = $derived(activePill?.options ?? []);
  const activeMode = $derived(activePill?.mode ?? ("multi" as const));
  const activeSelected = $derived(
    activePill?.selected ??
      (new Set<string>() as ReadonlySet<string> | string | null),
  );
  const activeLabel = $derived(activePill?.label ?? "");
  const activeLoading = $derived(activePill?.loading ?? false);

  // --- Generic action handlers ---

  function handleMultiToggle(value: string): void {
    if (activePillId !== null) {
      ontoggle(activePillId, value);
    }
  }

  function handleSingleSelect(value: string | null | undefined): void {
    if (activePillId !== null) {
      onselect(activePillId, value ?? null);
    }
    closePopover();
  }

  function handleAllClick(): void {
    if (activeMode === "multi") {
      const sel = activeSelected;
      if (sel instanceof Set) {
        sel.forEach((v: string) => {
          handleMultiToggle(v);
        });
      }
    } else {
      handleSingleSelect(undefined);
    }
  }

  // Wrappers to avoid Svelte template `any` inference on {#each} loop variables.
  function onMultiItemClick(value: unknown): () => void {
    return () => handleMultiToggle(String(value));
  }
  function onSingleItemClick(value: unknown): () => void {
    return () => handleSingleSelect(String(value));
  }

  // --- Date range handlers ---

  function handleFromInput(e: Event): void {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    ondatechange(
      target.value !== "" ? new Date(target.value) : null,
      dateTo !== "" ? new Date(dateTo) : null,
    );
  }

  function handleToInput(e: Event): void {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    ondatechange(
      dateFrom !== "" ? new Date(dateFrom) : null,
      target.value !== "" ? new Date(target.value) : null,
    );
  }

  function handleDateClear(): void {
    ondatechange(null, null);
    closePopover();
  }
</script>

{#snippet togglePill(toggle: FilterToggleConfig)}
  <!-- Same pinned pill anatomy as FilterPill, minus the popover chrome:
       these are plain on/off switches for client-side list presentation. -->
  <button
    type="button"
    class="toggle-pill"
    class:on={toggle.active}
    aria-pressed={toggle.active}
    onclick={() => toggle.ontoggle()}
  >
    {toggle.label}
  </button>
{/snippet}

<div class="filter-pill-bar" role="toolbar" aria-label={resolvedFilterLabel}>
  {#if activeCount > 0 && oncreateshortcut}
    <Link
      iconOnly
      role="button"
      class="bookmark-link"
      aria-label={resolvedCreateShortcutLabel}
      onclick={() => oncreateshortcut()}
    >
      <Icon badge={String(activeCount)}><Bookmark size={18} /></Icon>
    </Link>
  {/if}

  <div class="pill-scroll">
    {#if sortToggle}
      {@render togglePill(sortToggle)}
    {/if}
    {#if unreadFilter}
      {@render togglePill(unreadFilter)}
    {/if}
    {#each pills as pill (pill.id)}
      <FilterPill
        label={pill.label}
        options={pill.options}
        mode={pill.mode === "date" ? "single" : pill.mode}
        selected={pill.mode === "date"
          ? dateActive
            ? (dateLabel ?? pill.label)
            : null
          : pill.selected}
        isOpen={activePillId === pill.id}
        onopen={makeOpener(pill.id)}
      />
    {/each}
  </div>

  {#if activeCount > 0}
    <Button clear small inline onclick={onclearall}>
      {resolvedClearLabel}
    </Button>
  {/if}
</div>

<!-- Shared Popover: rendered OUTSIDE .pill-scroll to avoid overflow clipping. -->
<ShellPopover
  opened={activePillId !== null}
  target={popoverTarget}
  placement="bottom"
  ariaLabel={activeLabel}
  ondismiss={closePopover}
>
  {#if activeMode === "date"}
    <List nested aria-label={activeLabel}>
      <ListInput
        label={resolvedDateFromLabel}
        type="date"
        value={dateFrom}
        max={dateTo || undefined}
        inputClass="text-base"
        onchange={handleFromInput}
      />
      <ListInput
        label={resolvedDateToLabel}
        type="date"
        value={dateTo}
        min={dateFrom || undefined}
        inputClass="text-base"
        onchange={handleToInput}
      />
      {#if dateActive}
        <ListItem
          title={resolvedDateClearLabel}
          class="filter-pill-all"
          onclick={handleDateClear}
        />
      {/if}
    </List>
  {:else if activeMode === "multi"}
    <div class="popover-scroll">
      <List nested role="group" aria-label={activeLabel}>
        <ListItem
          title={resolvedAllLabel}
          class="filter-pill-all"
          onclick={handleAllClick}
        />
        {#if activeLoading}
          <ListItem>
            {#snippet title()}
              <Skeleton lines={2} />
            {/snippet}
          </ListItem>
        {/if}
        {#each activeOptions as opt (opt.value)}
          {@const sel = activeSelected}
          {@const checked = sel instanceof Set && sel.has(opt.value)}
          <ListItem title={opt.label} onclick={onMultiItemClick(opt.value)}>
            {#snippet media()}
              <Checkbox {checked} onChange={onMultiItemClick(opt.value)} />
            {/snippet}
          </ListItem>
        {/each}
      </List>
    </div>
  {:else}
    <div class="popover-scroll">
      <List nested aria-label={activeLabel}>
        <ListItem
          title={resolvedAllLabel}
          aria-current={activeSelected === null ? "true" : undefined}
          class="filter-pill-all"
          onclick={handleAllClick}
        >
          {#snippet after()}
            {#if activeSelected === null}
              <Check size={16} class="text-primary" aria-hidden="true" />
            {/if}
          {/snippet}
        </ListItem>
        {#each activeOptions as opt (opt.value)}
          {@const isSelected =
            typeof activeSelected === "string" && activeSelected === opt.value}
          <ListItem
            title={opt.label}
            aria-current={isSelected ? "true" : undefined}
            onclick={onSingleItemClick(opt.value)}
          >
            {#snippet after()}
              {#if isSelected}
                <Check size={16} class="text-primary" aria-hidden="true" />
              {/if}
            {/snippet}
          </ListItem>
        {/each}
      </List>
    </div>
  {/if}
</ShellPopover>

<style>
  .filter-pill-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
  }

  .pill-scroll {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    flex: 1;
    min-width: 0;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 0;
  }

  .pill-scroll::-webkit-scrollbar {
    display: none;
  }

  .toggle-pill {
    flex-shrink: 0;
    padding: 6px 12px;
    border: 1px solid var(--hair-2);
    border-radius: 999px;
    background: transparent;
    font: inherit;
    font-size: var(--text-sm);
    color: var(--ink-2);
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  @media (prefers-reduced-motion: no-preference) {
    .toggle-pill {
      transition: border-color 150ms ease;
    }
  }

  .toggle-pill.on {
    border-color: var(--brand-text);
    color: var(--brand-text);
    font-weight: 700;
  }

  @media (prefers-contrast: more) {
    .toggle-pill {
      background: Canvas;
      border-color: CanvasText;
      color: CanvasText;
    }

    .toggle-pill.on {
      background: CanvasText;
      border-color: CanvasText;
      color: Canvas;
    }
  }

  :global(.bookmark-link) {
    flex-shrink: 0;
  }

  .popover-scroll {
    max-height: 50vh;
    overflow-y: auto;
  }

  :global(.filter-pill-all) {
    border-bottom: 1px solid var(--surface-1, rgba(0, 0, 0, 0.08));
    font-weight: 500;
  }
</style>
