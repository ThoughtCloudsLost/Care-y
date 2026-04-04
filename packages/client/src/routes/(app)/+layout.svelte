<script lang="ts">
  import { browser } from "$app/environment";
  import { createQuery } from "@tanstack/svelte-query";
  import { CryptoBridge } from "$lib/workers/crypto-bridge.js";
  import { OrgKeyManager } from "$lib/crypto/org-key.js";
  import { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
  import { TicketDecryptCache } from "$lib/crypto/ticket-decrypt-cache.js";
  import { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
  import { cacheRegistry } from "$lib/crypto/cache-registry.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    setCryptoBridge,
    setOrgKeyManager,
    setOrgDecryptCache,
    setTicketDecryptCache,
    setFollowUpDecryptCache,
    setCurrentUserId,
  } from "$lib/crypto/context.js";

  let { children } = $props();

  // Initialize crypto singletons for all authenticated routes.
  // Guarded by `browser` because Web Workers do not exist during SSR.
  let bridge: CryptoBridge | undefined;
  let orgKeyManager: OrgKeyManager | undefined;

  if (browser) {
    // CryptoBridge spawns the Web Worker and captures postMessage at
    // construction time (SEC-210).
    bridge = new CryptoBridge();
    setCryptoBridge(bridge);

    // OrgKeyManager holds the org secret key on the main thread for
    // non-PII tier decryption (KB titles, display names, branding).
    // Loaded during login; zeroed on logout.
    orgKeyManager = new OrgKeyManager();
    setOrgKeyManager(orgKeyManager);

    // Decrypt caches: org-key tier (sync, main thread) and ticket
    // tier (async, Worker ECIES). Both use SvelteMap for reactivity.
    setOrgDecryptCache(new OrgDecryptCache(orgKeyManager));
    setTicketDecryptCache(new TicketDecryptCache(bridge));

    const followUpCache = new FollowUpDecryptCache(bridge);
    setFollowUpDecryptCache(followUpCache);

    // Dev-mode: verify all expected caches are registered.
    // New caches added by future phases must be appended to this list.
    if (import.meta.env.DEV) {
      const expected = [
        "TicketDecryptCache",
        "FollowUpDecryptCache",
        "OrgDecryptCache",
      ];
      const registered = cacheRegistry.registered;
      const missing = expected.filter((n) => !registered.includes(n));
      if (missing.length > 0) {
        console.error(
          `[CacheRegistry] missing registrations: ${missing.join(", ")}`,
        );
      }
    }
  }

  // Current user identity, shared to all authenticated pages via context.
  const meQuery = createQuery(() => ({
    queryKey: ["auth", "me"],
    queryFn: async () => trpc.auth.me.query(),
    staleTime: Infinity,
  }));
  const currentUserId = $derived(meQuery.data?.user.id);
  setCurrentUserId(() => currentUserId);

  // Dev-only auto-login with full production crypto pipeline.
  // Runs registerCrypto + loginCrypto, rotates the throwaway org keypair,
  // seals KB articles client-side, and seeds test tickets.
  // The dynamic import is behind import.meta.env.DEV, which Vite replaces
  // with `false` in production builds. The entire import and the auto-login
  // module are stripped by dead-code elimination.
  let devLoginDone = $state(!import.meta.env.DEV);
  let devLoginError = $state<string | null>(null);

  if (import.meta.env.DEV && browser && bridge && orgKeyManager) {
    const b = bridge;
    const okm = orgKeyManager;
    void (async () => {
      try {
        const { devAutoLogin } = await import("$lib/dev/auto-login.js");
        await devAutoLogin(b, okm);
      } catch (err: unknown) {
        console.error("[dev] auto-login failed:", err);
        // Surface rate limit errors visibly so they're not silently swallowed.
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

<!-- Auth guard placeholder: 6i will add session check + redirect here. -->
{#if devLoginError}
  <div
    style="position:fixed;top:0;left:0;right:0;z-index:9999;padding:1rem;background:#7f1d1d;color:#fca5a5;font-family:monospace;font-size:0.875rem;text-align:center;"
  >
    {devLoginError}
  </div>
{/if}
{#if devLoginDone}
  {@render children()}
{/if}
