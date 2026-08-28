// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";

// --- Controllable mock state ---

let mockBrandingData: {
  orgName: string;
  primaryColor: string;
  accentColor: string | null;
  iconUrl: string | null;
  orgSlug: string;
} | null = null;
let mockIsLoading = false;

// --- Mocks ---

// $app/environment: covered by test-setup.ts (global setupFile)

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal()),
  resolve: (path: string) => path,
}));

const { mockApplyKonstaPalette, mockSetBrandingTitle } = vi.hoisted(() => ({
  mockApplyKonstaPalette: vi.fn().mockResolvedValue(undefined),
  mockSetBrandingTitle: vi.fn(),
}));

vi.mock("$lib/branding/konsta-palette.js", async (importOriginal) => ({
  ...(await importOriginal()),
  applyKonstaPalette: mockApplyKonstaPalette,
}));

vi.mock("$lib/branding/title.svelte.js", async (importOriginal) => ({
  ...(await importOriginal()),
  setBrandingTitle: mockSetBrandingTitle,
  getBrandingTitle: () => "CARE-Y",
}));

vi.mock("$lib/branding/public-branding.js", async (importOriginal) => ({
  ...(await importOriginal()),
  createPublicBrandingQuery: () => ({
    get data() {
      return mockBrandingData;
    },
    get isLoading() {
      return mockIsLoading;
    },
    isError: false,
    error: null,
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  intake_footer_privacy: () => "Privacy notice",
}));

// vi.mock required: PageShell uses Konsta Page and the blur-through scroll
// trick that jsdom cannot render; replace with a passthrough that renders
// BOTH the navbar snippet and the children snippet. PassthroughShell only
// renders children, dropping all navbar content (org name, skeleton, logo).
vi.mock("$lib/shell/PageShell.svelte", async (importOriginal) => ({
  ...(await importOriginal()),
  default: (
    await import("$lib/components/tickets/test-helpers/PageShellPassthrough.svelte")
  ).default,
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import Layout from "./+layout.svelte";

// --- Helpers ---

const childSnippet = createRawSnippet(() => ({
  render: () => `<p data-testid="child-content">Child content here</p>`,
}));

// --- Tests ---

describe("(client) layout", () => {
  beforeEach(() => {
    mockBrandingData = null;
    mockIsLoading = false;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders children", () => {
    render(Layout, { props: { children: childSnippet } });
    expect(screen.getByTestId("child-content")).toBeTruthy();
    expect(screen.getByTestId("child-content").textContent).toBe(
      "Child content here",
    );
  });

  it("shows org name after branding query resolves", () => {
    mockBrandingData = {
      orgName: "Safe Harbor",
      primaryColor: "#636366",
      accentColor: null,
      iconUrl: null,
      orgSlug: "safe-harbor",
    };

    render(Layout, { props: { children: childSnippet } });
    expect(screen.getByText("Safe Harbor")).toBeTruthy();
  });

  it("falls back to generic CARE-Y branding when query returns null", () => {
    mockBrandingData = null;
    mockIsLoading = false;

    render(Layout, { props: { children: childSnippet } });
    expect(screen.getByText("CARE-Y")).toBeTruthy();
  });

  it("renders InlineSkeleton while branding query is loading", () => {
    mockIsLoading = true;
    mockBrandingData = null;

    const { container } = render(Layout, {
      props: { children: childSnippet },
    });
    const skeleton = container.querySelector("[data-skeleton]");
    expect(skeleton).toBeTruthy();
  });

  it("puts the drawer trigger and quick exit in the navbar", () => {
    const { container } = render(Layout, { props: { children: childSnippet } });

    const navbar = container.querySelector(
      "[data-testid='page-shell-navbar']",
    ) as HTMLElement;
    expect(
      navbar.querySelector("[data-testid='client-drawer-trigger']"),
    ).toBeTruthy();
    expect(navbar.querySelector("[data-testid='quick-exit']")).toBeTruthy();
  });

  it("opens the drawer from the navbar trigger", async () => {
    const { container } = render(Layout, { props: { children: childSnippet } });

    expect(
      container.querySelector("[data-testid='drawer-privacy']"),
    ).toBeNull();

    const trigger = container.querySelector(
      "[data-testid='client-drawer-trigger']",
    ) as HTMLElement;
    await fireEvent.click(trigger);

    expect(
      container.querySelector("[data-testid='drawer-privacy']"),
    ).toBeTruthy();
  });

  // The privacy notice and language picker used to sit in a page footer,
  // where they scrolled away below the composer. They live in the drawer now.
  it("renders no page footer", () => {
    const { container } = render(Layout, { props: { children: childSnippet } });
    expect(container.querySelector("footer")).toBeNull();
  });

  // Safety contract: the drawer traps focus and also closes on Escape, but
  // exiting takes precedence over closing a panel. A client one tap from
  // needing to leave must not have to close a menu first.
  it("still quick-exits on Escape while the drawer is open", async () => {
    Object.defineProperty(window, "location", {
      value: { replace: vi.fn() },
      writable: true,
    });

    const { container } = render(Layout, { props: { children: childSnippet } });

    const trigger = container.querySelector(
      "[data-testid='client-drawer-trigger']",
    ) as HTMLElement;
    await fireEvent.click(trigger);
    expect(
      container.querySelector("[data-testid='drawer-privacy']"),
    ).toBeTruthy();

    await fireEvent.keyDown(window, { key: "Escape" });

    expect(window.location.replace).toHaveBeenCalledWith("https://weather.gov");
  });

  // No page has registered a session on a bare layout render, so quick exit
  // must still navigate rather than throwing on a missing callback.
  it("quick-exits with the default safe URL when no page has registered", async () => {
    Object.defineProperty(window, "location", {
      value: { replace: vi.fn() },
      writable: true,
    });

    const { container } = render(Layout, { props: { children: childSnippet } });

    await fireEvent.click(
      container.querySelector("[data-testid='quick-exit']") as HTMLElement,
    );

    expect(window.location.replace).toHaveBeenCalledWith("https://weather.gov");
  });

  it("renders org logo when iconUrl is present", () => {
    mockBrandingData = {
      orgName: "Safe Harbor",
      primaryColor: "#636366",
      accentColor: null,
      iconUrl: "/branding/safe-harbor/icon-192.png?v=1",
      orgSlug: "safe-harbor",
    };

    const { container } = render(Layout, {
      props: { children: childSnippet },
    });
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.getAttribute("src")).toBe(
      "/branding/safe-harbor/icon-192.png?v=1",
    );
  });
});
