<script lang="ts">
  import { ArrowLeft } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { activeExcursion, closeExcursion } from "./excursion.svelte.js";
  import GuideChecklist from "./GuideChecklist.svelte";
  import AggregationView from "./AggregationView.svelte";
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
    class:excursion-surface--column={presentation === "column"}
    class:excursion-surface--drawer={presentation === "drawer"}
    onkeydown={handleKeydown}
  >
    <div class="excursion-header">
      <button
        class="excursion-back"
        type="button"
        onclick={handleBack}
        aria-label={m.demo_excursion_back()}
      >
        <ArrowLeft size={16} />
        <span>{m.demo_excursion_back()}</span>
      </button>
    </div>

    <div class="excursion-body">
      {#if excursion.kind === "guide"}
        <GuideChecklist slug={excursion.slug} {locale} {onNavigate} />
      {:else}
        <AggregationView pageId={excursion.page} {locale} {onNavigate} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .excursion-surface {
    display: flex;
    flex-direction: column;
    background: var(--paper, #fff);
    color: var(--ink, #1a1a1a);
  }

  .excursion-surface--column {
    position: absolute;
    inset: 0;
  }

  .excursion-surface--drawer {
    overflow-y: auto;
    height: 100%;
    min-width: 200px;
  }

  .excursion-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--hair, #ddd);
    flex-shrink: 0;
  }

  .excursion-back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    padding: 4px 8px;
    font-size: 0.875rem;
    color: var(--accent, #0066cc);
    cursor: pointer;
    border-radius: 4px;
  }

  .excursion-back:hover {
    background: var(--hover, #f5f5f5);
  }

  .excursion-body {
    flex: 1;
    overflow-y: auto;
  }
</style>
