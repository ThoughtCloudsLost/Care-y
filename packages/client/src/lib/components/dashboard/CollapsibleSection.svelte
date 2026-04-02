<script lang="ts">
  import { BlockTitle } from "konsta/svelte";
  import { slide } from "svelte/transition";
  import type { Snippet, Component } from "svelte";

  const reducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  interface CollapsibleSectionProps {
    /** Section heading text */
    heading: string;
    /** Item count (omit to hide the badge entirely) */
    count?: number;
    /** Icon component to show left of the heading */
    icon?: Component;
    /** Icon color: any CSS color value or variable reference */
    iconColor?: string;
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
    icon: Icon,
    iconColor = "currentColor",
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
      <span class="heading-inner">
        {#if Icon}
          <Icon
            size={16}
            color={iconColor}
            aria-hidden="true"
            class="section-icon"
          />
        {/if}
        <span class="heading-text">{heading}</span>
        {#if count !== undefined}
          <span class="count-badge" aria-hidden="true">{count}</span>
        {/if}
        <span class="toggle-chevron" class:expanded aria-hidden="true">
          &#x276F;
        </span>
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
  .collapsible-section {
    padding-top: 1.25rem;
  }

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
    margin-top: 0;
    margin-bottom: 0;
    /* Override Konsta's secondary label color, use full ink for interactive headers */
    color: var(--ink);
    /* Pull left edge in to match page margin (Konsta default is pl-safe-4 = 1rem + safe area) */
    padding-left: 0.75rem;
  }

  .section-content :global(.k-list) {
    margin-top: 0;
    margin-bottom: 0.25rem;
  }

  .heading-inner {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
  }

  .section-toggle :global(.section-icon) {
    flex-shrink: 0;
  }

  .heading-text {
    flex: 1;
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.125rem;
    height: 1.125rem;
    padding: 0 0.25rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--ink) 12%, transparent);
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1;
    color: var(--muted);
    letter-spacing: 0.01em;
  }

  .toggle-chevron {
    display: inline-block;
    font-size: 0.75rem;
    transition: transform 200ms ease;
    transform: rotate(90deg);
    opacity: 0.35;
    margin-left: auto;
  }

  .toggle-chevron.expanded {
    transform: rotate(-90deg);
  }
</style>
