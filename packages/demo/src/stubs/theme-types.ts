/**
 * Type definitions for the theme store stub.
 *
 * Mirrors the exported types from the real theme.svelte.ts so that
 * consumers importing types through the stub get the same shapes.
 */

export type ColorScheme = "dark" | "light" | "system";
export type KonstaTheme = "ios" | "material";
export type GlassMode = "auto" | "light" | "dark";
export type VisualTheme =
  "riso" | "default" | "frutiger" | "brutalist" | "cupertino" | "prism";

export interface ThemeStore {
  readonly uiTheme: KonstaTheme;
  readonly resolvedScheme: "dark" | "light";
  readonly colorSchemePreference: ColorScheme;
  readonly visualTheme: VisualTheme;
  readonly glassMode: GlassMode;
  readonly current: KonstaTheme;

  setUiTheme(theme: KonstaTheme): void;
  setColorScheme(scheme: ColorScheme): void;
  setVisualTheme(theme: VisualTheme): void;
  setGlassMode(mode: GlassMode): void;
  toggleColorScheme(): void;
  toggle(): void;
}
