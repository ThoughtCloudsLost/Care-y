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

const UI_THEME_KEY = "care-y-theme";
const COLOR_SCHEME_KEY = "care-y-color-scheme";
const DEFAULT_UI_THEME: KonstaTheme = "ios";
const DEFAULT_COLOR_SCHEME: ColorScheme = "dark";

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
}

export interface ThemeStore {
  readonly uiTheme: KonstaTheme;
  readonly resolvedScheme: "dark" | "light";
  readonly colorSchemePreference: ColorScheme;
  readonly current: KonstaTheme;

  setUiTheme(theme: KonstaTheme): void;
  setColorScheme(scheme: ColorScheme): void;
  toggleColorScheme(): void;
  toggle(): void;
}

function createThemeStore(): ThemeStore {
  const state = $state({
    uiTheme: DEFAULT_UI_THEME,
    colorPref: DEFAULT_COLOR_SCHEME,
    resolved: "dark" as "dark" | "light",
  });

  const darkQuery =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

  state.resolved = resolveScheme(DEFAULT_COLOR_SCHEME, darkQuery);

  // Hydrate from localStorage (browser only)
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

    state.resolved = resolveScheme(state.colorPref, darkQuery);
    applyScheme(state.resolved);
  }

  function persistAndApply(scheme: ColorScheme): void {
    state.colorPref = scheme;
    state.resolved = resolveScheme(scheme, darkQuery);
    applyScheme(state.resolved);
    if (typeof window !== "undefined") {
      localStorage.setItem(COLOR_SCHEME_KEY, scheme);
    }
  }

  // Track OS theme changes when preference is 'system'
  if (darkQuery) {
    darkQuery.addEventListener("change", () => {
      if (state.colorPref === "system") {
        persistAndApply("system");
      }
    });
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
    get current(): KonstaTheme {
      return state.uiTheme;
    },

    setUiTheme(theme: KonstaTheme): void {
      state.uiTheme = theme;
      if (typeof window !== "undefined") {
        localStorage.setItem(UI_THEME_KEY, theme);
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
