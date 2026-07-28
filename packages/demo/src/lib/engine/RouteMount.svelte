<!--
  RouteMount: generic component that renders a matched route's layout
  chain and page component for a given pathname.

  Drives the demo's $app stubs before rendering so mounted components
  see consistent page.url, page.params, and page.route.id values.

  Layouts receive a children snippet and nest outermost-to-innermost
  around the page component, matching SvelteKit's rendering model.

  The caller (health or phone) wraps this component in their own
  provider shell (HealthProviders or PhoneProviders) to supply the
  shell contexts AppShell would normally provide.

  Crypto context note: ticket titles and other encrypted fields will
  render as loading/scrambled placeholders because the crypto-context
  stub has no plaintext for real ciphertext. This is expected for the
  demo and does not indicate a bug.
-->
<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { matchRoute } from "./route-manifest.js";
  import { setDemoPage } from "../../stubs/app-state.svelte.js";

  const DEMO_ORIGIN = "http://demo.local";

  let {
    pathname,
    wrapper,
  }: {
    pathname: string;
    wrapper?: Snippet<[Snippet]>;
  } = $props();

  // ── Route matching ──

  // The pathname prop may carry a query string (?user=, ?tab=). URL
  // patterns match the path portion only; a "?" in the matched string
  // would silently fall through to the [...path] catch-all route. The
  // full string still feeds page.url below so searchParams survive.
  const matchPath = $derived(pathname.split("?")[0] ?? pathname);

  let matchResult = $derived(matchRoute(matchPath));

  // ── Drive the $app stubs whenever pathname changes ──
  $effect(() => {
    if (matchResult !== null) {
      setDemoPage({
        url: new URL(pathname, DEMO_ORIGIN),
        params: matchResult.params,
        routeId: matchResult.routeId,
      });
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
  // The loading notice only appears when a FIRST mount (no previous
  // screen to keep showing) takes longer than the flash threshold.
  // Between navigations the previous route stays mounted until the
  // next one's chunks are ready, so no intermediate state paints,
  // matching SvelteKit's keep-old-page-until-ready behavior.
  let showSlowNotice = $state(false);

  // Monotonic token: a navigation may supersede an in-flight load,
  // whose late resolution must not clobber the newer route.
  let loadSeq = 0;

  // Load page + layouts whenever the match changes
  $effect(() => {
    const match = matchResult;
    const seq = ++loadSeq;
    if (match === null) {
      loaded = null;
      loadError = null;
      loading = false;
      showSlowNotice = false;
      return;
    }

    loading = true;
    loadError = null;

    const noticeTimer = setTimeout(() => {
      showSlowNotice = true;
    }, 300);

    const loaders = [match.page(), ...match.layouts.map(async (l) => l())];

    void Promise.all(loaders)
      .then((modules) => {
        if (seq !== loadSeq) return;
        const [pageModule, ...layoutModules] = modules;
        if (pageModule === undefined) {
          loadError = "Page module failed to load";
        } else {
          loaded = {
            page: pageModule.default,
            layouts: layoutModules.map((mod) => mod.default),
          };
        }
        loading = false;
        showSlowNotice = false;
      })
      .catch((err: unknown) => {
        if (seq !== loadSeq) return;
        const message =
          err instanceof Error ? err.message : "Unknown load error";
        loadError = message;
        loading = false;
        showSlowNotice = false;
      });

    return () => clearTimeout(noticeTimer);
  });
</script>

{#snippet renderContent()}
  {#if matchResult === null}
    <div class="route-error">
      No route matches: <code>{pathname}</code>
    </div>
  {:else if loading && loaded === null}
    {#if showSlowNotice}
      <div class="route-loading">{m.demo_route_loading()}</div>
    {/if}
  {:else if loadError !== null}
    <div class="route-error">
      Load error: <code>{loadError}</code>
    </div>
  {:else if loaded !== null}
    <!--
      Render the layout chain outermost-to-innermost, with the page
      as the innermost content. Svelte 5 does not support recursive
      snippet nesting dynamically, so we unroll up to 3 layout levels
      (the client routes have at most 1 nested layout beyond the
      excluded root).
    -->
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
      <!-- Fallback: skip layouts beyond depth 2 -->
      <loaded.page />
    {/if}
  {/if}
{/snippet}

{#if wrapper}
  {@render wrapper(renderContent)}
{:else}
  {@render renderContent()}
{/if}

<style>
  .route-loading {
    padding: 1rem;
    font-family: monospace;
    color: #666;
  }

  .route-error {
    padding: 1rem;
    font-family: monospace;
    color: #c00;
    background: #fee;
    border: 1px solid #c00;
    border-radius: 4px;
    margin: 0.5rem;
  }

  .route-error code {
    font-weight: bold;
  }
</style>
