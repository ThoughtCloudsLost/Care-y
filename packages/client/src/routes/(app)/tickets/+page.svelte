<script lang="ts">
  import {
    Card,
    Chip,
    Segmented,
    SegmentedButton,
    BlockTitle,
  } from "konsta/svelte";
  import { List, LayoutGrid } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  type TicketStatus = "new" | "active" | "hold" | "closed";

  interface MockTicket {
    id: string;
    alias: string;
    summary: string;
    status: TicketStatus;
    priority: "urgent" | "normal" | "low";
    assignee: string | null;
    updatedAt: string;
    category: string;
  }

  const MOCK_TICKETS: MockTicket[] = [
    {
      id: "t-001",
      alias: "Sparrow",
      summary:
        "Needs guidance on documentation requirements. Has appointment Friday.",
      status: "new",
      priority: "urgent",
      assignee: null,
      updatedAt: "2m ago",
      category: "intake",
    },
    {
      id: "t-002",
      alias: "Wren",
      summary: "Follow-up call scheduled. Waiting on resource availability.",
      status: "active",
      priority: "normal",
      assignee: "JN",
      updatedAt: "15m ago",
      category: "follow-up",
    },
    {
      id: "t-003",
      alias: "Finch",
      summary: "Referred to partner org. Pending confirmation of transfer.",
      status: "hold",
      priority: "normal",
      assignee: "JN",
      updatedAt: "1h ago",
      category: "referral",
    },
    {
      id: "t-004",
      alias: "Robin",
      summary:
        "Initial call completed. Needs housing resources and legal referral.",
      status: "active",
      priority: "urgent",
      assignee: "AK",
      updatedAt: "2h ago",
      category: "intake",
    },
    {
      id: "t-005",
      alias: "Dove",
      summary: "Case resolved. All resources provided, follow-up complete.",
      status: "closed",
      priority: "low",
      assignee: "JN",
      updatedAt: "1d ago",
      category: "resolved",
    },
    {
      id: "t-006",
      alias: "Lark",
      summary: "Voicemail left. Attempting second contact.",
      status: "active",
      priority: "normal",
      assignee: null,
      updatedAt: "3h ago",
      category: "follow-up",
    },
    {
      id: "t-007",
      alias: "Swift",
      summary: "Emergency request. Immediate safety concerns reported.",
      status: "new",
      priority: "urgent",
      assignee: null,
      updatedAt: "Just now",
      category: "emergency",
    },
  ];

  type FilterId = "all" | TicketStatus;

  interface FilterDef {
    id: FilterId;
    label: () => string;
    count: number;
  }

  const filters: FilterDef[] = [
    {
      id: "all",
      label: () => m.tickets_filter_all(),
      count: MOCK_TICKETS.length,
    },
    {
      id: "new",
      label: () => m.tickets_filter_new(),
      count: MOCK_TICKETS.filter((t) => t.status === "new").length,
    },
    {
      id: "active",
      label: () => m.tickets_filter_active(),
      count: MOCK_TICKETS.filter((t) => t.status === "active").length,
    },
    {
      id: "hold",
      label: () => m.tickets_filter_hold(),
      count: MOCK_TICKETS.filter((t) => t.status === "hold").length,
    },
    {
      id: "closed",
      label: () => m.tickets_filter_closed(),
      count: MOCK_TICKETS.filter((t) => t.status === "closed").length,
    },
  ];

  let activeFilter: FilterId = $state("all");
  let viewMode: "list" | "grid" = $state("list");

  function handleFilterKeydown(event: KeyboardEvent): void {
    const ids = filters.map((f) => f.id);
    const idx = ids.indexOf(activeFilter);
    if (idx === -1) return;

    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (idx + 1) % ids.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (idx - 1 + ids.length) % ids.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = ids.length - 1;
    }

    if (next != null) {
      event.preventDefault();
      const nextId = ids.at(next);
      if (nextId != null) {
        activeFilter = nextId;
        const container = event.currentTarget;
        if (container instanceof HTMLElement) {
          const tabs = Array.from(
            container.querySelectorAll<HTMLElement>('[role="tab"]'),
          );
          tabs.at(next)?.focus();
        }
      }
    }
  }

  const filteredTickets = $derived(
    activeFilter === "all"
      ? MOCK_TICKETS
      : MOCK_TICKETS.filter((t) => t.status === activeFilter),
  );

  function statusLabel(status: TicketStatus): string {
    switch (status) {
      case "new":
        return m.tickets_filter_new();
      case "active":
        return m.tickets_filter_active();
      case "hold":
        return m.tickets_filter_hold();
      case "closed":
        return m.tickets_filter_closed();
    }
  }

  function priorityColor(priority: MockTicket["priority"]): string {
    if (priority === "urgent") return "var(--brand-text)";
    if (priority === "low") return "var(--muted)";
    return "var(--ink)";
  }
