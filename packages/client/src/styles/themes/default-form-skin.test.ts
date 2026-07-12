// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { List, ListInput } from "konsta/svelte";
import FormSkinFixture from "./default-form-skin.fixture.svelte";

// Selector contract for the Inkwell form skin in default.css.
//
// The skin styles Konsta ListInput internals through structural selectors
// (element names plus two konsta@5.0.7 class fragments). Testing-reference
// anti-pattern 14 bans .k-* selectors in E2E tests because they are
// implementation details; this file exists for the opposite reason: the
// theme CSS deliberately binds to those internals, so each selector the
// CSS uses is pinned here. If a Konsta upgrade breaks one of these
// assertions, update the matching rule in default.css in the same change.

afterEach(cleanup);

interface FixtureProps {
  textLabel: string;
  textPlaceholder: string;
  infoText: string;
  areaLabel: string;
  selectLabel: string;
  segmentOne: string;
  segmentTwo: string;
  error?: string;
  outline?: boolean;
}

const BASE_PROPS: FixtureProps = {
  textLabel: "Text label",
  textPlaceholder: "Text placeholder",
  infoText: "Help text",
  areaLabel: "Area label",
  selectLabel: "Select label",
  segmentOne: "First segment",
  segmentTwo: "Second segment",
};

function renderFixture(overrides: Partial<FixtureProps> = {}): HTMLElement {
  const { container } = render(FormSkinFixture, {
    props: { ...BASE_PROPS, ...overrides },
  });
  return container;
}

describe("default.css form skin selector contract (konsta ListInput DOM)", () => {
  it("marks the root li with k-list-input and k-list-item", () => {
    const c = renderFixture();
    const li = c.querySelector("li.k-list-input");
    expect(li).not.toBeNull();
    expect(li?.classList.contains("k-list-item")).toBe(true);
  });

  it("exposes input, textarea, and select elements under .k-list-input", () => {
    const c = renderFixture();
    expect(c.querySelector(".k-list-input input")).not.toBeNull();
    expect(c.querySelector(".k-list-input textarea")).not.toBeNull();
    expect(c.querySelector(".k-list-input select")).not.toBeNull();
  });

  it("renders the stacked label as the only .duration-200.text-xs div", () => {
    const c = renderFixture();
    const labels = c.querySelectorAll(".k-list-input .duration-200.text-xs");
    expect(labels.length).toBeGreaterThan(0);
    const label = labels[0];
    expect(label?.textContent).toContain("Text label");
    // The eyebrow selector must never also catch the info/error line.
    for (const el of labels) {
      expect(el.classList.contains("z-10")).toBe(false);
    }
  });

  it("renders info text as .text-xs.z-10 with .opacity-50", () => {
    const c = renderFixture();
    const info = c.querySelector(".k-list-input .text-xs.z-10.opacity-50");
    expect(info).not.toBeNull();
    expect(info?.textContent).toContain("Help text");
  });

  it("renders error text as .text-xs.z-10 with .text-red-500", () => {
    const c = renderFixture({ error: "Something is wrong" });
    // Konsta also recolors the LABEL with text-red-500 in error state, so
    // the message line is the .z-10 match (label recoloring rides the same
    // --danger re-point, which is the conventional error-field look).
    const error = c.querySelector(".k-list-input .text-red-500.z-10");
    expect(error).not.toBeNull();
    expect(error?.textContent).toContain("Something is wrong");
    // :has(.text-red-500) drives the danger border on the box.
    expect(c.querySelector(".k-list-input:has(.text-red-500)")).not.toBeNull();
  });

  it("keeps the border/underline span matchable for the hider rule", () => {
    // The skin hides Konsta's decorative border spans with
    // span.pointer-events-none.absolute.w-full. Konsta only renders the
    // span in outline mode (or material underline); assert the selector
    // still matches that span so the hider keeps working.
    const c = renderFixture({ outline: true });
    const span = c.querySelector(
      ".k-list-input span.pointer-events-none.absolute.w-full",
    );
    expect(span).not.toBeNull();
  });

  it("wraps each field element in a div the inputWrap reset can target", () => {
    const c = renderFixture();
    const wrap = c.querySelector(
      ".k-list-input div:has(> input), .k-list-input div:has(> textarea)",
    );
    expect(wrap).not.toBeNull();
  });

  it("keeps k-list on the list wrapper for the form-flattening rule", () => {
    const c = renderFixture();
    const list = c.querySelector(".k-list");
    expect(list).not.toBeNull();
    expect(list?.querySelector(".k-list-input")).not.toBeNull();
  });
});

describe("default.css segmented skin selector contract (konsta Segmented DOM)", () => {
  it("marks the container with k-segmented and buttons with k-button", () => {
    const c = renderFixture();
    const seg = c.querySelector(".k-segmented");
    expect(seg).not.toBeNull();
    expect(seg?.querySelectorAll(".k-button").length).toBe(2);
  });

  it("marks the active strong button with k-segmented-strong-button-active", () => {
    const c = renderFixture();
    const active = c.querySelector(
      ".k-segmented .k-segmented-strong-button-active",
    );
    expect(active).not.toBeNull();
    expect(active?.textContent).toContain("First segment");
  });

  it("keeps the strong sliding thumb matchable for the hider rule", () => {
    const c = renderFixture();
    const thumb = c.querySelector(
      ".k-segmented > span.pointer-events-none.absolute",
    );
    expect(thumb).not.toBeNull();
  });
});

// Konsta must stay importable for the fixture; guard against tree-shaken
// re-exports silently emptying the module.
describe("konsta/svelte exports used by the fixture", () => {
  it("exports List and ListInput components", () => {
    expect(List).toBeTruthy();
    expect(ListInput).toBeTruthy();
  });
});
