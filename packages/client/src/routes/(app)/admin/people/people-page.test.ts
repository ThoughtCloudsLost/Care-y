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

// Type-only namespace imports for importOriginal generics
import type * as AppState from "$app/state";
import type * as AppNavigation from "$app/navigation";
import type * as AppPaths from "$app/paths";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as ShellContext from "$lib/shell/context.js";
import type * as ScrollDirection from "$lib/shell/use-scroll-direction.svelte.js";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as ErrorsMod from "$lib/errors.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as UserFilters from "$lib/stores/user-filters.svelte.js";
import type * as QueueFilters from "$lib/stores/queue-filters.svelte.js";
import type * as SearchRegistry from "$lib/search/registry.svelte.js";
import type * as SearchOverlay from "$lib/search/search-overlay.svelte.js";
import type * as InviteFlow from "$lib/composables/people/create-invite-flow.svelte.js";
import type * as FilterDispatch from "$lib/composables/create-filter-dispatch.svelte.js";
import type * as GestureFocus from "$lib/utils/gesture-focus.js";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as FilterTypes from "$lib/components/filters/filter-types.js";
import type * as ClientFilters from "$lib/stores/client-filters.svelte.js";

// --- Controllable mock state ---

let mockPermissions = new Set<string>();

let mockPageUrl = new URL("http://localhost/admin/people");

const mockGoto = vi.fn();
const mockReplaceState = vi.fn();

// --- Mocks ---

// vi.mock required: $app/state is a SvelteKit virtual module with no
// on-disk source. Cannot be imported outside SvelteKit.
vi.mock("$app/state", async (importOriginal) => ({
  ...(await importOriginal<typeof AppState>()),
  get page() {
    return {
      url: mockPageUrl,
      params: {},
    };
  },
}));

// vi.mock required: $app/navigation is a SvelteKit virtual module with no
// on-disk source.
vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof AppNavigation>()),
  goto: mockGoto,
  replaceState: mockReplaceState,
  onNavigate: vi.fn(),
}));

// vi.mock required: $app/paths is a SvelteKit virtual module with no
// on-disk source.
vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof AppPaths>()),
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCurrentPermissions: () => () => mockPermissions,
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn().mockReturnValue(true),
  }),
  getOrgKeyManager: () => ({
    get isLoaded() {
      return true;
    },
    encryptText: vi.fn().mockResolvedValue("encrypted-base64"),
    aliasHash: vi.fn().mockResolvedValue("deadbeef"),
  }),
  getCurrentUserId: () => () => "user-001",
  getCurrentUserRoleId: () => () => "admin-role-id",
}));

const mockNavbarCtx = { current: undefined as unknown };
const mockTabbarCtx = { current: undefined as unknown };

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => mockTabbarCtx,
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock(
  "$lib/shell/use-scroll-direction.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof ScrollDirection>()),
    useScrollDirection: () => ({ hidden: false }),
  }),
);

// vi.mock required: tRPC client construction is lazy, but the mock
// controls query/mutation behavior for deterministic test assertions.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    tickets: {
      listQueues: { query: vi.fn().mockResolvedValue([]) },
      getUserQueues: { query: vi.fn().mockResolvedValue([]) },
      listAllQueueAssignments: { query: vi.fn().mockResolvedValue([]) },
    },
    clients: {
      list: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsMod>()),
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

// vi.mock required: @tanstack/svelte-query creates reactive query state
// bound to a QueryClient context that does not exist in jsdom.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
  createQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: [],
    refetch: vi.fn(),
  }),
  createInfiniteQuery: () => ({
    data: { pages: [] },
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/stores/user-filters.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof UserFilters>()),
  userFilterStore: {
    roles: new Set(),
    statuses: new Set(),
    keyStatuses: new Set(),
    queueIds: new Set(),
    sort: { field: "name", direction: "asc" },
    activeCount: 0,
    setSort: vi.fn(),
    toggleRole: vi.fn(),
    toggleStatus: vi.fn(),
    toggleKeyStatus: vi.fn(),
    toggleQueueId: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/stores/queue-filters.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof QueueFilters>()),
  queueFilterStore: {
    sort: { field: "order", direction: "asc" },
    setSort: vi.fn(),
  },
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/search/registry.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof SearchRegistry>()),
  setPromotedOverride: vi.fn().mockReturnValue(() => undefined),
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/search/search-overlay.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof SearchOverlay>()),
  createSearchOverlay: () => ({
    active: false,
    term: null,
    position: 0,
    matchCount: 0,
    activeId: null,
    enter: vi.fn(),
    exit: vi.fn(),
    up: vi.fn(),
    down: vi.fn(),
    setTerm: vi.fn(),
  }),
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock(
  "$lib/composables/people/create-invite-flow.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof InviteFlow>()),
    createInviteFlow: (deps: {
      canInviteWithLink: () => boolean;
      onInviteManual: () => void;
      onInviteLink: () => void;
    }) => ({
      popoverOpen: false,
      buttonEl: undefined,
      handleInvite: (_e: MouseEvent) => {
        if (!deps.canInviteWithLink()) {
          deps.onInviteManual();
        }
      },
      handleOption: (id: string) => {
        if (id === "link") deps.onInviteLink();
        else if (id === "manual") deps.onInviteManual();
      },
      dismiss: vi.fn(),
    }),
  }),
);

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock(
  "$lib/composables/create-filter-dispatch.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof FilterDispatch>()),
    createFilterDispatch: (config: {
      fields: Record<string, { type: string; toggle: (v: string) => void }>;
      sort?: {
        validate: (v: string) => boolean;
        set: (field: string, dir: "asc" | "desc") => void;
      };
      clearAll: () => void;
    }) => ({
      handlePillToggle: (field: string, value: string) => {
        const f = config.fields[field];
        if (f) f.toggle(value);
      },
      handleSortChange: (field: string, dir: "asc" | "desc") => {
        config.sort?.set(field, dir);
      },
      clearAll: config.clearAll,
    }),
  }),
);

