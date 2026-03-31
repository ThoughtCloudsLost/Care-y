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
  import type { Component } from "svelte";
  import type { TabId, AppShellProps } from "./types";

  let {
    activeTab,
    orgName = "CARE-Y",
    ontabchange,
    children,
  }: AppShellProps = $props();

  interface TabDef {
    readonly id: TabId;
    readonly label: string;
    readonly icon: Component;
  }

  const allTabs: readonly TabDef[] = [
    { id: "home", label: "Home", icon: House },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "more", label: "More", icon: Ellipsis },
  ] as const;
</script>

<Page>
  <Navbar role="banner">
    {#snippet left()}
      <Link iconOnly role="button" aria-label="Account">
        <span class="navbar-avatar" aria-hidden="true">JN</span>
      </Link>
    {/snippet}
    {#snippet title()}<span class="heading-compact">{orgName}</span>{/snippet}
    {#snippet right()}
      <Link iconOnly role="button" aria-label="Search">
        <Search size={22} aria-hidden="true" />
      </Link>
      <Link iconOnly role="button" aria-label="New Ticket">
        <TicketPlus size={22} aria-hidden="true" />
      </Link>
    {/snippet}
  </Navbar>

  <Tabbar
    labels
    class="left-0 bottom-0 fixed"
    role="tablist"
    aria-label="Main navigation"
  >
    <ToolbarPane>
      {#each allTabs as tab (tab.id)}
        <TabbarLink
          active={activeTab === tab.id}
          onclick={() => ontabchange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          colors={{
            textActiveIos: "text-[var(--brand-text)]",
            textActiveMaterial: "text-[var(--brand-text)]",
          }}
        >
          {#snippet icon()}<svelte:component
              this={tab.icon}
              size={24}
              aria-hidden="true"
            />{/snippet}
        </TabbarLink>
      {/each}
    </ToolbarPane>
  </Tabbar>

  <!-- Page content: routes render here, scrolls behind navbar/tabbar.
       Padding-bottom clears the fixed tabbar overlay zone. -->
  <div id="main-content" role="main" class="main-content">
    {@render children()}
  </div>
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
</style>
