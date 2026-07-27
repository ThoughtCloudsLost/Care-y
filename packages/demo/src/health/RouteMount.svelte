<!--
  RouteMount: generic component that renders a matched route's layout
  chain and page component for a given pathname.

  Drives the demo's $app stubs before rendering so mounted components
  see consistent page.url, page.params, and page.route.id values.

  Layouts receive a children snippet and nest outermost-to-innermost
  around the page component, matching SvelteKit's rendering model.

  Crypto context note: ticket titles and other encrypted fields will
  render as loading/scrambled placeholders because the crypto-context
  stub has no plaintext for real ciphertext. This is expected for the
  health and does not indicate a bug.
-->
<script lang="ts">
  import type { Component } from "svelte";
  import { matchRoute } from "./route-manifest.js";
  import { setDemoPage } from "../stubs/app-state.svelte.js";
  import HealthProviders from "./HealthProviders.svelte";

  const DEMO_ORIGIN = "http://demo.local";

  let { pathname }: { pathname: string } = $props();

  // ── Route matching ──

  let matchResult = $derived(matchRoute(pathname));

  // ── Drive the $app stubs whenever pathname changes ──
  // HEALTH-FINDING: setDemoPage only accepts a URL; it derives params
  // internally via a hardcoded /tickets/[id] regex and sets route.id
  // to a static string. The engine wave should extend setDemoPage to
  // accept params + routeId so the mounted tree sees the real values.
  // For this health, the stub's built-in derivation covers /tickets/[id]
  // and leaves route.id as the hardcoded value.
  $effect(() => {
    if (matchResult !== null) {
      setDemoPage(new URL(pathname, DEMO_ORIGIN));
    }
  });

  // ── Async component loading ──

  interface LoadedRoute {
    readonly page: Component;
    readonly layouts: readonly Component[];
  }

  let loaded = $state<LoadedRoute | null>(null);
  let loadError = $state<string | null>(null);
  let loading = $state(true);

  // Load page + layouts whenever the match changes
  $effect(() => {
    const match = matchResult;
    if (match === null) {
      loaded = null;
      loadError = null;
      loading = false;
      return;
    }

    loading = true;
    loadError = null;

    const loaders = [match.page(), ...match.layouts.map(async (l) => l())];

    void Promise.all(loaders)
      .then((modules) => {
        const [pageModule, ...layoutModules] = modules;
        if (pageModule === undefined) {
          loadError = "Page module failed to load";
          loading = false;
          return;
        }
        loaded = {
          page: pageModule.default,
          layouts: layoutModules.map((m) => m.default),
        };
        loading = false;
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Unknown load error";
        loadError = message;
        loading = false;
      });
  });
</script>

{#if matchResult === null}
  <div class="health-route-error">
    No route matches: <code>{pathname}</code>
  </div>
{:else if loading}
  <div class="health-route-loading">Loading route chunks...</div>
{:else if loadError !== null}
  <div class="health-route-error">
    Load error: <code>{loadError}</code>
  </div>
{:else if loaded !== null}
  <!--
    Render the layout chain outermost-to-innermost, with the page
    as the innermost content, inside the provider wrapper that
    supplies the shell contexts AppShell would normally provide.
    Svelte 5 does not support recursive snippet nesting dynamically,
    so we unroll up to 3 layout levels (the client routes have at
    most 1 nested layout beyond the excluded root).
  -->
  <HealthProviders>
    {#if loaded.layouts.length === 0}
      <loaded.page />
    {:else if loaded.layouts.length === 1}
      {@const Layout0 = loaded.layouts[0]}
      {#if Layout0}
        <Layout0>
          <loaded.page />
        </Layout0>
      {/if}
    {:else if loaded.layouts.length === 2}
      {@const Layout0 = loaded.layouts[0]}
      {@const Layout1 = loaded.layouts[1]}
      {#if Layout0 && Layout1}
        <Layout0>
          <Layout1>
            <loaded.page />
          </Layout1>
        </Layout0>
      {/if}
    {:else}
      <!-- Fallback: skip layouts beyond depth 2 for this health -->
      <loaded.page />
    {/if}
  </HealthProviders>
{/if}

<style>
  .health-route-loading {
    padding: 1rem;
    font-family: monospace;
    color: #666;
  }

  .health-route-error {
    padding: 1rem;
    font-family: monospace;
    color: #c00;
    background: #fee;
    border: 1px solid #c00;
    border-radius: 4px;
    margin: 0.5rem;
  }

  .health-route-error code {
    font-weight: bold;
  }
</style>
