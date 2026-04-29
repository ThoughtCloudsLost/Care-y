<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
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

  // ── Dev-only auto-login ────────────────────────────────────────────
  let devLoginDone = $state(!import.meta.env.DEV);
  let devLoginError = $state<string | null>(null);

  if (import.meta.env.DEV && browser) {
    const bridge = getCryptoBridge();
    const orgKeyManager = getOrgKeyManager();
    void (async () => {
      try {
        const { devAutoLogin } = await import("$lib/dev/auto-login.js");
        await devAutoLogin(bridge, orgKeyManager);
      } catch (err: unknown) {
        console.error("[dev] auto-login failed:", err);
        const code =
          typeof err === "object" && err !== null && "code" in err
            ? (err as Record<string, unknown>).code
            : undefined;
        if (code === "TOO_MANY_REQUESTS") {
          devLoginError =
            "OPRF rate limit hit. Restart Docker (docker compose restart app) to clear.";
        } else {
          devLoginError = `Auto-login failed: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
      devLoginDone = true;
    })();
  }
</script>

{#if devLoginError}
  <div
    style="position:fixed;top:0;left:0;right:0;z-index:9999;padding:1rem;background:#7f1d1d;color:#fca5a5;font-family:monospace;font-size:0.875rem;text-align:center;"
  >
    {devLoginError}
  </div>
{/if}
{#if devLoginDone && isAuthenticated}
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
