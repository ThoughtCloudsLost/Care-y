<!--
  BrandingProvider: org branding lifecycle.

  Currently: loads cached branding from the Service Worker cache on mount
  and applies the color palette + document title. This is the pre-login
  display path (cached from a previous session).

  Future (6i login flow): this provider will gain the full decrypt-based
  branding pipeline. After login, it will:
    - Fetch encrypted branding from the server via tRPC
    - Decrypt using the org key from CryptoProvider (its parent)
    - Expose branding state as Svelte context (org name, logo blob URL,
      primary/accent colors) for children to consume
    - Cache the decrypted result in the SW for the next session's
      pre-login display

  This provider exists as a boundary now so that the branding lifecycle
  has a clear home. Do not fold branding logic into CryptoProvider or
  ThemeProvider. Branding depends on crypto (for decryption) and feeds
  into theme (for palette colors), so it sits between the two.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { getCachedBranding, applyBranding } from "$lib/branding/index.js";

  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    if (!browser) return;

    // Apply cached org branding if available (pre-login display).
    // Full branding load (fetch + decrypt) happens after login (6i).
    void getCachedBranding().then((cached) => {
      if (cached) void applyBranding(cached);
    });
  });
</script>

{@render children()}
