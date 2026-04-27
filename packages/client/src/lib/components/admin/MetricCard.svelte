<script lang="ts">
  import { Card } from "konsta/svelte";

  interface MetricCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    filterParam?: string;
    ariaLabel?: string;
    ontap?: (filterParam: string) => void;
  }

  let {
    label,
    value,
    subtitle,
    filterParam,
    ariaLabel,
    ontap,
  }: MetricCardProps = $props();

  const isTappable = $derived(ontap !== undefined && filterParam !== undefined);

  function handleTap(): void {
    if (ontap !== undefined && filterParam !== undefined) ontap(filterParam);
  }
</script>

<Card
  raised
  component={isTappable ? "button" : "div"}
  aria-label={ariaLabel}
  onclick={isTappable ? handleTap : undefined}
  class="metric-card {isTappable ? 'touch-feedback' : ''}"
>
  <div class="metric-inner">
    <span class="metric-value">{value}</span>
    <span class="metric-label">{label}</span>
    {#if subtitle}
      <span class="metric-subtitle">{subtitle}</span>
    {/if}
  </div>
</Card>

<style>
  .metric-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: 1rem 1.25rem;
    text-align: center;
    min-width: 6rem;
  }

  .metric-value {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
    color: var(--ink);
  }

  .metric-label {
    font-size: var(--text-xs);
    color: var(--muted);
    line-height: 1.2;
    white-space: nowrap;
  }

  .metric-subtitle {
    font-size: var(--text-xs);
    color: var(--muted);
    opacity: 0.7;
    line-height: 1;
  }
</style>
