<!--
  Library layout: mobile passthrough, desktop split view.

  At mobile width: renders children normally (full-page navigation).
  At desktop width: renders two-pane split (left: list, right: article
  detail or placeholder). Uses shallow routing via pushState with
  page.state.articleId to control the right pane.

  Editor and new article routes render full-page (exit split view)
  because the editor needs horizontal space for the toolbar.

  The SplitArticlePane wrapper handles inert context shadowing so the
  ArticleDetailView's $effect blocks write to containers nobody reads.
  AppShell's real navbar/tabbar stay untouched.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pushState, replaceState } from "$app/navigation";
  import { BookOpen } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { layoutMode } from "$lib/stores/layout-mode.svelte.js";
  import {
    getScrollContainer,
    setScrollContainer,
  } from "$lib/shell/context.js";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import SplitArticlePane from "./SplitArticlePane.svelte";
  import { setLibraryLayoutCtx } from "./library-layout-ctx.js";

  let { children }: { children: Snippet } = $props();

  const selectedArticleId = $derived(
    typeof page.state.articleId === "string" ? page.state.articleId : undefined,
  );

  // Only show split view on the list route, not on detail/edit/new routes.
  const isOnSubRoute = $derived(
    page.params.articleId != null || page.route.id?.endsWith("/new") === true,
  );
  const isSplitView = $derived(layoutMode.isDesktop && !isOnSubRoute);

  // ── Left pane scroll container shadow ──
  let leftPaneEl = $state<HTMLElement | undefined>();
  const parentGetScroll = getScrollContainer();

  setScrollContainer(() =>
    isSplitView && leftPaneEl ? leftPaneEl : parentGetScroll(),
  );

  // ── Navigation callback ──
  function openArticle(articleId: string): void {
    if (layoutMode.isDesktop) {
      pushState("", { articleId });
    } else {
      void goto(resolve(`/library/${articleId}`));
    }
  }

  function closeDetail(): void {
    replaceState("", {});
  }

  function expandDetail(): void {
    if (selectedArticleId != null && selectedArticleId !== "") {
      void goto(resolve(`/library/${selectedArticleId}`));
    }
  }

  setLibraryLayoutCtx({
    openArticle,
    selectedArticleId: () => selectedArticleId,
  });
</script>

{#if isSplitView}
  <div class="split-view-container">
    <div class="split-list-pane" bind:this={leftPaneEl}>
      {@render children()}
    </div>

    <div
      class="split-divider"
      role="separator"
      aria-orientation="vertical"
    ></div>

    <div class="split-detail-pane">
      {#if selectedArticleId}
        {#key selectedArticleId}
          <SplitArticlePane
            articleId={selectedArticleId}
            onclose={closeDetail}
            onexpand={expandDetail}
          />
        {/key}
      {:else}
        <div class="split-placeholder">
          <EmptyState
            icon={BookOpen}
            message={m.library_select_article_prompt()}
          />
        </div>
      {/if}
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  :global(.main-content) > .split-view-container {
    max-width: none;
    margin-inline: 0;
    padding-inline: 0;
  }

  :global(.main-content.has-subnavbar) > .split-view-container {
    margin-top: calc(-1 * var(--subnavbar-h, 0px));
  }

  .split-view-container {
    display: flex;
    height: calc(100% + var(--subnavbar-h, 0px));
    min-height: 0;
    overflow: hidden;
    width: 100%;
  }

  .split-list-pane {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: var(--subnavbar-h, 0px);
  }

  .split-divider {
    width: 1px;
    flex-shrink: 0;
    background: var(--divider);
  }

  .split-detail-pane {
    width: var(--split-detail-width, 480px);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    padding-top: var(--subnavbar-h, 0px);
  }

  .split-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
