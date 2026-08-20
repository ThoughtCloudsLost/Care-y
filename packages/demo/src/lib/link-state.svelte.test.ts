import { describe, it, expect } from "vitest";
import { isLinked, toggleLinked, resetLinked } from "./link-state.svelte.js";

describe("link-state", () => {
  // Reset before each test so module-level state is predictable
  it("defaults to linked", () => {
    resetLinked();
    expect(isLinked()).toBe(true);
  });

  it("toggleLinked flips from linked to unlinked", () => {
    resetLinked();
    toggleLinked();
    expect(isLinked()).toBe(false);
  });

  it("toggleLinked flips back to linked", () => {
    resetLinked();
    toggleLinked();
    toggleLinked();
    expect(isLinked()).toBe(true);
  });

  it("resetLinked restores the linked state", () => {
    resetLinked();
    toggleLinked();
    expect(isLinked()).toBe(false);
    resetLinked();
    expect(isLinked()).toBe(true);
  });

  it("multiple toggles cycle correctly", () => {
    resetLinked();
    toggleLinked(); // false
    toggleLinked(); // true
    toggleLinked(); // false
    expect(isLinked()).toBe(false);
    toggleLinked(); // true
    expect(isLinked()).toBe(true);
  });
});
