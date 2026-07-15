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
  import SplitView from "$lib/shell/SplitView.svelte";
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

  function openArticleFull(articleId: string): void {
    void goto(resolve(`/library/${articleId}?full=1`));
  }

  function closeDetail(): void {
    replaceState("", {});
  }

  function expandDetail(): void {
    if (selectedArticleId != null && selectedArticleId !== "") {
      void goto(resolve(`/library/${selectedArticleId}?full=1`));
    }
  }

  setLibraryLayoutCtx({
    openArticle,
    openArticleFull,
    selectedArticleId: () => selectedArticleId,
  });

  // Desktop→mobile: if a detail is open in split view and the viewport
  // shrinks below 1024px, navigate to the full-page detail route so
  // the user doesn't lose the article they were viewing.
  $effect(() => {
    if (!layoutMode.isDesktop && selectedArticleId != null) {
      replaceState("", {});
      void goto(resolve(`/library/${selectedArticleId}`));
    }
  });
</script>

{#if isSplitView}
  <SplitView subnavbar bind:leftRef={leftPaneEl}>
    {#snippet left()}
      {@render children()}
    {/snippet}
    {#snippet right()}
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
    {/snippet}
  </SplitView>
{:else}
  {@render children()}
{/if}

<style>
  .split-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
