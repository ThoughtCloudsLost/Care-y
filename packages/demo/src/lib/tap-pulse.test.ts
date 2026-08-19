import { describe, it, expect, vi } from "vitest";
import { SECTIONS, resolvePhoneCommand } from "./scroll-sections.js";
import {
  topicFeatureTarget,
  buildTopicCandidates,
  buildActivationCandidates,
  buildSmsTitleCandidates,
  findTopicElement,
  findTopicElementLoose,
  isNavChrome,
  isSectionToggle,
  resolveTopicElement,
  TAP_TOPICS,
  TOPIC_SELECTORS,
  MODE_TOGGLE_TOPICS,
  closeModeToggle,
} from "./tap-pulse.js";
import { DEMO_DETAIL_TICKET_ID, DEMO_DETAIL_ARTICLE_ID } from "./bridge.js";
import type { DemoTopic } from "./bridge.js";

// Topics handled by PhoneApp special cases (selector fallback or
// scripted interaction); they have no label candidates by design.
const PHONEAPP_SPECIAL_CASE_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "decryption",
  "message-actions",
  "exposure-hints",
]);

describe("tap-pulse contract", () => {
  // -----------------------------------------------------------------------
  // 1. Every topic with a sub-section has a way to find its element
  // -----------------------------------------------------------------------

  it("every sub-section topic has candidates, a selector, or a PhoneApp special case", () => {
    for (const section of SECTIONS) {
      for (const sub of section.subs) {
        if (sub.topic === null) continue;
        const topic = sub.topic;
        const candidates = buildTopicCandidates(topic);
        const hasSelector = TOPIC_SELECTORS.has(topic);
        const isSpecialCase = PHONEAPP_SPECIAL_CASE_TOPICS.has(topic);

        const reachable = candidates.size > 0 || hasSelector || isSpecialCase;
        expect(
          reachable,
          `topic "${topic}" (${section.id}/${sub.slug}) has no candidates, selector, or special case`,
        ).toBe(true);
      }
    }
  });

  // -----------------------------------------------------------------------
  // 2. topicFeatureTarget is consistent with resolvePhoneCommand
  // -----------------------------------------------------------------------

  it("topicFeatureTarget matches resolvePhoneCommand for every topic sub-section", () => {
    for (const section of SECTIONS) {
      for (const sub of section.subs) {
        if (sub.topic === null) continue;
        const topic = sub.topic;
        const target = topicFeatureTarget(topic);
        const cmd = resolvePhoneCommand(
          section.id,
          sub.slug,
          DEMO_DETAIL_TICKET_ID,
          DEMO_DETAIL_ARTICLE_ID,
        );

        expect(
          target.feature,
          `feature mismatch for topic "${topic}" (${section.id}/${sub.slug}): ` +
            `topicFeatureTarget=${target.feature}, resolvePhoneCommand=${cmd.feature}`,
        ).toBe(cmd.feature);

        // Detail semantics: both should agree on whether detail is null
        // vs a specific value. The exact value may differ (sentinel vs
        // real ID), so compare nullness only.
        const targetHasDetail = target.detail !== null;
        const cmdHasDetail = cmd.detail !== null;
        expect(
          targetHasDetail,
          `detail-nullness mismatch for topic "${topic}" (${section.id}/${sub.slug}): ` +
            `topicFeatureTarget detail=${String(target.detail)}, ` +
            `resolvePhoneCommand detail=${String(cmd.detail)}`,
        ).toBe(cmdHasDetail);
      }
    }
  });

  // -----------------------------------------------------------------------
  // 3. Every TAP_TOPICS member has non-empty activation candidates
  // -----------------------------------------------------------------------

  it("every TAP_TOPICS member has non-empty buildActivationCandidates", () => {
    for (const topic of TAP_TOPICS) {
      const candidates = buildActivationCandidates(topic);
      expect(
        candidates.size > 0,
        `TAP_TOPICS member "${topic}" has empty activation candidates`,
      ).toBe(true);
    }
  });
});

