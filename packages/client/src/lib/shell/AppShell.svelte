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
    readonly icon: string;
  }

  const allTabs: readonly TabDef[] = [
    { id: "home", label: "Home", icon: "\u2302" },
    { id: "tickets", label: "Tickets", icon: "\u2709" },
    { id: "calendar", label: "Calendar", icon: "\u2630" },
    { id: "more", label: "More", icon: "\u22EF" },
  ] as const;
</script>

<Page>
  <Navbar role="banner">
    {#snippet title()}<span class="heading-compact">{orgName}</span>{/snippet}
    {#snippet right()}
      <!-- Placeholder icons: wired in view phases -->
      <Link iconOnly role="button" aria-label="Search">
        <span aria-hidden="true" class="text-lg">&#8981;</span>
      </Link>
      <Link iconOnly role="button" aria-label="Account">
        <span class="navbar-avatar" aria-hidden="true">JN</span>
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
          colors={{
            textActiveIos: "text-[var(--brand-text)]",
            textActiveMaterial: "text-[var(--brand-text)]",
          }}
        >
          {#snippet icon()}<span aria-hidden="true" class="text-lg"
              >{tab.icon}</span
            >{/snippet}
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
