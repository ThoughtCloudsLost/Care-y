<script lang="ts">
  import { setContext } from "svelte";
  import { browser } from "$app/environment";
  import { CryptoBridge } from "$lib/workers/crypto-bridge.js";

  let { children } = $props();

  // Initialize the CryptoBridge singleton for all authenticated routes.
  // The bridge spawns the Web Worker and captures postMessage at construction
  // time (SEC-210). All (app) child routes access this via getContext('cryptoBridge').
  // Guarded by `browser` because Web Workers do not exist during SSR.
  if (browser) {
    const bridge = new CryptoBridge();
    setContext("cryptoBridge", bridge);
  }

  // Dev-only auto-login. The dynamic import is behind import.meta.env.DEV,
  // which Vite replaces with `false` in production builds. The entire import
  // and the auto-login module are stripped by dead-code elimination.
  let devLoginDone = $state(!import.meta.env.DEV);

  if (import.meta.env.DEV && browser) {
    void (async () => {
      try {
        const { devAutoLogin } = await import("$lib/dev/auto-login.js");
        await devAutoLogin();
      } catch (err: unknown) {
        console.error("[dev] auto-login failed:", err);
      }
      devLoginDone = true;
    })();
  }
</script>

<!-- Auth guard placeholder: 6i will add session check + redirect here. -->
{#if devLoginDone}
  {@render children()}
{/if}
