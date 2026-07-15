<!--
  ThemeProvider: Konsta UI framework wrapper + dev theme panel.

  Applies the current UI theme (ios/material) and color scheme
  (dark/light) to the Konsta <App> root. All Konsta components
  below this point inherit theme context.

  The DevThemePanel is dynamically imported behind import.meta.env.DEV
  so it is fully stripped from production builds by Vite dead-code
  elimination. Never convert to a static import.

  Sits below BrandingProvider because branding determines the color
  palette that Konsta renders. Sits above AppShell because AppShell's
  Konsta components (Page, Navbar, Toolbar) need the theme context.
-->
<script lang="ts">
  import { App } from "konsta/svelte";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import RisoInkFilter from "$lib/components/RisoInkFilter.svelte";
  import type { Component, Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  let DevPanel = $state<Component | null>(null);
  if (import.meta.env.DEV) {
    void import("$lib/components/DevThemePanel.svelte").then(
      (m) => (DevPanel = m.default),
    );
  }
</script>

{#if themeStore.visualTheme === "riso"}
  <RisoInkFilter />
{/if}

<App
  theme={themeStore.current}
  dark={themeStore.resolvedScheme === "dark"}
  class="app-shell"
  data-testid="app-root"
>
  {@render children()}
  <!-- {#if DevPanel}
    <DevPanel />
  {/if} -->
</App>
