// @vitest-environment jsdom
/**
 * Logs page behavior tests.
 *
 * Tests permission gating, tab state management (calls/audit), the
 * audit-tab MANAGE_USERS double gate, navbar context propagation,
 * section rendering, and tabpanel ARIA wiring. Follows the people-page
 * test harness pattern with stubbed sections and shell components.
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
import type * as CallLogFilters from "$lib/stores/call-log-filters.svelte.js";
import type * as AuditLogFilters from "$lib/stores/audit-log-filters.svelte.js";
import type * as FilterDispatch from "$lib/composables/create-filter-dispatch.svelte.js";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as FilterTypes from "$lib/components/filters/filter-types.js";
import type * as TicketQueries from "$lib/tickets/queries.js";

// --- Controllable mock state ---

let mockPermissions = new Set<string>();

let mockPageUrl = new URL("http://localhost/admin/logs");

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
    isFailed: vi.fn().mockReturnValue(false),
  }),
  getOrgKeyManager: () => ({
    get isLoaded() {
      return true;
    },
    encryptText: vi.fn().mockResolvedValue("encrypted-base64"),
  }),
  getCurrentUserId: () => () => "user-001",
}));

const mockNavbarCtx = { current: undefined as unknown };

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => ({ current: undefined }),
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
    reports: {
      callLog: {
        query: vi
          .fn()
          .mockResolvedValue({ entries: [], total: 0, page: 1, pageSize: 50 }),
      },
    },
    tickets: {
      auditLog: {
        query: vi
          .fn()
          .mockResolvedValue({ entries: [], total: 0, page: 1, pageSize: 50 }),
      },
      listVolunteers: { query: vi.fn().mockResolvedValue([]) },
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
    refetch: vi.fn(),
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
vi.mock("$lib/stores/call-log-filters.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CallLogFilters>()),
  callLogFilterStore: {
    direction: null,
    callStatus: null,
    dateFrom: null,
    dateTo: null,
    activeCount: 0,
    setDirection: vi.fn(),
    setCallStatus: vi.fn(),
    setDateRange: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/stores/audit-log-filters.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AuditLogFilters>()),
  auditLogFilterStore: {
    eventType: null,
    actorId: null,
    dateFrom: null,
    dateTo: null,
    activeCount: 0,
    setEventType: vi.fn(),
    setActorId: vi.fn(),
    setDateRange: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock(
  "$lib/composables/create-filter-dispatch.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof FilterDispatch>()),
    createFilterDispatch: (config: {
      fields: Record<
        string,
        {
          type: string;
          set?: (v: string | null) => void;
          toggle?: (v: string) => void;
        }
      >;
      sort?: {
        validate: (v: string) => boolean;
        set: (field: string, dir: "asc" | "desc") => void;
      };
      clearAll: () => void;
    }) => ({
      handlePillToggle: (field: string, value: string) => {
        const f = config.fields[field];
        if (f?.toggle) f.toggle(value);
      },
      handlePillSelect: (field: string, value: string | null) => {
        const f = config.fields[field];
        if (f?.set) f.set(value);
      },
      handlePillDateChange: vi.fn(),
      handleSortChange: (field: string, dir: "asc" | "desc") => {
        config.sort?.set(field, dir);
      },
      clearAll: config.clearAll,
      handleSavedFilterApply: vi.fn(),
      handleSavedFilterDelete: vi.fn(),
      handleSavedFilterToggleShare: vi.fn(),
      handleCreateSavedFilter: vi.fn(),
    }),
  }),
);

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  logs_page_title: () => "Logs",
  logs_tab_calls: () => "Calls",
  logs_tab_audit: () => "Audit",
  panel_call_log: () => "Call Log",
  panel_audit_log: () => "Audit Log",
  logs_filter_direction: () => "Direction",
  logs_filter_call_status: () => "Call status",
  logs_filter_date_range: () => "Date range",
  logs_filter_event_type: () => "Event type",
  logs_filter_actor: () => "Actor",
  logs_direction_inbound: () => "Inbound",
  logs_direction_outbound: () => "Outbound",
  logs_call_status_completed: () => "Completed",
  logs_call_status_no_answer: () => "No answer",
  logs_call_status_busy: () => "Busy",
  logs_call_status_failed: () => "Failed",
  logs_call_status_canceled: () => "Canceled",
}));

// vi.mock required: the real createVolunteersQuery needs a live QueryClient context.
vi.mock("$lib/tickets/queries.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TicketQueries>()),
  createVolunteersQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: [],
    refetch: vi.fn(),
  }),
}));

// vi.mock required: Svelte component with Konsta/Lucide dependencies that
// cannot render in jsdom without the full Konsta context.
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/admin/CallLogSection.svelte", async () => ({
  default: (await import("./test-helpers/StubCallLogSection.svelte")).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/admin/AuditLogSection.svelte", async () => ({
  default: (await import("./test-helpers/StubAuditLogSection.svelte")).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/shell/SubNavbarFilterLayout.svelte", async () => ({
  default: (
    await import("../people/test-helpers/StubSubNavbarFilterLayout.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/shared/IconTabToggle.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/filters/filter-types.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FilterTypes>()),
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
  mockPermissions = new Set(["view_reports", "manage_users"]);
  mockPageUrl = new URL("http://localhost/admin/logs");
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

describe("Logs page", () => {
  describe("permission guard", () => {
    it("redirects to home when user lacks VIEW_REPORTS", () => {
      setPermissions();
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("redirects when user has only MANAGE_USERS (no VIEW_REPORTS)", () => {
      setPermissions("manage_users");
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not redirect when user has VIEW_REPORTS", () => {
      setPermissions("view_reports");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("does not redirect when user has both VIEW_REPORTS and MANAGE_USERS", () => {
      setPermissions("view_reports", "manage_users");
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("tab defaults", () => {
    it("defaults to calls tab", () => {
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-calls");
    });

    it("lands on audit tab when URL has ?tab=audit", () => {
      setUrl("/admin/logs?tab=audit");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-audit");
    });

    it("ignores invalid tab param and defaults to calls", () => {
      setUrl("/admin/logs?tab=invalid");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-calls");
    });
  });

  describe("audit tab gating", () => {
    it("hides audit tab when user has VIEW_REPORTS but not MANAGE_USERS", () => {
      setPermissions("view_reports");
      renderPage();

      // Only calls panel is rendered
      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-calls");
      expect(screen.queryByText("Audit log section (0 rows)")).toBeNull();
    });

    it("forces ?tab=audit back to calls when user lacks MANAGE_USERS", () => {
      setPermissions("view_reports");
      setUrl("/admin/logs?tab=audit");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-calls");
    });

    it("shows audit tab when user has both VIEW_REPORTS and MANAGE_USERS", () => {
      setPermissions("view_reports", "manage_users");
      setUrl("/admin/logs?tab=audit");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-audit");
    });
  });

  describe("section rendering", () => {
    it("renders CallLogSection stub on calls tab", () => {
      renderPage();

      expect(screen.getByText("Call log section (0 rows)")).toBeTruthy();
      expect(screen.queryByText("Audit log section (0 rows)")).toBeNull();
    });

    it("renders AuditLogSection stub on audit tab", () => {
      setUrl("/admin/logs?tab=audit");
      renderPage();

      expect(screen.getByText("Audit log section (0 rows)")).toBeTruthy();
      expect(screen.queryByText("Call log section (0 rows)")).toBeNull();
    });
  });

  describe("tabpanel ARIA", () => {
    it("wraps calls section in a labeled tabpanel", () => {
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-calls");
      expect(panel.getAttribute("aria-labelledby")).toBe("tab-calls");
    });

    it("wraps audit section in a labeled tabpanel", () => {
      setUrl("/admin/logs?tab=audit");
      renderPage();

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-audit");
      expect(panel.getAttribute("aria-labelledby")).toBe("tab-audit");
    });
  });

  describe("navbar context", () => {
    it("sets navbar title to Logs on mount", () => {
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.title).toBe("Logs");
    });

    it("provides a subnavbar snippet to the navbar context", () => {
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.subnavbar).toBeDefined();
      expect(typeof ctx.subnavbar).toBe("function");
    });

    it("provides subnavbarHidden as a function that returns a boolean", () => {
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      const hidden = ctx.subnavbarHidden as () => boolean;
      expect(typeof hidden).toBe("function");
      // scrollDir.hidden is false (mock), so returns false
      expect(hidden()).toBe(false);
    });

    it("does not set a right action (no navbar-right actions on this page)", () => {
      renderPage();

      const ctx = mockNavbarCtx.current as Record<string, unknown>;
      expect(ctx.right).toBeUndefined();
    });
  });

  describe("no tabpanel when unauthorized", () => {
    it("does not render any tabpanel when user has no access", () => {
      setPermissions();
      renderPage();

      expect(screen.queryByRole("tabpanel")).toBeNull();
    });
  });
});
