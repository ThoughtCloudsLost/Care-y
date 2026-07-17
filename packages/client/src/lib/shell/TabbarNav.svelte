<!--
  Mobile bottom tab bar with optional area indicator button.

  Renders the standard 3-tab bar (Home, Tickets, Library). When the
  current path is inside a non-tab area (admin, settings, schedule),
  a circular glass button appears to the right of the Toolbar showing
  the area's icon. All regular tabs deselect and the iOS highlight bar
  is hidden (it would drift to translateX(-100%) since no link has
  the k-tabbar-link-active class).

  The area button sits outside the Toolbar as a sibling element so
  Konsta's iOS highlight bar stays scoped to the three tabs. The glass
  treatment replicates the ToolbarPane Glass visuals (bg, shadow, blur).
  The icon uses --brand-text to match the active tab color treatment.

  The button is always in the DOM so CSS transitions can animate it.
  A stored "last area" keeps the icon visible during the out-animation.
-->
<script lang="ts">
  import { Toolbar, TabbarLink, ToolbarPane } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { allTabs } from "./tabs";
  import { getAreaDef, type AreaDef } from "./areas";
  import type { TabbarNavProps } from "./types";

  let { activeTab, activeArea, ontabchange, onareatap }: TabbarNavProps =
    $props();

  const areaDef = $derived(activeArea != null ? getAreaDef(activeArea) : null);
  const noActiveTab = $derived(activeTab == null);
  const showAreaBtn = $derived(areaDef != null);

  let lastAreaDef = $state<AreaDef | undefined>(undefined);
  $effect(() => {
    if (areaDef != null) lastAreaDef = areaDef;
  });
  const displayAreaDef = $derived(areaDef ?? lastAreaDef);
</script>

<nav
  aria-label={m.nav_main()}
  class="tabbar-nav native-tabbar left-0 bottom-0 fixed"
  class:no-active-tab={noActiveTab}
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
  </Toolbar>
  <button
    type="button"
    class="area-btn"
    class:area-btn-visible={showAreaBtn}
    aria-label={displayAreaDef != null
      ? m.nav_area_label({ area: displayAreaDef.label() })
      : ""}
    aria-hidden={!showAreaBtn}
    tabindex={showAreaBtn ? 0 : -1}
    onclick={() => {
      if (displayAreaDef != null) onareatap(displayAreaDef.id);
    }}
  >
    {#if displayAreaDef != null}
      {@const Icon = displayAreaDef.icon}
      <Icon size={24} aria-hidden="true" />
    {/if}
  </button>
</nav>

<style>
  .tabbar-nav {
    display: flex;
    align-items: center;
    z-index: 20;
    width: 100%;
    padding-inline: 16px;
  }

  .tabbar-nav :global(.k-toolbar) {
    position: static !important;
    flex: 1;
    min-width: 0;
  }

  /* When no tab is active (non-tab route), hide the iOS highlight bar.
     Konsta positions it at translateX(-100%) when indexOf returns -1,
     which causes it to float off the left edge. The highlight span is
     the last child of the Glass wrapper (.k-toolbar-pane). Using
     visibility + opacity to ensure it stays hidden even when Konsta
     re-applies inline transforms on navigation. */
  .no-active-tab :global(.k-toolbar-pane > span) {
    visibility: hidden !important;
    opacity: 0 !important;
  }

  .area-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0;
    height: 2.75rem;
    flex-shrink: 0;
    overflow: hidden;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--brand-text);
    padding: 0;
    margin: 0;
    margin-bottom: var(--k-safe-area-bottom);
    -webkit-tap-highlight-color: transparent;
    background: var(--color-ios-light-glass, rgba(255, 255, 255, 0.75));
    box-shadow: var(--shadow-ios-light-glass);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
    transform: scale(0);
    opacity: 0;
    pointer-events: none;
    transition:
      width 450ms cubic-bezier(0.4, 0, 0.2, 1),
      margin 450ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 350ms ease;
  }

  .area-btn::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }

  :global(html.dark) .area-btn::before {
    background: rgba(255, 255, 255, 0.15);
  }

  .area-btn-visible {
    width: 2.75rem;
    margin-inline-end: 8px;
    transform: scale(1);
    opacity: 1;
    overflow: visible;
    pointer-events: auto;
  }

  :global(html.dark) .area-btn {
    background: var(--color-ios-dark-glass, rgba(50, 50, 50, 0.5));
    box-shadow: var(--shadow-ios-dark-glass);
  }

  :global(.k-ios) .tabbar-nav :global(.k-toolbar) {
    padding-bottom: var(--k-safe-area-bottom) !important;
  }

  :global(.k-ios) .tabbar-nav :global(.k-toolbar > div:first-child) {
    height: calc(var(--k-safe-area-bottom) + 48px) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .area-btn {
      transition: none;
    }
  }
</style>
