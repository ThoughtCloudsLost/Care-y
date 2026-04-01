// @vitest-environment jsdom
/**
 * Dashboard page tests.
 *
 * Tests the dashboard's rendering behavior with mocked tRPC queries
 * and CryptoBridge. Verifies stat count derivation, loading/error states,
 * and notification slot presence.
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

// Controlled query states. Tests set these before rendering.
// Order matches createQuery call order in the page: [meQuery, ticketsQuery].
let queryStates: Array<Record<string, unknown>> = [];
let queryCallIndex = 0;

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn(); // Validate the options factory does not throw.
    const state = queryStates[queryCallIndex] ?? {
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    };
    queryCallIndex++;
    return state;
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: { me: { query: vi.fn() } },
    tickets: { list: { query: vi.fn() } },
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

describe("Dashboard page", () => {
  describe("loading state", () => {
    it("renders skeleton when tickets query is loading", async () => {
      queryStates = [meQuerySuccess, ticketsQueryLoading];
      const { container } = render(
        (await import("../../../routes/(app)/+page.svelte")).default,
      );
      expect(container.querySelector("[role='status']")).toBeTruthy();
    });
  });

  describe("error state", () => {
    it("renders error message when tickets query fails", async () => {
      queryStates = [meQuerySuccess, ticketsQueryError];
      render((await import("../../../routes/(app)/+page.svelte")).default);
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

      queryStates = [meQuerySuccess, ticketsQuerySuccess(tickets)];
      render((await import("../../../routes/(app)/+page.svelte")).default);

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
      queryStates = [meQuerySuccess, ticketsQuerySuccess([])];
      render((await import("../../../routes/(app)/+page.svelte")).default);

      const statCards = screen.getAllByLabelText(/\d+\s/);
      const labels = statCards.map((el) => el.getAttribute("aria-label"));

      expect(labels).toContain("0 My Open");
      expect(labels).toContain("0 Unassigned");
      expect(labels).toContain("0 On Hold");
    });
  });

  describe("decryption", () => {
    it("calls bridge.decrypt for tickets with key wraps", async () => {
      const ticket = makeTicket({ id: "t-decrypt" });
      queryStates = [meQuerySuccess, ticketsQuerySuccess([ticket])];
      render((await import("../../../routes/(app)/+page.svelte")).default);

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
      queryStates = [meQuerySuccess, ticketsQuerySuccess([ticket])];
      render((await import("../../../routes/(app)/+page.svelte")).default);

      // Wait briefly for any effects to settle.
      await new Promise((r) => setTimeout(r, 50));
      expect(mockDecrypt).not.toHaveBeenCalled();
    });
  });

  describe("notification slot", () => {
    it("renders dashboard wrapper with notification slot", async () => {
      queryStates = [meQuerySuccess, ticketsQuerySuccess([])];
      const { container } = render(
        (await import("../../../routes/(app)/+page.svelte")).default,
      );

      // The .dashboard div is always present (holds the notification slot).
      const dashboard = container.querySelector(".dashboard");
      expect(dashboard).toBeTruthy();
    });
  });
});
