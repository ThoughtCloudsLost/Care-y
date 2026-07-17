<script lang="ts">
  import { slide } from "svelte/transition";
  import { browser } from "$app/environment";
  import type { Snippet, Component } from "svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import * as m from "$lib/paraglide/messages.js";

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
    id?: string;
    heading: string;
    count?: number;
    totalCount?: number;
    loading?: boolean;
    icon?: Component;
    iconColor?: string;
    expanded: boolean;
    ontoggle: () => void;
    headerExtra?: Snippet;
    children?: Snippet;
  }

  let {
    id,
    heading,
    count,
    totalCount,
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
      <span class="secline">
        {#if Icon}
          <Icon
            size={14}
            color={iconColor}
            aria-hidden="true"
            class="section-icon"
          />
        {/if}
        <span id={headingId} class="secline-eb">{heading}</span>
        <span class="secline-rule" aria-hidden="true"></span>
        {#if loading && count === undefined}
          <span class="secline-cnt" aria-hidden="true">
            <DecryptPlaceholder length={3} />
          </span>
        {:else if count !== undefined && totalCount !== undefined}
          <span class="secline-cnt" aria-hidden="true" data-count={count}
            >{m.dashboard_section_count_of({
              shown: String(count),
              total: String(totalCount),
            })}</span
          >
        {:else if count !== undefined}
          <span class="secline-cnt" aria-hidden="true" data-count={count}
            >{count}</span
          >
        {/if}
        <span class="toggle-chevron" class:expanded aria-hidden="true">
          &#x276F;
        </span>
      </span>
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

  .section-toggle :global(.section-icon) {
    flex-shrink: 0;
    align-self: center;
  }

  .toggle-chevron {
    display: inline-block;
    font-size: 0.625rem;
    transition: transform 200ms ease;
    transform: rotate(90deg);
    opacity: 0.35;
    color: var(--muted);
    align-self: center;
  }

  .toggle-chevron.expanded {
    transform: rotate(-90deg);
  }
</style>
