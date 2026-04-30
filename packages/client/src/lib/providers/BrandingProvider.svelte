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
    brandingIconUrl,
    DEFAULT_PRIMARY,
  } from "$lib/branding/index.js";
  import { dismissSplash } from "$lib/branding/dismiss-splash.js";
  import { setBrandingTitle } from "$lib/branding/title.svelte.js";
  import {
    setAppleTouchIconHref,
    getAppleTouchIconHref,
  } from "$lib/branding/icon-link.svelte.js";
  import { setOrgLogoUrl } from "$lib/branding/logo-url.svelte.js";
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
  let _hydrated = $state(false);
  let serverHydrated = false;

  function syncToLocalStorage(
    cached: NonNullable<Awaited<ReturnType<typeof getCachedBranding>>>,
  ): void {
    try {
      localStorage.setItem("care-y-brand-name", cached.orgName);
      localStorage.setItem("care-y-brand-primary", cached.primaryColor);
      if (cached.accentColor !== null) {
        localStorage.setItem("care-y-brand-accent", cached.accentColor);
      }
      if (cached.orgSlug !== null) {
        localStorage.setItem("care-y-brand-slug", cached.orgSlug);
      }
      if (cached.hasIcons) {
        localStorage.setItem("care-y-brand-has-icons", "1");
      } else {
        localStorage.removeItem("care-y-brand-has-icons");
      }
      if (cached.iconVersion !== null) {
        localStorage.setItem("care-y-brand-icon-v", cached.iconVersion);
      } else {
        localStorage.removeItem("care-y-brand-icon-v");
      }
    } catch {
      // localStorage unavailable
    }
  }

  // Path 1: instant hydration from cache (pre-login)
  $effect(() => {
    if (!browser) return;

    void getCachedBranding().then((cached) => {
      if (!cached) {
        dismissSplash();
        return;
      }
      void applyBranding(cached);
      setBrandingTitle(cached.orgName);
      if (cached.orgSlug !== null && cached.hasIcons) {
        const iconUrl = brandingIconUrl(
          cached.orgSlug,
          "192",
          cached.iconVersion,
        );
        setAppleTouchIconHref(iconUrl);
        setOrgLogoUrl(iconUrl);
      }
      // Sync SW cache state to localStorage for next page load's splash screen.
      syncToLocalStorage(cached);
      _hydrated = true;
      dismissSplash();
    });
  });

  // Path 2: authoritative fetch after org key is available.
  // Always runs once when the org key is ready, even if Path 1 already
  // hydrated from cache. The cache may hold stale colors from a previous
  // session; only a server fetch + decrypt is authoritative.
  $effect(() => {
    if (!browser || orgKeyManager === null || !isOrgKeyReady()) return;
    if (serverHydrated) return;
    serverHydrated = true;

    void hydrateFromServer();
  });

  const decoder = new TextDecoder();

  async function hydrateFromServer(): Promise<void> {
    try {
      const brandingRouter = trpc.branding;
      if (!brandingRouter) return;

      const data = await brandingRouter.getBranding.query();

      const orgName = (await decryptField(data.encryptedName)) ?? "CARE-Y";
      const primaryColor =
        (await decryptField(data.encryptedPrimaryColor)) ?? DEFAULT_PRIMARY;
      const accentColor =
        (await decryptField(data.encryptedAccentColor)) ?? null;
      const orgSlug = getOrgSlug();

      await updateBrandingCache({
        orgName,
        primaryColor,
        accentColor,
        orgSlug,
        hasIcons: data.hasIcons,
        iconVersion: data.iconVersion,
      });

      const cached = await getCachedBranding();
      if (cached !== null) {
        void applyBranding(cached);
        setBrandingTitle(cached.orgName);
        if (cached.orgSlug !== null && cached.hasIcons) {
          const iconUrl = brandingIconUrl(
            cached.orgSlug,
            "192",
            cached.iconVersion,
          );
          setAppleTouchIconHref(iconUrl);
          setOrgLogoUrl(iconUrl);
        } else {
          setOrgLogoUrl(null);
        }
      }

      _hydrated = true;
      dismissSplash();
    } catch {
      // Non-fatal: branding stays at defaults
      dismissSplash();
    }
  }

  async function decryptField(
    encrypted: string | null,
  ): Promise<string | null> {
    if (encrypted === null || encrypted === "" || orgKeyManager === null)
      return null;
    try {
      const bytes = base64ToUint8Array(encrypted);
      const plaintext = await orgKeyManager.decrypt(bytes);
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
