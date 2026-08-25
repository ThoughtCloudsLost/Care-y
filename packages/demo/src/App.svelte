<script lang="ts">
  import { tick, untrack } from "svelte";
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
  import { ArrowRight, X } from "@lucide/svelte";
  import { RoleId, type RoleIdValue } from "@care-y/shared";
  import TopBar from "$demo/TopBar.svelte";
  import FrameToolbar from "$demo/FrameToolbar.svelte";
  import FlowBand from "$demo/FlowBand.svelte";
  import FlowStory from "$demo/FlowStory.svelte";
  import SectionStrip from "$demo/SectionStrip.svelte";
  import SectionRail from "$demo/SectionRail.svelte";
  import DemoFrame from "$demo/DemoFrame.svelte";
  import PeekStill from "$demo/PeekStill.svelte";
  import { isRecordMode } from "$demo/record-mode.js";
  import { entryAutoDismisses } from "$demo/entry-visibility.js";
  import { captureStill, type CapturedStill } from "$demo/peek-still.js";
  import {
    createPeekController,
    COMMIT_DRAG_PX,
  } from "$demo/peek-controller.svelte.js";
  import type { PeekFirePayload } from "$demo/clip-registry.js";
  import {
    createScrollEngine,
    createTopicProgress,
  } from "$demo/scroll-engine.svelte.js";
  import {
    SECTIONS,
    ENTRY_SECTION,
    parseHash,
    type SectionId,
    type Section,
  } from "$demo/scroll-sections.js";
  import { resolveStoryMessage } from "$demo/story-messages.js";
  import type { DemoBridge, DemoBridgeState, DemoTopic } from "$demo/bridge.js";
  import { DEMO_TOPICS } from "$demo/bridge.js";
  import {
    createFrameGeometry,
    BEZEL,
    PHONE_PRESET,
    DESKTOP_PRESET,
    computeFitBand,
    fitPreset,
    DESKTOP_SLOT_INSET,
    RAIL_WIDTH,
    RAIL_GAP,
    WRAPPER_PAD_LEFT,
    WRAPPER_PAD_RIGHT,
    WIDE_BREAKPOINT,
  } from "$demo/frame-geometry.svelte.js";
  import {
    TOP_BAR_HEIGHT,
    setTopChromeHeight,
    topChromeHeight,
    stickyTopOffset,
  } from "$demo/flow-geometry.svelte.js";
  import {
    isLinked,
    toggleLinked,
    resetLinked,
  } from "$demo/link-state.svelte.js";
  import { createFlowBandStore } from "$demo/flow-band.svelte.js";
  import { createDemoMode } from "$demo/demo-mode.svelte.js";
  import {
    initColumnSlot,
    moveColumnToSlot,
    columnRect,
    columnContainerLeft,
    columnContainerWidth,
  } from "$demo/flow-column.svelte.js";

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
  // Data flow band + top chrome height
  //
  // The band is closed on every load, with no persistence. It lives in
  // the top chrome and pushes the story down when open, so its height is
  // measured (an expanded card's detail strip has no fixed height) and
  // published to flow-geometry. Everything that parks below the chrome
  // or computes a frame position reads that one number.
  // -----------------------------------------------------------------------

  const flowBand = createFlowBandStore();

  function handleToggleFlowBand(): void {
    flowBand.toggleOpen();
  }

  // Chrome height is the bar plus whatever docks under it. The band and
  // the sub strip never coexist (the band contributes nothing at narrow
  // widths, and the strip only exists there), but summing them keeps the
  // rule true either way rather than relying on that.
  let bandFlowHeight = $state(0);
  let stripHeight = $state(0);

  $effect(() => {
    setTopChromeHeight(TOP_BAR_HEIGHT + bandFlowHeight + stripHeight);
  });

  // bind:offsetHeight leaves its last value behind when the element is
  // removed, which would keep reserving chrome for a strip that is no
  // longer there once the rail takes over.
  $effect(() => {
    if (entryVisible || showRail) stripHeight = 0;
  });

  function handleBandFlowHeight(px: number): void {
    bandFlowHeight = px;
  }

  // -----------------------------------------------------------------------
  // Frame geometry (floating window state)
  // -----------------------------------------------------------------------

  const geo = createFrameGeometry(() => topChromeHeight());

  // -----------------------------------------------------------------------
  // Peek controller
  // -----------------------------------------------------------------------

  const peekCtrl = createPeekController(geo, () => topChromeHeight());

  /** Still captured from the clip's current frame at peek fire time. */
  let capturedStill: CapturedStill | null = $state(null);

  /** True once the phone engine reports ready via the bridge. */
  let engineReady = $state(false);

  /** Active role from the bridge snapshot; admin at boot/restart. */
  let activeRole: RoleIdValue = $state(RoleId.ADMIN);

  /** Whether the peek is in a non-idle phase (active for UI gating). */
  const peekActive: boolean = $derived(peekCtrl.phase !== "idle");

  // Tear down listeners when the component unmounts
  $effect(() => {
    return () => {
      scrollEngine.destroy();
      unsubscribe?.();
      unsubscribeFlow?.();
    };
  });

  // Clamp position on window resize so the frame stays reachable
  $effect(() => {
    function onResize(): void {
      geo.clampToViewport();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  // -----------------------------------------------------------------------
  // Floating toolbar dimensions (single source for layout and flow-hole)
  //
  // The toolbar is a rounded bar floating above the frame, detached by a
  // gap. It spans the frame's full width and resizes with it. Height:
  // 2px border x2 + 4px padding x2 + 44px tallest button = 56px.
  // No left-arm reservation: the bar is horizontally flush with the frame.
  // -----------------------------------------------------------------------

  /** Toolbar height: 2px border x2 + 4px padding x2 + 44px button row. */
  const TOOLBAR_H = 56;
  /** Gap between the toolbar's bottom edge and the frame's top edge. */
  const TOOLBAR_GAP = 8;

  // -----------------------------------------------------------------------
  // Frame rects: bare (for peek controller) and chrome-inclusive (for flow)
  // -----------------------------------------------------------------------

  /** Bare frame box in viewport coordinates (peek, resize). */
  const frameRect = $derived({
    left: geo.left,
    top: geo.top,
    outerW: geo.outerW,
    outerH: geo.outerH,
  });

  /** Frame box expanded upward to cover the floating toolbar so the
   *  flow hole clears the bar + gap above the frame. No horizontal
   *  expansion: the toolbar spans the frame width, not beyond it.
   *  In non-explore mode (read) or when chrome is hidden, falls back to
   *  the bare rect. */
  const chromeFrameRect = $derived.by(() => {
    if (!showDesktopChrome) return frameRect;
    const aboveH = TOOLBAR_H + TOOLBAR_GAP;
    return {
      left: geo.left,
      top: geo.top - aboveH,
      outerW: geo.outerW,
      outerH: geo.outerH + aboveH,
    };
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
    // Accept pointerdown with the primary button (button 0) AND
    // pointermove events (button -1): the toolbar promotes a held
    // button press into a drag mid-move, so the gesture can begin on
    // a move event. Only secondary/middle presses are rejected.
    if (e.button > 0) return;
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

  // rAF handle for coalesced gesture writes. Stored so pointerup/cancel
  // can cancel the pending frame and apply the final position once.
  let gestureRaf = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;

  function applyGestureFrame(): void {
    gestureRaf = 0;
    if (gesture === null) return;
    const dx = lastPointerX - gesture.startX;
    const dy = lastPointerY - gesture.startY;

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

  function onPointerMove(e: PointerEvent): void {
    if (gesture?.pointerId !== e.pointerId) return;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    if (gestureRaf === 0) {
      gestureRaf = requestAnimationFrame(applyGestureFrame);
    }
  }

  function onPointerUp(e: PointerEvent): void {
    if (gesture?.pointerId !== e.pointerId) return;
    // Cancel any pending rAF and apply the final position synchronously
    if (gestureRaf !== 0) {
      cancelAnimationFrame(gestureRaf);
      gestureRaf = 0;
    }
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    applyGestureFrame();
    // Settle the shrink state now that the footprint is final. Evaluated
    // on release rather than during the move: a drag sweeps back and
    // forth across the threshold, and reacting live would flip the
    // shrunk flag every frame and rewrite the grow memory with it.
    if (gesture.mode === "resize") {
      geo.settleShrinkAfterResize();
    }
    // Hand-placed or hand-sized geometry is the new scaling basis for
    // band-proportional rescale.
    geo.reanchorBand();
    gesture = null;
    gestureActive = false;
  }

  // -----------------------------------------------------------------------
  // Preset animation
  // -----------------------------------------------------------------------

  const fpW = new Spring(geo.footprintW, { stiffness: 0.12, damping: 0.6 });
  const fpH = new Spring(geo.footprintH, { stiffness: 0.12, damping: 0.6 });
  let animating = $state(false);

  // Toolbar-hold anchor, set for the duration of every button-driven
  // resize (presets, shrink, grow). The invariant: the clicked button
  // must not move out from under the pointer. The bar spans the frame
  // width, so the frame's top edge is always held; the horizontal
  // reference depends on which zone the clicked button lives in:
  //
  //   "centre": preset buttons sit at the bar's horizontal midpoint,
  //             so the frame's centre X is held and the footprint
  //             grows symmetrically around it.
  //   "left":   shrink/grow sit in the bar's left zone, flush with
  //             the frame's left edge, so the left edge is held and
  //             the footprint grows rightward.
  //
  // A taller or wider target may extend past the viewport edges as a
  // result; that is the accepted tradeoff (the frame stays draggable,
  // and the settle-time clampToViewport still prevents a mostly-
  // offscreen frame).
  interface ToolbarHold {
    mode: "centre" | "left";
    /** Frame centre X ("centre") or frame left edge ("left"). */
    x: number;
    top: number;
  }

  let toolbarHold: ToolbarHold | null = null;

  /** Where the frame should sit for a given in-flight outer width. */
  function positionFor(
    outerW: number,
    fallbackTop: number,
    fallbackLeft: number,
  ): { top: number; left: number } {
    if (toolbarHold === null) {
      return { top: fallbackTop, left: fallbackLeft };
    }
    // No clamping while the spring runs: any clamp would translate
    // the frame and pull the clicked button away from the pointer,
    // which is the one thing this anchor exists to prevent.
    return {
      top: toolbarHold.top,
      left:
        toolbarHold.mode === "centre"
          ? toolbarHold.x - outerW / 2
          : toolbarHold.x,
    };
  }

  function animateToPreset(
    targetW: number,
    targetH: number,
    hold: ToolbarHold["mode"],
  ): void {
    // Capture the anchor before setFootprint moves the box.
    toolbarHold = {
      mode: hold,
      x: hold === "centre" ? geo.left + geo.outerW / 2 : geo.left,
      top: geo.top,
    };

    if (prefersReducedMotion.current) {
      geo.setFootprint(targetW, targetH);
      const pos = positionFor(targetW + BEZEL * 2, geo.top, geo.left);
      geo.setPosition(pos.top, pos.left);
      geo.clampToViewport();
      toolbarHold = null;
      geo.reanchorBand();
      return;
    }

    animating = true;

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

    // Hold the toolbar anchor as the footprint changes.
    const live = positionFor(w + BEZEL * 2, geo.top, geo.left);
    geo.setPosition(live.top, live.left);

    const wDone = Math.abs(w - fpW.target) < 0.5;
    const hDone = Math.abs(h - fpH.target) < 0.5;
    if (wDone && hDone) {
      animating = false;
      // Snap to exact target
      geo.setFootprint(fpW.target, fpH.target);
      const final = positionFor(fpW.target + BEZEL * 2, geo.top, geo.left);
      geo.setPosition(final.top, final.left);
      toolbarHold = null;
      geo.clampToViewport();
      // The settled preset is the new scaling basis. A band change
      // that happened mid-animation is dropped, not deferred: the user
      // chose these dims under the band they can see.
      geo.reanchorBand();
    }
  });

  function applyPreset(w: number, h: number): void {
    if (geo.shrunk) {
      // Stay shrunk: adopt the preset's ratio at shrunken scale and
      // point the grow memory at the preset's full footprint.
      const target = geo.retargetShrunkTo(w, h);
      animateToPreset(target.w, target.h, "centre");
      return;
    }
    animateToPreset(w, h, "centre");
  }

  function handlePhonePreset(): void {
    applyPreset(fittedPhone.w, fittedPhone.h);
  }

  function handleDesktopPreset(): void {
    applyPreset(fittedDesktop.w, fittedDesktop.h);
  }

  function handleShrinkGrow(): void {
    if (geo.shrunk) {
      const target = geo.grow();
      if (target !== null) {
        animateToPreset(target.w, target.h, "left");
      }
      return;
    }
    const target = geo.shrink();
    animateToPreset(target.w, target.h, "left");
  }

  // -----------------------------------------------------------------------
  // Peek event handlers
  // -----------------------------------------------------------------------

  function handlePeekFire(payload: PeekFirePayload): void {
    const still = captureStill(payload.video);
    capturedStill = still;
    peekCtrl.open(payload.rect);

    // Keyboard fires bypass the long-press primitive (ClipFigure's
    // handleKeydown calls onpeekfire directly), so no pointer is
    // captured and no release will arrive. Commit synchronously so
    // keyboard users land in full-screen state.
    if (payload.viaKeyboard === true) {
      peekCtrl.commit();
    }
  }

  function handlePeekDrag(_dx: number, dy: number): void {
    // dy < 0 = upward screen motion; commit when the drag exceeds threshold
    if (dy < -COMMIT_DRAG_PX) {
      peekCtrl.commit();
    }
  }

  function handlePeekSecondaryTap(): void {
    peekCtrl.commit();
  }

  function handlePeekRelease(): void {
    if (peekCtrl.phase !== "committed") {
      peekCtrl.collapse();
    }
  }

  function handlePeekCancel(): void {
    // Nothing to do: the gesture was cancelled before fire
  }

  /** Close-and-continue: collapse from committed back to idle. */
  function handlePeekClose(): void {
    peekCtrl.collapse();
    // The still fades on its own via onfaded; clearing here makes the
    // still disappear together with the frame collapse.
    capturedStill = null;
  }

  function handleStillFaded(): void {
    capturedStill = null;
  }

  // -----------------------------------------------------------------------
  // Bridge + phone state
  // -----------------------------------------------------------------------

  let bridge: DemoBridge | undefined = $state();
  let unsubscribe: (() => void) | undefined;
  let unsubscribeFlow: (() => void) | undefined;
  let frameRef: DemoFrame | undefined = $state();

  // Topic progress tracking with SvelteSet for reactivity
  const seenTopics = new SvelteSet<DemoTopic>();
  const progress = createTopicProgress(seenTopics, DEMO_TOPICS.length);

  // Entry page: visible until the visitor dismisses it (next pill,
  // section click, phone interaction, or deep link). A deep link
  // skips it entirely. The home button can re-show it.
  let entryVisible = $state(parseHash(window.location.hash) === null);

  // Bookkeeping for the entry auto-dismiss guard. Plain vars (not
  // $state) because they are the effect's own internal state and
  // must not cause re-runs.
  let lastLocationSeq = 0;
  let entryShownAtSeq = 0;

  // Scroll engine (renders the shared location, sends page intents)
  // Link gate: the user's link choice, minus an in-flight drag/resize
  // gesture. Suspending during gestures keeps dragging from driving
  // either side; the choice itself is untouched, so lifting the pointer
  // restores it. The bare choice is passed separately: while the user
  // has explicitly unlinked, the engine navigates the story locally,
  // and it must not mistake a transient gesture for that state.
  const scrollEngine = createScrollEngine(
    () => bridge,
    () => isLinked() && !gestureActive && !peekActive,
    () => !entryVisible,
    () => isLinked(),
  );

  // Chrome height at the last settled layout. Plain, not $state: it is
  // the effect's own bookkeeping and must not make it re-run.
  let lastChromeHeight = TOP_BAR_HEIGHT;

  $effect(() => {
    const next = topChromeHeight();
    if (next === lastChromeHeight) return;
    lastChromeHeight = next;
    // Opening or closing the band moves every block on the page at once.
    // The reading line moves with it, since the sticky intro parks under
    // the chrome, so the selection holds once the reflow settles; muting
    // covers the frames where it is only half applied.
    scrollEngine.suppressLayoutShift();
  });

  // Rescale the frame when the vertical band changes (chrome height or
  // window height), so the frame keeps its size ratio to the story's
  // available space. Suspended while the user or an animation owns the
  // geometry; reading the flags reactively is what re-runs the effect
  // when suspension lifts, and the rescale is anchor-relative, so the
  // deferred catch-up lands in one exact step. Peek needs no special
  // handling beyond the gate: on collapse the controller restores the
  // saved pre-peek geometry, peekActive flips false, and this effect
  // maps that restored geometry to the current band once.
  $effect(() => {
    void topChromeHeight();
    void windowH;
    if (gestureActive || animating || peekActive) return;
    // untrack: rescaleForBand reads and writes geo $state; without it
    // the effect would re-run on its own footprint writes.
    untrack(() => geo.rescaleForBand());
  });

  // Track the last-seen restartSeq per bridge instance. A fresh bridge
  // starts at 0; an increment means the phone requested a restart
  // (avatar-panel sign-out via /logout).
  let lastRestartSeq = 0;

  function handleBridgeReady(b: DemoBridge): void {
    unsubscribe?.();
    unsubscribeFlow?.();
    bridge = b;
    lastRestartSeq = 0;
    lastLocationSeq = 0;
    entryShownAtSeq = 0;

    // Reset progress on restart/reload
    progress.reset();
    b.setDark(dark);
    b.setLocale(uiLocale);

    // A fresh bridge means a fresh phone, so the band starts from an
    // empty timeline and fills from this bridge's events only.
    flowBand.reset();
    unsubscribeFlow = b.subscribeFlow((event) => {
      flowBand.ingest(event);
    });

    // Send the deep-link hash as an intent; the subscription below
    // replays the store's state (already moved if a hash was present)
    // and the engine mirrors it.
    scrollEngine.initFromHash();

    unsubscribe = b.subscribe((state: DemoBridgeState) => {
      progress.markFromState(state);

      // Track engine readiness for the peek still crossfade
      engineReady = state.engineReady;

      // Sync the role rail highlight from the bridge snapshot
      activeRole = state.role;

      // The phone moved since entry was shown, so the story follows.
      // Uses the pure guard: entry dismisses only when locationSeq
      // advanced past the snapshot taken when entry was last shown,
      // so bridge echoes at the same seq (re-shown entry) survive.
      if (
        entryAutoDismisses(
          entryVisible,
          state.origin,
          state.locationSeq,
          entryShownAtSeq,
        )
      ) {
        entryVisible = false;
      }
      lastLocationSeq = state.locationSeq;

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
    unsubscribeFlow?.();
    unsubscribeFlow = undefined;
    flowBand.reset();
    bridge = undefined;
    entryShownAtSeq = 0;
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    // Reset peek, still, and engine state
    peekCtrl.resetToIdle();
    capturedStill = null;
    engineReady = false;
    activeRole = RoleId.ADMIN;
    // Reset frame geometry and link state alongside the iframe reload.
    // The column goes back to the side the current mode starts on, so a
    // restart in read mode returns the story to the left rather than
    // leaving it parked where an explore pushed it.
    geo.reset();
    moveColumnToSlot(demoMode.mode === "read" ? "left" : "right");
    resetLinked();
    entryVisible = true;
    frameRef?.reload();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function handleToggleDark(): void {
    dark = !dark;
  }

  function handleToggleMode(): void {
    demoMode.toggle();
  }

  /** Toolbar close button: leave explore mode for the reading view. */
  function handleCloseToRead(): void {
    demoMode.set("read");
  }

  function handleRoleChange(role: RoleIdValue): void {
    bridge?.setRole(role);
  }

  function handleSectionClick(id: SectionId): void {
    if (entryVisible) entryVisible = false;
    scrollEngine.selectSection(id);
  }

  /**
   * Dismiss the entry page idempotently, then select the login section
   * so the story and phone start. Guard on entryVisible so a double
   * tap during the remount cannot fire twice.
   */
  function dismissEntry(): void {
    if (!entryVisible) return;
    entryVisible = false;
    scrollEngine.selectSection("login");
  }

  /**
   * Return to the entry page without touching the phone, bridge, or
   * scroll engine. The simulator keeps its exact state; snapshot the
   * current seq before showing so bridge echoes at the same seq
   * cannot re-dismiss; hash cleared because the entry's canonical
   * form is no hash; the scroll gate (`() => !entryVisible`) closes
   * before any effect can fire a page-scroll intent.
   *
   * CRITICAL: do not call scrollEngine.selectSection or any bridge
   * method here.
   */
  function handleShowEntry(): void {
    if (entryVisible) return;
    entryShownAtSeq = lastLocationSeq;
    entryVisible = true;
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /**
   * The next-section button. While the entry page is visible it reads
   * "next: sign in" and calls dismissEntry; everywhere else it
   * navigates exactly like a section tab, pinning the story to the
   * next section while the phone catches up (from the login section
   * that means the instant fast-forward sign-in behind the splash,
   * not a stage-by-stage play-through that would drag the story back
   * through the login subs).
   */
  function handleNextSection(id: SectionId): void {
    if (entryVisible) {
      dismissEntry();
      return;
    }
    handleSectionClick(id);
  }

  function handleSubClick(sectionId: SectionId, subSlug: string): void {
    // While the entry page is visible, sub clicks are inert: the entry
    // page's slugs are not real login subs and must never reach the
    // location store.
    if (entryVisible) return;
    scrollEngine.selectSub(sectionId, subSlug);
  }

  // -----------------------------------------------------------------------
  // Locale: reactive $state owned here, passed down as prop
  // -----------------------------------------------------------------------

  let uiLocale = $state(getLocale());

  // -----------------------------------------------------------------------
  // Active section definition (one section per page)
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

  // Derive a primitive slug for the coming-soon branch so the derived
  // below does not churn its identity on every sub change within a
  // normal section (which would force a full block rebuild + relayout).
  const comingSoonSlug: string | null = $derived(
    scrollEngine.activeSection === "coming-soon"
      ? scrollEngine.activeSub
      : null,
  );

  const activeSectionDef: Section = $derived.by((): Section => {
    if (entryVisible) return ENTRY_SECTION;
    if (scrollEngine.activeSection === "coming-soon") {
      return comingSoonSection(comingSoonSlug);
    }
    const found = SECTIONS.find((s) => s.id === scrollEngine.activeSection);
    // SECTIONS always contains the active section for narrated ids;
    // fall back to login as a defensive default.
    return found ?? SECTIONS[0] ?? ENTRY_SECTION;
  });

  const pageKey: string = $derived(
    entryVisible ? "entry" : scrollEngine.activeSection,
  );

  // -----------------------------------------------------------------------
  // Sub rail visibility
  //
  // Matched in JS rather than CSS because the rail's presence also
  // decides whether SectionStrip renders. A media query could hide one
  // of them, but both would still be in the DOM and in the tab order.
  // -----------------------------------------------------------------------

  // -----------------------------------------------------------------------
  // Narrow/wide viewport and demo mode
  // -----------------------------------------------------------------------

  let windowW = $state(typeof window !== "undefined" ? window.innerWidth : 0);
  let windowH = $state(typeof window !== "undefined" ? window.innerHeight : 0);

  // Preset sizes track the window the way the spawn does: the nominal
  // footprint scaled down to whatever the current band allows, never up.
  // The band is the frame's own slot, so the desktop preset lands a
  // little inside the column the frame occupies rather than sprawling
  // across the story, and the phone preset returns the frame to exactly
  // its spawn size.
  const presetBand = $derived(
    computeFitBand(windowW, windowH, topChromeHeight(), true),
  );
  const fittedPhone = $derived(
    fitPreset(PHONE_PRESET.w, PHONE_PRESET.h, presetBand),
  );
  const fittedDesktop = $derived(
    fitPreset(DESKTOP_PRESET.w, DESKTOP_PRESET.h, {
      w: presetBand.w - DESKTOP_SLOT_INSET * 2,
      h: presetBand.h,
    }),
  );

  // Viewport x the next-section pill centres on: the middle of the text
  // column rather than of the window, so it sits under the text it
  // continues. Reads the animated column rect, so it rides along with a
  // slot flip. The container's left is already viewport-space, which is
  // what a fixed-position element needs. Falls back to the window centre
  // until the container has reported its box.
  const pillCenterX = $derived.by(() => {
    if (columnContainerWidth() <= 0) return windowW / 2;
    const col = columnRect();
    return columnContainerLeft() + col.x + col.width / 2;
  });

  $effect(() => {
    function onResize(): void {
      windowW = window.innerWidth;
      // A height change moves the story's band and triggers the
      // frame-rescale effect below, which reflows the text around the
      // resized frame; mute the derived selection while that settles
      // (the scroll engine has no resize listener of its own).
      if (window.innerHeight !== windowH) {
        scrollEngine.suppressLayoutShift();
        windowH = window.innerHeight;
      }
    }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  });

  const isNarrow: boolean = $derived(windowW < WIDE_BREAKPOINT);

  // Explicit demo mode: "read" (story-first, frame via peek) or "explore"
  // (frame always visible with sidebar chrome). Default derives from
  // viewport width; ?mode=read/explore overrides. The override survives
  // restart (search string is preserved) and is not clobbered by resizes.
  const demoMode = createDemoMode(() => isNarrow);
  initColumnSlot(demoMode.mode);

  // The phone iframe mounts eagerly in both modes so the PGlite engine
  // boots and background keying starts on page load. The visitor never
  // sees the phone logging in; by the time they leave the entry page,
  // keying has completed and the phone shows the signed-in state.
  // Visibility is controlled separately by frameVisible (CSS hide in
  // read mode until peek opens); see the DemoFrame in the template.

  // In read mode the floating frame is CSS-hidden when the peek
  // controller is idle, and shown during any peek phase.
  const frameVisible: boolean = $derived(
    demoMode.mode === "explore" || peekActive,
  );

  // The desktop chrome (sidebar, resize handles, bezel strips) is shown
  // in explore mode. Read mode uses the close-and-continue button instead.
  const showDesktopChrome: boolean = $derived(demoMode.mode === "explore");

  // Rect the story layout wraps around. Null while the frame is
  // CSS-hidden (read mode, peek idle) so the flow carves no hole and
  // the header/tip dodges relax to full width. During a peek the rect
  // comes back and the text parts around the peeked frame as designed.
  const flowFrameRect = $derived(frameVisible ? chromeFrameRect : null);

  // Mode transition effects: switching modes at runtime resets state
  // that belongs to the old mode.
  let prevMode = demoMode.mode;

  $effect(() => {
    const current = demoMode.mode;
    if (current === prevMode) return;
    const switching = prevMode;
    prevMode = current;

    if (switching === "read" && current === "explore") {
      // Entering explore: cancel any in-flight peek, present the frame.
      // geo.reset() spawns the frame centred in the left slot, so the
      // column takes the right one. This is a move the mode change
      // dictates, not one the frame pressured: the frame appears on top
      // of the column rather than travelling into it, which is exactly
      // the case the flip depth declines to fire on.
      peekCtrl.resetToIdle();
      capturedStill = null;
      geo.reset();
      moveColumnToSlot("right");
    }
    // Entering read from explore: the CSS-hide path handles visibility.
    // The iframe must NOT be unmounted (load-bearing invariant).
  });

  // Every wide page carries the rail. Single-sub pages get one too, so
  // the text column keeps the same left edge from page to page.
  //
  // The entry page's rail is inert: its subs preview what the handbook
  // covers rather than naming real routes, matching the existing rule
  // that entry sub clicks do nothing.
  const showRail: boolean = $derived(windowW >= WIDE_BREAKPOINT);

  // Held in a derived rather than built inline in the markup so the array
  // identity only changes when the page does. FlowStory rebuilds its
  // blocks (and re-measures every string) whenever this reference moves.
  const pageSections: Section[] = $derived([activeSectionDef]);

  // The coming-soon section is synthesized and not in SECTIONS, so the
  // next-section pill is absent for it (null) rather than guessing an
  // order. While the entry page is visible, the pill points at login.
  const nextSectionDef = $derived.by((): Section | null => {
    if (entryVisible) {
      return SECTIONS.find((s) => s.id === "login") ?? null;
    }
    if (scrollEngine.activeSection === "coming-soon") return null;
    const idx = SECTIONS.findIndex((s) => s.id === scrollEngine.activeSection);
    return idx >= 0 ? (SECTIONS.at(idx + 1) ?? null) : null;
  });

  /** Section title lookup keyed by titleKey in the canonical SECTIONS list. */
  function sectionTitle(id: SectionId): string {
    if (id === "coming-soon") {
      return resolveStoryMessage("demo_coming_soon_title", uiLocale);
    }
    const section = SECTIONS.find((s) => s.id === id);
    if (section === undefined) return id;
    return resolveStoryMessage(section.titleKey, uiLocale);
  }

  // Record mode: flat backdrop, no story chrome. The flag is static
  // for the page's lifetime (query param, read once).
  const recordMode = isRecordMode();

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

    // Push locale to the phone iframe (one-way: outer -> phone).
    // Phone-side locale switches do NOT propagate back to the outer page.
    bridge?.setLocale(next);

    // The flow re-renders with new copy; re-measure the reading line
    void tick().then(() => scrollEngine.remeasure());
  }
</script>

{#if !recordMode}
  {#key uiLocale}
    <TopBar
      activeSection={entryVisible ? null : scrollEngine.activeSection}
      {dark}
      locale={uiLocale}
      seen={progress.count}
      total={progress.total}
      flowBandOpen={flowBand.open}
      mode={demoMode.mode}
      {seenTopics}
      onSectionClick={handleSectionClick}
      onToggleDark={handleToggleDark}
      onRestart={handleRestart}
      onLocaleChange={handleLocaleChange}
      onToggleFlowBand={handleToggleFlowBand}
      onToggleMode={handleToggleMode}
      onHomeClick={handleShowEntry}
    />
  {/key}
  <!-- Sub navigation for viewports without the rail. Part of the top
       chrome rather than the story: it docks under the bar and reports
       its height, so everything that parks below the chrome (the story,
       the frame's spawn band) accounts for it. -->
  {#if !entryVisible && !showRail}
    <div
      class="strip-dock"
      style="--wrapper-pad-left: {WRAPPER_PAD_LEFT}px; --wrapper-pad-right: {WRAPPER_PAD_RIGHT}px"
      bind:offsetHeight={stripHeight}
    >
      <SectionStrip
        section={activeSectionDef}
        activeSub={scrollEngine.activeSub}
        locale={uiLocale}
        {seenTopics}
        onSubClick={handleSubClick}
      />
    </div>
  {/if}
  <!-- Data flow band: normal flow directly after the sticky top bar, so
       opening it moves the story down rather than covering it. The
       floating frame (z:50) passes under it. -->
  <FlowBand
    store={flowBand}
    narrow={isNarrow}
    locale={uiLocale}
    onFlowHeight={handleBandFlowHeight}
  />
{/if}

<!-- Floating frame layer: fixed, between story content (z:1) and TopBar (z:100) -->
<div
  class="floating-frame"
  class:floating-frame--hidden={!frameVisible}
  style:top="{geo.top}px"
  style:left="{geo.left}px"
  style:width="{geo.outerW}px"
  style:height="{geo.outerH}px"
>
  <!-- Floating toolbar: rounded bar above the frame, spanning its width.
       Close + shrink/grow + link on the left, presets centered, user
       badge with role dropdown on the right. The bar's background is
       the drag surface (pointer handlers passed through). -->
  {#if showDesktopChrome}
    <!-- phoneActive/desktopActive are exact-dimension compares: a
         band-proportional rescale legitimately deactivates them. -->
    <FrameToolbar
      shrunk={geo.shrunk}
      phoneActive={geo.footprintW === fittedPhone.w &&
        geo.footprintH === fittedPhone.h}
      desktopActive={geo.footprintW === fittedDesktop.w &&
        geo.footprintH === fittedDesktop.h}
      linked={isLinked()}
      {activeRole}
      footprintW={geo.footprintW}
      onPhonePreset={handlePhonePreset}
      onDesktopPreset={handleDesktopPreset}
      onShrinkGrow={handleShrinkGrow}
      onToggleLink={toggleLinked}
      onRoleChange={handleRoleChange}
      onClose={handleCloseToRead}
      ondragstart={startDrag}
      ondragmove={onPointerMove}
      ondragend={onPointerUp}
    />
  {/if}

  <!-- Resize handles: 4 edges + 4 corners -->
  {#if showDesktopChrome}
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
       ring acts as a drag surface without blocking the iframe. These are
       pure pointer-capture surfaces duplicating the toolbar's drag
       surface, so role="presentation" keeps them out of the
       accessibility tree. -->
    <div
      class="bezel-strip bezel-strip-top"
      role="presentation"
      onpointerdown={startDrag}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
    ></div>
    <div
      class="bezel-strip bezel-strip-bottom"
      role="presentation"
      onpointerdown={startDrag}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
    ></div>
    <div
      class="bezel-strip bezel-strip-left"
      role="presentation"
      onpointerdown={startDrag}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
    ></div>
    <div
      class="bezel-strip bezel-strip-right"
      role="presentation"
      onpointerdown={startDrag}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
    ></div>
  {/if}

  <DemoFrame
    {dark}
    {geo}
    onbridgeready={handleBridgeReady}
    gestureActive={gestureActive || peekActive}
    bind:this={frameRef}
  />

  <!-- Peek still: positioned over the screen area (inside the bezel),
       shown while a still exists and the peek is not idle. -->
  {#if capturedStill !== null && peekActive}
    <div
      class="peek-still-layer"
      style="
        top: {BEZEL}px;
        left: {BEZEL}px;
        width: {geo.footprintW}px;
        height: {geo.footprintH}px;
      "
    >
      <PeekStill
        still={capturedStill}
        ready={engineReady}
        onfaded={handleStillFaded}
      />
    </div>
  {/if}

  <!-- Close-and-continue: visible in committed phase, placed at the
       bottom for thumb reach. Labels the destination section name
       rather than a generic "Close". -->
  {#if peekCtrl.phase === "committed"}
    <div class="peek-close-bar">
      <button
        class="peek-close-btn"
        type="button"
        onclick={handlePeekClose}
        aria-label={m.demo_peek_back_to({
          section: sectionTitle(scrollEngine.activeSection),
        })}
      >
        <X size={16} />
        <span
          >{m.demo_peek_back_to({
            section: sectionTitle(scrollEngine.activeSection),
          })}</span
        >
      </button>
    </div>
  {/if}
</div>

{#if !recordMode}
  <!-- --top-chrome-offset is where sticky story chrome parks: below the
       top bar, and below the flow band when it is open. Published as a
       custom property so the sticky rules stay declarative. -->
  <div
    class="scroll-story"
    style="--top-chrome-offset: {stickyTopOffset()}px; --rail-w: {RAIL_WIDTH}px; --rail-gap: {RAIL_GAP}px; --wrapper-pad-left: {WRAPPER_PAD_LEFT}px; --wrapper-pad-right: {WRAPPER_PAD_RIGHT}px"
  >
    <div class="flow-story-wrapper">
      {#key uiLocale}{#key pageKey}
          <div class="section-view" class:section-view--railed={showRail}>
            {#if showRail}
              <SectionRail
                section={activeSectionDef}
                activeSub={entryVisible ? null : scrollEngine.activeSub}
                locale={uiLocale}
                {seenTopics}
                interactive={!entryVisible}
                onSubClick={handleSubClick}
              />
            {/if}
            <div class="section-main">
              <!-- The page title, description and tip are blocks inside
                   FlowStory, so they wrap around the frame through the
                   same layout pass the prose does. Sub navigation lives
                   outside this container entirely: the rail beside it at
                   wide widths, the strip docked under the top bar below
                   them. -->
              <FlowStory
                sections={pageSections}
                locale={uiLocale}
                activeSection={scrollEngine.activeSection}
                activeSub={scrollEngine.activeSub}
                {seenTopics}
                frameRect={flowFrameRect}
                onSelectSection={handleSectionClick}
                onSelectSub={handleSubClick}
                onpeekfire={handlePeekFire}
                onpeekdrag={handlePeekDrag}
                onpeeksecondarytap={handlePeekSecondaryTap}
                onpeekrelease={handlePeekRelease}
                onpeekcancel={handlePeekCancel}
              />
              <div class="story-spacer"></div>
            </div>
          </div>
        {/key}{/key}
    </div>
  </div>

  <!-- Next-section pill: fixed at bottom center, hidden during gestures
     and when there is no next section. -->
  {#if nextSectionDef !== null && !gestureActive && !peekActive}
    <div class="next-pill-container" style="left: {pillCenterX}px">
      <button
        class="next-pill"
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
{/if}

<style>
  /* Docks under the sticky top bar and carries its treatment, so the
     two read as one piece of chrome. 56px is TOP_BAR_HEIGHT; the bar
     sits at z-index 100, so this stays just under it. */
  .strip-dock {
    position: sticky;
    top: 56px;
    z-index: 99;
    padding: 0 var(--wrapper-pad-right) 0 var(--wrapper-pad-left);
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--hair);
  }

  .scroll-story {
    width: 100%;
    margin: 0;
    padding: 0;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    background: var(--paper);
    color: var(--ink);
    min-height: 100vh;
  }

  /* The horizontal padding and the rail track below are published from
     frame-geometry's constants, which the frame's spawn placement also
     reads. Changing either one there moves both together. */
  .flow-story-wrapper {
    padding: 1rem var(--wrapper-pad-right) 0 var(--wrapper-pad-left);
    position: relative;
    z-index: 1;
  }

  /* 900px mirrors WIDE_BREAKPOINT from frame-geometry.svelte.ts */
  @media (min-width: 900px) {
    .flow-story-wrapper {
      padding-top: 1.5rem;
    }
  }

  /* shared.css locks html/body scroll for the product app shell (only
     inner containers scroll on the phone). The scroll story needs the
     document scroll back; html.light/html.dark outrank that bare rule
     regardless of stylesheet order. The phone iframe keeps the lock
     because this component's styles are only injected into the outer
     document, never the iframe's. */
  :global(html.light),
  :global(html.dark) {
    overflow: auto;
    overscroll-behavior: auto;
    /* Chrome's scroll anchoring fights the per-frame layout
       recomputation (viewport-fixed hole, every line moves). No stable
       anchor exists, so disable it on the root. */
    overflow-anchor: none;
  }

  :global(html.light body),
  :global(html.dark body) {
    overflow: visible;
    overscroll-behavior: auto;
  }

  /* Ensure body background matches */
  :global(body) {
    background: var(--paper);
    margin: 0;
  }

  /* -----------------------------------------------------------------------
     Section view entrance + trailing spacer
     ----------------------------------------------------------------------- */

  .story-spacer {
    height: 65vh;
    flex-shrink: 0;
  }

  /* Light entrance when a section page swaps in */
  .section-view {
    animation: section-in 0.2s ease-out;
  }

  /* Rail layout. The text column is a grid track, so FlowStory's
     ResizeObserver simply measures narrower and its frame-dodging
     geometry follows without knowing the rail is there. */
  .section-view--railed {
    display: grid;
    grid-template-columns: minmax(0, var(--rail-w)) minmax(0, 1fr);
    column-gap: var(--rail-gap);
    align-items: start;
  }

  .section-main {
    min-width: 0;
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

  /* -----------------------------------------------------------------------
     Next-section pill (fixed, bottom center)
     ----------------------------------------------------------------------- */

  /* left is set inline to the text column's centre; the translate keeps
     the pill centred on that point rather than starting at it. */
  .next-pill-container {
    position: fixed;
    bottom: 24px;
    transform: translateX(-50%);
    z-index: 40;
    pointer-events: none;
  }

  .next-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--hair);
    border-radius: 999px;
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--demo-accent);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    pointer-events: auto;
    box-shadow: 0 2px 8px var(--glass-shadow);
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;
    white-space: nowrap;
  }

  .next-pill:hover {
    background: color-mix(in srgb, var(--paper) 98%, transparent);
    box-shadow: 0 4px 12px var(--glass-shadow);
  }

  .next-pill:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .next-pill {
      transition: none;
    }
  }

  /* -----------------------------------------------------------------------
     Floating frame layer
     ----------------------------------------------------------------------- */

  .floating-frame {
    position: fixed;
    /* Between story content (z:1) and TopBar (z:100) */
    z-index: 50;
  }

  /* Hidden on narrow while peek is idle. visibility + pointer-events
     rather than display:none so the iframe stays mounted and the
     engine boot is not thrown away. */
  .floating-frame--hidden {
    visibility: hidden;
    pointer-events: none;
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

  /* -----------------------------------------------------------------------
     Peek still layer. Sits inside the bezel, above the iframe, below
     the bezel overlay and toolbar.
     ----------------------------------------------------------------------- */

  .peek-still-layer {
    position: absolute;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
  }

  /* -----------------------------------------------------------------------
     Close-and-continue bar: committed peek chrome, bottom of frame
     ----------------------------------------------------------------------- */

  .peek-close-bar {
    position: absolute;
    bottom: -52px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 6;
    pointer-events: auto;
  }

  .peek-close-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--hair);
    border-radius: 999px;
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--ink);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    box-shadow: 0 2px 8px var(--glass-shadow);
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;
    white-space: nowrap;
  }

  .peek-close-btn:hover {
    background: color-mix(in srgb, var(--paper) 98%, transparent);
    box-shadow: 0 4px 12px var(--glass-shadow);
  }

  .peek-close-btn:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .peek-close-btn {
      transition: none;
    }
  }
</style>
