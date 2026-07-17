<!--
  Mobile bottom tab bar with optional area indicator pill.

  Renders the standard 3-tab bar (Home, Tickets, Library). When the
  current path is inside a non-tab area (admin, settings, schedule),
  a second ToolbarPane appears to the right with a single active
  TabbarLink showing the area's icon. All regular tabs deselect.

  The area pill occupies the slot where the old "..." overflow button
  lived. It uses tabbar={false} on its ToolbarPane so Konsta's iOS
  highlight bar does not extend into it.
-->
<script lang="ts">
  import { Toolbar, TabbarLink, ToolbarPane } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { allTabs } from "./tabs";
  import { getAreaDef } from "./areas";
  import type { TabbarNavProps } from "./types";

  let { activeTab, activeArea, ontabchange, onareatap }: TabbarNavProps =
    $props();

  const areaDef = $derived(activeArea != null ? getAreaDef(activeArea) : null);
</script>

<nav
  aria-label={m.nav_main()}
  class="tabbar-nav native-tabbar left-0 bottom-0 fixed"
>
  <Toolbar
    tabbar
    tabbarIcons
    class="tabbar-inner"
    role="tablist"
    aria-label={m.nav_main()}
  >
    <ToolbarPane>
      {#each allTabs as tab (tab.id)}
        <TabbarLink
          active={activeTab === tab.id}
          onclick={() => ontabchange(tab.id)}
          role="tab"
          aria-label={tab.label()}
          aria-selected={activeTab === tab.id}
          colors={{
            textIos: "text-[var(--glass-text)]",
            textMaterial: "text-[var(--glass-text)]",
            textActiveIos: "text-[var(--brand-text)]",
            textActiveMaterial: "text-[var(--brand-text)]",
          }}
        >
          {#snippet icon()}{@const Icon = tab.icon}<Icon
              size={24}
              aria-hidden="true"
            />{/snippet}
        </TabbarLink>
      {/each}
    </ToolbarPane>
    {#if areaDef != null}
      <ToolbarPane tabbar={false}>
        <TabbarLink
          active
          onclick={() => onareatap(areaDef.id)}
          role="tab"
          aria-label={m.nav_area_label({ area: areaDef.label() })}
          aria-selected={true}
          colors={{
            textIos: "text-[var(--glass-text)]",
            textMaterial: "text-[var(--glass-text)]",
            textActiveIos: "text-[var(--brand-text)]",
            textActiveMaterial: "text-[var(--brand-text)]",
          }}
        >
          {#snippet icon()}{@const Icon = areaDef.icon}<Icon
              size={24}
              aria-hidden="true"
            />{/snippet}
        </TabbarLink>
      </ToolbarPane>
    {/if}
  </Toolbar>
</nav>
