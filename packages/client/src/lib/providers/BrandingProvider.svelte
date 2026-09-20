<!--
  BrandingProvider: org branding lifecycle.

  Two paths populate branding state:
  1. Pre-login (instant): reads Cache API from a previous session.
     Provides org name, colors, and icon href without waiting for auth.
  2. Post-login (authoritative): once the org key is loaded, fetches
     branding from the server, applies, and caches for path 1 next time.
     Branding fields are plaintext (ADR-094). Only terminology is still
     encrypted under the org key.

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
  import { decode } from "@care-y/crypto";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgSlug } from "$lib/utils/org-slug.js";
  import type { OrgKeyManager } from "$lib/crypto/org-key.js";
  import {
    TERMINOLOGY_DEFAULTS_EN,
    terminologyConfigSchema,
    type TerminologyLabels,
  } from "@care-y/shared";
  import { setTerminology } from "$lib/terminology/context.js";
  import {
    resolveLabels,
    readCachedTerminology,
    cacheTerminology,
  } from "$lib/terminology/index.js";
  import { getReaderLocale } from "$lib/locale/reader-locale.js";

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
  let serverHydrated = false;

  let terminologyLabels = $state<TerminologyLabels>(TERMINOLOGY_DEFAULTS_EN);

  // Initialize terminology from cache immediately
  if (browser) {
    const cachedConfig = readCachedTerminology();
    terminologyLabels = resolveLabels(cachedConfig, getReaderLocale());
  }

  setTerminology(() => terminologyLabels);

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
      dismissSplash();
    });
  });

  // Path 2: authoritative fetch after org key is available.
  // Always runs once when the org key is ready, even if Path 1 already
  // hydrated from cache. The cache may hold stale colors from a previous
  // session; only a server fetch is authoritative.
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

      const orgName = data.name ?? "CARE-Y";
      const primaryColor = data.primaryColor ?? DEFAULT_PRIMARY;
      const accentColor = data.accentColor ?? null;
      const orgSlug = getOrgSlug();

      // Decrypt and cache terminology (still org-key encrypted, ADR-094)
      const terminologyJson = await decryptField(data.encryptedTerminology);
      if (terminologyJson !== null) {
        try {
          const parsed: unknown = JSON.parse(terminologyJson);
          const result = terminologyConfigSchema.safeParse(parsed);
          if (result.success) {
            cacheTerminology(result.data);
            terminologyLabels = resolveLabels(result.data, getReaderLocale());
          }
        } catch {
          // Malformed terminology JSON; keep defaults
        }
      }

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
      const bytes = decode(encrypted);
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
