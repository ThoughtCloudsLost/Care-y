<script lang="ts">
  import { tick } from "svelte";
  import { Spring, prefersReducedMotion } from "svelte/motion";
  import { SvelteSet } from "svelte/reactivity";
  import * as m from "$lib/paraglide/messages.js";
  import {
    getLocale,
    setLocale,
    getTextDirection,
    locales,
    isLocale,
  } from "$lib/paraglide/runtime.js";
  import { ArrowRight } from "@lucide/svelte";
  import TopBar from "$demo/TopBar.svelte";
  import StorySection from "$demo/StorySection.svelte";
  import DemoFrame from "$demo/DemoFrame.svelte";
  import {
    createScrollEngine,
    createTopicProgress,
  } from "$demo/scroll-engine.svelte.js";
  import { SECTIONS, type SectionId } from "$demo/scroll-sections.js";
  import type { DemoBridge, DemoBridgeState, DemoTopic } from "$demo/bridge.js";
  import { DEMO_TOPICS } from "$demo/bridge.js";

  // -----------------------------------------------------------------------
  // Dark mode with localStorage persistence
  // -----------------------------------------------------------------------

  const SCHEME_KEY = "care-y-color-scheme";

  function initScheme(): boolean {
    const stored = localStorage.getItem(SCHEME_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
    // "system" or absent: default to light, write the key so the phone
    // boot script finds it on first load
    localStorage.setItem(SCHEME_KEY, "light");
    return false;
  }

  let dark = $state(initScheme());

  // Apply scheme classes to html element and persist
  $effect(() => {
    const cl = document.documentElement.classList;
    cl.toggle("dark", dark);
    cl.toggle("light", !dark);
    cl.toggle("glass-dark", dark);
    cl.toggle("glass-light", !dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    localStorage.setItem(SCHEME_KEY, dark ? "dark" : "light");
  });

  // Forward dark changes to the phone iframe when the bridge is live
  $effect(() => {
    bridge?.setDark(dark);
  });

  // -----------------------------------------------------------------------
  // Bridge + phone state
  // -----------------------------------------------------------------------

  let bridge: DemoBridge | undefined = $state();
  let unsubscribe: (() => void) | undefined;
  let frameRef: DemoFrame | undefined = $state();

  // Topic progress tracking with SvelteSet for reactivity
  const seenTopics = new SvelteSet<DemoTopic>();
  const progress = createTopicProgress(seenTopics, DEMO_TOPICS.length);

  // Scroll engine (renders the shared location, sends page intents)
  const scrollEngine = createScrollEngine(() => bridge);

  // Track the last-seen restartSeq per bridge instance. A fresh bridge
  // starts at 0; an increment means the phone requested a restart
  // (avatar-panel sign-out via /logout).
  let lastRestartSeq = 0;

  function handleBridgeReady(b: DemoBridge): void {
    unsubscribe?.();
    bridge = b;
    lastRestartSeq = 0;

    // Reset progress on restart/reload
    progress.reset();
    b.setDark(dark);

    // Send the deep-link hash as an intent; the subscription below
    // replays the store's state (already moved if a hash was present)
    // and the engine mirrors it.
    scrollEngine.initFromHash();

    unsubscribe = b.subscribe((state: DemoBridgeState) => {
      progress.markFromState(state);
      scrollEngine.handleBridgeState(state);

      // Phone-initiated restart (avatar sign-out -> /logout)
      if (state.restartSeq > lastRestartSeq) {
        lastRestartSeq = state.restartSeq;
        handleRestart();
      }
    });
  }

  function handleRestart(): void {
    // A restart is a fresh boot: detach from the dying phone first so
    // the scroll-to-top below cannot send it a stray intent, and drop
    // the deep-link hash so the reloaded phone starts at login instead
    // of being re-driven to the old spot.
    unsubscribe?.();
    unsubscribe = undefined;
    bridge = undefined;
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    frameRef?.reload();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function handleToggleDark(): void {
    dark = !dark;
  }

  function handleSectionClick(id: SectionId): void {
    scrollEngine.selectSection(id);
  }

  /**
   * The next-section button. From the login section it doubles as
   * "complete login": the flow plays to the end in the phone (sign in,
   * confirm a method, key derivation) and the narrative follows the
   * phone through each stage, swapping to the tickets section when the
   * phone actually lands there. Selecting tickets directly here would
   * silently fast-forward auth and skip the story.
   */
  function handleNextSection(id: SectionId): void {
    if (scrollEngine.activeSection === "login" && bridge !== undefined) {
      bridge.completeLogin();
      return;
    }
    handleSectionClick(id);
  }

  function handleSubClick(sectionId: SectionId, subSlug: string): void {
    scrollEngine.selectSub(sectionId, subSlug);
  }

  // -----------------------------------------------------------------------
  // Slot frame: the fixed highlight the content snaps into. Its top
  // never moves (the slot line); only its height animates to fit the
  // item currently selected (the tip card when nothing is).
  // -----------------------------------------------------------------------

  let storyColumnEl: HTMLDivElement | undefined = $state();
  let frame = $state({ top: 0, left: 0, width: 0, visible: false });

  // The height resizes on a spring so the frame reads as liquid:
  // it swells or shrinks around the item that lands in it, with a
  // soft overshoot, instead of easing linearly.
  const frameHeight = new Spring(72, { stiffness: 0.14, damping: 0.5 });
  let frameMeasured = false;

  function measureSlotFrame(): void {
    const col = storyColumnEl;
    if (col === undefined) return;
    const line = scrollEngine.remeasure();
    const rect = col.getBoundingClientRect();
    // Items bleed 1rem past the column on both sides (their negative
    // margins); the frame matches that footprint.
    frame = {
      top: line,
      left: Math.max(0, rect.left - 16),
      width: rect.width + 32,
      visible: true,
    };
    updateSlotTracking();
  }

  // Focus fade: items dim with distance from the slot, bottoming out
  // at this opacity, so the slotted item reads as the focal point.
  const FADE_DISTANCE = 600;
  const FADE_FLOOR = 0.35;

  /**
   * Retarget the frame's height spring to the item nearest the slot
   * line and apply the distance fade to every item. Runs on scroll
   * frames and after geometry changes, so the morph and the focus
   * gradient play while content moves through the slot, not just when
   * a selection settles.
   */
  function updateSlotTracking(): void {
    if (!frame.visible) return;
    const items = document.querySelectorAll<HTMLElement>("[data-snap-sub]");
    let best: HTMLElement | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const el of items) {
      const dist = Math.abs(el.getBoundingClientRect().top - frame.top);
      const fade = Math.min(1, dist / FADE_DISTANCE);
      el.style.opacity = String(1 - fade * (1 - FADE_FLOOR));
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    }
    if (best === null) return;
    if (best.offsetHeight !== frameHeight.target || !frameMeasured) {
      void frameHeight.set(best.offsetHeight, {
        instant: !frameMeasured || prefersReducedMotion.current,
      });
    }
    frameMeasured = true;
  }

  $effect(() => {
    void scrollEngine.activeSection;
    void scrollEngine.activeSub;
    void uiLocale;
    void tick().then(measureSlotFrame);
  });

  $effect(() => {
    window.addEventListener("resize", measureSlotFrame);
    return () => window.removeEventListener("resize", measureSlotFrame);
  });

  let trackRaf = 0;

  function trackSlotWhileScrolling(): void {
    if (trackRaf !== 0) return;
    trackRaf = requestAnimationFrame(() => {
      trackRaf = 0;
      updateSlotTracking();
    });
  }

  $effect(() => {
    window.addEventListener("scroll", trackSlotWhileScrolling, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", trackSlotWhileScrolling);
      cancelAnimationFrame(trackRaf);
    };
  });

  // -----------------------------------------------------------------------
  // Locale: reactive $state owned here, passed down as prop
  // -----------------------------------------------------------------------

  let uiLocale = $state(getLocale());

  // -----------------------------------------------------------------------
  // Active section view (one list rendered at a time)
  // -----------------------------------------------------------------------

  const activeSectionDef = $derived(
    SECTIONS.find((s) => s.id === scrollEngine.activeSection),
  );

  const nextSectionDef = $derived.by(() => {
    const idx = SECTIONS.findIndex((s) => s.id === scrollEngine.activeSection);
    return idx >= 0 ? (SECTIONS.at(idx + 1) ?? null) : null;
  });

  function sectionTitle(id: SectionId): string {
    switch (id) {
      case "login":
        return m.demo_section_login_title();
      case "tickets":
        return m.demo_section_tickets_title();
      case "ticket-detail":
        return m.demo_section_ticket_detail_title();
      case "search":
        return m.demo_section_search_title();
      case "dashboard":
        return m.demo_section_dashboard_title();
      case "admin":
        return m.demo_section_admin_title();
      case "schedule":
        return m.demo_section_schedule_title();
      case "settings":
        return m.demo_section_settings_title();
    }
  }

  function handleLocaleChange(): void {
    // Cycle through available locales
    const currentIdx = locales.indexOf(uiLocale);
    const nextIdx = (currentIdx + 1) % locales.length;
    const next = locales.at(nextIdx);
    if (next === undefined || !isLocale(next)) return;

    void setLocale(next, { reload: false });
    document.documentElement.lang = next;
    document.documentElement.dir = getTextDirection(next);
    uiLocale = next;

    // The intro re-renders with new copy; re-measure the slot line
    void tick().then(() => scrollEngine.remeasure());
  }
</script>

{#key uiLocale}
  <TopBar
    activeSection={scrollEngine.activeSection}
    {dark}
    locale={uiLocale}
    seen={progress.count}
    total={progress.total}
    onSectionClick={handleSectionClick}
    onToggleDark={handleToggleDark}
    onRestart={handleRestart}
    onLocaleChange={handleLocaleChange}
  />
{/key}

<div class="scroll-story">
  <!-- The fixed selection slot: never moves, only resizes to fit the
       item that snapped into it. Content scrolls over it (it paints
       behind the story column). -->
  <div
    class="slot-frame"
    class:slot-frame-empty={scrollEngine.activeSub === null}
    style:top="{frame.top}px"
    style:left="{frame.left}px"
    style:width="{frame.width}px"
    style:height="{frameHeight.current}px"
    style:opacity={frame.visible ? 1 : 0}
    aria-hidden="true"
  ></div>

  <div class="story-layout">
    <!-- Phone column: sticky so it stays visible while content scrolls -->
    <div class="phone-column">
      <div class="phone-sticky">
        <DemoFrame
          {dark}
          onbridgeready={handleBridgeReady}
          bind:this={frameRef}
        />
      </div>
    </div>

    <!-- Story column: one section list at a time; the next-section
         button and the top bar swap which list is rendered -->
    <div class="story-column" bind:this={storyColumnEl}>
      {#key uiLocale}
        {#key scrollEngine.activeSection}
          {#if activeSectionDef}
            <div class="section-view">
              <StorySection
                section={activeSectionDef}
                activeSection={scrollEngine.activeSection}
                activeSub={scrollEngine.activeSub}
                locale={uiLocale}
                {seenTopics}
                onSubClick={handleSubClick}
                onSectionClick={handleSectionClick}
              />

              {#if nextSectionDef}
                <div class="next-section">
                  <button
                    class="next-section-btn"
                    type="button"
                    onclick={() => handleNextSection(nextSectionDef.id)}
                  >
                    {m.demo_section_next({
                      section: sectionTitle(nextSectionDef.id),
                    })}
                    <ArrowRight size={16} />
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        {/key}
      {/key}

      <!-- Bottom spacer so the last sub can reach the selection slot -->
      <div class="story-spacer" aria-hidden="true"></div>
    </div>
  </div>
</div>

<style>
  .scroll-story {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    background: #f5f5f7;
    color: #1d1d1f;
    min-height: 100vh;
  }

  :global(html.dark) .scroll-story {
    background: #161618;
    color: #f5f5f7;
  }

  .story-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1rem;
    /* Above the slot frame so text is never tinted by it */
    position: relative;
    z-index: 1;
  }

  /* The fixed selection slot. Top never moves; the height is driven
     by a spring (see script) so resizes feel liquid. Painted behind
     the story content so items slide over it into place. */
  .slot-frame {
    position: fixed;
    z-index: 0;
    border-radius: 8px;
    background: rgba(0, 122, 255, 0.07);
    border: 1.5px solid rgba(0, 122, 255, 0.25);
    pointer-events: none;
    transition:
      background 0.25s ease,
      border-color 0.25s ease;
  }

  .slot-frame-empty {
    background: rgba(0, 0, 0, 0.02);
    border: 1.5px dashed rgba(0, 0, 0, 0.2);
  }

  :global(html.dark) .slot-frame {
    background: rgba(100, 210, 255, 0.09);
    border-color: rgba(100, 210, 255, 0.3);
  }

  :global(html.dark) .slot-frame-empty {
    background: rgba(255, 255, 255, 0.02);
    border: 1.5px dashed rgba(255, 255, 255, 0.2);
  }

  @media (prefers-reduced-motion: reduce) {
    .slot-frame {
      transition: none;
    }
  }

  /* Sticky lives on the flex item itself: a content-height wrapper
     gives an inner sticky child no travel room, so the column is the
     element that pins while the story column provides the height. */
  .phone-column {
    width: 100%;
    position: sticky;
    top: 64px;
    z-index: 10;
    align-self: flex-start;
  }

  .phone-sticky {
    width: 100%;
    /* Small screens: shrink phone to 40vh */
    height: 40vh;
    min-height: 240px;
  }

  .story-column {
    flex: 1;
    min-width: 0;
    padding: 0 0 2rem;
  }

  .story-spacer {
    height: 65vh;
    flex-shrink: 0;
  }

  /* Light entrance when a section list swaps in */
  .section-view {
    animation: section-in 0.2s ease-out;
  }

  @keyframes section-in {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .section-view {
      animation: none;
    }
  }

  .next-section {
    padding: 1.5rem 0 0;
  }

  .next-section-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.125rem;
    border: none;
    border-radius: 8px;
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    transition: background 0.15s ease;
  }

  .next-section-btn:hover {
    background: rgba(0, 122, 255, 0.16);
  }

  :global(html.dark) .next-section-btn {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  :global(html.dark) .next-section-btn:hover {
    background: rgba(0, 122, 255, 0.28);
  }

  /* Desktop: two columns side by side */
  @media (min-width: 900px) {
    .story-layout {
      flex-direction: row;
      align-items: flex-start;
      gap: 2.5rem;
      padding-top: 1.5rem;
    }

    .phone-column {
      flex: 0 0 420px;
    }

    .phone-column {
      top: 80px;
    }

    .phone-sticky {
      height: calc(100vh - 96px);
      min-height: 500px;
    }

    .story-column {
      flex: 1;
      min-width: 0;
      padding: 0 0 4rem;
    }
  }

  /* shared.css locks html/body scroll for the product app shell (only
     inner containers scroll on the phone). The scroll story needs the
     document scroll back; html.light/html.dark outrank that bare rule
     regardless of stylesheet order. The phone iframe keeps the lock
     because this component's styles are only injected into the outer
     document, never the iframe's.

     Mandatory y-snapping drives the selection slot: sub cards and the
     tip card are the only snap-aligned items, so scrolling always
     settles with one of them at the slot line (scroll-padding-top,
     maintained by the scroll engine). */
  :global(html.light),
  :global(html.dark) {
    overflow: auto;
    overscroll-behavior: auto;
    scroll-snap-type: y mandatory;
  }

  :global(html.light body),
  :global(html.dark body) {
    overflow: visible;
    overscroll-behavior: auto;
  }

  /* Ensure body background matches */
  :global(body) {
    background: #f5f5f7;
    margin: 0;
  }

  :global(html.dark body) {
    background: #161618;
  }
</style>