describe("findTopicElement nav-chrome preference", () => {
  function mount(html: string): void {
    document.body.innerHTML = html;
    // jsdom reports zero-size rects; isVisible requires dimensions, so
    // give every element a box via getBoundingClientRect stubs.
    for (const el of document.body.querySelectorAll("*")) {
      (el as HTMLElement).getBoundingClientRect = () =>
        ({
          width: 100,
          height: 40,
          top: 10,
          bottom: 50,
          left: 0,
          right: 100,
          x: 0,
          y: 10,
          toJSON: () => ({}),
        }) as DOMRect;
    }
  }

  it("prefers a content match over a sidebar match with the same label", () => {
    mount(`
      <nav><button aria-label="Knowledge base">Knowledge base</button></nav>
      <main><button aria-label="Knowledge base" id="content">Knowledge base</button></main>
    `);
    const el = findTopicElement(document, new Set(["Knowledge base"]));
    expect(el?.id).toBe("content");
  });

  it("falls back to the nav-chrome match when nothing else matches", () => {
    mount(`
      <nav><button aria-label="Knowledge base" id="chrome">Knowledge base</button></nav>
      <main><button aria-label="Other">Other</button></main>
    `);
    const el = findTopicElement(document, new Set(["Knowledge base"]));
    expect(el?.id).toBe("chrome");
  });

  it("isNavChrome recognizes nav, tablist, and tabbar ancestry", () => {
    mount(`
      <nav><button id="a">x</button></nav>
      <div role="tablist"><button id="b">x</button></div>
      <div class="k-tabbar"><button id="c">x</button></div>
      <main><button id="d">x</button></main>
    `);
    expect(isNavChrome(document.getElementById("a")!)).toBe(true);
    expect(isNavChrome(document.getElementById("b")!)).toBe(true);
    expect(isNavChrome(document.getElementById("c")!)).toBe(true);
    expect(isNavChrome(document.getElementById("d")!)).toBe(false);
  });
});

describe("closeModeToggle", () => {
  function mount(html: string): void {
    document.body.innerHTML = html;
    for (const el of document.body.querySelectorAll("*")) {
      (el as HTMLElement).getBoundingClientRect = () =>
        ({
          width: 100,
          height: 40,
          top: 10,
          bottom: 50,
          left: 0,
          right: 100,
          x: 0,
          y: 10,
          toJSON: () => ({}),
        }) as DOMRect;
    }
  }

  it("closes search navigators through their close button", () => {
    mount('<div><button class="search-close-btn">x</button></div>');
    const btn = document.querySelector<HTMLElement>(".search-close-btn");
    let clicked = 0;
    btn?.addEventListener("click", () => {
      clicked += 1;
    });

    expect(closeModeToggle("page-search", null)).toBe(true);
    expect(clicked).toBe(1);
  });

  it("closes selection modes through the cancel control", () => {
    mount('<button aria-label="Cancel selection">Cancel selection</button>');
    const btn = document.querySelector<HTMLElement>("button");
    let clicked = 0;
    btn?.addEventListener("click", () => {
      clicked += 1;
    });

    expect(closeModeToggle("message-select", null)).toBe(true);
    expect(clicked).toBe(1);
  });

  it("falls back to re-clicking a still-pressed toggle", () => {
    mount('<button aria-pressed="true" id="toggle">Select</button>');
    const toggle = document.getElementById("toggle") as HTMLElement;
    let clicked = 0;
    toggle.addEventListener("click", () => {
      clicked += 1;
    });

    expect(closeModeToggle("select-mode", toggle)).toBe(true);
    expect(clicked).toBe(1);
  });

  it("is a no-op when the visitor already closed the mode", () => {
    mount("<div></div>");
    expect(closeModeToggle("select-mode", null)).toBe(false);
  });

  it("declares exactly the inline-mode topics", () => {
    expect([...MODE_TOGGLE_TOPICS].sort()).toEqual([
      "deep-search",
      "message-select",
      "page-search",
      "select-mode",
    ]);
  });
});

