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
  getSectionRailCtx: () => ({ current: undefined }),
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_tab_telephony: () => "Telephony",
  admin_tab_blocklist: () => "Blocklist",
  admin_tab_greetings: () => "Greetings",
  admin_tab_sms_templates: () => "SMS Templates",
  admin_tab_quarantine: () => "Quarantine",
  admin_comms_title: () => "Communications",
}));

vi.mock("$lib/components/SectionScrollNav.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/useSectionScroll.svelte.js", () => ({
  createSectionScroll: () => ({ active: "telephony", scrollTo: vi.fn() }),
}));

vi.mock("$lib/components/dashboard/CollapsibleSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/TelephonyConfigSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/BlocklistSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/GreetingsSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/admin/SmsTemplatesSection.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/admin/QuarantineSection.svelte", async () => ({
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

// --- Setup ---

beforeEach(() => {
  mockPermissions = new Set(["manage_infrastructure"]);
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

function renderPage(): ReturnType<typeof render> {
  return render(PageModule.default);
}

// --- Tests ---

describe("Communications page", () => {
  describe("permission guard", () => {
    it("redirects to / when user has no infrastructure permissions", () => {
      setPermissions();
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not redirect when user has MANAGE_INFRASTRUCTURE", () => {
      setPermissions("manage_infrastructure");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("section rendering", () => {
    it("renders all 5 section anchors with MANAGE_INFRASTRUCTURE", () => {
      const { container } = renderPage();

      expect(container.querySelector("#section-telephony")).toBeTruthy();
      expect(container.querySelector("#section-blocklist")).toBeTruthy();
      expect(container.querySelector("#section-greetings")).toBeTruthy();
      expect(container.querySelector("#section-templates")).toBeTruthy();
      expect(container.querySelector("#section-quarantine")).toBeTruthy();
    });

    it("renders no sections when user lacks MANAGE_INFRASTRUCTURE", () => {
      setPermissions("manage_users");
      const { container } = renderPage();

      expect(container.querySelector("#section-telephony")).toBeNull();
      expect(container.querySelector("#section-blocklist")).toBeNull();
      expect(container.querySelector("#section-greetings")).toBeNull();
      expect(container.querySelector("#section-templates")).toBeNull();
      expect(container.querySelector("#section-quarantine")).toBeNull();
    });
  });

  describe("navbar context", () => {
    it("sets title to Communications", () => {
      renderPage();

      expect(mockNavbarCtx.current).toEqual(
        expect.objectContaining({ title: "Communications" }),
      );
    });

    it("sets subnavbar snippet", () => {
      renderPage();

      expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    });
  });

  describe("section anchors", () => {
    it("has scroll-anchored divs for all sections", () => {
      const { container } = renderPage();

      const divs = container.querySelectorAll(".csp-section");
      expect(divs).toHaveLength(5);
      expect(divs[0]?.id).toBe("section-telephony");
      expect(divs[1]?.id).toBe("section-greetings");
      expect(divs[2]?.id).toBe("section-templates");
      expect(divs[3]?.id).toBe("section-blocklist");
      expect(divs[4]?.id).toBe("section-quarantine");
    });
  });
});
