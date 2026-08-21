<!--
  KB article detail route: thin wrapper around ArticleDetailView.

  Resolves articleId from route params and provides navigation callbacks.
  All detail logic lives in the shared component, enabling reuse in both
  full-page (mobile) and split-view (desktop).

  Deep link at desktop: if the URL is /library/[articleId] and the
  viewport is desktop width (without ?full=1), navigate to /library
  then set page.state.articleId so the layout's split view renders
  both panes. The ?full=1 param skips the redirect for intentional
  full-page viewing (e.g., expanding from the split pane).
-->
<script lang="ts">
  import { page } from "$app/state";
  import { goto, pushState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { shellBack } from "$lib/shell/navigation.js";
  import { layoutMode } from "$lib/stores/layout-mode.svelte.js";
  import {
    beginSplitHandoff,
    endSplitHandoff,
    isSplitHandoffCurrent,
  } from "$lib/stores/split-handoff.svelte.js";
  import ArticleDetailView from "$lib/components/library/ArticleDetailView.svelte";

  const articleId = $derived(page.params.articleId ?? "");
  const fullView = $derived(page.url.searchParams.get("full") === "1");

  // The handoff spans the two steps. Neither the route param nor the
  // page state holds the id while the goto is in flight, so without it
  // the split view shows its empty placeholder for those frames.
  //
  // A navigation that lands during the goto (a tab tap, the demo story
  // asking for the bare list) ends the handoff, and the token check is
  // how this half of the redirect finds out. Pushing the state anyway
  // would re-open the article the visitor just navigated away from.
  $effect(() => {
    const id = articleId;
    if (layoutMode.isDesktop && id && !fullView) {
      const token = beginSplitHandoff("library", id);
      void goto(resolve("/library"), { replaceState: true }).then(() => {
        if (!isSplitHandoffCurrent("library", token)) return;
        pushState("", { articleId: id });
        endSplitHandoff("library");
      });
    }
  });

  function goBack(): void {
    shellBack("/library");
  }

  function goEdit(): void {
    void goto(resolve(`/library/${articleId}/edit`));
  }
</script>

{#if !layoutMode.isDesktop || fullView}
  <ArticleDetailView {articleId} onback={goBack} onedit={goEdit} />
{/if}
