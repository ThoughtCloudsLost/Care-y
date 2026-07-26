<!--
  Demo site outer page: two-column layout with phone frame and
  narrative panel on desktop, stacked on mobile. The phone app runs
  inside a real-viewport iframe (owned by DemoFrame). This outer
  page holds the bridge wiring, feature list, narrative, dark mode
  toggle, and restart control. It does not import the router, query
  client, or any seeded singleton to avoid creating a second module
  instance outside the iframe's graph.
-->
<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import * as m from "$lib/paraglide/messages.js";
  import { Button } from "konsta/svelte";
  import { RotateCcw, Sun, Moon } from "@lucide/svelte";
  import NarrativePanel from "$demo/NarrativePanel.svelte";
  import FeatureList from "$demo/FeatureList.svelte";
  import DemoFrame from "$demo/DemoFrame.svelte";
  import type { DemoBridge, DemoBridgeState, DemoTopic } from "$demo/bridge.js";
  import type { DemoFeature } from "$demo/router.svelte.js";

  let dark = $state(false);

  let bridge: DemoBridge | undefined = $state();
  let phoneState: DemoBridgeState = $state({
    feature: null,
    detail: null,
    searchOpen: false,
    topic: null,
  });
  let unsubscribe: (() => void) | undefined;

  let frameRef: DemoFrame | undefined = $state();

  // Accumulated set of topics the user has triggered. SvelteSet so
  // reads in the template react to additions; one instance for the
  // page's lifetime, cleared (reactively) on restart.
  const seenTopics = new SvelteSet<DemoTopic>();

  // Mirror the product's applyScheme/applyGlassMode (theme.svelte.ts):
  // the glass styles are anchored to html-level classes
  // (html.glass-dark and friends), so scheme classes must live on
  // documentElement, not the frame. Glass mode follows the scheme
  // (the product's "auto" behavior).
  $effect(() => {
    const cl = document.documentElement.classList;
    cl.toggle("dark", dark);
    cl.toggle("light", !dark);
    cl.toggle("glass-dark", dark);
    cl.toggle("glass-light", !dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  });

  // Forward dark changes to the phone iframe when the bridge is live
  $effect(() => {
    bridge?.setDark(dark);
  });

  function handleBridgeReady(b: DemoBridge): void {
    // Tear down any prior subscription (happens on iframe reload)
    unsubscribe?.();
    bridge = b;

    // Reset seen topics and current topic on restart/reload
    seenTopics.clear();

    // Sync the phone to the outer page's current dark state
    b.setDark(dark);

    unsubscribe = b.subscribe((state) => {
      phoneState = state;
      // Accumulate topics as the user explores
      if (state.topic !== null) {
        seenTopics.add(state.topic);
      }
    });
  }

  function handleRestart(): void {
    frameRef?.reload();
  }

  function handleFeatureSelect(id: DemoFeature): void {
    if (id === "search") {
      bridge?.openSearch();
    } else {
      bridge?.navigate(id);
    }
  }
</script>

<div class="demo-page">
  <header class="demo-header">
    <h1 class="demo-title">{m.demo_app_title()}</h1>
    <p class="demo-subtitle">{m.demo_subtitle()}</p>

    <div class="demo-controls">
      <button
        class="theme-toggle"
        onclick={() => (dark = !dark)}
        aria-label={m.demo_theme_toggle()}
        type="button"
      >
        {#if dark}
          <Sun size={20} />
        {:else}
          <Moon size={20} />
        {/if}
      </button>

      <Button small clear onclick={handleRestart} aria-label={m.demo_restart()}>
        <RotateCcw size={16} />
      </Button>
    </div>
  </header>

  <div class="demo-layout">
    <div class="demo-phone-column">
      <div class="demo-stage">
        <DemoFrame
          {dark}
          onbridgeready={handleBridgeReady}
          bind:this={frameRef}
        />
      </div>
    </div>

    <div class="demo-side-column">
      <FeatureList
        feature={phoneState.feature}
        topic={phoneState.topic}
        {seenTopics}
        onselect={handleFeatureSelect}
      />
      <NarrativePanel
        feature={phoneState.feature}
        detail={phoneState.detail}
        searchOpen={phoneState.searchOpen}
        topic={phoneState.topic}
      />
    </div>
  </div>
</div>

<style>
  .demo-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 1.5rem;
    gap: 1rem;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    background: #f5f5f7;
    color: #1d1d1f;
  }

  .demo-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    max-width: 960px;
    text-align: center;
  }

  .demo-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .demo-subtitle {
    font-size: 0.9375rem;
    color: #86868b;
    margin: 0 0 0.5rem;
  }

  .demo-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid #d1d1d6;
    background: white;
    cursor: pointer;
    color: #1d1d1f;
    flex-shrink: 0;
  }

  .theme-toggle:hover {
    background: #f0f0f0;
  }

  .demo-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 960px;
  }

  .demo-phone-column {
    width: 100%;
    max-width: 420px;
  }

  .demo-stage {
    width: 100%;
    aspect-ratio: 414 / 868;
    max-height: calc(100vh - 240px);
  }

  .demo-side-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 420px;
  }

  /* Outer page follows the html-level scheme classes the toggle sets */
  :global(html.dark) .demo-page {
    background: #161618;
    color: #f5f5f7;
  }

  :global(html.dark) .demo-subtitle {
    color: #98989d;
  }

  :global(html.dark) .theme-toggle {
    background: #2c2c2e;
    border-color: #3a3a3c;
    color: #f5f5f7;
  }

  :global(html.dark) .theme-toggle:hover {
    background: #3a3a3c;
  }

  /* Desktop: two-column side by side */
  @media (min-width: 900px) {
    .demo-layout {
      flex-direction: row;
      align-items: flex-start;
      gap: 2rem;
    }

    .demo-phone-column {
      flex: 0 0 420px;
    }

    .demo-side-column {
      flex: 1;
      min-width: 0;
      max-width: none;
      padding-top: 1rem;
    }

    .demo-stage {
      max-height: calc(100vh - 200px);
    }
  }
</style>
