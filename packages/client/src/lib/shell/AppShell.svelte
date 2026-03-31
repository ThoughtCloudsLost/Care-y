<!--
  App shell following Konsta's intended composition:
  Everything inside a single <Page>. Navbar is sticky top, Tabbar is fixed
  bottom, content scrolls behind both (iOS frosted glass effect).

  This matches the Konsta docs Tabbar example exactly:
  <Page>
    <Navbar />
    <Tabbar class="left-0 bottom-0 fixed">
      <ToolbarPane>
        <TabbarLink />
      </ToolbarPane>
    </Tabbar>
    ...content...
  </Page>

  ARIA roles on TabbarLink (role="tab", aria-selected) are possible because
  we patch Konsta's Link.svelte to move the hardcoded role="link" BEFORE
  restProps, so our overrides take precedence. See patches/konsta@5.0.8.patch.
-->
<script lang="ts">
  import {
    Page,
    Navbar,
    Link,
    Searchbar,
    Tabbar,
    TabbarLink,
    ToolbarPane,
  } from "konsta/svelte";
  import {
    House,
    Ticket,
    CalendarDays,
    Ellipsis,
    Search,
    TicketPlus,
  } from "@lucide/svelte";
  import { tick } from "svelte";
  import type { Component } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { TabId, AppShellProps } from "./types";

  let {
    activeTab,
    orgName = "CARE-Y",
    ontabchange,
    children,
  }: AppShellProps = $props();

  let searchOpen = $state(false);
  let searchQuery = $state("");
  let searchContainerEl: HTMLDivElement | undefined = $state();

  async function openSearch(): Promise<void> {
    searchOpen = true;
    await tick();
    searchContainerEl
      ?.querySelector<HTMLInputElement>("input[type='text']")
      ?.focus();
  }

  function closeSearch(): void {
    searchOpen = false;
    searchQuery = "";
  }

  interface TabDef {
    readonly id: TabId;
    readonly label: () => string;
    readonly icon: Component;
  }

  const allTabs: readonly TabDef[] = [
    { id: "home", label: () => m.nav_home(), icon: House },
    { id: "tickets", label: () => m.nav_tickets(), icon: Ticket },
    { id: "calendar", label: () => m.nav_calendar(), icon: CalendarDays },
    { id: "more", label: () => m.nav_more(), icon: Ellipsis },
  ];
</script>

<Page>
  <Navbar role="banner">
    {#snippet left()}
      <Link iconOnly role="button" aria-label={m.nav_account()}>
        <span class="navbar-avatar" aria-hidden="true">JN</span>
      </Link>
    {/snippet}
    {#snippet title()}<span
        class="heading-compact"
        class:heading-hidden={searchOpen}>{orgName}</span
      >{/snippet}
    {#snippet right()}
      {#if !searchOpen}
        <Link
          iconOnly
          role="button"
          aria-label={m.nav_search()}
          onclick={openSearch}
        >
          <Search size={22} aria-hidden="true" />
        </Link>
        <Link iconOnly role="button" aria-label={m.nav_new_ticket()}>
          <TicketPlus size={22} aria-hidden="true" />
        </Link>
      {/if}
    {/snippet}
    <div
      bind:this={searchContainerEl}
      class="search-overlay"
      class:search-overlay-open={searchOpen}
    >
      <Searchbar
        bind:value={searchQuery}
        disableButton
        onDisable={closeSearch}
        onClear={() => (searchQuery = "")}
      />
    </div>
  </Navbar>

  <Tabbar
    class="left-0 bottom-0 fixed"
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
  </Tabbar>

  <!-- Page content: routes render here, scrolls behind navbar/tabbar.
       Padding-bottom clears the fixed tabbar overlay zone. -->
  <main id="main-content" class="main-content">
    {@render children()}
  </main>
</Page>

<style>
  .main-content {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
  }

  .navbar-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--brand-fill, var(--brand-primary));
    color: #ffffff;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .heading-hidden {
    opacity: 0;
    transition: opacity 150ms ease;
  }

  .search-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding-inline: 8px;
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    transform: scaleX(0.85);
    transform-origin: right center;
    transition:
      opacity 200ms ease,
      transform 350ms cubic-bezier(0.2, 1, 0.4, 1);
  }

  .search-overlay-open {
    opacity: 1;
    pointer-events: auto;
    transform: scaleX(1);
  }
</style>
