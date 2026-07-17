// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import TicketPreviewList from "./TicketPreviewList.svelte";
import type {
  DataCardProps,
  TicketLikeRecord,
} from "$lib/tickets/ticket-card-props.js";
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

function makeRecord(id: string): TicketLikeRecord {
  return {
    id,
    queueId: "q1",
    encryptedQueueName: null,
    status: "open",
    onHold: false,
    priority: "normal",
    encryptedTitle: "enc-title",
    keyWrap: null,
    clientAlias: "Sparrow",
    assignedTo: null,
    assignedDisplayName: null,
    createdAt: "2026-03-31T11:30:00Z",
    lastActivityAt: "2026-03-31T11:45:00Z",
    followUpCount: 1,
  };
}

function makeRecords(n: number): TicketLikeRecord[] {
  return Array.from({ length: n }, (_, i) => makeRecord(String(i + 1)));
}

// Rows map their own props through this stub, mirroring the page-built
// mapper the dashboard passes down.
const mapper = (t: TicketLikeRecord): DataCardProps => makeCard(t.id);

const LIST: ViewMode = "list";

describe("TicketPreviewList", () => {
  it("shows the quiet empty state when there are no tickets", () => {
    render(TicketPreviewList, {
      props: { tickets: [], mapper, viewMode: LIST },
    });
    expect(screen.getByText("Nothing here right now")).toBeTruthy();
  });

  it("renders one TicketCard per record through the row boundary", () => {
    const { container } = render(TicketPreviewList, {
      props: { tickets: makeRecords(3), mapper, viewMode: LIST },
    });
    const cards = container.querySelectorAll(
      "[data-testid='ticket-card-wrap']",
    );
    expect(cards.length).toBe(3);
  });

  it("caps list mode at maxVisible", () => {
    const { container } = render(TicketPreviewList, {
      props: { tickets: makeRecords(8), mapper, viewMode: LIST, maxVisible: 3 },
    });
    const cards = container.querySelectorAll(
      "[data-testid='ticket-card-wrap']",
    );
    expect(cards.length).toBe(3);
  });

  it("packs an even two rows in grid mode (cap of six)", () => {
    const { container } = render(TicketPreviewList, {
      props: { tickets: makeRecords(8), mapper, viewMode: "grid" },
    });
    const cards = container.querySelectorAll(
      "[data-testid='ticket-card-wrap']",
    );
    expect(cards.length).toBe(6);
  });

  it("applies the mode class to the list container", () => {
    const { container } = render(TicketPreviewList, {
      props: { tickets: makeRecords(2), mapper, viewMode: "cards" },
    });
    expect(container.querySelector(".preview-list.mode-cards")).toBeTruthy();
  });

  it("shows 'see all' when the total exceeds the cap and onseeall is set", () => {
    render(TicketPreviewList, {
      props: {
        tickets: makeRecords(8),
        mapper,
        viewMode: LIST,
        maxVisible: 3,
        onseeall: vi.fn(),
      },
    });
    const button = screen.getByText("See all (8)");
    expect(button.tagName).toBe("BUTTON");
  });

  it("prefers totalCount over the loaded record count in the 'see all' label", () => {
    render(TicketPreviewList, {
      props: {
        tickets: makeRecords(5),
        mapper,
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
      props: {
        tickets: makeRecords(8),
        mapper,
        viewMode: LIST,
        maxVisible: 3,
        onseeall,
      },
    });
    await fireEvent.click(screen.getByText("See all (8)"));
    expect(onseeall).toHaveBeenCalledOnce();
  });

  it("omits 'see all' when the tickets fit within the cap", () => {
    render(TicketPreviewList, {
      props: {
        tickets: makeRecords(2),
        mapper,
        viewMode: LIST,
        maxVisible: 5,
        onseeall: vi.fn(),
      },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });

  it("omits 'see all' when onseeall is not provided", () => {
    render(TicketPreviewList, {
      props: { tickets: makeRecords(8), mapper, viewMode: LIST, maxVisible: 3 },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });

  it("renders skeleton cards while loading", () => {
    const { container } = render(TicketPreviewList, {
      props: {
        tickets: [],
        mapper,
        viewMode: LIST,
        loading: true,
        maxVisible: 4,
      },
    });
    // Each skeleton card is an article carrying both `tc` and the pulse
    // class (inner InlineSkeletons also pulse, so scope to the article).
    expect(container.querySelectorAll(".tc.skeleton-pulse").length).toBe(4);
    expect(screen.queryByText("Nothing here right now")).toBeNull();
  });

  it("sorts unassigned rows last in both assignee directions", async () => {
    const names = new Map<string, string | null>([
      ["1", "Zoe"],
      ["2", null],
      ["3", "Ann"],
    ]);
    const assigneeMapper = (t: TicketLikeRecord): DataCardProps =>
      makeCard(t.id, { assignedName: names.get(t.id) ?? null });
    const { container } = render(TicketPreviewList, {
      props: {
        tickets: makeRecords(3),
        mapper: assigneeMapper,
        viewMode: "table",
      },
    });

    const header = screen.getByRole("button", { name: /assignee/i });
    const cellTexts = (): string[] =>
      Array.from(container.querySelectorAll("td.col-assignee")).map((td) =>
        td.textContent.trim(),
      );

    // First header click sorts descending; the unassigned row stays last.
    await fireEvent.click(header);
    expect(cellTexts()).toEqual(["Zoe", "Ann", ""]);

    // Second click flips to ascending; the unassigned row still sits last.
    await fireEvent.click(header);
    expect(cellTexts()).toEqual(["Ann", "Zoe", ""]);
  });
});
