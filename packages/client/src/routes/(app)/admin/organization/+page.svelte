<script lang="ts">
  import { tick, untrack } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Component } from "svelte";
  import { Permission } from "@care-y/shared";
  import { Key, Palette, Shredder, ChartColumn } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import {
    createSectionScroll,
    type ScrollSection,
  } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import KeysSection from "$lib/components/admin/KeysSection.svelte";
  import BrandingSection from "$lib/components/admin/BrandingSection.svelte";
  import RetentionSection from "$lib/components/admin/RetentionSection.svelte";
  import ReportsSection from "$lib/components/admin/ReportsSection.svelte";

  interface OrgSection extends ScrollSection {
    readonly permission: Permission;
    readonly component: Component;
  }

  const SECTIONS: readonly OrgSection[] = [
    {
      id: "branding",
      label: m.admin_tab_branding,
      icon: Palette,
      permission: Permission.MANAGE_ORG_CONFIG,
      component: BrandingSection,
    },
    {
      id: "keys",
      label: m.admin_tab_keys,
      icon: Key,
      permission: Permission.MANAGE_KEYS,
      component: KeysSection,
    },
    {
      id: "retention",
      label: m.admin_tab_retention,
      icon: Shredder,
      permission: Permission.MANAGE_ORG_CONFIG,
      component: RetentionSection,
    },
    {
      id: "reports",
      label: m.admin_tab_reports,
      icon: ChartColumn,
      permission: Permission.VIEW_REPORTS,
      component: ReportsSection,
    },
  ];

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const visibleSections = $derived(
    SECTIONS.filter((s) => permissions.has(s.permission)),
  );
  const hasAccess = $derived(visibleSections.length > 0);

  $effect(() => {
    if (!hasAccess) void goto(resolve("/"));
  });

  const collapsedSections = new SvelteSet<string>();

  function toggleSection(id: string): void {
    if (collapsedSections.has(id)) {
      collapsedSections.delete(id);
    } else {
      collapsedSections.add(id);
    }
  }

  const scroll = createSectionScroll(() => visibleSections);

  let initialTabHandled = false;

  $effect(() => {
    if (initialTabHandled) return;
    const tab = page.url.searchParams.get("tab");
    const sections = untrack(() => visibleSections);
    if (tab !== null && sections.some((s) => s.id === tab)) {
      initialTabHandled = true;
      void expandAndScroll(tab);
    }
  });

  async function expandAndScroll(id: string): Promise<void> {
    collapsedSections.delete(id);
    await tick();
    const skipTransition = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!skipTransition) {
      await new Promise<void>((r) => setTimeout(r, 210));
    }
    scroll.scrollTo(id);
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
  <SectionScrollNav
    sections={visibleSections}
    active={scroll.active}
    onscroll={(id: string) => void expandAndScroll(id)}
    ariaLabel={m.admin_org_title()}
  />
{/snippet}

{#each visibleSections as section (section.id)}
  {@const Content = section.component}
  {@const Icon = section.icon}
  <div id="section-{section.id}" class="org-section">
    <CollapsibleSection
      heading={section.label()}
      icon={Icon}
      iconColor="var(--brand-accent)"
      expanded={!collapsedSections.has(section.id)}
      ontoggle={() => toggleSection(section.id)}
    >
      <Content />
    </CollapsibleSection>
  </div>
{/each}

<style>
  .org-section {
    scroll-margin-top: 7rem;
  }
</style>
