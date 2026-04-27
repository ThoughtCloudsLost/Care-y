<script lang="ts">
  interface ChartDataTableProps {
    data: readonly { label: string; value: number }[];
    xLabel: string;
    yLabel: string;
    caption: string;
  }

  let { data, xLabel, yLabel, caption }: ChartDataTableProps = $props();
</script>

<table class="chart-data-table">
  <caption>{caption}</caption>
  <thead>
    <tr><th scope="col">{xLabel}</th><th scope="col">{yLabel}</th></tr>
  </thead>
  <tbody>
    {#each data as row (row.label)}
      <tr><td>{row.label}</td><td>{row.value}</td></tr>
    {/each}
  </tbody>
</table>

<style>
  .chart-data-table {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
