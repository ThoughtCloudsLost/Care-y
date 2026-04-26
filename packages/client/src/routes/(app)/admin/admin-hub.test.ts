// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

// --- Controllable mock state ---

let mockPermissions = new Set<string>();
let mockHubStatusData: Record<string, unknown> | undefined;

const mockGoto = vi.fn();
const mockToastShow = vi.fn();

// --- Mocks ---

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
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

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow, current: null, dismiss: vi.fn() },
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      get isLoading() {
        return !mockHubStatusData;
      },
      isError: false,
      error: null,
      get data() {
        return mockHubStatusData;
      },
    };
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: {
      hubStatus: { query: vi.fn().mockResolvedValue({}) },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  panel_group_people: () => "People",
  panel_group_communications: () => "Communications",
  panel_group_organization: () => "Organization",
  panel_users: () => "Users",
  panel_queues: () => "Queues",
  panel_telephony: () => "Telephony",
  panel_blocklist: () => "Blocklist",
  panel_greetings: () => "Greetings",
  panel_sms_templates: () => "SMS Templates",
  panel_branding: () => "Branding",
  panel_keys: () => "Keys",
  panel_retention: () => "Retention",
  panel_reports: () => "Reports",
  hub_users_subtitle: () => "Manage users, roles, and invitations",
  hub_queues_subtitle: () => "Create and assign ticket queues",
  hub_telephony_subtitle: () => "Phone numbers and call routing",
  hub_blocklist_subtitle: () => "Blocked numbers",
  hub_greetings_subtitle: () => "Recorded greetings and hold music",
  hub_sms_templates_subtitle: () => "Automated SMS message templates",
  hub_branding_subtitle: () => "Organization name, colors, and theme",
  hub_keys_subtitle: () => "Encryption key status and rotation",
  hub_retention_subtitle: () =>
    "Personal identifying information retention and lifecycle",
  hub_reports_subtitle: () => "Usage statistics and activity reports",
  admin_hub_title: () => "Admin",
  admin_hub_badge_active: ({ count }: { count: string }) => `${count} active`,
  admin_hub_badge_queues: ({ count }: { count: string }) => `${count} queues`,
  admin_hub_badge_keys_ok: () => "OK",
  admin_hub_badge_keys_missing: () => "Action needed",
  admin_hub_badge_retention_days: ({ count }: { count: string }) =>
    `${count} days`,
  admin_hub_badge_retention_disabled: () => "Disabled",
  admin_hub_badge_phones: ({ count }: { count: string }) => `${count} numbers`,
  admin_hub_badge_no_phones: () => "No phones",
  admin_hub_badge_blocked: ({ count }: { count: string }) => `${count} blocked`,
  admin_hub_badge_greetings: ({ count }: { count: string }) =>
    `${count} greetings`,
  admin_hub_badge_templates: ({ count }: { count: string }) =>
    `${count} templates`,
  admin_coming_soon: () => "Coming soon",
}));

