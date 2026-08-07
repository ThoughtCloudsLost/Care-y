import { describe, it, expect, vi } from "vitest";
import { deriveSubState, resolveStoryMessage } from "./story-messages.js";
import { SECTIONS, ENTRY_SECTION } from "./scroll-sections.js";

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
