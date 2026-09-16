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
    title !== null ? title : import.meta.env.DEV ? slug : "",
  );

  const progress = $derived(guideProgress(slug));
</script>

{#if guide !== undefined}
  <div class="guide-checklist">
    <h3 class="guide-title">{displayTitle}</h3>

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
            <span class="guide-step-body">
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
    padding: 12px 16px;
  }

  .guide-title {
    margin: 0 0 4px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink, #1a1a1a);
  }

  .guide-progress {
    margin: 0 0 8px;
    font-size: 0.8125rem;
    color: var(--ink-muted, #666);
  }

  .guide-unlinked-note {
    margin: 0 0 12px;
    font-size: 0.75rem;
    font-style: italic;
    color: var(--ink-muted, #666);
  }

  .guide-steps {
    margin: 0;
    padding: 0 0 0 20px;
    list-style: none;
    counter-reset: step;
  }

  .guide-step {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 0;
    counter-increment: step;
  }

  .guide-step::before {
    content: counter(step) ".";
    flex-shrink: 0;
    width: 20px;
    font-size: 0.8125rem;
    color: var(--ink-muted, #666);
    text-align: right;
  }

  .guide-step-label {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    flex: 1;
    cursor: pointer;
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--ink, #1a1a1a);
  }

  .guide-step-label input[type="checkbox"] {
    flex-shrink: 0;
    margin-top: 2px;
    width: 16px;
    height: 16px;
  }

  .guide-step-body {
    flex: 1;
  }

  .guide-show-me {
    flex-shrink: 0;
    background: none;
    border: 1px solid var(--hair, #ddd);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 0.8125rem;
    color: var(--accent, #0066cc);
    cursor: pointer;
    line-height: 1.4;
  }

  .guide-show-me:hover {
    background: var(--hover, #f5f5f5);
  }
</style>
