import { describe, it, expect } from "vitest";
import {
  getReactiveLocale,
  setReactiveLocale,
  installReactiveLocale,
} from "./locale-state.svelte.js";

// The real runtime is aliased in tests to the stub via the vitest
// config's alias table. installReactiveLocale calls overwriteGetLocale
// on the real runtime, so we verify the public API surface here.

describe("locale-state", () => {
  it("getReactiveLocale returns a string locale", () => {
    const locale = getReactiveLocale();
    expect(typeof locale).toBe("string");
    expect(locale.length).toBeGreaterThan(0);
  });

  it("setReactiveLocale updates the value returned by getReactiveLocale", () => {
    setReactiveLocale("es");
    expect(getReactiveLocale()).toBe("es");

    // Reset to base
    setReactiveLocale("en");
    expect(getReactiveLocale()).toBe("en");
  });

  it("setReactiveLocale ignores invalid locale strings", () => {
    const before = getReactiveLocale();
    setReactiveLocale("xx-invalid");
    expect(getReactiveLocale()).toBe(before);
  });

  it("installReactiveLocale is callable without throwing", () => {
    // installReactiveLocale calls overwriteGetLocale on the real runtime.
    // In the test environment, the runtime is the stub (or real compiled
    // output). Either way, calling it should not throw.
    expect(() => {
      installReactiveLocale();
    }).not.toThrow();
  });
});
