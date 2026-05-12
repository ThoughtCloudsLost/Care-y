<script lang="ts">
  import { Card, List, ListItem, Block, Preloader } from "konsta/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { adminKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SvgChart from "./SvgChart.svelte";
  import MetricCard from "./MetricCard.svelte";

  interface ReportsSectionProps {
    ontap?: (filterParam: string) => void;
  }

  let { ontap }: ReportsSectionProps = $props();

  if (!trpc.reports) throw new RouterNotAvailableError("reports");
  const reportsRouter = trpc.reports;

  const orgCache = getOrgDecryptCache();

  // ── Queries ──

  const activeCountQuery = createQuery(() => ({
    queryKey: adminKeys.reportActiveCount(),
    queryFn: async () => reportsRouter.activeCount.query(),
    staleTime: 60_000,
  }));

  const volumeQuery = createQuery(() => ({
    queryKey: adminKeys.reportVolumeTrends(),
    queryFn: async () => reportsRouter.volumeTrends.query(),
    staleTime: 60_000,
  }));

  const resolutionQuery = createQuery(() => ({
    queryKey: adminKeys.reportResolutionTrends(),
    queryFn: async () => reportsRouter.resolutionTrends.query(),
    staleTime: 60_000,
  }));

  const queueStatsQuery = createQuery(() => ({
    queryKey: adminKeys.reportQueueStats(),
    queryFn: async () => reportsRouter.queueStats.query(),
    staleTime: 60_000,
  }));

  // ── Derived data ──

  const thisMonthCount = $derived.by(() => {
    if (!volumeQuery.data) return 0;
    const last = volumeQuery.data[volumeQuery.data.length - 1];
    return last?.created ?? 0;
  });

  const avgResolution = $derived.by(() => {
    if (!resolutionQuery.data) return null;
    const withData = resolutionQuery.data.filter((r) => r.avgDays > 0);
    if (withData.length === 0) return null;
    return withData[withData.length - 1]?.avgDays ?? null;
  });

  function formatMonth(yyyyMm: string): string {
    const [yearStr, monthStr] = yyyyMm.split("-");
    const date = new Date(Number(yearStr), Number(monthStr) - 1);
    return date.toLocaleString("default", { month: "short" });
  }

  const volumeChartData = $derived(
    (volumeQuery.data ?? []).map((v) => ({
      label: formatMonth(v.month),
      value: v.created,
    })),
  );

  const resolutionChartData = $derived(
    (resolutionQuery.data ?? []).map((r) => ({
      label: formatMonth(r.month),
      value: r.avgDays,
    })),
  );

  function decryptQueueName(
    queueId: string,
    encryptedName: string,
  ): string | null {
    const bytes = base64ToUint8Array(encryptedName);
    return orgCache.decrypt(`queue:${queueId}`, bytes);
  }

  const isLoading = $derived(
    activeCountQuery.isPending ||
      volumeQuery.isPending ||
      resolutionQuery.isPending ||
      queueStatsQuery.isPending,
  );

  const hasError = $derived(
    activeCountQuery.isError ||
      volumeQuery.isError ||
      resolutionQuery.isError ||
      queueStatsQuery.isError,
  );

  const firstError = $derived(
    activeCountQuery.error ??
      volumeQuery.error ??
      resolutionQuery.error ??
      queueStatsQuery.error,
  );

  const hasData = $derived(
    activeCountQuery.data !== undefined &&
      volumeQuery.data !== undefined &&
      resolutionQuery.data !== undefined &&
      queueStatsQuery.data !== undefined,
  );
</script>

