<script lang="ts">
  import { browser } from "$app/environment";
  import { Navbar, Link } from "konsta/svelte";
  import { getLocale, setLocale, type Locale } from "$lib/paraglide/runtime.js";
  import * as m from "$lib/paraglide/messages.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";
  import {
    setBrandingTitle,
    getBrandingTitle,
  } from "$lib/branding/title.svelte.js";
  import PageShell from "$lib/shell/PageShell.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import LanguagePicker from "$lib/components/inputs/LanguagePicker.svelte";

  let { children } = $props();

  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(brandingQuery.data ?? null);
  const isLoading = $derived(brandingQuery.isLoading);

  const navbarTitle = $derived(
    branding?.orgName !== undefined && branding.orgName !== ""
      ? branding.orgName
      : getBrandingTitle(),
  );

  let currentLocale = $state(getLocale());

  function handleLocaleChange(locale: Locale): void {
    currentLocale = locale;
    void setLocale(locale);
  }

  $effect(() => {
    if (!browser || branding === null) return;
    void applyKonstaPalette({
      primary: branding.primaryColor,
      accent: branding.accentColor ?? undefined,
    });
    setBrandingTitle(branding.orgName);
  });
</script>

<PageShell scrollTag="main">
  {#snippet navbar()}
    <Navbar role="banner">
      {#snippet title()}
        <div class="client-navbar-title">
          {#if isLoading}
            <InlineSkeleton width="10ch" />
          {:else if branding?.iconUrl}
            <img
              src={branding.iconUrl}
              alt=""
              class="client-navbar-icon"
              width="24"
              height="24"
            />
            {navbarTitle}
          {:else}
            {navbarTitle}
          {/if}
        </div>
      {/snippet}
    </Navbar>
  {/snippet}

  {@render children()}

  <footer class="client-footer">
    <LanguagePicker value={currentLocale} onchange={handleLocaleChange} />
    <Link href="/intake/privacy">
      {m.intake_footer_privacy()}
    </Link>
  </footer>
</PageShell>

<style>
  .client-navbar-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .client-navbar-icon {
    border-radius: 4px;
  }

  .client-footer {
    padding: var(--space-md) var(--page-pad-x);
    text-align: center;
    font-size: var(--text-sm);
    color: var(--muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }
</style>
