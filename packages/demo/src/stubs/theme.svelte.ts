/**
 * Stub for $lib/stores/theme.svelte.
 *
 * The real store reads localStorage, writes document.documentElement
 * classes, and binds media queries at module scope. In the demo that
 * themes the entire browser page and fights the demo's own dark toggle.
 *
 * This stub exposes the same read surface (AppShell reads uiTheme,
 * resolvedScheme, current, visualTheme, glassMode, colorSchemePreference)
 * as static values. Setters are no-ops. No DOM writes, no localStorage.
 */

import type {
  ThemeStore,
  KonstaTheme,
  ColorScheme,
  VisualTheme,
  GlassMode,
} from "./theme-types.js";

export type { ColorScheme, KonstaTheme, GlassMode, VisualTheme, ThemeStore };

const demoThemeStore: ThemeStore = {
  get uiTheme(): KonstaTheme {
    return "ios";
  },
  get resolvedScheme(): "dark" | "light" {
    return "dark";
  },
  get colorSchemePreference(): ColorScheme {
    return "dark";
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
    // No-op: the demo does not persist theme preferences.
  },
  setColorScheme(_scheme: ColorScheme): void {
    // No-op: the demo does not persist theme preferences.
  },
  setVisualTheme(_theme: VisualTheme): void {
    // No-op: the demo does not persist theme preferences.
  },
  setGlassMode(_mode: GlassMode): void {
    // No-op: the demo does not persist theme preferences.
  },
  toggleColorScheme(): void {
    // No-op: the demo does not persist theme preferences.
  },
  toggle(): void {
    // No-op: the demo does not persist theme preferences.
  },
};

export const themeStore: ThemeStore = demoThemeStore;
