// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  createSectionScroll,
  type ScrollSection,
} from "./useSectionScroll.svelte.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Icon stand-in; the controller never renders it. */
const noopIcon = null as unknown as ScrollSection["icon"];

function makeSections(ids: readonly string[]): readonly ScrollSection[] {
  return ids.map((id) => ({ id, label: () => id, icon: noopIcon }));
}

/**
 * Per-element style registry backing a getComputedStyle stub. jsdom's
 * computed styles neither cascade custom properties nor resolve them
 * from ancestors, so the controller's --navbar-h / --subnavbar-h reads
 * come from here instead.
 */
const styleProps = new Map<Element, Record<string, string>>();

function stubComputedStyle(): void {
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (el: Element): CSSStyleDeclaration => {
      const props = styleProps.get(el) ?? {};
      return {
        overflowY: props["overflow-y"] ?? "visible",
        getPropertyValue: (name: string): string => props[name] ?? "",
      } as unknown as CSSStyleDeclaration;
    },
  );
}

/** Build a scroll container holding one #section-<id> div per section. */
function buildDom(ids: readonly string[]): {
  container: HTMLElement;
  els: Map<string, HTMLElement>;
} {
  const container = document.createElement("div");
  styleProps.set(container, { "overflow-y": "auto" });
  const els = new Map<string, HTMLElement>();
  for (const id of ids) {
    const el = document.createElement("div");
    el.id = `section-${id}`;
    container.appendChild(el);
    els.set(id, el);
  }
  document.body.appendChild(container);
  return { container, els };
}

