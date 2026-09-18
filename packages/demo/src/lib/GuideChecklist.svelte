<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { resolveOptionalStoryMessage } from "./story-messages.js";
  import { getGuide, type GuideSlug } from "./guide-checklists.js";
  import {
    isStepDone,
    toggleStep,
    guideProgress,
  } from "./guide-progress.svelte.js";
  import type { SectionId } from "./bridge.js";

  interface Props {
    slug: GuideSlug;
    locale: string;
    onNavigate: (sectionId: SectionId, subSlug: string) => void;
  }

  let { slug, locale, onNavigate }: Props = $props();

  const guide = $derived(getGuide(slug));

  const title: string | null = $derived(
    guide !== undefined
      ? resolveOptionalStoryMessage(guide.titleKey, locale)
      : null,
  );

  const displayTitle: string = $derived(
    title ?? (import.meta.env.DEV ? slug : ""),
  );

  const progress = $derived(guideProgress(slug));
</script>

{#if guide !== undefined}
  <div class="guide-checklist">
    <h2 class="guide-title">{displayTitle}</h2>

    <p class="guide-progress">
      {m.demo_guide_progress({
        done: String(progress.done),
        total: String(progress.total),
      })}
    </p>

    <p class="guide-unlinked-note">
      {m.demo_excursion_unlinked_note()}
    </p>

    <ol class="guide-steps">
      {#each guide.steps as step, idx (idx)}
        {@const done = isStepDone(slug, idx)}
        {@const bodyText = resolveOptionalStoryMessage(step.bodyKey, locale)}
        <li class="guide-step">
          <label class="guide-step-label">
            <input
              type="checkbox"
              checked={done}
              aria-label={bodyText ?? step.bodyKey}
              onchange={() => toggleStep(slug, idx)}
            />
            <span class="guide-step-body" class:guide-step-body--done={done}>
              {bodyText ?? step.bodyKey}
            </span>
          </label>
          {#if step.target !== null}
            <button
              class="guide-show-me"
              type="button"
              onclick={() => {
                if (step.target !== null) {
                  onNavigate(step.target.sectionId, step.target.subSlug);
                }
              }}
            >
              &rarr;
            </button>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
{/if}

<style>
  .guide-checklist {
    /* No padding: ExcursionSurface content wrapper handles padding */
  }

  .guide-title {
    margin: 0 0 8px;
    font: 700 24px "Atkinson Hyperlegible Next";
    line-height: 32px;
    color: var(--ink, #1a1a1a);
  }

  .guide-progress {
    margin: 0 0 4px;
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--muted, #888);
  }

  .guide-unlinked-note {
    margin: 0 0 12px;
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--muted, #888);
  }

  .guide-steps {
    margin: 0;
    padding: 0;
    list-style: decimal;
    padding-left: 24px;
  }

  .guide-step {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px solid var(--hair-2, #ccc);
  }

  .guide-step-label {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    flex: 1;
    cursor: pointer;
  }

  .guide-step-label input[type="checkbox"] {
    flex-shrink: 0;
    margin-top: 3px;
    width: 16px;
    height: 16px;
    accent-color: var(--demo-accent, #0066cc);
  }

  .guide-step-body {
    flex: 1;
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--ink-2, #444);
  }

  .guide-step-body--done {
    color: var(--muted, #888);
    text-decoration: line-through;
  }

  .guide-show-me {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--muted, #888);
    cursor: pointer;
  }

  .guide-show-me:hover {
    color: var(--ink, #1a1a1a);
  }

  .guide-show-me:focus-visible {
    outline: 2px solid var(--demo-accent, #0066cc);
    outline-offset: 2px;
  }
</style>
