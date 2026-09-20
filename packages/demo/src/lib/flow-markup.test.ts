import { describe, it, expect } from "vitest";
import {
  hasFlowMarkup,
  parseFlowMarkup,
  unitHasBold,
  unitText,
  extractTags,
} from "./flow-markup.js";

describe("hasFlowMarkup", () => {
  it("returns false for plain prose", () => {
    expect(hasFlowMarkup("You type a username and password.")).toBe(false);
  });

  it("returns false for prose containing hyphens and periods", () => {
    expect(hasFlowMarkup("Argon2id, a memory-hard function. Done.")).toBe(
      false,
    );
  });

  it("returns false for paraglide parameter braces", () => {
    expect(hasFlowMarkup("Back to {section}")).toBe(false);
  });

  it("detects bold delimiters", () => {
    expect(hasFlowMarkup("The **relay** never stores plaintext.")).toBe(true);
  });

  it("detects newline paragraph breaks", () => {
    expect(hasFlowMarkup("First paragraph.\nSecond paragraph.")).toBe(true);
  });

  it("detects a leading bullet", () => {
    expect(hasFlowMarkup("- first item")).toBe(true);
  });

  it("detects a leading numbered item", () => {
    expect(hasFlowMarkup("1. first step")).toBe(true);
  });

  it("does not treat a mid-sentence dash as a bullet", () => {
    expect(hasFlowMarkup("read - then write")).toBe(false);
  });

  it("detects tag brackets", () => {
    expect(hasFlowMarkup("plain text [[#encryption]]")).toBe(true);
  });

  it("detects entry links", () => {
    expect(hasFlowMarkup("see [details](#login/credentials)")).toBe(true);
  });
});

