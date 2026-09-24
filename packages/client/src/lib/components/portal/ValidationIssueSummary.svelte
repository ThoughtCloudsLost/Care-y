<!--
  Validation issue summary. Renders a stacked list of red rows, each naming
  a field and its problem. Used by the public intake page (per-page and
  cross-page summaries) and by the admin form editor preview.

  Row anatomy echoes the ticket table row structure (status mark, label text)
  but colored in the danger slot.
-->
<script lang="ts">
  import type { ValidationIssue } from "../../../routes/(client)/intake/intake-form-logic.js";

  interface ValidationIssueSummaryProps {
    /** Heading text rendered above the list (e.g. "Please review the following:"). */
    readonly heading: string;
    /** Issues to display. When empty, the component renders nothing. */
    readonly issues: readonly ValidationIssue[];
    /**
     * Format a single issue row. Receives the issue and returns a display string.
     * The caller controls whether to include the page number.
     */
    readonly formatRow: (issue: ValidationIssue) => string;
  }

  let { heading, issues, formatRow }: ValidationIssueSummaryProps = $props();
</script>

{#if issues.length > 0}
  <div
    class="validation-issue-summary"
    role="alert"
    data-testid="validation-issue-summary"
  >
    <p class="validation-issue-heading">{heading}</p>
    <ul class="validation-issue-list">
      {#each issues as issue (issue.fieldKey)}
        <li class="validation-issue-row" data-testid="validation-issue-row">
          <span class="validation-issue-mark" aria-hidden="true"></span>
          <span class="validation-issue-text">{formatRow(issue)}</span>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .validation-issue-summary {
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    background: color-mix(in srgb, var(--danger) 6%, transparent);
    margin-top: var(--space-sm);
  }

  .validation-issue-heading {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--danger);
    margin: 0 0 var(--space-xs);
  }

  .validation-issue-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .validation-issue-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-xs);
    padding: var(--space-xs) 0;
    font-size: var(--text-sm);
    color: var(--danger);
    line-height: 1.45;
    min-height: 32px;
  }

  .validation-issue-row + .validation-issue-row {
    border-top: 1px solid color-mix(in srgb, var(--danger) 12%, transparent);
  }

  .validation-issue-mark {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--danger);
    margin-top: 0.45em;
  }

  .validation-issue-text {
    flex: 1;
    min-width: 0;
  }
</style>
