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
    class="isk skeleton-bar {className ?? ''}"
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
    animation: skeleton-pulse 2s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.65;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .isk {
      animation: none;
      opacity: 0.6;
    }
  }
</style>
