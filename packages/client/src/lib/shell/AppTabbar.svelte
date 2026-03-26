<!--
  Bottom tab bar using Konsta's Tabbar for native chrome (background, safe areas,
  correct height per theme). Buttons use manual Konsta tabbar-link classes for
  native styling while keeping WAI-ARIA APG tabs pattern (role="tab",
  aria-selected, roving tabindex, arrow key navigation).

  Konsta's Link component hardcodes role="link" after the prop spread (Link.svelte
  line 128), making it impossible to pass role="tab". Custom buttons are necessary.
-->
<script lang="ts">
  import { Tabbar } from "konsta/svelte";
  import { TAB_IDS, type AppTabbarProps, type TabId } from "./types";
  import { themeStore } from "$lib/stores/theme.svelte";

  let { active, ontabchange }: AppTabbarProps = $props();

  interface TabDef {
    readonly id: TabId;
    readonly label: string;
    readonly icon: string;
  }

  const allTabs: readonly TabDef[] = [
    { id: "home", label: "Home", icon: "house" },
    { id: "tickets", label: "Tickets", icon: "list" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "more", label: "More", icon: "menu" },
  ] as const;

  const activeIndex = $derived(TAB_IDS.indexOf(active));

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

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const tablist = target.closest('[role="tablist"]');
    const buttons = tablist?.querySelectorAll<HTMLElement>('[role="tab"]');
    if (buttons == null) return;
    const nextButton = Array.from(buttons).at(nextIndex);
    nextButton?.focus();
  }
</script>

<!-- bgClass adds iOS glass treatment to the Toolbar's background div.
     Konsta's Toolbar template omits the bgBlur div that Navbar renders,
     so we apply glass colors + shadow + blur directly on the bg div. -->
<Tabbar
  labels
  bgClass={themeStore.current === "ios"
    ? "!bg-ios-light-glass !shadow-ios-light-glass backdrop-blur-lg dark:!bg-ios-dark-glass dark:!shadow-ios-dark-glass hairline-t"
    : ""}
>
  <div
    class="flex w-full h-full relative"
    role="tablist"
    tabindex="-1"
    aria-label="Main navigation"
    onkeydown={handleKeydown}
  >
    {#each allTabs as tab (tab.id)}
      {@const isActive = active === tab.id}
      <button
        role="tab"
        aria-selected={isActive}
        tabindex={isActive ? 0 : -1}
        onclick={() => ontabchange(tab.id)}
        class="k-link w-full h-full duration-300 transition-colors relative
               flex flex-col items-center justify-center gap-0.5
               cursor-pointer select-none border-none bg-transparent
               {isActive ? 'k-tabbar-link-active text-primary' : ''}
               focus-visible:outline-2 focus-visible:outline-primary
               focus-visible:outline-offset-[-2px] focus-visible:rounded"
      >
        <span class="text-xl leading-none" aria-hidden="true">{tab.icon}</span>
        <span class="text-2xs leading-none font-medium">{tab.label}</span>
      </button>
    {/each}

    <!-- Material highlight bar (custom implementation since Konsta's built-in
         one can't find tabs inside our wrapper div) -->
    {#if themeStore.current === "material"}
      <span
        class="absolute top-0 left-0 h-0.5 bg-primary transition-transform duration-300"
        style:width="{100 / allTabs.length}%"
        style:transform="translateX({activeIndex * 100}%)"
      ></span>
    {/if}
  </div>
</Tabbar>
