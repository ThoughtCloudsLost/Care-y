<!--
  Demo site outer page: two-column layout with phone frame and
  narrative panel on desktop, stacked on mobile. Hosts the router,
  query client, feature list, and dark mode toggle.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { Button } from "konsta/svelte";
  import { RotateCcw, Sun, Moon } from "@lucide/svelte";
  import DemoSurface from "$demo/DemoSurface.svelte";
  import NarrativePanel from "$demo/NarrativePanel.svelte";
  import FeatureList from "$demo/FeatureList.svelte";
  import { createDemoRouter } from "$demo/router.svelte.js";
  import { createDemoQueryClient } from "$demo/demo-query-client.js";
  import { demoSeed, demoReset } from "$lib/crypto/context.js";
  import { demoResetTrpc } from "$lib/trpc/index.js";

  let dark = $state(false);

  // Mirror the product's applyScheme/applyGlassMode (theme.svelte.ts):
  // the glass styles are anchored to html-level classes
  // (html.glass-dark and friends), so scheme classes must live on
  // documentElement, not on the frame. Glass mode follows the scheme
  // (the product's "auto" behavior).
  $effect(() => {
    const cl = document.documentElement.classList;
    cl.toggle("dark", dark);
    cl.toggle("light", !dark);
    cl.toggle("glass-dark", dark);
    cl.toggle("glass-light", !dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  });

  const router = createDemoRouter();
  const queryClient = createDemoQueryClient();

  let surfaceRef: DemoSurface | undefined = $state();

  // Seed the org value cache with the demo user's display name so
  // the navbar avatar initials resolve (AppShell reads orgDecryptCache
  // under the key "me:display_name").
  demoSeed({
    orgValues: { "me:display_name": "Jordan Kim" },
  });

  function handleRestart(): void {
    demoReset();
    demoResetTrpc();
    router.reset();
    // Re-seed after reset so the avatar stays resolved
    demoSeed({
      orgValues: { "me:display_name": "Jordan Kim" },
    });
  }

  function handleTriggerSearch(): void {
    if (surfaceRef) {
      surfaceRef.triggerSearch();
    } else {
      // Fallback: navigate via router if surface ref not available
      router.navigate("search");
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
        <DemoSurface
          {dark}
          {router}
          {queryClient}
          orgName="CARE-Y"
          bind:this={surfaceRef}
        />
      </div>
    </div>

    <div class="demo-side-column">
      <FeatureList {router} ontriggersearch={handleTriggerSearch} />
      <NarrativePanel
        feature={router.feature}
        detail={router.detail}
        searchOpen={router.searchOpen}
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
