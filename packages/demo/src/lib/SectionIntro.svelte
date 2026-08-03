<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { resolveStoryMessage } from "./story-messages.js";
  import type { Section, SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import {
    FRAME_PAD_TOP,
    FRAME_PAD_BOTTOM,
    FRAME_PAD_X,
    computeLineSegments,
    type Segment,
  } from "./flow-layout.js";
  import { setHeaderBottom } from "./flow-geometry.svelte.js";

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
  // the flow layout engine. It instead asks that engine's own segment
  // function where a line at its position would be allowed to sit, then
  // insets itself to match. Sharing computeLineSegments is what keeps the
  // header's measure and centring identical to the body text below it.
  //
  // The tinted backdrop stays full width; only the inner content moves,
  // which also keeps the measurement stable (the measured element's own
  // box never changes as a result of the inset).
  // -----------------------------------------------------------------------

  let introEl = $state<HTMLDivElement | undefined>(undefined);
  let dodgeLeft = $state(0);
  let dodgeRight = $state(0);

  /** Sticky offset from the CSS below. Both must move together. */
  const STICKY_TOP = 64;
  /** Width at or above which the header is sticky (matches the CSS). */
  const STICKY_BREAKPOINT = 900;

  // Cached geometry, re-measured only when the element or window
  // resizes, never per scroll frame. `docTop` is stored in DOCUMENT
  // space (rect.top + scrollY) because that is scroll-invariant; the
  // viewport top is derived from it below. Caching the viewport rect
  // directly would be wrong below the sticky breakpoint, where the
  // header scrolls normally and its viewport rect moves every frame.
  interface CachedBox {
    docTop: number;
    left: number;
    width: number;
    height: number;
  }
  let cachedBox = $state<CachedBox | null>(null);

  // Scroll position, tracked as plain state. Reading window.scrollY does
  // not force layout the way getBoundingClientRect does, so this is
  // cheap to update per frame.
  let scrollY = $state(0);
  let windowW = $state(0);

  $effect(() => {
    function syncScroll(): void {
      scrollY = window.scrollY;
    }
    function syncWidth(): void {
      windowW = window.innerWidth;
    }
    syncScroll();
    syncWidth();
    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncWidth, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncWidth);
    };
  });

  $effect(() => {
    if (introEl === undefined) {
      cachedBox = null;
      return;
    }
    const el = introEl;

    function measure(): void {
      const r = el.getBoundingClientRect();
      cachedBox = {
        docTop: r.top + window.scrollY,
        left: r.left,
        width: r.width,
        height: r.height,
      };
    }
    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);

    // Window resize can reposition the element even without an element
    // resize (e.g. the sticky offset shifts).
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  });

  $effect(() => {
    const fLeft = frameRect.left;
    const fTop = frameRect.top;
    const fW = frameRect.outerW;
    const fH = frameRect.outerH;

    const box = cachedBox;

    if (introEl === undefined || box === null) {
      dodgeLeft = 0;
      dodgeRight = 0;
      return;
    }

    // Derive the viewport top from the cached document position. Above
    // the breakpoint the header is sticky, so it stops at STICKY_TOP
    // once scrolled to; below it, it scrolls normally. Deriving rather
    // than caching the viewport rect is what keeps this correct on
    // narrow layouts, where the frame still overlaps the header.
    const flowTop = box.docTop - scrollY;
    const viewportTop =
      windowW >= STICKY_BREAKPOINT ? Math.max(STICKY_TOP, flowTop) : flowTop;
    const r = {
      top: viewportTop,
      left: box.left,
      width: box.width,
      height: box.height,
    };

    // Build the padded hole in the header's own coordinate space, using
    // the same padding constants the flow layout applies.
    const hole = {
      left: fLeft - FRAME_PAD_X - r.left,
      top: fTop - FRAME_PAD_TOP - r.top,
      right: fLeft + fW + FRAME_PAD_X - r.left,
      bottom: fTop + fH + FRAME_PAD_BOTTOM - r.top,
    };

    // Ask for the bands a single line spanning the header's full height
    // would get. Height rather than a text line height because the whole
    // header block has to clear the frame, not one row of it.
    const segments = computeLineSegments(0, r.height, r.width, hole);

    // Two bands means the frame splits the column. The header is one
    // block of prose and cannot flow around it, so it picks a side.
    //
    // The two flanks come back equal (they are centred on the frame), so
    // their widths cannot break the tie. Decide from the room each side
    // actually has instead, which is what "the roomier side" means here.
    // No bands at all means nothing fits: fall back to full width and
    // let the frame overlap rather than collapsing the header.
    let chosen: Segment | undefined;
    if (segments.length > 1) {
      const roomLeft = hole.left;
      const roomRight = r.width - hole.right;
      chosen = roomLeft >= roomRight ? segments.at(0) : segments.at(1);
    } else {
      chosen = segments.at(0);
    }
    if (chosen === undefined) {
      dodgeLeft = 0;
      dodgeRight = 0;
      return;
    }

    dodgeLeft = chosen.x;
    dodgeRight = Math.max(0, r.width - (chosen.x + chosen.width));
  });

  // Publish the header's bottom edge so the selection band can sit just
  // below it. Derived from the same cached box and sticky rule as the
  // dodge above, so the two can never disagree about where the header
  // ends.
  $effect(() => {
    const box = cachedBox;
    if (box === null) return;
    const flowTop = box.docTop - scrollY;
    const viewportTop =
      windowW >= STICKY_BREAKPOINT ? Math.max(STICKY_TOP, flowTop) : flowTop;
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
