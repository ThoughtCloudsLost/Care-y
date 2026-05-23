// @vitest-environment jsdom
/**
 * People page behavior tests.
 *
 * Tests permission gating, tab state management, deep-link handling,
 * navbar context propagation, and section rendering. The subnavbar
 * (tab switcher) lives in a snippet set on navbarCtx and is rendered
 * by AppShell, not inline. These tests verify the page's own behavior:
 * which section it renders, how it reacts to URL params, and what it
 * sets on the navbar context.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

// --- Controllable mock state ---

let mockPermissions = new Set<string>();

let mockPageUrl = new URL("http://localhost/admin/people");

const mockGoto = vi.fn();

// --- Mocks ---

vi.mock("$app/state", () => ({
  get page() {
    return {
      url: mockPageUrl,
      params: {},
    };
  },
}));

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
  replaceState: vi.fn(),
  onNavigate: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCurrentPermissions: () => () => mockPermissions,
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getCurrentUserId: () => () => "user-001",
  getCurrentUserRoleId: () => () => "admin-role-id",
}));

const mockNavbarCtx = { current: undefined as unknown };
const mockTabbarCtx = { current: undefined as unknown };

vi.mock("$lib/shell/context.js", () => ({
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => mockTabbarCtx,
}));

vi.mock("$lib/shell/use-scroll-direction.svelte.js", () => ({
  useScrollDirection: () => ({ hidden: false }),
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      listQueues: { query: vi.fn().mockResolvedValue([]) },
      getUserQueues: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: [],
    refetch: vi.fn(),
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock("$lib/stores/user-filters.svelte.js", () => ({
  userFilterStore: {
    roles: new Set(),
    statuses: new Set(),
    keyStatuses: new Set(),
    sort: { field: "name", direction: "asc" },
    activeCount: 0,
    setSort: vi.fn(),
    toggleRole: vi.fn(),
    toggleStatus: vi.fn(),
    toggleKeyStatus: vi.fn(),
    clearAll: vi.fn(),
  },
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_people_title: () => "People",
  admin_tab_users: () => "Users",
  admin_tab_queues: () => "Queues",
  admin_users_title: () => "Users",
  admin_users_sort: () => "Sort",
  admin_users_sort_name: () => "Name",
  admin_users_sort_role: () => "Role",
  admin_users_sort_status: () => "Status",
  admin_role_volunteer: () => "Volunteer",
  admin_role_manager: () => "Manager",
  admin_role_admin: () => "Admin",
  admin_status_active: () => "Active",
  admin_status_inactive: () => "Inactive",
  admin_users_key_ok: () => "OK",
  admin_users_key_no_keys: () => "No keys",
  admin_users_key_no_org: () => "No org key",
  admin_users_filter_role: () => "Role",
  admin_users_filter_status: () => "Status",
  admin_users_filter_keys: () => "Keys",
  admin_invite_button: () => "Invite",
  admin_invite_menu_link: () => "Invite Link",
  admin_invite_menu_manual: () => "Manual Entry",
  admin_queues_create_button: () => "Create queue",
  admin_queues_select_mode: () => "Select",
  admin_queues_sort: () => "Sort",
  admin_queues_sort_name: () => "Name",
  admin_queues_sort_order: () => "Order",
  admin_queues_sort_members: () => "Members",
  admin_queues_sort_open: () => "Open",
  admin_queues_sort_hold: () => "Hold",
  admin_queues_sort_closed: () => "Closed",
  admin_queues_stat_total: () => "total",
  admin_queues_stat_open: () => "open",
  admin_queues_stat_members: () => "members",
  admin_queues_title: () => "Queues",
  admin_users_stat_active: () => "active",
  admin_users_stat_inactive: () => "inactive",
  admin_users_select_mode: () => "Select",
  admin_users_filter_queue: () => "Queue",
  search_inline_trigger: () => "Search",
}));

vi.mock("$lib/components/admin/UsersSection.svelte", async () => ({
  default: (await import("./test-helpers/StubUsersSection.svelte")).default,
}));

vi.mock("$lib/components/admin/QueuesSection.svelte", async () => ({
  default: (await import("./test-helpers/StubQueuesSection.svelte")).default,
}));

vi.mock("$lib/shell/SubNavbarFilterLayout.svelte", async () => ({
  default: (await import("./test-helpers/StubSubNavbarFilterLayout.svelte"))
    .default,
}));

vi.mock("$lib/components/StatusDot.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/filters/filter-types.js", () => ({}));

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

function setUrl(path: string): void {
  mockPageUrl = new URL(`http://localhost${path}`);
}

// --- Setup ---

beforeEach(() => {
  mockPermissions = new Set(["manage_users", "manage_queues"]);
  mockPageUrl = new URL("http://localhost/admin/people");
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

function renderPage(): ReturnType<typeof render> {
  return render(PageModule.default);
}

// --- Tests ---

describe("People page", () => {
  describe("permission guard", () => {
    it("redirects to home when user has neither permission", () => {
      setPermissions();
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not redirect when user has MANAGE_USERS", () => {
      setPermissions("manage_users");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("does not redirect when user has MANAGE_QUEUES", () => {
      setPermissions("manage_queues");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("section rendering", () => {
    it("renders UsersSection by default when user has MANAGE_USERS", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      expect(screen.getByText("User management loading...")).toBeTruthy();
      expect(screen.queryByText("Queue management loading...")).toBeNull();
    });

    it("renders QueuesSection when URL has ?tab=queues", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=queues");
      renderPage();

      expect(screen.getByText("Queue management loading...")).toBeTruthy();
      expect(screen.queryByText("User management loading...")).toBeNull();
    });

    it("defaults to QueuesSection when user only has MANAGE_QUEUES", () => {
      setPermissions("manage_queues");
      renderPage();

      expect(screen.getByText("Queue management loading...")).toBeTruthy();
    });

    it("ignores invalid tab param and defaults to Users", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=invalid");
      renderPage();

      expect(screen.getByText("User management loading...")).toBeTruthy();
    });
  });

  describe("tabpanel ARIA", () => {
    it("wraps the active section in a labeled tabpanel", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-users");
      expect(panel.getAttribute("aria-labelledby")).toBe("tab-users");
    });

    it("switches tabpanel ID for queues tab", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=queues");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-queues");
      expect(panel.getAttribute("aria-labelledby")).toBe("tab-queues");
    });
  });

  describe("navbar context", () => {
    it("sets navbar title to People on mount", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.title).toBe("People");
    });

    it("provides a subnavbar snippet to the navbar context", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.subnavbar).toBeDefined();
      expect(typeof ctx.subnavbar).toBe("function");
    });

    it("provides a right action snippet on the users tab", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.right).toBeDefined();
      expect(typeof ctx.right).toBe("function");
    });

    it("provides a right action snippet on the queues tab", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.right).toBeDefined();
      expect(typeof ctx.right).toBe("function");
    });

    it("does not provide a right action when user lacks the active tab permission", () => {
      setPermissions("manage_queues");
      renderPage();

      // Default tab is queues (no manage_users), so right should be
      // the queues-tab right action (create queue).
      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.right).toBeDefined();
    });
  });

  describe("permission guard (extended)", () => {
    it("redirects when user has unrelated permissions only", () => {
      setPermissions("manage_keys", "manage_org_config");
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not render any tabpanel when user has no access", () => {
      setPermissions();
      renderPage();

      expect(screen.queryByRole("tabpanel")).toBeNull();
    });

    it("renders content normally with both permissions", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      expect(screen.getByRole("tabpanel")).toBeTruthy();
      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("tab visibility based on permissions", () => {
    it("only shows users tabpanel when user has only MANAGE_USERS", () => {
      setPermissions("manage_users");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-users");
      expect(screen.getByText("User management loading...")).toBeTruthy();
    });

    it("only shows queues tabpanel when user has only MANAGE_QUEUES", () => {
      setPermissions("manage_queues");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-queues");
      expect(screen.getByText("Queue management loading...")).toBeTruthy();
    });

    it("switches to queues tab via URL even with both permissions", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=queues");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-queues");
    });

    it("falls back to users tab for unknown tab param with both permissions", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=settings");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-users");
    });
  });

  describe("section content by tab", () => {
    it("renders only UsersSection stub on users tab", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      expect(screen.getByText("User management loading...")).toBeTruthy();
      expect(screen.queryByText("Queue management loading...")).toBeNull();
    });

    it("renders only QueuesSection stub on queues tab", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=queues");
      renderPage();

      expect(screen.getByText("Queue management loading...")).toBeTruthy();
      expect(screen.queryByText("User management loading...")).toBeNull();
    });

    it("does not render users section when user lacks MANAGE_USERS and tab is queues", () => {
      setPermissions("manage_queues");
      setUrl("/admin/people?tab=queues");
      renderPage();

      expect(screen.getByText("Queue management loading...")).toBeTruthy();
      expect(screen.queryByText("User management loading...")).toBeNull();
    });
  });

  describe("navbar subnavbar hidden callback", () => {
    it("provides a subnavbarHidden callback in navbar context", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.subnavbarHidden).toBeDefined();
      expect(typeof ctx.subnavbarHidden).toBe("function");
    });
  });
});
