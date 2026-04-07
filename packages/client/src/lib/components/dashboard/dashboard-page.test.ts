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
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    const state = queryStates[queryCallIndex] ?? defaultQueryState;
    queryCallIndex++;
    return state;
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: { me: { query: vi.fn() } },
    tickets: {
      list: { query: vi.fn() },
      recentActivity: { query: vi.fn() },
      myQueues: { query: vi.fn() },
      dashboardInfo: { query: vi.fn() },
    },
    kb: {
      recentItems: { query: vi.fn() },
    },
  },
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
  getCurrentUserId: () => () => "user-001",
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

function buildQueryStates(
  ticketsQuery: Record<string, unknown>,
  overrides?: {
    activity?: Record<string, unknown>;
    queues?: Record<string, unknown>;
    shift?: Record<string, unknown>;
    kb?: Record<string, unknown>;
  },
): Array<Record<string, unknown>> {
  return [
    ticketsQuery,
    overrides?.activity ?? emptyDataQuery,
    overrides?.queues ?? emptyDataQuery,
    overrides?.shift ?? { ...defaultQueryState, data: { shift: null } },
    overrides?.kb ?? emptyDataQuery,
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

beforeEach(() => {
  queryCallIndex = 0;
  queryStates = [];
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
    queryStates = buildQueryStates({
      isLoading: false,
      isError: false,
      error: null,
      data: tickets,
    });

    const { container } = render(PageModule.default);
    expect(container.querySelector(".dashboard")).toBeTruthy();
  });

  it("renders skeleton during loading", () => {
    queryStates = buildQueryStates({
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    });

    const { container } = render(PageModule.default);
    expect(container.querySelector("[role='status']")).toBeTruthy();
  });

  it("renders error message on query failure", () => {
    queryStates = buildQueryStates({
      isLoading: false,
      isError: true,
      error: new Error("UNKNOWN"),
      data: undefined,
    });

    render(PageModule.default);
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeTruthy();
  });

  it("renders all section headers when data is present", () => {
    queryStates = buildQueryStates({
      isLoading: false,
      isError: false,
      error: null,
      data: [makeTicket({ assignedTo: USER_ID })],
    });

    render(PageModule.default);

    // These sections are always rendered (some collapsed by default).
    expect(screen.getByRole("button", { name: /My Tickets/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Unassigned/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Activity/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Knowledge Base/ })).toBeTruthy();
  });
});
