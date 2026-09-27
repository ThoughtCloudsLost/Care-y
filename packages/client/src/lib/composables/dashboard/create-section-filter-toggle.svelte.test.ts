// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  createSectionFilterToggle,
  type SectionFilterToggle,
} from "./create-section-filter-toggle.svelte.js";

let active = $state(0);
let ready = $state(false);

let destroy: (() => void) | undefined;

function createToggle(): SectionFilterToggle {
  const box: { toggle?: SectionFilterToggle } = {};
  destroy = $effect.root(() => {
    box.toggle = createSectionFilterToggle(
      "activity-filters",
      () => active,
      () => ready,
    );
  });
  flushSync();
  if (!box.toggle) throw new Error("toggle did not initialize");
  return box.toggle;
}

/** Marks the section's saved filters applied. */
function markReady(): void {
  ready = true;
  flushSync();
}

afterEach(() => {
  destroy?.();
  destroy = undefined;
  active = 0;
  ready = false;
});

describe("createSectionFilterToggle", () => {
  it("starts closed and hidden with no active filters", () => {
    const toggle = createToggle();
    markReady();
    expect(toggle.rowId).toBe("activity-filters");
    expect(toggle.open).toBe(false);
    expect(toggle.shown).toBe(false);
  });

  it("shows the row exactly while open", () => {
    const toggle = createToggle();
    toggle.toggle();
    flushSync();
    expect(toggle.open).toBe(true);
    expect(toggle.shown).toBe(true);

    toggle.toggle();
    flushSync();
    expect(toggle.open).toBe(false);
    expect(toggle.shown).toBe(false);
  });

  it("starts open when the section has active filters once they are ready", () => {
    const toggle = createToggle();
    active = 2;
    flushSync();
    expect(toggle.open).toBe(false);

    markReady();
    expect(toggle.open).toBe(true);
    expect(toggle.shown).toBe(true);
  });

  it("reads the count applied in the same update that marks it ready", () => {
    const toggle = createToggle();
    // Stands in for a lane that applies its saved filters, then signals.
    active = 1;
    markReady();
    expect(toggle.open).toBe(true);
  });

  it("closes from the button even while filters are active", () => {
    const toggle = createToggle();
    active = 1;
    markReady();
    expect(toggle.open).toBe(true);

    toggle.toggle();
    flushSync();
    expect(toggle.open).toBe(false);
    expect(toggle.shown).toBe(false);
  });

  it("ignores filters that change after they are ready", () => {
    const toggle = createToggle();
    markReady();

    active = 1;
    flushSync();
    expect(toggle.open).toBe(false);

    toggle.toggle();
    flushSync();
    active = 0;
    flushSync();
    expect(toggle.open).toBe(true);
  });

  it("keeps the button's choice made before the filters are ready", () => {
    const toggle = createToggle();
    toggle.toggle();
    toggle.toggle();
    active = 1;
    markReady();
    expect(toggle.open).toBe(false);
  });

  it("opens at most once, even if readiness drops and returns", () => {
    const toggle = createToggle();
    markReady();
    active = 1;
    ready = false;
    flushSync();
    markReady();
    expect(toggle.open).toBe(false);
  });
});
