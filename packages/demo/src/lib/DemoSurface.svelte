<!--
  DemoSurface: mounts the real AppShell inside a Konsta App root,
  wrapped in a TanStack QueryClientProvider so AppShell's queries
  resolve from pre-seeded fixture data.

  Renders the current scene from the scenes registry as AppShell's
  children content. Exposes a triggerSearch() function that
  programmatically clicks the navbar search button to open the
  search overlay from outside the phone frame.
-->
<script lang="ts">
  import { App } from "konsta/svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import type { QueryClient } from "@tanstack/svelte-query";
  import {
    registerDemoNavigationHandler,
    unregisterDemoNavigationHandler,
  } from "$app/navigation";
  import type { TabId, AreaId } from "$lib/shell/types.js";
  import AppShell from "$lib/shell/AppShell.svelte";
  import DemoFrame from "./DemoFrame.svelte";
  import DemoSplash from "./DemoSplash.svelte";
  import { getSceneComponent } from "./scenes/index.js";
  import type { DemoRouter } from "./router.svelte.js";

  interface Props {
    dark?: boolean;
    router: DemoRouter;
    queryClient: QueryClient;
    orgName?: string;
  }

  let {
    dark = false,
    router,
    queryClient,
    orgName = "CARE-Y",
  }: Props = $props();

  let surfaceEl: HTMLDivElement | undefined = $state();

  const SceneComponent = $derived(getSceneComponent(router.feature));

  // Register goto interception so in-phone goto() calls route through
  // the demo router instead of attempting real navigation.
  $effect(() => {
    const handler = (href: string): void => router.handleGoto(href);
    registerDemoNavigationHandler(handler);
    return () => unregisterDemoNavigationHandler(handler);
  });

  /**
   * Programmatically click the navbar search button inside the frame.
   * Called from the outer FeatureList when the user selects Search.
   * Uses aria-label matching to find the button reliably.
   */
  export function triggerSearch(): void {
    if (!surfaceEl) return;
    // The search Link in AppShell has aria-label matching the nav_search() message.
    // Find it by role="button" + the Search icon container.
    const searchBtn = surfaceEl.querySelector<HTMLElement>(
      '[role="button"][aria-label="Search"]',
    );
    if (searchBtn) {
      searchBtn.click();
    }
  }
</script>

<div class="demo-surface" bind:this={surfaceEl}>
  <DemoFrame {dark}>
    <QueryClientProvider client={queryClient}>
      <App theme="ios" {dark} class="app-shell">
        <AppShell
          activeTab={router.activeTab}
          activeArea={router.activeArea}
          {orgName}
          ontabchange={(tabId: TabId) => router.handleTabChange(tabId)}
          onareatap={(areaId: AreaId) => router.handleAreaTap(areaId)}
          onsearchtoggle={(open: boolean) => router.handleSearchToggle(open)}
        >
          {#if SceneComponent}
            <SceneComponent />
          {/if}
        </AppShell>
      </App>
      <DemoSplash dismissed={router.feature !== null || router.searchOpen} />
    </QueryClientProvider>
  </DemoFrame>
</div>

<style>
  .demo-surface {
    width: 100%;
    height: 100%;
  }

  /* Mirror the client layout's .app-shell / .k-page globals, scoped
     to the demo frame. Uses 100% instead of 100dvh because the app
     fills the device frame, not the viewport. */
  .demo-surface :global(.app-shell) {
    height: 100%;
    min-height: auto;
    overflow: hidden;
    /* Simulate the device safe areas the PWA gets from iOS. Konsta's
       .safe-areas class sets these from env(), which is 0 in a desktop
       browser; this higher-specificity rule wins and pushes the shell
       below the frame's status bar and above the home indicator. */
    --k-safe-area-top: 59px;
    --k-safe-area-bottom: 34px;
  }

  .demo-surface :global(.k-page) {
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
  }

  .demo-surface :global(.dark .k-page) {
    isolation: isolate;
  }

  /* Production sizes the search sheet with 100dvh (browser viewport).
     Inside the frame the containing block for fixed elements is the
     device, so 100% refers to its padding box and lands the sheet's
     top edge at the navbar's bottom, matching production geometry. */
  .demo-surface :global(.search-sheet) {
    height: calc(100% - var(--navbar-h, 64px) - 8px);
  }

  /* ShellMessagebar anchors its top at --app-height (fallback 100dvh,
     the browser viewport) and translates up by its own height. Inside
     the frame the screen is the fixed containing block, so 100% puts
     the anchor at the screen's bottom edge instead of below it. */
  .demo-surface :global(.app-shell) {
    --app-height: 100%;
  }
</style>
