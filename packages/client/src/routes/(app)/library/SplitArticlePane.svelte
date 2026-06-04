<!--
  Split-view detail pane wrapper for KB articles.

  Sets inert context containers that shadow AppShell's real navbar,
  tabbar, and tabbar-hidden contexts. The ArticleDetailView's
  $effect blocks write to these containers harmlessly.

  Registers the inert navbar with the splitNavbar store so AppShell
  can render the segmented navbar overlay (close, title, actions)
  and the subnavbar overlay for the right segment.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    setNavbarOverrideCtx,
    setTabbarOverrideCtx,
    setTabbarHiddenCtx,
    type NavbarOverrideContainer,
    type TabbarOverrideContainer,
    type TabbarHiddenContainer,
  } from "$lib/shell/context.js";
  import { splitNavbar } from "$lib/stores/split-navbar.svelte.js";
  import ArticleDetailView from "$lib/components/library/ArticleDetailView.svelte";

  let {
    articleId,
    onclose,
    onexpand,
  }: {
    articleId: string;
    onclose: () => void;
    onexpand: () => void;
  } = $props();

  const inertNavbar: NavbarOverrideContainer = $state({ current: undefined });
  const inertTabbar: TabbarOverrideContainer = $state({ current: undefined });
  const inertHidden: TabbarHiddenContainer = $state({ current: false });

  setNavbarOverrideCtx(inertNavbar);
  setTabbarOverrideCtx(inertTabbar);
  setTabbarHiddenCtx(inertHidden);

  $effect(() => {
    splitNavbar.set({
      rightNavbar: inertNavbar,
      rightWidth: "var(--split-detail-width, 480px)",
      onclose,
      onexpand,
    });
    return () => {
      splitNavbar.set(undefined);
    };
  });

  function handleEdit(): void {
    void goto(resolve(`/library/${articleId}/edit`));
  }
</script>

<div class="split-pane-content">
  <ArticleDetailView {articleId} onback={onclose} onedit={handleEdit} />
</div>

<style>
  .split-pane-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: var(--subnavbar-h, 0px);
  }
</style>
