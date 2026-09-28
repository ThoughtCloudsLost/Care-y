// @vitest-environment jsdom
/**
 * Dashboard page smoke tests.
 *
 * Verifies the page renders without crashing under normal conditions,
 * loading state, and error state, and that it runs one query per ticket
 * lane. Lane narrowing, counting and refill are tested in
 * create-dashboard-lane.svelte.test.ts. Decrypt cache behavior is tested
 * in org-decrypt-cache.test.ts and ticket-decrypt-cache.test.ts.
 *
 * vi.mock() is required for:
 *   - $app/navigation: SvelteKit virtual module, no on-disk source
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - @tanstack/svelte-query: needs controlled query state
 *   - $lib/crypto/context.js: returns mock decrypt caches
 */

import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  beforeEach,
  type MockInstance,
} from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  within,
} from "@testing-library/svelte";
import { tick } from "svelte";
import type { NavbarOverride } from "$lib/shell/types.js";
import type * as ArrangementNS from "$lib/composables/dashboard/create-dashboard-arrangement.svelte.js";
import type * as ShellContext from "$lib/shell/context.js";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as PathsNS from "$app/paths";
import type * as NavigationNS from "$app/navigation";
import {
  Permission,
  kbCategoryIdSchema,
  queueIdSchema,
  userIdSchema,
  type DashboardLaneId,
  type LaneFilterState,
} from "@care-y/shared";
import { setPermissions, getMockPermissions } from "$mocks/permissions.js";
import { kbKeys, ticketsKeys } from "$lib/query/keys.js";
import { filterStore } from "$lib/stores/filters.svelte.js";
import {
  dashboardFilters,
  emptyDashboardFilters,
  emptyLaneFilterState,
  type DashboardFilters,
} from "$lib/prefs/dashboard-filters.svelte.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { DASHBOARD_CONTEXT_REFRESH_MS } from "$lib/tickets/dashboard-lanes.js";

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

const mockGoto = vi.fn();

// Section queries whose inputs the filter tests read back.
const { mockRecentActivity, mockKbListItems } = vi.hoisted(() => ({
  mockRecentActivity: vi.fn(),
  mockKbListItems: vi.fn(),
}));

// Org-key decrypts, keyed by cache key. Null means decrypt pending.
const mockOrgDecrypt = vi.fn<(key: string) => string | null>();

// --- Mocks ---

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NavigationNS>()),
  goto: mockGoto,
  onNavigate: vi.fn(),
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof PathsNS>()),
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

// Every lane's infinite query answers with the same rows; each lane
// narrows them by its own rule. Other queries resolve by key.
let ticketRows: Array<Record<string, unknown>> | undefined = [];
let ticketsLoading = false;
let ticketsError: unknown = null;
// Facet index rows (the lane counts); undefined = index pending.
let facetIndexRows: Array<Record<string, unknown>> | undefined = undefined;
// The query options each lane built, in lane order.
let laneQueries: Array<{
  queryKey: unknown;
  enabled: unknown;
  refetchInterval: unknown;
}> = [];
// Every createQuery options object the page built, by query name.
let infoQueries: Partial<Record<QueryName, Record<string, unknown>>> = {};

type QueryName = "activity" | "queues" | "shift" | "kb";
let queryOverrides: Partial<Record<QueryName, Record<string, unknown>>> = {};

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

const DEFAULT_QUERY_STATES: Record<QueryName, Record<string, unknown>> = {
  activity: { ...defaultQueryState, data: { entries: [], lastHourCount: 0 } },
  queues: emptyDataQuery,
  shift: { ...defaultQueryState, data: { shift: null } },
  kb: {
    ...defaultQueryState,
    data: { items: [], nextCursor: null, total: 0 },
  },
};

/** True when `key` starts with every element of `prefix`. */
function keyStartsWith(key: unknown, prefix: readonly unknown[]): boolean {
  if (!Array.isArray(key)) return false;
  return prefix.every(
    (part, i) => JSON.stringify(key[i]) === JSON.stringify(part),
  );
}

