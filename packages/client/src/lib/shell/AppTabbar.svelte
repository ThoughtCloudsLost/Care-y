<!--
  Bottom tab bar: 3 tabs grouped left (Home, Tickets, Calendar), More isolated right.
  Uses Konsta Toolbar with tabbar={true} for custom flex layout (Tabbar forces equal spacing).
  Follows WAI-ARIA APG tabs pattern: arrow keys, Home/End, role="tablist", aria-selected.
-->
<script lang="ts">
  import { Toolbar } from "konsta/svelte";
  import { TAB_IDS, type AppTabbarProps, type TabId } from "./types";

  let { active, ontabchange }: AppTabbarProps = $props();

  interface TabDef {
    readonly id: TabId;
    readonly label: string;
    readonly icon: string;
  }

  const mainTabs: readonly TabDef[] = [
    { id: "home", label: "Home", icon: "house" },
    { id: "tickets", label: "Tickets", icon: "list" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
  ] as const;

  const moreTab: TabDef = {
    id: "more",
    label: "More",
    icon: "menu",
  } as const;

  function handleKeydown(event: KeyboardEvent): void {
    const currentIndex = TAB_IDS.indexOf(active);
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % TAB_IDS.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + TAB_IDS.length) % TAB_IDS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = TAB_IDS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextId = TAB_IDS.at(nextIndex);
    if (nextId == null) return;
    ontabchange(nextId);

    // Focus the newly active tab button
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const tablist = target.closest('[role="tablist"]');
    const buttons = tablist?.querySelectorAll<HTMLElement>('[role="tab"]');
    if (buttons == null) return;
    const nextButton = Array.from(buttons).at(nextIndex);
    nextButton?.focus();
  }
</script>

<nav aria-label="Main navigation">
  <Toolbar tabbar tabbarLabels>
    <div
      class="flex flex-1 justify-start"
      role="tablist"
      onkeydown={handleKeydown}
    >
      {#each mainTabs as tab (tab.id)}
        <button
          role="tab"
          aria-selected={active === tab.id}
          tabindex={active === tab.id ? 0 : -1}
          onclick={() => {
            ontabchange(tab.id);
          }}
          class="tabbar-tab"
          class:tabbar-tab-active={active === tab.id}
        >
          <span class="tabbar-icon" aria-hidden="true">{tab.icon}</span>
          <span class="tabbar-label">{tab.label}</span>
        </button>
      {/each}
      <button
        role="tab"
        aria-selected={active === moreTab.id}
        tabindex={active === moreTab.id ? 0 : -1}
        onclick={() => {
          ontabchange(moreTab.id);
        }}
        class="tabbar-tab tabbar-tab-more"
        class:tabbar-tab-active={active === moreTab.id}
      >
        <span class="tabbar-icon" aria-hidden="true">{moreTab.icon}</span>
        <span class="tabbar-label">{moreTab.label}</span>
      </button>
    </div>
  </Toolbar>
</nav>

<style>
  .tabbar-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 4px 12px;
    min-width: 44px;
    min-height: 44px;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.15s linear;
  }

  .tabbar-tab:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: -2px;
    border-radius: 4px;
  }

  .tabbar-tab-active {
    color: var(--brand-primary);
  }

  .tabbar-tab-more {
    margin-left: auto;
  }

  .tabbar-icon {
    font-size: 20px;
    line-height: 1;
  }

  .tabbar-label {
    font-family: var(--font-ui);
    font-size: 10px;
    line-height: 1;
    font-weight: 500;
  }
</style>
