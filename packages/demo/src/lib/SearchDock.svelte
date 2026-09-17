<!--
  Docked excursion chrome: back affordance plus, for the search
  excursion, the query input, label facet chips, and the result count.
  Docks under the top bar like SectionStrip and reports its height the
  same way (bind:offsetHeight at the host), so the story parks below it.
  The results themselves are NOT here: they render as a synthetic
  section through the normal story pipeline.
-->
<script lang="ts">
  import { ArrowLeft } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    /** Search mode shows input/facets/count; aggregation mode only back. */
    readonly showInput: boolean;
    readonly query: string;
    readonly resultCount: number;
    readonly facetLabels: readonly string[];
    readonly activeFacet: string | null;
    readonly onQueryInput: (value: string) => void;
    readonly onToggleFacet: (label: string) => void;
    readonly onBack: () => void;
  }

  let {
    showInput,
    query,
    resultCount,
    facetLabels,
    activeFacet,
    onQueryInput,
    onToggleFacet,
    onBack,
  }: Props = $props();

  let inputEl: HTMLInputElement | null = $state(null);

  // Autofocus on open; the dock mounts when the excursion opens.
  $effect(() => {
    if (showInput) inputEl?.focus();
  });
</script>

<div class="search-dock">
  <div class="sd-inner">
    <!-- Back shares the input's row: the dock's height budget is the
         story's vertical space. In search mode it shrinks to the arrow
         alone; the label stays for the aggregation back-only dock. -->
    <div class="sd-row">
      <button
        type="button"
        class="sd-back"
        onclick={onBack}
        aria-label={m.demo_excursion_back()}
        title={m.demo_excursion_back()}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {#if !showInput}{m.demo_excursion_back()}{/if}
      </button>
      {#if showInput}
        <input
          bind:this={inputEl}
          class="sd-input"
          type="search"
          value={query}
          placeholder={m.demo_handbook_search_placeholder()}
          aria-label={m.demo_handbook_search_placeholder()}
          oninput={(e) => onQueryInput(e.currentTarget.value)}
        />
        {#if query.trim().length > 0}
          <p class="sd-count" role="status" aria-live="polite">
            {resultCount === 0
              ? m.demo_handbook_search_no_results()
              : m.demo_handbook_search_result_count({ count: resultCount })}
          </p>
        {/if}
      {/if}
    </div>
    {#if showInput}
      {#if facetLabels.length > 0}
        <div
          class="sd-facets"
          role="group"
          aria-label={m.demo_handbook_search_placeholder()}
        >
          {#each facetLabels as label (label)}
            <button
              type="button"
              class="sd-facet"
              class:sd-facet--active={activeFacet === label}
              aria-pressed={activeFacet === label}
              onclick={() => onToggleFacet(label)}
            >
              {label}
            </button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .search-dock {
    padding: 6px var(--wrapper-pad-right, 24px) 6px
      var(--wrapper-pad-left, 24px);
    background: var(--paper);
  }

  /* Centered column: the input reads as the page's focal point while
     the search excursion is open, not as left-parked chrome. */
  .sd-inner {
    max-width: 620px;
    margin: 0 auto;
  }

  .sd-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sd-back {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    gap: 4px;
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--muted);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .sd-back:hover {
    color: var(--ink);
  }

  .sd-back:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 2px;
  }

  .sd-input {
    display: block;
    flex: 1;
    min-width: 0;
    font: 400 18px "Atkinson Hyperlegible Next";
    color: var(--ink);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--hair-2);
    padding: 4px 0;
  }

  .sd-input::placeholder {
    color: var(--muted);
  }

  .sd-input:focus-visible {
    outline: none;
    border-bottom-color: var(--demo-accent);
  }

  .sd-facets {
    /* One scrollable line, never a wrapping block: the dock must stay
       shallow so the story keeps the vertical space. */
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    gap: 0 10px;
    margin-top: 4px;
  }

  .sd-facets::-webkit-scrollbar {
    display: none;
  }

  .sd-facet {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .sd-facet {
    font: 700 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--ink);
    background: none;
    border: none;
    padding: 2px 6px;
    cursor: pointer;
  }

  .sd-facet--active {
    /* The prose highlighter wash, so an active facet reads as marked
       rather than as another control. */
    background: rgba(255, 214, 10, 0.38);
    border-radius: 2px;
  }

  .sd-facet:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 2px;
  }

  .sd-count {
    /* Rides the input's row instead of taking a line of its own. */
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 20px;
    color: var(--muted);
    margin: 0;
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
