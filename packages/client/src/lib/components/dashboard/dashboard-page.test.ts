// @vitest-environment jsdom
/**
 * Dashboard page tests.
 *
 * Tests the dashboard's rendering behavior with mocked tRPC queries
 * and CryptoBridge. Verifies the new section-based layout: Shift,
 * Needs Attention, Queues, Activity, KB, and ticket list sections.
 *
 * vi.mock() is required for:
 *   - $app/navigation: SvelteKit virtual module, no on-disk source
 *   - $lib/trpc/index.js: live HTTP connection module (testing-reference Section 4, Q2)
 *   - @tanstack/svelte-query: needs controlled query state for test scenarios
 *   - svelte: getContext must return mock CryptoBridge (context is set in parent layout)
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

// --- Mocks (module-level, hoisted by vitest) ---

const mockGoto = vi.fn();
vi.mock("$app/navigation", () => ({
  goto: mockGoto,
  onNavigate: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

// Controlled query states. Tests set these before rendering.
// Order matches createQuery call order in the page:
// [meQuery, ticketsQuery, activityQuery, queuesQuery, shiftQuery, kbQuery]
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
    optsFn(); // Validate the options factory does not throw.
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

const mockDecrypt =
  vi.fn<
    (
      ticketId: string,
      ep: string,
      nonce: string,
      wk: string,
      ct: string,
    ) => Promise<string>
  >();

const mockBridge: Partial<CryptoBridge> = {
  decrypt: mockDecrypt,
};

// getContext('cryptoBridge') returns the mock bridge. The page component
// calls getContext in its <script> block during mount.
vi.mock("svelte", async () => {
  const actual = await vi.importActual("svelte");
  const originalGetContext = actual.getContext as (key: string) => unknown;
  return {
    ...actual,
    getContext: (key: string): unknown => {
      if (key === "cryptoBridge") return mockBridge;
      return originalGetContext(key);
    },
  };
});

// --- Test data factories ---

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
    queueName: "Intake",
    lastActivityAt: null as string | null,
    followUpCount: 0,
    keyWrap: {
      ephemeralPoint: "AAAA",
      nonce: "BBBB",
      wrappedKey: "CCCC",
    } as { ephemeralPoint: string; nonce: string; wrappedKey: string } | null,
    ...overrides,
  };
}

const meQuerySuccess = {
  isLoading: false,
  isError: false,
  error: null,
  data: {
    user: {
      id: USER_ID,
      identifier: "vol1",
      encryptedDisplayName: "",
      roleId: "volunteer",
    },
  },
};

function ticketsQuerySuccess(tickets: ReturnType<typeof makeTicket>[]) {
  return {
    isLoading: false,
    isError: false,
    error: null,
    data: tickets,
  };
}

const ticketsQueryLoading = {
  isLoading: true,
  isError: false,
  error: null,
  data: undefined,
};

const ticketsQueryError = {
  isLoading: false,
  isError: true,
  error: new Error("UNKNOWN"),
  data: undefined,
};

/** Build query states array for all 6 queries. Defaults to empty data for info queries. */
function buildQueryStates(
  meQuery: Record<string, unknown>,
  ticketsQuery: Record<string, unknown>,
  overrides?: {
    activity?: Record<string, unknown>;
    queues?: Record<string, unknown>;
    shift?: Record<string, unknown>;
    kb?: Record<string, unknown>;
  },
): Array<Record<string, unknown>> {
  return [
    meQuery,
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

// --- Setup / teardown ---

beforeEach(() => {
  queryCallIndex = 0;
  queryStates = [];
  mockGoto.mockClear();
  mockDecrypt.mockClear();
  mockDecrypt.mockResolvedValue("Decrypted Title");
});

afterEach(cleanup);

// --- Tests ---

// Warm up the dynamic import so the first test doesn't pay the full
// module resolution cost (Toast, CircleHelp, etc. are heavy in jsdom).
const PageModule = await import("../../../routes/(app)/+page.svelte");

describe("Dashboard page", () => {
  describe("loading state", () => {
    it("renders skeleton when tickets query is loading", async () => {
      queryStates = buildQueryStates(meQuerySuccess, ticketsQueryLoading);
      const { container } = render(PageModule.default);
      expect(container.querySelector("[role='status']")).toBeTruthy();
    });
  });

  describe("error state", () => {
    it("renders error message when tickets query fails", async () => {
      queryStates = buildQueryStates(meQuerySuccess, ticketsQueryError);
      render(PageModule.default);
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeTruthy();
    });
  });

  describe("needs attention section", () => {
    it("renders Needs Attention section for urgent unassigned tickets", async () => {
      const tickets = [
        makeTicket({
          id: "t-urgent",
          priority: "urgent",
          assignedTo: null,
          status: "open",
          onHold: false,
        }),
        makeTicket({
          id: "t-normal",
          assignedTo: USER_ID,
          status: "open",
          onHold: false,
        }),
      ];

      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess(tickets),
      );
      render(PageModule.default);

      const needsAttentionButton = screen.getByRole("button", {
        name: /Needs Attention.*\(1\)/,
      });
      expect(needsAttentionButton.getAttribute("aria-expanded")).toBe("true");
    });

    it("includes high-priority unassigned tickets in needs attention", async () => {
      const tickets = [
        makeTicket({
          id: "t-high",
          priority: "high",
          assignedTo: null,
          status: "open",
          onHold: false,
        }),
      ];

      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess(tickets),
      );
      render(PageModule.default);

      expect(
        screen.getByRole("button", { name: /Needs Attention.*\(1\)/ }),
      ).toBeTruthy();
    });

    it("includes own tickets with follow-ups in needs attention", async () => {
      const tickets = [
        makeTicket({
          id: "t-followup",
          priority: "high",
          assignedTo: USER_ID,
          status: "open",
          onHold: false,
          followUpCount: 2,
        }),
      ];

      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess(tickets),
      );
      render(PageModule.default);

      expect(
        screen.getByRole("button", { name: /Needs Attention.*\(1\)/ }),
      ).toBeTruthy();
    });

    it("does not show needs attention section when no qualifying tickets", async () => {
      const tickets = [
        makeTicket({
          id: "t-normal",
          priority: "normal",
          assignedTo: USER_ID,
          status: "open",
          onHold: false,
        }),
      ];

      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess(tickets),
      );
      render(PageModule.default);

      expect(
        screen.queryByRole("button", { name: /Needs Attention/ }),
      ).toBeNull();
    });

    it("excludes on-hold tickets from needs attention", async () => {
      const tickets = [
        makeTicket({
          id: "t-urgent-hold",
          priority: "urgent",
          assignedTo: null,
          status: "open",
          onHold: true,
        }),
      ];

      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess(tickets),
      );
      render(PageModule.default);

      expect(
        screen.queryByRole("button", { name: /Needs Attention/ }),
      ).toBeNull();
    });
  });

  describe("collapsible sections", () => {
    it("renders My Tickets section with correct count", async () => {
      const tickets = [
        makeTicket({
          id: "t-mine",
          assignedTo: USER_ID,
          status: "open",
          onHold: false,
          priority: "normal",
        }),
      ];

      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess(tickets),
      );
      render(PageModule.default);

      const myTicketsButton = screen.getByRole("button", {
        name: /My Tickets.*\(1\)/,
      });
      expect(myTicketsButton.getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe("decryption", () => {
    it("calls bridge.decrypt for tickets with key wraps", async () => {
      const ticket = makeTicket({ id: "t-decrypt" });
      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess([ticket]),
      );
      render(PageModule.default);

      // $effect fires asynchronously after mount.
      await vi.waitFor(() => {
        expect(mockDecrypt).toHaveBeenCalledWith(
          "t-decrypt",
          "AAAA",
          "BBBB",
          "CCCC",
          expect.any(String),
        );
      });
    });

    it("does not call bridge.decrypt for tickets without key wraps", async () => {
      const ticket = makeTicket({ id: "t-no-wrap", keyWrap: null });
      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess([ticket]),
      );
      render(PageModule.default);

      // Wait briefly for any effects to settle.
      await new Promise((r) => setTimeout(r, 50));
      expect(mockDecrypt).not.toHaveBeenCalled();
    });
  });

  describe("notification slot", () => {
    it("renders dashboard wrapper with notification slot", async () => {
      queryStates = buildQueryStates(meQuerySuccess, ticketsQuerySuccess([]));
      const { container } = render(PageModule.default);

      // The .dashboard div is always present (holds the notification slot).
      const dashboard = container.querySelector(".dashboard");
      expect(dashboard).toBeTruthy();
    });
  });
});
