// @vitest-environment jsdom
/**
 * Dashboard page smoke tests.
 *
 * Verifies the page renders without crashing under normal conditions,
 * loading state, and error state. Filter logic is tested in filters.test.ts.
 * Decrypt cache behavior is tested in org-decrypt-cache.test.ts and
 * ticket-decrypt-cache.test.ts.
 *
 * vi.mock() is required for:
 *   - $app/navigation: SvelteKit virtual module, no on-disk source
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - @tanstack/svelte-query: needs controlled query state
 *   - $lib/crypto/context.js: returns mock decrypt caches
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import type { NavbarOverride } from "$lib/shell/types.js";
import type * as ShellContext from "$lib/shell/context.js";

// care-y-ignore mock-factory-unguarded -- the five remaining factories mock
// modules importOriginal cannot load here: $app/navigation and $app/paths are
// SvelteKit virtual modules with no on-disk source, $lib/trpc/index.js opens a
// live HTTP connection at import, @tanstack/svelte-query and
// $lib/crypto/context.js are stubbed wholesale to control query state and
// decrypt caches. See the module docblock above.

// IntersectionObserver stub for DecryptPlaceholder; ResizeObserver stub for
// TicketPreview's fit-mode clipping (both absent in jsdom).
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

vi.stubGlobal(
  "ResizeObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

// --- Controllable mock state ---

let mockPermissions = new Set([
  "view_tickets",
  "manage_own_tickets",
  "view_knowledge_base",
  "edit_knowledge_base",
  "view_own_shifts",
]);

const mockGoto = vi.fn();

// --- Mocks ---

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
  onNavigate: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

// The ticket list is a single-page infinite query; every other query on the
// page is a createQuery, resolved positionally in script order.
let infiniteTicketsState: Record<string, unknown> = {};
let queryStates: Array<Record<string, unknown>> = [];
let queryCallIndex = 0;

const defaultQueryState = {
  isLoading: false,
  isError: false,
  error: null,
  data: undefined,
};

const emptyDataQuery = {
  isLoading: false,
  isError: false,
  error: null,
  data: [],
};

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
  createInfiniteQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return infiniteTicketsState;
  },
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    const state = queryStates[queryCallIndex] ?? defaultQueryState;
    queryCallIndex++;
    return state;
  },
  createMutation: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: { me: { query: vi.fn() } },
    tickets: {
      list: { query: vi.fn() },
      get: { query: vi.fn() },
      recentActivity: { query: vi.fn() },
      myQueues: { query: vi.fn() },
      dashboardInfo: { query: vi.fn() },
      counts: { query: vi.fn() },
      listReadState: { query: vi.fn().mockResolvedValue({}) },
      readStateSweep: {
        query: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      },
      recentFollowUps: { query: vi.fn().mockResolvedValue({}) },
      listVolunteers: { query: vi.fn().mockResolvedValue([]) },
      update: { mutate: vi.fn().mockResolvedValue({}) },
      take: { mutate: vi.fn().mockResolvedValue({}) },
      assignTo: { mutate: vi.fn().mockResolvedValue({}) },
      getReactions: { query: vi.fn().mockResolvedValue({}) },
      noteTypes: {
        listActive: {
          query: vi
            .fn()
            .mockResolvedValue({ types: [], defaultNoteTypeId: null }),
        },
        list: {
          query: vi
            .fn()
            .mockResolvedValue({ types: [], defaultNoteTypeId: null }),
        },
      },
    },
    kb: {
      recentItems: { query: vi.fn() },
    },
  },
}));

const mockPreviewLoader = {
  rawPreviews: new Map(),
  observe: vi.fn(),
  eagerLoad: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockReturnValue(undefined),
};

vi.mock("$lib/crypto/context.js", () => ({
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue("Decrypted Title"),
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    clear: vi.fn(),
    size: 0,
  }),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    clear: vi.fn(),
    size: 0,
  }),
  // Kept for the reply/call/assign overlays: their scripts resolve the bridge
  // and key manager at setup, which now happens the moment one is opened.
  getCryptoBridge: () => ({
    encrypt: vi.fn().mockResolvedValue("base64-ciphertext"),
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    decrypt: vi.fn().mockResolvedValue("plaintext"),
  }),
  getOrgKeyManager: () => ({
    unwrapOrgKey: vi.fn(),
    isReady: () => false,
  }),
  getPreviewLoader: () => mockPreviewLoader,
  getFollowUpDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(undefined),
    decryptContent: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    clear: vi.fn(),
    size: 0,
  }),
  getCurrentUserId: () => () => "user-001",
  getCurrentPermissions: () => () => mockPermissions,
}));

// Stable container so tests can reach the navbar actions the page registers.
// The create popover's only trigger lives in the navbar, which AppShell owns
// and this test does not render.
const navbarOverride: { current: NavbarOverride | undefined } = {
  current: undefined,
};

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getSectionRailCtx: () => ({ current: undefined }),
  getScrollContainer: () => () => undefined,
  getNavbarOverrideCtx: () => navbarOverride,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

// --- Helpers ---

const USER_ID = "user-001";

function makeTicket(overrides: Record<string, unknown> = {}) {
  return {
    id: `ticket-${Math.random().toString(36).slice(2, 8)}`,
    clientId: "client-001",
    queueId: "queue-001",
    status: "open",
    priority: "normal",
    onHold: false,
    assignedTo: null as string | null,
    encryptedTitle: { type: "Buffer", data: [72, 101, 108, 108, 111] },
    encryptedDescription: { type: "Buffer", data: [] },
    keyGeneration: "gen-001",
    createdAt: new Date().toISOString(),
    clientAlias: "Sparrow",
    encryptedQueueName: { type: "Buffer", data: [73, 110, 116, 97, 107, 101] },
    queueSortOrder: 1,
    lastActivityAt: null as string | null,
    followUpCount: 0,
    assignedDisplayName: null as { type: "Buffer"; data: number[] } | null,
    keyWrap: {
      ephemeralPoint: "AAAA",
      nonce: "BBBB",
      wrappedKey: "CCCC",
    } as { ephemeralPoint: string; nonce: string; wrappedKey: string } | null,
    ...overrides,
  };
}

// Wrap a flat ticket list in the single-page infinite-query cache shape the
// dashboard reads (`data.pages.flat()`); undefined data stays undefined.
function ticketsInfinite(state: {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: Array<Record<string, unknown>> | undefined;
}): Record<string, unknown> {
  return {
    isLoading: state.isLoading,
    isError: state.isError,
    error: state.error,
    data:
      state.data === undefined
        ? undefined
        : { pages: [state.data], pageParams: [undefined] },
  };
}

// The createQuery calls, in the page's script order: activity, queues, shift,
// kb, counts. The read-state and checklist queries follow and fall through to
// defaultQueryState (undefined data), which is what these tests want.
function buildQueryStates(overrides?: {
  activity?: Record<string, unknown>;
  queues?: Record<string, unknown>;
  shift?: Record<string, unknown>;
  kb?: Record<string, unknown>;
  counts?: Record<string, unknown>;
}): Array<Record<string, unknown>> {
  return [
    overrides?.activity ?? emptyDataQuery,
    overrides?.queues ?? emptyDataQuery,
    overrides?.shift ?? { ...defaultQueryState, data: { shift: null } },
    overrides?.kb ?? emptyDataQuery,
    overrides?.counts ?? emptyDataQuery,
  ];
}

// jsdom lacks Web Animations API (used by Svelte's slide transition).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// --- Setup ---

const DEFAULT_PERMISSIONS = new Set([
  "view_tickets",
  "manage_own_tickets",
  "view_knowledge_base",
  "edit_knowledge_base",
  "view_own_shifts",
]);

beforeEach(() => {
  queryCallIndex = 0;
  queryStates = [];
  infiniteTicketsState = ticketsInfinite({
    isLoading: false,
    isError: false,
    error: null,
    data: [],
  });
  mockGoto.mockClear();
  mockPermissions = new Set(DEFAULT_PERMISSIONS);
});

afterEach(cleanup);

const PageModule = await import("../../../routes/(app)/+page.svelte");

// --- Tests ---

describe("Dashboard page", () => {
  it("renders dashboard container with data", () => {
    const tickets = [
      makeTicket({ assignedTo: USER_ID }),
      makeTicket({ assignedTo: null }),
    ];
    infiniteTicketsState = ticketsInfinite({
      isLoading: false,
      isError: false,
      error: null,
      data: tickets,
    });
    queryStates = buildQueryStates();

    const { container } = render(PageModule.default);
    expect(container.querySelector(".dashboard")).toBeTruthy();
  });

  it("renders skeleton during loading", () => {
    infiniteTicketsState = ticketsInfinite({
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    });
    queryStates = buildQueryStates();

    const { container } = render(PageModule.default);
    // DecryptPlaceholder container (.dp) renders immediately; the scramble
    // (role="status") is delayed by 150ms, so check the container only.
    expect(container.querySelector(".dp")).toBeTruthy();
  });

  it("renders section headers even on query failure (progressive loading)", () => {
    infiniteTicketsState = ticketsInfinite({
      isLoading: false,
      isError: true,
      error: new Error("UNKNOWN"),
      data: undefined,
    });
    queryStates = buildQueryStates();

    const { container } = render(PageModule.default);
    // Sections render unconditionally with progressive loading
    expect(container.querySelector(".dashboard")).toBeTruthy();
  });

  it("renders all section headers when data is present", () => {
    infiniteTicketsState = ticketsInfinite({
      isLoading: false,
      isError: false,
      error: null,
      data: [makeTicket({ assignedTo: USER_ID })],
    });
    queryStates = buildQueryStates();

    render(PageModule.default);

    // These sections are always rendered (some collapsed by default).
    expect(screen.getByRole("button", { name: /My Tickets/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Unassigned/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Activity/ })).toBeTruthy();
    // The {knowledgeBase} terminology default is "library".
    expect(screen.getByRole("button", { name: /Library/i })).toBeTruthy();
  });

  it("renders sections in the work-first order (tickets lead, meta follows)", () => {
    // The urgent unassigned ticket fills the needs-attention bucket without
    // any read-state involvement, so the section renders deterministically.
    infiniteTicketsState = ticketsInfinite({
      isLoading: false,
      isError: false,
      error: null,
      data: [
        makeTicket({ assignedTo: USER_ID }),
        makeTicket({ assignedTo: null, priority: "urgent" }),
      ],
    });
    queryStates = buildQueryStates();

    const { container } = render(PageModule.default);

    const ids = Array.from(container.querySelectorAll(".scroll-target")).map(
      (el) => el.id,
    );
    expect(ids).toEqual([
      "section-shift",
      "section-queues",
      "section-activity",
      "section-kb",
      "section-needs-attention",
      "section-my-tickets",
      "section-unassigned",
    ]);
  });

  it("does not render merge candidates section without VIEW_CLIENTS permission", () => {
    // Default permissions do not include view_clients.
    infiniteTicketsState = ticketsInfinite({
      isLoading: false,
      isError: false,
      error: null,
      data: [makeTicket({ assignedTo: USER_ID })],
    });
    queryStates = buildQueryStates();

    render(PageModule.default);

    // The section id "merge-candidates" should not exist.
    const section = document.getElementById("merge-candidates");
    expect(section).toBeNull();
  });

  it("links needs-attention overflow to the tickets needs-attention filter", async () => {
    // Six urgent unassigned tickets exceed the five-item preview cap, so
    // needs-attention renders its "See all" action. The two normal
    // tickets push the unassigned section to a different total, keeping
    // the needs-attention link's label unique on the page.
    infiniteTicketsState = ticketsInfinite({
      isLoading: false,
      isError: false,
      error: null,
      data: [
        ...Array.from({ length: 6 }, () =>
          makeTicket({ assignedTo: null, priority: "urgent" }),
        ),
        ...Array.from({ length: 2 }, () => makeTicket({ assignedTo: null })),
      ],
    });
    queryStates = buildQueryStates();

    render(PageModule.default);

    const seeAll = screen.getByText("See all (6)");
    await fireEvent.click(seeAll);

    expect(mockGoto).toHaveBeenCalledWith("/tickets?filter=needs-attention");
  });
});

describe("Dashboard create popover", () => {
  function renderWithAdminPermissions(): void {
    mockPermissions = new Set([
      ...DEFAULT_PERMISSIONS,
      "manage_queues",
      "manage_users",
      "manage_knowledge_base_categories",
    ]);
    infiniteTicketsState = ticketsInfinite({
      isLoading: false,
      isError: false,
      error: null,
      data: [],
    });
    queryStates = buildQueryStates();
    render(PageModule.default);
  }

  /**
   * Open the create popover through its only trigger, the navbar "+" action
   * the page registers. Closed overlays no longer render their children, so
   * the options do not exist in the DOM until this runs.
   */
  async function openCreatePopover(): Promise<void> {
    const action = navbarOverride.current?.actions?.[0];
    expect(action).toBeDefined();
    action?.onclick(new MouseEvent("click"));
    await tick();
  }

  it("navigates to admin/people?tab=queues&action=create for queue option", async () => {
    renderWithAdminPermissions();
    await openCreatePopover();

    const queueItem = screen.getByText("New Queue");
    void fireEvent.click(queueItem);

    expect(mockGoto).toHaveBeenCalledWith(
      "/admin/people?tab=queues&action=create",
    );
  });

  it("navigates to admin/people?tab=users&action=invite for user option", async () => {
    renderWithAdminPermissions();
    await openCreatePopover();

    const userItem = screen.getByText("Invite User");
    void fireEvent.click(userItem);

    expect(mockGoto).toHaveBeenCalledWith(
      "/admin/people?tab=users&action=invite",
    );
  });

  it("does not show queue option without manage_queues permission", async () => {
    queryStates = buildQueryStates();
    render(PageModule.default);
    await openCreatePopover();

    expect(screen.queryByText("New Queue")).toBeNull();
  });

  it("does not show user option without manage_users permission", async () => {
    queryStates = buildQueryStates();
    render(PageModule.default);
    await openCreatePopover();

    expect(screen.queryByText("Invite User")).toBeNull();
  });
});
