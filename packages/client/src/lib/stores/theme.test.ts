// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// The theme store is a module-level singleton that reads localStorage
// and matchMedia on import. We need to set up the mocks before importing it.

function setupMocks(options?: {
  storedUiTheme?: string | null;
  storedColorScheme?: string | null;
  prefersDark?: boolean;
}): { mediaListeners: Array<() => void> } {
  const {
    storedUiTheme = null,
    storedColorScheme = null,
    prefersDark = true,
  } = options ?? {};

  const storage = new Map<string, string>();
  if (storedUiTheme) storage.set("care-y-theme", storedUiTheme);
  if (storedColorScheme) storage.set("care-y-color-scheme", storedColorScheme);

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });

  const mediaListeners: Array<() => void> = [];
  const darkMatches = prefersDark;

  vi.stubGlobal("matchMedia", (query: string) => {
    if (query === "(prefers-color-scheme: dark)") {
      return {
        get matches() {
          return darkMatches;
        },
        addEventListener: (_event: string, cb: () => void) => {
          mediaListeners.push(cb);
        },
        removeEventListener: vi.fn(),
      };
    }
    return {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  // Provide a minimal classList on documentElement
  const classes = new Set<string>(["dark"]);
  Object.defineProperty(document.documentElement, "classList", {
    value: {
      toggle: (name: string, force: boolean) => {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      contains: (name: string) => classes.has(name),
    },
    configurable: true,
  });

  return {
    mediaListeners,
  };
}

describe("themeStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("defaults to dark color scheme and ios UI theme", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.resolvedScheme).toBe("dark");
    expect(themeStore.uiTheme).toBe("ios");
    expect(themeStore.colorSchemePreference).toBe("dark");
  });

  it("hydrates from localStorage", async () => {
    setupMocks({ storedUiTheme: "material", storedColorScheme: "light" });
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.uiTheme).toBe("material");
    expect(themeStore.resolvedScheme).toBe("light");
    expect(themeStore.colorSchemePreference).toBe("light");
  });

  it("setColorScheme persists preference and updates resolved", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    themeStore.setColorScheme("light");
    expect(themeStore.resolvedScheme).toBe("light");
    expect(themeStore.colorSchemePreference).toBe("light");
    expect(localStorage.getItem("care-y-color-scheme")).toBe("light");
  });

  it("toggleColorScheme flips between dark and light", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.resolvedScheme).toBe("dark");
    themeStore.toggleColorScheme();
    expect(themeStore.resolvedScheme).toBe("light");
    themeStore.toggleColorScheme();
    expect(themeStore.resolvedScheme).toBe("dark");
  });

  it("system preference resolves based on OS dark mode", async () => {
    setupMocks({ prefersDark: false });
    const { themeStore } = await import("./theme.svelte.ts");
    themeStore.setColorScheme("system");
    expect(themeStore.resolvedScheme).toBe("light");
    expect(themeStore.colorSchemePreference).toBe("system");
  });

  it("setUiTheme persists and updates", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    themeStore.setUiTheme("material");
    expect(themeStore.uiTheme).toBe("material");
    expect(localStorage.getItem("care-y-theme")).toBe("material");
  });

  it("toggle switches UI theme", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.current).toBe("ios");
    themeStore.toggle();
    expect(themeStore.current).toBe("material");
  });

  it("applies dark/light class to document element", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    themeStore.setColorScheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("defaults to 'default' visual theme", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.visualTheme).toBe("default");
  });

  it("applies visual theme class to document element on init", async () => {
    setupMocks();
    await import("./theme.svelte.ts");
    expect(document.documentElement.classList.contains("theme-default")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-riso")).toBe(
      false,
    );
  });

  it("setVisualTheme switches theme and applies class", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.visualTheme).toBe("default");
    themeStore.setVisualTheme("riso");
    expect(themeStore.visualTheme).toBe("riso");
    expect(document.documentElement.classList.contains("theme-riso")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-default")).toBe(
      false,
    );
  });

  it("setVisualTheme applies frutiger class and removes others", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    themeStore.setVisualTheme("frutiger");
    expect(themeStore.visualTheme).toBe("frutiger");
    expect(document.documentElement.classList.contains("theme-frutiger")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-default")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-riso")).toBe(
      false,
    );
  });

  it("hydrates frutiger visual theme from localStorage", async () => {
    setupMocks();
    // Manually set visual theme in storage before import
    localStorage.setItem("care-y-visual-theme", "frutiger");
    // Need to re-import to pick up the stored value
    vi.resetModules();
    // Re-setup mocks with the stored value intact
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => {
        if (key === "care-y-visual-theme") return "frutiger";
        return null;
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.visualTheme).toBe("frutiger");
  });

  it("setVisualTheme applies brutalist class and removes others", async () => {
    setupMocks();
    const { themeStore } = await import("./theme.svelte.ts");
    themeStore.setVisualTheme("brutalist");
    expect(themeStore.visualTheme).toBe("brutalist");
    expect(document.documentElement.classList.contains("theme-brutalist")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-default")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-riso")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-frutiger")).toBe(
      false,
    );
  });

  it("hydrates brutalist visual theme from localStorage", async () => {
    setupMocks();
    vi.resetModules();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => {
        if (key === "care-y-visual-theme") return "brutalist";
        return null;
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const { themeStore } = await import("./theme.svelte.ts");
    expect(themeStore.visualTheme).toBe("brutalist");
  });
});
