// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import type * as UseSectionScrollNS from "$lib/components/useSectionScroll.svelte.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as ContextNS from "$lib/shell/context.js";
import type * as ContextNS2 from "$lib/crypto/context.js";
import type * as PathsNS from "$app/paths";
import type * as NavigationNS from "$app/navigation";
import { Permission } from "@care-y/shared";
import { setPermissions, getMockPermissions } from "$mocks/permissions.js";

// --- Controllable mock state ---

const mockGoto = vi.fn();

// --- Mocks ---

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NavigationNS>()),
  goto: mockGoto,
  afterNavigate: vi.fn(),
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof PathsNS>()),
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS2>()),
  getCurrentPermissions: () => getMockPermissions,
}));

const mockNavbarCtx = { current: undefined as unknown };

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getSectionRailCtx: () => ({ current: undefined }),
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  admin_tab_org_general: () => "General",
  admin_tab_branding: () => "Branding",
  admin_tab_keys: () => "Keys",
  admin_tab_retention: () => "Retention",
  admin_tab_reports: () => "Reports",
  admin_tab_note_types: () => "Follow-Ups",
  admin_tab_terminology: () => "Terminology",
  intake_forms_title: () => "Intake Forms",
  admin_org_title: () => "Organization",
  admin_org_no_access: () => "No access",
}));

vi.mock("$lib/components/SectionScrollNav.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock(
  "$lib/components/useSectionScroll.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof UseSectionScrollNS>()),
    createSectionScroll: () => ({ active: "branding", scrollTo: vi.fn() }),
  }),
);

vi.mock("$lib/components/dashboard/CollapsibleSection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/components/admin/BrandingSection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/components/admin/KeysSection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/components/admin/RetentionSection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/components/admin/NoteTypesSection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/components/admin/IntakeFormsSection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/components/admin/TerminologySection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/components/admin/OrgGeneralSection.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const ALL_ORG_PERMISSIONS: readonly Permission[] = [
  Permission.MANAGE_ORG_IDENTITY,
  Permission.MANAGE_KEYS,
  Permission.MANAGE_RETENTION,
  Permission.MANAGE_NOTE_TYPES,
  Permission.MANAGE_INTAKE_FORMS,
  Permission.VIEW_REPORTS,
];

// --- Setup ---

beforeEach(() => {
  setPermissions(...ALL_ORG_PERMISSIONS);
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
      setPermissions(Permission.MANAGE_KEYS);
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("does not redirect when user has MANAGE_ORG_IDENTITY", () => {
      setPermissions(Permission.MANAGE_ORG_IDENTITY);
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("section rendering", () => {
    it("renders all 7 section anchors with full permissions", () => {
      const { container } = renderPage();

      expect(container.querySelector("#section-general")).toBeTruthy();
      expect(container.querySelector("#section-branding")).toBeTruthy();
      expect(container.querySelector("#section-terminology")).toBeTruthy();
      expect(container.querySelector("#section-keys")).toBeTruthy();
      expect(container.querySelector("#section-retention")).toBeTruthy();
      expect(container.querySelector("#section-note-types")).toBeTruthy();
      expect(container.querySelector("#section-intake-forms")).toBeTruthy();
    });

    it("only renders sections the user has permission for", () => {
      setPermissions(Permission.MANAGE_KEYS);
      const { container } = renderPage();

      expect(container.querySelector("#section-keys")).toBeTruthy();
      expect(container.querySelector("#section-general")).toBeNull();
      expect(container.querySelector("#section-branding")).toBeNull();
      expect(container.querySelector("#section-terminology")).toBeNull();
      expect(container.querySelector("#section-retention")).toBeNull();
      expect(container.querySelector("#section-note-types")).toBeNull();
      expect(container.querySelector("#section-intake-forms")).toBeNull();
    });

    it("renders each org-identity section only with its own key", () => {
      setPermissions(
        Permission.MANAGE_ORG_IDENTITY,
        Permission.MANAGE_RETENTION,
        Permission.MANAGE_NOTE_TYPES,
      );
      const { container } = renderPage();

      expect(container.querySelector("#section-general")).toBeTruthy();
      expect(container.querySelector("#section-branding")).toBeTruthy();
      expect(container.querySelector("#section-terminology")).toBeTruthy();
      expect(container.querySelector("#section-retention")).toBeTruthy();
      expect(container.querySelector("#section-note-types")).toBeTruthy();
      expect(container.querySelector("#section-keys")).toBeNull();
      expect(container.querySelector("#section-intake-forms")).toBeNull();
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
      expect(divs).toHaveLength(7);
      expect(divs[0]?.id).toBe("section-general");
      expect(divs[1]?.id).toBe("section-branding");
      expect(divs[2]?.id).toBe("section-terminology");
      expect(divs[3]?.id).toBe("section-keys");
      expect(divs[4]?.id).toBe("section-retention");
      expect(divs[5]?.id).toBe("section-note-types");
    });
  });
});
