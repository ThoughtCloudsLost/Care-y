import { describe, it, expect, afterEach, vi } from "vitest";
import { flushSync } from "svelte";
import {
  createScrollEngine,
  LAYOUT_SHIFT_SETTLE_MS,
  type ScrollEngine,
} from "./scroll-engine.svelte.js";
import {
  setFlowGeometrySource,
  setHeaderBottom,
  setViewportScrollY,
} from "./flow-geometry.svelte.js";
import type {
  FlowBlock,
  FlowBlockGeometry,
  FlowLayoutResult,
} from "./flow-layout.js";
import { SECTIONS, buildHash, getSection } from "./scroll-sections.js";

// -----------------------------------------------------------------------
// Load-time selection: a section-level location presents its first sub
// -----------------------------------------------------------------------

describe("scroll engine load-time selection", () => {
  let cleanup: (() => void) | undefined;
  let engine: ScrollEngine | undefined;

  // No bridge: the phone is still booting, so the engine presents the
  // location from the hash alone.
  function createEngine(hash: string): ScrollEngine {
    history.replaceState(null, "", window.location.pathname + hash);
    let created: ScrollEngine | undefined;
    cleanup = $effect.root(() => {
      created = createScrollEngine(() => undefined);
    });
    if (created === undefined) throw new TypeError("engine not created");
    engine = created;
    return created;
  }

  function firstSub(sectionId: string): string | undefined {
    return getSection(sectionId)?.subs[0]?.slug;
  }

  afterEach(() => {
    engine?.destroy();
    engine = undefined;
    cleanup?.();
    cleanup = undefined;
    history.replaceState(null, "", window.location.pathname);
  });

  it("selects the first login sub on a load with no hash", () => {
    const e = createEngine("");
    expect(e.activeSection).toBe("login");
    expect(e.activeSub).toBe(firstSub("login"));
  });

  it("selects the section's first sub for a section-only hash", () => {
    const section = SECTIONS.find((s) => s.subs.length > 1 && s.id !== "login");
    if (section === undefined) throw new TypeError("no multi-sub section");
    const e = createEngine(buildHash(section.id, null));
    expect(e.activeSection).toBe(section.id);
    expect(e.activeSub).toBe(section.subs[0]?.slug);
  });

  it("keeps the sub a deep link names", () => {
    const section = SECTIONS.find((s) => s.subs.length > 1);
    const deepSub = section?.subs[1]?.slug;
    if (section === undefined || deepSub === undefined) {
      throw new TypeError("no multi-sub section");
    }
    const e = createEngine(buildHash(section.id, deepSub));
    expect(e.activeSection).toBe(section.id);
    expect(e.activeSub).toBe(deepSub);
  });
});

// -----------------------------------------------------------------------
// Suppression disarm re-runs the derived selection
// -----------------------------------------------------------------------

describe("scroll engine suppression disarm", () => {
  let cleanup: (() => void) | undefined;
  let engine: ScrollEngine | undefined;

  afterEach(() => {
    engine?.destroy();
    engine = undefined;
    cleanup?.();
    cleanup = undefined;
    setFlowGeometrySource(null);
    setHeaderBottom(0);
    setViewportScrollY(0);
    vi.useRealTimers();
  });

  it("reports a selection that changed while a layout shift was muted", () => {
    // Regression: suppressSettle was a plain flag, so the timer that
    // disarms it did not re-run the derived-intent effect. A selection
    // that moved during the mute stayed unreported until the next
    // scroll event.
    vi.useFakeTimers();
    const subs = getSection("login")?.subs ?? [];
    const first = subs[0]?.slug;
    const second = subs[1]?.slug;
    if (first === undefined || second === undefined) {
      throw new TypeError("login needs two subs");
    }

    // Band at headerBottom 100 + BAND_GAP 16 = 116. The second heading
    // sits at document y 700, so it reaches the band at scrollY 584.
    const blocks: FlowBlock[] = [first, second].map((slug) => ({
      id: `b-${slug}`,
      sectionId: "login",
      subSlug: slug,
      kind: "sub-heading",
      text: "placeholder",
    }));
    const geos: FlowBlockGeometry[] = [
      { topY: 0, bottomY: 40, firstLineIndex: 0, lineCount: 1 },
      { topY: 500, bottomY: 540, firstLineIndex: 1, lineCount: 1 },
    ];
    const layout: FlowLayoutResult = {
      lines: geos.map((g, i) => ({
        blockIndex: i,
        x: 0,
        y: g.topY,
        width: 400,
        text: "line",
      })),
      blocks: geos,
      figures: [],
      totalHeight: 540,
    };
    setHeaderBottom(100);
    setViewportScrollY(0);
    setFlowGeometrySource({
      layoutResult: layout,
      blocks,
      containerTop: 200,
      holeAtScrollY: () => null,
      layoutForHole: () => layout,
    });

    // User-unlinked: a re-run of the effect moves the local selection,
    // which is observable without a bridge.
    cleanup = $effect.root(() => {
      engine = createScrollEngine(
        () => undefined,
        () => false,
        () => true,
        () => false,
      );
    });
    flushSync();
    expect(engine?.activeSub).toBe(first);

    engine?.suppressLayoutShift();
    setViewportScrollY(600);
    flushSync();
    expect(engine?.activeSub).toBe(first);

    vi.advanceTimersByTime(LAYOUT_SHIFT_SETTLE_MS);
    flushSync();
    expect(engine?.activeSub).toBe(second);
  });
});
