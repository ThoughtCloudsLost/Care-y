<!--
  HealthProviders: minimal stand-in for the contexts AppShell and the
  demo's PhoneApp normally provide around mounted route components.

  Provides: Konsta App root (theme/dark variant plumbing), TanStack
  QueryClientProvider (demo query client, network disabled), shell
  contexts (scroll container, tabbar/navbar override containers, tabbar
  hidden flag), and the pull-to-refresh control.

  The overrides are live containers routes mutate; the health renders
  none of their content (no navbar or tabbar exists here), which is
  fine: routes only need the setters to exist.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { App } from "konsta/svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import {
    setScrollContainer,
    setTabbarOverrideCtx,
    setTabbarHiddenCtx,
    setNavbarOverrideCtx,
    type TabbarOverrideContainer,
    type TabbarHiddenContainer,
    type NavbarOverrideContainer,
  } from "$lib/shell/context.js";
  import { providePTR } from "$lib/shell/ptr-context.svelte.js";
  import { createDemoQueryClient } from "../lib/demo-query-client.js";

  let { children }: { children: Snippet } = $props();

  const queryClient = createDemoQueryClient();

  let scrollEl = $state<HTMLElement | undefined>(undefined);
  setScrollContainer(() => scrollEl);

  const tabbarOverride: TabbarOverrideContainer = $state({
    current: undefined,
  });
  setTabbarOverrideCtx(tabbarOverride);

  const tabbarHidden: TabbarHiddenContainer = $state({ current: false });
  setTabbarHiddenCtx(tabbarHidden);

  const navbarOverride: NavbarOverrideContainer = $state({
    current: undefined,
  });
  setNavbarOverrideCtx(navbarOverride);

  providePTR(false);
</script>

<QueryClientProvider client={queryClient}>
  <App theme="ios" class="health-app-root">
    <div class="health-scroll" bind:this={scrollEl}>
      {@render children()}
    </div>
  </App>
</QueryClientProvider>

<style>
  .health-scroll {
    height: 100%;
    overflow-y: auto;
  }
</style>