// -----------------------------------------------------------------------
// Leaf pass: CollapsibleSection headings and bare LI group titles
// -----------------------------------------------------------------------

describe("findTopicElement leaf pass", () => {
  function mount(html: string): void {
    document.body.innerHTML = html;
    for (const el of document.body.querySelectorAll("*")) {
      (el as HTMLElement).getBoundingClientRect = () =>
        ({
          width: 100,
          height: 40,
          top: 10,
          bottom: 50,
          left: 0,
          right: 100,
          x: 0,
          y: 10,
          toJSON: () => ({}),
        }) as DOMRect;
    }
  }

  it("resolves a CollapsibleSection-shaped button via its span leaf", () => {
    // The button's whole textContent includes the chevron and count,
    // but the span.secline-eb leaf has the exact label alone.
    mount(`
      <button class="section-toggle" id="toggle">
        <span class="secline">
          <span class="secline-eb">Needs Attention</span>
          <span class="secline-rule" aria-hidden="true"></span>
          <span class="secline-cnt" aria-hidden="true">7</span>
        </span>
        <span aria-hidden="true">&#x276F;</span>
      </button>
    `);
    const el = findTopicElement(document, new Set(["Needs Attention"]));
    expect(el).not.toBeNull();
    expect(el?.id).toBe("toggle");
  });

  it("resolves a bare childless LI group title", () => {
    // Admin manager page renders group titles as childless LI elements.
    mount(`
      <ul>
        <li id="role-title">Your Role</li>
        <li class="k-list-item"><div>Some other item</div></li>
      </ul>
    `);
    const el = findTopicElement(document, new Set(["Your Role"]));
    expect(el).not.toBeNull();
    expect(el?.id).toBe("role-title");
  });
});

// -----------------------------------------------------------------------
// Composed sort candidates
// -----------------------------------------------------------------------

describe("composed sort candidates", () => {
  it("includes composed labels for both sort directions in both locales", () => {
    const candidates = buildTopicCandidates("sort");
    // The bare label must be present
    expect(candidates.has("Sort")).toBe(true);
    // English composed labels
    expect(candidates.has("Sort, ascending")).toBe(true);
    expect(candidates.has("Sort, descending")).toBe(true);
    // Spanish composed labels
    expect(candidates.has("Ordenar, ascendente")).toBe(true);
    expect(candidates.has("Ordenar, descendente")).toBe(true);
  });

  it("includes composed labels in activation candidates", () => {
    const candidates = buildActivationCandidates("sort");
    expect(candidates.has("Sort")).toBe(true);
    expect(candidates.has("Sort, ascending")).toBe(true);
    expect(candidates.has("Sort, descending")).toBe(true);
  });
});

// -----------------------------------------------------------------------
// SMS title candidates (exposure-hints second stage)
// -----------------------------------------------------------------------

describe("buildSmsTitleCandidates", () => {
  it("contains only the SMS title labels, not the compose actions label", () => {
    const candidates = buildSmsTitleCandidates();
    const full = buildTopicCandidates("exposure-hints");
    expect(candidates.size).toBeGreaterThan(0);
    for (const label of candidates) {
      expect(full.has(label)).toBe(true);
    }
    // The compose actions label must be absent: its visible button
    // would win the aria pass before the popover item mounts.
    for (const label of buildTopicCandidates("compose-actions")) {
      expect(candidates.has(label)).toBe(false);
    }
  });
});

// -----------------------------------------------------------------------
// Section-toggle tap guard
// -----------------------------------------------------------------------