</script>

<div class="queue-page">
  <div class="queue-header">
    <BlockTitle large class="!m-0 !pl-0">{m.tickets_title()}</BlockTitle>
    <div class="stats-row">
      <span
        >&#9679; {MOCK_TICKETS.filter((t) => t.status === "new").length}
        {m.tickets_status_new()}</span
      >
      <span
        >&#8594; {MOCK_TICKETS.filter((t) => t.status === "active").length}
        {m.tickets_status_active()}</span
      >
      <span
        >&#9673; {MOCK_TICKETS.filter((t) => t.status === "hold").length}
        {m.tickets_status_on_hold()}</span
      >
    </div>
  </div>

  <div class="queue-controls">
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
      class="filter-bar"
      role="tablist"
      aria-label={m.tickets_filter()}
      onkeydown={handleFilterKeydown}
    >
      {#each filters as filter (filter.id)}
        <Chip
          outline={activeFilter !== filter.id}
          class="filter-chip"
          role="tab"
          tabindex={activeFilter === filter.id ? 0 : -1}
          aria-selected={activeFilter === filter.id}
          onclick={() => (activeFilter = filter.id)}
        >
          {filter.label()}
          {filter.count}
        </Chip>
      {/each}
    </div>
    <Segmented strong class="view-toggle">
      <SegmentedButton
        active={viewMode === "list"}
        aria-pressed={viewMode === "list"}
        aria-label={m.tickets_view_list()}
        onclick={() => (viewMode = "list")}
        ><List size={16} aria-hidden="true" /></SegmentedButton
      >
      <SegmentedButton
        active={viewMode === "grid"}
        aria-pressed={viewMode === "grid"}
        aria-label={m.tickets_view_grid()}
        onclick={() => (viewMode = "grid")}
        ><LayoutGrid size={16} aria-hidden="true" /></SegmentedButton
      >
    </Segmented>
  </div>

  <div class="ticket-list" class:grid-view={viewMode === "grid"}>
    {#each filteredTickets as ticket (ticket.id)}
      <Card
        raised
        contentWrap={false}
        component="button"
        aria-label={m.tickets_open({ alias: ticket.alias })}
        class="card-elevated touch-feedback !m-0 !mx-0"
      >
        <div class="card-inner">
          <div class="card-header-row">
            <span class="status-badge">
              <span class="status-dot" data-status={ticket.status}></span>
              {statusLabel(ticket.status)}
            </span>
            <span class="card-header-right">
              {#if ticket.assignee}<span class="card-meta"
                  >{ticket.assignee}</span
                >{/if}
              <span class="card-meta">{ticket.updatedAt}</span>
            </span>
          </div>
          <div class="card-title">{ticket.alias}</div>
          <div class="card-body-text">{ticket.summary}</div>
          <div class="card-footer-row">
            <Chip
              outline
              class="card-chip !m-0"
              style="color: {priorityColor(ticket.priority)}"
              >{ticket.priority}</Chip
            >
            <Chip outline class="card-chip !m-0">{ticket.category}</Chip>
          </div>
        </div>
      </Card>
    {/each}
  </div>

  {#if filteredTickets.length === 0}
    <div class="empty-state">
      <p>{m.tickets_empty_filter()}</p>
    </div>
  {/if}
</div>

<style>
  .queue-page {
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .queue-header {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .stats-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .stats-row span {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .queue-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .filter-bar::-webkit-scrollbar {
    display: none;
  }

  :global(.filter-chip) {
    cursor: pointer;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }

  :global(.card-chip) {
    height: 1.25rem !important;
    font-size: 0.6875rem !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
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

  .ticket-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .ticket-list.grid-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .card-inner {
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    text-align: left;
  }

  .card-header-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .card-header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .card-title {
    font-weight: 600;
    font-size: 0.9375rem;
    line-height: 1.3;
    color: var(--ink);
  }

  .card-body-text {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .card-meta {
    font-size: 0.6875rem;
    color: var(--muted);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 500;
  }

  .status-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot[data-status="new"] {
    background: #34c759;
  }

  .status-dot[data-status="active"] {
    background: var(--brand-text);
  }

  .status-dot[data-status="hold"] {
    background: #ff9500;
  }

  .status-dot[data-status="closed"] {
    background: var(--muted);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
    font-size: 0.875rem;
  }
</style>
