/**
 * Stub for $lib/stores/theme.svelte.
 *
 * The real store reads localStorage, writes document.documentElement
 * classes, and binds media queries at module scope. The demo cannot use
 * it directly: persistence and system-scheme tracking belong to the
 * outer page, not the phone.
 *
 * This stub keeps the same surface but owns a single reactive scheme
 * value for the phone document. Both scheme paths flow through it:
 * the outer page's handbook toggle (via bridge.setDark in PhoneApp)
 * and the in-app settings row (via toggleColorScheme). Scheme setters
 * apply the html-level classes themselves, mirroring the product's
 * applyScheme/applyGlassMode; inside the iframe, documentElement IS
 * the phone document root. Non-scheme setters (uiTheme, visualTheme,
 * glassMode) stay no-ops: the demo pins those.
 */

import type {
  ThemeStore,
  KonstaTheme,
  ColorScheme,
  VisualTheme,
  GlassMode,
} from "./theme-types.js";

export type { ColorScheme, KonstaTheme, GlassMode, VisualTheme, ThemeStore };

/**
 * Initial scheme comes from the class the blocking scheme script (or
 * the outer page's first setDark) already put on <html>. Dark is the
 * demo default when neither class is present.
 */
function readBootScheme(): "dark" | "light" {
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

let scheme = $state<"dark" | "light">(readBootScheme());

/**
 * Preserves existing theme-* classes (set by the blocking scheme
 * script). Glass styles are anchored to html-level classes, so scheme
 * classes must live on documentElement.
 */
function applyScheme(next: "dark" | "light"): void {
  const isDark = next === "dark";
  const cl = document.documentElement.classList;
  cl.toggle("dark", isDark);
  cl.toggle("light", !isDark);
  cl.toggle("glass-dark", isDark);
  cl.toggle("glass-light", !isDark);
  document.documentElement.style.colorScheme = next;
}

function setScheme(next: "dark" | "light"): void {
  scheme = next;
  applyScheme(next);
}

const demoThemeStore: ThemeStore = {
  get uiTheme(): KonstaTheme {
    return "ios";
  },
  get resolvedScheme(): "dark" | "light" {
    return scheme;
  },
  get colorSchemePreference(): ColorScheme {
    return scheme;
  },
  get visualTheme(): VisualTheme {
    return "default";
  },
  get glassMode(): GlassMode {
    return "auto";
  },
  get current(): KonstaTheme {
    return "ios";
  },

  setUiTheme(_theme: KonstaTheme): void {
    // No-op: the demo pins the iOS shell theme.
  },
  setColorScheme(next: ColorScheme): void {
    // "system" has no media-query tracking in the demo; treat it as
    // "keep the current scheme" rather than guessing.
    if (next === "system") return;
    setScheme(next);
  },
  setVisualTheme(_theme: VisualTheme): void {
    // No-op: the demo pins the default visual theme.
  },
  setGlassMode(_mode: GlassMode): void {
    // No-op: the demo pins auto glass.
  },
  toggleColorScheme(): void {
    setScheme(scheme === "dark" ? "light" : "dark");
  },
  toggle(): void {
    // The product's toggle() flips uiTheme (ios/material), which the
    // demo pins. No-op.
  },
};

export const themeStore: ThemeStore = demoThemeStore;