describe("isSectionToggle", () => {
  function mount(html: string): void {
    document.body.innerHTML = html;
  }

  it("returns true for an element inside .section-toggle", () => {
    mount(
      '<button class="section-toggle"><span id="leaf">Label</span></button>',
    );
    const leaf = document.getElementById("leaf")!;
    expect(isSectionToggle(leaf)).toBe(true);
  });

  it("returns true for the .section-toggle element itself", () => {
    mount('<button class="section-toggle" id="btn">Label</button>');
    const btn = document.getElementById("btn")!;
    expect(isSectionToggle(btn)).toBe(true);
  });

  it("returns false for elements outside .section-toggle", () => {
    mount('<button id="normal">Label</button>');
    const btn = document.getElementById("normal")!;
    expect(isSectionToggle(btn)).toBe(false);
  });
});

// -----------------------------------------------------------------------
// Loose visibility tier and resolver scroll behavior
// -----------------------------------------------------------------------

describe("loose visibility tier", () => {
  function mount(html: string): void {
    document.body.innerHTML = html;
  }

  /** Stub getBoundingClientRect to place the element below the viewport. */
  function stubBelowViewport(el: HTMLElement): void {
    el.getBoundingClientRect = () =>
      ({
        width: 100,
        height: 40,
        top: 2000,
        bottom: 2040,
        left: 0,
        right: 100,
        x: 0,
        y: 2000,
        toJSON: () => ({}),
      }) as DOMRect;
  }

  it("strict finder rejects an element below the viewport", () => {
    mount('<button aria-label="Activity" id="target">Activity</button>');
    const target = document.getElementById("target") as HTMLElement;
    stubBelowViewport(target);
    const el = findTopicElement(document, new Set(["Activity"]));
    expect(el).toBeNull();
  });

  it("loose finder finds an element below the viewport", () => {
    mount('<button aria-label="Activity" id="target">Activity</button>');
    const target = document.getElementById("target") as HTMLElement;
    stubBelowViewport(target);
    const el = findTopicElementLoose(document, new Set(["Activity"]));
    expect(el).not.toBeNull();
    expect(el?.id).toBe("target");
  });

  it("resolver scrolls the scrollable ancestor for a loose match", async () => {
    mount(`
      <div id="scroller" style="overflow-y: auto; height: 200px;">
        <div style="height: 3000px;">
          <button aria-label="Deep Item" id="deep">Deep Item</button>
        </div>
      </div>
    `);

    const scroller = document.getElementById("scroller") as HTMLElement;
    const deep = document.getElementById("deep") as HTMLElement;

    // Make the scroller report as scrollable
    Object.defineProperty(scroller, "scrollHeight", { value: 3000 });
    Object.defineProperty(scroller, "clientHeight", { value: 200 });

    // Initially below viewport
    stubBelowViewport(deep);
    scroller.getBoundingClientRect = () =>
      ({
        width: 300,
        height: 200,
        top: 0,
        bottom: 200,
        left: 0,
        right: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    // After the resolver scrolls, simulate the element becoming visible.
    const originalGetRect = deep.getBoundingClientRect.bind(deep);
    deep.getBoundingClientRect = () => {
      // After scrollIntoViewIframeSafe fires, the next poll should
      // see the element in the viewport.
      if (scroller.scrollTop > 0) {
        return {
          width: 100,
          height: 40,
          top: 100,
          bottom: 140,
          left: 0,
          right: 100,
          x: 0,
          y: 100,
          toJSON: () => ({}),
        } as DOMRect;
      }
      return originalGetRect();
    };

    vi.useFakeTimers();
    const resolvePromise = resolveTopicElement(
      document,
      new Set(["Deep Item"]),
    );
    // Run through the poll ticks
    await vi.advanceTimersByTimeAsync(6000);
    vi.useRealTimers();

    const result = await resolvePromise;
    expect(result).not.toBeNull();
    expect(scroller.scrollTop).toBeGreaterThan(0);
  });
});
