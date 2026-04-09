<script lang="ts">
  import "../app.css";
  import { App } from "konsta/svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import favicon from "$lib/assets/favicon.svg";
  import { themeStore } from "$lib/stores/theme.svelte";
  import { initKeyboardViewport } from "$lib/utils/keyboard-viewport";
  import { announceToLiveRegion } from "$lib/utils/announce";
  import { createSSEListener } from "$lib/sse/index.svelte";
  import { getCachedBranding, applyBranding } from "$lib/branding/index.js";
  import RisoInkFilter from "$lib/components/RisoInkFilter.svelte";
  import AppShell from "$lib/shell/AppShell.svelte";
  import type { Component } from "svelte";
  import type { TabId } from "$lib/shell/types";

  // DevThemePanel is dynamically imported so it is fully excluded from prod
  // bundles. Never convert this to a static import. A static import alone
  // ships the module even when the render branch is dead-code-eliminated.
  let DevPanel = $state<Component | null>(null);
  if (import.meta.env.DEV) {
    void import("$lib/components/DevThemePanel.svelte").then(
      (m) => (DevPanel = m.default),
    );
  }

  let { children } = $props();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });

  // Derive active tab from the current URL path.
  // "more" is a menu trigger (not a route), so it has no entry here.
  type TabRoute = "/" | "/tickets" | "/calendar";

  const TAB_ROUTES = new Map<TabId, TabRoute>([
    ["home", "/"],
    ["tickets", "/tickets"],
    ["calendar", "/calendar"],
  ]);

  const TAB_PREFIXES: [string, TabId][] = [
    ["/tickets", "tickets"],
    ["/calendar", "calendar"],
  ];

  const activeTab: TabId = $derived.by(() => {
    const path = page.url.pathname;
    for (const [prefix, tab] of TAB_PREFIXES) {
      if (path === prefix || path.startsWith(prefix + "/")) return tab;
    }
    return "home";
  });

  function handleTabChange(tabId: TabId): void {
    const route = TAB_ROUTES.get(tabId);
    if (route !== undefined && page.url.pathname !== route) {
      void goto(resolve(route));
    }
    // Tabs without a route entry (e.g. "more") are menu triggers, not navigation.
  }

  const sseListener = createSSEListener({
    url: "/sse/events",
    queryClient,
    onConnectionChange: (isConnected) => {
      if (!isConnected) {
        announceToLiveRegion(
          "assertive",
          "Real-time connection lost. Reconnecting...",
        );
      }
    },
  });

  onMount(() => {
    if (!browser) return;

    // Reveal page now that CSS is loaded and hydration is complete.
    document.body.classList.remove("fouc-guard");

    const cleanupKeyboard = initKeyboardViewport();

    // Apply cached org branding if available (pre-login display).
    // Full branding load (fetch + decrypt) happens after login (6i).
    void getCachedBranding().then((cached) => {
      if (cached) void applyBranding(cached);
    });

    // SSE connects unconditionally for now; auth guard added when login flow exists (6i)
    sseListener.connect();

    return () => {
      cleanupKeyboard();
      sseListener.disconnect();
    };
  });
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
    {#if DevPanel}
      <DevPanel />
    {/if}
  </App>
</QueryClientProvider>

<style>
  /* Constrain App to viewport for iOS Safari. Page is a non-scrolling
     flex frame. Navbar sits at the top, Tabbar is fixed bottom.
     Scrolling lives on <main> inside AppShell. */
  :global(.app-shell) {
    height: 100dvh;
    min-height: auto;
    overflow: hidden;
  }

  /* Page is a non-scrolling flex frame. Scrolling moves to <main> inside
     AppShell so each route gets independent scroll isolation. Navbar sits
     at the top as a flex child; Toolbar is position:fixed, unaffected. */
  :global(.k-page) {
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
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
