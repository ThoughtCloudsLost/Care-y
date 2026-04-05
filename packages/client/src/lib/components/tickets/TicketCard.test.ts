// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import TicketCard from "./TicketCard.svelte";

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
  }),
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
    ticketId: "t-001",
    queueName: "Intake",
    displayStatus: "active" as const,
    priority: "normal" as const,
    title: "Test ticket title",
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

  it("shows shimmer placeholder when title is undefined (encrypting state)", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, title: undefined },
    });
    const shimmer = container.querySelector(".shimmer-title");
    expect(shimmer).not.toBeNull();
    expect(shimmer?.getAttribute("aria-label")).toBe("Decrypting...");
  });

  it("renders preview empty state when follow-ups array is empty", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, previewFollowUps: [] },
    });
    expect(container.textContent).toContain("No messages yet");
  });

  it("renders preview shimmer when follow-ups are undefined (not loaded)", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, previewFollowUps: undefined },
    });
    const shimmers = container.querySelectorAll(".shimmer-preview");
    expect(shimmers.length).toBeGreaterThan(0);
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

  it("shows priority chip for urgent tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "urgent" as const },
    });
    const chip = container.querySelector("[data-priority='urgent']");
    expect(chip).not.toBeNull();
    expect(chip!.textContent!.trim()).toBe("urgent");
  });

  it("shows priority chip for high tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "high" as const },
    });
    const chip = container.querySelector("[data-priority='high']");
    expect(chip).not.toBeNull();
  });

  it("hides priority chip for normal tickets", () => {
    const { container } = render(TicketCard, { props: defaults });
    const chip = container.querySelector("[data-priority]");
    expect(chip).toBeNull();
  });

  it("hides priority chip for low tickets", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, priority: "low" as const },
    });
    const chip = container.querySelector("[data-priority]");
    expect(chip).toBeNull();
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
    const badges = container.querySelectorAll(".k-badge");
    expect(badges.length).toBe(0);
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
    const inner = container.querySelector(".card-inner");
    if (inner) await fireEvent.click(inner);
    expect(onselect).toHaveBeenCalledWith("t-001");
    expect(ontap).not.toHaveBeenCalled();
  });

  // --- Action buttons ---

  it("renders action buttons in default (list) mode", () => {
    const { container } = render(TicketCard, { props: defaults });
    expect(container.textContent).toContain("Reply");
    expect(container.textContent).toContain("Call");
    expect(container.textContent).toContain("Hold");
    expect(container.textContent).toContain("Take");
  });

  it("shows 'Unhold' button when displayStatus is hold", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, displayStatus: "hold" as const },
    });
    expect(container.textContent).toContain("Unhold");
  });

  it("shows 'Release' button when assignedName is set", () => {
    const { container } = render(TicketCard, {
      props: { ...defaults, assignedName: "Jordan" },
    });
    expect(container.textContent).toContain("Release");
  });

  it("fires onaction with correct action on button click", async () => {
    const { container } = render(TicketCard, { props: defaults });
    const buttons = container.querySelectorAll("button");
    const replyBtn = Array.from(buttons).find(
      (b) => b.textContent.trim() === "Reply",
    );
    expect(replyBtn).not.toBeNull();
    if (replyBtn) await fireEvent.click(replyBtn);
    expect(onaction).toHaveBeenCalledWith("t-001", "reply");
  });

  it("fires ontap with ticketId on card click", async () => {
    const { container } = render(TicketCard, { props: defaults });
    const inner = container.querySelector(".card-inner");
    if (inner) await fireEvent.click(inner);
    expect(ontap).toHaveBeenCalledWith("t-001");
  });

  // --- Keyboard accessibility ---

  it("card-inner is a native button (supports Enter/Space natively)", () => {
    const { container } = render(TicketCard, { props: defaults });
    const inner = container.querySelector(".card-inner");
    expect(inner?.tagName).toBe("BUTTON");
    expect(inner?.getAttribute("type")).toBe("button");
  });
});
