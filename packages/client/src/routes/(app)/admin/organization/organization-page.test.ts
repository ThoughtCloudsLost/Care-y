// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";

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

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_tab_branding: () => "Branding",
  admin_tab_keys: () => "Keys",
  admin_tab_retention: () => "Retention",
  admin_tab_reports: () => "Reports",
  admin_tab_note_types: () => "Follow-Ups",
  admin_tab_terminology: () => "Terminology",
  admin_org_title: () => "Organization",
  admin_org_no_access: () => "No access",
}));

vi.mock("$lib/components/SectionScrollNav.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/useSectionScroll.svelte.js", () => ({
  createSectionScroll: () => ({ active: "branding", scrollTo: vi.fn() }),
}));

vi.mock("$lib/components/dashboard/CollapsibleSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/BrandingSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/KeysSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/RetentionSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/NoteTypesSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/TerminologySection.svelte", async () => ({
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

// --- Helpers ---

function setPermissions(...perms: string[]): void {
  mockPermissions = new Set(perms);
}

const ALL_ORG_PERMISSIONS = [
  "manage_org_config",
  "manage_keys",
  "view_reports",
];

// --- Setup ---

beforeEach(() => {
  mockPermissions = new Set(ALL_ORG_PERMISSIONS);
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

function renderPage(): ReturnType<typeof render> {
  return render(PageModule.default);
}

// --- Tests ---

describe("Organization page", () => {
  describe("permission guard", () => {
    it("redirects to / when user has no org permissions", () => {
      setPermissions();
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not redirect when user has MANAGE_KEYS", () => {
      setPermissions("manage_keys");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("does not redirect when user has MANAGE_ORG_CONFIG", () => {
      setPermissions("manage_org_config");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("section rendering", () => {
    it("renders all 5 section anchors with full permissions", () => {
      const { container } = renderPage();

      expect(container.querySelector("#section-branding")).toBeTruthy();
      expect(container.querySelector("#section-terminology")).toBeTruthy();
      expect(container.querySelector("#section-keys")).toBeTruthy();
      expect(container.querySelector("#section-retention")).toBeTruthy();
      expect(container.querySelector("#section-note-types")).toBeTruthy();
    });

    it("only renders sections the user has permission for", () => {
      setPermissions("manage_keys");
      const { container } = renderPage();

      expect(container.querySelector("#section-keys")).toBeTruthy();
      expect(container.querySelector("#section-branding")).toBeNull();
      expect(container.querySelector("#section-terminology")).toBeNull();
      expect(container.querySelector("#section-retention")).toBeNull();
      expect(container.querySelector("#section-note-types")).toBeNull();
    });

    it("branding and retention both appear with MANAGE_ORG_CONFIG", () => {
      setPermissions("manage_org_config");
      const { container } = renderPage();

      expect(container.querySelector("#section-branding")).toBeTruthy();
      expect(container.querySelector("#section-terminology")).toBeTruthy();
      expect(container.querySelector("#section-retention")).toBeTruthy();
      expect(container.querySelector("#section-note-types")).toBeTruthy();
      expect(container.querySelector("#section-keys")).toBeNull();
    });
  });

  describe("navbar context", () => {
    it("sets title to Organization", () => {
      renderPage();

      expect(mockNavbarCtx.current).toEqual(
        expect.objectContaining({ title: "Organization" }),
      );
    });

    it("sets subnavbar snippet", () => {
      renderPage();

      expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    });
  });

  describe("section anchors", () => {
    it("has scroll-anchored divs for visible sections", () => {
      const { container } = renderPage();

      const divs = container.querySelectorAll(".csp-section");
      expect(divs).toHaveLength(5);
      expect(divs[0]?.id).toBe("section-branding");
      expect(divs[1]?.id).toBe("section-terminology");
      expect(divs[2]?.id).toBe("section-keys");
      expect(divs[3]?.id).toBe("section-retention");
      expect(divs[4]?.id).toBe("section-note-types");
    });
  });
});
