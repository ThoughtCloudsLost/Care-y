<script lang="ts">
  import ArticleCard from "$lib/components/library/ArticleCard.svelte";
  import type { KBSearchData } from "$lib/search/providers/kb.js";

  let { result, ontap }: { result: KBSearchData; ontap: (id: string) => void } =
    $props();
</script>

<div class="search-card-wrapper">
  <ArticleCard
    viewMode="grid"
    articleId={result.articleId}
    titleResult={result.titleResult}
    excerptResult={result.excerptResult}
    categoryName={result.categoryName}
    authorName={result.authorName}
    rating={result.rating}
    voteUpCount={result.voteUpCount}
    voteTotalCount={result.voteTotalCount}
    createdAt={result.createdAt}
    updatedAt={result.updatedAt}
    selected={false}
    multiSelectActive={false}
    {ontap}
  />
</div>

<style>
  .search-card-wrapper {
    width: 170px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }
</style>
