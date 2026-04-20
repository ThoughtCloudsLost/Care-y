<!--
  BrandingProvider: org branding lifecycle.

  Two paths populate branding state:
  1. Pre-login (instant): reads localStorage + Cache API from a previous session.
     Provides org name, colors, and icon href without waiting for auth.
  2. Post-login (authoritative): once the org key is loaded, fetches encrypted
     branding from the server, decrypts, applies, and caches for path 1 next time.

  This provider exists as a boundary so the branding lifecycle has a clear home.
  Do not fold branding logic into CryptoProvider or ThemeProvider.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import {
    getCachedBranding,
    applyBranding,
    updateBrandingCache,
  } from "$lib/branding/index.js";
  import { setBrandingTitle } from "$lib/branding/title.svelte.js";
  import {
    setAppleTouchIconHref,
    getAppleTouchIconHref,
  } from "$lib/branding/icon-link.svelte.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgSlug } from "$lib/utils/org-slug.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import type { OrgKeyManager } from "$lib/crypto/org-key.js";

  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  // Context access is deferred to browser-only code because CryptoProvider
  // does not set org key context during SSR.
  let orgKeyManager: OrgKeyManager | null = null;
  if (browser) {
    try {
      orgKeyManager = getOrgKeyManager();
    } catch {
      // Outside CryptoProvider (shouldn't happen in normal tree, but safe)
    }
  }
  let hydrated = $state(false);

  // Path 1: instant hydration from cache (pre-login)
  $effect(() => {
    if (!browser) return;

    void getCachedBranding().then((cached) => {
      if (!cached) return;
      void applyBranding(cached);
      setBrandingTitle(cached.orgName);
      if (cached.orgSlug !== null && cached.hasIcons) {
        setAppleTouchIconHref(`/api/branding/${cached.orgSlug}/icon-192.png`);
      }
      hydrated = true;
    });
  });

  // Path 2: authoritative fetch after org key is available
  $effect(() => {
    if (!browser || orgKeyManager === null || !isOrgKeyReady()) return;
    if (hydrated) return;

    void hydrateFromServer();
  });

  const decoder = new TextDecoder();

  async function hydrateFromServer(): Promise<void> {
    try {
      const brandingRouter = trpc.branding;
      if (!brandingRouter) return;

      const data = await brandingRouter.getBranding.query();

      const orgName = decryptField(data.encryptedName) ?? "CARE-Y";
      const primaryColor =
        decryptField(data.encryptedPrimaryColor) ?? "#98a448";
      const accentColor = decryptField(data.encryptedAccentColor) ?? null;
      const orgSlug = getOrgSlug();

      await updateBrandingCache({
        orgName,
        primaryColor,
        accentColor,
        orgSlug,
        hasIcons: data.hasIcons,
      });

      const cached = await getCachedBranding();
      if (cached !== null) {
        void applyBranding(cached);
        setBrandingTitle(cached.orgName);
        if (cached.orgSlug !== null && cached.hasIcons) {
          setAppleTouchIconHref(`/api/branding/${cached.orgSlug}/icon-192.png`);
        }
      }

      hydrated = true;
    } catch {
      // Non-fatal: branding stays at defaults
    }
  }

  function decryptField(encrypted: string | null): string | null {
    if (encrypted === null || encrypted === "" || orgKeyManager === null)
      return null;
    try {
      const bytes = base64ToUint8Array(encrypted);
      const plaintext = orgKeyManager.decrypt(bytes);
      return decoder.decode(plaintext);
    } catch {
      return null;
    }
  }

  const iconHref = $derived(getAppleTouchIconHref());
</script>

<svelte:head>
  {#if iconHref}
    <link rel="apple-touch-icon" href={iconHref} />
  {/if}
</svelte:head>

{@render children()}
