// @vitest-environment jsdom
/**
 * Ticket list page smoke tests.
 *
 * Verifies the page renders under loading, error, and data states.
 * Filter/sort logic is tested in filters.test.ts. Decrypt cache behavior
 * is tested in ticket-decrypt-cache.test.ts. Virtual scroll is tested
 * in virtual-list.test.ts.
 *
 * vi.mock() is required for:
 *   - $app/navigation: SvelteKit virtual module
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - @tanstack/svelte-query: needs controlled query state
 *   - $lib/crypto/context.js: returns mock decrypt caches + preview loader
 *   - $lib/tickets/preview-loader.svelte.js: mock preview loader factory
 *   - $lib/stores/view-mode.svelte.js: controlled view mode state
 *   - $lib/stores/filters.svelte.js: controlled filter state
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

// --- Mocks ---

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
  onNavigate: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

// Controlled infinite query state.
let infiniteQueryState: Record<string, unknown> = {};

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
  createInfiniteQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return infiniteQueryState;
  },
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      isLoading: false,
      isError: false,
      error: null,
      data: undefined,
    };
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      list: { query: vi.fn() },
      recentFollowUps: { query: vi.fn() },
      myQueues: { query: vi.fn() },
      listVolunteers: { query: vi.fn().mockResolvedValue([]) },
      assignTo: { mutate: vi.fn().mockResolvedValue({}) },
      createFollowUp: { mutate: vi.fn().mockResolvedValue({}) },
      counts: {
        query: vi.fn().mockResolvedValue({ new: 0, active: 0, onHold: 0 }),
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

vi.mock("$lib/tickets/preview-loader.svelte.js", () => ({
  createPreviewLoader: () => mockPreviewLoader,
}));

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
  getOrgKeyManager: () => ({
    encrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    decrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    isLoaded: true,
    load: vi.fn(),
    zero: vi.fn(),
  }),
  getCurrentUserId: () => () => "user-001",
  getPreviewLoader: () => mockPreviewLoader,
  getCryptoBridge: () => ({
    encrypt: vi.fn().mockResolvedValue("base64-ciphertext"),
    decrypt: vi.fn().mockResolvedValue("plaintext"),
  }),
  getFollowUpDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(undefined),
    decryptContent: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    clear: vi.fn(),
    size: 0,
  }),
}));

const mockNavbarCtx = { current: undefined as unknown };

vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getNavbarOverrideCtx: () => mockNavbarCtx,
}));

let currentViewMode = "list";

vi.mock("$lib/stores/view-mode.svelte.js", () => ({
  viewModeStore: {
    get mode() {
      return currentViewMode;
    },
    set: vi.fn((v: string) => {
      currentViewMode = v;
    }),
  },
}));

vi.mock("$lib/stores/filters.svelte.js", () => ({
  filterStore: {
    serverParams: {
      sortBy: "date",
      sortDirection: "desc",
      limit: 50,
    },
    sort: { field: "date", direction: "desc" },
    needsDisplayStatusPostFilter: false,
    statuses: new Set(),
    queueIds: new Set(),
    priorities: new Set(),
    assigneeId: null,
    dateFrom: null,
    dateTo: null,
    activeCount: 0,
    toggleStatus: vi.fn(),
    toggleQueue: vi.fn(),
    togglePriority: vi.fn(),
    setAssignee: vi.fn(),
    setDateRange: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// --- Helpers ---

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
    assignedDisplayName: null as {
      type: "Buffer";
      data: number[];
    } | null,
    keyWrap: {
      ephemeralPoint: "AAAA",
      nonce: "BBBB",
      wrappedKey: "CCCC",
    } as {
      ephemeralPoint: string;
      nonce: string;
      wrappedKey: string;
    } | null,
    ...overrides,
  };
}

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// jsdom lacks ResizeObserver (used by VirtualList).
if (typeof globalThis.ResizeObserver === "undefined") {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
}

// jsdom lacks IntersectionObserver (used by VirtualList sentinel).
if (typeof globalThis.IntersectionObserver === "undefined") {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
}

// --- Setup ---

beforeEach(() => {
  currentViewMode = "list";
  infiniteQueryState = {};
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

// --- Tests ---

describe("Ticket list page", () => {
  it("renders skeleton during loading", () => {
    infiniteQueryState = {
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    const { container } = render(PageModule.default);
    // Skeleton component renders with role="status"
    expect(container.querySelector("[role='status']")).toBeTruthy();
  });

  it("renders error message on query failure", () => {
    infiniteQueryState = {
      isLoading: false,
      isError: true,
      error: new Error("Network failure"),
      data: undefined,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    render(PageModule.default);
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeTruthy();
  });

  it("renders ticket list container with data", () => {
    const tickets = [makeTicket(), makeTicket()];
    infiniteQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { pages: [tickets], pageParams: [undefined] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    const { container } = render(PageModule.default);
    expect(container.querySelector("[data-ticket-list]")).toBeTruthy();
  });

  it("renders ticket-list container in grid mode without grid-view class", () => {
    currentViewMode = "grid";
    const tickets = [makeTicket()];
    infiniteQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { pages: [tickets], pageParams: [undefined] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    const { container } = render(PageModule.default);
    const list = container.querySelector("[data-ticket-list]");
    expect(list).toBeTruthy();
  });

  it("renders ticket-list container in list mode", () => {
    currentViewMode = "list";
    const tickets = [makeTicket()];
    infiniteQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { pages: [tickets], pageParams: [undefined] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    const { container } = render(PageModule.default);
    const list = container.querySelector("[data-ticket-list]");
    expect(list).toBeTruthy();
  });

  it("renders empty state when no tickets match filter", () => {
    infiniteQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { pages: [[]], pageParams: [undefined] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    render(PageModule.default);
    expect(screen.getByText("No tickets match this filter.")).toBeTruthy();
  });

  // Navbar override context shape is the shell integration contract between page and AppShell.
  it("sets subnavbar snippet on navbar override context", () => {
    infiniteQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { pages: [[]], pageParams: [undefined] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    render(PageModule.default);
    // The header content (title, stats, filters, view toggle) is now
    // rendered via a subnavbar snippet in AppShell's navbar override.
    expect(mockNavbarCtx.current).toBeTruthy();
    expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    expect(
      typeof (mockNavbarCtx.current as Record<string, unknown>).subnavbarHidden,
    ).toBe("function");
  });
});
