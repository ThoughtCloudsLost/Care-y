import { tick } from "svelte";

export interface SearchOverlayOptions {
  /** Reactive getter for the current match ID array (in display order). */
  matches: () => readonly string[];
  /** Map a match ID to its DOM element ID. */
  getElementId: (matchId: string) => string;
  /** Reactive getter for the scroll container element (for passive tracking). */
  scrollContainer: () => HTMLElement | undefined;
  /**
   * Custom scroll handler. Called instead of the default scrollIntoView.
   * When omitted, the composable scrolls the element returned by
   * `getElementId(id)` into view with smooth centering.
   */
  onscroll?: (matchId: string) => void;
}

export interface SearchOverlay {
  readonly term: string | null;
  readonly active: boolean;
  /** Currently highlighted match ID (primary state). */
  readonly activeId: string | null;
  /** 0-based index of activeId in matches, or -1 if not found. */
  readonly position: number;
  readonly matchCount: number;
  readonly scrollRequested: boolean;
  markScrollComplete: () => void;
  enter: (term: string, targetId?: string) => void;
  exit: () => void;
  up: () => void;
  down: () => void;
  /** Re-scroll to the current activeId (e.g. after a view switch). */
  requestScroll: () => void;
  /** Update term without resetting position. Keeps activeId if still in matches. */
  setTerm: (term: string) => void;
}

export function createSearchOverlay(
  options: SearchOverlayOptions,
): SearchOverlay {
  let term = $state<string | null>(null);
  let activeId = $state<string | null>(null);
  let scrollRequested = $state(false);
  let scrollTrackingEnabled = $state(true);
  let scrollRafId: number | null = null;

  const active = $derived(term !== null);
  const position = $derived(
    activeId != null ? options.matches().indexOf(activeId) : -1,
  );
  const matchCount = $derived(options.matches().length);

  function defaultScroll(id: string): void {
    requestAnimationFrame(() => {
      const wrapper = document.getElementById(options.getElementId(id));
      if (wrapper == null) return;
      const target = wrapper.firstElementChild ?? wrapper;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function scrollToActive(): void {
    if (activeId == null) return;
    if (options.onscroll != null) {
      options.onscroll(activeId);
    } else {
      defaultScroll(activeId);
    }
  }

  function navigateWithoutScrollTracking(fn: () => void): void {
    scrollTrackingEnabled = false;
    fn();
    setTimeout(() => {
      scrollTrackingEnabled = true;
    }, 600);
  }

  function enter(newTerm: string, targetId?: string): void {
    term = newTerm;
    void tick().then(() => {
      const matches = options.matches();
      if (targetId != null && targetId !== "" && matches.includes(targetId)) {
        activeId = targetId;
      } else {
        activeId = matches[matches.length - 1] ?? null;
      }
      scrollRequested = true;
      scrollToActive();
    });
  }

  function exit(): void {
    term = null;
    activeId = null;
  }

  function up(): void {
    const matches = options.matches();
    if (matches.length === 0) return;
    navigateWithoutScrollTracking(() => {
      const idx = position;
      const prevIdx = idx <= 0 ? matches.length - 1 : idx - 1;
      activeId = matches.at(prevIdx) ?? null;
      scrollRequested = true;
      void tick().then(() => scrollToActive());
    });
  }

  function down(): void {
    const matches = options.matches();
    if (matches.length === 0) return;
    navigateWithoutScrollTracking(() => {
      const idx = position;
      const nextIdx = idx >= matches.length - 1 ? 0 : idx + 1;
      activeId = matches.at(nextIdx) ?? null;
      scrollRequested = true;
      void tick().then(() => scrollToActive());
    });
  }

  function setTerm(newTerm: string): void {
    term = newTerm;
    void tick().then(() => {
      const matches = options.matches();
      if (activeId != null && matches.includes(activeId)) return;
      activeId = matches[0] ?? null;
      if (activeId != null) {
        scrollRequested = true;
        scrollToActive();
      }
    });
  }

  function doRequestScroll(): void {
    if (activeId == null) return;
    navigateWithoutScrollTracking(() => {
      scrollRequested = true;
      void tick().then(() => scrollToActive());
    });
  }

  // -- Passive scroll tracking: update activeId to the match nearest viewport center --

  function updateActiveFromScroll(): void {
    if (!scrollTrackingEnabled || !active) return;
    const matches = options.matches();
    const container = options.scrollContainer();
    if (matches.length === 0 || container == null) return;

    const containerRect = container.getBoundingClientRect();
    const viewportCenter = containerRect.top + containerRect.height / 2;
    let closestId: string | null = null;
    let closestDist = Infinity;

    for (const id of matches) {
      const wrapper = document.getElementById(options.getElementId(id));
      if (wrapper == null) continue;
      const el = wrapper.firstElementChild ?? wrapper;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestId = id;
      }
    }

    if (closestId != null && closestId !== activeId) {
      activeId = closestId;
    }
  }

  function handleScroll(): void {
    if (!active || !scrollTrackingEnabled) return;
    if (scrollRafId != null) return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = null;
      updateActiveFromScroll();
    });
  }

  $effect(() => {
    if (!active) return;
    const el = options.scrollContainer();
    if (el == null) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (scrollRafId != null) {
        cancelAnimationFrame(scrollRafId);
        scrollRafId = null;
      }
    };
  });

  return {
    get term(): string | null {
      return term;
    },
    get active(): boolean {
      return active;
    },
    get activeId(): string | null {
      return activeId;
    },
    get position(): number {
      return position;
    },
    get matchCount(): number {
      return matchCount;
    },
    get scrollRequested(): boolean {
      return scrollRequested;
    },
    markScrollComplete(): void {
      scrollRequested = false;
    },
    enter,
    exit,
    up,
    down,
    requestScroll: doRequestScroll,
    setTerm,
  };
}
