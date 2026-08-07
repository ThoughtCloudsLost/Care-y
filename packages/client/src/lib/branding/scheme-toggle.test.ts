// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// Mock the Material Color Utilities dynamic import (same approach as
// konsta-palette.test.ts). The palette pass is observed through the brand
// CSS custom properties; the library's color math is not under test.
//
// mock-factory-unguarded: intentional. importOriginal cannot be used because
// @material/material-color-utilities@0.4.0 has internal bare-specifier imports
// (color_spec_2025.js -> './dynamic_color') that fail ERR_MODULE_NOT_FOUND
// under Vitest's mock interception. See konsta-palette.test.ts for the
// documented incident.
vi.mock("@material/material-color-utilities", () => {
  const fakeColor = (name: string) => ({
    name,
    getArgb: () => 0xff336699,
  });
  const fakeAllColors = [
    fakeColor("primary"),
    fakeColor("on_primary"),
    fakeColor("surface_container"),
  ];

  class MockSchemeTonalSpot {
    colors = { allColors: fakeAllColors };
  }

  // importOriginal unusable: the package's internal ESM imports use bare
  // specifiers that fail under Vitest's mock interception (ERR_MODULE_NOT_FOUND).
  // This typed shape tracks the four exports destructured in konsta-palette.ts:256.
  const _usedExports = null! as {
    argbFromHex: unknown;
    Hct: unknown;
    SchemeTonalSpot: unknown;
    hexFromArgb: unknown;
  };
  void _usedExports;

  return {
    argbFromHex: () => 0xff000000,
    Hct: { fromInt: () => ({}) },
    SchemeTonalSpot: MockSchemeTonalSpot,
    hexFromArgb: () => "#336699",
  } satisfies typeof _usedExports;
});

const DARK_QUERY = "(prefers-color-scheme: dark)";

type SchemeChangeListener = (event: {
  matches: boolean;
  media: string;
}) => void;

/**
 * Controllable matchMedia stub. Stubs exactly one layer: the platform
 * media query boundary. setMatches() flips the reported value and fires
 * registered "change" listeners, like an OS scheme switch.
 */
function createMatchMediaStub(): {
  matchMedia: (query: string) => MediaQueryList;
  setMatches: (value: boolean) => void;
} {
  let matches = false;
  const listeners = new Set<SchemeChangeListener>();
  const mql = {
    get matches(): boolean {
      return matches;
    },
    media: DARK_QUERY,
    onchange: null,
    addEventListener(type: string, listener: SchemeChangeListener): void {
      if (type === "change") listeners.add(listener);
    },
    removeEventListener(_type: string, listener: SchemeChangeListener): void {
      listeners.delete(listener);
    },
    addListener(listener: SchemeChangeListener): void {
      listeners.add(listener);
    },
    removeListener(listener: SchemeChangeListener): void {
      listeners.delete(listener);
    },
    dispatchEvent(): boolean {
      return false;
    },
  };
  return {
    matchMedia: () => mql as unknown as MediaQueryList,
    setMatches(value: boolean): void {
      matches = value;
      for (const listener of listeners) {
        listener({ matches: value, media: DARK_QUERY });
      }
    },
  };
}

const media = createMatchMediaStub();
window.matchMedia = media.matchMedia;

// Imported dynamically so the matchMedia stub above is installed before
// the theme store singleton initializes and captures the MediaQueryList.
const { toggleSchemeWithPalette } = await import("./scheme-toggle.js");
const { themeStore } = await import("$lib/stores/theme.svelte.js");
const { DEFAULT_PRIMARY } = await import("./index.js");

function getProp(name: string): string {
  return document.documentElement.style.getPropertyValue(name);
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.setAttribute("style", "");
  media.setMatches(false);
  themeStore.setColorScheme("dark");
});

afterEach(async () => {
  // toggleSchemeWithPalette defers applyKonstaPalette via queueMicrotask,
  // which then dynamically imports material-color-utilities. Settling alone
  // is not enough: if the hook runs before that microtask, no import is
  // pending yet and dynamicImportSettled resolves on empty. Cross a
  // macrotask boundary so the deferred call has run and its import has
  // started, then settle it while the module mock is still registered;
  // otherwise the real package loads after teardown and rejects under node
  // ESM (extensionless internal imports).
  await new Promise((resolve) => setTimeout(resolve, 0));
  await vi.dynamicImportSettled();
});

describe("toggleSchemeWithPalette", () => {
  it("flips the resolved scheme and persists the explicit preference", async () => {
    toggleSchemeWithPalette();
    expect(themeStore.resolvedScheme).toBe("light");
    expect(themeStore.colorSchemePreference).toBe("light");
    // Persisted preference key is read back by the app.html boot script
    // and by the store on the next load (persistence contract).
    expect(localStorage.getItem("care-y-color-scheme")).toBe("light");

    // Let the first deferred palette application finish before toggling
    // again: two applications queued in the same frame start concurrent
    // dynamic imports, and a concurrent pair races past the material mock
    // to the native loader.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await vi.dynamicImportSettled();

    toggleSchemeWithPalette();
    expect(themeStore.resolvedScheme).toBe("dark");
    expect(themeStore.colorSchemePreference).toBe("dark");
    expect(localStorage.getItem("care-y-color-scheme")).toBe("dark");
  });

  it("toggles away from the OS-resolved scheme when the preference is system", () => {
    media.setMatches(true);
    themeStore.setColorScheme("system");
    expect(themeStore.resolvedScheme).toBe("dark");

    toggleSchemeWithPalette();
    expect(themeStore.resolvedScheme).toBe("light");
    expect(themeStore.colorSchemePreference).toBe("light");
  });

  it("follows OS scheme changes in system mode and ignores them once a toggle pins the scheme", () => {
    themeStore.setColorScheme("system");
    expect(themeStore.resolvedScheme).toBe("light");

    // matchMedia change listener wiring: system preference re-resolves.
    media.setMatches(true);
    expect(themeStore.resolvedScheme).toBe("dark");

    toggleSchemeWithPalette();
    expect(themeStore.resolvedScheme).toBe("light");

    // After the toggle the preference is explicit, so OS changes no
    // longer move the resolved scheme.
    media.setMatches(false);
    media.setMatches(true);
    expect(themeStore.resolvedScheme).toBe("light");
  });

  it("re-derives the Konsta palette from the persisted brand colors", async () => {
    // Keys shared with the branding cache fast path and the app.html
    // boot script (cross-module persistence contract).
    localStorage.setItem("care-y-brand-primary", "#1a237e");
    localStorage.setItem("care-y-brand-accent", "#00695c");

    toggleSchemeWithPalette();

    // --brand-primary is the documented single injection point for org
    // branding (Inkwell design tokens), so the CSS custom property is
    // the observable contract for the palette pass.
    await vi.waitFor(() => {
      expect(getProp("--brand-primary")).toBe("#1a237e");
      expect(getProp("--brand-accent")).toBe("#00695c");
    });
  });

  it("falls back to the default brand color when none is persisted", async () => {
    toggleSchemeWithPalette();

    await vi.waitFor(() => {
      expect(getProp("--brand-primary")).toBe(DEFAULT_PRIMARY);
    });
    // No accent stored, so no accent token is applied.
    expect(getProp("--brand-accent")).toBe("");
  });
});
