/**
 * Scroll-direction composable for retractable UI regions.
 *
 * Tracks the scroll direction of a container element and exposes a
 * reactive `hidden` boolean: true when scrolling down (content should
 * collapse), false when scrolling up or near the top.
 *
 * Uses passive scroll listeners and a dead zone to avoid jitter from
 * iOS Safari rubber-band overscroll.
 */

export interface UseScrollDirectionOptions {
  /** Reactive getter for the scroll container element. */
  get scrollEl(): HTMLElement | undefined;
  /** Scroll position below which `hidden` is always false. Default: 60. */
  threshold?: number;
  /** Minimum delta (px) to register a direction change. Default: 8. */
  deadZone?: number;
  /** Invert the hide direction: hide on scroll up, show on scroll down (for chat views). Default: false. */
  invert?: boolean;
}

export interface UseScrollDirectionReturn {
  /** True when the user is scrolling down past the threshold. */
  readonly hidden: boolean;
}

export interface ScrollDirectionTrackerOptions {
  threshold?: number;
  deadZone?: number;
  /** Invert the hide direction. Default: false. */
  invert?: boolean;
  /** Called whenever the hidden state changes. */
  onChange?: (hidden: boolean) => void;
}

/**
 * Pure scroll-direction tracker (no runes). Manages scroll listener
 * lifecycle and direction state for a single element.
 *
 * Exported for testing. Production code should use `useScrollDirection`.
 */
export class ScrollDirectionTracker {
  private readonly threshold: number;
  private readonly deadZone: number;
  private readonly invert: boolean;
  private readonly onChange: ((hidden: boolean) => void) | undefined;
  private lastScrollTop = 0;
  private scrollHandler: (() => void) | null = null;
  private currentEl: HTMLElement | null = null;
  private rafId: number | null = null;

  hidden = false;

  constructor(options: ScrollDirectionTrackerOptions = {}) {
    this.threshold = options.threshold ?? 60;
    this.deadZone = options.deadZone ?? 8;
    this.invert = options.invert ?? false;
    this.onChange = options.onChange;
  }

  /** Process a scroll event on the attached element. */
  handleScroll(): void {
    if (this.currentEl == null) return;

    const currentTop = this.currentEl.scrollTop;

    // Near the top: always show.
    if (currentTop < this.threshold) {
      const wasHidden = this.hidden;
      this.hidden = false;
      this.lastScrollTop = currentTop;
      if (wasHidden) this.onChange?.(false);
      return;
    }

    const delta = currentTop - this.lastScrollTop;

    // Dead zone: ignore tiny deltas from sub-pixel jitter.
    if (Math.abs(delta) < this.deadZone) return;

    // Rubber-band bounce guard: when the scroll position is at the
    // bottom content boundary, iOS Safari's overscroll spring-back
    // produces a small upward delta. Ignore upward movement that
    // originates from the bottom edge so it isn't mistaken for an
    // intentional scroll-up gesture.
    const maxScroll = this.currentEl.scrollHeight - this.currentEl.clientHeight;
    if (delta < 0 && this.lastScrollTop >= maxScroll - 3) {
      this.lastScrollTop = currentTop;
      return;
    }

    const newHidden = this.invert ? delta < 0 : delta > 0;
    const changed = this.hidden !== newHidden;
    this.hidden = newHidden;
    this.lastScrollTop = currentTop;
    if (changed) this.onChange?.(newHidden);
  }

  /** Attach to a scroll container. Detaches from any prior element. */
  attach(el: HTMLElement): void {
    this.detach();
    this.currentEl = el;
    this.lastScrollTop = el.scrollTop;
    // Gate through rAF so iOS Safari's batched momentum scroll events
    // are coalesced into a single direction check per frame. Without
    // this, rapid scroll events cause the hidden state to flip multiple
    // times in one frame, producing a janky animation.
    this.scrollHandler = () => {
      if (this.rafId != null) return;
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.handleScroll();
      });
    };
    el.addEventListener("scroll", this.scrollHandler, { passive: true });
  }

  /** Detach from the current element. */
  detach(): void {
    if (this.currentEl != null && this.scrollHandler != null) {
      this.currentEl.removeEventListener("scroll", this.scrollHandler);
    }
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.scrollHandler = null;
    this.currentEl = null;
  }
}

/**
 * Creates scroll-direction tracking state with a reactive `$effect`
 * that attaches/detaches the scroll listener when the element changes.
 *
 * Must be called during component initialization (top-level script).
 */
export function useScrollDirection(
  options: UseScrollDirectionOptions,
): UseScrollDirectionReturn {
  let hidden = $state(false);

  const tracker = new ScrollDirectionTracker({
    threshold: options.threshold,
    deadZone: options.deadZone,
    invert: options.invert,
    onChange: (value) => {
      hidden = value;
    },
  });

  $effect(() => {
    const el = options.scrollEl;
    if (el == null) return;

    tracker.attach(el);

    return () => {
      tracker.detach();
    };
  });

  return {
    get hidden(): boolean {
      return hidden;
    },
  };
}
