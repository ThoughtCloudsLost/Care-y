<script lang="ts">
  import { BlockTitle } from "konsta/svelte";
  import { slide } from "svelte/transition";
  import { browser } from "$app/environment";
  import type { Snippet, Component } from "svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  let reducedMotion = $state(false);

  $effect(() => {
    if (!browser) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = mql.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  });

  interface CollapsibleSectionProps {
    /** Stable ID used to link heading and region for a11y. Generated from heading if omitted. */
    id?: string;
    /** Section heading text */
    heading: string;
    /** Item count (omit to hide the badge entirely) */
    count?: number;
    /** Whether the section data is still loading */
    loading?: boolean;
    /** Icon component to show left of the heading */
    icon?: Component;
    /** Icon color: any CSS color value or variable reference */
    iconColor?: string;
    /** Whether the section is expanded */
    expanded: boolean;
    /** Callback when the header is toggled */
    ontoggle: () => void;
    /** Extra content rendered in the header row (e.g., dismiss button) */
    headerExtra?: Snippet;
    /** Content to render when expanded */
    children?: Snippet;
  }

  let {
    id,
    heading,
    count,
    loading = false,
    icon: Icon,
    iconColor = "currentColor",
    expanded,
    ontoggle,
    headerExtra,
    children,
  }: CollapsibleSectionProps = $props();

  const stableId = $derived(id ?? heading.toLowerCase().replace(/\s+/g, "-"));
  const headingId = $derived(`${stableId}-heading`);
</script>

<div class="collapsible-section">
  <div class="section-header">
    <button
      type="button"
      class="section-toggle"
      onclick={ontoggle}
      aria-expanded={expanded}
      aria-controls={expanded ? `${stableId}-region` : undefined}
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
          <span id={headingId} class="heading-text">{heading}</span>
          {#if loading && count === undefined}
            <span class="count-badge" data-count aria-hidden="true">
              <DecryptPlaceholder length={3} />
            </span>
          {:else if count !== undefined}
            <span class="count-badge" data-count={count} aria-hidden="true"
              >{count}</span
            >
          {/if}
          <span class="toggle-chevron" class:expanded aria-hidden="true">
            &#x276F;
          </span>
        </span>
      </BlockTitle>
    </button>
    {#if headerExtra}
      <div class="header-extra">
        {@render headerExtra()}
      </div>
    {/if}
  </div>
  {#if expanded}
    <div
      id={`${stableId}-region`}
      class="section-content"
      role="region"
      aria-labelledby={headingId}
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
    padding-top: var(--space-2xl);
  }

  .section-header {
    display: flex;
    align-items: center;
  }

  .header-extra {
    flex-shrink: 0;
    padding-right: var(--page-pad-x);
  }

  .section-toggle {
    flex: 1;
    min-width: 0;
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
    padding-left: var(--page-pad-x);
  }

  .section-content :global(.k-list) {
    margin-top: 0;
    margin-bottom: 0.25rem;
  }

  .heading-inner {
    display: flex;
    align-items: center;
    gap: var(--space-md);
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
