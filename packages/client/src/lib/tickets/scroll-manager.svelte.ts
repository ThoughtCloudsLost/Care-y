/**
 * Scroll management for the ticket detail chat view.
 *
 * Owns scroll-to-bottom, near-bottom tracking, read progress reporting,
 * and auto-scroll on new messages. The component provides the scroll
 * container element and follow-up data; the manager handles the rest.
 */

import { tick } from "svelte";

interface FollowUpRef {
  id: string;
  createdAt: string;
}

interface ScrollManagerOptions {
  /** Pixel threshold for "near bottom" detection. */
  nearBottomPx?: number;
  /** Debounce interval (ms) for read progress reports. */
  readProgressDebounceMs?: number;
}

interface ScrollManager {
  /** Bind to the scroll container element. */
  scrollContainerEl: HTMLDivElement | undefined;
  /** Whether the user is within `nearBottomPx` of the bottom. */
  readonly isNearBottom: boolean;
  /** Svelte action: scroll element to bottom after DOM paint. */
  scrollToBottom: (node: HTMLElement) => void;
  /** Scroll event handler. Call from the container's onscroll. */
  onScroll: (
    followUps: FollowUpRef[],
    onreadprogress: ((ts: string) => void) | undefined,
  ) => void;
  /** Mark that initial scroll positioning has completed. */
  markScrolledInitially: () => void;
  /** Auto-scroll when new messages arrive (call from an $effect tracking followUp count). */
  autoScrollOnNew: (followUpCount: number, timelineActive: boolean) => void;
  /** Clear pending timers. Call from component cleanup. */
  cleanup: () => void;
}

export function createScrollManager(
  options: ScrollManagerOptions = {},
): ScrollManager {
  const nearBottomPx = options.nearBottomPx ?? 100;
  const debounceMs = options.readProgressDebounceMs ?? 2000;

  let scrollContainerEl = $state<HTMLDivElement | undefined>(undefined);
  let isNearBottom = $state(true);
  let readProgressTimer: ReturnType<typeof setTimeout> | null = null;
  let hasScrolledInitially = false;

  function scrollToBottom(node: HTMLElement): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
      });
    });
  }

  function reportReadProgress(
    followUps: FollowUpRef[],
    onreadprogress: (ts: string) => void,
  ): void {
    if (!scrollContainerEl) return;
    const containerRect = scrollContainerEl.getBoundingClientRect();
    let latestVisible: string | null = null;

    for (let i = followUps.length - 1; i >= 0; i--) {
      const fu = followUps.at(i);
      if (!fu) continue;
      const el = document.getElementById(`fu-${fu.id}`);
      if (!el) continue;
      const elRect = el.getBoundingClientRect();
      if (elRect.top < containerRect.bottom) {
        latestVisible = fu.createdAt;
        break;
      }
    }

    if (latestVisible !== null) {
      onreadprogress(latestVisible);
    }
  }

  function onScroll(
    followUps: FollowUpRef[],
    onreadprogress: ((ts: string) => void) | undefined,
  ): void {
    if (!scrollContainerEl) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerEl;
    isNearBottom = scrollHeight - scrollTop - clientHeight < nearBottomPx;

    if (onreadprogress && followUps.length > 0) {
      if (readProgressTimer) clearTimeout(readProgressTimer);
      readProgressTimer = setTimeout(() => {
        reportReadProgress(followUps, onreadprogress);
      }, debounceMs);
    }
  }

  function markScrolledInitially(): void {
    hasScrolledInitially = true;
  }

  function autoScrollOnNew(
    followUpCount: number,
    timelineActive: boolean,
  ): void {
    if (timelineActive) return;
    if (followUpCount === 0) return;

    if (isNearBottom && hasScrolledInitially) {
      void tick().then(() => {
        scrollContainerEl?.scrollTo({
          top: scrollContainerEl.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }

  function cleanup(): void {
    if (readProgressTimer) {
      clearTimeout(readProgressTimer);
      readProgressTimer = null;
    }
  }

  return {
    get scrollContainerEl(): HTMLDivElement | undefined {
      return scrollContainerEl;
    },
    set scrollContainerEl(el: HTMLDivElement | undefined) {
      scrollContainerEl = el;
    },
    get isNearBottom(): boolean {
      return isNearBottom;
    },
    scrollToBottom,
    onScroll,
    markScrolledInitially,
    autoScrollOnNew,
    cleanup,
  };
}
