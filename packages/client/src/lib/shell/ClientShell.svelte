<!--
  Client-portal shell: the frame every client page shares.

  A sibling of AppShell rather than a mode of it. AppShell carries a tab
  bar over org destinations, a permission-keyed sidebar, global search, and
  a session, none of which a client has. What the two do share is
  PageShell, ShellPanel, PageLayout, layoutMode, and ShellNavbar, so the
  parts a client and a volunteer both see are one implementation in one
  position.

  Identity sits in the left slot as the org logo and opens the drawer,
  which is what the org avatar does. The center holds the org name and the
  language picker together, where the org app, the onboarding layout, and
  the login page already put them. Quick exit holds the right slot,
  unlabeled: a word naming the action is itself the tell on a shared
  device.

  Quick exit is rendered once here rather than by each page, so it is
  present in every state of every client page and a new page cannot forget
  it. The Navbar is a non-scrolling row of PageShell's flex column, which
  is why it no longer needs fixed positioning.

  Pages own their own session and publish what this frame needs through
  the client shell context. Only a callback crosses that boundary, never
  key material.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { Menu } from "@lucide/svelte";
  import type { Snippet } from "svelte";
  import { getLocale, setLocale, type Locale } from "$lib/paraglide/runtime.js";
  import * as m from "$lib/paraglide/messages.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";
  import {
    setBrandingTitle,
    getBrandingTitle,
  } from "$lib/branding/title.svelte.js";
  import PageShell from "./PageShell.svelte";
  import ShellNavbar from "./ShellNavbar.svelte";
  import ToastRenderer from "./ToastRenderer.svelte";
  import QuickExit from "$lib/components/portal/QuickExit.svelte";
  import ClientDrawer from "$lib/client-shell/ClientDrawer.svelte";
  import {
    setClientShellCtx,
    DEFAULT_SAFE_URL,
    type ClientShellContainer,
  } from "$lib/client-shell/context.js";

  interface Props {
    readonly children: Snippet;
  }

  let { children }: Props = $props();

  // Client pages publish their exit callback, safe URL, and drawer entries
  // here. $state makes it reactive.
  const shellContainer: ClientShellContainer = $state({ current: undefined });
  setClientShellCtx(shellContainer);
  const shell = $derived(shellContainer.current);

  let drawerOpen = $state(false);
  let navbarHeight = $state(0);

  const drawerActions = $derived(shell?.actions ?? []);
  const lockScroll = $derived(shell?.lockScroll === true);

  /** No-op until a page registers; pages without key material never do. */
  function destroySession(): void {
    shell?.ondestroy();
  }

  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(brandingQuery.data ?? null);
  const brandingPending = $derived(brandingQuery.isLoading);

  // A page's own value wins, then the org's configured URL, then the
  // default. Intake and share links reach no bootstrap, so before the
  // branding payload carried this they went to the default no matter what
  // the org had chosen.
  const safeUrl = $derived(
    shell?.safeUrl ?? branding?.safeExitUrl ?? DEFAULT_SAFE_URL,
  );

  const orgName = $derived(
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
  scrollAttrs={{
    id: "main-content",
    "aria-label": m.shell_main_content(),
  }}
  onNavbarHeight={(h: number) => {
    navbarHeight = h;
  }}
>
  {#snippet navbar()}
    <ShellNavbar
      identity={{
        logoUrl: branding?.iconUrl ?? null,
        orgName,
        label: m.portal_menu_label(),
        onIdentityTap: () => (drawerOpen = true),
      }}
      identityFallback={menuIcon}
      orgNamePending={brandingPending}
      locale={currentLocale}
      onlocalechange={handleLocaleChange}
      {navbarHeight}
      actions={quickExit}
    />
  {/snippet}

  {@render children()}

  {#snippet afterScroll()}
    <ClientDrawer
      opened={drawerOpen}
      ondismiss={() => (drawerOpen = false)}
      actions={drawerActions}
      logoUrl={branding?.iconUrl ?? null}
      {orgName}
      orgNamePending={brandingPending}
    />
    <ToastRenderer />
  {/snippet}
</PageShell>

<!-- A client has no user identity to fall back to, so the drawer trigger
     shows what it does rather than who they are. -->
{#snippet menuIcon()}
  <Menu size={20} aria-hidden="true" />
{/snippet}

{#snippet quickExit()}
  <QuickExit ondestroy={destroySession} {safeUrl} />
{/snippet}

<style>
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
