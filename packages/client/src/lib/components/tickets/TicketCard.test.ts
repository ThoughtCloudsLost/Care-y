// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import TicketCard from "./TicketCard.svelte";

// IntersectionObserver stub for DecryptPlaceholder
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

// --- Mocks ---

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
    getQueriesData: vi.fn().mockReturnValue([]),
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

// --- Mock shell context ---
vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

afterEach(cleanup);

describe("TicketCard", () => {
  const now = new Date("2026-04-05T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ontap = vi.fn();
  const onaction = vi.fn();
  const onselect = vi.fn();

  const defaults = {
    viewMode: "list" as const,
    ticketId: "t-001",
    queueName: "Intake",
    displayStatus: "active" as const,
    priority: "normal" as const,
    titleResult: { status: "ready" as const, value: "Test ticket title" },
    clientAlias: "Sparrow",
    assignedName: null,
    createdAt: new Date("2026-04-05T11:30:00Z"),
    lastActivityAt: new Date("2026-04-05T11:45:00Z"),
    followUpCount: 3,
    unreadCount: 0,
    previewFollowUps: [],
    ontap,
    onaction,
    onselect,
  };

  afterEach(() => {
    ontap.mockClear();
    onaction.mockClear();
    onselect.mockClear();
  });

  // --- Decryption states ---

  it("renders decrypted title when provided", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("Test ticket title");
  });

  it("shows DecryptPlaceholder when title is loading", async () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, titleResult: { status: "loading" as const } },
    });
    // Advance past the 150ms scramble delay so aria-busy appears.
    await vi.advanceTimersByTimeAsync(200);
    const dp = container.querySelector("[aria-busy='true']");
    expect(dp).not.toBeNull();
  });

  it("shows encrypted placeholder when title decryption fails (error state)", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, titleResult: { status: "error" as const } },
    });
    expect(container.textContent).toContain("Encrypted ticket");
    // Should NOT show DecryptPlaceholder (no loading indicator in the title area)
    const dp = container.querySelector("[aria-busy='true']");
    expect(dp).toBeNull();
  });

  it("shows preview window in list mode even when follow-ups are empty", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, previewFollowUps: [] },
    });
    const preview = container.querySelector("[data-preview]");
    expect(preview).not.toBeNull();
    expect(container.textContent).toContain("No messages yet");
  });

  it("shows preview empty state in grid mode when follow-ups array is empty", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, viewMode: "grid" as const, previewFollowUps: [] },
    });
    expect(container.textContent).toContain("No messages yet");
  });

  it("renders DecryptPlaceholder when follow-ups are undefined (not loaded)", async () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, previewFollowUps: undefined },
    });
    // Advance past the 150ms scramble delay so aria-busy appears.
    await vi.advanceTimersByTimeAsync(200);
    const placeholders = container.querySelectorAll("[aria-busy='true']");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  // --- Queue badge ---

  it("renders queue name in badge", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("Intake");
  });

  // --- Status indicator ---

  it("shows 'new' data-status for new tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "new" as const },
    });
    const indicator = container.querySelector("[data-status]");
    expect(indicator?.getAttribute("data-status")).toBe("new");
  });

  it("shows 'active' data-status for active tickets", () => {
    const { container } = render(TicketCard, { props: defaults });
    const indicator = container.querySelector("[data-status]");
    expect(indicator?.getAttribute("data-status")).toBe("active");
  });

  it("shows 'hold' data-status for on-hold tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "hold" as const },
    });
    const indicator = container.querySelector("[data-status]");
    expect(indicator?.getAttribute("data-status")).toBe("hold");
  });

  it("shows 'closed' data-status for closed tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "closed" as const },
    });
    const indicator = container.querySelector("[data-status]");
    expect(indicator?.getAttribute("data-status")).toBe("closed");
  });

  it("renders status label text matching displayStatus", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "new" as const },
    });
    expect(container.textContent).toContain("New");
  });

  // --- Priority chip ---

  it("shows priority badge for urgent tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "urgent" as const },
    });
    const badge = container.querySelector("[data-priority='urgent']");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain("Urgent");
  });

  it("shows priority badge for high tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "high" as const },
    });
    const badge = container.querySelector("[data-priority='high']");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain("High");
  });

  it("shows priority badge for normal tickets", () => {
    const { container } = render(TicketCard, { props: defaults });
    const badge = container.querySelector("[data-priority='normal']");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain("Normal");
  });

  it("shows priority badge for low tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "low" as const },
    });
    const badge = container.querySelector("[data-priority='low']");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain("Low");
  });

  // --- Metadata ---

  it("shows client alias in metadata", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("Sparrow");
  });

  it("shows 'Unassigned' when assignedName is null", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("Unassigned");
  });

  it("shows assigned name when provided", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, assignedName: "Jordan" },
    });
    expect(container.textContent).toContain("Jordan");
  });

  it("shows unread badge when unreadCount > 0", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, unreadCount: 5 },
    });
    expect(container.textContent).toContain("5");
  });

  it("hides unread badge when unreadCount is 0", () => {
    const { container } = render(TicketCard, { props: defaults });
    const unreadBadge = container.querySelector("[data-unread]");
    expect(unreadBadge).toBeNull();
  });

  // --- Relative time ---

  it("renders relative timestamp from lastActivityAt", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("15m ago");
  });

  it("falls back to createdAt when lastActivityAt is null", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, lastActivityAt: null },
    });
    expect(container.textContent).toContain("30m ago");
  });

  // --- Multi-select ---

  it("shows checkbox when multiSelectActive is true", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, multiSelectActive: true },
    });
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).not.toBeNull();
  });

  it("hides checkbox when multiSelectActive is false", () => {
    const { container } = render(TicketCard, { props: defaults });
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeNull();
  });

  it("fires onselect instead of ontap when multiSelectActive and card clicked", async () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, multiSelectActive: true },
    });
    const openBtn = container.querySelector("button.card-open-link");
    expect(openBtn).not.toBeNull();
    if (openBtn) await fireEvent.click(openBtn);
    expect(onselect).toHaveBeenCalledWith("t-001");
    expect(ontap).not.toHaveBeenCalled();
  });

  // --- Action buttons ---

  it("renders action icon buttons in list mode", () => {
    const { container } = render(TicketCard, { props: defaults });
    const actions = container.querySelectorAll(
      '[aria-label="Reply"], [aria-label="Call"], [aria-label="Hold"], [aria-label="Assign"]',
    );
    expect(actions.length).toBe(4);
  });

  it("hides action icons in grid mode", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, viewMode: "grid" as const },
    });
    const actions = container.querySelectorAll(
      '[aria-label="Reply"], [aria-label="Call"], [aria-label="Hold"], [aria-label="Assign"]',
    );
    expect(actions.length).toBe(0);
  });

  it("renders hold/unhold icon with correct aria-label", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "hold" as const },
    });
    const unhold = container.querySelector('[aria-label="Unhold"]');
    expect(unhold).not.toBeNull();
  });

  it("renders assign button regardless of assignment state", () => {
    const { container: unassigned } = render(TicketCard, { props: defaults });
    expect(unassigned.querySelector('[aria-label="Assign"]')).not.toBeNull();

    cleanup();

    const { container: assigned } = render(TicketCard, {
      props: { ...defaults, assignedName: "Jordan" },
    });
    expect(assigned.querySelector('[aria-label="Assign"]')).not.toBeNull();
  });

  it("fires onaction with 'assign' when assign button clicked", async () => {
    const { container } = render(TicketCard, { props: defaults });
    const assignBtn = container.querySelector('[aria-label="Assign"]');
    expect(assignBtn).not.toBeNull();
    if (assignBtn) await fireEvent.click(assignBtn);
    expect(onaction).toHaveBeenCalledWith("t-001", "assign");
  });

  it("fires onaction with correct action on icon click", async () => {
    const { container } = render(TicketCard, { props: defaults });
    const replyBtn = container.querySelector('[aria-label="Reply"]');
    expect(replyBtn).not.toBeNull();
    if (replyBtn) await fireEvent.click(replyBtn);
    expect(onaction).toHaveBeenCalledWith("t-001", "reply");
  });

  it("fires ontap with ticketId on card click", async () => {
    const { container } = render(TicketCard, { props: defaults });
    const openBtn = container.querySelector("button.card-open-link");
    expect(openBtn).not.toBeNull();
    if (openBtn) await fireEvent.click(openBtn);
    expect(ontap).toHaveBeenCalledWith("t-001");
  });

  // --- Keyboard accessibility ---

  it("card open button exists with accessible label", () => {
    const { container } = render(TicketCard, { props: defaults });
    const openBtn = container.querySelector("button.card-open-link");
    expect(openBtn).not.toBeNull();
    expect(openBtn?.getAttribute("aria-label")).toBeTruthy();
  });
});
