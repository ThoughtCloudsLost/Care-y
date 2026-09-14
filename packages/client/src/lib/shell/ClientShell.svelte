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
  import {
    setLocale,
    getTextDirection,
    type Locale,
  } from "$lib/paraglide/runtime.js";
  import * as m from "$lib/paraglide/messages.js";
  import { uiLocaleStore } from "$lib/stores/ui-locale.svelte.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";
  import { setBrandingTitle } from "$lib/branding/title.svelte.js";
  import {
    readInjectedOrgName,
    readInjectedSafeExitUrl,
  } from "$lib/branding/injected-branding.js";
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

  // ShellNavbar measures the row and reports back, because the row is
  // absolutely positioned and the scroll container reserves its space.
  let subnavbarHeight = $state(0);

  const drawerActions = $derived(shell?.actions ?? []);
  const lockScroll = $derived(shell?.lockScroll === true);

  /** No-op until a page registers; pages without key material never do. */
  function destroySession(): void {
    shell?.ondestroy();
  }

  /** Revoke the server session if the active page registered a callback. */
  function revokeSession(): void {
    shell?.onrevoke?.();
  }

  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(brandingQuery.data ?? null);

  // Substituted into the document per org before the browser parsed it,
  // so both are known on the first frame. They read once because the
  // document is not rewritten after load.
  const injectedOrgName = readInjectedOrgName();
  const injectedSafeExitUrl = readInjectedSafeExitUrl();

  // A page's own value wins, then the org's configured URL, then the
  // injected copy of it, then the default. Intake and share links reach
  // no bootstrap, so before the branding payload carried this they went
  // to the default no matter what the org had chosen, and the injected
  // copy keeps that true even when the query never resolves.
  const safeUrl = $derived(
    shell?.safeUrl ??
      branding?.safeExitUrl ??
      injectedSafeExitUrl ??
      DEFAULT_SAFE_URL,
  );

  // The query result, then the injected value, and never the product
  // name. CARE-Y is not the organization a client contacted, so showing
  // it here would misidentify who they are talking to.
  const orgName = $derived(
    branding?.orgName !== undefined && branding.orgName !== ""
      ? branding.orgName
      : (injectedOrgName ?? ""),
  );

  // A skeleton holds the slot while a name is still possible. Once the
  // query has settled, either way, the slot goes empty rather than
  // shimmering forever at someone who is waiting on it. A success whose
  // payload carries no name is settled: the org genuinely has no
  // client-facing name right now, and a permanent shimmer would promise
  // one that is not coming.
  const orgNamePending = $derived(
    orgName === "" && !brandingQuery.isError && !brandingQuery.isSuccess,
  );

  const currentLocale = $derived(uiLocaleStore.locale);

  function handleLocaleChange(locale: Locale): void {
    void setLocale(locale, { reload: false });
    document.documentElement.lang = locale;
    document.documentElement.dir = getTextDirection(locale);
    uiLocaleStore.set(locale);
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
  scrollClass="client-scroll{lockScroll
    ? ' client-scroll--locked'
    : ''}{shell?.subnavbar != null ? ' has-subnavbar' : ''}"
  scrollAttrs={{
    id: "main-content",
    "aria-label": m.shell_main_content(),
    style: `--subnavbar-h:${String(subnavbarHeight)}px`,
  }}
  onNavbarHeight={(h: number) => {
    navbarHeight = h;
  }}
>
  {#snippet navbar()}
    {#key currentLocale}
      <ShellNavbar
        identity={{
          logoUrl: branding?.iconUrl ?? null,
          orgName,
          label: m.portal_menu_label(),
          onIdentityTap: () => (drawerOpen = true),
        }}
        identityFallback={menuIcon}
        {orgNamePending}
        locale={currentLocale}
        onlocalechange={handleLocaleChange}
        {navbarHeight}
        actions={quickExit}
        subnavbar={shell?.subnavbar}
        subnavbarHidden={() => shell?.subnavbarHidden?.() === true}
        onsubnavbarheight={(h: number) => {
          subnavbarHeight = h;
        }}
      />
    {/key}
  {/snippet}

  {@render children()}

  {#snippet afterScroll()}
    {#key currentLocale}
      <ClientDrawer
        opened={drawerOpen}
        ondismiss={() => (drawerOpen = false)}
        actions={drawerActions}
        logoUrl={branding?.iconUrl ?? null}
        {orgName}
        {orgNamePending}
      />
    {/key}
    <ToastRenderer />
  {/snippet}
</PageShell>

<!-- A client has no user identity to fall back to, so the drawer trigger
     shows what it does rather than who they are. -->
{#snippet menuIcon()}
  <Menu size={20} aria-hidden="true" />
{/snippet}

{#snippet quickExit()}
  <QuickExit ondestroy={destroySession} onrevoke={revokeSession} {safeUrl} />
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

  /* ShellNavbar positions the row absolutely so resizing it mid-scroll
     cannot move the scroll position, which means the space it occupies has
     to be reserved here instead. The navbar's own reservation must be
     restated too: PageShell pulls the scroll container up behind the
     navbar glass and compensates with padding-top: var(--navbar-h), and
     this higher-specificity rule replaces that padding rather than adding
     to it. Subnavbar height alone left the top of the thread sitting under
     the navbar glass with no way to scroll it into view. */
  :global(.client-scroll.has-subnavbar) {
    padding-top: calc(var(--navbar-h, 0px) + var(--subnavbar-h, 0px));
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