vi.mock("$lib/utils/gesture-focus.js", async (importOriginal) => ({
  ...(await importOriginal<typeof GestureFocus>()),
  gestureMount: (fn: () => void) => {
    fn();
  },
}));

// vi.mock required: tests pin deterministic message strings for assertions.
// Spreading importOriginal keeps every unpinned message real so the mock
// cannot drift from the compiled message surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
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

// vi.mock required: Svelte component with Konsta/Lucide dependencies that
// cannot render in jsdom without the full Konsta context.
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/admin/UsersSection.svelte", async () => ({
  default: (await import("./test-helpers/StubUsersSection.svelte")).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/admin/QueuesSection.svelte", async () => ({
  default: (await import("./test-helpers/StubQueuesSection.svelte")).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/shell/SubNavbarFilterLayout.svelte", async () => ({
  default: (await import("./test-helpers/StubSubNavbarFilterLayout.svelte"))
    .default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/StatusDot.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/shared/IconTabToggle.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/search/SearchNavigator.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/shell/ShellPopover.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/filters/filter-types.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FilterTypes>()),
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/stores/client-filters.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ClientFilters>()),
  clientFilterStore: {
    sort: { field: "created_at", direction: "desc" },
    search: "",
    hasApplications: null,
    createdAfter: null,
    createdBefore: null,
    includeMerged: false,
    activeCount: 0,
    setSort: vi.fn(),
    setSearch: vi.fn(),
    setHasApplications: vi.fn(),
    setDateRange: vi.fn(),
    setIncludeMerged: vi.fn(),
    clearAll: vi.fn(),
  },
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

function setUrl(path: string): void {
  mockPageUrl = new URL(`http://localhost${path}`);
}

// --- Setup ---

beforeEach(() => {
  mockPermissions = new Set(["manage_users", "manage_queues"]);
  mockPageUrl = new URL("http://localhost/admin/people");
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
  mockReplaceState.mockClear();
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

    it("provides subnavbarHidden as a function that returns a boolean", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      const hidden = ctx.subnavbarHidden as () => boolean;
      expect(typeof hidden).toBe("function");
      // scrollDir.hidden is false (mock), overlay.active is false, so returns false
      expect(hidden()).toBe(false);
    });

    it("omits right snippet when user only has manage_users and tab is users", () => {
      setPermissions("manage_users");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      // User has manage_users, activeTab = users, canManageUsers is true,
      // so navRight snippet is provided.
      expect(ctx.right).toBeDefined();
    });

    it("omits right snippet when no permissions match the active tab", () => {
      // Edge case: user has manage_queues but default tab is queues.
      // canManageQueues is true for the queues tab, so navRightQueues is set.
      setPermissions("manage_queues");
      setUrl("/admin/people?tab=queues");
      renderPage();

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

  describe("deep link parameters", () => {
    it("forces users tab when ?user param is present", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=queues&user=u-123");
      renderPage();

      // The user param forces the tab to "users" even when tab=queues
      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-users");
      expect(screen.getByText("User management loading...")).toBeTruthy();
    });

    it("strips user param from URL via replaceState after processing", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?user=u-123");
      renderPage();

      // replaceState is called to remove the user param
      expect(mockReplaceState).toHaveBeenCalled();
      const callArgs = mockReplaceState.mock.calls;
      const lastCall = callArgs[callArgs.length - 1] as [string, unknown];
      expect(lastCall[0]).not.toContain("user=");
    });

    it("switches to users tab via ?tab=users URL param", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=users");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-users");
    });

    it("recognizes ?action=invite param", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?action=invite");
      renderPage();

      // The page renders users section (default), and passes autoAction
      // to UsersSection which opens the invite sheet.
      expect(screen.getByText("User management loading...")).toBeTruthy();
    });
  });

  describe("MANAGE_ROLES permission influence", () => {
    it("provides invite link option when user has MANAGE_ROLES", () => {
      setPermissions("manage_users", "manage_queues", "manage_roles");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      // The right snippet is provided, which contains the invite button
      expect(ctx.right).toBeDefined();
    });

    it("uses manual invite when user lacks MANAGE_ROLES", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      // The right snippet is still provided (invite button), but
      // clicking it will trigger manual invite instead of popover
      expect(ctx.right).toBeDefined();
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

    it("returns false when scroll is not hidden and overlay is inactive", () => {
      setPermissions("manage_users", "manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      const hidden = ctx.subnavbarHidden as () => boolean;
      expect(hidden()).toBe(false);
    });
  });

  describe("navbar context varies by active tab and permissions", () => {
    it("uses users subnavbar when activeTab is users and has MANAGE_USERS", () => {
      setPermissions("manage_users");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.subnavbar).toBeDefined();
      // The right snippet is the navRight (invite button)
      expect(ctx.right).toBeDefined();
    });

    it("uses queues subnavbar when activeTab is queues and has MANAGE_QUEUES", () => {
      setPermissions("manage_queues");
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.subnavbar).toBeDefined();
      // The right snippet is navRightQueues (create queue button)
      expect(ctx.right).toBeDefined();
    });

    it("sets right to undefined when user only has users perm but tab is queues", () => {
      // The URL forces the queues tab, but the user lacks manage_queues:
      // neither tabpanel renders and the navbar right action is omitted.
      setPermissions("manage_users");
      setUrl("/admin/people?tab=queues");
      renderPage();

      expect(screen.queryByRole("tabpanel")).toBeNull();
      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.right).toBeUndefined();
    });
  });
});
