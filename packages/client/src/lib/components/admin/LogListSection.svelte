<!--
  Shared wrapper for log-style list sections (audit, call).
  Owns the loading skeleton, error, empty state, data list, and
  load-more control so each log section supplies only its content
  snippet and empty-state props.
-->
<script lang="ts">
  import { List, ListItem, Preloader } from "konsta/svelte";
  import type { Component, Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface LogListSectionProps {
    /** Whether the initial query is loading. */
    readonly isLoading?: boolean;
    /** Whether the query errored. */
    readonly isError?: boolean;
    /** Error value for QueryError. */
    readonly error?: unknown;
    /** Whether the list has data (controls empty vs populated branch). */
    readonly hasData: boolean;
    /** Whether more pages are available. */
    readonly hasNextPage?: boolean;
    /** Whether the next page fetch is in flight. */
    readonly isFetchingNextPage?: boolean;
    /** Load more callback. */
    readonly onfetchnext: () => void;
    /** Retry callback for error state. */
    readonly onretry: () => void;
    /** Icon component for the empty state. */
    readonly emptyIcon: Component;
    /** Title for the empty state. */
    readonly emptyTitle: string;
    /** Subtitle for the empty state. */
    readonly emptySubtitle: string;
    /** Additional CSS class name for the outer wrapper. */
    readonly wrapperClass?: string;
    /** Load more label (defaults to logs_load_more). */
    readonly loadMoreLabel?: string;
    /** Snippet rendering the populated data list. */
    readonly children: Snippet;
  }

  let {
    isLoading = false,
    isError = false,
    error = null,
    hasData,
    hasNextPage = false,
    isFetchingNextPage = false,
    onfetchnext,
    onretry,
    emptyIcon,
    emptyTitle,
    emptySubtitle,
    wrapperClass = "",
    loadMoreLabel,
    children,
  }: LogListSectionProps = $props();
</script>

<div class="log-list-section {wrapperClass} pb-20">
  {#if isLoading}
    <List>
      {#each { length: 3 } as _, i (i)}
        <ListItem>
          {#snippet title()}
            <InlineSkeleton width="14ch" />
          {/snippet}
          {#snippet after()}
            <InlineSkeleton width="8ch" />
          {/snippet}
          {#snippet subtitle()}
            <InlineSkeleton width="20ch" />
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {:else if isError}
    <QueryError {error} {onretry} />
  {:else if !hasData}
    <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} />
  {:else}
    {@render children()}
    {#if hasNextPage}
      <div class="load-more">
        <SoftButton onclick={onfetchnext} disabled={isFetchingNextPage}>
          {#if isFetchingNextPage}
            <Preloader class="w-4 h-4" />
          {:else}
            {loadMoreLabel ?? m.logs_load_more()}
          {/if}
        </SoftButton>
      </div>
    {/if}
  {/if}
</div>

<style>
  .log-list-section {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .load-more {
    display: flex;
    justify-content: center;
    padding: var(--space-md) 0;
  }
</style>
