<script lang="ts">
  import { Card } from "konsta/svelte";

  interface StatCardProps {
    /** i18n label for this stat group (e.g., "My Open") */
    label: string;
    /** Count to display prominently */
    count: number;
    /** URL search param value to pass when navigating to tickets */
    filterParam: string;
    /** Accent color (CSS custom property or value) for the status dot */
    accentColor?: string;
    /** Callback when card is tapped. Route file handles navigation. */
    ontap: (filterParam: string) => void;
  }

  let { label, count, filterParam, accentColor, ontap }: StatCardProps =
    $props();
</script>

<Card
  raised
  component="button"
  aria-label="{count} {label}"
  onclick={() => ontap(filterParam)}
  data-testid="stat-card"
  class="stat-card touch-feedback"
>
  <div class="stat-inner">
    {#if accentColor}
      <span
        class="stat-dot"
        style:background={accentColor}
        aria-hidden="true"
        data-accent-dot
      ></span>
    {/if}
    <span class="stat-count">{count}</span>
    <span class="stat-label">{label}</span>
  </div>
</Card>

<style>
  .stat-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: 0.5rem 0.25rem;
    text-align: center;
  }

  .stat-dot {
    width: 0.25rem;
    height: 0.25rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .stat-count {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--ink);
  }

  .stat-label {
    font-size: var(--text-xs);
    color: var(--muted);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
</style>
