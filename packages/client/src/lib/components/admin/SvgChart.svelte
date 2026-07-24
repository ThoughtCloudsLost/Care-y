<script lang="ts">
  import ChartDataTable from "./ChartDataTable.svelte";

  interface SvgChartProps {
    data: readonly { label: string; value: number }[];
    type: "bar" | "line";
    yLabel: string;
    xLabel: string;
    ariaLabel: string;
    height?: number;
  }

  let {
    data,
    type,
    yLabel,
    xLabel,
    ariaLabel,
    height = 200,
  }: SvgChartProps = $props();

  const PAD_LEFT = 36;
  const PAD_RIGHT = 8;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 28;

  const chartWidth = $derived(Math.max(data.length * 48, 240));
  const totalWidth = $derived(chartWidth + PAD_LEFT + PAD_RIGHT);
  const chartHeight = $derived(height - PAD_TOP - PAD_BOTTOM);
  const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));

  function yTicks(max: number): number[] {
    if (max <= 0) return [0];
    const step = Math.ceil(max / 4);
    const ticks: number[] = [];
    for (let v = 0; v <= max; v += step) {
      ticks.push(v);
    }
    if (ticks[ticks.length - 1] !== max && ticks.length < 6) {
      ticks.push(max);
    }
    return ticks;
  }

  function yPos(value: number, max: number, h: number): number {
    return PAD_TOP + h - (value / max) * h;
  }

  function xPos(index: number, count: number, w: number): number {
    if (count <= 1) return PAD_LEFT + w / 2;
    const slot = w / count;
    return PAD_LEFT + slot * index + slot / 2;
  }
</script>

<div class="chart-wrapper">
  <svg
    aria-hidden="true"
    viewBox="0 0 {totalWidth} {height}"
    class="chart-svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <!-- Y-axis gridlines -->
    {#each yTicks(maxValue) as tick (tick)}
      {@const y = yPos(tick, maxValue, chartHeight)}
      <line
        x1={PAD_LEFT}
        y1={y}
        x2={totalWidth - PAD_RIGHT}
        y2={y}
        class="gridline"
      />
      <text x={PAD_LEFT - 4} y={y + 3} class="axis-label axis-y">{tick}</text>
    {/each}

    <!-- Data -->
    {#if type === "bar"}
      {#each data as d, i (d.label)}
        {@const x = xPos(i, data.length, chartWidth)}
        {@const barW = Math.max((chartWidth / data.length) * 0.6, 8)}
        {@const barH = (d.value / maxValue) * chartHeight}
        <rect
          x={x - barW / 2}
          y={PAD_TOP + chartHeight - barH}
          width={barW}
          height={Math.max(barH, 0)}
          class="bar"
          rx="2"
        />
      {/each}
    {:else}
      <!-- Line chart: polyline + dots -->
      {@const points = data
        .map(
          (d, i) =>
            `${String(xPos(i, data.length, chartWidth))},${String(yPos(d.value, maxValue, chartHeight))}`,
        )
        .join(" ")}
      <polyline {points} class="line-path" fill="none" />
      {#each data as d, i (d.label)}
        <circle
          cx={xPos(i, data.length, chartWidth)}
          cy={yPos(d.value, maxValue, chartHeight)}
          r="3"
          class="line-dot"
        />
      {/each}
    {/if}

    <!-- X-axis labels -->
    {#each data as d, i (d.label)}
      <text
        x={xPos(i, data.length, chartWidth)}
        y={height - 6}
        class="axis-label axis-x">{d.label}</text
      >
    {/each}
  </svg>

  <ChartDataTable {data} {xLabel} {yLabel} caption={ariaLabel} />
</div>

<style>
  .chart-wrapper {
    position: relative;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .chart-svg {
    display: block;
    width: 100%;
    min-width: 240px;
    height: auto;
  }

  .gridline {
    stroke: currentColor;
    stroke-width: 0.5;
    opacity: 0.15;
  }

  .axis-label {
    font-size: 10px;
    fill: var(--muted);
  }

  .axis-y {
    text-anchor: end;
    dominant-baseline: middle;
  }

  .axis-x {
    text-anchor: middle;
    dominant-baseline: hanging;
  }

  .bar {
    fill: var(--brand-primary);
    opacity: 0.85;
  }

  .line-path {
    stroke: var(--brand-accent, var(--brand-fill));
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .line-dot {
    fill: var(--brand-accent, var(--brand-fill));
  }
</style>
