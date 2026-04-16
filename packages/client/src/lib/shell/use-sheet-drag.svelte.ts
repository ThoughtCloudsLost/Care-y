/**
 * Swipe-to-dismiss gesture for bottom sheets.
 *
 * Returns a Svelte action that attaches touch handlers to the sheet content
 * element. The action applies translateY directly to the Konsta Sheet base
 * element (node.parentElement) so the entire sheet surface (glass background
 * + content) moves together during the drag.
 *
 * Only touches originating from the drag handle element start a drag.
 * Content area touches pass through to normal scrolling.
 *
 * Must be called during component initialization (top-level script).
 */

/** Distance in px before a release triggers dismiss. */
const DISMISS_THRESHOLD_PX = 80;

/** Flick speed (px/ms) that dismisses regardless of distance. */
const VELOCITY_DISMISS_PX_MS = 0.4;

/** Minimum downward delta before we commit to a drag (avoids accidental triggers). */
const COMMIT_DELTA_PX = 3;

export interface SheetDragConfig {
  /** Handler called when the drag crosses the dismiss threshold. */
  readonly ondismiss: () => void;
  /** Whether the sheet is currently open. Drag is only active when true. */
  readonly opened: boolean;
  /** Reference to the drag handle element. Only touches starting inside it begin a drag. */
  readonly handleEl: HTMLElement | undefined;
}

export interface SheetDragReturn {
  /** Svelte action: attach to the sheet's inner content element. */
  readonly action: (node: HTMLElement) => { destroy: () => void };
}

export function useSheetDrag(config: SheetDragConfig): SheetDragReturn {
  // Internal tracking (mutable, not reactive since styles are applied imperatively)
  let startY = 0;
  let startTime = 0;
  let committed = false;
  let fromHandle = false;
  let currentOffset = 0;
  let prevTouchY = 0;
  let lastTouchY = 0;

  // Stored so the $effect can clear inline styles when the sheet closes.
  let sheetBaseRef: HTMLElement | null = null;

  // When the sheet closes, clear any leftover inline transform/transition
  // so the next open starts from a clean state. Runs post-flush, so
  // Konsta's closed-state class (translateY 100%) is already applied.
  // Clearing the inline lets the CSS class take effect, and Konsta's own
  // transition animates the sheet from the drag release point to off-screen.
  $effect(() => {
    if (!config.opened && sheetBaseRef != null) {
      sheetBaseRef.style.transform = "";
      sheetBaseRef.style.transition = "";
      committed = false;
      currentOffset = 0;
    }
  });

  function onTouchStart(e: TouchEvent, sheetBase: HTMLElement): void {
    const touch = e.touches[0];
    if (!config.opened || e.touches.length !== 1 || touch == null) return;

    const target = e.target;
    fromHandle =
      target instanceof HTMLElement
        ? (config.handleEl?.contains(target) ?? false)
        : false;
    startY = touch.clientY;
    startTime = Date.now();
    committed = false;
    currentOffset = 0;

    // Disable transition during drag for 1:1 finger tracking.
    sheetBase.style.transition = "none";
  }

  function onTouchMove(e: TouchEvent, sheetBase: HTMLElement): void {
    const touch = e.touches[0];
    if (!config.opened || e.touches.length !== 1 || touch == null) return;

    const currentY = touch.clientY;
    const delta = currentY - startY;

    if (!committed) {
      // Only allow drag from the handle element.
      if (!fromHandle || delta < COMMIT_DELTA_PX) return;

      committed = true;
      startY = currentY;
      startTime = Date.now();
    }

    prevTouchY = lastTouchY;
    lastTouchY = currentY;

    const dragDelta = currentY - startY;
    currentOffset = Math.max(0, dragDelta);
    sheetBase.style.transform = `translateY(${String(currentOffset)}px)`;
    e.preventDefault();
  }

  function onTouchEnd(sheetBase: HTMLElement): void {
    if (!committed) {
      // Restore transition even if no drag committed (touchstart disabled it).
      sheetBase.style.transition = "";
      return;
    }

    const elapsed = Math.max(1, Date.now() - startTime);
    const velocity = currentOffset / elapsed;

    // If the user was pulling back up at the moment of release, snap back
    // regardless of how far they dragged. They changed their mind.
    const swipingUp = lastTouchY < prevTouchY;

    const shouldDismiss =
      !swipingUp &&
      (currentOffset > DISMISS_THRESHOLD_PX ||
        velocity > VELOCITY_DISMISS_PX_MS);

    if (shouldDismiss) {
      // Clear inline transition so Konsta's CSS transition takes over.
      // The inline transform stays until the $effect clears it when
      // opened becomes false, letting Konsta animate from here to closed.
      sheetBase.style.transition = "";
      config.ondismiss();
    } else {
      // Snap back with animation, then clean up the inline transition.
      sheetBase.style.transition = "transform 0.3s ease-out";
      sheetBase.style.transform = "";
      sheetBase.addEventListener(
        "transitionend",
        () => {
          sheetBase.style.transition = "";
        },
        { once: true },
      );
    }

    committed = false;
    currentOffset = 0;
  }

  function action(node: HTMLElement): { destroy: () => void } {
    // The Konsta Sheet base element is the direct parent of our content div.
    const sheetBase = node.parentElement;
    if (sheetBase == null) {
      return {
        destroy(): void {
          /* no-op: parent element not available at mount time */
        },
      };
    }

    sheetBaseRef = sheetBase;

    const boundStart = (e: TouchEvent): void => onTouchStart(e, sheetBase);
    const boundMove = (e: TouchEvent): void => onTouchMove(e, sheetBase);
    const boundEnd = (): void => onTouchEnd(sheetBase);

    node.addEventListener("touchstart", boundStart, { passive: true });
    node.addEventListener("touchmove", boundMove, { passive: false });
    node.addEventListener("touchend", boundEnd);
    node.addEventListener("touchcancel", boundEnd);

    return {
      destroy(): void {
        node.removeEventListener("touchstart", boundStart);
        node.removeEventListener("touchmove", boundMove);
        node.removeEventListener("touchend", boundEnd);
        node.removeEventListener("touchcancel", boundEnd);
        sheetBase.style.transition = "";
        sheetBase.style.transform = "";
        sheetBaseRef = null;
      },
    };
  }

  return { action };
}
