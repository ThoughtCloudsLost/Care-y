<script lang="ts">
  /**
   * iOS-Simulator-style floating toolbar above the demo frame.
   *
   * Renders as a single rounded bar spanning the frame's width, positioned
   * absolutely above .floating-frame via `bottom: calc(100% + GAP)`. Three
   * layout zones:
   *
   *   Left:   close (to read mode), minimize/restore, link/unlink
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
   * Shrunk state hides the center zone (presets) and user badge, leaving
   * only close + restore + link for a slim bar. The center zone also
   * hides when the bar is too narrow to fit all three groups (threshold
   * computed from the frame's `footprintW`, already known reactively).
   */

  import * as m from "$lib/paraglide/messages.js";
  import {
    Link2,
    Link2Off,
    Maximize2,
    Minimize2,
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
    /** Whether the handbook and phone are linked. */
    linked: boolean;
    /** The currently active demo role. */
    activeRole: RoleIdValue;
    /** Frame footprint width in CSS px, used for center-zone threshold. */
    footprintW: number;
    /** Callbacks for chrome actions. */
    onPhonePreset: () => void;
    onDesktopPreset: () => void;
    onShrinkGrow: () => void;
    onToggleLink: () => void;
    onRoleChange: (role: RoleIdValue) => void;
    /** Close the frame: leaves walk mode for read mode. */
    onClose: () => void;
    /** Pointer handlers wired to App.svelte's drag gesture system. */
    ondragstart: (e: PointerEvent) => void;
    ondragmove: (e: PointerEvent) => void;
    ondragend: (e: PointerEvent) => void;
  }

  let {
    shrunk,
    phoneActive,
    desktopActive,
    linked,
    activeRole,
    footprintW,
    onPhonePreset,
    onDesktopPreset,
    onShrinkGrow,
    onToggleLink,
    onRoleChange,
    onClose,
    ondragstart,
    ondragmove,
    ondragend,
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
  // Center-zone visibility threshold
  //
  // The three layout zones (left buttons, centered presets, right badge)
  // need enough horizontal room to avoid overlapping. At narrow widths
  // the center and right zones hide, matching the shrunk-state behavior.
  // Computed from footprintW (the frame width in CSS px, already reactive)
  // rather than a container query, since the value is already available.
  // -----------------------------------------------------------------------

  /** Below this width the center zone and badge are hidden. */
  const CENTER_ZONE_MIN_W = 360;

  const showExtras: boolean = $derived(
    !shrunk && footprintW >= CENTER_ZONE_MIN_W,
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

  function handleBarPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    suppressClick = false;
    const el = e.target instanceof Element ? e.target : null;
    if (el !== null && el.closest(".role-menu") !== null) return;
    if (el !== null && el.closest("button") !== null) {
      pendingPress = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
      };
      return;
    }
    dragging = true;
    ondragstart(e);
  }

  function handleBarPointerMove(e: PointerEvent): void {
    if (pendingPress !== null && e.pointerId === pendingPress.pointerId) {
      const dx = e.clientX - pendingPress.startX;
      const dy = e.clientY - pendingPress.startY;
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        pendingPress = null;
        dragging = true;
        suppressClick = true;
        ondragstart(e);
      }
    }
    ondragmove(e);
  }

  function handleBarPointerEnd(e: PointerEvent): void {
    if (pendingPress?.pointerId === e.pointerId) {
      pendingPress = null;
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

  // Close menu when the frame shrinks below the extras threshold
  $effect(() => {
    if (!showExtras && menuOpen) {
      closeMenu();
    }
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
</script>

<!-- The bar container is positioned by the parent (App.svelte) via
     .frame-toolbar's absolute placement. The entire background is a drag
     surface so the user can grab anywhere on the bar to move the frame,
     matching the bezel-strip pattern. -->
<div
  class="frame-toolbar"
  class:frame-toolbar--armed={pendingPress !== null}
  class:frame-toolbar--dragging={dragging}
  role="presentation"
  onpointerdown={handleBarPointerDown}
  onpointermove={handleBarPointerMove}
  onpointerup={handleBarPointerEnd}
  onpointercancel={handleBarPointerEnd}
  onclickcapture={handleBarClickCapture}
>
  <!-- Left group: close + minimize/restore + link/unlink. No drag
       grip: the bar's entire background is the drag surface. Close
       sits at the far left, macOS window-control order. -->
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
      class:toolbar-btn-active={!linked}
      type="button"
      onclick={onToggleLink}
      aria-label={linked
        ? m.demo_toolbar_link_linked()
        : m.demo_toolbar_link_unlinked()}
      aria-pressed={!linked}
      title={linked
        ? m.demo_toolbar_link_linked()
        : m.demo_toolbar_link_unlinked()}
    >
      {#if linked}
        <Link2 size={16} />
      {:else}
        <Link2Off size={16} />
      {/if}
    </button>
  </div>

  <!-- Center group: phone + desktop presets, absolutely centered in the
       bar so they stay visually centered regardless of side-group widths.
       Hidden when shrunk or the bar is too narrow. -->
  {#if showExtras}
    <div class="toolbar-zone toolbar-zone--center">
      <button
        class="toolbar-btn"
        class:toolbar-btn-active={phoneActive}
        type="button"
        onclick={onPhonePreset}
        aria-label={m.demo_toolbar_phone_preset()}
        title={m.demo_toolbar_phone_tooltip()}
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
      >
        <Monitor size={16} />
      </button>
    </div>
  {/if}

  <!-- Right group: user badge with role-switch dropdown. Hidden when
       shrunk or the bar is too narrow. -->
  <div class="toolbar-zone toolbar-zone--right">
    {#if showExtras}
      <button
        class="badge-trigger"
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
        <span class="badge-label">{activeRoleOption?.label() ?? ""}</span>
        <ChevronDown size={14} />
      </button>

      {#if menuOpen}
        <div
          class="role-menu"
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
     page's light/dark state. */
  .badge-seal {
    --brand-text: #a89b80;
    --brand-fill: #6e6553;
    color: var(--brand-text);
  }

  .badge-seal--active {
    background: color-mix(in srgb, var(--brand-fill) 20%, transparent);
    border-color: color-mix(in srgb, var(--brand-fill) 80%, transparent);
    outline-color: color-mix(in srgb, var(--brand-fill) 50%, transparent);
    opacity: 1;
  }

  .badge-label {
    color: #ccc;
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

  @media (prefers-reduced-motion: reduce) {
    .toolbar-btn,
    .badge-trigger,
    .role-menu-item {
      transition: none;
    }
  }
</style>
