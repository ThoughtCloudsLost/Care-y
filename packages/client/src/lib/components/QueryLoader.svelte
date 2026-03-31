<script
  lang="ts"
  generics="T extends Record<string, unknown> | string | number | boolean | unknown[]"
>
  import type { Snippet } from "svelte";
  import Skeleton from "./Skeleton.svelte";
  import QueryError from "./QueryError.svelte";

  let {
    query,
    skeletonLines = 3,
    children,
  }: {
    query: {
      isLoading: boolean;
      isError: boolean;
      error: Error | null;
      data: T | undefined;
    };
    skeletonLines?: number;
    children: Snippet<[T]>;
  } = $props();
</script>

{#if query.isLoading}
  <Skeleton lines={skeletonLines} />
{:else if query.isError}
  <QueryError error={query.error} />
{:else if query.data !== undefined}
  {@render children(query.data)}
{/if}
