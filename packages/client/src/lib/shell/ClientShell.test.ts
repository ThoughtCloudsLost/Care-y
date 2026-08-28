// @vitest-environment jsdom
/**
 * ClientShell render tests.
 *
 * These pin the placement decisions the shell exists to enforce. Identity
 * belongs in the left slot and opens the drawer, the org name and the
 * language picker sit together in the center, and quick exit holds the
 * right slot. Each of those was somewhere else before, and a volunteer
 * talking a client through the interface pays for every difference.
 *
 * vi.mock() is required for:
 *   - $app/navigation: SvelteKit virtual module with no on-disk source
 *   - $lib/branding/public-branding.js: the query needs controlled state
 *   - $lib/branding/konsta-palette.js: applies real CSS variables
 *   - $lib/branding/title.svelte.js: module-scope $state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/svelte";
import type * as KonstaPalette from "$lib/branding/konsta-palette.js";
import type * as BrandingTitle from "$lib/branding/title.svelte.js";
import type * as PublicBranding from "$lib/branding/public-branding.js";

// --- Controllable mock state ---

let mockBranding: PublicBranding.PublicBranding | null = null;

function branding(
  overrides: Partial<PublicBranding.PublicBranding> = {},
): PublicBranding.PublicBranding {
  return {
    orgName: "Safe Harbor",
    primaryColor: "#636366",
    accentColor: null,
    iconUrl: null,
    orgSlug: "safe-harbor",
    supportLabel: "",
    ...overrides,
  };
}

// --- Mocks ---

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal()),
  resolve: (path: string) => path,
}));

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal()),
  goto: vi.fn(),
}));

vi.mock("$lib/branding/konsta-palette.js", async (importOriginal) => ({
  ...(await importOriginal<typeof KonstaPalette>()),
  applyKonstaPalette: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("$lib/branding/title.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BrandingTitle>()),
  setBrandingTitle: vi.fn(),
  getBrandingTitle: () => "CARE-Y",
}));

vi.mock("$lib/branding/public-branding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PublicBranding>()),
  createPublicBrandingQuery: () => ({
    get data() {
      return mockBranding;
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

// jsdom implements neither observer. PageShell measures the navbar with a
// ResizeObserver; the drawer's decrypt placeholders use IntersectionObserver.
class NoopResizeObserver implements ResizeObserver {
  observe(): void {
    /* jsdom performs no layout */
  }
  unobserve(): void {
    /* jsdom performs no layout */
  }
  disconnect(): void {
    /* jsdom performs no layout */
  }
}
globalThis.ResizeObserver = NoopResizeObserver;

class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe(): void {
    /* jsdom performs no layout */
  }
  unobserve(): void {
    /* jsdom performs no layout */
  }
  disconnect(): void {
    /* jsdom performs no layout */
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver = NoopIntersectionObserver;

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const { default: ClientShellHarness } =
  await import("./test-helpers/ClientShellHarness.svelte");

// --- Helpers ---

function renderShell(): ReturnType<typeof render> {
  return render(ClientShellHarness);
}

function navbar(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(".k-navbar");
  if (el === null) throw new Error("navbar did not render");
  return el;
}

// --- Tests ---

describe("ClientShell", () => {
  beforeEach(() => {
    mockBranding = branding();
  });

  afterEach(cleanup);

  it("renders the page it is given", () => {
    renderShell();
    expect(screen.getByTestId("shell-child")).toBeTruthy();
  });

  describe("identity", () => {
    it("puts the org logo in the left slot, not the center title", () => {
      mockBranding = branding({
        iconUrl: "/api/branding/safe-harbor/icon.png",
      });

      const { container } = renderShell();

      const logo = navbar(container).querySelector<HTMLImageElement>(
        ".navbar-avatar-logo",
      );
      expect(logo?.getAttribute("src")).toBe(
        "/api/branding/safe-harbor/icon.png",
      );
      expect(logo?.getAttribute("alt")).toBe("");
      // The center holds the name, and no second copy of the icon.
      const group = navbar(container).querySelector(".navbar-title-group");
      expect(group?.querySelector("img")).toBeNull();
    });

    it("falls back to a menu icon when the org has set no logo", () => {
      mockBranding = branding({ iconUrl: null });

      const { container } = renderShell();

      const avatar = navbar(container).querySelector(".navbar-avatar");
      expect(avatar?.querySelector("img")).toBeNull();
      expect(avatar?.querySelector("svg")).toBeTruthy();
    });

    it("opens the drawer when the identity control is tapped", async () => {
      const { container } = renderShell();

      expect(
        container.querySelector("[data-testid='drawer-privacy']"),
      ).toBeNull();

      await fireEvent.click(screen.getByRole("button", { name: "Menu" }));

      expect(
        container.querySelector("[data-testid='drawer-privacy']"),
      ).toBeTruthy();
    });
  });

  describe("navbar center", () => {
    it("puts the language picker beside the org name", () => {
      const { container } = renderShell();

      const group = navbar(container).querySelector(".navbar-title-group");
      expect(group?.textContent).toContain("Safe Harbor");
      expect(group?.querySelector("select")).toBeTruthy();
    });

    it("shows the org name once branding resolves", () => {
      mockBranding = branding({ orgName: "Harbor Line" });

      const { container } = renderShell();

      expect(navbar(container).textContent).toContain("Harbor Line");
    });
  });

  describe("quick exit", () => {
    it("holds the navbar right slot with no visible label", () => {
      const { container } = renderShell();

      const exit = navbar(container).querySelector(
        "[data-testid='quick-exit']",
      );
      expect(exit).toBeTruthy();
      expect(exit?.textContent.trim()).toBe("");
    });

    // Safety contract: the drawer traps focus and also closes on Escape,
    // but exiting takes precedence. A client one tap from needing to leave
    // must not have to close a menu first.
    it("still exits on Escape while the drawer is open", async () => {
      Object.defineProperty(window, "location", {
        value: { replace: vi.fn() },
        writable: true,
      });

      const { container } = renderShell();

      await fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      expect(
        container.querySelector("[data-testid='drawer-privacy']"),
      ).toBeTruthy();

      await fireEvent.keyDown(window, { key: "Escape" });

      expect(window.location.replace).toHaveBeenCalledWith(
        "https://weather.gov",
      );
    });

    it("exits to the default safe URL when no page has registered", async () => {
      Object.defineProperty(window, "location", {
        value: { replace: vi.fn() },
        writable: true,
      });

      const { container } = renderShell();

      await fireEvent.click(
        container.querySelector("[data-testid='quick-exit']") as HTMLElement,
      );

      expect(window.location.replace).toHaveBeenCalledWith(
        "https://weather.gov",
      );
    });
  });

  describe("landmarks", () => {
    it("labels the main content region the way the org app does", () => {
      renderShell();

      const main = screen.getByRole("main", { name: "Main content" });
      expect(main.getAttribute("id")).toBe("main-content");
    });

    it("renders no page footer", () => {
      const { container } = renderShell();
      expect(container.querySelector("footer")).toBeNull();
    });
  });

  it("mounts a toast channel, which client pages had none of", () => {
    const { container } = renderShell();
    expect(container.querySelector(".k-toast")).toBeTruthy();
  });
});
