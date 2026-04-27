<script
  lang="ts"
  generics="T extends Record<string, unknown> | string | number | boolean | unknown[]"
>
  import type { Snippet } from "svelte";
  import Skeleton from "./Skeleton.svelte";
  import QueryError from "./QueryError.svelte";
  import EmptyState from "./EmptyState.svelte";

  let {
    query,
    skeletonLines = 3,
    isEmpty = false,
    loading,
    error,
    empty,
    children,
  }: {
    query: {
      isLoading: boolean;
      isError: boolean;
      error: Error | null;
      data: T | undefined;
    };
    skeletonLines?: number;
    isEmpty?: boolean;
    loading?: Snippet;
    error?: Snippet<[unknown]>;
    empty?: Snippet;
    children: Snippet<[T]>;
  } = $props();
</script>

{#if query.isLoading}
  {#if loading}
    {@render loading()}
  {:else}
    <Skeleton lines={skeletonLines} />
  {/if}
{:else if query.isError}
  {#if error}
    {@render error(query.error)}
  {:else}
    <QueryError error={query.error} />
  {/if}
{:else if isEmpty}
  {#if empty}
    {@render empty()}
  {:else}
    <EmptyState />
  {/if}
{:else if query.data !== undefined}
  {@render children(query.data)}
{/if}
