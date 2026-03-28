<script lang="ts">
  import "../app.css";
  import { App } from "konsta/svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { onNavigate } from "$app/navigation";
  import favicon from "$lib/assets/favicon.svg";
  import { themeStore } from "$lib/stores/theme.svelte";
  import RisoInkFilter from "$lib/components/RisoInkFilter.svelte";
  import AppShell from "$lib/shell/AppShell.svelte";
  import DevThemePanel from "$lib/components/DevThemePanel.svelte";
  import type { TabId } from "$lib/shell/types";

  const isDev = import.meta.env.DEV;

  let { children } = $props();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });

  // View transitions (180ms linear).
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

{#if themeStore.visualTheme === "riso"}
  <RisoInkFilter />
{/if}

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
  <App
    theme={themeStore.current}
    dark={themeStore.resolvedScheme === "dark"}
    class="app-shell"
  >
    <AppShell {activeTab} ontabchange={handleTabChange}>
      {@render children()}
    </AppShell>
    {#if isDev}
      <DevThemePanel />
    {/if}
  </App>
</QueryClientProvider>

<style>
  /* Constrain App to viewport for iOS Safari. Konsta manages layout
     internally: Page is absolute + overflow-auto, Navbar is sticky top,
     Tabbar is fixed bottom. */
  :global(.app-shell) {
    height: 100dvh;
    min-height: auto;
    overflow: hidden;
  }

  /* Dark mode: paper texture on the page canvas.
     TODO: Replace with scanned dark paper stock texture.
     Cards sit above (Konsta Block has z-10). */
  :global(html.dark .k-page) {
    position: relative;
    isolation: isolate;
  }

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
</style>
