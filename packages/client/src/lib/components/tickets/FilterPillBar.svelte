<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { Badge, List, ListItem, Checkbox } from "konsta/svelte";
  import { Bookmark, Check, SquareCheckBig } from "@lucide/svelte";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { filterStore } from "$lib/stores/filters.svelte.js";
  import type { FilterStatus } from "$lib/stores/filters.svelte.js";
  import { ticketPrioritySchema } from "@care-y/shared";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import FilterPill from "./FilterPill.svelte";
  import type { FilterOption } from "./FilterPill.svelte";

  type PillId = "status" | "queue" | "priority" | "assignee";

  interface Props {
    oncreateshortcut?: () => void;
    onenterselect?: () => void;
  }

  let { oncreateshortcut, onenterselect }: Props = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const queuesQuery = createQuery(() => ({
    queryKey: ["tickets", "myQueues"],
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  // --- Pill option configs ---

  const statusOptions: FilterOption[] = [
    { value: "new", label: m.tickets_filter_new() },
    { value: "active", label: m.tickets_filter_active() },
    { value: "hold", label: m.tickets_filter_hold() },
    { value: "closed", label: m.tickets_filter_closed() },
  ];

  const priorityOptions: FilterOption[] = [
    { value: "low", label: m.tickets_filter_priority_low() },
    { value: "normal", label: m.tickets_filter_priority_normal() },
    { value: "high", label: m.tickets_filter_priority_high() },
    { value: "urgent", label: m.tickets_filter_priority_urgent() },
  ];

  const queueOptions = $derived(
    (queuesQuery.data ?? []).map((q) => ({
      value: q.id,
      label: q.name,
    })),
  );

  const activeFilterCount = $derived(filterStore.activeCount);

  // --- Shared Popover state ---

  let activePill = $state<PillId | null>(null);
  let popoverTarget = $state<HTMLElement | undefined>(undefined);

  function openPill(id: PillId, anchor: HTMLElement): void {
    if (activePill === id) {
      activePill = null;
      return;
    }
    popoverTarget = anchor;
    activePill = id;
  }

  function closePopover(): void {
    activePill = null;
  }

  // Resolve options and selected state for the active pill.
  const activeOptions = $derived.by((): FilterOption[] => {
    switch (activePill) {
      case "status":
        return statusOptions;
      case "queue":
        return queueOptions;
      case "priority":
        return priorityOptions;
      case "assignee":
      case null:
        return [];
    }
  });

  const activeMode = $derived<"multi" | "single">(
    activePill === "assignee" ? "single" : "multi",
  );

  const activeSelected = $derived.by(
    (): ReadonlySet<string> | string | null => {
      switch (activePill) {
        case "status":
          return filterStore.statuses;
        case "queue":
          return filterStore.queueIds;
        case "priority":
          return filterStore.priorities;
        case "assignee":
          return filterStore.assigneeId;
        case null:
          return new Set<string>();
      }
    },
  );

  const activeLabel = $derived.by(() => {
    switch (activePill) {
      case "status":
        return m.tickets_filter_status();
      case "queue":
        return m.tickets_filter_queue();
      case "priority":
        return m.tickets_filter_priority();
      case "assignee":
        return m.tickets_filter_assignee();
      case null:
        return "";
    }
  });

  // --- Filter action handlers ---

  const validStatuses: ReadonlySet<FilterStatus> = new Set<FilterStatus>([
    "new",
    "active",
    "hold",
    "closed",
  ]);

  function isFilterStatus(v: string): v is FilterStatus {
    return (validStatuses as ReadonlySet<string>).has(v);
  }

  function handleMultiToggle(value: string): void {
    switch (activePill) {
      case "status":
        if (isFilterStatus(value)) filterStore.toggleStatus(value);
        break;
      case "queue":
        filterStore.toggleQueue(value);
        break;
      case "priority": {
        const parsed = ticketPrioritySchema.safeParse(value);
        if (parsed.success) filterStore.togglePriority(parsed.data);
        break;
      }
      case "assignee":
      case null:
        break;
    }
  }

  function handleSingleSelect(value: string | null): void {
    if (activePill === "assignee") {
      filterStore.setAssignee(value);
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
      handleSingleSelect(null);
    }
  }

  // Wrappers to avoid Svelte template `any` inference on {#each} loop variables.
  // The `unknown` parameter is because Svelte's type system loses FilterOption
  // type information inside {#each} blocks over $derived arrays.
  function onMultiItemClick(value: unknown): () => void {
    return () => handleMultiToggle(String(value));
  }
  function onSingleItemClick(value: unknown): () => void {
    return () => handleSingleSelect(String(value));
  }

  // --- Date range display ---

  const dateRangeLabel = $derived.by(() => {
    const from = filterStore.dateFrom;
    const to = filterStore.dateTo;
    if (from === null && to === null) {
      return m.tickets_filter_date_range();
    }
    if (from !== null && to !== null) {
      return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
    }
    if (from !== null)
      return `${m.tickets_filter_date_from()} ${from.toLocaleDateString()}`;
    if (to !== null)
      return `${m.tickets_filter_date_to()} ${to.toLocaleDateString()}`;
    return m.tickets_filter_date_range();
  });

  const dateRangeActive = $derived(
    filterStore.dateFrom !== null || filterStore.dateTo !== null,
  );

  // Named open handlers to avoid unsafe-argument lint errors from template bindings.
  function openStatus(el: HTMLElement): void {
    openPill("status", el);
  }
  function openQueue(el: HTMLElement): void {
    openPill("queue", el);
  }
  function openPriority(el: HTMLElement): void {
    openPill("priority", el);
  }
  function openAssignee(el: HTMLElement): void {
    openPill("assignee", el);
  }
</script>

<div class="filter-pill-bar" role="toolbar" aria-label={m.tickets_filter()}>
  <div class="pill-scroll">
    <FilterPill
      label={m.tickets_filter_status()}
      options={statusOptions}
      mode="multi"
      selected={filterStore.statuses}
      isOpen={activePill === "status"}
      onopen={openStatus}
    />
    <FilterPill
      label={m.tickets_filter_queue()}
      options={queueOptions}
      mode="multi"
      selected={filterStore.queueIds}
      isOpen={activePill === "queue"}
      onopen={openQueue}
    />
    <FilterPill
      label={m.tickets_filter_priority()}
      options={priorityOptions}
      mode="multi"
      selected={filterStore.priorities}
      isOpen={activePill === "priority"}
      onopen={openPriority}
    />
    <FilterPill
      label={m.tickets_filter_assignee()}
      options={[]}
      mode="single"
      selected={filterStore.assigneeId}
      isOpen={activePill === "assignee"}
      onopen={openAssignee}
    />
    <button
      class="date-pill"
      class:date-pill--active={dateRangeActive}
      aria-label={m.tickets_filter_date_range()}
    >
      {dateRangeActive ? dateRangeLabel : m.tickets_filter_date_range()}
    </button>
  </div>

  <div class="pill-actions">
    <button
      class="select-mode-btn"
      aria-label={m.tickets_select_mode()}
      onclick={() => onenterselect?.()}
    >
      <SquareCheckBig size={16} aria-hidden="true" />
      <span class="select-label">{m.tickets_select_mode()}</span>
    </button>
    {#if activeFilterCount > 0}
      <Badge class="filter-badge">{activeFilterCount}</Badge>
      <button
        class="create-shortcut-btn"
        aria-label={m.tickets_create_shortcut()}
        onclick={() => oncreateshortcut?.()}
      >
        <Bookmark size={18} />
      </button>
      <button class="clear-filters-btn" onclick={() => filterStore.clearAll()}>
        {m.tickets_clear_filters()}
      </button>
    {/if}
  </div>
</div>

<!-- Shared Popover: rendered OUTSIDE .pill-scroll to avoid overflow clipping. -->
<ShellPopover
  opened={activePill !== null}
  target={popoverTarget}
  ondismiss={closePopover}
>
  {#if activeMode === "multi"}
    <List nested role="group" aria-label={activeLabel}>
      {#each activeOptions as opt (opt.value)}
        {@const sel = activeSelected}
        {@const checked = sel instanceof Set && sel.has(opt.value)}
        <ListItem title={opt.label} onclick={onMultiItemClick(opt.value)}>
          {#snippet media()}
            <Checkbox {checked} onChange={onMultiItemClick(opt.value)} />
          {/snippet}
        </ListItem>
      {/each}
      <ListItem
        title={m.tickets_filter_all()}
        class="filter-pill-all"
        onclick={handleAllClick}
      />
    </List>
  {:else}
    <List nested role="listbox" aria-label={activeLabel}>
      {#each activeOptions as opt (opt.value)}
        {@const isSelected =
          typeof activeSelected === "string" && activeSelected === opt.value}
        <ListItem
          title={opt.label}
          role="option"
          aria-selected={isSelected}
          onclick={onSingleItemClick(opt.value)}
        >
          {#snippet after()}
            {#if isSelected}
              <Check size={16} class="text-primary" aria-hidden="true" />
            {/if}
          {/snippet}
        </ListItem>
      {/each}
      <ListItem
        title={m.tickets_filter_all()}
        role="option"
        aria-selected={activeSelected === null}
        class="filter-pill-all"
        onclick={handleAllClick}
      >
        {#snippet after()}
          {#if activeSelected === null}
            <Check size={16} class="text-primary" aria-hidden="true" />
          {/if}
        {/snippet}
      </ListItem>
    </List>
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
    padding: 2px 0;
  }

  .pill-scroll::-webkit-scrollbar {
    display: none;
  }

  .pill-actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  :global(.filter-badge) {
    font-size: 0.6875rem !important;
    min-width: 1.125rem;
    height: 1.125rem;
    line-height: 1.125rem;
  }

  .create-shortcut-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: none;
    color: var(--ink);
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 150ms ease;
  }

  .create-shortcut-btn:hover {
    background-color: var(--surface-1, rgba(0, 0, 0, 0.06));
  }

  .clear-filters-btn {
    border: none;
    background: none;
    color: var(--brand-text, var(--ink));
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 150ms ease;
  }

  .clear-filters-btn:hover {
    background-color: var(--surface-1, rgba(0, 0, 0, 0.06));
  }

  .date-pill {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 10px;
    border: 1px solid var(--surface-1, rgba(0, 0, 0, 0.15));
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition:
      background-color 150ms ease,
      border-color 150ms ease;
  }

  .date-pill--active {
    background-color: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  .select-mode-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 4px 8px;
    border: 1px solid var(--surface-1, rgba(0, 0, 0, 0.15));
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 150ms ease;
  }

  .select-mode-btn:hover {
    background-color: var(--surface-1, rgba(0, 0, 0, 0.06));
  }

  .select-label {
    line-height: 1;
  }

  :global(.filter-pill-all) {
    border-top: 1px solid var(--surface-1, rgba(0, 0, 0, 0.08));
    font-weight: 500;
  }
</style>
