<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { afterNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Component } from "svelte";
  import { Permission } from "@care-y/shared";
  import { Phone, Ban, Mic, MessageSquare } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import {
    createSectionScroll,
    type ScrollSection,
  } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import TelephonyConfigSection from "$lib/components/admin/TelephonyConfigSection.svelte";
  import BlacklistSection from "$lib/components/admin/BlacklistSection.svelte";
  import GreetingsSection from "$lib/components/admin/GreetingsSection.svelte";
  import SmsTemplatesSection from "$lib/components/admin/SmsTemplatesSection.svelte";

  interface CommsSection extends ScrollSection {
    readonly permission: Permission;
    readonly component: Component;
  }

  const SECTIONS: readonly CommsSection[] = [
    {
      id: "telephony",
      label: m.admin_tab_telephony,
      icon: Phone,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: TelephonyConfigSection,
    },
    {
      id: "blacklist",
      label: m.admin_tab_blacklist,
      icon: Ban,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: BlacklistSection,
    },
    {
      id: "greetings",
      label: m.admin_tab_greetings,
      icon: Mic,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: GreetingsSection,
    },
    {
      id: "templates",
      label: m.admin_tab_sms_templates,
      icon: MessageSquare,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: SmsTemplatesSection,
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

  afterNavigate(({ to }) => {
    const tab = to?.url.searchParams.get("tab") ?? null;
    if (tab !== null && visibleSections.some((s) => s.id === tab)) {
      expandAndScroll(tab);
    }
  });

  function expandAndScroll(id: string): void {
    void scroll.expandAndScroll(id, () => collapsedSections.delete(id));
  }

  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    navbarCtx.current = {
      title: m.admin_comms_title(),
      subnavbar: commsSubnavbar,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet commsSubnavbar()}
  <SectionScrollNav
    sections={visibleSections}
    active={scroll.active}
    onscroll={(id: string) => expandAndScroll(id)}
    ariaLabel={m.admin_comms_title()}
  />
{/snippet}

{#each visibleSections as section (section.id)}
  {@const Content = section.component}
  {@const Icon = section.icon}
  <div id="section-{section.id}" class="comms-section">
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
  .comms-section {
    scroll-margin-top: 7rem;
  }
</style>