function queryNameFor(key: unknown): QueryName | undefined {
  // Activity and KB keys carry the section's filters after the prefix.
  if (keyStartsWith(key, ticketsKeys.recentActivity())) return "activity";
  if (keyStartsWith(key, [...kbKeys.items(), "dashboard"])) return "kb";
  const k = JSON.stringify(key);
  if (k === JSON.stringify(ticketsKeys.myQueues())) return "queues";
  if (k === JSON.stringify(ticketsKeys.dashboardInfo())) return "shift";
  return undefined;
}

function queryState(key: unknown): Record<string, unknown> {
  if (JSON.stringify(key) === JSON.stringify(ticketsKeys.facetIndex())) {
    return {
      ...defaultQueryState,
      data:
        facetIndexRows === undefined
          ? undefined
          : { rows: facetIndexRows, complete: true },
    };
  }
  const name = queryNameFor(key);
  if (name === undefined) return defaultQueryState;
  return queryOverrides[name] ?? DEFAULT_QUERY_STATES[name];
}

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
  createInfiniteQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    laneQueries.push({
      queryKey: opts.queryKey,
      enabled: opts.enabled,
      refetchInterval: opts.refetchInterval,
    });
    return {
      get data() {
        return ticketRows === undefined
          ? undefined
          : { pages: [ticketRows], pageParams: [undefined] };
      },
      get isLoading() {
        return ticketsLoading;
      },
      get isFetching() {
        return ticketsLoading;
      },
      get isSuccess() {
        return !ticketsLoading && ticketsError === null;
      },
      get isError() {
        return ticketsError !== null;
      },
      get error() {
        return ticketsError;
      },
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    };
  },
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const name = queryNameFor(opts.queryKey);
    if (name !== undefined) infoQueries[name] = opts;
    return queryState(opts.queryKey);
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

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    auth: { me: { query: vi.fn() } },
    tickets: {
      list: { query: vi.fn() },
      get: { query: vi.fn() },
      recentActivity: { query: mockRecentActivity },
      myQueues: { query: vi.fn() },
      dashboardInfo: { query: vi.fn() },
      counts: { query: vi.fn() },
      facetIndex: {
        query: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      },
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
      listItems: { query: mockKbListItems },
      listCategories: { query: vi.fn().mockResolvedValue([]) },
      listAuthors: { query: vi.fn().mockResolvedValue([]) },
    },
    org: {
      getChannelPolicy: {
        query: vi.fn().mockResolvedValue({
          smsEnabled: true,
          emailEnabled: true,
          secureLinkEnabled: true,
          voiceEnabled: true,
          shareLinkEnabled: true,
        }),
      },
    },
  },
}));

const mockPreviewLoader = {
  rawPreviews: new Map(),
  observe: vi.fn(),
  eagerLoad: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockReturnValue(undefined),
};

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue("Decrypted Title"),
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    clear: vi.fn(),
    size: 0,
  }),
  getOrgDecryptCache: () => ({
    decrypt: mockOrgDecrypt,
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    clear: vi.fn(),
    size: 0,
  }),
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
  getCurrentPermissions: () => getMockPermissions,
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

// The lane arrangement comes from the layout, which jsdom does not do:
// each test sets the lanes per row (and board mode) it renders under.
// boardHeight is the dashboard's height in board mode, as reported.
const arrangement = vi.hoisted(() => ({
  lanesPerRow: 1,
  board: false,
  boardHeight: 800,
}));

vi.mock(
  "$lib/composables/dashboard/create-dashboard-arrangement.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof ArrangementNS>()),
    createDashboardArrangement: () => ({
      get lanesPerRow() {
        return arrangement.lanesPerRow;
      },
      get stacked() {
        return arrangement.lanesPerRow === 1;
      },
      get board() {
        return arrangement.board;
      },
      get boardHeight() {
        return arrangement.board ? arrangement.boardHeight : undefined;
      },
    }),
  }),
);

// --- Helpers ---

const USER_ID = "user-001";

