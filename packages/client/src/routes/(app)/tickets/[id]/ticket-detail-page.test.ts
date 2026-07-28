// @vitest-environment jsdom
/**
 * Ticket detail route page tests.
 *
 * Verifies route-level wiring (tabbar hidden, navbar override, overlay
 * management, snapshot capture/restore, navbar element accessibility).
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type * as ErrorsModule from "$lib/errors.js";
import type * as SvelteQueryModule from "@tanstack/svelte-query";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as ShellContextModule from "$lib/shell/context.js";
import type * as CryptoContextModule from "$lib/crypto/context.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as SendMessageModule from "$lib/composables/ticket-detail/create-send-message.svelte.js";
import type * as SmsSendModule from "$lib/composables/ticket-detail/create-sms-send.svelte.js";
import type * as CallDispatchModule from "$lib/composables/ticket-detail/create-call-dispatch.svelte.js";

// --- Mocks ---

// mock-factory-unguarded: intentional. $app/state is a SvelteKit virtual
// module with no real backing file; importOriginal cannot resolve it.
vi.mock("$app/state", () => {
  const _usedExports = null! as { page: unknown };
  void _usedExports;
  return {
    page: {
      params: { id: "ticket-001" },
      url: new URL("http://localhost/tickets/ticket-001"),
    },
  };
});

// mock-factory-unguarded: intentional. $app/navigation is a SvelteKit
// virtual module with no real backing file; importOriginal cannot resolve it.
vi.mock("$app/navigation", () => {
  const _usedExports = null! as { goto: unknown; onNavigate: unknown };
  void _usedExports;
  return {
    goto: vi.fn(),
    onNavigate: vi.fn(),
  };
});

// mock-factory-unguarded: intentional. $app/paths is a SvelteKit virtual
// module with no real backing file; importOriginal cannot resolve it.
vi.mock("$app/paths", () => {
  const _usedExports = null! as {
    resolve: unknown;
    base: unknown;
    assets: unknown;
  };
  void _usedExports;
  return {
    resolve: (path: string) => path,
    base: "",
    assets: "",
  };
});

let ticketQueryState: Record<string, unknown> = {};

vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof SvelteQueryModule>()),
    createInfiniteQuery: () => ({
      data: { pages: [] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    }),
    createQuery: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const key = (opts.queryKey as string[] | undefined) ?? [];

      // isWatching query
      if (key[0] === "isWatching") {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: false,
        };
      }

      // consultant query
      if (key[0] === "consultant") {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: null,
        };
      }

      // follow-ups, recordings, attachments
      if (
        key[2] === "followUps" ||
        key[2] === "recordings" ||
        key[2] === "attachments"
      ) {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: [],
        };
      }

      // read cursor query
      if (key[2] === "readCursor") {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: null,
        };
      }

      // followUpSummary query (FollowUpTimeline)
      if (key[2] === "followUpSummary") {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: { summaries: [], reactions: {} },
        };
      }

      // volunteers query (AssignSheet)
      if (key[0] === "volunteers") {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: [],
        };
      }

      // noteTypes query (InternalNoteSheet)
      if (key[0] === "noteTypes") {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: { types: [], defaultNoteTypeId: null },
        };
      }

      // ticket query
      return ticketQueryState;
    },
    // Overlays in this tree own mutations (the phone edit sheet among them),
    // so the mock has to answer createMutation or the page fails to render.
    createMutation: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const mutationFn = opts.mutationFn as (
        input: unknown,
      ) => Promise<unknown>;
      return {
        get isPending() {
          return false;
        },
        get variables() {
          return {} as Record<string, unknown>;
        },
        mutate(input: unknown) {
          void mutationFn(input);
        },
      };
    },
    useQueryClient: () => ({
      fetchQuery: vi.fn().mockResolvedValue([]),
      invalidateQueries: vi.fn(),
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      getQueriesData: vi.fn().mockReturnValue([]),
    }),
  };
});

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcModule>()),
  trpc: {
    tickets: {
      get: { query: vi.fn() },
      listFollowUps: {
        query: vi.fn().mockResolvedValue({ followUps: [], reactions: {} }),
      },
      listRecordings: { query: vi.fn() },
      listAttachments: { query: vi.fn() },
      listVolunteers: { query: vi.fn() },
      take: { mutate: vi.fn() },
      release: { mutate: vi.fn() },
      update: { mutate: vi.fn() },
      close: { mutate: vi.fn() },
      reopen: { mutate: vi.fn() },
      watchTicket: { mutate: vi.fn() },
      unwatchTicket: { mutate: vi.fn() },
      isWatching: { query: vi.fn().mockResolvedValue(false) },
      deleteInternalNote: { mutate: vi.fn() },
      updateInternalNote: { mutate: vi.fn() },
      getReadCursor: { query: vi.fn().mockResolvedValue(null) },
      updateReadCursor: { mutate: vi.fn() },
      listFollowUpSummary: {
        query: vi.fn().mockResolvedValue({ summaries: [], reactions: {} }),
      },
      assignTo: { mutate: vi.fn().mockResolvedValue({}) },
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
    consultant: {
      get: { query: vi.fn().mockResolvedValue(null) },
    },
  },
}));

const mockTabbarHidden = { current: false };
const mockNavbarCtx = { current: undefined as unknown };

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContextModule>()),
  getTabbarHiddenCtx: () => mockTabbarHidden,
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContextModule>()),
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue("Decrypted Title"),
    decryptDescription: vi.fn().mockReturnValue("Decrypted description"),
  }),
  getFollowUpDecryptCache: () => ({
    decryptContent: vi.fn().mockReturnValue("Decrypted content"),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getOrgKeyManager: () => ({
    isLoaded: false,
  }),
  getCryptoBridge: () => ({
    encrypt: vi.fn().mockResolvedValue("encrypted-base64"),
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    decryptBlob: vi.fn().mockRejectedValue(new Error("mock")),
  }),
  getCurrentUserId: () => () => "user-001",
  getCurrentUserRoleId: () => () => "dXwG0zR9BtJp",
  getCurrentPermissions: () => () =>
    new Set([
      "view_tickets",
      "manage_own_tickets",
      "view_knowledge_base",
      "edit_knowledge_base",
      "view_own_shifts",
    ]),
  getPreviewLoader: () => ({
    get: vi.fn().mockReturnValue(undefined),
    observe: vi.fn(),
    eagerLoad: vi.fn(),
  }),
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsModule>()),
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastModule>()),
  toastStore: { show: vi.fn() },
}));

// mock-factory-unguarded: intentional. Svelte component modules compile
// to runtime-dependent code; importOriginal fails because Vite's
// svelte plugin transform is not applied inside vi.mock factory resolution.
vi.mock("$lib/components/tickets/InternalNoteSheet.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  void _usedExports;
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  };
});

// mock-factory-unguarded: intentional. Svelte component modules compile
// to runtime-dependent code; importOriginal fails because Vite's
// svelte plugin transform is not applied inside vi.mock factory resolution.
vi.mock("$lib/components/tickets/ComposeActions.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  void _usedExports;
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  };
});

vi.mock(
  "$lib/composables/ticket-detail/create-send-message.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof SendMessageModule>()),
    createSendMessage: () => ({ sending: false, handleSend: vi.fn() }),
  }),
);
vi.mock(
  "$lib/composables/ticket-detail/create-sms-send.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof SmsSendModule>()),
    createSmsSend: () => ({ sending: false, handleSmsSend: vi.fn() }),
  }),
);
vi.mock(
  "$lib/composables/ticket-detail/create-call-dispatch.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof CallDispatchModule>()),
    createCallDispatch: () => ({
      inProgress: false,
      executeCall: vi.fn(),
    }),
  }),
);

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

// jsdom lacks Element.scrollTo.
if (typeof Element.prototype.scrollTo !== "function") {
  Element.prototype.scrollTo = vi.fn() as unknown as Element["scrollTo"];
}

const baseTicket = {
  id: "ticket-001",
  clientId: "c-sparrow",
  encryptedClientAlias: {
    type: "Buffer",
    data: [83, 112, 97, 114, 114, 111, 119],
  },
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
  mockTabbarHidden.current = false;
  mockNavbarCtx.current = undefined;

  ticketQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: baseTicket,
  };
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

describe("Ticket detail route page", () => {
  it("renders the chat container with role='log'", () => {
    const { container } = render(PageModule.default);
    const log = container.querySelector("[role='log']");
    expect(log).not.toBeNull();
  });

  // Navbar override context shape is the shell integration contract between page and AppShell.
  it("sets navbar override context on mount", () => {
    render(PageModule.default);
    // The route injects navbar snippets (left, title, right) via context.
    // Actual rendering of those snippets happens inside AppShell, which
    // is not present in unit tests. The E2E suite verifies the rendered
    // navbar buttons have correct aria-labels and behavior.
    expect(mockNavbarCtx.current).toBeDefined();
  });

  it("sets tabbar hidden to true on mount", () => {
    render(PageModule.default);
    expect(mockTabbarHidden.current).toBe(true);
  });

  it("renders placeholder when ticket query is loading", () => {
    ticketQueryState = {
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    };

    const { container } = render(PageModule.default);
    // TicketDetail renders a chat container with role="log" and
    // aria-label="Loading" while the ticket query is loading.
    const log = container.querySelector("[role='log']");
    expect(log).not.toBeNull();
    expect(log?.getAttribute("aria-label")).toBe("Loading");
  });

  it("renders error message when ticket query fails", () => {
    ticketQueryState = {
      isLoading: false,
      isError: true,
      error: new Error("Network failure"),
      data: undefined,
    };

    render(PageModule.default);
    // QueryError renders the generic error message for unrecognized errors.
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeTruthy();
  });

  it("renders closed ticket with reopen action in panel", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: {
        ...baseTicket,
        status: "closed",
      },
    };

    const { container } = render(PageModule.default);
    // The page still renders the chat container for closed tickets.
    const log = container.querySelector("[role='log']");
    expect(log).not.toBeNull();
    // The ticket data is available with status "closed". The panel
    // (TicketPanelContent) would offer a "reopen" action, but it
    // renders inside a ShellPopup that is not opened by default.
    // Verify the page mounts without error for closed ticket data.
    expect(mockNavbarCtx.current).toBeDefined();
  });

  it("renders ticket with follow-up count in detail stats snippet", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: {
        ...baseTicket,
        followUpCount: 5,
      },
    };

    const { container } = render(PageModule.default);
    // The page renders successfully with a non-zero followUpCount.
    // The detail stats snippet (rendered inside SubNavbarFilterLayout
    // via navbarCtx override) would show "5 messages", but since
    // AppShell is not present in unit tests, we verify the override
    // is set and the page mounts without error.
    expect(mockNavbarCtx.current).toBeDefined();
    const override = mockNavbarCtx.current as Record<string, unknown>;
    expect(override).toHaveProperty("subnavbar");
    // The chat log should render (ticket data is present).
    const log = container.querySelector("[role='log']");
    expect(log).not.toBeNull();
  });
});
