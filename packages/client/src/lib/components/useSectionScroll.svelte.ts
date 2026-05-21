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

function ensureScrollRoom(container: HTMLElement, desiredScroll: number): void {
  if (spacer) spacer.style.height = "0";

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

    const container = findScrollContainer(target);
    const style = getComputedStyle(container);
    const navbarH =
      parseFloat(style.getPropertyValue("--navbar-h")) || offsetRem * 8;
    const subnavbarH =
      parseFloat(style.getPropertyValue("--subnavbar-h")) || offsetRem * 8;
    const offsetPx = navbarH + subnavbarH;

    const targetY =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    const desiredScroll = Math.max(0, targetY - offsetPx);

    ensureScrollRoom(container, desiredScroll);

    container.scrollTo({
      top: desiredScroll,
      behavior: reducedMotion ? "instant" : "smooth",
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

    // Immediately sync active state when sections change (e.g., a
    // conditional section was added/removed and shifted indices).
    updateActive();

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
