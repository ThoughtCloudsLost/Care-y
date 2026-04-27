<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { afterNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import { createSectionScroll } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import type { SectionDef } from "./collapsible-section-types.js";

  let { sections, title }: { sections: readonly SectionDef[]; title: string } =
    $props();

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const visibleSections = $derived(
    sections.filter((s) => permissions.has(s.permission)),
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
      title,
      subnavbar: subnavbarSnippet,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet subnavbarSnippet()}
  <SectionScrollNav
    sections={visibleSections}
    active={scroll.active}
    onscroll={(id: string) => expandAndScroll(id)}
    ariaLabel={title}
  />
{/snippet}

{#each visibleSections as section (section.id)}
  {@const Content = section.component}
  {@const Icon = section.icon}
  <div id="section-{section.id}" class="csp-section">
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
  .csp-section {
    scroll-margin-top: 7rem;
  }
</style>
