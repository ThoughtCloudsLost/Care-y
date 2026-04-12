<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    /** When true, show skeleton. When false, render children. Default: true */
    loading?: boolean;
    /** Skeleton width. Default: "6ch" */
    width?: string;
    /** Additional CSS classes */
    class?: string;
    /** Content to display when not loading */
    children?: Snippet;
  }

  let {
    loading = true,
    width = "6ch",
    class: className,
    children,
  }: Props = $props();
</script>

{#if loading}
  <span
    class="isk skeleton-bar skeleton-pulse {className ?? ''}"
    style:width
    role="presentation"
  ></span>
{:else if children}
  {@render children()}
{/if}

<style>
  .isk {
    display: inline-block;
    height: 0.8em;
    border-radius: 0.25rem;
    vertical-align: baseline;
  }
</style>
