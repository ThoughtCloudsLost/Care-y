<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import {
    Badge,
    Button,
    Link,
    List,
    ListItem,
    ListInput,
    Checkbox,
  } from "konsta/svelte";
  import { Bookmark, Check, SquareCheckBig } from "@lucide/svelte";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { filterStore } from "$lib/stores/filters.svelte.js";
  import type { FilterStatus } from "$lib/stores/filters.svelte.js";
  import { ticketPrioritySchema } from "@care-y/shared";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import FilterPill from "./FilterPill.svelte";
  import type { FilterOption } from "./FilterPill.svelte";

  const orgDecrypt = getOrgDecryptCache();

  type PillId = "status" | "queue" | "priority" | "assignee" | "date";

  interface Props {
    currentUserId?: string;
    oncreateshortcut?: () => void;
    onenterselect?: () => void;
  }

  let { currentUserId, oncreateshortcut, onenterselect }: Props = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const queuesQuery = createQuery(() => ({
    queryKey: ["tickets", "myQueues"],
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  const countsQuery = createQuery(() => ({
    queryKey: ["tickets", "counts"],
    queryFn: async () => ticketRouter.counts.query(),
  }));

  // --- Pill option configs ---

  const c = $derived(countsQuery.data);

  const statusOptions = $derived([
    {
      value: "new",
      label: `${m.tickets_filter_new()} (${String(c?.new ?? 0)})`,
    },
    {
      value: "active",
      label: `${m.tickets_filter_active()} (${String(c?.active ?? 0)})`,
    },
    {
      value: "hold",
      label: `${m.tickets_filter_hold()} (${String(c?.onHold ?? 0)})`,
    },
    {
      value: "closed",
      label: `${m.tickets_filter_closed()} (${String(c?.closed ?? 0)})`,
    },
  ]);

  const bp = $derived(c?.byPriority);

  const priorityOptions = $derived([
    {
      value: "low",
      label: `${m.tickets_filter_priority_low()} (${String(bp?.low ?? 0)})`,
    },
    {
      value: "normal",
      label: `${m.tickets_filter_priority_normal()} (${String(bp?.normal ?? 0)})`,
    },
    {
      value: "high",
      label: `${m.tickets_filter_priority_high()} (${String(bp?.high ?? 0)})`,
    },
    {
      value: "urgent",
      label: `${m.tickets_filter_priority_urgent()} (${String(bp?.urgent ?? 0)})`,
    },
  ]);

  const queueOptions = $derived(
    (queuesQuery.data ?? []).map((q) => ({
      value: q.id,
      label: `${orgDecrypt.decrypt(`queue:${q.id}`, q.encrypted_name) ?? "..."} (${q.openCount})`,
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
      case "assignee": {
        const opts: FilterOption[] = [];
        if (currentUserId !== undefined) {
          opts.push({
            value: currentUserId,
            label: `${m.tickets_filter_me()} (${String(c?.mine ?? 0)})`,
          });
        }
        opts.push({
          value: "__unassigned__",
          label: `${m.tickets_unassigned()} (${String(c?.unassigned ?? 0)})`,
        });
        return opts;
      }
      case "date":
      case null:
        return [];
    }
  });

  const activeMode = $derived<"multi" | "single" | "date">(
    activePill === "date"
      ? "date"
      : activePill === "assignee"
        ? "single"
        : "multi",
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
          if (filterStore.assigneeId === null) return "__unassigned__";
          return filterStore.assigneeId ?? null;
        case "date":
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
      case "date":
        return m.tickets_filter_date_range();
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
      case "date":
      case null:
        break;
    }
  }

  function handleSingleSelect(value: string | null | undefined): void {
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
      // Clear filter: undefined = no filter applied
      handleSingleSelect(undefined);
    }
  }

  // Wrappers to avoid Svelte template `any` inference on {#each} loop variables.
  // The `unknown` parameter is because Svelte's type system loses FilterOption
  // type information inside {#each} blocks over $derived arrays.
  function onMultiItemClick(value: unknown): () => void {
    return () => handleMultiToggle(String(value));
  }
  function onSingleItemClick(value: unknown): () => void {
    return () => {
      const v = String(value);
      // Map the internal unassigned key back to null for the store
      handleSingleSelect(v === "__unassigned__" ? null : v);
    };
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

  // Date input values as YYYY-MM-DD strings for native <input type="date">.
  const fromStr = $derived(
    filterStore.dateFrom !== null
      ? filterStore.dateFrom.toISOString().slice(0, 10)
      : "",
  );
  const toStr = $derived(
    filterStore.dateTo !== null
      ? filterStore.dateTo.toISOString().slice(0, 10)
      : "",
  );

  function handleFromInput(e: Event): void {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    filterStore.setDateRange(
      target.value !== "" ? new Date(target.value) : null,
      filterStore.dateTo,
    );
  }

  function handleToInput(e: Event): void {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    filterStore.setDateRange(
      filterStore.dateFrom,
      target.value !== "" ? new Date(target.value) : null,
    );
  }

  function handleDateClear(): void {
    filterStore.setDateRange(null, null);
    closePopover();
  }

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
  function openDate(el: HTMLElement): void {
    openPill("date", el);
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
      options={[{ value: "__unassigned__", label: m.tickets_unassigned() }]}
      mode="single"
      selected={filterStore.assigneeId === null
        ? "__unassigned__"
        : (filterStore.assigneeId ?? null)}
      isOpen={activePill === "assignee"}
      onopen={openAssignee}
    />
    <FilterPill
      label={m.tickets_filter_date_range()}
      options={[]}
      mode="single"
      selected={dateRangeActive ? dateRangeLabel : null}
      isOpen={activePill === "date"}
      onopen={openDate}
    />
  </div>

  <div class="pill-actions">
    <Button
      outline
      rounded
      small
      inline
      onclick={() => onenterselect?.()}
      class="select-mode-btn"
    >
      <SquareCheckBig size={16} aria-hidden="true" />
      <span class="select-label">{m.tickets_select_mode()}</span>
    </Button>
    {#if activeFilterCount > 0}
      <Badge class="filter-badge">{activeFilterCount}</Badge>
      <Link
        iconOnly
        role="button"
        aria-label={m.tickets_create_shortcut()}
        onclick={() => oncreateshortcut?.()}
        class="p-1"
      >
        <Bookmark size={18} />
      </Link>
      <Button clear small inline onclick={() => filterStore.clearAll()}>
        {m.tickets_clear_filters()}
      </Button>
    {/if}
  </div>
</div>

<!-- Shared Popover: rendered OUTSIDE .pill-scroll to avoid overflow clipping. -->
<ShellPopover
  opened={activePill !== null}
  target={popoverTarget}
  placement="bottom"
  ondismiss={closePopover}
>
  {#if activeMode === "date"}
    <List nested aria-label={activeLabel}>
      <ListInput
        label={m.tickets_filter_date_from()}
        type="date"
        value={fromStr}
        max={toStr || undefined}
        inputClass="text-base"
        onchange={handleFromInput}
      />
      <ListInput
        label={m.tickets_filter_date_to()}
        type="date"
        value={toStr}
        min={fromStr || undefined}
        inputClass="text-base"
        onchange={handleToInput}
      />
      {#if dateRangeActive}
        <ListItem
          title={m.tickets_filter_date_clear()}
          class="filter-pill-all"
          onclick={handleDateClear}
        />
      {/if}
    </List>
  {:else if activeMode === "multi"}
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

  :global(.select-mode-btn) {
    flex-shrink: 0;
  }

  .select-label {
    line-height: 1;
  }

  :global(.filter-pill-all) {
    border-top: 1px solid var(--surface-1, rgba(0, 0, 0, 0.08));
    font-weight: 500;
  }
</style>
