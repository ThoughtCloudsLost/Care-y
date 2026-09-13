<!--
  Shared toggle grid component. Renders a grid of rows and columns
  with Konsta Toggle in each cell. Supports optional override markers
  and a per-row reset affordance gated on the onResetRow callback.

  The component knows nothing about permissions or notifications.
  Callers map their domain data into the generic row/column/cell shape.
-->
<script lang="ts">
  import { Toggle } from "konsta/svelte";
  import { Lock } from "@lucide/svelte";

  interface ToggleMatrixCell {
    readonly columnId: string;
    readonly checked: boolean;
    readonly overridden?: boolean;
    readonly disabled?: boolean;
    /** Localized toggle label; falls back to "row, column". */
    readonly ariaLabel?: string;
  }

  interface ToggleMatrixRow {
    readonly id: string;
    readonly label: string;
    /** Renders a lock glyph before the label (row is not editable). */
    readonly locked?: boolean;
    readonly cells: readonly ToggleMatrixCell[];
  }

  interface ToggleMatrixColumn {
    readonly id: string;
    readonly label: string;
  }

  interface ToggleMatrixProps {
    readonly columns: readonly ToggleMatrixColumn[];
    readonly rows: readonly ToggleMatrixRow[];
    readonly onToggle: (rowId: string, columnId: string, next: boolean) => void;
    readonly onResetRow?: (rowId: string) => void;
    readonly ariaLabel: string;
    /** Text shown below a toggle when the cell has overridden === true. */
    readonly overrideText?: string;
    /** Text for the per-row reset button. Only rendered when both
     *  onResetRow and resetText are provided. */
    readonly resetText?: string;
  }

  let {
    columns,
    rows,
    onToggle,
    onResetRow,
    ariaLabel,
    overrideText,
    resetText,
  }: ToggleMatrixProps = $props();

  function cellAriaLabel(rowLabel: string, colLabel: string): string {
    return `${rowLabel}, ${colLabel}`;
  }
</script>

<div
  class="matrix"
  role="grid"
  aria-label={ariaLabel}
  style:--tm-col-count={columns.length}
>
  <div class="matrix-header" role="row">
    {#each columns as col (col.id)}
      <span class="col-label" role="columnheader">{col.label}</span>
    {/each}
  </div>
  {#each rows as row (row.id)}
    <div class="matrix-row" role="row">
      <span class="row-label" title={row.label}>
        {#if row.locked === true}
          <Lock size={12} aria-hidden="true" class="lock-glyph" />
        {/if}
        <span class="row-label-text">{row.label}</span>
      </span>
      {#each row.cells as cell (cell.columnId)}
        {@const colEntry = columns.find((c) => c.id === cell.columnId)}
        <span class="toggle-cell" role="gridcell">
          <Toggle
            checked={cell.checked}
            disabled={cell.disabled ?? false}
            onchange={() => onToggle(row.id, cell.columnId, !cell.checked)}
            aria-label={cell.ariaLabel ??
              cellAriaLabel(row.label, colEntry?.label ?? cell.columnId)}
          />
          {#if cell.overridden === true && overrideText}
            <span class="override-marker">{overrideText}</span>
          {/if}
        </span>
      {/each}
    </div>
  {/each}
</div>

{#if onResetRow && resetText}
  {#each rows as row (row.id)}
    <div class="reset-row">
      <button
        type="button"
        class="touch-feedback reset-btn"
        onclick={() => onResetRow(row.id)}
      >
        {resetText}
      </button>
    </div>
  {/each}
{/if}

<style>
  .matrix {
    display: grid;
    grid-template-columns: 1fr repeat(var(--tm-col-count, 3), 52px);
    gap: 0;
    align-items: center;
  }

  .matrix-header {
    display: contents;
  }

  .matrix-header::before {
    content: "";
  }

  .col-label {
    font-size: 0.75rem;
    color: var(--muted);
    text-align: center;
    padding-bottom: var(--space-sm);
    font-weight: 500;
  }

  .matrix-row {
    display: contents;
  }

  .row-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.875rem;
    color: var(--ink);
    padding: var(--space-sm) 0;
    overflow: hidden;
    min-width: 0;
    border-top: 1px solid var(--hair);
  }

  .row-label-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-label :global(.lock-glyph) {
    flex-shrink: 0;
    color: var(--muted);
  }

  .toggle-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm) 0;
    border-top: 1px solid var(--hair);
    min-height: 44px;
  }

  .override-marker {
    font-size: 0.625rem;
    color: var(--muted);
    margin-top: 2px;
  }

  .reset-row {
    padding: 0;
  }

  .reset-btn {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--danger);
    padding: var(--space-sm) 0;
    background: none;
    border: none;
    cursor: pointer;
  }
</style>
