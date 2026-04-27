/**
 * Axis-generic swipe-to-dismiss gesture for overlays.
 *
 * Returns a Svelte action that attaches touch handlers to an overlay's content
 * element. The action applies translate(X|Y) directly to a target ancestor so
 * the entire surface (glass background + content) moves during the drag.
 *
 * Only touches originating from the handle element start a drag.
 * Content area touches pass through to normal scrolling.
 *
 * Consumers configure axis ("x" | "y") and direction (1 | -1):
 *   - Sheet (drag down to close):  axis="y", direction=1
 *   - Left panel (drag left):      axis="x", direction=-1
 *   - Right panel (drag right):    axis="x", direction=1
 *
 * Must be called during component initialization (top-level script).
 */

const DISMISS_THRESHOLD_PX = 80;
const VELOCITY_DISMISS_PX_MS = 0.4;
const COMMIT_DELTA_PX = 3;

export interface DragDismissConfig {
  readonly ondismiss: () => void;
  readonly opened: boolean;
  readonly handleEl: HTMLElement | undefined;
  readonly axis: "x" | "y";
  /** 1 = positive direction dismisses (down/right), -1 = negative (up/left). */
  readonly direction: 1 | -1;
  /** How many parentElement levels up from the action node to find the
   *  transform target. Default 1 (direct parent, used by Sheet). Panel
   *  uses 2 because of the intermediate Page element. */
  readonly parentDepth?: number;
}

export interface DragDismissReturn {
  readonly action: (node: HTMLElement) => { destroy: () => void };
}

export function useDragDismiss(config: DragDismissConfig): DragDismissReturn {
  let startPos = 0;
  let startTime = 0;
  let committed = false;
  let fromHandle = false;
  let currentOffset = 0;
  let prevTouchPos = 0;
  let currentTouchPos = 0;

  let baseRef: HTMLElement | null = null;

  $effect(() => {
    if (!config.opened && baseRef != null) {
      baseRef.style.transform = "";
      baseRef.style.transition = "";
      committed = false;
      currentOffset = 0;
    }
  });

  function pos(touch: Touch): number {
    return config.axis === "x" ? touch.clientX : touch.clientY;
  }

  function translate(px: number): string {
    return config.axis === "x"
      ? `translateX(${String(px)}px)`
      : `translateY(${String(px)}px)`;
  }

  function onTouchStart(e: TouchEvent, base: HTMLElement): void {
    const touch = e.touches[0];
    if (!config.opened || e.touches.length !== 1 || touch == null) return;

    const target = e.target;
    fromHandle =
      target instanceof HTMLElement
        ? (config.handleEl?.contains(target) ?? false)
        : false;
    startPos = pos(touch);
    startTime = Date.now();
    committed = false;
    currentOffset = 0;

    base.style.transition = "none";
  }

  function onTouchMove(e: TouchEvent, base: HTMLElement): void {
    const touch = e.touches[0];
    if (!config.opened || e.touches.length !== 1 || touch == null) return;

    const current = pos(touch);
    const delta = (current - startPos) * config.direction;

    if (!committed) {
      if (!fromHandle || delta < COMMIT_DELTA_PX) return;

      committed = true;
      startPos = current;
      startTime = Date.now();
    }

    prevTouchPos = currentTouchPos;
    currentTouchPos = current;

    const dragDelta = current - startPos;
    currentOffset =
      config.direction === 1 ? Math.max(0, dragDelta) : Math.min(0, dragDelta);

    base.style.transform = translate(currentOffset);
    e.preventDefault();
  }

  function onTouchEnd(base: HTMLElement): void {
    if (!committed) {
      base.style.transition = "";
      return;
    }

    const elapsed = Math.max(1, Date.now() - startTime);
    const absOffset = Math.abs(currentOffset);
    const velocity = absOffset / elapsed;

    const swipingBack =
      config.direction === 1
        ? currentTouchPos < prevTouchPos
        : currentTouchPos > prevTouchPos;

    const shouldDismiss =
      !swipingBack &&
      (absOffset > DISMISS_THRESHOLD_PX || velocity > VELOCITY_DISMISS_PX_MS);

    if (shouldDismiss) {
      base.style.transition = "";
      config.ondismiss();
    } else {
      base.style.transition = "transform 0.3s ease-out";
      base.style.transform = "";
      base.addEventListener(
        "transitionend",
        () => {
          base.style.transition = "";
        },
        { once: true },
      );
    }

    committed = false;
    currentOffset = 0;
  }

  function action(node: HTMLElement): { destroy: () => void } {
    let base: HTMLElement | null = node;
    const depth = config.parentDepth ?? 1;
    for (let i = 0; i < depth; i++) {
      base = base?.parentElement ?? null;
    }

    if (base == null) {
      return {
        destroy(): void {
          /* no-op */
        },
      };
    }

    baseRef = base;

    const boundStart = (e: TouchEvent): void => onTouchStart(e, base);
    const boundMove = (e: TouchEvent): void => onTouchMove(e, base);
    const boundEnd = (): void => onTouchEnd(base);

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
        base.style.transition = "";
        base.style.transform = "";
        baseRef = null;
      },
    };
  }

  return { action };
}
