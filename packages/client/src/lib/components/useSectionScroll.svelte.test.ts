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
});
