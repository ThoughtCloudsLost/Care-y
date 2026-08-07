<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { resolveStoryMessage, deriveSubState } from "./story-messages.js";
  import type { Section, SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import {
    createFrameDodge,
    type DodgeFrameRect,
  } from "./frame-dodge.svelte.js";
  import { setHeaderBottom, stickyTopOffset } from "./flow-geometry.svelte.js";
  import { WIDE_BREAKPOINT } from "./frame-geometry.svelte.js";

  interface Props {
    section: Section;
    activeSub: string | null;
    locale: string;
    seenTopics: ReadonlySet<DemoTopic>;
    showToc: boolean;
    /** Whether clicking the intro selects its section. False on the
     *  entry page, where a stray click must not skip into the demo. */
    selectable: boolean;
    /** Viewport-space frame rect, so the header can inset its text out
     *  from under the phone the same way the flow layout does. */
    frameRect: DodgeFrameRect;
    onSubClick: (sectionId: SectionId, subSlug: string) => void;
    onSectionClick: (sectionId: SectionId) => void;
  }

  let {
    section,
    activeSub,
    locale,
    seenTopics,
    showToc,
    selectable,
    frameRect,
    onSubClick,
    onSectionClick,
  }: Props = $props();

  // -----------------------------------------------------------------------
  // Frame dodging via the shared createFrameDodge utility
  //
  // The header is normal DOM (sticky at >=900px), so it cannot go through
  // the flow layout engine. createFrameDodge handles all the segment
  // computation, measurement caching, and scroll tracking.
  // -----------------------------------------------------------------------

  let introEl = $state<HTMLDivElement | undefined>(undefined);

  const dodge = createFrameDodge(() => frameRect, {
    stickyTop: () => stickyTopOffset(),
  });

  $effect(() => {
    dodge.observe(introEl);
  });

  // Opening the flow band changes where the header parks and how far
  // down the document it starts, but not its own size. Re-measure.
  $effect(() => {
    void stickyTopOffset();
    dodge.remeasure();
  });

  // Publish the header's bottom edge so the selection band can sit just
  // below it. Derived from the dodge's cached box and the same sticky
  // rule, so the two can never disagree about where the header ends.
  $effect(() => {
    const box = dodge.box;
    if (box === null) return;
    const flowTop = box.docTop - dodge.scrollY;
    const pinned = stickyTopOffset();
    const viewportTop =
      typeof window !== "undefined" && window.innerWidth >= WIDE_BREAKPOINT
        ? Math.max(pinned, flowTop)
        : flowTop;
    setHeaderBottom(viewportTop + box.height);
  });

  function msg(key: string): string {
    return resolveStoryMessage(key, locale);
  }

  /** Intro clicks select the section, but clicks that originated on
   *  the TOC buttons inside it already selected a sub. */
  function handleIntroClick(ev: MouseEvent): void {
    const target = ev.target;
    if (target instanceof Element && target.closest("button") !== null) return;
    onSectionClick(section.id);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="section-intro"
  class:section-intro-static={!selectable}
  bind:this={introEl}
  onclick={selectable ? handleIntroClick : undefined}
>
  <div
    class="section-intro-inner"
    style:margin-left="{dodge.left}px"
    style:margin-right="{dodge.right}px"
  >
    <h2 class="section-title">{msg(section.titleKey)}</h2>
    <p class="section-desc">{msg(section.descKey)}</p>

    {#if showToc && section.subs.length > 1}
      <nav class="section-toc" aria-label={msg(section.titleKey)}>
        {#each section.subs as sub (sub.slug)}
          {@const s = deriveSubState(
            sub.slug,
            activeSub,
            sub.topic,
            seenTopics,
          )}
          <button
            class="toc-item"
            class:toc-item-active={s.isActive}
            class:toc-item-seen={s.isSeen && !s.isActive}
            type="button"
            onclick={() => onSubClick(section.id, sub.slug)}
          >
            <span class="toc-label">{msg(sub.headingKey)}</span>
            {#if s.isSeen}
              <Check size={12} class="toc-check" />
            {/if}
          </button>
        {/each}
      </nav>
    {/if}
  </div>
</div>

<style>
  .section-intro {
    cursor: pointer;
    padding: 2rem 1rem 1rem;
    margin: 0 -1rem;
    border-radius: 8px;
    transition: background 0.25s ease;
    background: rgba(0, 122, 255, 0.05);
  }

  /* Only the content insets out from under the frame; the tinted
     backdrop keeps spanning the full column. */
  .section-intro-inner {
    transition:
      margin-left 0.12s ease-out,
      margin-right 0.12s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .section-intro-inner {
      transition: none;
    }
  }

  /* Must follow .section-intro to win on equal specificity. */
  .section-intro-static {
    cursor: default;
  }

  :global(html.dark) .section-intro {
    background: rgba(100, 210, 255, 0.06);
  }

  /* Desktop pinning: the intro sticks below the top chrome. The story
     root publishes --top-chrome-offset, which grows when the data flow
     band opens; the fallback is the bare top bar plus its gap.
     900px mirrors WIDE_BREAKPOINT from frame-geometry.svelte.ts */
  @media (min-width: 900px) {
    .section-intro {
      position: sticky;
      top: var(--top-chrome-offset, 64px);
      z-index: 2;
      padding-bottom: 1rem;
      margin-bottom: 0;
      background: rgba(233, 242, 253, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    :global(html.dark) .section-intro {
      background: rgba(26, 33, 41, 0.95);
    }
  }

  /* Small screens: no sticky intro, hide description.
     899px = WIDE_BREAKPOINT - 1 (see frame-geometry.svelte.ts) */
  @media (max-width: 899px) {
    .section-intro {
      padding: 1.5rem 0 0.75rem;
    }

    .section-desc {
      display: none;
    }
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #1d1d1f;
    line-height: 1.3;
  }

  :global(html.dark) .section-title {
    color: #f5f5f7;
  }

  .section-desc {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #636366;
    margin: 0 0 1rem;
    max-width: 36rem;
  }

  :global(html.dark) .section-desc {
    color: #a1a1a6;
  }

  .section-toc {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.25rem 0;
  }

  .toc-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3125rem 0.625rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #636366;
    cursor: pointer;
    white-space: nowrap;
    min-height: 44px;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .toc-item:hover {
    background: rgba(0, 0, 0, 0.04);
    color: #1d1d1f;
  }

  :global(html.dark) .toc-item {
    color: #98989d;
  }

  :global(html.dark) .toc-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #f5f5f7;
  }

  .toc-item-active {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }

  .toc-item-active:hover {
    background: rgba(0, 122, 255, 0.15);
    color: #007aff;
  }

  :global(html.dark) .toc-item-active {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  :global(html.dark) .toc-item-active:hover {
    background: rgba(0, 122, 255, 0.25);
    color: #64d2ff;
  }

  .toc-item-seen {
    color: #86868b;
  }

  .toc-label {
    flex: 0 1 auto;
    min-width: 0;
  }

  .toc-item :global(.toc-check) {
    flex-shrink: 0;
    color: #34c759;
  }

  @media (prefers-reduced-motion: reduce) {
    .section-intro {
      transition: none;
    }

    .toc-item {
      transition: none;
    }
  }
</style>
