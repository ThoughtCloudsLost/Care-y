import { tick } from "svelte";
import type { Component } from "svelte";

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
}

export function createSectionScroll(
  getSections: () => readonly ScrollSection[],
  options?: SectionScrollOptions,
): SectionScroll {
  const offsetRem = options?.scrollOffsetRem ?? 7;

  let active = $state(getSections()[0]?.id ?? "");
  let programmaticScroll = false;

  function scrollTo(id: string): void {
    programmaticScroll = true;
    active = id;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const target = document.getElementById(`section-${id}`);
    if (!target) return;

    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }

    target.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    });

    if (reducedMotion) {
      programmaticScroll = false;
      target.focus({ preventScroll: true });
    } else {
      setTimeout(() => {
        programmaticScroll = false;
        target.focus({ preventScroll: true });
      }, 1000);
    }
  }

  $effect(() => {
    const sections = getSections();
    const offset = offsetRem * 16;
    const SCROLL_SLOP = 16;

    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- effect-local DOM cache, not reactive
    const elCache = new Map<string, HTMLElement>();
    for (const section of sections) {
      const el = document.getElementById(`section-${section.id}`);
      if (el) elCache.set(section.id, el);
    }

    function updateActive(): void {
      if (programmaticScroll) return;
      let current = sections[0]?.id;

      for (const section of sections) {
        const el = elCache.get(section.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset + SCROLL_SLOP) {
          current = section.id;
        }
      }

      if (current !== undefined) active = current;
    }

    let ticking = false;
    function onScroll(): void {
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
  };
}
