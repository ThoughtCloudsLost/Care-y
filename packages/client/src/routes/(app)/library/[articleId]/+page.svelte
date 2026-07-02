<!--
  KB article detail route: thin wrapper around ArticleDetailView.

  Resolves articleId from route params and provides navigation callbacks.
  All detail logic lives in the shared component, enabling reuse in both
  full-page (mobile) and split-view (desktop).

  Deep link at desktop: if the URL is /library/[articleId] and the
  viewport is desktop width, navigate to /library then set
  page.state.articleId so the layout's split view renders both panes.
-->
<script lang="ts">
  import { page } from "$app/state";
  import { goto, pushState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { shellBack } from "$lib/shell/navigation.js";
  import { layoutMode } from "$lib/stores/layout-mode.svelte.js";
  import ArticleDetailView from "$lib/components/library/ArticleDetailView.svelte";

  const articleId = $derived(page.params.articleId ?? "");

  $effect(() => {
    if (layoutMode.isDesktop && articleId) {
      void goto(resolve("/library"), { replaceState: true }).then(() => {
        pushState("", { articleId });
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

{#if !layoutMode.isDesktop && articleId}
  <ArticleDetailView {articleId} onback={goBack} onedit={goEdit} />
{/if}
