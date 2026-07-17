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
  import { isCryptoKeyed } from "$lib/crypto/crypto-keyed.svelte.js";
  import { isAdminOrgKeyPolling } from "$lib/crypto/admin-org-key-poll.svelte.js";
  import { IdleTimer } from "$lib/auth/idle-timer.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import * as m from "$lib/paraglide/messages.js";
  import { Page, Block, Preloader } from "konsta/svelte";
  import AppCryptoProvider from "$lib/providers/AppCryptoProvider.svelte";
  import SSEProvider from "$lib/providers/SSEProvider.svelte";
  import BrandingProvider from "$lib/providers/BrandingProvider.svelte";
  import AppShell from "$lib/shell/AppShell.svelte";
  import ToastRenderer from "$lib/shell/ToastRenderer.svelte";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";
  import { resolveNavContext } from "$lib/shell/nav-context.js";
  import type { TabId, AreaId } from "$lib/shell/types";
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

  // ── Reactive crypto gate (ADR-049) ──────────────────────────────────
  // Two-layer design: isCryptoKeyed() tracks bridge state accurately
  // (goes false during password change's transient zeroAll). The latch
  // captures the first truthy value and stays true until this component
  // unmounts (navigation to /login on logout/timeout/cross-tab zero).
  let cryptoInitialized = $state(false);

  $effect(() => {
    if (isCryptoKeyed()) {
      cryptoInitialized = true;
    }
  });

  const appReady = $derived(isAuthenticated && cryptoInitialized);

  // Timeout: if authenticated but crypto isn't ready within the deadline,
  // redirect to reauth. Covers Worker crash, SharedWorker disconnect,
  // bfcache restore without Worker. Normal login flow never hits this
  // because the signal is set synchronously before goto("/").
  const isE2E = import.meta.env.VITE_E2E_FAST_KDF === "1";
  let cryptoTimedOut = $state(false);

  $effect(() => {
    if (appReady || !isAuthenticated) {
      cryptoTimedOut = false;
      return;
    }
    // E2E: skip redirect entirely. Dedicated Workers under Playwright can
    // GC-stall briefly; the test's own assertion timeout handles real failures.
    if (isE2E) return;

    const timer = setTimeout(() => {
      cryptoTimedOut = true;
      cacheRegistry.reset();
      const next = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      void goto(resolve(`/login?reauth=1&next=${next}`));
    }, 5_000);
    return () => clearTimeout(timer);
  });

  // ── Cross-tab state sync + idle timer ──────────────────────────────
  if (browser) {
    const bridge = getCryptoBridge();

    // When another tab zeroes keys (logout, idle timeout), redirect to login.
    // The reactive signal (isCryptoKeyed) is updated automatically by the
    // bridge's stateCallback (ADR-049), but we still need cache cleanup
    // and immediate redirect here rather than waiting for the 5s timeout.
    bridge.onStateChange((event: StateChangeEvent) => {
      if (event.state === "READY") {
        cacheRegistry.reset();
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
        cacheRegistry.reset();
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

  // ── Navigation context ──────────────────────────────────────────────
  const navCtx = $derived(resolveNavContext(page.url.pathname));
  const activeTab = $derived(navCtx.tab);
  const activeArea = $derived(navCtx.area);

  function tabRoute(tabId: TabId): `/${string}` {
    switch (tabId) {
      case "home":
        return "/";
      case "tickets":
        return "/tickets";
      case "library":
        return "/library";
    }
  }

  function areaRoute(areaId: AreaId): `/${string}` {
    switch (areaId) {
      case "admin":
        return "/admin";
      case "settings":
        return "/more/settings";
      case "schedule":
        return "/more/schedule";
    }
  }

  function handleTabChange(tabId: TabId): void {
    const route = tabRoute(tabId);
    if (page.url.pathname !== route) {
      void goto(resolve(route));
    }
  }

  function handleAreaTap(areaId: AreaId): void {
    const route = areaRoute(areaId);
    if (page.url.pathname !== route) {
      void goto(resolve(route));
    }
  }
</script>

{#if appReady}
  <AppCryptoProvider>
    {#if isAdminOrgKeyPolling()}
      <Page>
        <div class="org-key-waiting" role="status">
          <Preloader />
          <h2 class="org-key-waiting-title">
            {m.crypto_org_key_waiting_title()}
          </h2>
          <p class="org-key-waiting-body">
            {m.crypto_org_key_waiting_body()}
          </p>
          <p class="org-key-waiting-retry">
            {m.crypto_org_key_waiting_retry()}
          </p>
        </div>
      </Page>
    {:else}
      <SSEProvider enabled={isAuthenticated}>
        <BrandingProvider>
          <AppShell
            {activeTab}
            {activeArea}
            orgName={getBrandingTitle()}
            ontabchange={handleTabChange}
            onareatap={handleAreaTap}
          >
            {@render children()}
          </AppShell>
        </BrandingProvider>
      </SSEProvider>
    {/if}
  </AppCryptoProvider>
{:else if isAuthenticated && !cryptoTimedOut}
  <Page>
    <Block class="crypto-loading">
      <Preloader />
    </Block>
  </Page>
{/if}
<ToastRenderer />

<style>
  :global(.crypto-loading) {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .org-key-waiting {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-xl, 2rem);
    min-height: 60vh;
    gap: var(--space-md, 1rem);
  }

  .org-key-waiting-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--ink);
    margin: var(--space-sm, 0.5rem) 0 0;
  }

  .org-key-waiting-body {
    font-size: 0.875rem;
    color: var(--muted);
    max-width: 20rem;
    margin: 0;
    line-height: 1.5;
  }

  .org-key-waiting-retry {
    font-size: 0.75rem;
    color: var(--muted);
    opacity: 0.7;
    margin: 0;
  }
</style>
