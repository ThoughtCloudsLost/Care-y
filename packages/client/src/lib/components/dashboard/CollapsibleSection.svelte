<script lang="ts">
  import { BlockTitle } from "konsta/svelte";
  import { slide } from "svelte/transition";
  import type { Snippet } from "svelte";

  const reducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  interface CollapsibleSectionProps {
    /** Section heading text */
    heading: string;
    /** Item count displayed in the header */
    count: number;
    /** Whether the section is expanded */
    expanded: boolean;
    /** Callback when the header is toggled */
    ontoggle: () => void;
    /** Content to render when expanded */
    children?: Snippet;
  }

  let {
    heading,
    count,
    expanded,
    ontoggle,
    children,
  }: CollapsibleSectionProps = $props();
</script>

<div class="collapsible-section">
  <button
    type="button"
    class="section-toggle"
    onclick={ontoggle}
    aria-expanded={expanded}
  >
    <BlockTitle>
      {heading} ({count})
      <span class="toggle-chevron" class:expanded aria-hidden="true">
        &#x276F;
      </span>
    </BlockTitle>
  </button>
  {#if expanded}
    <div
      class="section-content"
      transition:slide={{ duration: reducedMotion ? 0 : 200 }}
    >
      {#if children}
        {@render children()}
      {/if}
    </div>
  {/if}
</div>

<style>
  .section-toggle {
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  /* Konsta BlockTitle has mt-8 (2rem) and a sibling-based -mb-6 that
     doesn't fire here because the List is inside .section-content, not
     a direct sibling. Override both margins for tighter collapsible layout. */
  .section-toggle :global(.k-block-title) {
    margin-top: 1rem;
    margin-bottom: 0;
  }

  .section-content :global(.k-list) {
    margin-top: 0;
    margin-bottom: 0;
  }

  .toggle-chevron {
    display: inline-block;
    font-size: 0.75rem;
    transition: transform 200ms ease;
    transform: rotate(90deg);
    opacity: 0.5;
    margin-left: 0.25rem;
  }

  .toggle-chevron.expanded {
    transform: rotate(-90deg);
  }
</style>
