<!-- care-y-ignore no-hardcoded-user-strings -- aria-hidden attributes and InlineSkeleton width values are not user-facing text -->
<script lang="ts">
  import { Checkbox } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { loadMoreObserver } from "$lib/utils/load-more-observer.svelte.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import PriorityStamp from "$lib/components/PriorityStamp.svelte";
  import NewPill from "$lib/components/NewPill.svelte";
  import SortHeader from "$lib/components/shared/SortHeader.svelte";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { DisplayStatus } from "$lib/tickets/display-status.js";

  interface TicketRow {
    ticketId: string;
    displayStatus: DisplayStatus;
    priority: "low" | "normal" | "high" | "urgent";
    clientAlias: string;
    titleResult: DecryptResult;
    encryptedTitle?: unknown;
    queueName: string | null;
    assignedName: string | null;
    assignedIsSelf?: boolean;
    lastActivityAt: Date | null;
    createdAt: Date;
    followUpCount: number;
    unreadCount: number;
  }

  interface TicketTableProps {
    rows: TicketRow[];
    sortField?: string | null;
    sortDirection?: "asc" | "desc";
    onsortchange?: (field: string, direction: "asc" | "desc") => void;
    ontap: (ticketId: string) => void;
    onfullopen?: (ticketId: string) => void;
    multiSelectActive?: boolean;
    selectedIds?: ReadonlySet<string>;
    onselect?: (ticketId: string) => void;
    loading?: boolean;
    searchTerm?: string | null;
    activeId?: string | null;
    selectedTicketId?: string | null;
    onloadmore?: () => void;
    hasMore?: boolean;
    partialSort?: boolean;
    onloadall?: () => void;
    newRepliesFirst?: boolean;
  }

  let {
    rows,
    sortField = null,
    sortDirection = "desc",
    onsortchange,
    ontap,
    onfullopen,
    multiSelectActive = false,
    selectedIds,
    onselect,
    loading = false,
    searchTerm = null,
    activeId = null,
    selectedTicketId = null,
    onloadmore,
    hasMore = false,
    partialSort = false,
    onloadall,
    newRepliesFirst = false,
  }: TicketTableProps = $props();

  const columnHeaders = [
    {
      field: "status",
      className: "col-status",
      label: () => m.ticket_table_col_status(),
    },
    {
      field: "priority",
      className: "col-priority",
      label: () => m.ticket_table_col_priority(),
    },
    {
      field: "client",
      className: "col-client",
      label: () => m.ticket_table_col_client(),
    },
    {
      field: "title",
      className: "col-title",
      label: () => m.ticket_table_col_title(),
    },
    {
      field: "queue",
      className: "col-queue hide-medium",
      label: () => m.ticket_table_col_queue(),
    },
    {
      field: "assignee",
      className: "col-assignee hide-medium",
      label: () => m.ticket_table_col_assignee(),
    },
    {
      field: "last_activity",
      className: "col-activity hide-narrow",
      label: () => m.ticket_table_col_activity(),
    },
    {
      field: "msgs",
      className: "col-msgs hide-narrow",
      label: () => m.ticket_table_col_msgs(),
    },
  ] as const;

  function statusLabel(status: DisplayStatus): string {
    switch (status) {
      case "new":
        return m.tickets_status_new();
      case "active":
        return m.tickets_status_active();
      case "hold":
        return m.tickets_status_on_hold();
      case "closed":
        return m.tickets_status_closed();
    }
  }

  function handleHeaderClick(field: string): void {
    const nextDir =
      sortField === field
        ? sortDirection === "desc"
          ? "asc"
          : "desc"
        : "desc";
    onsortchange?.(field, nextDir);
  }

  function handleRowClick(ticketId: string): void {
    if (multiSelectActive) {
      onselect?.(ticketId);
    } else {
      ontap(ticketId);
    }
  }

  function handleRowDblClick(ticketId: string): void {
    if (!multiSelectActive) {
      onfullopen?.(ticketId);
    }
  }
</script>

