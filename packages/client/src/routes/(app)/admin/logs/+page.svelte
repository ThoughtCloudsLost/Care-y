<script lang="ts">
  import { page } from "$app/state";
  import { goto, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { SvelteMap } from "svelte/reactivity";
  import { PhoneCall, ScrollText } from "@lucide/svelte";
  import {
    Permission,
    auditEventTypeSchema,
    callStatusSchema,
  } from "@care-y/shared";
  import IconTabToggle from "$lib/components/shared/IconTabToggle.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    getNavbarOverrideCtx,
    getScrollContainer,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import {
    getCurrentPermissions,
    getOrgDecryptCache,
  } from "$lib/crypto/context.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { createFilterDispatch } from "$lib/composables/create-filter-dispatch.svelte.js";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import type { FilterPillsConfig } from "$lib/shell/types.js";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { callLogFilterStore } from "$lib/stores/call-log-filters.svelte.js";
  import { auditLogFilterStore } from "$lib/stores/audit-log-filters.svelte.js";
  import {
    type LogsTab,
    isLogsTab,
    defaultTab,
  } from "$lib/admin/logs-utils.js";
  import { auditEventLabel } from "$lib/admin/audit-log-labels.js";
  import { buildDateRangeLabel } from "$lib/tickets/ticket-list-utils.js";
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import CallLogSection from "$lib/components/admin/CallLogSection.svelte";
  import AuditLogSection from "$lib/components/admin/AuditLogSection.svelte";

  // ── Permissions ──

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const hasAccess = $derived(permissions.has(Permission.VIEW_REPORTS));
  const canViewAudit = $derived(
    hasAccess && permissions.has(Permission.MANAGE_USERS),
  );

  $effect(() => {
    if (!hasAccess) void goto(resolve("/"));
  });

  // ── Tab state ──

  let activeTab = $state<LogsTab>(defaultTab());

  $effect(() => {
    const raw = page.url.searchParams.get("tab");
    if (raw !== null && isLogsTab(raw)) {
      // Force back to calls when the user lacks audit permission
      activeTab = raw === "audit" && !canViewAudit ? "calls" : raw;
    }
  });

  function switchTab(tab: LogsTab): void {
    activeTab = tab;
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- shallow routing, same page query param
    replaceState(`?tab=${tab}`, {});
  }

  // ── Scroll direction ──

  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });

  // ── Routers ──

  const reportsRouter = requireRouter(trpc.reports, "reports");
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const orgCache = getOrgDecryptCache();

  // ── Volunteers query (for audit actor pill labels) ──

  const volunteersQuery = createVolunteersQuery(ticketRouter);

  const volunteerMap = $derived.by(() => {
    const map = new SvelteMap<string, string>();
    const data = volunteersQuery.data;
    if (data) {
      for (const vol of data) {
        map.set(vol.id, vol.encryptedDisplayName);
      }
    }
    return map;
  });

  // ── Call log query ──

  const callLogParams = $derived({
    direction: callLogFilterStore.direction ?? undefined,
    callStatus: callLogFilterStore.callStatus ?? undefined,
    dateFrom: callLogFilterStore.dateFrom?.toISOString(),
    dateTo: callLogFilterStore.dateTo?.toISOString(),
  });

  const callLogQuery = createInfiniteQuery(() => ({
    queryKey: adminKeys.callLog(callLogParams),
    queryFn: async ({ pageParam }: { pageParam: number }) =>
      reportsRouter.callLog.query({ ...callLogParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    enabled: activeTab === "calls" && hasAccess,
  }));

  const callRows = $derived(
    callLogQuery.data?.pages.flatMap((p) => p.entries) ?? [],
  );

  // ── Audit log query ──

  const auditLogParams = $derived({
    eventType: auditLogFilterStore.eventType ?? undefined,
    actorId: auditLogFilterStore.actorId ?? undefined,
    dateFrom: auditLogFilterStore.dateFrom?.toISOString(),
    dateTo: auditLogFilterStore.dateTo?.toISOString(),
  });

  const auditLogQuery = createInfiniteQuery(() => ({
    queryKey: adminKeys.auditLog(auditLogParams),
    queryFn: async ({ pageParam }: { pageParam: number }) =>
      requireRouter(ticketRouter.auditLog, "tickets.auditLog").query({
        ...auditLogParams,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    enabled: activeTab === "audit" && canViewAudit,
  }));

  const auditRows = $derived(
    auditLogQuery.data?.pages.flatMap((p) => p.entries) ?? [],
  );

  // ── Navbar context ──

  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    const subnavbarSnippet =
      activeTab === "calls" ? callsSubnavbar : auditSubnavbar;

    navbarCtx.current = {
      title: m.logs_page_title(),
      subnavbar: subnavbarSnippet,
      subnavbarHidden: () => scrollDir.hidden,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // ── Call log filter dispatch ──

  const callDispatch = createFilterDispatch({
    fields: {
      direction: {
        type: "single-select",
        set: (v: string | null) => {
          if (v === "inbound" || v === "outbound") {
            callLogFilterStore.setDirection(v);
          } else {
            callLogFilterStore.setDirection(null);
          }
        },
      },
      callStatus: {
        type: "single-select",
        set: (v: string | null) => {
          const parsed =
            v === null ? null : (callStatusSchema.safeParse(v).data ?? null);
          callLogFilterStore.setCallStatus(parsed);
        },
      },
      dateRange: {
        type: "date-range",
        set: (from: Date | null, to: Date | null) => {
          callLogFilterStore.setDateRange(from, to);
        },
      },
    },
    clearAll: () => callLogFilterStore.clearAll(),
  });

  const directionOptions = $derived([
    { value: "inbound", label: m.logs_direction_inbound() },
    { value: "outbound", label: m.logs_direction_outbound() },
  ]);

  const callStatusOptions = $derived([
    { value: "completed", label: m.logs_call_status_completed() },
    { value: "no_answer", label: m.logs_call_status_no_answer() },
    { value: "busy", label: m.logs_call_status_busy() },
    { value: "failed", label: m.logs_call_status_failed() },
    { value: "canceled", label: m.logs_call_status_canceled() },
  ]);

  const callPills: PillDefinition[] = $derived([
    {
      id: "direction",
      label: m.logs_filter_direction(),
      mode: "single",
      options: directionOptions,
      selected: callLogFilterStore.direction,
    },
    {
      id: "callStatus",
      label: m.logs_filter_call_status(),
      mode: "single",
      options: callStatusOptions,
      selected: callLogFilterStore.callStatus,
    },
    {
      id: "dateRange",
      label: m.logs_filter_date_range(),
      mode: "date",
      options: [],
      selected: null,
    },
  ]);

  const callDateRangeActive = $derived(
    callLogFilterStore.dateFrom !== null || callLogFilterStore.dateTo !== null,
  );

  const callDateFromStr = $derived(
    callLogFilterStore.dateFrom !== null
      ? callLogFilterStore.dateFrom.toISOString().slice(0, 10)
      : "",
  );

  const callDateToStr = $derived(
    callLogFilterStore.dateTo !== null
      ? callLogFilterStore.dateTo.toISOString().slice(0, 10)
      : "",
  );

  const callDateRangeLabel = $derived(
    buildDateRangeLabel(
      callLogFilterStore.dateFrom,
      callLogFilterStore.dateTo,
      {
        from: m.logs_filter_date_range(),
        to: m.logs_filter_date_range(),
        range: m.logs_filter_date_range(),
      },
    ),
  );

  const callFilterPillsConfig: FilterPillsConfig = $derived({
    pills: callPills,
    activeCount: callLogFilterStore.activeCount,
    dateFrom: callDateFromStr,
    dateTo: callDateToStr,
    dateActive: callDateRangeActive,
    dateLabel: callDateRangeLabel,
    ontoggle: callDispatch.handlePillToggle,
    onselect: callDispatch.handlePillSelect,
    ondatechange: callDispatch.handlePillDateChange,
    onclearall: callDispatch.clearAll,
  });

  // ── Audit log filter dispatch ──

  const auditDispatch = createFilterDispatch({
    fields: {
      eventType: {
        type: "single-select",
        set: (v: string | null) => {
          // Validate against schema options before setting
          const parsed = v !== null ? auditEventTypeSchema.safeParse(v) : null;
          if (parsed?.success === true) {
            auditLogFilterStore.setEventType(parsed.data);
          } else {
            auditLogFilterStore.setEventType(null);
          }
        },
      },
      actor: {
        type: "single-select",
        set: (v: string | null) => {
          auditLogFilterStore.setActorId(v);
        },
      },
      dateRange: {
        type: "date-range",
        set: (from: Date | null, to: Date | null) => {
          auditLogFilterStore.setDateRange(from, to);
        },
      },
    },
    clearAll: () => auditLogFilterStore.clearAll(),
  });

  const eventTypeOptions = $derived(
    auditEventTypeSchema.options.map((et) => ({
      value: et,
      label: auditEventLabel(et),
    })),
  );

  const actorPillOptions = $derived.by(() => {
    const data = volunteersQuery.data ?? [];
    return data.map((vol) => {
      const name = orgCache.decrypt(
        `assignee:${vol.id}`,
        vol.encryptedDisplayName,
      );
      return { value: vol.id, label: name ?? vol.id.slice(0, 8) };
    });
  });

  const auditPills: PillDefinition[] = $derived([
    {
      id: "eventType",
      label: m.logs_filter_event_type(),
      mode: "single",
      options: eventTypeOptions,
      selected: auditLogFilterStore.eventType,
    },
    {
      id: "actor",
      label: m.logs_filter_actor(),
      mode: "single",
      options: actorPillOptions,
      selected: auditLogFilterStore.actorId,
    },
    {
      id: "dateRange",
      label: m.logs_filter_date_range(),
      mode: "date",
      options: [],
      selected: null,
    },
  ]);

  const auditDateRangeActive = $derived(
    auditLogFilterStore.dateFrom !== null ||
      auditLogFilterStore.dateTo !== null,
  );

  const auditDateFromStr = $derived(
    auditLogFilterStore.dateFrom !== null
      ? auditLogFilterStore.dateFrom.toISOString().slice(0, 10)
      : "",
  );

  const auditDateToStr = $derived(
    auditLogFilterStore.dateTo !== null
      ? auditLogFilterStore.dateTo.toISOString().slice(0, 10)
      : "",
  );

  const auditDateRangeLabel = $derived(
    buildDateRangeLabel(
      auditLogFilterStore.dateFrom,
      auditLogFilterStore.dateTo,
      {
        from: m.logs_filter_date_range(),
        to: m.logs_filter_date_range(),
        range: m.logs_filter_date_range(),
      },
    ),
  );

  const auditFilterPillsConfig: FilterPillsConfig = $derived({
    pills: auditPills,
    activeCount: auditLogFilterStore.activeCount,
    dateFrom: auditDateFromStr,
    dateTo: auditDateToStr,
    dateActive: auditDateRangeActive,
    dateLabel: auditDateRangeLabel,
    ontoggle: auditDispatch.handlePillToggle,
    onselect: auditDispatch.handlePillSelect,
    ondatechange: auditDispatch.handlePillDateChange,
    onclearall: auditDispatch.clearAll,
  });

  // ── Navigation ──

  function handleTicketOpen(ticketId: string): void {
    void goto(resolve(`/tickets/${ticketId}`));
  }

  function noop(): void {
    // Intentionally empty: logs page has no saved filters or select mode
  }
</script>

{#snippet tabSegmented()}
  {@const tabs = [
    { id: "calls", label: m.logs_tab_calls(), icon: PhoneCall },
    ...(canViewAudit
      ? [{ id: "audit", label: m.logs_tab_audit(), icon: ScrollText }]
      : []),
  ]}
  <IconTabToggle
    {tabs}
    active={activeTab}
    ariaLabel={m.logs_page_title()}
    semantics="tabs"
    onchange={(id: string) => {
      if (isLogsTab(id)) switchTab(id);
    }}
  />
{/snippet}

{#snippet callsSubnavbar()}
  <SubNavbarFilterLayout
    title={m.panel_call_log()}
    headerRight={tabSegmented}
    selectLabel=""
    onselect={noop}
    filterPills={callFilterPillsConfig}
  />
{/snippet}

{#snippet auditSubnavbar()}
  <SubNavbarFilterLayout
    title={m.panel_audit_log()}
    headerRight={tabSegmented}
    selectLabel=""
    onselect={noop}
    filterPills={auditFilterPillsConfig}
  />
{/snippet}

{#if activeTab === "calls" && hasAccess}
  <div role="tabpanel" id="panel-calls" aria-labelledby="tab-calls">
    <CallLogSection
      rows={callRows}
      isLoading={callLogQuery.isLoading}
      isError={callLogQuery.isError}
      error={callLogQuery.error}
      hasNextPage={callLogQuery.hasNextPage}
      isFetchingNextPage={callLogQuery.isFetchingNextPage}
      onfetchnext={() => void callLogQuery.fetchNextPage()}
      onretry={() => void callLogQuery.refetch()}
      onticketopen={handleTicketOpen}
    />
  </div>
{:else if activeTab === "audit" && canViewAudit}
  <div role="tabpanel" id="panel-audit" aria-labelledby="tab-audit">
    <AuditLogSection
      rows={auditRows}
      actorNames={volunteerMap}
      isLoading={auditLogQuery.isLoading}
      isError={auditLogQuery.isError}
      error={auditLogQuery.error}
      hasNextPage={auditLogQuery.hasNextPage}
      isFetchingNextPage={auditLogQuery.isFetchingNextPage}
      onfetchnext={() => void auditLogQuery.fetchNextPage()}
      onretry={() => void auditLogQuery.refetch()}
      onticketopen={handleTicketOpen}
    />
  </div>
{/if}
