<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Block, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { decryptShare } from "$lib/portal/share-crypto.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";

  type ShareViewState =
    | { kind: "loading" }
    | { kind: "content"; text: string }
    | { kind: "opened" }
    | { kind: "expired" }
    | { kind: "notFound" }
    | { kind: "badLink" };

  let viewState: ShareViewState = $state({ kind: "loading" });

  onMount(() => {
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
      .then((result) => {
        if (result.status === "ready") {
          try {
            const text = decryptShare(shareId, result.ciphertext, fragment);
            viewState = { kind: "content", text };
            announceToLiveRegion("polite", m.share_view_heading());
          } catch {
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
    <div class="share-preloader-center">
      <Preloader />
    </div>
  </Block>
{:else if viewState.kind === "content"}
  <h1 class="share-heading">{m.share_view_heading()}</h1>
  <Block class="share-content-block">
    <p class="share-content-text">{viewState.text}</p>
  </Block>
  <p class="share-one-time-notice">{m.share_view_one_time_notice()}</p>
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
