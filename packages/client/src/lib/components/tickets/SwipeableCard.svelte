<script lang="ts">
  import type { Snippet } from "svelte";
  import { MessageSquare, Phone, Pause, UserPlus } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { TicketQuickAction } from "./ticket-types.js";

  // Module-level: tracks the currently peeked card so any new interaction dismisses it.
  // Only one card can be peeked at a time across all SwipeableCard instances.
  let activePeekDismiss: (() => void) | null = null;

  function claimPeek(dismiss: () => void): void {
    if (activePeekDismiss && activePeekDismiss !== dismiss) {
      activePeekDismiss();
    }
    activePeekDismiss = dismiss;
  }

  function releasePeek(dismiss: () => void): void {
    if (activePeekDismiss === dismiss) {
      activePeekDismiss = null;
    }
  }

  function dismissActivePeek(): void {
    if (activePeekDismiss) {
      activePeekDismiss();
      activePeekDismiss = null;
    }
  }

  interface Props {
    ticketId: string;
    disabled?: boolean;
    onaction?: (ticketId: string, action: TicketQuickAction) => void;
    onlongpress?: (ticketId: string) => void;
    children: Snippet;
  }

  let {
    ticketId,
    disabled = false,
    onaction,
    onlongpress,
    children,
  }: Props = $props();

  // ── Swipe actions per direction ──
  // Right swipe (left-to-right): reply (short), call (far)
  // Left swipe (right-to-left): assign (short), hold (far)
  interface SwipeZone {
    action: TicketQuickAction;
    label: () => string;
    icon: typeof MessageSquare;
    color: string;
  }

  const RIGHT_NEAR: SwipeZone = {
    action: "reply",
    label: () => m.tickets_action_reply(),
    icon: MessageSquare,
    color: "var(--brand-text, #007aff)",
  };
  const RIGHT_FAR: SwipeZone = {
    action: "call",
    label: () => m.tickets_action_call(),
    icon: Phone,
    color: "#34c759",
  };
  const LEFT_NEAR: SwipeZone = {
    action: "assign",
    label: () => m.tickets_action_assign(),
    icon: UserPlus,
    color: "var(--brand-text, #007aff)",
  };
  const LEFT_FAR: SwipeZone = {
    action: "hold",
    label: () => m.tickets_action_hold(),
    icon: Pause,
    color: "#ff9500",
  };

  // ── Thresholds ──
  // The action indicator icon appears as soon as the card moves (no dead zone for visuals).
  // PEEK_THRESHOLD controls the minimum pull to enter peek-on-release mode.
  const PEEK_THRESHOLD = 40; // px: below this on release, spring back (dead zone)
  const ACTION_THRESHOLD = 80; // px: beyond this, first action fires on release
  const FAR_THRESHOLD = 140; // px: second action takes over
  const MAX_TRANSLATE = 200; // px: rubber-band limit
  const PEEK_SNAP = 100; // px: how far card slides when peeked (room for two buttons)
  const SPRING_DURATION = 450; // ms for spring-back
  const LOCK_DISTANCE = 8; // px before directional lock
  const PRESS_DURATION = 500; // ms for long-press
  const PRESS_SPREAD = 8; // px movement tolerance for long-press

  // ── Swipe state ──
  let translateX = $state(0);
  let isSwiping = $state(false);
  let peeked = $state<"left" | "right" | null>(null);
  let confirming = $state(false); // true during the sweep-confirm animation
  let confirmedZone = $state<SwipeZone | null>(null); // locked zone during confirm
  const CONFIRM_HOLD = 400; // ms to hold the full-width sweep before springing back

  // Pointer tracking (non-reactive).
  let startX = 0;
  let startY = 0;
  let locked: "horizontal" | "vertical" | null = null;
  let pointerId: number | null = null;
  let didSwipe = false; // true if horizontal movement was detected; suppresses click
  let didDismissPeek = false; // true if a peek was dismissed on pointerdown; suppresses click

  // ── Long-press state ──
  let pressTimer: ReturnType<typeof setTimeout> | null = null;

  const ICON_SHOW = 16; // px: icon appears almost immediately during drag

  // ── Derived: which zone is active based on current translateX ──
  // During confirm animation, use the locked zone instead of recalculating.
  const activeZone = $derived.by((): SwipeZone | null => {
    if (confirmedZone) return confirmedZone;
    const abs = Math.abs(translateX);
    if (abs < ICON_SHOW) return null;
    if (translateX > 0) {
      return abs >= FAR_THRESHOLD ? RIGHT_FAR : RIGHT_NEAR;
    }
    return abs >= FAR_THRESHOLD ? LEFT_FAR : LEFT_NEAR;
  });

  const willFireAction = $derived(
    confirming || Math.abs(translateX) >= ACTION_THRESHOLD,
  );

  const transitionStyle = $derived.by(() => {
    if (isSwiping) return "none";
    if (confirming) return "transform 300ms ease-out";
    return `transform ${String(SPRING_DURATION)}ms cubic-bezier(0.25, 1, 0.5, 1)`;
  });

  // Background color follows active zone.
  const panelColor = $derived(activeZone?.color ?? "transparent");

  // Icon scale: grows as you pull further into the action zone.
  const iconScale = $derived.by(() => {
    if (confirming) return 1.0;
    const abs = Math.abs(translateX);
    if (abs < ICON_SHOW) return 0.5;
    if (abs >= FAR_THRESHOLD) return 1.2;
    // Lerp from 0.6 to 1.0 between ICON_SHOW and FAR.
    const t = (abs - ICON_SHOW) / (FAR_THRESHOLD - ICON_SHOW);
    return 0.6 + t * 0.4;
  });

  function clearPress(): void {
    if (pressTimer !== null) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  // Bound reference for the module-level peek registry.
  function closePeekSelf(): void {
    translateX = 0;
    isSwiping = false;
    peeked = null;
  }

  function handlePointerDown(e: PointerEvent): void {
    if (disabled || e.button !== 0) return;

    // If the pointer landed on a peek button, let the click handler deal with it.
    if (e.target instanceof HTMLElement && e.target.closest(".peek-tray"))
      return;

    // Track if this card or another card had an active peek that we're dismissing.
    const wasPeeked = peeked !== null || activePeekDismiss !== null;

    // Dismiss any other card's peek.
    dismissActivePeek();

    // If this card is peeked, close it and suppress the resulting click.
    if (peeked !== null) {
      closePeekSelf();
      releasePeek(closePeekSelf);
    }

    didDismissPeek = wasPeeked;
    startX = e.clientX;
    startY = e.clientY;
    locked = null;
    pointerId = e.pointerId;
    isSwiping = false;
    didSwipe = false;

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    clearPress();
    pressTimer = setTimeout(() => {
      pressTimer = null;
      if (!isSwiping && locked !== "horizontal") {
        onlongpress?.(ticketId);
      }
    }, PRESS_DURATION);
  }

  function handlePointerMove(e: PointerEvent): void {
    if (disabled || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (locked === null) {
      if (Math.abs(dx) < LOCK_DISTANCE && Math.abs(dy) < LOCK_DISTANCE) {
        return;
      }
      locked = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
    }

    if (locked === "vertical") {
      clearPress();
      return;
    }

    if (
      Math.abs(e.clientX - startX) > PRESS_SPREAD ||
      Math.abs(dy) > PRESS_SPREAD
    ) {
      clearPress();
    }

    isSwiping = true;
    didSwipe = true;
    peeked = null;

    // Rubber-band: allow full range but clamp at MAX_TRANSLATE.
    translateX = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, dx));
  }

  function handlePointerUp(e: PointerEvent): void {
    if (e.pointerId !== pointerId) return;
    clearPress();
    pointerId = null;

    if (locked === "horizontal" && isSwiping) {
      const abs = Math.abs(translateX);

      if (abs >= ACTION_THRESHOLD && activeZone !== null) {
        // Sweep-confirm: lock the zone, snap card fully open, hold, then spring back.
        const firedAction = activeZone.action;
        const direction = translateX > 0 ? 1 : -1;
        confirmedZone = activeZone;
        confirming = true;
        translateX = direction * MAX_TRANSLATE;
        peeked = null;

        setTimeout(() => {
          onaction?.(ticketId, firedAction);
          confirming = false;
          confirmedZone = null;
          translateX = 0;
        }, CONFIRM_HOLD);
      } else if (abs >= PEEK_THRESHOLD) {
        // Peek: snap to show both action buttons side by side.
        const peekDir = translateX > 0 ? "right" : "left";
        peeked = peekDir;
        translateX = peekDir === "right" ? PEEK_SNAP : -PEEK_SNAP;
        claimPeek(closePeekSelf);
      } else {
        // Dead zone: spring back.
        translateX = 0;
        peeked = null;
      }
    }

    isSwiping = false;
    locked = null;
  }

  function handlePointerCancel(e: PointerEvent): void {
    if (e.pointerId !== pointerId) return;
    clearPress();
    pointerId = null;
    isSwiping = false;
    locked = null;
    translateX = 0;
    peeked = null;
  }

  function handlePeekAction(zone: SwipeZone): void {
    const direction = peeked === "right" ? 1 : -1;
    confirmedZone = zone;
    confirming = true;
    peeked = null;
    translateX = direction * MAX_TRANSLATE;

    setTimeout(() => {
      onaction?.(ticketId, zone.action);
      confirming = false;
      confirmedZone = null;
      translateX = 0;
    }, CONFIRM_HOLD);
  }

  // Suppress click on the inner card when a swipe or peek dismissal occurred.
  // Only block clicks originating from the card-slider (the child card),
  // not from the peek tray buttons.
  function handleClickCapture(e: MouseEvent): void {
    if (disabled) return;
    if (!didSwipe && !didDismissPeek && peeked === null) return;

    if (e.target instanceof HTMLElement && e.target.closest(".peek-tray")) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
  }
