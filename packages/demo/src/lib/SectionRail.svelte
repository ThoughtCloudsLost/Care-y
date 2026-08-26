<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { resolveStoryMessage, deriveSubState } from "./story-messages.js";
  import type { Section, SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import { ENTRANCE_DUR_MS, entranceDelayMs } from "./flow-entrance.js";

  interface Props {
    section: Section;
    activeSub: string | null;
    locale: string;
    seenTopics: ReadonlySet<DemoTopic>;
    /** False on the entry page, whose subs preview the handbook rather
     *  than naming real routes. There it renders as a plain list. */
    interactive: boolean;
    /** Play the fullscreen-exit entrance: item N fades in on the same
     *  clock as subsection N in the prose (group N + 1; the page header
     *  owns the zeroth group). */
    entrance?: boolean;
    onSubClick: (sectionId: SectionId, subSlug: string) => void;
  }

  let {
    section,
    activeSub,
    locale,
    seenTopics,
    interactive,
    entrance = false,
    onSubClick,
  }: Props = $props();

  function msg(key: string): string {
    return resolveStoryMessage(key, locale);
  }
</script>

<!--
  Vertical sub navigation for the active section. Only rendered on wide
  layouts; below that the scrolling strip in SectionStrip carries the same
  job, so the two are never on screen together.

  The rail lives in its own grid column rather than overlaying the text.
  That keeps it outside the flow layout entirely: the text container just
  measures narrower, and the frame-dodging geometry follows it without
  needing to know the rail exists.
-->
<nav class="section-rail" aria-label={msg(section.titleKey)}>
  <ol class="rail-list">
    {#each section.subs as sub, i (sub.slug)}
      {@const state = deriveSubState(
        sub.slug,
        activeSub,
        sub.topic,
        seenTopics,
      )}
      {@const isActive = state.isActive}
      {@const isSeen = state.isSeen}
      <li
        class:rail-enter={entrance}
        style:animation-duration={entrance
          ? `${String(ENTRANCE_DUR_MS)}ms`
          : undefined}
        style:animation-delay={entrance
          ? `${String(entranceDelayMs(i + 1))}ms`
          : undefined}
      >
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
    /* Clears the top chrome, matching the sticky section header. The
       story root publishes --top-chrome-offset; it grows when the data
       flow band opens. */
    top: var(--top-chrome-offset, 64px);
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
    border-left: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
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
    color: var(--muted);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .rail-item:hover {
    background: color-mix(in srgb, var(--ink) 4%, transparent);
    color: var(--ink);
  }

  /* Must follow .rail-item:hover to win on equal specificity. */
  .rail-item--static,
  .rail-item--static:hover {
    cursor: default;
    background: transparent;
  }

  .rail-item:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
    border-radius: 4px;
  }

  .rail-item--active {
    border-left-color: var(--demo-accent);
    color: var(--demo-accent);
    font-weight: 600;
  }

  .rail-item--seen {
    color: var(--muted);
  }

  /* Index numeral, matching the numbered headings in the flow text. */
  .rail-index {
    flex-shrink: 0;
    min-width: 1.1em;
    font-variant-numeric: tabular-nums;
    font-size: 0.75rem;
    color: var(--muted);
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
    color: var(--meter-strong);
  }

  @media (prefers-reduced-motion: reduce) {
    .rail-item {
      transition: none;
    }
  }

  /* Fullscreen-exit entrance. Duration and delay are set inline from
     the shared flow-entrance constants so item N lands with subsection
     N in the prose on one clock. `both` keeps the item invisible
     through its delay; once the animation has run the host drops the
     class with no visible change. */
  .rail-enter {
    animation-name: rail-enter;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }

  @keyframes rail-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail-enter {
      animation: none;
    }
  }
</style>