function setTop(el: HTMLElement, top: number): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
  } as DOMRect);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createSectionScroll active tracking", () => {
  beforeEach(() => {
    stubComputedStyle();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    styleProps.clear();
    document.body.innerHTML = "";
  });

  it("counts a section parked under tall chrome as reached (live --navbar-h/--subnavbar-h)", () => {
    const sections = makeSections(["alpha", "beta"]);
    const { container, els } = buildDom(["alpha", "beta"]);
    styleProps.set(container, {
      "overflow-y": "auto",
      "--navbar-h": "103px",
      "--subnavbar-h": "97px",
    });
    // beta sits exactly where scrollTo parks it: navbar + subnavbar =
    // 200px down. Under the old fixed 128px threshold it would fail the
    // reached check and the highlight would fall back to alpha.
    const alphaEl = els.get("alpha");
    const betaEl = els.get("beta");
    if (alphaEl === undefined || betaEl === undefined)
      throw new Error("missing section els");
    setTop(alphaEl, -400);
    setTop(betaEl, 200);

    const dispose = $effect.root(() => {
      const scroll = createSectionScroll(() => sections);
      flushSync();
      expect(scroll.active).toBe("beta");
    });
    dispose();
  });

  it("falls back to the rem-based offset when the chrome vars are unset", () => {
    const sections = makeSections(["alpha", "beta"]);
    const { els } = buildDom(["alpha", "beta"]);
    // Default offsetRem 7 -> fallback chrome 112px + 16px slop = 128.
    // beta at 140 is below that line, so alpha stays active.
    const alphaEl = els.get("alpha");
    const betaEl = els.get("beta");
    if (alphaEl === undefined || betaEl === undefined)
      throw new Error("missing section els");
    setTop(alphaEl, -400);
    setTop(betaEl, 140);

    const dispose = $effect.root(() => {
      const scroll = createSectionScroll(() => sections);
      flushSync();
      expect(scroll.active).toBe("alpha");
    });
    dispose();
  });

  it("keeps the first of the sections sharing a row active", () => {
    // Lanes laid out side by side: beta and gamma share one row, both
    // past the chrome line. The first of them in order stays active.
    const sections = makeSections(["alpha", "beta", "gamma"]);
    const { els } = buildDom(["alpha", "beta", "gamma"]);
    const [alphaEl, betaEl, gammaEl] = ["alpha", "beta", "gamma"].map((id) =>
      els.get(id),
    );
    if (!alphaEl || !betaEl || !gammaEl) throw new Error("missing section els");
    setTop(alphaEl, -400);
    setTop(betaEl, 20);
    setTop(gammaEl, 20.5);

    const dispose = $effect.root(() => {
      const scroll = createSectionScroll(() => sections);
      flushSync();
      expect(scroll.active).toBe("beta");
    });
    dispose();
  });

  it("marks a section active without scrolling", () => {
    const sections = makeSections(["alpha", "beta"]);
    const { container, els } = buildDom(["alpha", "beta"]);
    const alphaEl = els.get("alpha");
    const betaEl = els.get("beta");
    if (alphaEl === undefined || betaEl === undefined)
      throw new Error("missing section els");
    setTop(alphaEl, 0);
    setTop(betaEl, 400);
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;

    const dispose = $effect.root(() => {
      const scroll = createSectionScroll(() => sections);
      flushSync();
      scroll.activate("beta");
      expect(scroll.active).toBe("beta");
      expect(scrollTo).not.toHaveBeenCalled();
    });
    dispose();
  });

  it("focuses a section without scrolling", () => {
    const sections = makeSections(["alpha", "beta"]);
    const { container, els } = buildDom(["alpha", "beta"]);
    const alphaEl = els.get("alpha");
    const betaEl = els.get("beta");
    if (alphaEl === undefined || betaEl === undefined)
      throw new Error("missing section els");
    setTop(alphaEl, 0);
    setTop(betaEl, 400);
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;

    const dispose = $effect.root(() => {
      const scroll = createSectionScroll(() => sections);
      flushSync();
      scroll.focus("beta");
      expect(scroll.active).toBe("beta");
      expect(document.activeElement).toBe(betaEl);
      expect(betaEl.getAttribute("tabindex")).toBe("-1");
      expect(scrollTo).not.toHaveBeenCalled();
    });
    dispose();
  });

  it("releases the room a jump added below the content", () => {
    const sections = makeSections(["alpha", "beta"]);
    const { container, els } = buildDom(["alpha", "beta"]);
    const alphaEl = els.get("alpha");
    const betaEl = els.get("beta");
    if (alphaEl === undefined || betaEl === undefined)
      throw new Error("missing section els");
    setTop(alphaEl, 0);
    setTop(betaEl, 1000);
    // Only 100px of scroll exists; reaching beta needs more, so the jump
    // adds room below the content.
    Object.defineProperty(container, "scrollHeight", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 400 });
    container.scrollTo = vi.fn();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true }) as MediaQueryList),
    );

    const dispose = $effect.root(() => {
      const scroll = createSectionScroll(() => sections);
      flushSync();
      scroll.scrollTo("beta");
      const spacer = container.lastElementChild;
      if (!(spacer instanceof HTMLElement) || spacer === betaEl)
        throw new Error("no room added");
      expect(parseFloat(spacer.style.height)).toBeGreaterThan(0);

      scroll.releaseScrollRoom();
      expect(parseFloat(spacer.style.height)).toBe(0);
    });
    dispose();
    vi.unstubAllGlobals();
  });

  it("ignores scrolling inside a section", () => {
    const sections = makeSections(["alpha", "beta"]);
    const { els } = buildDom(["alpha", "beta"]);
    const alphaEl = els.get("alpha");
    const betaEl = els.get("beta");
    if (alphaEl === undefined || betaEl === undefined)
      throw new Error("missing section els");
    setTop(alphaEl, 0);
    setTop(betaEl, 400);
    const inner = document.createElement("div");
    betaEl.appendChild(inner);
    const frame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", frame);

    const dispose = $effect.root(() => {
      createSectionScroll(() => sections);
      flushSync();
      // A lane body scrolling on its own moves no section.
      inner.dispatchEvent(new Event("scroll"));
      expect(frame).not.toHaveBeenCalled();
      // The page scroller does.
      document.dispatchEvent(new Event("scroll"));
      expect(frame).toHaveBeenCalledOnce();
    });
    dispose();
    vi.unstubAllGlobals();
  });
});
