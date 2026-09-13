// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { uiLocaleStore } from "./ui-locale.svelte.js";

describe("uiLocaleStore", () => {
  beforeEach(() => {
    // Reset to the base locale between tests
    uiLocaleStore.set("en");
  });

  it("initializes to the base locale", () => {
    expect(uiLocaleStore.locale).toBe("en");
  });

  it("updates when set() is called", () => {
    uiLocaleStore.set("es");
    expect(uiLocaleStore.locale).toBe("es");
  });

  it("reads the new value after a second set()", () => {
    uiLocaleStore.set("es");
    uiLocaleStore.set("en");
    expect(uiLocaleStore.locale).toBe("en");
  });
});
