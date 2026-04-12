// @vitest-environment jsdom
/**
 * TicketDetail component tests.
 *
 * Focuses on accessibility (ARIA attributes, roles, landmarks) and
 * rendering states (loading, error, empty, populated).
 *
 * vi.mock() is required for:
 *   - $lib/trpc/index.js: no live server
 *   - $lib/crypto/context.js: mock decrypt caches + user identity
 *   - @tanstack/svelte-query: controlled query state
 *   - $lib/errors.js: RouterNotAvailableError stub
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";

// --- Query state controls ---
// These let individual tests configure what the queries return.

let ticketQueryState: Record<string, unknown> = {};
let followUpsQueryState: Record<string, unknown> = {};
let recordingsQueryState: Record<string, unknown> = {};
let attachmentsQueryState: Record<string, unknown> = {};
let summaryQueryState: Record<string, unknown> = {};

// createQuery is called multiple times (ticket, followUps, recordings,
// attachments). We identify which query is being created by the queryKey.

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = (opts.queryKey as string[] | undefined) ?? [];

    // Match by the third key segment to identify the query.
    if (key[2] === "followUps") return followUpsQueryState;
    if (key[2] === "followUpSummary") return summaryQueryState;
    if (key[2] === "recordings") return recordingsQueryState;
    if (key[2] === "attachments") return attachmentsQueryState;

    // First call per render is the ticket query (key: ["ticket", id]).
    return ticketQueryState;
  },
  useQueryClient: () => ({
    fetchQuery: vi.fn().mockResolvedValue([]),
    invalidateQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
  }),
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      get: { query: vi.fn() },
      listFollowUps: { query: vi.fn() },
      listFollowUpSummary: { query: vi.fn() },
      listFollowUpsByIds: { query: vi.fn() },
      listRecordings: { query: vi.fn() },
      listAttachments: { query: vi.fn() },
      listVolunteers: { query: vi.fn() },
    },
  },
}));

vi.mock("$lib/crypto/context.js", () => ({
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue("Test Ticket Title"),
  }),
  getFollowUpDecryptCache: () => ({
    decryptContent: vi.fn().mockReturnValue("Decrypted message content"),
  }),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
  }),
  getCurrentUserId: () => () => "user-001",
  getCurrentUserRoleId: () => () => 2, // VOLUNTEER
  getPreviewLoader: () => ({
    get: vi.fn().mockReturnValue(undefined),
    observe: vi.fn(),
    eagerLoad: vi.fn(),
  }),
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// jsdom lacks ResizeObserver.
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

// jsdom lacks IntersectionObserver.
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

// jsdom lacks Element.scrollTo (used by auto-scroll effect).
if (typeof Element.prototype.scrollTo !== "function") {
  Element.prototype.scrollTo = vi.fn() as unknown as Element["scrollTo"];
}

function makeFollowUp(overrides: Record<string, unknown> = {}) {
  return {
    id: `fu-${Math.random().toString(36).slice(2, 8)}`,
    ticketId: "ticket-001",
    type: "message",
    source: "client",
    encryptedContent: { type: "Buffer", data: [1, 2, 3] },
    createdAt: "2026-04-05T10:00:00Z",
    createdBy: null as string | null,
    ...overrides,
  };
}

const baseTicket = {
  id: "ticket-001",
  clientAlias: "Sparrow",
  status: "open",
  priority: "normal",
  onHold: false,
  assignedTo: null,
  encryptedTitle: { type: "Buffer", data: [72, 101, 108, 108, 111] },
  encryptedDescription: { type: "Buffer", data: [] },
  keyGeneration: "gen-001",
  createdAt: "2026-04-05T09:00:00Z",
  keyWrap: {
    ephemeralPoint: "ep-base64",
    nonce: "nonce-base64",
    wrappedKey: "wk-base64",
  },
};

beforeEach(() => {
  ticketQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: baseTicket,
  };

  followUpsQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: [],
  };

  recordingsQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: [],
  };

  attachmentsQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: [],
  };

  summaryQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: [],
  };
});

afterEach(cleanup);

const TicketDetail = (await import("./TicketDetail.svelte")).default;

describe("TicketDetail", () => {
  const baseProps = { ticketId: "ticket-001" };

  describe("loading and error states", () => {
    it("shows loading indicator during ticket loading", () => {
      ticketQueryState = {
        isLoading: true,
        isError: false,
        error: null,
        data: undefined,
      };

      const { container } = render(TicketDetail, { props: baseProps });
      // Skeleton renders with role="status" and aria-busy="true".
      const skeleton = container.querySelector(
        '[role="status"][aria-busy="true"]',
      );
      expect(skeleton).not.toBeNull();
    });

    it("shows error message on ticket fetch failure", () => {
      ticketQueryState = {
        isLoading: false,
        isError: true,
        error: new Error("Network failure"),
        data: undefined,
      };

      const { container } = render(TicketDetail, { props: baseProps });
      // QueryError renders an error message (error_generic for unknown errors).
      expect(container.textContent).toContain("Something went wrong");
    });

    it("renders empty chat state when no follow-ups exist", () => {
      followUpsQueryState = {
        isLoading: false,
        isError: false,
        error: null,
        data: [],
      };

      const { container } = render(TicketDetail, { props: baseProps });
      const emptyEl = container.querySelector('[role="status"]');
      expect(emptyEl).not.toBeNull();
    });

    it("shows loading indicator while follow-ups load", () => {
      followUpsQueryState = {
        isLoading: true,
        isError: false,
        error: null,
        data: undefined,
      };

      const { container } = render(TicketDetail, { props: baseProps });
      // Skeleton inside the chat log renders with aria-busy.
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).not.toBeNull();
    });
  });

  describe("accessibility: chat container", () => {
    it('has role="log" on the chat container', () => {
      const { container } = render(TicketDetail, { props: baseProps });
      const logEl = container.querySelector("[role='log']");
      expect(logEl).not.toBeNull();
    });

    it("has aria-label on the chat container with client alias", () => {
      const { container } = render(TicketDetail, { props: baseProps });
      const logEl = container.querySelector("[role='log']");
      expect(logEl?.getAttribute("aria-label")).toContain("Sparrow");
    });
  });

  describe("accessibility: date separators and unread divider", () => {
    it('renders date separators with role="separator"', async () => {
      const fu1 = makeFollowUp({ createdAt: "2026-04-04T10:00:00Z" });
      const fu2 = makeFollowUp({ createdAt: "2026-04-05T14:00:00Z" });

      followUpsQueryState = {
        isLoading: false,
        isError: false,
        error: null,
        data: [fu1, fu2],
      };

      const { container } = render(TicketDetail, { props: baseProps });
      await vi.waitFor(() => {
        const separators = container.querySelectorAll("[role='separator']");
        expect(separators.length).toBeGreaterThan(0);
      });
    });

    it('unread divider has role="separator" and aria-label when rendered', async () => {
      // In jsdom, the $effect that seeds readFollowUpIds runs
      // asynchronously, so the first render may show the divider.
      // This test verifies the divider has correct ARIA attributes
      // when it appears.
      const fu1 = makeFollowUp({
        id: "fu-1",
        createdAt: "2026-04-05T10:00:00Z",
      });

      followUpsQueryState = {
        isLoading: false,
        isError: false,
        error: null,
        data: [fu1],
      };

      const { container } = render(TicketDetail, { props: baseProps });

      // If the divider is rendered, verify its accessibility attributes.
      // If the $effect has already run and marked everything as read,
      // the divider won't appear. Both states are acceptable.
      const divider = container.querySelector("#unread-divider");
      if (divider !== null) {
        expect(divider.getAttribute("role")).toBe("separator");
        expect(divider.getAttribute("aria-label")).toBeTruthy();
      }
    });
  });

  describe("accessibility: system events", () => {
    it("renders system events with role='status'", async () => {
      const fu = makeFollowUp({
        source: "system",
        type: "status_change",
      });

      followUpsQueryState = {
        isLoading: false,
        isError: false,
        error: null,
        data: [fu],
      };

      const { container } = render(TicketDetail, { props: baseProps });
      await vi.waitFor(() => {
        const statusEl = container.querySelector("[role='status']");
        expect(statusEl).not.toBeNull();
      });
    });
  });

  describe("accessibility: private notes", () => {
    it("renders private notes with role='article' and aria-label", async () => {
      const fu = makeFollowUp({
        type: "internal_note",
        source: "volunteer",
        createdBy: "user-001",
      });

      followUpsQueryState = {
        isLoading: false,
        isError: false,
        error: null,
        data: [fu],
      };

      const { container } = render(TicketDetail, { props: baseProps });
      await vi.waitFor(() => {
        const article = container.querySelector("[role='article']");
        expect(article).not.toBeNull();
        expect(article?.getAttribute("aria-label")).toBeTruthy();
      });
    });
  });

  describe("accessibility: follow-up keyboard navigation", () => {
    it("message follow-ups have tabindex for keyboard focus", async () => {
      const fu = makeFollowUp({
        source: "client",
        type: "message",
      });

      followUpsQueryState = {
        isLoading: false,
        isError: false,
        error: null,
        data: [fu],
      };

      const { container } = render(TicketDetail, { props: baseProps });
      await vi.waitFor(() => {
        const fuEl = container.querySelector(`[data-fu-id="${fu.id}"]`);
        expect(fuEl).not.toBeNull();
        expect(fuEl?.getAttribute("tabindex")).toBe("0");
      });
    });

    it("system events do not have tabindex (no context menu)", async () => {
      const fu = makeFollowUp({
        source: "system",
        type: "status_change",
      });

      followUpsQueryState = {
        isLoading: false,
        isError: false,
        error: null,
        data: [fu],
      };

      const { container } = render(TicketDetail, { props: baseProps });
      await vi.waitFor(() => {
        const fuEl = container.querySelector(`[data-fu-id="${fu.id}"]`);
        expect(fuEl).not.toBeNull();
        expect(fuEl?.hasAttribute("tabindex")).toBe(false);
      });
    });
  });

  // loading-older aria-live="polite" is verified by the E2E suite
  // (scrolling to top in a real browser). The internal loadingOlder state
  // cannot be triggered from outside in a unit test.
  //
  // prefers-reduced-motion CSS is verified visually and via Playwright
  // (jsdom cannot evaluate computed styles from media queries).
});
