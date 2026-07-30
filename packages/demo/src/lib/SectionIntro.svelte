<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { resolveStoryMessage } from "./story-messages.js";
  import type { Section, SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import {
    FRAME_PAD_TOP,
    FRAME_PAD_BOTTOM,
    FRAME_PAD_X,
    HOLE_GAP,
  } from "./flow-layout.js";

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
    frameRect: {
      left: number;
      top: number;
      outerW: number;
      outerH: number;
    };
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
  // Frame dodging
  //
  // The header is normal DOM (sticky at >=900px), so it cannot go through
  // the flow layout engine. Instead it insets its text on whichever side
  // the frame occupies. The tinted backdrop stays full width; only the
  // inner content shrinks, which also keeps the measurement stable (the
  // measured element's own box never changes as a result of the inset).
  // -----------------------------------------------------------------------

  /** Below this the remaining column is too narrow to read, so give up
   *  and let the frame overlap rather than squeezing to a sliver. */
  const MIN_INTRO_TEXT = 220;

  let introEl = $state<HTMLDivElement | undefined>(undefined);
  let dodgeLeft = $state(0);
  let dodgeRight = $state(0);
  let scrollY = $state(0);

  $effect(() => {
    function sync(): void {
      scrollY = window.scrollY;
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  });

  $effect(() => {
    // The frame is viewport-fixed but a sticky header's viewport rect
    // still moves as the page scrolls, so both are dependencies.
    const fLeft = frameRect.left;
    const fTop = frameRect.top;
    const fW = frameRect.outerW;
    const fH = frameRect.outerH;
    void scrollY;

    if (introEl === undefined) {
      dodgeLeft = 0;
      dodgeRight = 0;
      return;
    }

    const r = introEl.getBoundingClientRect();
    const bandTop = fTop - FRAME_PAD_TOP;
    const bandBottom = fTop + fH + FRAME_PAD_BOTTOM;
    if (bandBottom <= r.top || bandTop >= r.bottom) {
      dodgeLeft = 0;
      dodgeRight = 0;
      return;
    }

    // Match the flow's horizontal clearance so the header and the body
    // text below it line up against the same edge.
    const gap = FRAME_PAD_X + HOLE_GAP;
    const frameLeftEdge = fLeft - gap;
    const frameRightEdge = fLeft + fW + gap;

    // Keep the wider of the two sides and inset the other.
    if (frameLeftEdge - r.left >= r.right - frameRightEdge) {
      const inset = Math.max(0, r.right - frameLeftEdge);
      dodgeRight = r.width - inset >= MIN_INTRO_TEXT ? inset : 0;
      dodgeLeft = 0;
    } else {
      const inset = Math.max(0, frameRightEdge - r.left);
      dodgeLeft = r.width - inset >= MIN_INTRO_TEXT ? inset : 0;
      dodgeRight = 0;
    }
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
    style:margin-left="{dodgeLeft}px"
    style:margin-right="{dodgeRight}px"
  >
    <h2 class="section-title">{msg(section.titleKey)}</h2>
    <p class="section-desc">{msg(section.descKey)}</p>

    {#if showToc && section.subs.length > 1}
      <nav class="section-toc" aria-label={msg(section.titleKey)}>
        {#each section.subs as sub (sub.slug)}
          {@const subActive = activeSub === sub.slug}
          {@const subSeen = sub.topic !== null && seenTopics.has(sub.topic)}
          <button
            class="toc-item"
            class:toc-item-active={subActive}
            class:toc-item-seen={subSeen && !subActive}
            type="button"
            onclick={() => onSubClick(section.id, sub.slug)}
          >
            <span class="toc-label">{msg(sub.headingKey)}</span>
            {#if subSeen}
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

  /* Desktop pinning: intro sticks at top below TopBar */
  @media (min-width: 900px) {
    .section-intro {
      position: sticky;
      top: 64px;
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

  /* Small screens: no sticky intro, hide description */
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
