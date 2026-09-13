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
  import PortalHint from "$lib/components/portal/PortalHint.svelte";

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
</script>

<svelte:head>
  <title>{m.share_view_title()}</title>
</svelte:head>

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
    dismissLabel={m.portal_hint_dismiss()}
    dismissTestid="share-view-hint-dismiss"
  />
{:else if viewState.kind === "opened"}
  <Block>
    <p class="share-terminal-text">{m.share_view_opened()}</p>
  </Block>
{:else if viewState.kind === "expired"}
  <Block>
    <p class="share-terminal-text">{m.share_view_expired()}</p>
  </Block>
{:else if viewState.kind === "notFound"}
  <Block>
    <p class="share-terminal-text">{m.share_view_not_found()}</p>
  </Block>
{:else if viewState.kind === "badLink"}
  <Block>
    <p class="share-terminal-text">{m.share_view_bad_link()}</p>
  </Block>
{/if}

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

  .share-terminal-text {
    color: var(--ink);
  }
</style>