// Branded filter ids, built the way section-filters.test.ts builds them.
const QUEUE = queueIdSchema.parse("00000000-0000-4000-8000-0000000000a1");
const CATEGORY_1 = kbCategoryIdSchema.parse(
  "00000000-0000-4000-8000-0000000000c1",
);
const CATEGORY_2 = kbCategoryIdSchema.parse(
  "00000000-0000-4000-8000-0000000000c2",
);
const KB_AUTHOR = userIdSchema.parse("00000000-0000-4000-8000-0000000000d1");

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
    hasResponse: false,
    assignedDisplayName: null as { type: "Buffer"; data: number[] } | null,
    keyWrap: {
      ephemeralPoint: "AAAA",
      nonce: "BBBB",
      wrappedKey: "CCCC",
    } as { ephemeralPoint: string; nonce: string; wrappedKey: string } | null,
    ...overrides,
  };
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

const DEFAULT_PERMISSIONS: readonly Permission[] = [
  Permission.VIEW_CASES,
  Permission.WRITE_CASE_NOTES,
  Permission.VIEW_KNOWLEDGE_BASE,
  Permission.EDIT_KNOWLEDGE_BASE,
  Permission.VIEW_OWN_SHIFTS,
];

beforeEach(() => {
  arrangement.lanesPerRow = 1;
  arrangement.board = false;
  queryOverrides = {};
  ticketRows = [];
  ticketsLoading = false;
  ticketsError = null;
  facetIndexRows = undefined;
  laneQueries = [];
  infoQueries = {};
  mockRecentActivity.mockReset();
  mockRecentActivity.mockResolvedValue({ entries: [], lastHourCount: 0 });
  mockKbListItems.mockReset();
  mockKbListItems.mockResolvedValue({ items: [], nextCursor: null, total: 0 });
  filterStore.clearAll();
  mockGoto.mockClear();
  mockOrgDecrypt.mockReset();
  mockOrgDecrypt.mockReturnValue(null);
  setPermissions(...DEFAULT_PERMISSIONS);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * Serves `filters` as the stored dashboard filters document, already
 * loaded. Returns the spied setters.
 */
function useStoredFilters(filters: Partial<DashboardFilters>) {
  const value: DashboardFilters = { ...emptyDashboardFilters(), ...filters };
  vi.spyOn(dashboardFilters, "value", "get").mockReturnValue(value);
  vi.spyOn(dashboardFilters, "hydrated", "get").mockReturnValue(true);
  return {
    setLane: vi.spyOn(dashboardFilters, "setLane"),
    setActivity: vi.spyOn(dashboardFilters, "setActivity"),
  };
}

const PageModule = await import("../../../routes/(app)/+page.svelte");

// --- Tests ---

describe("Dashboard page", () => {
  it("renders dashboard container with data", () => {
    ticketRows = [
      makeTicket({ assignedTo: USER_ID }),
      makeTicket({ assignedTo: null }),
    ];

    const { container } = render(PageModule.default);
    expect(container.querySelector(".dashboard")).toBeTruthy();
  });

  it("runs one ticket query per lane, each with its own params", () => {
    render(PageModule.default);

    expect(laneQueries).toHaveLength(4);
    expect(laneQueries.map((q) => q.enabled)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    const params = laneQueries.map((q) => {
      const key = q.queryKey as readonly unknown[];
      expect(key.slice(0, 2)).toEqual(ticketsKeys.lists());
      return key[2] as Record<string, unknown>;
    });
    // Lane order: needs attention, my tickets, unassigned, on hold.
    expect(params[0]).toMatchObject({ statuses: ["open"], onHold: false });
    expect(params[0]?.assignedTo).toBeUndefined();
    expect(params[1]).toMatchObject({
      statuses: ["open"],
      onHold: false,
      assignedTo: USER_ID,
    });
    expect(params[2]).toMatchObject({
      statuses: ["open"],
      onHold: false,
      assignedTo: null,
    });
    expect(params[3]).toMatchObject({ statuses: ["open"], onHold: true });
  });

  it("renders skeleton during loading", () => {
    ticketsLoading = true;
    ticketRows = undefined;

    const { container } = render(PageModule.default);
    // DecryptPlaceholder container (.dp) renders immediately; the scramble
    // (role="status") is delayed by 150ms, so check the container only.
    expect(container.querySelector(".dp")).toBeTruthy();
  });

  it("renders section headers even on query failure (progressive loading)", () => {
    ticketsError = new Error("UNKNOWN");
    ticketRows = undefined;

    const { container } = render(PageModule.default);
    // Sections render unconditionally with progressive loading
    expect(container.querySelector(".dashboard")).toBeTruthy();
  });

  it("renders all section headers when data is present", () => {
    ticketRows = [makeTicket({ assignedTo: USER_ID })];

    render(PageModule.default);

    // These sections are always rendered (some collapsed by default).
    // Anchored: each section's filter button is named "Filter <heading>".
    expect(screen.getByRole("button", { name: /^My Tickets/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Unassigned/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Activity/ })).toBeTruthy();
    // The {knowledgeBase} terminology default is "library".
    expect(screen.getByRole("button", { name: /^Library/i })).toBeTruthy();
  });

  it("renders sections in the work-first order (tickets lead, meta follows)", () => {
    // The urgent unassigned ticket fills the needs-attention lane without
    // any read-state involvement, so the section renders deterministically.
    ticketRows = [
      makeTicket({ assignedTo: USER_ID }),
      makeTicket({ assignedTo: null, priority: "urgent" }),
    ];

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

  it("shows On hold once the lane holds a ticket", () => {
    ticketRows = [makeTicket({ onHold: true })];

    const { container } = render(PageModule.default);

    expect(container.querySelector("#section-on-hold")).toBeTruthy();
  });

  it("heads a lane with its shown rows of the facet-index total", () => {
    const unassigned = Array.from({ length: 12 }, () =>
      makeTicket({ assignedTo: null }),
    );
    ticketRows = unassigned;
    facetIndexRows = unassigned;

    const { container } = render(PageModule.default);

    const count = container.querySelector("#section-unassigned .secline-cnt");
    expect(count?.textContent).toBe("8 of 12");
  });

  it("heads a lane showing everything it holds with the bare total", () => {
    const mine = [makeTicket({ assignedTo: USER_ID })];
    ticketRows = mine;
    facetIndexRows = mine;

    const { container } = render(PageModule.default);

    const count = container.querySelector("#section-my-tickets .secline-cnt");
    expect(count?.textContent).toBe("1");
  });

  it("does not render merge candidates section without VIEW_CLIENTS permission", () => {
    // Default permissions do not include view_clients.
    ticketRows = [makeTicket({ assignedTo: USER_ID })];

    render(PageModule.default);

    // The section id "merge-candidates" should not exist.
    const section = document.getElementById("merge-candidates");
    expect(section).toBeNull();
  });

  it("does not render the knowledge base section without the view-knowledge-base permission", () => {
    // Remove VIEW_KNOWLEDGE_BASE from the permission set.
    setPermissions(
      Permission.VIEW_CASES,
      Permission.WRITE_CASE_NOTES,
      Permission.VIEW_OWN_SHIFTS,
    );
    ticketRows = [makeTicket({ assignedTo: USER_ID })];

    render(PageModule.default);

    const section = document.getElementById("section-kb");
    expect(section).toBeNull();
  });

  it("opens needs-attention overflow on the tickets page with the lane's filters, not a URL param", async () => {
    // Nine urgent unassigned tickets exceed the lane cap of eight, so
    // needs-attention renders its "See all" action. The two normal
    // tickets push the unassigned section to a different total, keeping
    // the needs-attention link's label unique on the page.
    const rows = [
      ...Array.from({ length: 9 }, () =>
        makeTicket({ assignedTo: null, priority: "urgent" }),
      ),
      ...Array.from({ length: 2 }, () => makeTicket({ assignedTo: null })),
    ];
    ticketRows = rows;
    facetIndexRows = rows;

    render(PageModule.default);

    const seeAll = screen.getByText("See all (9)");
    await fireEvent.click(seeAll);

    expect(mockGoto).toHaveBeenCalledWith("/tickets");
    expect(filterStore.needsAttentionOnly).toBe(true);
    expect([...filterStore.statuses]).toEqual(["new", "active"]);
  });
});

describe("Dashboard lane arrangement", () => {
  const LANE_IDS: readonly DashboardLaneId[] = [
    "needs-attention",
    "my-tickets",
    "unassigned",
    "on-hold",
  ];

  function laneHeading(name: RegExp): HTMLElement {
    return screen.getByRole("heading", { level: 2, name });
  }

  it("hides empty Needs attention and On hold while stacked", () => {
    const { container } = render(PageModule.default);

    expect(container.querySelector("#section-needs-attention")).toBeNull();
    expect(container.querySelector("#section-on-hold")).toBeNull();
    expect(container.querySelector("#section-my-tickets")).toBeTruthy();
  });

  it("keeps collapsible lane toggles while stacked", () => {
    render(PageModule.default);
    expect(screen.getByRole("button", { name: /^Unassigned/ })).toBeTruthy();
  });

  it("keeps every lane's slot, empty ones showing their empty state, side by side", () => {
    arrangement.lanesPerRow = 2;
    const { container } = render(PageModule.default);

    const lanes = [...container.querySelectorAll("[data-lane]")].map((el) =>
      el.getAttribute("data-lane"),
    );
    expect(lanes).toEqual(LANE_IDS);
    const onHold = container.querySelector<HTMLElement>("#section-on-hold");
    if (onHold === null) throw new Error("no on-hold lane");
    expect(within(onHold).getByText("Nothing here right now")).toBeTruthy();
  });

  it("makes lanes plain headings, not collapsible, side by side", () => {
    arrangement.lanesPerRow = 2;
    render(PageModule.default);

    expect(laneHeading(/^Unassigned/)).toBeTruthy();
    expect(laneHeading(/^On Hold/)).toBeTruthy();
    // The filter button is named "Filter <lane>"; no toggle is left.
    expect(screen.queryByRole("button", { name: /^Unassigned/ })).toBeNull();
    // Unassigned starts collapsed when stacked; side by side it shows.
    expect(
      document.querySelector("#section-unassigned .section-content"),
    ).toBeTruthy();
  });

  it("leaves the band sections collapsible side by side", () => {
    arrangement.lanesPerRow = 2;
    render(PageModule.default);
    expect(screen.getByRole("button", { name: /^Activity/ })).toBeTruthy();
  });

  it("gives each lane a scrolling, labelled body and locks the height in board mode", () => {
    arrangement.lanesPerRow = 4;
    arrangement.board = true;
    ticketRows = [makeTicket({ assignedTo: USER_ID })];
    const { container } = render(PageModule.default);

    const dashboard = container.querySelector<HTMLElement>(".dashboard");
    expect(dashboard?.hasAttribute("data-board")).toBe(true);
    expect(dashboard?.style.height).toBe(
      `${String(arrangement.boardHeight)}px`,
    );

    for (const id of LANE_IDS) {
      const body = container.querySelector(`#section-${id} .preview-body`);
      expect(body?.getAttribute("role")).toBe("region");
      expect(body?.getAttribute("tabindex")).toBe("0");
      expect(body?.getAttribute("aria-labelledby")).toBe(`${id}-heading`);
      expect(document.getElementById(`${id}-heading`)).toBeTruthy();
    }
  });

  it("keeps lane bodies as plain blocks while the page scrolls", () => {
    arrangement.lanesPerRow = 2;
    const { container } = render(PageModule.default);

    expect(
      container.querySelector(".dashboard")?.hasAttribute("data-board"),
    ).toBe(false);
    const body = container.querySelector("#section-my-tickets .preview-body");
    expect(body).toBeTruthy();
    expect(body?.hasAttribute("role")).toBe(false);
    expect(body?.hasAttribute("tabindex")).toBe(false);
  });

  it("marks the lanes grid with the view mode the breakpoints key on", () => {
    const { container } = render(PageModule.default);
    expect(
      container.querySelector(".lanes")?.getAttribute("data-view-mode"),
    ).toBeTruthy();
  });
});

describe("Dashboard activity feed", () => {
  const now = new Date().toISOString();
  const activityData = [
    {
      kind: "ticket",
      id: "a-ticket",
      eventType: "followup_added",
      ticketId: "ticket-9",
      clientId: "client-9",
      encryptedClientAlias: "YWxpYXM=",
      queueId: "queue-mine",
      encryptedQueueName: "bWluZQ==",
      createdAt: now,
    },
    {
      kind: "ticket_outside_queues",
      id: "a-outside",
      eventType: "ticket_closed",
      queueId: "queue-other",
      encryptedQueueName: "b3RoZXI=",
      createdAt: now,
    },
    {
      kind: "org",
      id: "a-org",
      eventType: "queue_created",
      createdAt: now,
    },
  ];

  function renderFeed(lastHourCount = 12) {
    mockOrgDecrypt.mockImplementation((key) => {
      if (key === "client-alias:client-9") return "Sparrow";
      if (key === "queue:queue-mine") return "Intake";
      if (key === "queue:queue-other") return "Legal";
      return null;
    });
    queryOverrides = {
      activity: {
        ...defaultQueryState,
        data: { entries: activityData, lastHourCount },
      },
    };
    const { container } = render(PageModule.default);
    const rows = Array.from(
      container.querySelectorAll("#section-activity .activity-row"),
    );
    const summary = container.querySelector(
      "#section-activity .activity-summary span",
    );
    return { rows, summary };
  }

  it("summarises the server's last-hour count rather than the rows returned", () => {
    const { rows, summary } = renderFeed(12);
    expect(rows).toHaveLength(3);
    expect(summary?.textContent).toBe("12 events in the last hour");
  });

  it("uses the singular summary when one event falls in the last hour", () => {
    const { summary } = renderFeed(1);
    expect(summary?.textContent).toBe("1 event in the last hour");
  });

  it("decrypts the alias only for ticket rows and the queue name for both ticket kinds", () => {
    renderFeed();
    const keys = mockOrgDecrypt.mock.calls.map(([key]) => key);
    expect(keys).toContain("client-alias:client-9");
    expect(keys).toContain("queue:queue-mine");
    expect(keys).toContain("queue:queue-other");
    // The outside-queue and org rows carry no alias to decrypt.
    const aliasKeys = keys.filter((key) => key.startsWith("client-alias:"));
    expect(aliasKeys).toEqual(["client-alias:client-9"]);
  });

  it("renders a ticket row that opens its ticket expanded", async () => {
    const { rows } = renderFeed();
    expect(rows).toHaveLength(3);
    const ticketRow = rows[0]!;
    expect(ticketRow.getAttribute("role")).toBe("button");
    expect(ticketRow.textContent).toContain("Sparrow");
    expect(ticketRow.textContent).toContain("in Intake");
    await fireEvent.click(ticketRow);
    expect(mockGoto).toHaveBeenCalledWith("/tickets/ticket-9?full=1");
  });

  it("renders an outside-queue row with its queue and no alias or tap", async () => {
    const { rows } = renderFeed();
    const outsideRow = rows[1]!;
    expect(outsideRow.getAttribute("role")).toBeNull();
    expect(outsideRow.querySelector(".activity-alias")).toBeNull();
    expect(outsideRow.textContent).toContain("in Legal");
    await fireEvent.click(outsideRow);
    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("renders an org row with its label and no queue, alias or tap", async () => {
    const { rows } = renderFeed();
    const orgRow = rows[2]!;
    expect(orgRow.getAttribute("role")).toBeNull();
    expect(orgRow.querySelector(".activity-event")?.textContent).toBe(
      "Queue created",
    );
    expect(orgRow.querySelector(".activity-alias")).toBeNull();
    expect(orgRow.querySelector(".activity-queue")).toBeNull();
    await fireEvent.click(orgRow);
    expect(mockGoto).not.toHaveBeenCalled();
  });
});

describe("Dashboard create popover", () => {
  function renderWithAdminPermissions(): void {
    setPermissions(
      ...DEFAULT_PERMISSIONS,
      Permission.MANAGE_QUEUES,
      Permission.MANAGE_USERS,
      Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
    );
    ticketRows = [];
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
    render(PageModule.default);
    await openCreatePopover();

    expect(screen.queryByText("New Queue")).toBeNull();
  });

  it("does not show user option without manage_users permission", async () => {
    render(PageModule.default);
    await openCreatePopover();

    expect(screen.queryByText("Invite User")).toBeNull();
  });
});

describe("Dashboard section filters", () => {
  async function runQuery(name: QueryName): Promise<void> {
    const queryFn = infoQueries[name]?.queryFn;
    if (typeof queryFn !== "function") {
      throw new Error(`no ${name} query`);
    }
    await (queryFn as () => Promise<unknown>)();
  }

  it("sends the activity filters with the feed query and keys it by them", async () => {
    useStoredFilters({
      activity: { kinds: ["org"], queueIds: [QUEUE] },
    });
    render(PageModule.default);

    const filters = { kinds: ["org"], queueIds: [QUEUE] };
    expect(infoQueries.activity?.queryKey).toEqual(
      ticketsKeys.recentActivity(filters),
    );
    await runQuery("activity");
    expect(mockRecentActivity).toHaveBeenCalledWith({ limit: 5, ...filters });
  });

  it("sends no activity filter when none is set", async () => {
    render(PageModule.default);
    await runQuery("activity");
    expect(mockRecentActivity).toHaveBeenCalledWith({ limit: 5 });
  });

  it("shows the activity filter row while filters are active and clears them", async () => {
    const { setActivity } = useStoredFilters({
      activity: { kinds: ["ticket"], queueIds: [] },
    });
    const { container } = render(PageModule.default);
    // The row opens once the loaded filters have applied.
    await tick();

    const row = container.querySelector<HTMLElement>("#activity-filters");
    if (row === null) throw new Error("no activity filter row");
    const button = screen.getByRole("button", { name: "Filter Activity" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-controls")).toBe("activity-filters");

    const clear = within(row).getByText("Clear all");
    await fireEvent.click(clear);
    expect(setActivity).toHaveBeenCalledWith({ kinds: [], queueIds: [] });
  });

  it("hides a collapsed section's filters, and the filter button reopens both", async () => {
    const { container } = render(PageModule.default);
    const filterButton = screen.getByRole("button", {
      name: "Filter Activity",
    });
    await fireEvent.click(filterButton);
    expect(container.querySelector("#activity-filters")).toBeTruthy();

    // Collapse the section from its header toggle.
    await fireEvent.click(
      screen.getByRole("button", { name: /^Activity/, expanded: true }),
    );
    expect(container.querySelector("#activity-filters")).toBeNull();
    expect(filterButton.getAttribute("aria-expanded")).toBe("false");

    await fireEvent.click(filterButton);
    expect(container.querySelector("#activity-filters")).toBeTruthy();
    expect(filterButton.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens a section's filter row from its filter button", async () => {
    const { container } = render(PageModule.default);
    expect(container.querySelector("#activity-filters")).toBeNull();

    await fireEvent.click(
      screen.getByRole("button", { name: "Filter Activity" }),
    );
    expect(container.querySelector("#activity-filters")).toBeTruthy();
  });

  it("lists the KB section's articles by last update, filtered", async () => {
    useStoredFilters({
      kb: { categoryIds: [CATEGORY_1, CATEGORY_2], createdBy: KB_AUTHOR },
    });
    render(PageModule.default);

    const input = {
      sortBy: "updated_at",
      sortDirection: "desc",
      limit: 5,
      categoryIds: [CATEGORY_1, CATEGORY_2],
      createdBy: KB_AUTHOR,
    };
    expect(infoQueries.kb?.queryKey).toEqual(kbKeys.dashboardItems(input));
    await runQuery("kb");
    expect(mockKbListItems).toHaveBeenCalledWith(input);
  });

  // Organization and knowledge base changes have no live event; ticket
  // lanes are refreshed by live events and never poll.
  it("polls the activity and KB sections, and no ticket lane", () => {
    render(PageModule.default);
    expect(infoQueries.activity?.refetchInterval).toBe(
      DASHBOARD_CONTEXT_REFRESH_MS,
    );
    expect(infoQueries.kb?.refetchInterval).toBe(DASHBOARD_CONTEXT_REFRESH_MS);
    expect(laneQueries.map((q) => q.refetchInterval)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("heads the KB section with the server's total", () => {
    queryOverrides = {
      kb: {
        ...defaultQueryState,
        data: { items: [], nextCursor: null, total: 42 },
      },
    };
    const { container } = render(PageModule.default);
    expect(
      container.querySelector("#section-kb .secline-cnt")?.textContent,
    ).toBe("42");
  });
});

describe("Dashboard queue tiles", () => {
  it("opens the tickets page filtered to the queue, not through a URL param", async () => {
    filterStore.togglePriority("urgent");
    queryOverrides = {
      queues: {
        ...emptyDataQuery,
        data: [
          {
            id: "queue-007",
            encryptedName: "cXVldWU=",
            encryptedColor: null,
            encryptedIcon: null,
            openCount: 3,
            urgentCount: 0,
          },
        ],
      },
    };
    const { container } = render(PageModule.default);

    const tile = container.querySelector<HTMLElement>(".queue-tile");
    if (tile === null) throw new Error("no queue tile");
    await fireEvent.click(tile);

    expect(mockGoto).toHaveBeenCalledWith("/tickets");
    expect([...filterStore.queueIds]).toEqual(["queue-007"]);
    // The queue replaces the tickets page's other filters.
    expect(filterStore.priorities.size).toBe(0);
  });
});

describe("Dashboard Apply to all", () => {
  const URGENT = { ...emptyLaneFilterState(), priorities: ["urgent" as const] };

  function applyButton(laneId: string): HTMLElement {
    const section = document.getElementById(`section-${laneId}`);
    if (section === null) throw new Error(`no ${laneId} section`);
    return within(section).getByRole("button", {
      name: /Apply these filters to all/,
    });
  }

  function savedLanes(
    setLane: MockInstance<
      (laneId: DashboardLaneId, state: LaneFilterState) => void
    >,
  ): Map<DashboardLaneId, LaneFilterState> {
    return new Map(setLane.mock.calls);
  }

  it("offers Apply to all only in a ticket lane with active filters", async () => {
    useStoredFilters({
      lanes: { ...emptyDashboardFilters().lanes, "needs-attention": URGENT },
    });
    render(PageModule.default);
    await tick();

    expect(applyButton("needs-attention")).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /Apply these filters to all/ }),
    ).toHaveLength(1);
  });

  it("copies the lane's filters to the others without asking when they have none", async () => {
    const { setLane } = useStoredFilters({
      lanes: { ...emptyDashboardFilters().lanes, "needs-attention": URGENT },
    });
    const show = vi.spyOn(toastStore, "show");
    render(PageModule.default);
    await tick();

    await fireEvent.click(applyButton("needs-attention"));
    await tick();

    expect(screen.queryByText("Replace filters in other sections?")).toBeNull();
    const saved = savedLanes(setLane);
    for (const id of ["my-tickets", "unassigned", "on-hold"] as const) {
      expect(saved.get(id)?.priorities).toEqual(["urgent"]);
    }
    expect(saved.has("needs-attention")).toBe(false);
    expect(show).toHaveBeenCalledWith("Filters applied to all sections");
  });

  it("never copies the source lane's own rule", async () => {
    const { setLane } = useStoredFilters({
      lanes: { ...emptyDashboardFilters().lanes, "my-tickets": URGENT },
    });
    render(PageModule.default);
    await tick();

    await fireEvent.click(applyButton("my-tickets"));
    await tick();

    // My tickets fixes the viewer as assignee; On hold, which leaves the
    // assignee open, still receives none.
    const onHold = savedLanes(setLane).get("on-hold");
    expect(onHold?.priorities).toEqual(["urgent"]);
    expect(onHold?.assigneeId).toBeUndefined();
    expect(onHold?.statuses).toEqual([]);
  });

  it("asks before replacing another lane's own filters", async () => {
    const { setLane } = useStoredFilters({
      lanes: {
        ...emptyDashboardFilters().lanes,
        "needs-attention": URGENT,
        unassigned: { ...emptyLaneFilterState(), queueIds: ["queue-002"] },
      },
    });
    render(PageModule.default);
    await tick();

    await fireEvent.click(applyButton("needs-attention"));
    await tick();

    expect(screen.getByText("Replace filters in other sections?")).toBeTruthy();
    expect(
      screen.getByText(
        "1 other section has its own filters. Applying replaces them.",
      ),
    ).toBeTruthy();
    expect(setLane).not.toHaveBeenCalled();

    await fireEvent.click(screen.getByText("Replace"));
    await tick();

    const unassigned = savedLanes(setLane).get("unassigned");
    expect(unassigned?.priorities).toEqual(["urgent"]);
    expect(unassigned?.queueIds).toEqual([]);
  });
});
