<script lang="ts">
  import { slide } from "svelte/transition";
  import { browser } from "$app/environment";
  import type { Snippet, Component } from "svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import { formatCount } from "$lib/tickets/format-count.js";
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
    /** True when totalCount is a floor ("N+"): its source stopped short. */
    totalCountIsFloor?: boolean;
    loading?: boolean;
    icon?: Component;
    iconColor?: string;
    expanded: boolean;
    ontoggle: () => void;
    /**
     * False renders the header as a plain heading with no toggle, and the
     * body always shows. `expanded` and `ontoggle` are then unused.
     */
    collapsible?: boolean;
    /** Rendered at the right end of the header row, after the chevron. */
    headerExtra?: Snippet;
    /**
     * A control in the header row just left of the count, such as a filter
     * button.
     */
    headerAction?: Snippet;
    /**
     * Rendered between the header and the body, outside the collapsible
     * region (a lane's subgrid gives it its own row). It shows only while
     * the body does, so collapsing a section hides its filters too.
     */
    filterRow?: Snippet;
    children?: Snippet;
  }

  let {
    id,
    heading,
    count,
    totalCount,
    totalCountIsFloor = false,
    loading = false,
    icon: Icon,
    iconColor = "currentColor",
    expanded,
    ontoggle,
    collapsible = true,
    headerExtra,
    headerAction,
    filterRow,
    children,
  }: CollapsibleSectionProps = $props();

  const stableId = $derived(id ?? heading.toLowerCase().replace(/\s+/g, "-"));
  const headingId = $derived(`${stableId}-heading`);
  const bodyShown = $derived(!collapsible || expanded);

  const countText = $derived.by((): string | undefined => {
    if (count === undefined) return undefined;
    if (totalCount === undefined) return String(count);
    return m.dashboard_section_count_of({
      shown: String(count),
      total: formatCount(totalCount, totalCountIsFloor),
    });
  });
</script>

{#snippet secline()}
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
    {#if countText !== undefined}
      <!-- The visible count sits outside the toggle, past the header
           action; this hidden copy puts it in the toggle's or heading's
           accessible name. -->
      <span class="sr-only">{countText}</span>
    {/if}
  </span>
{/snippet}

<div class="collapsible-section">
  <!-- The toggle's ::after stretches over the whole row, so a tap on the
       count or the chevron toggles too. The action and extra controls sit
       above it. -->
  <div class="section-header">
    {#if collapsible}
      <button
        type="button"
        class="section-toggle"
        onclick={ontoggle}
        aria-expanded={expanded}
        aria-controls={expanded ? `${stableId}-region` : undefined}
      >
        {@render secline()}
      </button>
    {:else}
      <h2 class="section-title">
        {@render secline()}
      </h2>
    {/if}
    {#if headerAction}
      <div class="header-action">
        {@render headerAction()}
      </div>
    {/if}
    {#if loading && count === undefined}
      <span class="secline-cnt" aria-hidden="true">
        <DecryptPlaceholder length={3} />
      </span>
    {:else if countText !== undefined}
      <span class="secline-cnt" aria-hidden="true" data-count={count}
        >{countText}</span
      >
    {/if}
    {#if collapsible}
      <span class="toggle-chevron" class:expanded aria-hidden="true">
        &#x276F;
      </span>
    {/if}
    {#if headerExtra}
      <div class="header-extra">
        {@render headerExtra()}
      </div>
    {/if}
  </div>
  {#if filterRow && bodyShown}
    {@render filterRow()}
  {/if}
  {#if bodyShown}
    <!-- The region is what the toggle controls. A section that does not
         collapse is named by its heading alone, and whatever it holds can
         carry a region of its own (a lane that scrolls by itself). -->
    <div
      id={`${stableId}-region`}
      class="section-content"
      role={collapsible ? "region" : undefined}
      aria-labelledby={collapsible ? headingId : undefined}
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

  /* The row owns the secline's vertical padding and its right inset, so
     the heading, the action, the count, and the chevron center on one
     line and the last of them keeps the inset. The secline keeps only its
     left inset. */
  .section-header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 18px var(--section-inset, var(--page-pad-x)) 8px 0;
  }

  .secline {
    padding-top: 0;
    padding-right: 0;
    padding-bottom: 0;
  }

  .section-toggle::after {
    content: "";
    position: absolute;
    inset: 0;
  }

  .header-action,
  .header-extra {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  /* Zero height, so the action's 44px tap target centers on the count's
     line and overflows the row evenly instead of growing it. */
  .header-action {
    height: 0;
  }

  .secline-cnt {
    flex-shrink: 0;
  }

  .section-toggle,
  .section-title {
    flex: 1;
    min-width: 0;
    display: block;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    font-family: inherit;
  }

  .section-toggle {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  /* The heading form of the toggle: same line, no button affordance. */
  .section-title {
    margin: 0;
    font: inherit;
  }

  .section-toggle :global(.section-icon),
  .section-title :global(.section-icon) {
    flex-shrink: 0;
    align-self: center;
  }

  .toggle-chevron {
    display: inline-block;
    flex-shrink: 0;
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
