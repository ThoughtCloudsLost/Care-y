<script lang="ts">
  import "../app.css";
  import { App } from "konsta/svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { onNavigate } from "$app/navigation";
  import favicon from "$lib/assets/favicon.svg";
  import { themeStore } from "$lib/stores/theme.svelte";
  import RisoInkFilter from "$lib/components/RisoInkFilter.svelte";
  import AppTabbar from "$lib/shell/AppTabbar.svelte";
  import AppNavbar from "$lib/shell/AppNavbar.svelte";
  import type { TabId } from "$lib/shell/types";

  let { children } = $props();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });

  // View transitions (180ms linear, constant velocity per Riso aesthetic).
  // startViewTransition is not yet in all TS DOM lib types.
  function hasViewTransitions(doc: Document): doc is Document & {
    startViewTransition: (cb: () => Promise<void>) => void;
  } {
    return "startViewTransition" in doc;
  }

  onNavigate(async (navigation) => {
    if (!hasViewTransitions(document)) return;
    await new Promise<void>((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  let activeTab: TabId = $state("home");

  function handleTabChange(tabId: TabId): void {
    activeTab = tabId;
    // Tab-to-route mapping wired when route structure exists
  }
</script>

<svelte:head>
  <title>CARE-Y</title>
  <link rel="icon" href={favicon} />
</svelte:head>

<RisoInkFilter />

<!-- ARIA live regions: downstream components publish announcements here -->
<div
  aria-live="assertive"
  aria-atomic="true"
  class="sr-only"
  id="live-assertive"
></div>
<div
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
  id="live-polite"
></div>

<!-- Toast container for screen reader announcements -->
<div role="status" id="toast-container"></div>

<QueryClientProvider client={queryClient}>
  <App theme={themeStore.current} dark={themeStore.resolvedScheme === "dark"}>
    <AppNavbar title="CARE-Y">
      {#snippet right()}
        <!-- Placeholder icons: wired in view phases -->
        <button class="navbar-icon" aria-label="Exposure status" type="button">
          <span aria-hidden="true">&#9632;</span>
        </button>
        <button class="navbar-icon" aria-label="Search" type="button">
          <span aria-hidden="true">&#8981;</span>
        </button>
        <button class="navbar-icon" aria-label="New ticket" type="button">
          <span aria-hidden="true">+</span>
        </button>
      {/snippet}
    </AppNavbar>
    <main id="main-content">
      {@render children()}
    </main>
    <AppTabbar active={activeTab} ontabchange={handleTabChange} />
  </App>
</QueryClientProvider>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .navbar-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    padding: 0 4px;
    background: none;
    border: none;
    color: var(--ink);
    font-size: 18px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .navbar-icon:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: -2px;
    border-radius: 4px;
  }
</style>
