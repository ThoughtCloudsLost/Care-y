/**
 * Theme store for Konsta UI iOS/Material theme switching.
 * Persists user preference to localStorage.
 */

type KonstaTheme = "ios" | "material";

const STORAGE_KEY = "care-y-theme";
const DEFAULT_THEME: KonstaTheme = "ios";

function createThemeStore(): {
  readonly current: KonstaTheme;
  toggle: () => void;
} {
  let theme = $state<KonstaTheme>(DEFAULT_THEME);

  // Hydrate from localStorage on first access (browser only)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ios" || stored === "material") {
      theme = stored;
    }
  }

  return {
    get current(): KonstaTheme {
      return theme;
    },
    toggle(): void {
      theme = theme === "ios" ? "material" : "ios";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    },
  };
}

export const themeStore = createThemeStore();
