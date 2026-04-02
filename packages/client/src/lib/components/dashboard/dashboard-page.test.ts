// @vitest-environment jsdom
/**
 * Dashboard page tests.
 *
 * Tests the dashboard's rendering behavior with mocked tRPC queries
 * and CryptoBridge. Verifies stat count derivation, loading/error states,
 * collapsible sections, and QuickInfoBar presence.
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
const OTHER_USER_ID = "user-002";

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

  describe("stat counts", () => {
    it("derives correct counts from ticket data", async () => {
      const tickets = [
        makeTicket({
          id: "t1",
          assignedTo: USER_ID,
          status: "open",
          onHold: false,
        }),
        makeTicket({
          id: "t2",
          assignedTo: USER_ID,
          status: "open",
          onHold: true,
        }),
        makeTicket({
          id: "t3",
          assignedTo: null,
          status: "open",
          onHold: false,
        }),
        makeTicket({
          id: "t4",
          assignedTo: OTHER_USER_ID,
          status: "open",
          onHold: false,
        }),
      ];

      queryStates = buildQueryStates(
        meQuerySuccess,
        ticketsQuerySuccess(tickets),
      );
      render(PageModule.default);

      // StatCard renders aria-label="{count} {label}".
      // My Open: t1 only (assigned to USER_ID, open, not on hold)
      // Unassigned: t3 only (assignedTo null, open)
      // On Hold: t2 only (onHold true)
      const statCards = screen.getAllByLabelText(/\d+\s/);
      const labels = statCards.map((el) => el.getAttribute("aria-label"));

      expect(labels).toContain("1 My Open");
      expect(labels).toContain("1 Unassigned");
      expect(labels).toContain("1 On Hold");
    });

    it("shows zero counts when no tickets match filters", async () => {
      queryStates = buildQueryStates(meQuerySuccess, ticketsQuerySuccess([]));
      render(PageModule.default);

      const statCards = screen.getAllByLabelText(/\d+\s/);
      const labels = statCards.map((el) => el.getAttribute("aria-label"));

      expect(labels).toContain("0 My Open");
      expect(labels).toContain("0 Unassigned");
      expect(labels).toContain("0 On Hold");
    });
  });

  describe("collapsible sections", () => {
    it("renders Urgent section expanded when urgent tickets exist", async () => {
      const tickets = [
        makeTicket({
          id: "t-urgent",
          priority: "urgent",
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

      // Urgent section header should be present with count
      const urgentButton = screen.getByRole("button", {
        name: /Urgent.*\(1\)/,
      });
      expect(urgentButton.getAttribute("aria-expanded")).toBe("true");
    });

    it("renders My Tickets expanded when no urgent tickets", async () => {
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
