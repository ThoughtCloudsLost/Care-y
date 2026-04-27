// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { Permission } from "@care-y/shared";

// --- Controllable mock state ---

let mockPermissions = new Set<string>();

const mockGoto = vi.fn();

// --- Mocks ---

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
  afterNavigate: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCurrentPermissions: () => () => mockPermissions,
}));

const mockNavbarCtx = { current: undefined as unknown };

vi.mock("$lib/shell/context.js", () => ({
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/components/SectionScrollNav.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/useSectionScroll.svelte.js", () => ({
  createSectionScroll: () => ({ active: "alpha", scrollTo: vi.fn() }),
}));

vi.mock("$lib/components/dashboard/CollapsibleSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
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

// --- Test section component ---

const StubComponent = (
  await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
).default;

// --- Helpers ---

function setPermissions(...perms: string[]): void {
  mockPermissions = new Set(perms);
}

// --- Setup ---

beforeEach(() => {
  mockPermissions = new Set([
    Permission.MANAGE_ORG_CONFIG,
    Permission.MANAGE_KEYS,
  ]);
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
});

afterEach(cleanup);

const CSPModule = await import("./CollapsibleSectionPage.svelte");

const SECTIONS = [
  {
    id: "alpha",
    label: () => "Alpha",
    icon: {} as never,
    permission: Permission.MANAGE_ORG_CONFIG,
    component: StubComponent,
  },
  {
    id: "beta",
    label: () => "Beta",
    icon: {} as never,
    permission: Permission.MANAGE_KEYS,
    component: StubComponent,
  },
  {
    id: "gamma",
    label: () => "Gamma",
    icon: {} as never,
    permission: Permission.MANAGE_INFRASTRUCTURE,
    component: StubComponent,
  },
] as const;

function renderCSP(title = "Test Page"): ReturnType<typeof render> {
  return render(CSPModule.default, {
    props: { sections: SECTIONS, title },
  });
}

// --- Tests ---

describe("CollapsibleSectionPage", () => {
  describe("permission guard", () => {
    it("redirects to / when user has no matching permissions", () => {
      setPermissions();
      renderCSP();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not redirect when at least one permission matches", () => {
      setPermissions(Permission.MANAGE_ORG_CONFIG);
      renderCSP();

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("section rendering", () => {
    it("renders only sections matching current permissions", () => {
      setPermissions(Permission.MANAGE_ORG_CONFIG);
      const { container } = renderCSP();

      expect(container.querySelector("#section-alpha")).toBeTruthy();
      expect(container.querySelector("#section-beta")).toBeNull();
      expect(container.querySelector("#section-gamma")).toBeNull();
    });

    it("renders all matching sections with full permissions", () => {
      setPermissions(
        Permission.MANAGE_ORG_CONFIG,
        Permission.MANAGE_KEYS,
        Permission.MANAGE_INFRASTRUCTURE,
      );
      const { container } = renderCSP();

      expect(container.querySelector("#section-alpha")).toBeTruthy();
      expect(container.querySelector("#section-beta")).toBeTruthy();
      expect(container.querySelector("#section-gamma")).toBeTruthy();
    });
  });

  describe("navbar context", () => {
    it("sets title from prop", () => {
      renderCSP("My Title");

      expect(mockNavbarCtx.current).toEqual(
        expect.objectContaining({ title: "My Title" }),
      );
    });

    it("sets subnavbar snippet", () => {
      renderCSP();

      expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    });
  });

  describe("section anchors", () => {
    it("wraps sections in .csp-section divs with correct IDs", () => {
      setPermissions(Permission.MANAGE_ORG_CONFIG, Permission.MANAGE_KEYS);
      const { container } = renderCSP();

      const divs = container.querySelectorAll(".csp-section");
      expect(divs).toHaveLength(2);
      expect(divs[0]?.id).toBe("section-alpha");
      expect(divs[1]?.id).toBe("section-beta");
    });
  });
});
