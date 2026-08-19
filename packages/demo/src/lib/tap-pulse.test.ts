import { describe, it, expect } from "vitest";
import { SECTIONS, resolvePhoneCommand } from "./scroll-sections.js";
import {
  topicFeatureTarget,
  buildTopicCandidates,
  buildActivationCandidates,
  findTopicElement,
  isNavChrome,
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
