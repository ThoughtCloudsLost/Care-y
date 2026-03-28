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
  import type { TabId } from "./types";
  import type { Snippet } from "svelte";

  interface AppShellProps {
    activeTab: TabId;
    orgName?: string;
    ontabchange: (tabId: TabId) => void;
    children: Snippet;
  }

  let {
    activeTab,
    orgName = "CARE-Y",
    ontabchange,
    children,
  }: AppShellProps = $props();

  interface TabDef {
    readonly id: TabId;
    readonly label: string;
  }

  const allTabs: readonly TabDef[] = [
    { id: "home", label: "Home" },
    { id: "tickets", label: "Tickets" },
    { id: "calendar", label: "Calendar" },
    { id: "more", label: "More" },
  ] as const;
</script>

<Page>
  <Navbar role="banner">
    {#snippet title()}<span class="riso-heading-compact">{orgName}</span
      >{/snippet}
    {#snippet right()}
      <!-- Placeholder icons: wired in view phases -->
      <Link navbar iconOnly role="button" aria-label="Exposure status">
        <span aria-hidden="true">&#9632;</span>
      </Link>
      <Link navbar iconOnly role="button" aria-label="Search">
        <span aria-hidden="true">&#8981;</span>
      </Link>
      <Link navbar iconOnly role="button" aria-label="New ticket">
        <span aria-hidden="true">+</span>
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
          label={tab.label}
          role="tab"
          aria-selected={activeTab === tab.id}
        />
      {/each}
    </ToolbarPane>
  </Tabbar>

  <!-- Page content: routes render here, scrolls behind navbar/tabbar.
       Padding-bottom clears the fixed tabbar overlay zone. -->
  <div id="main-content" role="main" class="pb-20">
    {@render children()}
  </div>
</Page>
