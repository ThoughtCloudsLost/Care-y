<script lang="ts">
  import { ArrowLeft } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { MAX_MEASURE } from "./flow-layout.js";
  import { activeExcursion, closeExcursion } from "./excursion.svelte.js";
  import GuideChecklist from "./GuideChecklist.svelte";
  import type { SectionId } from "./bridge.js";

  interface Props {
    presentation: "column" | "drawer";
    locale: string;
    onNavigate: (sectionId: SectionId, subSlug: string) => void;
  }

  let { presentation, locale, onNavigate }: Props = $props();

  const excursion = $derived(activeExcursion());

  function handleBack(): void {
    closeExcursion("user");
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.stopPropagation();
      handleBack();
    }
  }
</script>

{#if excursion !== null}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="excursion-surface"
    class:excursion-surface--drawer={presentation === "drawer"}
    onkeydown={handleKeydown}
  >
    <div class="excursion-content" style="max-width: {MAX_MEASURE}px">
      <button
        class="excursion-back"
        type="button"
        onclick={handleBack}
        aria-label={m.demo_excursion_back()}
      >
        <ArrowLeft size={15} />
        <span>{m.demo_excursion_back()}</span>
      </button>

      {#if excursion.kind === "guide"}
        <GuideChecklist slug={excursion.slug} {locale} {onNavigate} />
      {/if}
      <!-- Search and aggregation excursions render as synthetic
           sections through the story pipeline, never through this
           panel (excursion-sections.ts). -->
    </div>
  </div>
{/if}

<style>
  .excursion-surface {
    overflow-y: auto;
    height: 100%;
    background: var(--paper, #fff);
    color: var(--ink, #1a1a1a);
  }

  .excursion-surface--drawer {
    min-width: 200px;
  }

  .excursion-content {
    margin: 0 auto;
    padding: 24px;
  }

  .excursion-back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    padding: 0;
    font: 400 15px "Atkinson Hyperlegible Next";
    color: var(--muted, #888);
    cursor: pointer;
    margin-bottom: 12px;
  }

  .excursion-back:hover {
    color: var(--ink, #1a1a1a);
  }

  .excursion-back:focus-visible {
    outline: 2px solid var(--demo-accent, #0066cc);
    outline-offset: 2px;
  }
</style>
