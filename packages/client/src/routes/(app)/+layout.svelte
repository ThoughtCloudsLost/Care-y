<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import { authKeys } from "$lib/query/keys.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { cacheRegistry } from "$lib/crypto/cache-registry.js";
  import { IdleTimer } from "$lib/auth/idle-timer.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import * as m from "$lib/paraglide/messages.js";
  import AppCryptoProvider from "$lib/providers/AppCryptoProvider.svelte";
  import SSEProvider from "$lib/providers/SSEProvider.svelte";
  import BrandingProvider from "$lib/providers/BrandingProvider.svelte";
  import AppShell from "$lib/shell/AppShell.svelte";
  import ToastRenderer from "$lib/shell/ToastRenderer.svelte";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";
  import type { TabId } from "$lib/shell/types";
  import type { StateChangeEvent } from "$lib/workers/crypto-protocol.js";

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

  // ── Cross-tab state sync + idle timer ──────────────────────────────
  if (browser) {
    const bridge = getCryptoBridge();

    // When another tab zeroes keys (logout, idle timeout), redirect to login.
    bridge.onStateChange((event: StateChangeEvent) => {
      if (event.state === "READY") {
        cacheRegistry.clearAll();
        void goto(resolve("/login"));
      }
    });

    // Zeros keys across all tabs after 15 minutes of inactivity.
    // Warning fires at the 10-minute mark (5 minutes before timeout).
    const idleTimer = new IdleTimer({
      timeoutMs: 15 * 60 * 1000,
      warningMs: 5 * 60 * 1000,
      onWarning: () => {
        toastStore.show(m.session_idle_warning());
      },
      onTimeout: () => {
        void bridge.zeroAll();
        cacheRegistry.clearAll();
        void goto(resolve("/login"));
      },
    });

    $effect(() => {
      if (isAuthenticated) {
        idleTimer.start();
        return () => idleTimer.stop();
      }
    });
  }

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
