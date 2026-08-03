<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { resolveStoryMessage } from "./story-messages.js";
  import type { Section, SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";

  interface Props {
    section: Section;
    activeSub: string | null;
    locale: string;
    seenTopics: ReadonlySet<DemoTopic>;
    /** False on the entry page, whose subs preview the handbook rather
     *  than naming real routes. There it renders as a plain list. */
    interactive: boolean;
    onSubClick: (sectionId: SectionId, subSlug: string) => void;
  }

  let {
    section,
    activeSub,
    locale,
    seenTopics,
    interactive,
    onSubClick,
  }: Props = $props();

  function msg(key: string): string {
    return resolveStoryMessage(key, locale);
  }
</script>

<!--
  Vertical sub navigation for the active section. Only rendered on wide
  layouts; below that the horizontal chips in SectionIntro carry the same
  job, so the two are never on screen together.

  The rail lives in its own grid column rather than overlaying the text.
  That keeps it outside the flow layout entirely: the text container just
  measures narrower, and the frame-dodging geometry follows it without
  needing to know the rail exists.
-->
<nav class="section-rail" aria-label={msg(section.titleKey)}>
  <ol class="rail-list">
    {#each section.subs as sub, i (sub.slug)}
      {@const isActive = activeSub === sub.slug}
      {@const isSeen = sub.topic !== null && seenTopics.has(sub.topic)}
      <li>
        {#if interactive}
          <button
            class="rail-item"
            class:rail-item--active={isActive}
            class:rail-item--seen={isSeen && !isActive}
            type="button"
            aria-current={isActive ? "true" : undefined}
            onclick={() => onSubClick(section.id, sub.slug)}
          >
            <span class="rail-index" aria-hidden="true">{i + 1}</span>
            <span class="rail-label">{msg(sub.headingKey)}</span>
            {#if isSeen}
              <Check size={12} class="rail-check" />
            {/if}
          </button>
        {:else}
          <!-- Rendered as a span, not a disabled button: these entries
               are a preview of what the handbook covers, so they should
               not read as controls that happen to be unavailable. -->
          <span class="rail-item rail-item--static">
            <span class="rail-index" aria-hidden="true">{i + 1}</span>
            <span class="rail-label">{msg(sub.headingKey)}</span>
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .section-rail {
    position: sticky;
    /* Clears the top bar, matching the sticky section header. */
    top: 64px;
    align-self: start;
    padding: 2rem 0 1rem;
  }

  .rail-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    /* The active marker is drawn as a left border on each item, so the
       track reads as one continuous line down the rail. */
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }

  :global(html.dark) .rail-list {
    border-left-color: rgba(255, 255, 255, 0.12);
  }

  .rail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    /* Negative margin pulls the item's own accent border on top of the
       list's track line, so the active state thickens that line rather
       than drawing a second one beside it. */
    margin-left: -1px;
    border: none;
    border-left: 2px solid transparent;
    padding: 0.5rem 0.5rem 0.5rem 0.75rem;
    min-height: 44px;
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 500;
    text-align: left;
    color: #636366;
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .rail-item:hover {
    background: rgba(0, 0, 0, 0.04);
    color: #1d1d1f;
  }

  /* Must follow .rail-item:hover to win on equal specificity. */
  .rail-item--static,
  .rail-item--static:hover {
    cursor: default;
    background: transparent;
  }

  .rail-item:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: -2px;
    border-radius: 4px;
  }

  :global(html.dark) .rail-item {
    color: #98989d;
  }

  :global(html.dark) .rail-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #f5f5f7;
  }

  :global(html.dark) .rail-item:focus-visible {
    outline-color: #64d2ff;
  }

  .rail-item--active {
    border-left-color: #007aff;
    color: #007aff;
    font-weight: 600;
  }

  :global(html.dark) .rail-item--active {
    border-left-color: #64d2ff;
    color: #64d2ff;
  }

  .rail-item--seen {
    color: #86868b;
  }

  /* Index numeral, matching the numbered headings in the flow text. */
  .rail-index {
    flex-shrink: 0;
    min-width: 1.1em;
    font-variant-numeric: tabular-nums;
    font-size: 0.75rem;
    color: #a1a1a6;
  }

  .rail-item--active .rail-index {
    color: inherit;
  }

  .rail-label {
    flex: 1 1 auto;
    min-width: 0;
  }

  .rail-item :global(.rail-check) {
    flex-shrink: 0;
    color: #34c759;
  }

  @media (prefers-reduced-motion: reduce) {
    .rail-item {
      transition: none;
    }
  }
</style>
