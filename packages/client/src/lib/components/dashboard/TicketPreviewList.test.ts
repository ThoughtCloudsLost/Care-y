// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import TicketPreviewList from "./TicketPreviewList.svelte";
import type { DataCardProps } from "$lib/tickets/ticket-card-props.js";
import type { ViewMode } from "$lib/stores/view-mode.svelte.js";

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
    lastActivityAt: new Date("2026-03-31T11:45:00Z"),
    followUpCount: 1,
    unreadCount: 0,
    previewFollowUps: [],
    ontap: vi.fn(),
    ...overrides,
  };
}

function makeCards(n: number): DataCardProps[] {
  return Array.from({ length: n }, (_, i) => makeCard(String(i + 1)));
}

const LIST: ViewMode = "list";

describe("TicketPreviewList", () => {
  it("shows the quiet empty state when there are no cards", () => {
    render(TicketPreviewList, {
      props: { cards: [], viewMode: LIST },
    });
    expect(screen.getByText("Nothing here right now")).toBeTruthy();
  });

  it("renders one TicketCard per card", () => {
    const { container } = render(TicketPreviewList, {
      props: { cards: makeCards(3), viewMode: LIST },
    });
    const cards = container.querySelectorAll(
      "[data-testid='ticket-card-wrap']",
    );
    expect(cards.length).toBe(3);
  });

  it("caps list mode at maxVisible", () => {
    const { container } = render(TicketPreviewList, {
      props: { cards: makeCards(8), viewMode: LIST, maxVisible: 3 },
    });
    const cards = container.querySelectorAll(
      "[data-testid='ticket-card-wrap']",
    );
    expect(cards.length).toBe(3);
  });

  it("packs an even two rows in grid mode (cap of six)", () => {
    const { container } = render(TicketPreviewList, {
      props: { cards: makeCards(8), viewMode: "grid" },
    });
    const cards = container.querySelectorAll(
      "[data-testid='ticket-card-wrap']",
    );
    expect(cards.length).toBe(6);
  });

  it("applies the mode class to the list container", () => {
    const { container } = render(TicketPreviewList, {
      props: { cards: makeCards(2), viewMode: "cards" },
    });
    expect(container.querySelector(".preview-list.mode-cards")).toBeTruthy();
  });

  it("shows 'see all' when the total exceeds the cap and onseeall is set", () => {
    render(TicketPreviewList, {
      props: {
        cards: makeCards(8),
        viewMode: LIST,
        maxVisible: 3,
        onseeall: vi.fn(),
      },
    });
    const button = screen.getByText("See all (8)");
    expect(button.tagName).toBe("BUTTON");
  });

  it("prefers totalCount over the loaded card count in the 'see all' label", () => {
    render(TicketPreviewList, {
      props: {
        cards: makeCards(5),
        viewMode: LIST,
        maxVisible: 5,
        totalCount: 12,
        onseeall: vi.fn(),
      },
    });
    expect(screen.getByText("See all (12)")).toBeTruthy();
  });

  it("fires onseeall when the button is clicked", async () => {
    const onseeall = vi.fn();
    render(TicketPreviewList, {
      props: { cards: makeCards(8), viewMode: LIST, maxVisible: 3, onseeall },
    });
    await fireEvent.click(screen.getByText("See all (8)"));
    expect(onseeall).toHaveBeenCalledOnce();
  });

  it("omits 'see all' when the cards fit within the cap", () => {
    render(TicketPreviewList, {
      props: {
        cards: makeCards(2),
        viewMode: LIST,
        maxVisible: 5,
        onseeall: vi.fn(),
      },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });

  it("omits 'see all' when onseeall is not provided", () => {
    render(TicketPreviewList, {
      props: { cards: makeCards(8), viewMode: LIST, maxVisible: 3 },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });

  it("renders skeleton cards while loading", () => {
    const { container } = render(TicketPreviewList, {
      props: { cards: [], viewMode: LIST, loading: true, maxVisible: 4 },
    });
    // Each skeleton card is an article carrying both `tc` and the pulse
    // class (inner InlineSkeletons also pulse, so scope to the article).
    expect(container.querySelectorAll(".tc.skeleton-pulse").length).toBe(4);
    expect(screen.queryByText("Nothing here right now")).toBeNull();
  });
});