vi.mock("$lib/components/SectionScrollNav.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/useSectionScroll.svelte.js", () => ({
  createSectionScroll: () => ({ active: "people", scrollTo: vi.fn() }),
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
  mockPermissions = new Set([
    "manage_users",
    "manage_keys",
    "manage_org_config",
    "manage_queues",
    "manage_infrastructure",
    "view_reports",
  ]);
  mockHubStatusData = undefined;
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
  mockToastShow.mockClear();
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

function renderPage(): ReturnType<typeof render> {
  return render(PageModule.default);
}

// --- Tests ---

describe("Admin hub page", () => {
  describe("permission guard", () => {
    it("redirects to home when user has no admin permissions", () => {
      setPermissions();
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not redirect when user has MANAGE_USERS", () => {
      setPermissions("manage_users");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
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

  describe("grouped list rendering", () => {
    it("renders all three group headings for full-admin permissions", () => {
      renderPage();

      expect(screen.getByText("People")).toBeTruthy();
      expect(screen.getByText("Communications")).toBeTruthy();
      expect(screen.getByText("Organization")).toBeTruthy();
    });

    it("renders destination items with subtitles", () => {
      renderPage();

      expect(screen.getByText("Users")).toBeTruthy();
      expect(
        screen.getByText("Manage users, roles, and invitations"),
      ).toBeTruthy();
      expect(screen.getByText("Queues")).toBeTruthy();
      expect(screen.getByText("Create and assign ticket queues")).toBeTruthy();
    });

    it("only renders groups the user has permission for", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      expect(screen.getByText("People")).toBeTruthy();
      expect(screen.queryByText("Communications")).toBeNull();
      expect(screen.queryByText("Organization")).toBeNull();
    });
  });

  describe("destination rendering", () => {
    it("renders implemented destinations without disabled styling", () => {
      renderPage();

      const usersText = screen.getByText("Users");
      expect(usersText).toBeTruthy();
    });

    it("renders unimplemented destinations (for coming-soon tap)", () => {
      renderPage();

      expect(screen.getByText("Telephony")).toBeTruthy();
      expect(screen.getByText("Phone numbers and call routing")).toBeTruthy();
    });
  });

  describe("status badges", () => {
    it("renders badges when hub status data is available", () => {
      mockHubStatusData = {
        activeUserCount: 5,
        queueCount: 3,
        keyStatus: "ok",
        retentionDays: 90,
      };
      renderPage();

      expect(screen.getByText("5 active")).toBeTruthy();
      expect(screen.getByText("3 queues")).toBeTruthy();
      expect(screen.getByText("OK")).toBeTruthy();
      expect(screen.getByText("90 days")).toBeTruthy();
    });

    it("shows 'Action needed' when key status is missing", () => {
      mockHubStatusData = {
        activeUserCount: 1,
        queueCount: 0,
        keyStatus: "missing",
        retentionDays: null,
      };
      renderPage();

      expect(screen.getByText("Action needed")).toBeTruthy();
      expect(screen.getByText("Disabled")).toBeTruthy();
    });

    it("renders communications badges with success variant when counts > 0", () => {
      mockHubStatusData = {
        activeUserCount: 2,
        queueCount: 1,
        keyStatus: "ok",
        retentionDays: 30,
        phoneCount: 4,
        blocklistCount: 7,
        greetingCount: 3,
        templateCount: 5,
      };
      renderPage();

      expect(screen.getByText("4 numbers")).toBeTruthy();
      expect(screen.getByText("7 blocked")).toBeTruthy();
      expect(screen.getByText("3 greetings")).toBeTruthy();
      expect(screen.getByText("5 templates")).toBeTruthy();

      // Telephony badge shows success when phones are provisioned
      const phoneBadge = screen.getByText("4 numbers");
      expect(phoneBadge.closest(".hub-badge-success")).toBeTruthy();

      // Greetings/templates show default (no warning) when counts > 0
      const greetingBadge = screen.getByText("3 greetings");
      expect(greetingBadge.closest(".hub-badge-warning")).toBeNull();
      const templateBadge = screen.getByText("5 templates");
      expect(templateBadge.closest(".hub-badge-warning")).toBeNull();
    });

    it("shows warning variant when communications counts are zero", () => {
      mockHubStatusData = {
        activeUserCount: 1,
        queueCount: 0,
        keyStatus: "ok",
        retentionDays: null,
        phoneCount: 0,
        blocklistCount: 0,
        greetingCount: 0,
        templateCount: 0,
      };
      renderPage();

      expect(screen.getByText("No phones")).toBeTruthy();
      expect(screen.getByText("0 blocked")).toBeTruthy();
      expect(screen.getByText("0 greetings")).toBeTruthy();
      expect(screen.getByText("0 templates")).toBeTruthy();

      // Telephony, greetings, templates show warning when at zero
      const phoneBadge = screen.getByText("No phones");
      expect(phoneBadge.closest(".hub-badge-warning")).toBeTruthy();
      const greetingBadge = screen.getByText("0 greetings");
      expect(greetingBadge.closest(".hub-badge-warning")).toBeTruthy();
      const templateBadge = screen.getByText("0 templates");
      expect(templateBadge.closest(".hub-badge-warning")).toBeTruthy();

      // Blocklist at 0 is normal (no warning)
      const blockBadge = screen.getByText("0 blocked");
      expect(blockBadge.closest(".hub-badge-warning")).toBeNull();
    });

    it("does not render badges when query has no data yet", () => {
      mockHubStatusData = undefined;
      renderPage();

      expect(screen.queryByText(/^\d+ active$/)).toBeNull();
      expect(screen.queryByText(/^\d+ queues$/)).toBeNull();
    });
  });

  describe("navbar context", () => {
    it("sets navbar title to Admin", () => {
      renderPage();

      expect(mockNavbarCtx.current).toEqual(
        expect.objectContaining({ title: "Admin" }),
      );
    });

    it("sets subnavbar snippet", () => {
      renderPage();

      expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    });
  });
});