{#if isLoading}
  <Block class="text-center">
    <Preloader />
  </Block>
{:else if hasError}
  <QueryError error={firstError} />
{:else if !hasData}
  <Block class="text-center text-[--muted]">
    {m.admin_reports_no_data()}
  </Block>
{:else}
  <!-- Metric cards (horizontal scroll) -->
  <div class="metric-row">
    <MetricCard
      value={activeCountQuery.data ?? 0}
      label={m.admin_reports_open_tickets(withTerms())}
      filterParam="status=open"
      ariaLabel={m.admin_reports_view_open(
        withTerms({
          count: String(activeCountQuery.data ?? 0),
        }),
      )}
      {ontap}
    />
    <MetricCard
      value={thisMonthCount}
      label={m.admin_reports_this_month()}
      filterParam="created=month"
      ariaLabel={m.admin_reports_view_month(
        withTerms({ count: String(thisMonthCount) }),
      )}
      {ontap}
    />
    {#if avgResolution !== null}
      <MetricCard
        value={m.admin_reports_days_unit({ days: String(avgResolution) })}
        label={m.admin_reports_avg_resolution()}
      />
    {/if}
  </div>

  <!-- Volume trends (bar chart) -->
  {#if volumeChartData.length > 0}
    <Card raised contentWrap={false} class="chart-card">
      <div class="card-section-label">{m.admin_reports_volume_title()}</div>
      <div class="chart-container">
        <SvgChart
          data={volumeChartData}
          type="bar"
          xLabel={m.admin_reports_month_label()}
          yLabel={m.admin_reports_tickets_label(withTerms())}
          ariaLabel={m.admin_reports_volume_aria(withTerms())}
        />
      </div>
    </Card>
  {/if}

  <!-- Resolution time (line chart) -->
  {#if resolutionChartData.some((d) => d.value > 0)}
    <Card raised contentWrap={false} class="chart-card">
      <div class="card-section-label">{m.admin_reports_resolution_title()}</div>
      <div class="chart-container">
        <SvgChart
          data={resolutionChartData}
          type="line"
          xLabel={m.admin_reports_month_label()}
          yLabel={m.admin_reports_days_label()}
          ariaLabel={m.admin_reports_resolution_aria()}
        />
      </div>
    </Card>
  {/if}

  <!-- By queue -->
  {#if queueStatsQuery.data && queueStatsQuery.data.length > 0}
    <Card raised contentWrap={false} class="chart-card">
      <div class="card-section-label">
        {m.admin_reports_by_queue(withTerms())}
      </div>
      <List nested class="queue-list">
        {#each queueStatsQuery.data as stat (stat.queueId)}
          {@const name = decryptQueueName(
            stat.queueId,
            stat.encryptedQueueName,
          )}
          <ListItem>
            {#snippet title()}
              {#if name}
                {name}
              {:else}
                <DecryptPlaceholder ciphertext={stat.encryptedQueueName} />
              {/if}
            {/snippet}
            {#snippet after()}
              <span class="queue-counts">
                <span class="queue-count open"
                  >{stat.open} {m.admin_reports_open()}</span
                >
                <span class="queue-count closed"
                  >{stat.closed} {m.admin_reports_closed()}</span
                >
              </span>
            {/snippet}
          </ListItem>
        {/each}
      </List>
    </Card>
  {/if}
{/if}

<style>
  .metric-row {
    display: flex;
    gap: var(--space-sm);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 var(--space-md) var(--space-sm);
    scroll-snap-type: x proximity;
  }

  .metric-row > :global(.metric-card) {
    flex: 1 1 0;
    min-width: 6rem;
    scroll-snap-align: start;
  }

  :global(.chart-card) {
    margin: 0 var(--space-md) var(--space-sm);
  }

  .card-section-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    padding: var(--space-sm) var(--space-md) 0;
  }

  .chart-container {
    padding: var(--space-xs) var(--space-sm) var(--space-sm);
  }

  .queue-counts {
    display: flex;
    gap: var(--space-sm);
    font-size: var(--text-xs);
  }

  .queue-count {
    white-space: nowrap;
  }

  .queue-count.open {
    color: var(--brand-primary);
  }

  .queue-count.closed {
    color: var(--muted);
  }
</style>
