<!-- care-y-ignore no-hardcoded-user-strings -- aria-hidden attributes and InlineSkeleton width values are not user-facing text -->
<script lang="ts">
  import { untrack } from "svelte";
  import { Checkbox } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { loadMoreObserver } from "$lib/utils/load-more-observer.svelte.js";
  import { computeTableWindow } from "./ticket-table-window.js";
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
    /**
     * Vertical scroll container the table lives in; providing it enables
     * row windowing at large row counts. Preview tables (dashboard) omit
     * it and always render flat.
     */
    scrollContainer?: HTMLElement;
    /** Row count before switching from flat to windowed rendering. */
    virtualizeThreshold?: number;
    /** Extra rows rendered beyond each edge of the visible range. */
    overscan?: number;
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
    scrollContainer,
    virtualizeThreshold = 200,
    overscan = 6,
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

  // ── Row windowing ──
  // The full flat render degrades at load-all sizes, so past the threshold
  // only rows near the viewport render; presentational gap rows carry the
  // remaining height so scroll geometry, the sticky header, and the sentinel
  // position stay exact (math in ticket-table-window.ts). Below the
  // threshold, or without a scroll container, the flat markup is unchanged.
  // Rows are uniform height by construction (.data-table td forces a single
  // nowrap line), so one measured pitch positions everything; 44 covers the
  // frame before the first measurement.
  const ESTIMATED_ROW_PITCH = 44;

  // Initial value deliberately captures the mount-time props (untracked):
  // a table remounted with a large cached list must start windowed instead
  // of building the full flat DOM once. The flip effect keeps it in sync.
  let windowed = $state(
    untrack(
      () =>
        scrollContainer !== undefined &&
        rows.length >= virtualizeThreshold &&
        !loading,
    ),
  );
  let scrollTop = $state(0);
  let viewportHeight = $state(0);
  let tbodyOffsetTop = $state(0);
  let measuredPitch = $state(0);
  // Focused row kept rendered while it sits outside the window, so scrolling
  // away from it never drops keyboard focus to body (tab order contract).
  let focusedRowId = $state<string | null>(null);
  // Column min-width pins captured when windowing engages: auto table layout
  // derives column widths from rendered cells only, so without pins the
  // columns would resize as rows window in and out during scroll. Cleared on
  // large container resizes (the old widths no longer apply).
  let colPinStyle = $state("");
  let tableEl = $state<HTMLTableElement | undefined>();
  let tbodyEl = $state<HTMLTableSectionElement | undefined>();

  const pitch = $derived(
    measuredPitch > 0 ? measuredPitch : ESTIMATED_ROW_PITCH,
  );
  const shouldWindow = $derived(
    scrollContainer !== undefined &&
      rows.length >= virtualizeThreshold &&
      !loading,
  );
  const colCount = $derived(columnHeaders.length + (multiSelectActive ? 1 : 0));

  function measureTbodyOffset(): void {
    if (!tbodyEl || !scrollContainer) return;
    const tbodyTop = tbodyEl.getBoundingClientRect().top;
    const scrollerTop = scrollContainer.getBoundingClientRect().top;
    tbodyOffsetTop = tbodyTop - scrollerTop + scrollContainer.scrollTop;
  }

  function measureRowPitch(): void {
    if (!tbodyEl) return;
    const first = tbodyEl.querySelector<HTMLTableRowElement>("tr.table-row");
    if (!first) return;
    const next = first.nextElementSibling;
    if (next instanceof HTMLTableRowElement && next.matches(".table-row")) {
      const delta =
        next.getBoundingClientRect().top - first.getBoundingClientRect().top;
      if (delta > 0) {
        measuredPitch = delta;
        return;
      }
    }
    const height = first.getBoundingClientRect().height;
    if (height > 0) measuredPitch = height;
  }

  function pinColumnWidths(): void {
    if (!tableEl) return;
    const parts: string[] = [];
    for (const th of tableEl.querySelectorAll<HTMLTableCellElement>(
      "thead th",
    )) {
      const colClass = Array.from(th.classList).find((c) =>
        c.startsWith("col-"),
      );
      if (colClass === undefined) continue;
      const width = th.getBoundingClientRect().width;
      if (width > 0) {
        parts.push(
          `--colw-${colClass.slice(4)}: ${String(Math.ceil(width))}px`,
        );
      }
    }
    colPinStyle = parts.join("; ");
  }

  // Flat-to-windowed flip: measure while the flat DOM (all rows rendered)
  // still exists, so the pitch comes from adjacent real rows and the column
  // pins from the full flat sample.
  $effect(() => {
    if (shouldWindow === windowed) return;
    if (shouldWindow) {
      measureRowPitch();
      measureTbodyOffset();
      pinColumnWidths();
    } else {
      colPinStyle = "";
      focusedRowId = null;
    }
    windowed = shouldWindow;
  });

  // Scroll tracking with rAF coalescing, plus mount-time measurements for
  // the windowed-at-mount path (list already past the threshold on first
  // render; the flip effect never fires then).
  $effect(() => {
    if (!windowed || !scrollContainer) return;
    const el = scrollContainer;
    untrack(() => {
      measureTbodyOffset();
      if (measuredPitch === 0) measureRowPitch();
      if (colPinStyle === "") pinColumnWidths();
    });
    let rafId = 0;
    let scheduled = false;
    const flush = (): void => {
      scheduled = false;
      scrollTop = el.scrollTop;
      viewportHeight = el.clientHeight;
    };
    const onScroll = (): void => {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(flush);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    flush();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  });

  // Container and wrap resizes: refresh the viewport height and the tbody
  // offset (the partial-sort hint toggling shifts it); a large width change
  // drops the column pins since the old widths no longer apply.
  $effect(() => {
    if (!windowed || !scrollContainer) return;
    const el = scrollContainer;
    const wrap = tableEl?.parentElement;
    let lastWidth = 0;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) {
          viewportHeight = el.clientHeight;
          const width = entry.contentRect.width;
          if (lastWidth > 0 && Math.abs(width - lastWidth) > 50) {
            colPinStyle = "";
            measureRowPitch();
          }
          lastWidth = width;
        }
      }
      measureTbodyOffset();
    });
    ro.observe(el);
    if (wrap) ro.observe(wrap);
    return () => {
      ro.disconnect();
    };
  });

  interface WindowEntry {
    key: string;
    gapPx: number;
    row: TicketRow | null;
    index: number;
  }

  const windowEntries = $derived.by((): WindowEntry[] => {
    if (!windowed) {
      return rows.map((row, index) => ({
        key: row.ticketId,
        gapPx: 0,
        row,
        index,
      }));
    }
    const pinned =
      focusedRowId === null
        ? -1
        : rows.findIndex((r) => r.ticketId === focusedRowId);
    const segments = computeTableWindow({
      scrollTop,
      offsetTop: tbodyOffsetTop,
      viewportHeight,
      pitch,
      rowCount: rows.length,
      overscan,
      pinnedIndex: pinned >= 0 ? pinned : undefined,
    });
    const entries: WindowEntry[] = [];
    for (const seg of segments) {
      if (seg.kind === "gap") {
        entries.push({ key: seg.key, gapPx: seg.px, row: null, index: -1 });
      } else {
        for (let i = seg.start; i < seg.end; i++) {
          const row = rows.at(i);
          if (row !== undefined) {
            entries.push({ key: row.ticketId, gapPx: 0, row, index: i });
          }
        }
      }
    }
    return entries;
  });
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
  <!-- While windowed, aria-rowcount and per-row aria-rowindex describe the
       full logical table (ARIA 1.2 requires them when only a portion of the
       rows is in the DOM); both are omitted in flat mode where the DOM is
       complete. The count includes the header row. -->
  <table
    bind:this={tableEl}
    class="data-table"
    style={colPinStyle === "" ? undefined : colPinStyle}
    aria-rowcount={windowed ? rows.length + 1 : undefined}
  >
    <thead>
      <tr aria-rowindex={windowed ? 1 : undefined}>
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
    <tbody bind:this={tbodyEl}>
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
        {#each windowEntries as entry (entry.key)}
          {#if entry.row === null}
            <!-- Gap rows carry the off-window height so scroll geometry and
                 the sentinel position stay exact; aria-hidden keeps them out
                 of the AT row structure (the sentinel precedent). -->
            <tr
              class="virtual-gap"
              aria-hidden="true"
              style:height="{entry.gapPx}px"
            >
              <td class="virtual-gap-cell" colspan={colCount}></td>
            </tr>
          {:else}
            {@const row = entry.row}
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
              aria-rowindex={windowed ? entry.index + 2 : undefined}
              onclick={() => handleRowClick(row.ticketId)}
              ondblclick={() => handleRowDblClick(row.ticketId)}
              onkeydown={onKeyActivate(() => handleRowClick(row.ticketId))}
              onfocusin={() => {
                focusedRowId = row.ticketId;
              }}
              onfocusout={(e) => {
                if (
                  focusedRowId === row.ticketId &&
                  !(
                    e.relatedTarget instanceof Node &&
                    e.currentTarget.contains(e.relatedTarget)
                  )
                ) {
                  focusedRowId = null;
                }
              }}
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
          {/if}
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

  /* ── Windowed rendering ── */
  .virtual-gap-cell {
    padding: 0;
    border: 0;
  }

  /* While windowed, pinColumnWidths() sets --colw-* custom properties
     inline on the table (measured from the flat render) so auto table
     layout cannot re-derive column widths from only the rendered window;
     unset in flat mode, where auto means no constraint. Header cells
     render inside SortHeader, hence the :global anchors. */
  th.col-checkbox {
    min-width: var(--colw-checkbox, auto);
  }

  .data-table :global(th.col-status) {
    min-width: var(--colw-status, auto);
  }

  .data-table :global(th.col-priority) {
    min-width: var(--colw-priority, auto);
  }

  .data-table :global(th.col-client) {
    min-width: var(--colw-client, auto);
  }

  .data-table :global(th.col-title) {
    min-width: var(--colw-title, auto);
  }

  .data-table :global(th.col-queue) {
    min-width: var(--colw-queue, auto);
  }

  .data-table :global(th.col-assignee) {
    min-width: var(--colw-assignee, auto);
  }

  .data-table :global(th.col-activity) {
    min-width: var(--colw-activity, auto);
  }

  .data-table :global(th.col-msgs) {
    min-width: var(--colw-msgs, auto);
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
