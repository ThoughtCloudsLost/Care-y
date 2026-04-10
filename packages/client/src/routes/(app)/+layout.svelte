<script lang="ts">
  import { browser } from "$app/environment";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import ToastRenderer from "$lib/shell/ToastRenderer.svelte";

  let { children } = $props();

  // Dev-only auto-login with full production crypto pipeline.
  // Runs registerCrypto + loginCrypto, rotates the throwaway org keypair,
  // seals KB articles client-side, and seeds test tickets.
  // The dynamic import is behind import.meta.env.DEV, which Vite replaces
  // with `false` in production builds. The entire import and the auto-login
  // module are stripped by dead-code elimination.
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
<ToastRenderer />