</script>

<div
  class="swipeable-card"
  role="group"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerCancel}
  onclickcapture={handleClickCapture}
>
  <!-- Left action panel (revealed on right swipe) -->
  <div
    class="action-panel action-panel--left"
    class:action-panel--visible={translateX > 0}
    style:background={translateX > 0 ? panelColor : "transparent"}
    aria-hidden={translateX <= 0}
  >
    {#if translateX > 0 && activeZone && peeked === null}
      <div
        class="action-indicator"
        class:action-indicator--will-fire={willFireAction}
        style:transform="scale({iconScale})"
      >
        <activeZone.icon size={22} />
        {#if willFireAction}
          <span class="action-label">{activeZone.label()}</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Right action panel (revealed on left swipe) -->
  <div
    class="action-panel action-panel--right"
    class:action-panel--visible={translateX < 0}
    style:background={translateX < 0 ? panelColor : "transparent"}
    aria-hidden={translateX >= 0}
  >
    {#if translateX < 0 && activeZone && peeked === null}
      <div
        class="action-indicator"
        class:action-indicator--will-fire={willFireAction}
        style:transform="scale({iconScale})"
      >
        <activeZone.icon size={22} />
        {#if willFireAction}
          <span class="action-label">{activeZone.label()}</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Sliding card content -->
  <div
    class="card-slider"
    style:transform="translateX({translateX}px)"
    style:transition={transitionStyle}
    role="presentation"
  >
    {@render children()}
  </div>

  <!-- Peek mode: both action buttons visible at the exposed edge -->
  {#if peeked !== null}
    {@const near = peeked === "right" ? RIGHT_NEAR : LEFT_NEAR}
    {@const far = peeked === "right" ? RIGHT_FAR : LEFT_FAR}
    <div
      class="peek-tray"
      class:peek-tray--left={peeked === "right"}
      class:peek-tray--right={peeked === "left"}
    >
      <button
        type="button"
        class="peek-btn"
        style:background={near.color}
        aria-label={near.label()}
        onclick={() => handlePeekAction(near)}
      >
        <near.icon size={20} />
      </button>
      <button
        type="button"
        class="peek-btn"
        style:background={far.color}
        aria-label={far.label()}
        onclick={() => handlePeekAction(far)}
      >
        <far.icon size={20} />
      </button>
    </div>
  {/if}
</div>

<style>
  .swipeable-card {
    position: relative;
    overflow: hidden;
    width: 100%;
    touch-action: pan-y;
  }

  /* ── Action panels (behind card, one per side) ── */
  .action-panel {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 100ms linear;
  }

  .action-panel--left {
    padding-left: var(--space-lg);
    justify-content: flex-start;
    border-radius: var(--card-radius, 0.75rem);
  }

  .action-panel--right {
    padding-right: var(--space-lg);
    justify-content: flex-end;
    border-radius: var(--card-radius, 0.75rem);
  }

  .action-panel--visible {
    opacity: 1;
  }

  /* ── Action indicator (icon + optional label) ── */
  .action-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--paper, #fff);
    transition: transform 100ms ease-out;
    will-change: transform;
  }

  .action-indicator--will-fire {
    font-weight: 600;
  }

  .action-label {
    font-size: var(--text-sm);
    white-space: nowrap;
  }

  /* ── Card slider ── */
  .card-slider {
    position: relative;
    z-index: 1;
    will-change: transform;
    background: transparent;
  }

  /* ── Peek tray (two buttons side by side at exposed edge) ── */
  .peek-tray {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: 0 var(--space-md);
  }

  .peek-tray--left {
    left: 0;
  }

  .peek-tray--right {
    right: 0;
  }

  .peek-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    color: var(--paper, #fff);
    -webkit-tap-highlight-color: transparent;
  }

  .peek-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .card-slider {
      transition: none !important;
    }

    .action-panel {
      transition: none;
    }

    .action-indicator {
      transition: none;
    }
  }
</style>