describe("parseFlowMarkup", () => {
  it("returns a single paragraph unit for plain text", () => {
    const units = parseFlowMarkup("Just prose.");
    expect(units).toEqual([
      {
        kind: "paragraph",
        marker: null,
        runs: [{ text: "Just prose.", bold: false }],
      },
    ]);
  });

  it("splits newline-separated lines into paragraph units", () => {
    const units = parseFlowMarkup("First.\nSecond.");
    expect(units).toHaveLength(2);
    expect(unitText(units[0]!)).toBe("First.");
    expect(unitText(units[1]!)).toBe("Second.");
  });

  it("ignores blank lines between paragraphs", () => {
    const units = parseFlowMarkup("First.\n\nSecond.");
    expect(units).toHaveLength(2);
  });

  it("parses bold runs within a paragraph", () => {
    const units = parseFlowMarkup("The **relay** forwards.");
    expect(units[0]?.runs).toEqual([
      { text: "The ", bold: false },
      { text: "relay", bold: true },
      { text: " forwards.", bold: false },
    ]);
    expect(unitHasBold(units[0]!)).toBe(true);
  });

  it("parses multiple bold runs in one line", () => {
    const units = parseFlowMarkup("**A** and **B**");
    expect(units[0]?.runs).toEqual([
      { text: "A", bold: true },
      { text: " and ", bold: false },
      { text: "B", bold: true },
    ]);
  });

  it("treats an unpaired ** as literal text", () => {
    const units = parseFlowMarkup("A stray ** delimiter");
    expect(units[0]?.runs).toEqual([
      { text: "A stray ** delimiter", bold: false },
    ]);
    expect(unitHasBold(units[0]!)).toBe(false);
  });

  it("parses bullet items with the dot marker", () => {
    const units = parseFlowMarkup("- first\n- second");
    expect(units).toHaveLength(2);
    expect(units[0]).toMatchObject({ kind: "bullet", marker: "•" });
    expect(unitText(units[0]!)).toBe("first");
    expect(units[1]).toMatchObject({ kind: "bullet", marker: "•" });
  });

  it("parses numbered items and keeps the author's numbers", () => {
    const units = parseFlowMarkup("1. alpha\n2. beta\n10. kappa");
    expect(units.map((u) => u.marker)).toEqual(["1.", "2.", "10."]);
    expect(units.every((u) => u.kind === "number")).toBe(true);
    expect(unitText(units[2]!)).toBe("kappa");
  });

  it("parses bold inside a list item", () => {
    const units = parseFlowMarkup("- the **key** never leaves");
    expect(units[0]?.kind).toBe("bullet");
    expect(units[0]?.runs).toEqual([
      { text: "the ", bold: false },
      { text: "key", bold: true },
      { text: " never leaves", bold: false },
    ]);
  });

  it("mixes paragraphs and lists in one message", () => {
    const units = parseFlowMarkup(
      "Intro line.\n- item one\n- item two\nOutro.",
    );
    expect(units.map((u) => u.kind)).toEqual([
      "paragraph",
      "bullet",
      "bullet",
      "paragraph",
    ]);
  });

  it("leaves paraglide parameter braces intact in run text", () => {
    const units = parseFlowMarkup("Hello **{name}**, welcome.");
    expect(units[0]?.runs).toEqual([
      { text: "Hello ", bold: false },
      { text: "{name}", bold: true },
      { text: ", welcome.", bold: false },
    ]);
  });

  it("does not treat a decimal number mid-line as a numbered item", () => {
    const units = parseFlowMarkup("Version 2. released");
    // Leading "Version" means no numbered prefix; stays one paragraph.
    expect(units[0]?.kind).toBe("paragraph");
  });

  it("parses a link into a run with a link field", () => {
    const units = parseFlowMarkup("See [details](#login/credentials) here.");
    expect(units[0]?.runs).toEqual([
      { text: "See ", bold: false },
      { text: "details", bold: false, link: { target: "#login/credentials" } },
      { text: " here.", bold: false },
    ]);
  });

  it("parses multiple links in one line", () => {
    const units = parseFlowMarkup("[A](#sec/a) and [B](#sec/b)");
    expect(units[0]?.runs).toEqual([
      { text: "A", bold: false, link: { target: "#sec/a" } },
      { text: " and ", bold: false },
      { text: "B", bold: false, link: { target: "#sec/b" } },
    ]);
  });

  it("degrades malformed link without hash target to visible text", () => {
    // Non-hash URL: degrades to plain text
    const units = parseFlowMarkup("[text](http://example.com) visible.");
    expect(units[0]?.runs).toEqual([
      { text: "[text](http://example.com) visible.", bold: false },
    ]);
  });

  it("degrades bracket-only text without target to visible text", () => {
    const units = parseFlowMarkup("[text] without target.");
    expect(units[0]?.runs).toEqual([
      { text: "[text] without target.", bold: false },
    ]);
  });

  it("link text appears in unitText", () => {
    const units = parseFlowMarkup("See [details](#login/creds).");
    expect(unitText(units[0]!)).toBe("See details.");
  });

  it("mixes links and bold in one line (non-nesting)", () => {
    const units = parseFlowMarkup("**Bold** then [link](#target) then plain.");
    expect(units[0]?.runs).toEqual([
      { text: "Bold", bold: true },
      { text: " then ", bold: false },
      { text: "link", bold: false, link: { target: "#target" } },
      { text: " then plain.", bold: false },
    ]);
  });
});

describe("extractTags", () => {
  it("strips tag blocks and returns tag list", () => {
    const result = extractTags("Some text [[#encryption #privacy]] more.");
    expect(result.cleaned).toBe("Some text  more.");
    expect(result.tags).toEqual(["encryption", "privacy"]);
  });

  it("handles multiple tag blocks across lines", () => {
    const result = extractTags(
      "Line one [[#alpha]]\nLine two [[#beta #gamma]]",
    );
    expect(result.cleaned).toBe("Line one \nLine two ");
    expect(result.tags).toEqual(["alpha", "beta", "gamma"]);
  });

  it("returns empty tags when no tag blocks are present", () => {
    const result = extractTags("Plain text with no tags.");
    expect(result.cleaned).toBe("Plain text with no tags.");
    expect(result.tags).toEqual([]);
  });

  it("handles a single tag per block", () => {
    const result = extractTags("Body [[#metadata]]");
    expect(result.cleaned).toBe("Body ");
    expect(result.tags).toEqual(["metadata"]);
  });

  it("handles malformed [[ without closing ]] (degrades to visible text)", () => {
    const result = extractTags("Body [[ unclosed tag");
    expect(result.cleaned).toBe("Body [[ unclosed tag");
    expect(result.tags).toEqual([]);
  });

  it("ignores content inside tag block that is not a # token", () => {
    const result = extractTags("Body [[not-a-tag #valid]]");
    expect(result.cleaned).toBe("Body ");
    expect(result.tags).toEqual(["valid"]);
  });
});
