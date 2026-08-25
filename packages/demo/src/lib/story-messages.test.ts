import { describe, it, expect, vi } from "vitest";
import {
  deriveSubState,
  deriveSectionState,
  resolveStoryMessage,
} from "./story-messages.js";
import { SECTIONS, ENTRY_SECTION, type Section } from "./scroll-sections.js";

/** SECTIONS is non-empty by taxonomy invariant; narrow for the type checker. */
function firstSection(): Section {
  const section = SECTIONS[0];
  if (section === undefined) throw new Error("SECTIONS is empty");
  return section;
}

/** Topics of a section's topic-bearing subs, without non-null assertions. */
function sectionTopics(section: Section): string[] {
  return section.subs.flatMap((s) => (s.topic !== null ? [s.topic] : []));
}

describe("deriveSubState", () => {
  it("marks active when slugs match", () => {
    const state = deriveSubState("overview", "overview", null, new Set());
    expect(state.isActive).toBe(true);
    expect(state.isSeen).toBe(false);
  });

  it("marks inactive when slugs differ", () => {
    const state = deriveSubState("overview", "details", null, new Set());
    expect(state.isActive).toBe(false);
  });

  it("marks inactive when activeSub is null", () => {
    const state = deriveSubState("overview", null, null, new Set());
    expect(state.isActive).toBe(false);
  });

  it("marks seen when the topic is in seenTopics", () => {
    const seen = new Set(["credentials"]);
    const state = deriveSubState("overview", null, "credentials", seen);
    expect(state.isSeen).toBe(true);
  });

  it("marks not seen when the topic is absent from seenTopics", () => {
    const seen = new Set(["credentials"]);
    const state = deriveSubState("overview", null, "twofa", seen);
    expect(state.isSeen).toBe(false);
  });

  it("marks not seen when sub has no topic", () => {
    const seen = new Set(["credentials"]);
    const state = deriveSubState("overview", null, null, seen);
    expect(state.isSeen).toBe(false);
  });
});

// -----------------------------------------------------------------------
// deriveSectionState
// -----------------------------------------------------------------------

describe("deriveSectionState", () => {
  it("returns zero counts with an empty seen set", () => {
    const state = deriveSectionState(firstSection(), new Set());
    expect(state.seenCount).toBe(0);
    expect(state.topicCount).toBeGreaterThan(0);
    expect(state.complete).toBe(false);
  });

  it("counts partial progress", () => {
    const section = firstSection();
    const topics = sectionTopics(section);
    // Mark only the first topic-bearing sub as seen
    const first = topics[0];
    if (first === undefined) throw new Error("section has no topics");
    const state = deriveSectionState(section, new Set([first]));
    expect(state.seenCount).toBe(1);
    expect(state.topicCount).toBe(topics.length);
    expect(state.complete).toBe(false);
  });

  it("marks complete when all topic-bearing subs are seen", () => {
    const section = firstSection();
    const allTopics = sectionTopics(section);
    const state = deriveSectionState(section, new Set(allTopics));
    expect(state.seenCount).toBe(allTopics.length);
    expect(state.topicCount).toBe(allTopics.length);
    expect(state.complete).toBe(true);
  });

  it("handles a section with no topic-bearing subs", () => {
    const noTopicSection = {
      id: "login" as const,
      titleKey: "demo_section_login_title",
      descKey: "demo_section_login_desc",
      routes: [],
      subs: [{ slug: "intro", topic: null, headingKey: "h", bodyKey: "b" }],
    };
    const state = deriveSectionState(noTopicSection, new Set());
    expect(state.seenCount).toBe(0);
    expect(state.topicCount).toBe(0);
    expect(state.complete).toBe(false);
  });
});

// -----------------------------------------------------------------------
// resolveStoryMessage
// -----------------------------------------------------------------------

describe("resolveStoryMessage", () => {
  it("returns the key on a miss and warns in dev mode", () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const result = resolveStoryMessage("nonexistent_key", "en");
    expect(result).toBe("nonexistent_key");
    // import.meta.env.DEV is true in vitest
    expect(warnSpy).toHaveBeenCalledWith(
      '[story-messages] missing lookup key: "nonexistent_key"',
    );
    warnSpy.mockRestore();
  });

  it("resolves a known key without warning", () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const result = resolveStoryMessage("demo_section_login_title", "en");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("demo_section_login_title");
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// -----------------------------------------------------------------------
// Completeness: every message key in SECTIONS and ENTRY_SECTION resolves
// -----------------------------------------------------------------------

describe("message key completeness", () => {
  /** Collect all message keys referenced by the section taxonomy. */
  function collectKeys(): string[] {
    const keys: string[] = [];
    const allSections = [...SECTIONS, ENTRY_SECTION];
    for (const section of allSections) {
      keys.push(section.titleKey, section.descKey);
      for (const sub of section.subs) {
        keys.push(sub.headingKey, sub.bodyKey);
      }
    }
    return keys;
  }

  it("every headingKey/bodyKey/titleKey/descKey resolves through the lookup", () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const keys = collectKeys();
    const missing: string[] = [];
    for (const key of keys) {
      const resolved = resolveStoryMessage(key, "en");
      if (resolved === key) {
        missing.push(key);
      }
    }
    expect(missing).toEqual([]);
    warnSpy.mockRestore();
  });
});
