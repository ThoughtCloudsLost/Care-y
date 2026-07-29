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
  import {
    ArrowRight,
    GripVertical,
    Smartphone,
    Monitor,
  } from "@lucide/svelte";
  import TopBar from "$demo/TopBar.svelte";
  import StorySection from "$demo/StorySection.svelte";
  import DemoFrame from "$demo/DemoFrame.svelte";
  import {
    createScrollEngine,
    createTopicProgress,
  } from "$demo/scroll-engine.svelte.js";
  import {
    SECTIONS,
    type SectionId,
    type Section,
  } from "$demo/scroll-sections.js";
  import type { DemoBridge, DemoBridgeState, DemoTopic } from "$demo/bridge.js";
  import { DEMO_TOPICS } from "$demo/bridge.js";
  import {
    createFrameGeometry,
    PHONE_PRESET,
    DESKTOP_PRESET,
  } from "$demo/frame-geometry.svelte.js";

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
  // Frame geometry (floating window state)
  // -----------------------------------------------------------------------

  const geo = createFrameGeometry();

  // Clamp position on window resize so the frame stays reachable
  $effect(() => {
    function onResize(): void {
      geo.clampToViewport();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  // -----------------------------------------------------------------------
  // Drag + resize gesture state
  // -----------------------------------------------------------------------

  let gestureActive = $state(false);

  interface GestureOrigin {
    pointerId: number;
    startX: number;
    startY: number;
    startTop: number;
    startLeft: number;
    startW: number;
    startH: number;
    mode: "drag" | "resize";
    /** Which edges are being resized (bitmask: 1=top, 2=right, 4=bottom, 8=left) */
    edges: number;
  }

  let gesture: GestureOrigin | null = null;

  function startDrag(e: PointerEvent): void {
    if (e.button !== 0) return;
    if (!(e.currentTarget instanceof HTMLElement)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTop: geo.top,
      startLeft: geo.left,
      startW: geo.footprintW,
      startH: geo.footprintH,
      mode: "drag",
      edges: 0,
    };
    gestureActive = true;
  }

  function startResize(e: PointerEvent, edges: number): void {
    if (e.button !== 0) return;
    if (!(e.currentTarget instanceof HTMLElement)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTop: geo.top,
      startLeft: geo.left,
      startW: geo.footprintW,
      startH: geo.footprintH,
      mode: "resize",
      edges,
    };
    gestureActive = true;
  }

  function onPointerMove(e: PointerEvent): void {
    if (gesture?.pointerId !== e.pointerId) return;
    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    if (gesture.mode === "drag") {
      geo.setPosition(gesture.startTop + dy, gesture.startLeft + dx);
      return;
    }

    // Resize: apply deltas per edge
    let newW = gesture.startW;
    let newH = gesture.startH;
    let newTop = gesture.startTop;
    let newLeft = gesture.startLeft;

    if ((gesture.edges & 2) !== 0) newW = gesture.startW + dx; // right
    if ((gesture.edges & 8) !== 0) {
      newW = gesture.startW - dx;
      newLeft = gesture.startLeft + dx;
    }
    if ((gesture.edges & 4) !== 0) newH = gesture.startH + dy; // bottom
    if ((gesture.edges & 1) !== 0) {
      newH = gesture.startH - dy;
      newTop = gesture.startTop + dy;
    }

    geo.setFootprint(newW, newH);
    geo.setPosition(newTop, newLeft);
  }

  function onPointerUp(e: PointerEvent): void {
    if (gesture?.pointerId !== e.pointerId) return;
    gesture = null;
    gestureActive = false;
  }

  // -----------------------------------------------------------------------
  // Preset animation
  // -----------------------------------------------------------------------

  const fpW = new Spring(geo.footprintW, { stiffness: 0.12, damping: 0.6 });
  const fpH = new Spring(geo.footprintH, { stiffness: 0.12, damping: 0.6 });
  let animating = $state(false);

  // Blur cover fallback (approved but default off; flip the return to enable
  // if live reflow stutters during preset animation)
  function blurCoverEnabled(): boolean {
    return false;
  }
  let showBlurCover = $state(false);

  function animateToPreset(targetW: number, targetH: number): void {
    if (prefersReducedMotion.current) {
      geo.setFootprint(targetW, targetH);
      return;
    }

    animating = true;
    if (blurCoverEnabled()) showBlurCover = true;

    // Sync springs to current values before retargeting
    void fpW.set(geo.footprintW, { instant: true });
    void fpH.set(geo.footprintH, { instant: true });

    void fpW.set(targetW);
    void fpH.set(targetH);
  }

  // Drive the geometry from the springs while animating.
  // When the springs settle (both at target), stop.
  $effect(() => {
    if (!animating) return;
    const w = fpW.current;
    const h = fpH.current;
    geo.setFootprint(w, h);

    const wDone = Math.abs(w - fpW.target) < 0.5;
    const hDone = Math.abs(h - fpH.target) < 0.5;
    if (wDone && hDone) {
      animating = false;
      showBlurCover = false;
      // Snap to exact target
      geo.setFootprint(fpW.target, fpH.target);
    }
  });

  function handlePhonePreset(): void {
    animateToPreset(PHONE_PRESET.w, PHONE_PRESET.h);
  }

  function handleDesktopPreset(): void {
    animateToPreset(DESKTOP_PRESET.w, DESKTOP_PRESET.h);
  }

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
    // Reset frame geometry alongside the iframe reload (decision 6)
    geo.reset();
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

  /**
   * Synthesize a Section object for the coming-soon placeholder. The
   * active subSlug (a route slug) is used as the single sub's slug so
   * element IDs match what the scroll engine expects (sub-coming-soon-<slug>).
   */
  function comingSoonSection(subSlug: string | null): Section {
    const slug = subSlug ?? "unknown";
    return {
      id: "coming-soon",
      titleKey: "demo_coming_soon_title",
      descKey: "demo_coming_soon_desc",
      routes: [],
      subs: [
        {
          slug,
          topic: null,
          headingKey: "demo_coming_soon_heading",
          bodyKey: "demo_coming_soon_body",
        },
      ],
    };
  }

  const activeSectionDef = $derived.by((): Section | undefined => {
    if (scrollEngine.activeSection === "coming-soon") {
      return comingSoonSection(scrollEngine.activeSub);
    }
    return SECTIONS.find((s) => s.id === scrollEngine.activeSection);
  });

  // The coming-soon section is synthesized and not in SECTIONS, so the
  // next-section button is absent for it (null) rather than guessing
  // an order.
  const nextSectionDef = $derived.by((): Section | null => {
    if (scrollEngine.activeSection === "coming-soon") return null;
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
      case "library":
        return m.demo_section_library_title();
      case "admin":
        return m.demo_section_admin_title();
      case "schedule":
        return m.demo_section_schedule_title();
      case "settings":
        return m.demo_section_settings_title();
      case "coming-soon":
        return m.demo_coming_soon_title();
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

<!-- Floating frame layer: fixed, between story content (z:1) and TopBar (z:100) -->
<div
  class="floating-frame"
  style:top="{geo.top}px"
  style:left="{geo.left}px"
  style:width="{geo.outerW}px"
  style:height="{geo.outerH}px"
>
  <!-- Toolbar: attached above the frame, travels with it -->
  <div class="frame-toolbar">
    <div
      class="toolbar-grip"
      onpointerdown={startDrag}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
      aria-hidden="true"
    >
      <GripVertical size={16} />
    </div>
    <button
      class="toolbar-btn"
      class:toolbar-btn-active={geo.footprintW === PHONE_PRESET.w &&
        geo.footprintH === PHONE_PRESET.h}
      type="button"
      onclick={handlePhonePreset}
      aria-label={m.demo_toolbar_phone_preset()}
      title={m.demo_toolbar_phone_tooltip()}
    >
      <Smartphone size={16} />
    </button>
    <button
      class="toolbar-btn"
      class:toolbar-btn-active={geo.footprintW === DESKTOP_PRESET.w &&
        geo.footprintH === DESKTOP_PRESET.h}
      type="button"
      onclick={handleDesktopPreset}
      aria-label={m.demo_toolbar_desktop_preset()}
      title={m.demo_toolbar_desktop_tooltip()}
    >
      <Monitor size={16} />
    </button>
  </div>

  <!-- Resize handles: 4 edges + 4 corners -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-n"
    onpointerdown={(e) => startResize(e, 1)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-e"
    onpointerdown={(e) => startResize(e, 2)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-s"
    onpointerdown={(e) => startResize(e, 4)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-w"
    onpointerdown={(e) => startResize(e, 8)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-ne"
    onpointerdown={(e) => startResize(e, 3)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-se"
    onpointerdown={(e) => startResize(e, 6)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-sw"
    onpointerdown={(e) => startResize(e, 12)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="resize-handle resize-nw"
    onpointerdown={(e) => startResize(e, 9)}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>

  <!-- Bezel drag strips: four edges around the screen so the 12px bezel
       ring acts as a drag surface without blocking the iframe. -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="bezel-strip bezel-strip-top"
    onpointerdown={startDrag}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="bezel-strip bezel-strip-bottom"
    onpointerdown={startDrag}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="bezel-strip bezel-strip-left"
    onpointerdown={startDrag}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="bezel-strip bezel-strip-right"
    onpointerdown={startDrag}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>

  <DemoFrame
    {dark}
    {geo}
    onbridgeready={handleBridgeReady}
    {gestureActive}
    bind:this={frameRef}
  />

  <!-- Blur cover for preset animation (behind flag, default off) -->
  {#if showBlurCover}
    <div class="blur-cover" aria-hidden="true"></div>
  {/if}
</div>

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

  /* At >= 900px, add a static right gutter so the story column keeps
     its current width and the floating frame spawns in familiar
     territory. The gutter occupies the space the phone column used to. */
  @media (min-width: 900px) {
    .story-layout {
      padding-top: 1.5rem;
      padding-right: 440px;
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

  /* -----------------------------------------------------------------------
     Floating frame layer
     ----------------------------------------------------------------------- */

  .floating-frame {
    position: fixed;
    /* Between story content (z:1) and TopBar (z:100) */
    z-index: 50;
  }

  /* Toolbar: slim bar docked above the frame */
  .frame-toolbar {
    position: absolute;
    bottom: 100%;
    left: 0;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    background: rgba(245, 245, 247, 0.92);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 8px 8px 0 0;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-bottom: none;
  }

  :global(html.dark) .frame-toolbar {
    background: rgba(44, 44, 46, 0.92);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .toolbar-grip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    cursor: grab;
    color: #86868b;
    border-radius: 6px;
    touch-action: none;
  }

  .toolbar-grip:active {
    cursor: grabbing;
  }

  :global(html.dark) .toolbar-grip {
    color: #98989d;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    min-height: 44px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #636366;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .toolbar-btn:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  .toolbar-btn-active {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }

  .toolbar-btn-active:hover {
    background: rgba(0, 122, 255, 0.16);
  }

  :global(html.dark) .toolbar-btn {
    color: #98989d;
  }

  :global(html.dark) .toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  :global(html.dark) .toolbar-btn-active {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  :global(html.dark) .toolbar-btn-active:hover {
    background: rgba(0, 122, 255, 0.25);
  }

  /* Bezel drag strips: four edges that cover only the 12px bezel ring,
     leaving the screen area free for iframe interaction. */
  .bezel-strip {
    position: absolute;
    z-index: 3;
    cursor: grab;
    touch-action: none;
  }

  .bezel-strip:active {
    cursor: grabbing;
  }

  .bezel-strip-top {
    top: 0;
    left: 0;
    right: 0;
    height: 12px;
  }

  .bezel-strip-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: 12px;
  }

  .bezel-strip-left {
    top: 12px;
    left: 0;
    bottom: 12px;
    width: 12px;
  }

  .bezel-strip-right {
    top: 12px;
    right: 0;
    bottom: 12px;
    width: 12px;
  }

  /* Resize handles: invisible hit areas on edges and corners */
  .resize-handle {
    position: absolute;
    z-index: 4;
    touch-action: none;
  }

  .resize-n {
    top: -4px;
    left: 8px;
    right: 8px;
    height: 8px;
    cursor: n-resize;
  }

  .resize-s {
    bottom: -4px;
    left: 8px;
    right: 8px;
    height: 8px;
    cursor: s-resize;
  }

  .resize-e {
    top: 8px;
    right: -4px;
    bottom: 8px;
    width: 8px;
    cursor: e-resize;
  }

  .resize-w {
    top: 8px;
    left: -4px;
    bottom: 8px;
    width: 8px;
    cursor: w-resize;
  }

  .resize-ne {
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    cursor: ne-resize;
  }

  .resize-se {
    bottom: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    cursor: se-resize;
  }

  .resize-sw {
    bottom: -4px;
    left: -4px;
    width: 12px;
    height: 12px;
    cursor: sw-resize;
  }

  .resize-nw {
    top: -4px;
    left: -4px;
    width: 12px;
    height: 12px;
    cursor: nw-resize;
  }

  /* Blur cover (fallback for preset animations, default off) */
  .blur-cover {
    position: absolute;
    inset: 0;
    z-index: 5;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(0, 0, 0, 0.05);
    border-radius: inherit;
    pointer-events: none;
    animation: blur-fade-in 0.15s ease-out;
  }

  @keyframes blur-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
