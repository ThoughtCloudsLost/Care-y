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

// ResizeObserver stub for TicketPreview's fit-mode clipping effect
// (jsdom has none; grid cards render the preview with fit on).
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
  getSectionRailCtx: () => ({ current: undefined }),
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

  const asCards = { ...defaults, viewMode: "cards" as const };
  const asGrid = { ...defaults, viewMode: "grid" as const };

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
    expect(container.textContent).toContain("Locked ticket");
    // Should NOT show DecryptPlaceholder (no loading indicator in the title area)
    const dp = container.querySelector("[aria-busy='true']");
    expect(dp).toBeNull();
  });

  // --- Previews per mode ---

  it("renders no preview window in list mode (rows stay compact)", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.querySelector("[data-preview]")).toBeNull();
    expect(container.textContent).not.toContain("No messages yet");
  });

  it("shows preview empty state in cards mode when follow-ups array is empty", () => {
    const { container } = render(TicketCard, {
      props: { ...asCards, previewFollowUps: [] },
    });
    expect(container.querySelector("[data-preview]")).not.toBeNull();
    expect(container.textContent).toContain("No messages yet");
  });

  it("shows preview empty state in grid mode when follow-ups array is empty", () => {
    const { container } = render(TicketCard, {
      props: { ...asGrid, previewFollowUps: [] },
    });
    expect(container.querySelector("[data-preview]")).not.toBeNull();
    expect(container.textContent).toContain("No messages yet");
  });

  it("uses the whole-bubble fit preview in grid mode", () => {
    const { container } = render(TicketCard, {
      props: { ...asGrid, previewFollowUps: [] },
    });
    expect(container.querySelector(".mini-chat.fit")).not.toBeNull();
  });

  it("keeps the cards-mode preview unfitted (no fixed window there)", () => {
    const { container } = render(TicketCard, {
      props: { ...asCards, previewFollowUps: [] },
    });
    expect(container.querySelector(".mini-chat")).not.toBeNull();
    expect(container.querySelector(".mini-chat.fit")).toBeNull();
  });

  it("renders placeholder bubbles in cards mode when follow-ups are undefined", async () => {
    const { container } = render(TicketCard, {
      props: { ...asCards, previewFollowUps: undefined },
    });
    // Advance past the 150ms scramble delay so aria-busy appears.
    await vi.advanceTimersByTimeAsync(200);
    const placeholders = container.querySelectorAll("[aria-busy='true']");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  // --- Meta line ---

  it("renders queue name in the meta line", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("Intake");
  });

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

  it("renders bold 'you' segment when assignedIsSelf", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, assignedIsSelf: true },
    });
    const you = container.querySelector(".meta-you");
    expect(you).not.toBeNull();
    expect(you?.textContent).toBe("you");
    expect(container.textContent).not.toContain("Unassigned");
  });

  it("renders follow-up count with plural key ('3 follow-ups')", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("3 follow-ups");
  });

  it("renders singular follow-up count ('1 follow-up')", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, followUpCount: 1 },
    });
    expect(container.textContent).toContain("1 follow-up");
  });

  it("communicates hold via StatusMark, not meta text", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "hold" as const },
    });
    expect(container.querySelector("[data-status='hold']")).toBeTruthy();
    const meta = container.querySelector("[data-testid='row-meta']");
    expect(meta?.textContent).not.toContain("on hold");
  });

  // --- Status marks (shape, not hue) ---

  it.each(["new", "active", "hold", "closed"] as const)(
    "renders the %s status mark with data-status",
    (status) => {
      const { container } = render(TicketCard, {
        props: { ...defaults, displayStatus: status },
      });
      const mark = container.querySelector(`[data-status='${status}']`);
      expect(mark).not.toBeNull();
    },
  );

  it("carries the status word as the mark's accessible label", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "hold" as const },
    });
    const mark = container.querySelector("[data-status='hold']");
    expect(mark?.getAttribute("aria-label")).toBe("On hold");
  });

  it("fades closed tickets and strikes the title", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "closed" as const },
    });
    expect(container.querySelector(".tc-closed")).not.toBeNull();
  });

  // --- Priority stamps (the single hue channel) ---

  it.each([
    ["urgent", "Urgent"],
    ["high", "High"],
    ["low", "Low"],
  ] as const)("shows the %s priority stamp with its word", (priority, word) => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority },
    });
    const stamp = container.querySelector(`[data-priority='${priority}']`);
    expect(stamp).not.toBeNull();
    expect(stamp!.textContent).toContain(word);
  });

  it("renders no stamp at all for normal priority", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.querySelector("[data-priority]")).toBeNull();
  });

  // --- Unread channel (bold title + pill) ---

  it("shows the new pill when unreadCount > 0", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, unreadCount: 5 },
    });
    expect(container.textContent).toContain("5 new");
    expect(container.querySelector(".tc-unread")).not.toBeNull();
  });

  it("hides the new pill when unreadCount is 0", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.querySelector(".new-pill")).toBeNull();
    expect(container.querySelector(".tc-unread")).toBeNull();
  });

  // --- Side column: at most two of [stamp, pill, time] ---

  it("shows pill and time for unread normal-priority rows", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, unreadCount: 2 },
    });
    expect(container.textContent).toContain("2 new");
    expect(container.querySelector(".r-time")).not.toBeNull();
  });

  it("shows stamp and time for read urgent rows", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "urgent" as const },
    });
    expect(container.querySelector("[data-priority='urgent']")).not.toBeNull();
    expect(container.querySelector(".r-time")).not.toBeNull();
  });

  it("shows time alongside stamp and pill", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "urgent" as const, unreadCount: 1 },
    });
    expect(container.querySelector("[data-priority='urgent']")).not.toBeNull();
    expect(container.textContent).toContain("1 new");
    expect(container.querySelector(".r-time")).not.toBeNull();
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

  // --- Quick actions: cards mode only (decision 3) ---

  function actionButtons(container: HTMLElement): string[] {
    const row = container.querySelector("[data-testid='card-actions']");
    if (!row) return [];
    return Array.from(row.querySelectorAll("button")).map((b) =>
      b.textContent.trim(),
    );
  }

  it("renders no inline actions in list mode (rows stay compact)", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.querySelector("[data-testid='card-actions']")).toBeNull();
  });

  it("renders no inline actions in grid mode", () => {
    const { container } = render(TicketCard, { props: asGrid });
    expect(container.querySelector("[data-testid='card-actions']")).toBeNull();
  });

  it("renders the full text action row in cards mode", () => {
    const { container } = render(TicketCard, { props: asCards });
    expect(actionButtons(container)).toEqual(["Reply", "Call", "Hold", "Take"]);
  });

  it("renders Unhold for on-hold tickets in cards mode", () => {
    const { container } = render(TicketCard, {
      props: { ...asCards, displayStatus: "hold" as const },
    });
    expect(actionButtons(container)).toContain("Unhold");
  });

  it("renders Assign instead of Take for assigned tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...asCards, assignedName: "Jordan" },
    });
    const labels = actionButtons(container);
    expect(labels).toContain("Assign");
    expect(labels).not.toContain("Take");
  });

  it("fires onaction with 'take' when Take is clicked", async () => {
    const { container } = render(TicketCard, { props: asCards });
    const takeBtn = Array.from(container.querySelectorAll("button.act")).find(
      (b) => b.textContent.trim() === "Take",
    );
    expect(takeBtn).toBeDefined();
    if (takeBtn) await fireEvent.click(takeBtn);
    expect(onaction).toHaveBeenCalledWith("t-001", "take");
    expect(ontap).not.toHaveBeenCalled();
  });

  it("fires onaction with 'reply' when Reply is clicked", async () => {
    const { container } = render(TicketCard, { props: asCards });
    const replyBtn = Array.from(container.querySelectorAll("button.act")).find(
      (b) => b.textContent.trim() === "Reply",
    );
    expect(replyBtn).toBeDefined();
    if (replyBtn) await fireEvent.click(replyBtn);
    expect(onaction).toHaveBeenCalledWith("t-001", "reply");
    expect(ontap).not.toHaveBeenCalled();
  });

  it("fires onaction with 'unhold' from the quiet action on held tickets", async () => {
    const { container } = render(TicketCard, {
      props: { ...asCards, displayStatus: "hold" as const },
    });
    const unholdBtn = Array.from(
      container.querySelectorAll("button.act-quiet"),
    ).find((b) => b.textContent.trim() === "Unhold");
    expect(unholdBtn).toBeDefined();
    if (unholdBtn) await fireEvent.click(unholdBtn);
    expect(onaction).toHaveBeenCalledWith("t-001", "unhold");
  });

  // --- Open interaction ---

  it("fires ontap with ticketId on card click", async () => {
    const { container } = render(TicketCard, { props: defaults });
    const openBtn = container.querySelector("button.card-open-link");
    expect(openBtn).not.toBeNull();
    if (openBtn) await fireEvent.click(openBtn);
    expect(ontap).toHaveBeenCalledWith("t-001");
  });

  it("card open button exists with accessible label in every mode", () => {
    for (const props of [defaults, asCards, asGrid]) {
      const { container } = render(TicketCard, { props });
      const openBtn = container.querySelector("button.card-open-link");
      expect(openBtn).not.toBeNull();
      expect(openBtn?.getAttribute("aria-label")).toBeTruthy();
      cleanup();
    }
  });

  // --- Search term highlighting (search results pass searchTerm) ---

  describe("searchTerm highlighting", () => {
    it("marks the matched queue segment in the list meta line", () => {
      const { container } = render(TicketCard, {
        props: { ...defaults, searchTerm: "intake" },
      });
      const meta = container.querySelector("[data-testid='row-meta']");
      const marks = meta?.querySelectorAll("mark") ?? [];
      expect(marks).toHaveLength(1);
      expect(marks[0]!.textContent).toBe("Intake");
    });

    it("marks the client alias and assignee when both match", () => {
      const { container } = render(TicketCard, {
        props: {
          ...defaults,
          assignedName: "Sparrowhawk",
          searchTerm: "sparrow",
        },
      });
      const aliasMarks = container.querySelectorAll(".r-alias mark");
      expect(aliasMarks).toHaveLength(1);
      const metaMarks = container.querySelector("[data-testid='row-meta']");
      expect(metaMarks?.querySelectorAll("mark")).toHaveLength(1);
    });

    it("marks grid meta segments and the grid alias", () => {
      const { container } = render(TicketCard, {
        props: { ...asGrid, searchTerm: "intake" },
      });
      const metaMarks = container.querySelectorAll(".row-meta mark");
      expect(metaMarks).toHaveLength(1);
      expect(metaMarks[0]!.textContent).toBe("Intake");

      cleanup();
      const { container: c2 } = render(TicketCard, {
        props: { ...asGrid, searchTerm: "sparrow" },
      });
      expect(c2.querySelectorAll(".client-alias mark")).toHaveLength(1);
    });

    it("marks the decrypted title through DecryptPlaceholder", () => {
      const { container } = render(TicketCard, {
        props: { ...defaults, searchTerm: "ticket" },
      });
      const title = container.querySelector(".r-title");
      expect(title?.querySelectorAll("mark")).toHaveLength(1);
    });

    it("renders no marks without a searchTerm", () => {
      const { container } = render(TicketCard, {
        props: { ...defaults, assignedName: "Jordan" },
      });
      expect(container.querySelectorAll("mark")).toHaveLength(0);
    });

    it("never marks the bold self-assignee label", () => {
      const { container } = render(TicketCard, {
        props: {
          ...defaults,
          assignedName: null,
          assignedIsSelf: true,
          searchTerm: "you",
        },
      });
      const meta = container.querySelector("[data-testid='row-meta']");
      expect(meta?.querySelector(".meta-you mark")).toBeNull();
    });
  });
});
