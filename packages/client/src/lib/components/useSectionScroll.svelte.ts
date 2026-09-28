import { tick } from "svelte";
import type { Component } from "svelte";
import { offsetWithinScroller } from "$lib/utils/scroll-offset.js";
import { focusJumpTarget } from "$lib/utils/a11y.js";

export interface ScrollSection {
  readonly id: string;
  readonly label: () => string;
  readonly icon: Component;
}

interface SectionScrollOptions {
  readonly scrollOffsetRem?: number;
}

export interface SectionScroll {
  readonly active: string;
  scrollTo(id: string): void;
  expandAndScroll(id: string, expand: () => void): Promise<void>;
  /**
   * Mark a section active without scrolling, for a jump to a section
   * already in view (a lane on a page that does not scroll).
   */
  activate(id: string): void;
  /**
   * Mark a section active and focus it without scrolling, for a page
   * that does not scroll (the dashboard's board).
   */
  focus(id: string): void;
  /**
   * Drop the room a jump added below the content, so a page that has
   * stopped scrolling cannot scroll by it.
   */
  releaseScrollRoom(): void;
}

/**
 * Tops within this many px count as one row. Sections laid out side by
 * side share a row, and the first of them in section order is active.
 */
const SAME_ROW_PX = 1;

function findScrollContainer(el: HTMLElement): HTMLElement {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return document.documentElement;
}

let spacer: HTMLDivElement | null = null;

function releaseScrollRoom(): void {
  if (spacer) spacer.style.height = "0";
}

function ensureScrollRoom(container: HTMLElement, desiredScroll: number): void {
  releaseScrollRoom();

  const maxScroll = container.scrollHeight - container.clientHeight;
  const deficit = desiredScroll - maxScroll;

  if (deficit <= 0) return;

  if (!spacer) {
    spacer = document.createElement("div");
    spacer.setAttribute("aria-hidden", "true");
    spacer.style.flexShrink = "0";
  }

  if (spacer.parentElement !== container) {
    container.appendChild(spacer);
  }

  spacer.style.height = `${String(Math.ceil(deficit))}px`;
  void container.scrollHeight;
}

export function createSectionScroll(
  getSections: () => readonly ScrollSection[],
  options?: SectionScrollOptions,
): SectionScroll {
  const offsetRem = options?.scrollOffsetRem ?? 7;

  let active = $state(getSections()[0]?.id ?? "");
  let programmaticScroll = false;

  // Height of the sticky chrome above the content, read live so pages
  // with tall subnavbars (or simulated safe-area insets) measure what
  // is actually on screen. scrollTo and the scroll tracker must both
  // use this: if they disagree, a section parked exactly under the
  // chrome by a nav tap fails the tracker's "reached" check and the
  // highlight snaps back to the previous section.
  function chromeOffsetPx(container: HTMLElement): number {
    const style = getComputedStyle(container);
    const navbarH =
      parseFloat(style.getPropertyValue("--navbar-h")) || offsetRem * 8;
    const subnavbarH =
      parseFloat(style.getPropertyValue("--subnavbar-h")) || offsetRem * 8;
    return navbarH + subnavbarH;
  }

  function scrollTo(id: string): void {
    programmaticScroll = true;
    active = id;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const target = document.getElementById(`section-${id}`);
    if (!target) return;

    const container = findScrollContainer(target);
    const offsetPx = chromeOffsetPx(container);

    const targetY = offsetWithinScroller(target, container);
    const desiredScroll = Math.max(0, targetY - offsetPx);

    ensureScrollRoom(container, desiredScroll);

    container.scrollTo({
      top: desiredScroll,
      behavior: reducedMotion ? "instant" : "smooth",
    });

    if (reducedMotion) {
      programmaticScroll = false;
      focusJumpTarget(target);
    } else {
      setTimeout(() => {
        programmaticScroll = false;
        focusJumpTarget(target);
      }, 1000);
    }
  }

  $effect(() => {
    const sections = getSections();
    const SCROLL_SLOP = 16;

    // Reset active if the current ID was removed from the sections array
    // (e.g., getting-started dismissed, conditional section hidden).
    if (sections.length > 0 && !sections.some((s) => s.id === active)) {
      active = sections[0]?.id ?? active;
    }

    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- effect-local DOM cache, not reactive
    const elCache = new Map<string, HTMLElement>();
    for (const section of sections) {
      const el = document.getElementById(`section-${section.id}`);
      if (el) elCache.set(section.id, el);
    }

    const anchor: HTMLElement | undefined = elCache.values().next().value;

    function updateActive(): void {
      if (programmaticScroll) return;
      let current = sections[0]?.id;

      // Same chrome line the tap path scrolls to; a fixed threshold
      // here mis-highlights whenever the chrome is taller than it.
      const offset =
        anchor !== undefined
          ? chromeOffsetPx(findScrollContainer(anchor))
          : offsetRem * 16;

      // A later section takes over only from a lower row; one sharing the
      // current section's row leaves the first of the row active.
      let currentTop = Number.NEGATIVE_INFINITY;
      for (const section of sections) {
        const el = elCache.get(section.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= offset + SCROLL_SLOP && top > currentTop + SAME_ROW_PX) {
          current = section.id;
          currentTop = top;
        }
      }

      if (current !== undefined) active = current;
    }

    // Immediately sync active state when sections change (e.g., a
    // conditional section was added/removed and shifted indices).
    updateActive();

    let ticking = false;
    function onScroll(event: Event): void {
      // A scroller inside a section (a lane that scrolls on its own)
      // moves no section, so it leaves the active one alone.
      const target = event.target;
      if (
        target instanceof Element &&
        anchor !== undefined &&
        !target.contains(anchor)
      ) {
        return;
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
      }
    }

    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () =>
      document.removeEventListener("scroll", onScroll, { capture: true });
  });

  async function expandAndScroll(
    id: string,
    expand: () => void,
  ): Promise<void> {
    expand();
    await tick();
    const skipTransition = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!skipTransition) {
      await new Promise<void>((r) => setTimeout(r, 210));
    }
    scrollTo(id);
  }

  return {
    get active(): string {
      return active;
    },
    scrollTo,
    expandAndScroll,
    activate(id: string): void {
      active = id;
    },
    focus(id: string): void {
      active = id;
      const target = document.getElementById(`section-${id}`);
      if (target) focusJumpTarget(target);
    },
    releaseScrollRoom,
  };
}
