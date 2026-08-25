import { describe, it, expect, beforeEach } from "vitest";
import { themeStore } from "./theme.svelte.js";

function htmlClasses(): DOMTokenList {
  return document.documentElement.classList;
}

describe("theme store stub", () => {
  beforeEach(() => {
    // Reset to the demo default (dark) between tests.
    themeStore.setColorScheme("dark");
  });

  it("has uiTheme fixed to ios", () => {
    expect(themeStore.uiTheme).toBe("ios");
  });

  it("current aliases uiTheme", () => {
    expect(themeStore.current).toBe("ios");
  });

  it("visualTheme is default", () => {
    expect(themeStore.visualTheme).toBe("default");
  });

  it("glassMode is auto", () => {
    expect(themeStore.glassMode).toBe("auto");
  });

  it("defaults resolvedScheme to dark", () => {
    expect(themeStore.resolvedScheme).toBe("dark");
    expect(themeStore.colorSchemePreference).toBe("dark");
  });

  it("setColorScheme updates resolvedScheme and html classes", () => {
    themeStore.setColorScheme("light");
    expect(themeStore.resolvedScheme).toBe("light");
    expect(htmlClasses().contains("light")).toBe(true);
    expect(htmlClasses().contains("glass-light")).toBe(true);
    expect(htmlClasses().contains("dark")).toBe(false);
    expect(htmlClasses().contains("glass-dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("toggleColorScheme flips the scheme both ways", () => {
    themeStore.toggleColorScheme();
    expect(themeStore.resolvedScheme).toBe("light");
    themeStore.toggleColorScheme();
    expect(themeStore.resolvedScheme).toBe("dark");
    expect(htmlClasses().contains("dark")).toBe(true);
  });

  it("setColorScheme with system keeps the current scheme", () => {
    themeStore.setColorScheme("light");
    themeStore.setColorScheme("system");
    expect(themeStore.resolvedScheme).toBe("light");
    expect(themeStore.colorSchemePreference).toBe("light");
  });

  it("non-scheme setters are no-ops (do not throw, values stay pinned)", () => {
    expect(() => {
      themeStore.setUiTheme("material");
    }).not.toThrow();
    expect(() => {
      themeStore.setVisualTheme("riso");
    }).not.toThrow();
    expect(() => {
      themeStore.setGlassMode("dark");
    }).not.toThrow();
    expect(() => {
      themeStore.toggle();
    }).not.toThrow();

    expect(themeStore.uiTheme).toBe("ios");
    expect(themeStore.visualTheme).toBe("default");
    expect(themeStore.glassMode).toBe("auto");
  });
});
