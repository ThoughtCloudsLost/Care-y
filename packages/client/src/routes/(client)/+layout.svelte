<!--
  Client-facing route group layout.

  Owns the frame every client page shares: the branded navbar, the drawer,
  and quick exit. Pages own their own session and publish what the frame
  needs through the client shell context.

  Quick exit lives in the navbar rather than each page, so it is present in
  every state of every client page and cannot be forgotten by a new one.
  The Navbar is a non-scrolling row of PageShell's flex column, so it stays
  put without the fixed positioning it used to carry.

  The scroll container is a flex column, matching AppShell's .main-content.
  Without it a child's `flex: 1` is inert and page content collapses to its
  natural height with empty space beneath. Chat-shaped pages set lockScroll,
  which hands scrolling to a PageLayout region inside so the composer pins
  to the bottom.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { Navbar, Link } from "konsta/svelte";
  import { Menu } from "@lucide/svelte";
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
  import QuickExit from "$lib/components/portal/QuickExit.svelte";
  import ClientDrawer from "$lib/client-shell/ClientDrawer.svelte";
  import {
    setClientShellCtx,
    DEFAULT_SAFE_URL,
    type ClientShellContainer,
  } from "$lib/client-shell/context.js";

  let { children } = $props();

  // Client pages publish their exit callback, safe URL, and drawer entries
  // here. $state makes it reactive.
  const shellContainer: ClientShellContainer = $state({ current: undefined });
  setClientShellCtx(shellContainer);
  const shell = $derived(shellContainer.current);

  let drawerOpen = $state(false);

  const safeUrl = $derived(shell?.safeUrl ?? DEFAULT_SAFE_URL);
  const drawerActions = $derived(shell?.actions ?? []);
  const lockScroll = $derived(shell?.lockScroll === true);

  /** No-op until a page registers; pages without key material never do. */
  function destroySession(): void {
    shell?.ondestroy();
  }

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

<PageShell
  scrollTag="main"
  scrollClass="client-scroll{lockScroll ? ' client-scroll--locked' : ''}"
>
  {#snippet navbar()}
    <Navbar role="banner">
      {#snippet left()}
        <Link
          component="button"
          type="button"
          role="button"
          iconOnly
          aria-label={m.portal_menu_label()}
          onclick={() => (drawerOpen = true)}
          data-testid="client-drawer-trigger"
        >
          <Menu size={22} aria-hidden="true" />
        </Link>
      {/snippet}
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
      {#snippet right()}
        <QuickExit ondestroy={destroySession} {safeUrl} />
      {/snippet}
    </Navbar>
  {/snippet}

  {@render children()}

  {#snippet afterScroll()}
    <ClientDrawer
      opened={drawerOpen}
      ondismiss={() => (drawerOpen = false)}
      actions={drawerActions}
      locale={currentLocale}
      onlocalechange={handleLocaleChange}
    />
  {/snippet}
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

  /* The scroll element lives in PageShell's template, so these reach it
     through :global, the same way AppShell styles .main-content. */
  :global(.client-scroll) {
    display: flex;
    flex-direction: column;
  }

  /* Flex would otherwise shrink page content once it outgrows the
     viewport; anything with overflow hidden collapses outright. */
  :global(.client-scroll > *) {
    flex-shrink: 0;
  }

  /* Chat pages: the PageLayout region inside owns the scroll instead. */
  :global(.client-scroll--locked) {
    overflow: hidden;
  }

  /* Reading measure, reusing the org app's token and breakpoint so the
     two sides of the product wrap at the same width. */
  @media (min-width: 1024px) {
    :global(.client-scroll) {
      width: 100%;
      max-width: var(--content-max-width, 720px);
      margin-inline: auto;
    }
  }
</style>
