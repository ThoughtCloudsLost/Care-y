<script lang="ts">
  import { page } from "$app/state";
  import { afterNavigate, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Block, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getSodium } from "@care-y/crypto";
  import { decryptShare } from "$lib/portal/share-crypto.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import PortalHint from "$lib/shell/PortalHint.svelte";
  import LinkErrorState from "$lib/portal/LinkErrorState.svelte";
  import { getClientShellCtx } from "$lib/client-shell/context.js";
  import { uiLocaleStore } from "$lib/stores/ui-locale.svelte.js";

  type ShareViewState =
    | { kind: "loading" }
    | { kind: "content"; text: string }
    | { kind: "opened" }
    | { kind: "expired" }
    | { kind: "notFound" }
    | { kind: "badLink" };

  let viewState: ShareViewState = $state({ kind: "loading" });

  // Exposure hint, shown once when the decrypted content appears.
  // The link is consumed on open, so this fires at most once per link.
  let hintShown = $state(false);

  // afterNavigate, not onMount: replaceState throws if called before the
  // router initializes, which is exactly the hard-load case of a client
  // opening the SMS link. afterNavigate fires post-init on mount and on
  // later navigations; the guard keeps the one-shot consume semantics.
  let opened = false;
  afterNavigate(() => {
    if (opened) return;
    opened = true;

    const shareId = page.params.id;
    const fragment = location.hash.slice(1);

    if (shareId === undefined || !fragment || !trpc.clientPortal) {
      viewState = { kind: "badLink" };
      announceToLiveRegion("polite", m.share_view_bad_link());
      return;
    }

    replaceState(resolve(`/share/${shareId}`), {});

    void trpc.clientPortal.openShare
      .mutate({ shareId })
      .then(async (result) => {
        if (result.status === "ready") {
          try {
            // CryptoProvider only fires sodium init without awaiting it;
            // this page must not race the WASM load.
            await getSodium();
            const text = decryptShare(shareId, result.ciphertext, fragment);
            viewState = { kind: "content", text };
            hintShown = true;
            announceToLiveRegion("polite", m.share_view_heading());
          } catch (err: unknown) {
            console.error("[share] decrypt failed:", err);
            viewState = { kind: "badLink" };
            announceToLiveRegion("polite", m.share_view_bad_link());
          }
          return;
        }

        if (result.status === "opened") {
          viewState = { kind: "opened" };
          announceToLiveRegion("polite", m.share_view_opened());
        } else if (result.status === "expired") {
          viewState = { kind: "expired" };
          announceToLiveRegion("polite", m.share_view_expired());
        } else {
          viewState = { kind: "notFound" };
          announceToLiveRegion("polite", m.share_view_not_found());
        }
      })
      .catch(() => {
        viewState = { kind: "badLink" };
        announceToLiveRegion("polite", m.share_view_bad_link());
      });
  });

  // Publishing is what gives a share link quick exit and the drawer; it had
  // neither. The shell supplies the org's exit URL, which a share link
  // could never reach before, since it carries no portal bootstrap.
  //
  // The decrypted text lives in a JS string, which cannot be zeroed, so
  // exiting drops the reference instead. The navigation tears the page down
  // anyway; this makes the intent explicit and covers the pagehide path.
  const shellContainer = getClientShellCtx();

  $effect(() => {
    shellContainer.current = {
      ondestroy: () => {
        viewState = { kind: "opened" };
      },
      actions: [],
    };
    return () => {
      shellContainer.current = undefined;
    };
  });

  // Locale-reactive title (the read establishes a $derived dependency)
  const pageTitle = $derived.by((): string => {
    void uiLocaleStore.locale;
    return m.share_view_title();
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

{#key uiLocaleStore.locale}
  {#if viewState.kind === "loading"}
    <Block class="share-loading">
      <div class="share-preloader-center" data-testid="share-loading">
        <Preloader />
      </div>
    </Block>
  {:else if viewState.kind === "content"}
    <h1 class="share-heading">{m.share_view_heading()}</h1>
    <Block class="share-content-block">
      <p class="share-content-text">{viewState.text}</p>
    </Block>
    <p class="share-one-time-notice">{m.share_view_one_time_notice()}</p>
    <PortalHint
      opened={hintShown}
      ondismiss={() => (hintShown = false)}
      message={m.share_view_hint()}
    />
  {:else if viewState.kind === "opened"}
    <LinkErrorState
      title={m.share_view_opened_title()}
      body={m.share_view_opened()}
      testId="share-opened"
    />
  {:else if viewState.kind === "expired"}
    <LinkErrorState
      title={m.share_view_expired_title()}
      body={m.share_view_expired()}
      testId="share-expired"
    />
  {:else if viewState.kind === "notFound"}
    <LinkErrorState
      title={m.share_view_not_found_title()}
      body={m.share_view_not_found()}
      testId="share-not-found"
    />
  {:else if viewState.kind === "badLink"}
    <LinkErrorState
      title={m.share_view_bad_link_title()}
      body={m.share_view_bad_link()}
      testId="share-bad-link"
    />
  {/if}
{/key}

<style>
  .share-preloader-center {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .share-heading {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--ink);
    padding: 0 var(--page-pad-x);
    margin: var(--space-lg) 0 0;
  }

  .share-content-text {
    white-space: pre-wrap;
    color: var(--ink);
  }

  .share-one-time-notice {
    color: var(--muted);
    font-size: var(--text-sm);
    padding: 0 var(--page-pad-x);
    margin-top: var(--space-md);
  }
</style>
