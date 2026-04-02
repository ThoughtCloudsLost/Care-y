/**
 * Theme store managing two orthogonal preferences:
 * - uiTheme: Konsta UI framework (ios/material)
 * - colorScheme: dark/light/system with media query tracking
 *
 * Persists preferences to localStorage. The color scheme preference
 * (not the resolved value) is stored so 'system' can re-resolve on
 * OS theme changes.
 */

export type ColorScheme = "dark" | "light" | "system";
export type KonstaTheme = "ios" | "material";
export type GlassMode = "auto" | "light" | "dark";
export type VisualTheme =
  | "riso"
  | "default"
  | "frutiger"
  | "brutalist"
  | "cupertino";

const UI_THEME_KEY = "care-y-theme";
const COLOR_SCHEME_KEY = "care-y-color-scheme";
const VISUAL_THEME_KEY = "care-y-visual-theme";
const GLASS_MODE_KEY = "care-y-glass-mode";

function detectUiTheme(): KonstaTheme {
  if (typeof navigator === "undefined") return "ios";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "material";
  return "ios";
}

const DEFAULT_UI_THEME: KonstaTheme = detectUiTheme();
const DEFAULT_COLOR_SCHEME: ColorScheme = "dark";
const DEFAULT_VISUAL_THEME: VisualTheme = "default";

function resolveScheme(
  pref: ColorScheme,
  darkQuery: MediaQueryList | null,
): "dark" | "light" {
  if (pref === "system") {
    if (darkQuery === null) return "light";
    return darkQuery.matches ? "dark" : "light";
  }
  return pref;
}

function applyScheme(resolved: "dark" | "light"): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.classList.toggle("light", resolved === "light");
  document.documentElement.style.colorScheme = resolved;
}

function applyGlassMode(mode: GlassMode, resolved: "dark" | "light"): void {
  if (typeof document === "undefined") return;
  const effective = mode === "auto" ? resolved : mode;
  document.documentElement.classList.toggle(
    "glass-light",
    effective === "light",
  );
  document.documentElement.classList.toggle("glass-dark", effective === "dark");
}

let activeVisualClass = "";

function applyVisualTheme(theme: VisualTheme): void {
  if (typeof document === "undefined") return;
  const newClass = `theme-${theme}`;
  const cl = document.documentElement.classList;
  if (activeVisualClass !== "" && activeVisualClass !== newClass) {
    cl.replace(activeVisualClass, newClass);
  } else {
    cl.add(newClass);
  }
  activeVisualClass = newClass;
}

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

function createThemeStore(): ThemeStore {
  const state = $state({
    uiTheme: DEFAULT_UI_THEME,
    colorPref: DEFAULT_COLOR_SCHEME,
    resolved: "dark" as "dark" | "light",
    visual: DEFAULT_VISUAL_THEME,
    glass: "auto" as GlassMode,
  });

  let darkQuery: MediaQueryList | null = null;

  function ensureDarkQuery(): MediaQueryList | null {
    if (darkQuery === null && typeof window !== "undefined") {
      darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      darkQuery.addEventListener("change", () => {
        if (state.colorPref === "system") {
          persistAndApply("system");
        }
      });
    }
    return darkQuery;
  }

  state.resolved = resolveScheme(DEFAULT_COLOR_SCHEME, ensureDarkQuery());

  if (typeof window !== "undefined") {
    const storedUi = localStorage.getItem(UI_THEME_KEY);
    if (storedUi === "ios" || storedUi === "material") {
      state.uiTheme = storedUi;
    }

    const storedScheme = localStorage.getItem(COLOR_SCHEME_KEY);
    if (
      storedScheme === "dark" ||
      storedScheme === "light" ||
      storedScheme === "system"
    ) {
      state.colorPref = storedScheme;
    }

    // Visual theme only hydrates from localStorage in dev mode.
    // In production, visual theme is controlled by org config (not yet wired).
    if (import.meta.env.DEV) {
      const storedVisual = localStorage.getItem(VISUAL_THEME_KEY);
      if (
        storedVisual === "riso" ||
        storedVisual === "default" ||
        storedVisual === "frutiger" ||
        storedVisual === "brutalist" ||
        storedVisual === "cupertino"
      ) {
        state.visual = storedVisual;
      }

      const storedGlass = localStorage.getItem(GLASS_MODE_KEY);
      if (
        storedGlass === "auto" ||
        storedGlass === "light" ||
        storedGlass === "dark"
      ) {
        state.glass = storedGlass;
      }
    }

    state.resolved = resolveScheme(state.colorPref, ensureDarkQuery());
    applyScheme(state.resolved);
    applyVisualTheme(state.visual);
    applyGlassMode(state.glass, state.resolved);
  }

  function persistAndApply(scheme: ColorScheme): void {
    state.colorPref = scheme;
    state.resolved = resolveScheme(scheme, ensureDarkQuery());
    applyScheme(state.resolved);
    applyGlassMode(state.glass, state.resolved);
    if (typeof window !== "undefined") {
      localStorage.setItem(COLOR_SCHEME_KEY, scheme);
    }
  }

  return {
    get uiTheme(): KonstaTheme {
      return state.uiTheme;
    },
    get resolvedScheme(): "dark" | "light" {
      return state.resolved;
    },
    get colorSchemePreference(): ColorScheme {
      return state.colorPref;
    },
    get visualTheme(): VisualTheme {
      return state.visual;
    },
    get glassMode(): GlassMode {
      return state.glass;
    },
    get current(): KonstaTheme {
      return state.uiTheme;
    },

    setUiTheme(theme: KonstaTheme): void {
      state.uiTheme = theme;
      if (typeof window !== "undefined") {
        localStorage.setItem(UI_THEME_KEY, theme);
      }
    },
    setVisualTheme(theme: VisualTheme): void {
      state.visual = theme;
      applyVisualTheme(theme);
      if (typeof window !== "undefined" && import.meta.env.DEV) {
        localStorage.setItem(VISUAL_THEME_KEY, theme);
      }
    },
    setGlassMode(mode: GlassMode): void {
      state.glass = mode;
      applyGlassMode(mode, state.resolved);
      if (typeof window !== "undefined" && import.meta.env.DEV) {
        localStorage.setItem(GLASS_MODE_KEY, mode);
      }
    },
    setColorScheme(scheme: ColorScheme): void {
      persistAndApply(scheme);
    },
    toggleColorScheme(): void {
      persistAndApply(state.resolved === "dark" ? "light" : "dark");
    },
    toggle(): void {
      this.setUiTheme(state.uiTheme === "ios" ? "material" : "ios");
    },
  };
}

export const themeStore = createThemeStore();
