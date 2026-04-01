<script lang="ts">
  import { setContext } from "svelte";
  import { browser } from "$app/environment";
  import { CryptoBridge } from "$lib/workers/crypto-bridge.js";

  let { children } = $props();

  // Initialize the CryptoBridge singleton for all authenticated routes.
  // The bridge spawns the Web Worker and captures postMessage at construction
  // time (SEC-210). All (app) child routes access this via getContext('cryptoBridge').
  // Guarded by `browser` because Web Workers do not exist during SSR.
  let bridge: CryptoBridge | undefined;
  if (browser) {
    bridge = new CryptoBridge();
    setContext("cryptoBridge", bridge);
  }

  // Dev-only auto-login with full production crypto pipeline.
  // Runs registerCrypto + loginCrypto + devSeedTickets so the Worker
  // reaches KEYED state and test tickets exist with real ECIES key wraps.
  // The dynamic import is behind import.meta.env.DEV, which Vite replaces
  // with `false` in production builds. The entire import and the auto-login
  // module are stripped by dead-code elimination.
  let devLoginDone = $state(!import.meta.env.DEV);
  let devLoginError = $state<string | null>(null);

  if (import.meta.env.DEV && browser && bridge) {
    const b = bridge;
    void (async () => {
      try {
        const { devAutoLogin } = await import("$lib/dev/auto-login.js");
        await devAutoLogin(b);
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
