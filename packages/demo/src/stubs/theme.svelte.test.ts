import { describe, it, expect } from "vitest";
import { themeStore } from "./theme.svelte.js";

describe("theme store stub", () => {
  it("has uiTheme fixed to ios", () => {
    expect(themeStore.uiTheme).toBe("ios");
  });

  it("has resolvedScheme fixed to dark", () => {
    expect(themeStore.resolvedScheme).toBe("dark");
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

  it("setters are no-ops (do not throw)", () => {
    expect(() => {
      themeStore.setUiTheme("material");
    }).not.toThrow();
    expect(() => {
      themeStore.setColorScheme("light");
    }).not.toThrow();
    expect(() => {
      themeStore.setVisualTheme("riso");
    }).not.toThrow();
    expect(() => {
      themeStore.setGlassMode("dark");
    }).not.toThrow();
    expect(() => {
      themeStore.toggleColorScheme();
    }).not.toThrow();
    expect(() => {
      themeStore.toggle();
    }).not.toThrow();

    // Values remain fixed after setter calls
    expect(themeStore.uiTheme).toBe("ios");
    expect(themeStore.resolvedScheme).toBe("dark");
  });
});