<div class="data-table-wrap">
  {#if partialSort}
    <div class="partial-sort-hint">
      <span class="partial-sort-text">
        {m.ticket_table_partial_sort({ count: String(rows.length) })}
      </span>
      {#if onloadall}
        <button type="button" class="load-all-btn" onclick={onloadall}>
          {m.ticket_table_load_all()}
        </button>
      {/if}
    </div>
  {/if}
  <table class="data-table">
    <thead>
      <tr>
        {#if multiSelectActive}
          <th class="col-checkbox" scope="col">
            <span class="sr-only">{m.tickets_select_mode()}</span>
          </th>
        {/if}
        {#each columnHeaders as header (header.field)}
          <SortHeader
            class={header.className}
            label={header.label()}
            active={sortField === header.field}
            direction={sortDirection}
            onsort={() => handleHeaderClick(header.field)}
          />
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
            <td class="col-status"><InlineSkeleton width="1ch" /></td>
            <td class="col-priority"></td>
            <td class="col-client"><InlineSkeleton width="6ch" /></td>
            <td class="col-title"><InlineSkeleton width="16ch" /></td>
            <td class="col-queue hide-medium"><InlineSkeleton width="6ch" /></td
            >
            <td class="col-assignee hide-medium"
              ><InlineSkeleton width="6ch" /></td
            >
            <td class="col-activity hide-narrow"
              ><InlineSkeleton width="4ch" /></td
            >
            <td class="col-msgs hide-narrow"><InlineSkeleton width="2ch" /></td>
          </tr>
        {/each}
      {:else}
        <!-- Interactive rows keep implicit table-row semantics: tabindex plus
             Enter/Space activation (onKeyActivate), one action per row. The
             APG grid pattern (arrow-key cell navigation, aria-selected) is
             deliberately not implemented; tabbing row to row matches how the
             card list behaves and a grid would claim cell-level interaction
             the table does not have. -->
        {#each rows as row (row.ticketId)}
          {@const isSelected = selectedIds?.has(row.ticketId) ?? false}
          {@const isActive = activeId === row.ticketId}
          {@const isCurrentTicket = selectedTicketId === row.ticketId}
          {@const activityDate = row.lastActivityAt ?? row.createdAt}
          <tr
            id="ticket-{row.ticketId}"
            class="table-row search-target"
            class:match-active={isActive}
            class:row-current={isCurrentTicket}
            class:row-selected={isSelected}
            class:row-unread={row.unreadCount > 0}
            tabindex="0"
            aria-current={isActive || isCurrentTicket ? "true" : undefined}
            onclick={() => handleRowClick(row.ticketId)}
            ondblclick={() => handleRowDblClick(row.ticketId)}
            onkeydown={onKeyActivate(() => handleRowClick(row.ticketId))}
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
                    onchange={() => onselect?.(row.ticketId)}
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
            <td class="col-status">
              <span class="status-cell">
                <StatusMark
                  status={row.displayStatus}
                  unreadHighlight={newRepliesFirst && row.unreadCount > 0}
                />
                <span class="status-label show-wide"
                  >{statusLabel(row.displayStatus)}</span
                >
              </span>
            </td>
            <td class="col-priority">
              {#if row.priority !== "normal"}
                <PriorityStamp priority={row.priority} />
              {/if}
            </td>
            <td class="col-client cell-bold">
              {#if row.clientAlias}
                {row.clientAlias}
              {:else}
                <InlineSkeleton width="8ch" />
              {/if}
            </td>
            <td class="col-title cell-title">
              <DecryptPlaceholder
                result={row.titleResult}
                ciphertext={row.encryptedTitle}
                length={20}
                {searchTerm}
              />
            </td>
            <td class="col-queue hide-medium cell-muted">
              {#if row.queueName !== null}
                {row.queueName}
              {:else}
                <InlineSkeleton width="6ch" />
              {/if}
            </td>
            <td class="col-assignee hide-medium cell-muted">
              {#if row.assignedIsSelf}
                {m.ticket_meta_you()}
              {:else if row.assignedName !== null}
                {row.assignedName}
              {:else}
                <span class="unassigned-muted"></span>
              {/if}
            </td>
            <td class="col-activity cell-muted">
              {formatRelativeTime(activityDate)}
            </td>
            <td class="col-msgs hide-narrow cell-muted">
              {#if row.unreadCount > 0}
                <NewPill count={row.unreadCount} />
              {:else if row.followUpCount > 0}
                {row.followUpCount}
              {/if}
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
     shared.css as the .data-table classes; only the ticket columns and
     cells are styled here. Header cells render inside SortHeader, so
     th-specific column overrides go through :global anchored on the
     scoped table element. */

  /* ── Column sizing ── */
  .data-table :global(th.col-status),
  .data-table :global(th.col-priority) {
    padding: 0 var(--space-xs);
  }

  .data-table :global(th.col-msgs) {
    text-align: center;
  }

  .col-status {
    white-space: nowrap;
    padding: 0 var(--space-xs);
  }

  .status-cell {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .status-label {
    font-size: var(--text-xs);
    color: var(--muted);
    text-transform: capitalize;
  }

  .show-wide {
    display: none;
  }

  @media (min-width: 1024px) {
    .show-wide {
      display: inline;
    }
  }

  .col-priority {
    width: 2rem;
    padding: 0 var(--space-xs);
  }

  .col-client {
    white-space: nowrap;
  }

  .col-title {
    width: 40%;
  }

  .col-queue,
  .col-assignee {
    white-space: nowrap;
  }

  .col-activity {
    white-space: nowrap;
  }

  .col-msgs {
    width: 3rem;
    text-align: center;
  }

  /* ── Rows ── */
  .row-unread .col-title,
  .row-unread .col-client {
    font-weight: 700;
  }

  .cell-bold {
    font-weight: 600;
    color: var(--ink);
  }

  .cell-title {
    color: var(--ink);
  }

  .partial-sort-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    /* Vertical padding lives on .load-all-btn so the button owns a real
       >=24px box (WCAG 2.5.8). */
    padding: 0 var(--space-md);
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .load-all-btn {
    background: none;
    border: none;
    padding: var(--space-md) 0;
    font: inherit;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--brand-text);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
