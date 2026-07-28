// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { SvelteMap } from "svelte/reactivity";
import TicketCardBoundary from "./TicketCardBoundary.svelte";
import type {
  DataCardProps,
  TicketLikeRecord,
} from "$lib/tickets/ticket-card-props.js";

// TicketCard (and its TicketPreview child) observe the viewport and their
// container; jsdom has neither observer.
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

// TicketCard resolves these from (app) context. The global test-setup stub
// returns a preview loader without `observe`, so provide the fuller surface
// TicketCard/TicketPreview actually call here (mirrors TicketCard.test.ts).
vi.mock("$lib/crypto/context.js", () => ({
  getPreviewLoader: () => ({
    observe: vi.fn(),
    eagerLoad: vi.fn(),
    get: vi.fn().mockReturnValue(undefined),
    rawPreviews: new Map(),
  }),
  getFollowUpDecryptCache: () => ({
    decryptContent: vi.fn().mockReturnValue(undefined),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue(undefined),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
  }),
  createQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
  }),
}));

vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-31T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function makeRecord(id: string): TicketLikeRecord {
  return {
    id,
    queueId: "q1",
    encryptedQueueName: null,
    status: "open",
    onHold: false,
    priority: "normal",
    encryptedTitle: "enc-title",
    keyWrap: { wrapped: true },
    clientId: "client-1",
    encryptedClientAlias: null,
    assignedTo: null,
    assignedDisplayName: null,
    createdAt: "2026-03-31T11:30:00Z",
    lastActivityAt: null,
    followUpCount: 1,
  };
}

function makeCard(
  id: string,
  overrides: Partial<DataCardProps> = {},
): DataCardProps {
  return {
    ticketId: id,
    queueName: "Intake",
    displayStatus: "active",
    priority: "normal",
    titleResult: { status: "ready", value: `Ticket ${id}` },
    clientAlias: "Sparrow",
    assignedName: null,
    createdAt: new Date("2026-03-31T11:30:00Z"),
    lastActivityAt: null,
    followUpCount: 1,
    unreadCount: 0,
    previewFollowUps: [],
    ontap: vi.fn(),
    ...overrides,
  };
}

describe("TicketCardBoundary", () => {
  it("renders a TicketCard from the raw record via the mapper", () => {
    const mapper = vi.fn((t: TicketLikeRecord) =>
      makeCard(t.id, {
        titleResult: { status: "ready", value: "Mapped title" },
      }),
    );
    render(TicketCardBoundary, {
      props: { ticket: makeRecord("t1"), mapper, viewMode: "list" },
    });
    expect(mapper).toHaveBeenCalledWith(expect.objectContaining({ id: "t1" }));
    expect(screen.getByText("Mapped title")).toBeTruthy();
  });

  it("re-renders the row when reactive state the mapper reads settles", async () => {
    // Stand-in for a decrypt cache: the mapper reads this SvelteMap inside
    // the boundary's $derived, so a set() after render must update the row.
    const titles = new SvelteMap<string, string>();
    const mapper = (t: TicketLikeRecord): DataCardProps => {
      const title = titles.get(t.id);
      return makeCard(t.id, {
        titleResult:
          title === undefined
            ? { status: "loading" }
            : { status: "ready", value: title },
      });
    };

    render(TicketCardBoundary, {
      props: { ticket: makeRecord("t1"), mapper, viewMode: "list" },
    });
    expect(screen.queryByText("Decrypted title")).toBeNull();

    // care-y-ignore-next-line no-plaintext-db-write -- in-memory SvelteMap standing in for the decrypt cache in a jsdom test, not a DB write
    titles.set("t1", "Decrypted title");
    await vi.waitFor(() => {
      expect(screen.getByText("Decrypted title")).toBeTruthy();
    });
  });
});
