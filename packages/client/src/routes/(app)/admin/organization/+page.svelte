<script lang="ts">
  import { BlockTitle, Segmented, SegmentedButton } from "konsta/svelte";
  import { page } from "$app/state";
  import { goto, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Component } from "svelte";
  import { Permission } from "@care-y/shared";
  import { Key, Palette, Calendar, ChartColumn } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import KeysSection from "$lib/components/admin/KeysSection.svelte";
  import BrandingSection from "$lib/components/admin/BrandingSection.svelte";
  import RetentionSection from "$lib/components/admin/RetentionSection.svelte";
  import ReportsSection from "$lib/components/admin/ReportsSection.svelte";

  type OrgTab = "keys" | "branding" | "retention" | "reports";

  interface TabConfig {
    readonly label: () => string;
    readonly icon: Component;
    readonly permission: Permission;
  }

  const TAB_CONFIG = new Map<OrgTab, TabConfig>([
    [
      "branding",
      {
        label: m.admin_tab_branding,
        icon: Palette,
        permission: Permission.MANAGE_ORG_CONFIG,
      },
    ],
    [
      "keys",
      {
        label: m.admin_tab_keys,
        icon: Key,
        permission: Permission.MANAGE_KEYS,
      },
    ],
    [
      "retention",
      {
        label: m.admin_tab_retention,
        icon: Calendar,
        permission: Permission.MANAGE_ORG_CONFIG,
      },
    ],
    [
      "reports",
      {
        label: m.admin_tab_reports,
        icon: ChartColumn,
        permission: Permission.VIEW_REPORTS,
      },
    ],
  ]);

  const TAB_ORDER: readonly OrgTab[] = [
    "branding",
    "keys",
    "retention",
    "reports",
  ];

  function getTabConfig(tab: OrgTab): TabConfig {
    const cfg = TAB_CONFIG.get(tab);
    if (!cfg) throw new RangeError(`Unknown tab: ${tab}`);
    return cfg;
  }

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const visibleTabs = $derived(
    TAB_ORDER.filter((tab) => permissions.has(getTabConfig(tab).permission)),
  );
  const hasAccess = $derived(visibleTabs.length > 0);

  $effect(() => {
    if (!hasAccess) void goto(resolve("/"));
  });

  function isOrgTab(value: string): value is OrgTab {
    return (TAB_ORDER as readonly string[]).includes(value);
  }

  const urlTab = $derived.by(() => {
    const raw = page.url.searchParams.get("tab");
    return raw !== null && isOrgTab(raw) ? raw : null;
  });

  let activeTab = $state<OrgTab>("branding");

  $effect(() => {
    if (urlTab !== null && visibleTabs.includes(urlTab)) {
      activeTab = urlTab;
    }
  });

  function switchTab(tab: OrgTab): void {
    activeTab = tab;
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- shallow routing, same page query param
    replaceState(`?tab=${tab}`, {});
  }

  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    navbarCtx.current = {
      title: m.admin_org_title(),
      subnavbar: orgSubnavbar,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet orgSubnavbar()}
  <div class="subnavbar-content">
    <div class="page-header">
      <BlockTitle large class="page-title">
        {getTabConfig(activeTab).label()}
      </BlockTitle>
      <div role="tablist" aria-label={m.admin_org_title()} class="tab-toggle">
        <Segmented strong>
          {#each visibleTabs as tab (tab)}
            {@const cfg = getTabConfig(tab)}
            {@const Icon = cfg.icon}
            <SegmentedButton
              active={activeTab === tab}
              onclick={() => switchTab(tab)}
              aria-selected={activeTab === tab}
              aria-controls="panel-{tab}"
              aria-label={cfg.label()}
              id="tab-{tab}"
            >
              <Icon size={16} aria-hidden="true" />
            </SegmentedButton>
          {/each}
        </Segmented>
      </div>
    </div>
  </div>
{/snippet}

{#if activeTab === "keys"}
  <div role="tabpanel" id="panel-keys" aria-labelledby="tab-keys">
    <KeysSection />
  </div>
{:else if activeTab === "branding"}
  <div role="tabpanel" id="panel-branding" aria-labelledby="tab-branding">
    <BrandingSection />
  </div>
{:else if activeTab === "retention"}
  <div role="tabpanel" id="panel-retention" aria-labelledby="tab-retention">
    <RetentionSection />
  </div>
{:else if activeTab === "reports"}
  <div role="tabpanel" id="panel-reports" aria-labelledby="tab-reports">
    <ReportsSection />
  </div>
{/if}

<style>
  .subnavbar-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
  }

  :global(.page-title) {
    margin: 0 !important;
    padding-left: 0 !important;
  }

  .tab-toggle {
    flex-shrink: 0;
  }

  .tab-toggle :global(.k-segmented) {
    height: 1.75rem;
  }

  .tab-toggle :global(.k-segmented-button) {
    font-size: var(--text-xs);
    min-height: unset;
    padding: 0 0.375rem;
  }
</style>
