<!--
  PhoneApp: root component for the phone iframe document.

  Mounts the real AppShell inside a Konsta App root wrapped in a
  TanStack QueryClientProvider so queries resolve from pre-seeded
  fixture data. Exposes a DemoBridge on window.demoBridge so the
  outer page can drive navigation, scheme, and subscribe to state.

  This is the iframe's entire module graph entry. Router, query
  client, crypto seeding, and goto interception all live here.
-->
<script lang="ts">
  import { App } from "konsta/svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import {
    registerDemoNavigationHandler,
    unregisterDemoNavigationHandler,
  } from "$app/navigation";
  import type { TabId, AreaId } from "$lib/shell/types.js";
  import AppShell from "$lib/shell/AppShell.svelte";
  import DemoSplash from "$demo/DemoSplash.svelte";
  import { getSceneComponent } from "$demo/scenes/index.js";
  import { createDemoRouter } from "$demo/router.svelte.js";
  import { createDemoQueryClient } from "$demo/demo-query-client.js";
  import { demoSeed } from "$lib/crypto/context.js";
  import { setCryptoKeyed } from "$lib/crypto/crypto-keyed.svelte.js";
  import {
    createDemoTickets,
    buildSeedData,
    resetFixtureIds,
  } from "$demo/fixtures/tickets.js";
  import { classifyDemoLabel } from "$demo/topic-classifier.js";
  import type {
    DemoBridge,
    DemoBridgeListener,
    DemoBridgeState,
    DemoTopic,
  } from "$demo/bridge.js";

  // -----------------------------------------------------------------------
  // Router + query client
  // -----------------------------------------------------------------------

  const router = createDemoRouter();
  const queryClient = createDemoQueryClient();

  // Enable crypto-keyed gate so unread chips and pills render
  setCryptoKeyed(true);

  // -----------------------------------------------------------------------
  // Fixture seeding
  // -----------------------------------------------------------------------

  /**
   * Seed the demo caches with fixture data. Seeds display name for
   * navbar avatar initials, queue display names for the list queue
   * column, titles/descriptions/follow-ups for the decrypt cache,
   * read cursors for unread state, and preview data for ticket cards.
   */
  function runFullSeed(): void {
    resetFixtureIds();
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);

    demoSeed({
      titles: seed.titles,
      descriptions: seed.descriptions,
      followUps: seed.followUps,
      followUpContent: seed.followUpContent,
      previews: seed.previews,
      readCursors: seed.readCursors,
      orgValues: {
        "me:display_name": "Jordan Kim",
        ...seed.orgValues,
      },
    });
  }

  // Run initial seed
  runFullSeed();

  // -----------------------------------------------------------------------
  // Dark scheme
  // -----------------------------------------------------------------------

  let dark = $state(false);

  /**
   * Apply dark/light scheme and glass classes to the phone document.
   * Mirrors the product's applyScheme/applyGlassMode (theme.svelte.ts):
   * glass styles are anchored to html-level classes, so scheme classes
   * must live on documentElement. Inside the iframe, documentElement IS
   * the phone document root, which is exactly what we want.
   */
  function applyDarkScheme(isDark: boolean): void {
    const cl = document.documentElement.classList;
    cl.toggle("dark", isDark);
    cl.toggle("light", !isDark);
    cl.toggle("glass-dark", isDark);
    cl.toggle("glass-light", !isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }

  $effect(() => {
    applyDarkScheme(dark);
  });

  // -----------------------------------------------------------------------
  // Scene component
  // -----------------------------------------------------------------------

  const SceneComponent = $derived(getSceneComponent(router.feature));

  // -----------------------------------------------------------------------
  // Topic classification
  // -----------------------------------------------------------------------

  let topic: DemoTopic | null = $state(null);

  // Capture-phase click listener on the phone document. Walks the
  // event target up to the nearest [aria-label] element and classifies
  // the label string to a DemoTopic via the pure classifier.
  $effect(() => {
    function handleClick(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const labeled = target.closest("[aria-label]");
      if (labeled === null) return;

      const ariaLabel = labeled.getAttribute("aria-label");
      if (ariaLabel === null || ariaLabel === "") return;

      const inDetail = router.detail !== null;
      const classified = classifyDemoLabel(ariaLabel, { inDetail });
      if (classified !== null) {
        topic = classified;
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  });

  // -----------------------------------------------------------------------
  // Goto interception
  // -----------------------------------------------------------------------

  // Register goto interception so in-phone goto() calls route through
  // the demo router instead of attempting real navigation.
  $effect(() => {
    const handler = (href: string): void => router.handleGoto(href);
    registerDemoNavigationHandler(handler);
    return () => unregisterDemoNavigationHandler(handler);
  });

  // -----------------------------------------------------------------------
  // Bridge implementation
  // -----------------------------------------------------------------------

  // Intentionally non-reactive: listener membership must not trigger the
  // notification $effect. New listeners receive the current snapshot
  // immediately via subscribe(); the effect fires only on router changes.
  let listeners: readonly DemoBridgeListener[] = [];

  const bridge: DemoBridge = {
    navigate(feature, detail) {
      router.navigate(feature, detail ?? null);
    },

    openSearch() {
      // Programmatically click the navbar search button inside the phone.
      // Uses aria-label matching to find the button reliably. Querying
      // document is fine: the phone document contains only the app.
      const searchBtn = document.querySelector<HTMLElement>(
        '[role="button"][aria-label="Search"]',
      );
      if (searchBtn) {
        searchBtn.click();
      }
    },

    setDark(value: boolean) {
      dark = value;
    },

    subscribe(listener: DemoBridgeListener) {
      listeners = [...listeners, listener];

      // Immediately invoke with current state
      const snapshot: DemoBridgeState = {
        feature: router.feature,
        detail: router.detail,
        searchOpen: router.searchOpen,
        topic,
      };
      listener(snapshot);

      return () => {
        listeners = listeners.filter((entry) => entry !== listener);
      };
    },
  };

  // Publish to window so the outer page can read it from
  // iframe.contentWindow.demoBridge after the iframe loads.
  window.demoBridge = bridge;

  // Notify listeners on router state changes and topic changes
  $effect(() => {
    const snapshot: DemoBridgeState = {
      feature: router.feature,
      detail: router.detail,
      searchOpen: router.searchOpen,
      topic,
    };
    for (const listener of listeners) {
      listener(snapshot);
    }
  });
</script>

<div class="phone-app">
  <QueryClientProvider client={queryClient}>
    <App theme="ios" {dark} class="app-shell">
      <AppShell
        activeTab={router.activeTab}
        activeArea={router.activeArea}
        orgName="CARE-Y"
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
</div>

<style>
  .phone-app {
    height: 100dvh;
  }

  /* Mirror the client root layout (+layout.svelte lines 84-105).
     The demo does not mount that layout, so these globals replicate
     the production constraints for Konsta's shell components. */

  /* Constrain App to viewport for iOS Safari. Page is a non-scrolling
     flex frame. Navbar sits at the top, Tabbar is fixed bottom.
     Scrolling lives on <main> inside AppShell. */
  :global(.app-shell) {
    height: 100dvh;
    min-height: auto;
    overflow: hidden;
  }

  /* Simulate the device safe areas the PWA gets from iOS. Konsta's
     .safe-areas class sets these from env(), which is 0 in a desktop
     iframe; this higher-specificity rule wins and pushes the shell
     below the outer frame's status bar and above its home indicator. */
  .phone-app :global(.app-shell) {
    --k-safe-area-top: 59px;
    --k-safe-area-bottom: 34px;
  }

  /* Page is a non-scrolling flex frame. Scrolling moves to <main> inside
     AppShell so each route gets independent scroll isolation. Navbar sits
     at the top as a flex child; Toolbar is position:fixed, unaffected. */
  :global(.k-page) {
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
  }

  /* Dark mode: paper texture on the page canvas.
     Cards sit above (Konsta Block has z-10). */
  :global(.dark .k-page) {
    isolation: isolate;
  }

  /* A real phone shows overlay scroll indicators only while scrolling;
     desktop browsers paint persistent scrollbars inside the iframe.
     Hide them everywhere in the phone document. Scrolling itself is
     unaffected. */
  .phone-app :global(*) {
    scrollbar-width: none;
  }

  .phone-app :global(*::-webkit-scrollbar) {
    display: none;
  }
</style>
