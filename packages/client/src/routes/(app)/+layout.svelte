<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import { authKeys } from "$lib/query/keys.js";
  import { trpc } from "$lib/trpc/index.js";
  import AppCryptoProvider from "$lib/providers/AppCryptoProvider.svelte";
  import SSEProvider from "$lib/providers/SSEProvider.svelte";
  import BrandingProvider from "$lib/providers/BrandingProvider.svelte";
  import AppShell from "$lib/shell/AppShell.svelte";
  import ToastRenderer from "$lib/shell/ToastRenderer.svelte";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";
  import type { TabId } from "$lib/shell/types";

  let { children } = $props();

  // ── Auth guard ─────────────────────────────────────────────────────
  // Query auth.me to check session. TanStack deduplicates with AppCryptoProvider's
  // identical query key, so only one network request fires.
  const meQuery = createQuery(() => ({
    queryKey: authKeys.me(),
    queryFn: async () => trpc.auth.me.query(),
    staleTime: Infinity,
    retry: false,
  }));

  const isAuthenticated = $derived(meQuery.isSuccess);

  $effect(() => {
    if (!browser) return;
    if (meQuery.isError) {
      void goto(resolve("/login"));
    }
  });

  // ── Tab routing ────────────────────────────────────────────────────
  type TabRoute = "/" | "/tickets" | "/library";

  const TAB_ROUTES = new Map<TabId, TabRoute>([
    ["home", "/"],
    ["tickets", "/tickets"],
    ["library", "/library"],
  ]);

  const TAB_PREFIXES: [string, TabId][] = [
    ["/tickets", "tickets"],
    ["/library", "library"],
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
  }
</script>

{#if isAuthenticated}
  <AppCryptoProvider>
    <SSEProvider enabled={isAuthenticated}>
      <BrandingProvider>
        <AppShell
          {activeTab}
          orgName={getBrandingTitle()}
          ontabchange={handleTabChange}
        >
          {@render children()}
        </AppShell>
      </BrandingProvider>
    </SSEProvider>
  </AppCryptoProvider>
{/if}
<ToastRenderer />
