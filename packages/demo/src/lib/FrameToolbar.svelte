<script lang="ts">
  /**
   * iOS-Simulator-style floating toolbar above the demo frame.
   *
   * Renders as a single rounded bar spanning the frame's width, positioned
   * absolutely above .floating-frame via `bottom: calc(100% + GAP)`. Three
   * layout zones:
   *
   *   Left:   close (to read mode), minimize/restore, fullscreen
   *   Center: phone + desktop preset buttons (absolutely centered)
   *   Right:  user badge with a role-switch dropdown menu
   *
   * The bar background is the drag surface (same pattern as
   * .bezel-strip: `role="presentation"` + pointer handlers). There is
   * no dedicated grip; the grab cursor on the bar is the affordance.
   * A press held on a button also promotes into a drag once the
   * pointer moves past a small threshold (see the drag vs click
   * disambiguation block), so grabbing works from anywhere on the bar.
   *
   * Permanently dark (#1a1a1a) and theme-independent, matching the bezel
   * chrome. No Konsta components: the outer-page chrome is hand-rolled
   * so it never inherits the phone theme CSS.
   *
   * Progressive collapse: as the bar narrows, it sheds visual weight
   * in stages while keeping every function accessible:
   *   1. Full (>= 440): two centered preset buttons + badge with label
   *   2. Collapsed presets (340-439): single centered dropdown + label
   *   3. Compact (< 340 or shrunk): picker moves right, label drops
   */

  import { untrack } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import {
    FULLSCREEN_ANIM_MS,
    FULLSCREEN_EASE,
  } from "$demo/fullscreen.svelte.js";
  import * as m from "$lib/paraglide/messages.js";
  import {
    Maximize2,
    Minimize2,
    Expand,
    BookOpen,
    Smartphone,
    Monitor,
    ChevronDown,
    X,
  } from "@lucide/svelte";
  import { RoleId, type RoleIdValue } from "@care-y/shared";

  interface Props {
    /** Whether the frame is in shrunk state. */
    shrunk: boolean;
    /** Whether the phone preset matches the current footprint. */
    phoneActive: boolean;
    /** Whether the desktop preset matches the current footprint. */
    desktopActive: boolean;
    /** The currently active demo role. */
    activeRole: RoleIdValue;
    /** Frame footprint width in CSS px, used for center-zone threshold. */
    footprintW: number;
    /** Callbacks for chrome actions. */
    onPhonePreset: () => void;
    onDesktopPreset: () => void;
    onShrinkGrow: () => void;
    onRoleChange: (role: RoleIdValue) => void;
    /** Close the frame: leaves explore mode for read mode. */
    onClose: () => void;
    /** Enter fullscreen mode from the toolbar button. */
    onFullscreen: () => void;
    /** Pointer handlers wired to App.svelte's drag gesture system. */
    ondragstart: (e: PointerEvent) => void;
    ondragmove: (e: PointerEvent) => void;
    ondragend: (e: PointerEvent) => void;
    // -- Fullscreen-mode props (all optional, only used when fullscreen) --
    /** Whether the toolbar is in fullscreen mode (floating, self-movable). */
    fullscreen?: boolean;
    /** Fixed position for fullscreen mode (null = default placement). */
    pos?: { top: number; left: number } | null;
    /** Whether the handbook drawer is open (fullscreen only). */
    drawerOpen?: boolean;
    /** Window width, drives collapse deriveds in fullscreen. */
    windowW?: number;
    /** Report self-move coordinates in fullscreen drag. */
    onSelfMove?: (top: number, left: number) => void;
    /** Exit fullscreen mode. */
    onExitFullscreen?: () => void;
    /** Toggle the handbook drawer (fullscreen only). */
    onToggleDrawer?: () => void;
  }

  let {
    shrunk,
    phoneActive,
    desktopActive,
    activeRole,
    footprintW,
    onPhonePreset,
    onDesktopPreset,
    onShrinkGrow,
    onRoleChange,
    onClose,
    onFullscreen,
    ondragstart,
    ondragmove,
    ondragend,
    fullscreen = false,
    pos = null,
    drawerOpen = false,
    windowW = 0,
    onSelfMove,
    onExitFullscreen,
    onToggleDrawer,
  }: Props = $props();

  // -----------------------------------------------------------------------
  // Role definitions
  //
  // Same structure as the former RoleRail: localized labels, tooltips,
  // and initials from the shared i18n keys. Admin is first (matches the
  // pinned bridge boot contract).
  // -----------------------------------------------------------------------

  interface RoleOption {
    readonly id: RoleIdValue;
    readonly label: () => string;
    readonly tooltip: () => string;
    readonly initial: () => string;
  }

  const TOOLBAR_ROLES: readonly RoleOption[] = [
    {
      id: RoleId.ADMIN,
      label: () => m.demo_role_admin_label(),
      tooltip: () => m.demo_role_admin_tooltip(),
      initial: () => m.demo_role_admin_initial(),
    },
    {
      id: RoleId.MANAGER,
      label: () => m.demo_role_manager_label(),
      tooltip: () => m.demo_role_manager_tooltip(),
      initial: () => m.demo_role_manager_initial(),
    },
    {
      id: RoleId.VOLUNTEER,
      label: () => m.demo_role_volunteer_label(),
      tooltip: () => m.demo_role_volunteer_tooltip(),
      initial: () => m.demo_role_volunteer_initial(),
    },
  ];

  // -----------------------------------------------------------------------
  // Progressive collapse thresholds
  //
  // Computed from footprintW (the frame width in CSS px, already reactive)
  // rather than a container query, since the value is already available.
  // -----------------------------------------------------------------------

  /** Below this width the centered presets collapse into a single dropdown
   *  and the fullscreen button folds into that dropdown as a menu item.
   *  The fine-tuned original value: the fullscreen button rides along
   *  without shifting when the other controls hide or compress. */
  const PRESETS_COLLAPSE_W = 370;

  /** Below this width the badge label hides and the preset picker moves
   *  right. Original fine-tuned value; the fullscreen button has already
   *  folded into the preset dropdown by this width. */
  const BADGE_COMPACT_W = 340;

  // In fullscreen, collapse thresholds read from windowW instead of footprintW.
  const collapseW: number = $derived(fullscreen ? windowW : footprintW);
  const badgeCompact: boolean = $derived(shrunk || collapseW < BADGE_COMPACT_W);
  const presetsCollapsed: boolean = $derived(
    shrunk || collapseW < PRESETS_COLLAPSE_W,
  );

  // -----------------------------------------------------------------------
  // Drag vs click disambiguation
  //
  // The bar's background starts a drag immediately. A press on a
  // button ARMS a pending drag instead: if the pointer travels past a
  // small threshold while held, the press promotes into a drag (the
  // cursor switches to grabbing and the button's click is suppressed);
  // released in place, it stays an ordinary click. Menu items are
  // excluded, since dragging the frame from inside the dropdown would
  // fight the menu's own interaction.
  // -----------------------------------------------------------------------

  /** Movement (px) past which a held button press becomes a drag. */
  const DRAG_THRESHOLD_PX = 4;

  interface PendingPress {
    pointerId: number;
    startX: number;
    startY: number;
  }

  /** Armed press on a button, not yet promoted into a drag. */
  let pendingPress: PendingPress | null = $state(null);

  /** True while a drag started from this bar is in flight. */
  let dragging = $state(false);

  // One-shot flag: a promoted drag must swallow the click that fires
  // on release, or the held button would also perform its action.
  let suppressClick = false;

  // -- Fullscreen self-move drag state --
  /** Offset from toolbar top-left to pointer at drag start. */
  let selfDragOffX = 0;
  let selfDragOffY = 0;
  /** rAF handle for coalesced self-move writes. */
  let selfMoveRaf = 0;
  let selfPendX = 0;
  let selfPendY = 0;

  let barRef: HTMLDivElement | undefined = $state(undefined);

  /** Element capture as an action rather than bind:this: the script
   *  then contains a visible HTMLDivElement write, so type analysis
   *  knows barRef is not permanently undefined. */
  function captureBar(el: HTMLDivElement): { destroy(): void } {
    barRef = el;
    return {
      destroy(): void {
        barRef = undefined;
      },
    };
  }

  function handleBarPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    suppressClick = false;
    const el = e.target instanceof Element ? e.target : null;
    if (
      el !== null &&
      (el.closest(".role-menu") !== null || el.closest(".preset-menu") !== null)
    )
      return;
    if (el !== null && el.closest("button") !== null) {
      pendingPress = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
      };
      return;
    }
    dragging = true;
    if (fullscreen) {
      selfDragOffX = e.clientX - (pos?.left ?? 0);
      selfDragOffY = e.clientY - (pos?.top ?? 0);
      barRef?.setPointerCapture(e.pointerId);
    } else {
      ondragstart(e);
    }
  }

  function handleBarPointerMove(e: PointerEvent): void {
    if (pendingPress !== null && e.pointerId === pendingPress.pointerId) {
      const dx = e.clientX - pendingPress.startX;
      const dy = e.clientY - pendingPress.startY;
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        const pressStartX = pendingPress.startX;
        const pressStartY = pendingPress.startY;
        pendingPress = null;
        dragging = true;
        suppressClick = true;
        if (fullscreen) {
          selfDragOffX = pressStartX - (pos?.left ?? 0);
          selfDragOffY = pressStartY - (pos?.top ?? 0);
          barRef?.setPointerCapture(e.pointerId);
        } else {
          ondragstart(e);
        }
      }
    }
    if (fullscreen && dragging) {
      selfPendX = e.clientX - selfDragOffX;
      selfPendY = e.clientY - selfDragOffY;
      if (selfMoveRaf === 0) {
        selfMoveRaf = requestAnimationFrame(() => {
          selfMoveRaf = 0;
          onSelfMove?.(selfPendY, selfPendX);
        });
      }
      return;
    }
    ondragmove(e);
  }

  function handleBarPointerEnd(e: PointerEvent): void {
    if (pendingPress?.pointerId === e.pointerId) {
      pendingPress = null;
    }
    if (fullscreen && dragging) {
      dragging = false;
      barRef?.releasePointerCapture(e.pointerId);
      if (selfMoveRaf !== 0) {
        cancelAnimationFrame(selfMoveRaf);
        selfMoveRaf = 0;
        onSelfMove?.(selfPendY, selfPendX);
      }
      return;
    }
    dragging = false;
    ondragend(e);
  }

  /** Capture-phase click filter: eat the click a promoted drag left behind. */
  function handleBarClickCapture(e: MouseEvent): void {
    if (!suppressClick) return;
    suppressClick = false;
    e.preventDefault();
    e.stopPropagation();
  }

  // -----------------------------------------------------------------------
  // Dropdown menu state
  // -----------------------------------------------------------------------

  let menuOpen = $state(false);
  let triggerRef: HTMLButtonElement | undefined = $state(undefined);
  let menuRef: HTMLDivElement | undefined = $state(undefined);

  function toggleMenu(): void {
    menuOpen = !menuOpen;
  }

  function closeMenu(): void {
    menuOpen = false;
  }

  function selectRole(role: RoleIdValue): void {
    onRoleChange(role);
    closeMenu();
  }

  // Close menu on outside click
  $effect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: PointerEvent): void {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (
        triggerRef?.contains(target) === true ||
        menuRef?.contains(target) === true
      ) {
        return;
      }
      closeMenu();
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  });

  // Close menu on Escape, with focus return to trigger
  $effect(() => {
    if (!menuOpen) return;

    function onKeydown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        closeMenu();
        triggerRef?.focus();
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  // -----------------------------------------------------------------------
  // Preset picker dropdown (collapsed state)
  // -----------------------------------------------------------------------

  let presetMenuOpen = $state(false);
  let presetTriggerRef: HTMLButtonElement | undefined = $state(undefined);
  let presetMenuRef: HTMLDivElement | undefined = $state(undefined);

  function togglePresetMenu(): void {
    presetMenuOpen = !presetMenuOpen;
  }

  function closePresetMenu(): void {
    presetMenuOpen = false;
  }

  function selectPreset(preset: "phone" | "desktop"): void {
    if (preset === "phone") onPhonePreset();
    else onDesktopPreset();
    closePresetMenu();
  }

  function selectFullscreen(): void {
    onFullscreen();
    closePresetMenu();
  }

  $effect(() => {
    if (!presetMenuOpen) return;

    function onPointerDown(e: PointerEvent): void {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (
        presetTriggerRef?.contains(target) === true ||
        presetMenuRef?.contains(target) === true
      ) {
        return;
      }
      closePresetMenu();
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  });

  $effect(() => {
    if (!presetMenuOpen) return;

    function onKeydown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        closePresetMenu();
        presetTriggerRef?.focus();
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  function handlePresetMenuKeydown(e: KeyboardEvent): void {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (presetMenuRef === undefined) return;

    const items = Array.from(
      presetMenuRef.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"], [role="menuitem"]',
      ),
    );
    if (items.length === 0) return;

    const current = document.activeElement;
    const idx = items.findIndex((el) => el === current);

    if (e.key === "ArrowDown") {
      const next = idx < items.length - 1 ? idx + 1 : 0;
      items.at(next)?.focus();
    } else {
      const prev = idx > 0 ? idx - 1 : items.length - 1;
      items.at(prev)?.focus();
    }
  }

  // Close preset menu when layout thresholds cross. The menu lives in
  // different DOM containers depending on badgeCompact, and disappears
  // entirely when presets uncollapse.
  $effect(() => {
    void badgeCompact;
    void presetsCollapsed;
    closePresetMenu();
  });

  // -----------------------------------------------------------------------
  // Menu keyboard navigation (ArrowUp/Down between items)
  // -----------------------------------------------------------------------

  function handleMenuKeydown(e: KeyboardEvent): void {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (menuRef === undefined) return;

    const items = Array.from(
      menuRef.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
    );
    if (items.length === 0) return;

    const current = document.activeElement;
    const idx = items.findIndex((el) => el === current);

    if (e.key === "ArrowDown") {
      const next = idx < items.length - 1 ? idx + 1 : 0;
      items.at(next)?.focus();
    } else {
      const prev = idx > 0 ? idx - 1 : items.length - 1;
      items.at(prev)?.focus();
    }
  }

  // Derive active role option for the badge label
  const activeRoleOption: RoleOption | undefined = $derived(
    TOOLBAR_ROLES.find((r) => r.id === activeRole),
  );

  // In fullscreen the role menu opens upward when the bar is in the
  // lower half of the viewport, so it does not clip against the bottom.
  const menuOpensUp: boolean = $derived(
    fullscreen && pos !== null && pos.top > window.innerHeight / 2,
  );

  // -----------------------------------------------------------------------
  // FLIP morph animation: bar <-> pill transition
  //
  // When the fullscreen prop flips, the root element changes positioning
  // (absolute docked vs. fixed floating), border-radius, and content.
  // A FLIP animation smooths the spatial transition:
  //   1. $effect.pre captures the rect BEFORE Svelte updates the DOM
  //   2. $effect runs AFTER the DOM settles, reads the new rect
  //   3. Applies an inverted transform so the element appears at the old
  //      position, then transitions to identity
  // Content differences (presets/shrink/close vs exit/handbook) swap at
  // the flip point with no crossfade. prefers-reduced-motion skips the
  // animation entirely (jump states).
  //
  // Root cause of the original dead morph: the old code used a single
  // $effect (post-DOM) to capture "firstRect" and then tick(). By the
  // time the effect ran, Svelte had already rendered the new layout, so
  // firstRect captured the post-change rect. tick() resolved immediately
  // (DOM was already settled), and lastRect equaled firstRect, producing
  // a zero-delta no-op. Splitting into $effect.pre (pre-DOM capture) and
  // $effect (post-DOM animate) fixes the ordering.
  // -----------------------------------------------------------------------

  let prevFullscreen: boolean | undefined = undefined;
  /** Rect captured before the DOM updates (set by $effect.pre). */
  let flipFirstRect: DOMRect | null = $state(null);
  /** The fullscreen value that triggered the capture. */
  let flipTarget: boolean | null = $state(null);

  // Pre-DOM capture: fires before Svelte applies the template diff.
  $effect.pre(() => {
    const current = fullscreen;
    if (prevFullscreen === undefined) {
      prevFullscreen = current;
      return;
    }
    if (current === prevFullscreen) return;

    const el = barRef;
    if (el !== undefined && !prefersReducedMotion.current) {
      flipFirstRect = el.getBoundingClientRect();
      flipTarget = current;
    }
    prevFullscreen = current;
  });

  // Post-DOM animate: the template has been applied, so barRef is in its
  // new position. Read the "last" rect and apply the inverse transform.
  $effect(() => {
    if (flipFirstRect === null || flipTarget === null) return;
    const firstRect = flipFirstRect;
    const target = flipTarget;
    flipFirstRect = null;
    flipTarget = null;

    if (barRef === undefined) return;
    // Guard: if fullscreen changed again between pre and post, skip
    if (untrack(() => fullscreen) !== target) return;

    const lastRect = barRef.getBoundingClientRect();

    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;
    const sw = firstRect.width / (lastRect.width || 1);
    const sh = firstRect.height / (lastRect.height || 1);

    // Skip morph if there is no meaningful spatial change
    if (
      Math.abs(dx) < 1 &&
      Math.abs(dy) < 1 &&
      Math.abs(sw - 1) < 0.01 &&
      Math.abs(sh - 1) < 0.01
    ) {
      return;
    }

    // Apply inverted transform so it appears at the old position
    barRef.style.transform = `translate(${String(dx)}px, ${String(dy)}px) scale(${String(sw)}, ${String(sh)})`;
    barRef.style.transformOrigin = "top left";

    // Force a layout so the browser sees the inverted state
    void barRef.offsetHeight;

    // Transition to identity. Uses the shared fullscreen timing so the
    // toolbar morph and frame box animation run in sync.
    barRef.style.transition = `transform ${String(FULLSCREEN_ANIM_MS)}ms ${FULLSCREEN_EASE}, border-radius ${String(FULLSCREEN_ANIM_MS)}ms ease`;
    barRef.style.transform = "";

    function onEnd(): void {
      if (barRef === undefined) return;
      barRef.style.transition = "";
      barRef.style.transform = "";
      barRef.style.transformOrigin = "";
      barRef.removeEventListener("transitionend", onEnd);
    }

    barRef.addEventListener("transitionend", onEnd, { once: true });

    // Safety timeout: clear if transitionend never fires
    setTimeout(() => {
      onEnd();
    }, FULLSCREEN_ANIM_MS + 50);
  });
</script>

<!-- The bar container is positioned by the parent (App.svelte) via
     .frame-toolbar's absolute placement. In fullscreen mode it floats
     as a pill-shaped fixed element at pos. The entire background is a
     drag surface so the user can grab anywhere on the bar to move the
     frame (normal) or the bar itself (fullscreen). -->
<div
  class="frame-toolbar"
  class:frame-toolbar--fs={fullscreen}
  class:frame-toolbar--armed={pendingPress !== null}
  class:frame-toolbar--dragging={dragging}
  use:captureBar
  role="presentation"
  style:top={fullscreen && pos !== null ? `${String(pos.top)}px` : undefined}
  style:left={fullscreen && pos !== null ? `${String(pos.left)}px` : undefined}
  onpointerdown={handleBarPointerDown}
  onpointermove={handleBarPointerMove}
  onpointerup={handleBarPointerEnd}
  onpointercancel={handleBarPointerEnd}
  onclickcapture={handleBarClickCapture}
>
  {#if fullscreen}
    <!-- Fullscreen left group: exit + drawer toggle -->
    <div class="toolbar-zone toolbar-zone--left">
      <button
        class="toolbar-btn"
        type="button"
        onclick={onExitFullscreen}
        aria-label={m.demo_fs_exit()}
        title={m.demo_fs_exit()}
      >
        <Minimize2 size={16} />
      </button>

      <span class="pill-divider" aria-hidden="true"></span>

      <button
        class="toolbar-btn"
        class:toolbar-btn-active={drawerOpen}
        type="button"
        onclick={onToggleDrawer}
        aria-label={m.demo_fs_handbook_toggle()}
        aria-pressed={drawerOpen}
        title={m.demo_fs_handbook_toggle()}
      >
        <BookOpen size={16} />
      </button>
    </div>
  {:else}
    <!-- Normal left group: close + minimize/restore + fullscreen. -->
    <div class="toolbar-zone toolbar-zone--left">
      <button
        class="toolbar-btn"
        type="button"
        onclick={onClose}
        aria-label={m.demo_toolbar_close_tooltip()}
        title={m.demo_toolbar_close_tooltip()}
      >
        <X size={16} />
      </button>

      <button
        class="toolbar-btn"
        class:toolbar-btn-active={shrunk}
        type="button"
        onclick={onShrinkGrow}
        aria-label={shrunk
          ? m.demo_toolbar_grow_tooltip()
          : m.demo_toolbar_shrink_tooltip()}
        aria-pressed={shrunk}
        title={shrunk
          ? m.demo_toolbar_grow_tooltip()
          : m.demo_toolbar_shrink_tooltip()}
      >
        {#if shrunk}
          <Maximize2 size={16} />
        {:else}
          <Minimize2 size={16} />
        {/if}
      </button>

      <button
        class="toolbar-btn"
        class:toolbar-btn--folded={presetsCollapsed}
        type="button"
        onclick={onFullscreen}
        aria-label={m.demo_toolbar_fullscreen_tooltip()}
        title={m.demo_toolbar_fullscreen_tooltip()}
        aria-hidden={presetsCollapsed}
        tabindex={presetsCollapsed ? -1 : 0}
      >
        <Expand size={16} />
      </button>
    </div>
  {/if}

  <!-- Center group: hidden in fullscreen. Three visual states, all
       CSS-animated.
       1. Full (>= PRESETS_COLLAPSE_W): two separate preset buttons
       2. Collapsed (BADGE_COMPACT_W..PRESETS_COLLAPSE_W): single dropdown,
          still centered; the fullscreen button folds in as a menu item
       3. Hidden (< BADGE_COMPACT_W / shrunk): faded out, picker moves to
          right zone -->
  {#if !fullscreen}
    <div
      class="toolbar-zone toolbar-zone--center"
      class:toolbar-zone--hidden={badgeCompact}
      aria-hidden={badgeCompact}
    >
      <!-- Two separate buttons: visible when not collapsed -->
      <div
        class="center-full"
        class:center-full--hidden={presetsCollapsed}
        aria-hidden={presetsCollapsed}
      >
        <button
          class="toolbar-btn"
          class:toolbar-btn-active={phoneActive}
          type="button"
          onclick={onPhonePreset}
          aria-label={m.demo_toolbar_phone_preset()}
          title={m.demo_toolbar_phone_tooltip()}
          tabindex={presetsCollapsed ? -1 : 0}
        >
          <Smartphone size={16} />
        </button>
        <button
          class="toolbar-btn"
          class:toolbar-btn-active={desktopActive}
          type="button"
          onclick={onDesktopPreset}
          aria-label={m.demo_toolbar_desktop_preset()}
          title={m.demo_toolbar_desktop_tooltip()}
          tabindex={presetsCollapsed ? -1 : 0}
        >
          <Monitor size={16} />
        </button>
      </div>

      <!-- Single dropdown button: visible when collapsed but not compact -->
      <div
        class="center-collapsed"
        class:center-collapsed--visible={presetsCollapsed && !badgeCompact}
      >
        <button
          class="toolbar-btn"
          class:toolbar-btn-active={presetMenuOpen}
          type="button"
          bind:this={presetTriggerRef}
          onclick={togglePresetMenu}
          aria-haspopup="menu"
          aria-expanded={presetMenuOpen}
          aria-label={m.demo_toolbar_phone_preset()}
          title={desktopActive
            ? m.demo_toolbar_desktop_tooltip()
            : m.demo_toolbar_phone_tooltip()}
          tabindex={presetsCollapsed && !badgeCompact ? 0 : -1}
        >
          {#if desktopActive}
            <Monitor size={16} />
          {:else}
            <Smartphone size={16} />
          {/if}
        </button>

        {#if presetMenuOpen && !badgeCompact}
          <div
            class="preset-menu"
            role="menu"
            tabindex="-1"
            aria-label={m.demo_toolbar_phone_preset()}
            bind:this={presetMenuRef}
            onkeydown={handlePresetMenuKeydown}
          >
            <button
              class="preset-menu-item"
              role="menuitemradio"
              aria-checked={phoneActive}
              type="button"
              onclick={() => selectPreset("phone")}
            >
              <Smartphone size={16} />
              <span>{m.demo_toolbar_phone_preset()}</span>
            </button>
            <button
              class="preset-menu-item"
              role="menuitemradio"
              aria-checked={desktopActive}
              type="button"
              onclick={() => selectPreset("desktop")}
            >
              <Monitor size={16} />
              <span>{m.demo_toolbar_desktop_preset()}</span>
            </button>
            <button
              class="preset-menu-item preset-menu-item--ruled"
              role="menuitem"
              type="button"
              onclick={selectFullscreen}
            >
              <Expand size={16} />
              <span>{m.demo_toolbar_fullscreen_tooltip()}</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Right group: role badge (always) + preset picker (only at compact,
       hidden in fullscreen). -->
  <div class="toolbar-zone toolbar-zone--right">
    {#if !fullscreen}
      <div class="preset-picker" class:preset-picker--visible={badgeCompact}>
        <button
          class="toolbar-btn"
          class:toolbar-btn-active={presetMenuOpen}
          type="button"
          onclick={togglePresetMenu}
          aria-haspopup="menu"
          aria-expanded={presetMenuOpen}
          aria-label={m.demo_toolbar_phone_preset()}
          title={desktopActive
            ? m.demo_toolbar_desktop_tooltip()
            : m.demo_toolbar_phone_tooltip()}
          tabindex={badgeCompact ? 0 : -1}
        >
          {#if desktopActive}
            <Monitor size={16} />
          {:else}
            <Smartphone size={16} />
          {/if}
        </button>

        {#if presetMenuOpen && badgeCompact}
          <div
            class="preset-menu"
            role="menu"
            tabindex="-1"
            aria-label={m.demo_toolbar_phone_preset()}
            bind:this={presetMenuRef}
            onkeydown={handlePresetMenuKeydown}
          >
            <button
              class="preset-menu-item"
              role="menuitemradio"
              aria-checked={phoneActive}
              type="button"
              onclick={() => selectPreset("phone")}
            >
              <Smartphone size={16} />
              <span>{m.demo_toolbar_phone_preset()}</span>
            </button>
            <button
              class="preset-menu-item"
              role="menuitemradio"
              aria-checked={desktopActive}
              type="button"
              onclick={() => selectPreset("desktop")}
            >
              <Monitor size={16} />
              <span>{m.demo_toolbar_desktop_preset()}</span>
            </button>
            <button
              class="preset-menu-item preset-menu-item--ruled"
              role="menuitem"
              type="button"
              onclick={selectFullscreen}
            >
              <Expand size={16} />
              <span>{m.demo_toolbar_fullscreen_tooltip()}</span>
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <span
      class="pill-divider"
      class:pill-divider--hidden={!fullscreen}
      aria-hidden="true"
    ></span>

    <button
      class="badge-trigger"
      class:badge-trigger--compact={badgeCompact}
      type="button"
      bind:this={triggerRef}
      onclick={toggleMenu}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      aria-label={m.demo_role_rail_label()}
    >
      <span class="identity-seal badge-seal badge-seal--active">
        {activeRoleOption?.initial() ?? "?"}
      </span>
      <span class="badge-label" class:badge-label--hidden={badgeCompact}>
        {activeRoleOption?.label() ?? ""}
      </span>
      <span class="badge-chevron" class:badge-chevron--hidden={badgeCompact}>
        <ChevronDown size={14} />
      </span>
    </button>

    {#if menuOpen}
      <div
        class="role-menu"
        class:role-menu--up={menuOpensUp}
        role="menu"
        tabindex="-1"
        aria-label={m.demo_role_rail_label()}
        bind:this={menuRef}
        onkeydown={handleMenuKeydown}
      >
        {#each TOOLBAR_ROLES as role (role.id)}
          <button
            class="role-menu-item"
            role="menuitemradio"
            aria-checked={activeRole === role.id}
            type="button"
            onclick={() => selectRole(role.id)}
          >
            <span
              class="identity-seal menu-seal"
              class:menu-seal--active={activeRole === role.id}
            >
              {role.initial()}
            </span>
            <div class="role-menu-text">
              <span class="role-menu-label">{role.label()}</span>
              <span class="role-menu-desc">{role.tooltip()}</span>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  /* -----------------------------------------------------------------------
     Toolbar container
     -----------------------------------------------------------------------
     Positioned by the parent via absolute placement above the frame.
     Dark #1a1a1a + #333 border, matching the bezel chrome palette.
     Height: 4px padding x2 + 44px buttons + 2px border x2 = 56px.
     The entire bar is a drag surface via pointer handlers on the
     container; buttons stop propagation implicitly by capturing. */

  .frame-toolbar {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px;
    background: #1a1a1a;
    border: 2px solid #333;
    border-radius: 10px;
    z-index: 5;
    cursor: grab;
    touch-action: none;
  }

  .frame-toolbar:active {
    cursor: grabbing;
  }

  /* Drag vs click disambiguation cursors. A held button press (armed)
     shows the grab hand so the promotion to a drag is discoverable.
     An in-flight drag shows grabbing everywhere; the pointer may
     cross the buttons and must not flip back to a hand there. */
  .frame-toolbar--armed .toolbar-btn,
  .frame-toolbar--armed .badge-trigger {
    cursor: grab;
  }

  .frame-toolbar--dragging,
  .frame-toolbar--dragging .toolbar-btn,
  .frame-toolbar--dragging .badge-trigger {
    cursor: grabbing;
  }

  /* -----------------------------------------------------------------------
     Layout zones
     -----------------------------------------------------------------------
     Three zones inside the bar. Left and right are flex rows at the edges.
     Center is absolutely positioned at the horizontal midpoint so presets
     stay visually centered regardless of side-group widths. */

  .toolbar-zone {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  /* The left zone is always visible and first in flow; it needs no
     rules beyond the shared .toolbar-zone ones. */

  .toolbar-zone--center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .toolbar-zone--hidden {
    opacity: 0;
    transform: translateX(-50%) scale(0.85);
    pointer-events: none;
  }

  .center-full {
    display: flex;
    gap: 2px;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .center-full--hidden {
    position: absolute;
    opacity: 0;
    transform: scale(0.85);
    pointer-events: none;
  }

  .center-collapsed {
    display: flex;
    position: absolute;
    opacity: 0;
    transform: scale(0.85);
    pointer-events: none;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .center-collapsed--visible {
    position: static;
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .toolbar-zone--right {
    margin-left: auto;
    position: relative;
  }

  /* -----------------------------------------------------------------------
     Toolbar buttons
     -----------------------------------------------------------------------
     44x44 touch targets with the icon centered. Same palette as the
     former chrome arm buttons. */

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
    color: #98989d;
    cursor: pointer;
    transition: background 0.15s ease;
    padding: 0;
  }

  .toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .toolbar-btn-active {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  .toolbar-btn-active:hover {
    background: rgba(0, 122, 255, 0.25);
  }

  /* -----------------------------------------------------------------------
     User badge (trigger for role dropdown)
     -----------------------------------------------------------------------
     Shows the active role's identity seal + full label + chevron. Sits
     at the right edge of the bar via margin-left: auto on its zone. */

  .badge-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 4px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #ccc;
    cursor: pointer;
    transition: background 0.15s ease;
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
    height: 44px;
  }

  .badge-trigger--compact {
    gap: 0;
    padding: 0;
    width: 36px;
    min-width: 36px;
    justify-content: center;
  }

  .badge-trigger:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .badge-trigger:focus-visible {
    outline: 2px solid #64d2ff;
    outline-offset: 2px;
  }

  /* Pin seal ink to dark-scheme brand values (same tokens as the former
     RoleRail) so it reads on #1a1a1a chrome regardless of the outer
     page's light/dark state. Sized to 26px so it reads at the same
     visual weight as a 16px icon in a 44px button. */
  .badge-seal {
    --brand-text: #a89b80;
    --brand-fill: #6e6553;
    color: var(--brand-text);
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
  }

  .badge-seal--active {
    background: color-mix(in srgb, var(--brand-fill) 20%, transparent);
    border-color: color-mix(in srgb, var(--brand-fill) 80%, transparent);
    outline-color: color-mix(in srgb, var(--brand-fill) 50%, transparent);
    opacity: 1;
  }

  .badge-label {
    color: #ccc;
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    transition:
      max-width 0.2s ease,
      opacity 0.2s ease,
      margin 0.2s ease;
  }

  .badge-label--hidden {
    max-width: 0;
    opacity: 0;
    margin: 0 -3px;
  }

  .badge-chevron {
    display: flex;
    align-items: center;
    transition:
      width 0.2s ease,
      opacity 0.2s ease;
    width: 14px;
    overflow: hidden;
  }

  .badge-chevron--hidden {
    width: 0;
    opacity: 0;
  }

  /* -----------------------------------------------------------------------
     Role dropdown menu
     -----------------------------------------------------------------------
     Anchored below the badge trigger, right-aligned. Overlays the frame
     bezel (z-index above the toolbar's z:5). Hand-rolled: no Konsta, no
     outer-page dropdown precedent to reuse. role="menu" with
     menuitemradio items + aria-checked for the active role. */

  .role-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 260px;
    background: #1a1a1a;
    border: 2px solid #333;
    border-radius: 10px;
    padding: 4px;
    z-index: 6;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .role-menu-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #ccc;
    cursor: pointer;
    transition: background 0.15s ease;
    text-align: left;
    width: 100%;
  }

  .role-menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .role-menu-item:focus-visible {
    outline: 2px solid #64d2ff;
    outline-offset: -2px;
  }

  .role-menu-item[aria-checked="true"] {
    background: rgba(255, 255, 255, 0.04);
  }

  /* Seal tokens inside the menu, matching the badge's pinned dark scheme. */
  .menu-seal {
    --brand-text: #a89b80;
    --brand-fill: #6e6553;
    color: var(--brand-text);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .menu-seal--active {
    background: color-mix(in srgb, var(--brand-fill) 20%, transparent);
    border-color: color-mix(in srgb, var(--brand-fill) 80%, transparent);
    outline-color: color-mix(in srgb, var(--brand-fill) 50%, transparent);
    opacity: 1;
  }

  .role-menu-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .role-menu-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #f5f5f7;
  }

  .role-menu-desc {
    font-size: 0.6875rem;
    font-weight: 400;
    color: #98989d;
    line-height: 1.3;
  }

  /* -----------------------------------------------------------------------
     Preset picker (collapsed presets dropdown)
     -----------------------------------------------------------------------
     Appears in the right zone when the bar is too narrow for centered
     presets. Same dark chrome palette as the role menu. */

  .preset-picker {
    position: relative;
    width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    transition:
      width 0.2s ease,
      opacity 0.2s ease;
  }

  .preset-picker--visible {
    width: 38px;
    opacity: 1;
    overflow: visible;
    pointer-events: auto;
  }

  .preset-picker .toolbar-btn {
    width: 38px;
  }

  .preset-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 180px;
    background: #1a1a1a;
    border: 2px solid #333;
    border-radius: 10px;
    padding: 4px;
    z-index: 6;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .preset-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #ccc;
    cursor: pointer;
    transition: background 0.15s ease;
    text-align: left;
    width: 100%;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .preset-menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .preset-menu-item:focus-visible {
    outline: 2px solid #64d2ff;
    outline-offset: -2px;
  }

  .preset-menu-item[aria-checked="true"] {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  .preset-menu-item[aria-checked="true"]:hover {
    background: rgba(0, 122, 255, 0.25);
  }

  /* Hairline above the fullscreen item: separates the size radios from
     the fold-in action. */
  .preset-menu-item--ruled {
    border-top: 1px solid #333;
    border-radius: 0 0 6px 6px;
    margin-top: 2px;
  }

  /* The left-zone fullscreen button folds into the preset dropdown once
     presets collapse; below that width it takes no bar space at all. */
  .toolbar-btn--folded {
    display: none;
  }

  /* -----------------------------------------------------------------------
     Fullscreen pill mode
     -----------------------------------------------------------------------
     When --fs is active the toolbar detaches from the frame, becomes a
     fixed pill-shaped capsule at the pos coordinates, and hosts only
     exit + drawer + role. z-index 130 places it above the
     drawer (120). */

  .frame-toolbar--fs {
    position: absolute;
    bottom: auto;
    left: auto;
    right: auto;
    width: auto;
    border-radius: 999px;
    z-index: 130;
    user-select: none;
  }

  .frame-toolbar--fs .toolbar-btn {
    border-radius: 999px;
  }

  /* Divider between button groups in pill mode */
  .pill-divider {
    display: block;
    width: 1px;
    height: 20px;
    background: #333;
    flex-shrink: 0;
    margin: 0 2px;
  }

  .pill-divider--hidden {
    display: none;
  }

  /* Role menu upward direction (fullscreen, bar in lower half) */
  .role-menu--up {
    top: auto;
    bottom: calc(100% + 6px);
  }

  @media (prefers-reduced-motion: reduce) {
    .toolbar-btn,
    .badge-trigger,
    .role-menu-item,
    .preset-menu-item,
    .toolbar-zone--center,
    .center-full,
    .center-collapsed,
    .badge-label,
    .badge-chevron,
    .preset-picker {
      transition: none;
    }
  }
</style>
